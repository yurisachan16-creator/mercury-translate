import {describe, expect, it} from 'vitest';

import {
  buildPdfProviderConfigFingerprint,
  buildPdfTranslationCacheKey,
  MemoryPdfTranslationCacheStore,
  PdfTranslationCache,
} from '@/entrypoints/utils/pdfTranslationCache';

describe('PDF translation cache', () => {
  it('fingerprints provider configuration without exposing endpoint details', () => {
    const fingerprint = buildPdfProviderConfigFingerprint({
      model: 'example-model',
      endpoint: 'https://private.example.test/v1',
    });
    expect(fingerprint).toMatch(/^[0-9a-f]{64}$/);
    expect(fingerprint).not.toContain('private.example.test');
    expect(buildPdfProviderConfigFingerprint({model: 'other-model'})).not.toBe(fingerprint);
  });

  it('uses an opaque key derived from hashes rather than persisting source PDF text', () => {
    const key = buildPdfTranslationCacheKey({
      documentFingerprint: 'doc-123',
      pageIndex: 4,
      blockHash: 'block-hash-for-sensitive-source',
      sourceLanguage: 'en',
      targetLanguage: 'zh-Hans',
      providerId: 'chromeTranslator',
    });
    expect(key).toMatch(/^pdf-v1:[0-9a-f]{64}$/);
    expect(key).not.toContain('sensitive');
  });

  it('expires entries at seven days and evicts least-recently-used translations under the byte budget', async () => {
    const store = new MemoryPdfTranslationCacheStore();
    const cache = new PdfTranslationCache({store, ttlMs: 7 * 24 * 60 * 60 * 1000, maxBytes: 40});
    const createdAt = 1_000;
    await cache.set('old', 'a'.repeat(20), createdAt);
    await cache.set('new', 'b'.repeat(20), createdAt + 1);

    expect(await cache.get('old', createdAt + 2)).toBeNull();
    expect(await cache.get('new', createdAt + 2)).toBe('b'.repeat(20));
    expect(await cache.get('new', createdAt + 1 + 7 * 24 * 60 * 60 * 1000)).toBeNull();
  });
});
