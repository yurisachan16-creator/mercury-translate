import CryptoJS from 'crypto-js';
import Dexie, { type Table } from 'dexie';

import type { PdfTextBlock } from '@/entrypoints/types/pdf';
import { canonicalize } from '@/entrypoints/utils/translationCache';

export const PDF_TRANSLATION_CACHE_VERSION = 1;
export const PDF_TRANSLATION_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const PDF_TRANSLATION_CACHE_MAX_BYTES = 50 * 1024 * 1024;

export interface PdfTranslationCacheIdentity {
  documentFingerprint: string;
  pageIndex: number;
  blockHash: string;
  sourceLanguage: string;
  targetLanguage: string;
  providerId?: string;
  providerModel?: string;
  providerConfigFingerprint?: string;
}

export interface PdfTranslationCacheRecord {
  key: string;
  translation: string;
  createdAt: number;
  lastAccessedAt: number;
  expiresAt: number;
  byteSize: number;
}

export interface PdfTranslationCacheStore {
  get(key: string): Promise<PdfTranslationCacheRecord | undefined>;
  put(record: PdfTranslationCacheRecord): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  listByLastAccessed(): Promise<PdfTranslationCacheRecord[]>;
  deleteExpired(now: number): Promise<void>;
}

function utf8ByteLength(value: string): number {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(value).byteLength;
  return value.length * 2;
}

function isExpired(record: PdfTranslationCacheRecord, now: number, ttlMs: number): boolean {
  return record.expiresAt <= now || record.createdAt + ttlMs <= now;
}

/** Produce an opaque, source-text-free key for one translated PDF block. */
export function buildPdfTranslationCacheKey(identity: PdfTranslationCacheIdentity): string {
  const payload = canonicalize({ version: PDF_TRANSLATION_CACHE_VERSION, ...identity });
  return `pdf-v${PDF_TRANSLATION_CACHE_VERSION}:${CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex)}`;
}

/** Hash provider/model settings so cache keys invalidate without storing secrets or endpoints in clear text. */
export function buildPdfProviderConfigFingerprint(value: unknown): string {
  return CryptoJS.SHA256(canonicalize(value)).toString(CryptoJS.enc.Hex);
}

export function buildPdfBlockCacheIdentity(
  documentFingerprint: string,
  block: Pick<PdfTextBlock, 'pageIndex' | 'contentHash'>,
  options: Omit<PdfTranslationCacheIdentity, 'documentFingerprint' | 'pageIndex' | 'blockHash'>,
): PdfTranslationCacheIdentity {
  return {
    documentFingerprint,
    pageIndex: block.pageIndex,
    blockHash: block.contentHash,
    ...options,
  };
}

class PdfTranslationCacheDatabase extends Dexie {
  entries!: Table<PdfTranslationCacheRecord, string>;

  constructor() {
    super('MercuryPdfTranslationCache');
    this.version(1).stores({ entries: '&key, expiresAt, createdAt, lastAccessedAt' });
  }
}

export const pdfTranslationCacheDb = new PdfTranslationCacheDatabase();

class IndexedDbPdfTranslationCacheStore implements PdfTranslationCacheStore {
  async get(key: string): Promise<PdfTranslationCacheRecord | undefined> {
    return pdfTranslationCacheDb.entries.get(key);
  }

  async put(record: PdfTranslationCacheRecord): Promise<void> {
    await pdfTranslationCacheDb.entries.put(record);
  }

  async delete(key: string): Promise<void> {
    await pdfTranslationCacheDb.entries.delete(key);
  }

  async clear(): Promise<void> {
    await pdfTranslationCacheDb.entries.clear();
  }

  async listByLastAccessed(): Promise<PdfTranslationCacheRecord[]> {
    return pdfTranslationCacheDb.entries.orderBy('lastAccessedAt').toArray();
  }

  async deleteExpired(now: number): Promise<void> {
    await pdfTranslationCacheDb.entries.where('expiresAt').belowOrEqual(now).delete();
  }
}

/** Lightweight deterministic store for unit tests and non-persistent previews. */
export class MemoryPdfTranslationCacheStore implements PdfTranslationCacheStore {
  private readonly records = new Map<string, PdfTranslationCacheRecord>();

  async get(key: string): Promise<PdfTranslationCacheRecord | undefined> {
    const record = this.records.get(key);
    return record ? {...record} : undefined;
  }

  async put(record: PdfTranslationCacheRecord): Promise<void> {
    this.records.set(record.key, {...record});
  }

  async delete(key: string): Promise<void> {
    this.records.delete(key);
  }

  async clear(): Promise<void> {
    this.records.clear();
  }

  async listByLastAccessed(): Promise<PdfTranslationCacheRecord[]> {
    return [...this.records.values()]
      .map(record => ({...record}))
      .sort((left, right) => left.lastAccessedAt - right.lastAccessedAt);
  }

  async deleteExpired(now: number): Promise<void> {
    for (const [key, record] of this.records) {
      if (record.expiresAt <= now) this.records.delete(key);
    }
  }
}

export interface PdfTranslationCacheOptions {
  store?: PdfTranslationCacheStore;
  ttlMs?: number;
  maxBytes?: number;
  now?: () => number;
}

/**
 * A 7-day / 50-MB LRU cache for translated text only. It deliberately never
 * accepts PDF byte buffers, source-page images, or original block text.
 */
export class PdfTranslationCache {
  private readonly store: PdfTranslationCacheStore;
  private readonly ttlMs: number;
  private readonly maxBytes: number;
  private readonly now: () => number;

  constructor(options: PdfTranslationCacheOptions = {}) {
    this.store = options.store || new IndexedDbPdfTranslationCacheStore();
    this.ttlMs = options.ttlMs ?? PDF_TRANSLATION_CACHE_TTL_MS;
    this.maxBytes = options.maxBytes ?? PDF_TRANSLATION_CACHE_MAX_BYTES;
    this.now = options.now || (() => Date.now());
  }

  async get(key: string, now = this.now()): Promise<string | null> {
    try {
      const record = await this.store.get(key);
      if (!record) return null;
      if (isExpired(record, now, this.ttlMs)) {
        await this.store.delete(key);
        return null;
      }
      await this.store.put({...record, lastAccessedAt: now});
      return record.translation;
    } catch {
      // Privacy-preserving degradation: unavailable IndexedDB must not block
      // a translation request, and cache failures never expose source text.
      return null;
    }
  }

  async set(key: string, translation: string, now = this.now()): Promise<boolean> {
    const byteSize = utf8ByteLength(key) + utf8ByteLength(translation);
    if (!translation || byteSize > this.maxBytes) return false;

    try {
      const record: PdfTranslationCacheRecord = {
        key,
        translation,
        createdAt: now,
        lastAccessedAt: now,
        expiresAt: now + this.ttlMs,
        byteSize,
      };
      await this.store.put(record);

      const entries = await this.store.listByLastAccessed();
      let totalBytes = entries.reduce((total, entry) => total + entry.byteSize, 0);
      for (const entry of entries) {
        if (totalBytes <= this.maxBytes) break;
        await this.store.delete(entry.key);
        totalBytes -= entry.byteSize;
      }
      return true;
    } catch {
      return false;
    }
  }

  async cleanup(now = this.now()): Promise<void> {
    try {
      await this.store.deleteExpired(now);
      const entries = await this.store.listByLastAccessed();
      await Promise.all(entries
        .filter(record => isExpired(record, now, this.ttlMs))
        .map(record => this.store.delete(record.key)));
    } catch {
      // The cache is optional, so cleanup must stay best effort.
    }
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }
}

export const pdfTranslationCache = new PdfTranslationCache();
