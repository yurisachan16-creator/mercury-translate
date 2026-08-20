import {describe, expect, it} from 'vitest';

import {createChromePdfStreamAdapter, PdfViewerFallbackError} from '@/entrypoints/utils/pdfStream';

describe('Chrome PDF stream adapter', () => {
  it('requires Chrome mimeHandler rather than falling back to URL-based PDF fetching', async () => {
    const adapter = createChromePdfStreamAdapter(undefined);
    await expect(adapter.getStreamInfo()).rejects.toMatchObject({
      name: 'PdfViewerFallbackError',
      reason: 'stream-unavailable',
    } satisfies Partial<PdfViewerFallbackError>);
  });

  it('passes through the one-time stream info supplied by Chrome', async () => {
    const fallback = async () => undefined;
    const adapter = createChromePdfStreamAdapter({
      getStreamInfo: async () => ({streamUrl: 'blob:chrome-extension://pdf', originalUrl: 'https://example.test/doc.pdf', embedded: true}),
      abortAndFallbackToNativeHandler: fallback,
    });
    await expect(adapter.getStreamInfo()).resolves.toMatchObject({embedded: true, originalUrl: 'https://example.test/doc.pdf'});
    await expect(adapter.abortAndFallbackToNativeHandler()).resolves.toBeUndefined();
  });
});
