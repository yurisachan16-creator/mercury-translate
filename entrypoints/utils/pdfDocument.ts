import CryptoJS from 'crypto-js';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import type {
  PdfFallbackReason,
  PdfJsDocumentProxy,
  PdfJsLoader,
  PdfJsModule,
  PdfJsPageProxy,
  PdfPageRenderer,
  PdfPageTextContent,
  PdfTextItem,
  PdfViewport,
} from '@/entrypoints/types/pdf';

export class PdfDocumentLoadError extends Error {
  readonly reason: PdfFallbackReason;

  constructor(reason: PdfFallbackReason, message: string) {
    super(message);
    this.name = 'PdfDocumentLoadError';
    this.reason = reason;
  }
}

/** PDF.js is bundled with the extension; it never loads a viewer or worker from a CDN. */
export async function loadBundledPdfJs(): Promise<PdfJsModule> {
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs') as unknown as PdfJsModule;
  // `?url` forces WXT/Vite to emit the worker as an extension-owned asset.
  // `new URL('pdfjs-dist/...', import.meta.url)` leaves a package-relative URL
  // in the output, which does not exist inside a packaged extension.
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  return pdfjs;
}

function toPdfTextItems(items: Array<Partial<PdfTextItem>>): PdfTextItem[] {
  return items.flatMap((item) => {
    if (typeof item.str !== 'string' || !Array.isArray(item.transform)) return [];
    return [{
      str: item.str,
      transform: item.transform,
      width: typeof item.width === 'number' ? item.width : undefined,
      height: typeof item.height === 'number' ? item.height : undefined,
      hasEOL: Boolean(item.hasEOL),
    }];
  });
}

function classifyPdfJsError(error: unknown): PdfFallbackReason {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  if (message.includes('password')) return 'password';
  if (message.includes('invalid pdf') || message.includes('malformed') || message.includes('corrupt')) return 'corrupt';
  return 'unsupported';
}

function fingerprintBytes(bytes: ArrayBuffer): string {
  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(bytes) as unknown as number[]);
  return `bytes:${CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex).slice(0, 32)}`;
}

class PdfJsPageRenderer implements PdfPageRenderer {
  constructor(
    readonly pageIndex: number,
    private readonly page: PdfJsPageProxy,
  ) {}

  async render(canvas: HTMLCanvasElement, scale: number): Promise<PdfViewport> {
    const deviceScale = Math.max(1, globalThis.devicePixelRatio || 1);
    const viewport = this.page.getViewport({scale});
    canvas.width = Math.ceil(viewport.width * deviceScale);
    canvas.height = Math.ceil(viewport.height * deviceScale);
    canvas.style.width = `${Math.ceil(viewport.width)}px`;
    canvas.style.height = `${Math.ceil(viewport.height)}px`;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create PDF canvas context.');
    context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    await this.page.render({ canvasContext: context, viewport, canvas }).promise;
    return viewport;
  }

  async extractText(): Promise<PdfPageTextContent> {
    const [content, viewport] = await Promise.all([
      this.page.getTextContent(),
      Promise.resolve(this.page.getViewport({scale: 1})),
    ]);
    return {
      pageIndex: this.pageIndex,
      width: viewport.width,
      height: viewport.height,
      items: toPdfTextItems(content.items),
    };
  }
}

export class PdfDocumentController {
  readonly pageCount: number;
  readonly fingerprint: string;

  private constructor(
    private readonly document: PdfJsDocumentProxy,
    fingerprint: string,
  ) {
    this.pageCount = document.numPages;
    this.fingerprint = fingerprint;
  }

  static async load(
    bytes: ArrayBuffer,
    options: { loader?: PdfJsLoader } = {},
  ): Promise<PdfDocumentController> {
    const loader = options.loader || loadBundledPdfJs;
    try {
      // PDF.js may transfer the provided Uint8Array to its worker. Derive the
      // in-memory fallback before that transfer, and never persist it.
      const fallbackFingerprint = fingerprintBytes(bytes);
      const pdfjs = await loader();
      const loadingTask = pdfjs.getDocument({data: new Uint8Array(bytes)});
      const passwordRequired = new Promise<never>((_resolve, reject) => {
        loadingTask.onPassword = () => {
          void loadingTask.destroy?.();
          reject(new Error('Password-protected PDF documents use the native Chrome viewer.'));
        };
      });
      const document = await Promise.race([loadingTask.promise, passwordRequired]);
      const fingerprint = document.fingerprint || document.fingerprints?.find(Boolean) || fallbackFingerprint;
      return new PdfDocumentController(document, fingerprint);
    } catch (error) {
      throw new PdfDocumentLoadError(
        classifyPdfJsError(error),
        error instanceof Error ? error.message : 'PDF.js could not open this document.',
      );
    }
  }

  async getPageRenderer(pageIndex: number): Promise<PdfPageRenderer> {
    if (!Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= this.pageCount) {
      throw new RangeError(`PDF page ${pageIndex} is outside the document.`);
    }
    const page = await this.document.getPage(pageIndex + 1);
    return new PdfJsPageRenderer(pageIndex, page);
  }

  async destroy(): Promise<void> {
    await this.document.destroy?.();
  }
}
