import type { PdfFallbackReason, PdfStreamAdapter, PdfStreamInfo } from '@/entrypoints/types/pdf';

interface ChromeMimeHandlerApi {
  getStreamInfo(): Promise<{
    streamUrl: string;
    originalUrl?: string;
    contentType?: string;
    contentLength?: number;
    embedded?: boolean;
    tabId?: number;
  }>;
  abortAndFallbackToNativeHandler(): Promise<void>;
}

interface ChromeWithMimeHandler {
  mimeHandler?: ChromeMimeHandlerApi;
}

export class PdfViewerFallbackError extends Error {
  readonly reason: PdfFallbackReason;

  constructor(reason: PdfFallbackReason, message: string) {
    super(message);
    this.name = 'PdfViewerFallbackError';
    this.reason = reason;
  }
}

function getChromeMimeHandler(): ChromeMimeHandlerApi | undefined {
  return (globalThis.chrome as unknown as ChromeWithMimeHandler | undefined)?.mimeHandler;
}

/** Chrome 151 adapter. Kept separate so unit tests can use a fake stream. */
export function createChromePdfStreamAdapter(
  mimeHandler: ChromeMimeHandlerApi | undefined = getChromeMimeHandler(),
): PdfStreamAdapter {
  if (!mimeHandler) {
    return {
      async getStreamInfo(): Promise<PdfStreamInfo> {
        throw new PdfViewerFallbackError(
          'stream-unavailable',
          'Chrome PDF stream handler is unavailable. Mercury Translate requires Chrome 151 or later.',
        );
      },
      async abortAndFallbackToNativeHandler(): Promise<void> {
        // Nothing to abort when the page was opened outside the MIME handler.
      },
    };
  }

  return {
    async getStreamInfo(): Promise<PdfStreamInfo> {
      const stream = await mimeHandler.getStreamInfo();
      if (!stream?.streamUrl) {
        throw new PdfViewerFallbackError('stream-unavailable', 'Chrome did not provide a PDF stream URL.');
      }
      return {
        streamUrl: stream.streamUrl,
        originalUrl: stream.originalUrl,
        contentType: stream.contentType,
        contentLength: stream.contentLength,
        embedded: stream.embedded,
        tabId: stream.tabId,
      };
    },
    abortAndFallbackToNativeHandler: () => mimeHandler.abortAndFallbackToNativeHandler(),
  };
}

/**
 * Fetch a MIME-handler stream exactly once. A stream URL may represent a POST
 * response or another single-use source; callers must retain the returned
 * ArrayBuffer in memory for the lifetime of the reader and never persist it.
 */
export async function fetchPdfStreamBytes(stream: PdfStreamInfo, signal?: AbortSignal): Promise<ArrayBuffer> {
  const response = await fetch(stream.streamUrl, {
    cache: 'no-store',
    credentials: 'omit',
    signal,
  });
  if (!response.ok) {
    throw new PdfViewerFallbackError('stream-unavailable', `Unable to read PDF stream (${response.status}).`);
  }
  const contentType = response.headers.get('content-type');
  if (contentType && !contentType.toLowerCase().includes('pdf')) {
    throw new PdfViewerFallbackError('unsupported', 'The MIME stream did not contain a PDF document.');
  }
  return response.arrayBuffer();
}
