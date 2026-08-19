import 'fake-indexeddb/auto';

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    OCR_LANGUAGE_ASSETS,
    loadVerifiedOcrLanguageAsset,
    sha256Hex,
    verifyOcrLanguageAsset,
} from '@/entrypoints/utils/ocrLanguageAssets';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('Mercury OCR language assets', () => {
    it('pins all five supported OCR packs with SHA-256 digests', () => {
        expect(Object.keys(OCR_LANGUAGE_ASSETS).sort()).toEqual(
            ['chi_sim', 'chi_tra', 'eng', 'jpn', 'kor'],
        );
        for (const descriptor of Object.values(OCR_LANGUAGE_ASSETS)) {
            expect(descriptor.bytes).toBeGreaterThan(1_000_000);
            expect(descriptor.sha256).toMatch(/^[a-f0-9]{64}$/);
        }
    });

    it('computes deterministic SHA-256 values', async () => {
        const bytes = new TextEncoder().encode('Mercury Translate');
        const data = bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer;
        expect(await sha256Hex(data)).toBe(
            '516714b2e5d1108015abb6055d2a657e1e88fcbb861b6ddcde08d4aa5e7718d3',
        );
    });

    it('rejects an asset before use when size or checksum differs', async () => {
        const descriptor = { code: 'eng' as const, bytes: 3, sha256: '0'.repeat(64) };
        await expect(verifyOcrLanguageAsset(descriptor, new Uint8Array([1, 2]).buffer))
            .rejects.toThrow('size mismatch');
        await expect(verifyOcrLanguageAsset(descriptor, new Uint8Array([1, 2, 3]).buffer))
            .rejects.toThrow('checksum mismatch');
    });

    it('coalesces concurrent first-use downloads for the same language', async () => {
        let releaseFetch: (() => void) | undefined;
        const fetchStarted = new Promise<void>(resolve => { releaseFetch = resolve; });
        const fetchMock = vi.fn(async () => {
            await fetchStarted;
            return {ok: false, status: 503} as Response;
        });
        vi.stubGlobal('fetch', fetchMock);

        const first = loadVerifiedOcrLanguageAsset('eng');
        const second = loadVerifiedOcrLanguageAsset('eng');
        releaseFetch?.();

        await expect(first).rejects.toThrow('503');
        await expect(second).rejects.toThrow('503');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
