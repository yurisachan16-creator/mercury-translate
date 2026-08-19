/**
 * Contracts shared by the PDF reader, its background bridge, and PDF.js.
 *
 * PDF source bytes intentionally do not appear in any persistent-cache
 * contract. The reader keeps them only in its document controller memory.
 */

export type PdfTranslationStatus = 'idle' | 'queued' | 'translating' | 'translated' | 'error' | 'cancelled';
export type PdfPageKind = 'text' | 'scanned';
export type PdfFallbackReason = 'password' | 'corrupt' | 'unsupported' | 'stream-unavailable';
export type ProviderRuntimeAvailability = 'ready' | 'downloadable' | 'downloading' | 'unsupported' | 'after-detection' | 'configured';

export interface PdfRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface PdfTextItem {
  str: string;
  transform: readonly number[];
  width?: number;
  height?: number;
  hasEOL?: boolean;
}

export interface PdfTextBlock {
  /** Stable only for the current document fingerprint and page. */
  id: string;
  pageIndex: number;
  order: number;
  text: string;
  contentHash: string;
  bbox: PdfRect;
  lineCount: number;
}

export interface PdfPageTextContent {
  pageIndex: number;
  width: number;
  height: number;
  items: PdfTextItem[];
}

export interface PdfOcrLine {
  text: string;
  bbox: PdfRect;
}

export interface PdfPageSource {
  pageIndex: number;
  kind: PdfPageKind;
  blocks: PdfTextBlock[];
  nonWhitespaceCharacterCount: number;
  ocrLines?: PdfOcrLine[];
}

export interface PdfTranslatedBlock {
  id: string;
  translation: string;
}

export interface PdfPageResult {
  pageIndex: number;
  kind: PdfPageKind;
  blocks: PdfTextBlock[];
  translations: PdfTranslatedBlock[];
  status: PdfTranslationStatus;
  error?: string;
  usedOcr: boolean;
}

export interface PdfTranslationRequest {
  documentFingerprint: string;
  pageIndex: number;
  sourceLanguage: string;
  targetLanguage: string;
  providerId?: string;
  providerModel?: string;
  /** Limits a one-time network grant to this viewer/document context. */
  consentScopeId?: string;
  /** Stable IDs let the background preserve ordering across batch retries. */
  segments: Array<Pick<PdfTextBlock, 'id' | 'text' | 'contentHash'>>;
}

export interface PdfTranslationProgress {
  pageIndex: number;
  completedSegments: number;
  totalSegments: number;
  status: PdfTranslationStatus;
  error?: string;
}

export interface PdfTranslationResponse {
  translations: PdfTranslatedBlock[];
}

/**
 * The PDF page does not know how a provider works. The background owns the
 * configured provider and supplies this bridge through extension messages.
 */
export interface PdfTranslationClient {
  checkProviderAvailability(providerId: string, from: string, to: string): Promise<ProviderRuntimeAvailability>;
  translatePage(request: PdfTranslationRequest, signal?: AbortSignal): Promise<PdfTranslationResponse>;
  ensureOcrLanguage(language: PdfOcrLanguageCode, signal?: AbortSignal): Promise<void>;
  cancel(documentFingerprint: string, pageIndex?: number): Promise<void>;
}

export type PdfOcrLanguageCode = 'eng' | 'chi_sim' | 'chi_tra' | 'jpn' | 'kor';

export interface PdfOcrRequest {
  documentFingerprint: string;
  pageIndex: number;
  imageDataUrl: string;
  language: PdfOcrLanguageCode;
}

export interface PdfOcrClient {
  recognizePage(request: PdfOcrRequest, signal?: AbortSignal): Promise<PdfOcrLine[]>;
}

export interface PdfStreamInfo {
  streamUrl: string;
  originalUrl?: string;
  contentType?: string;
  contentLength?: number;
  embedded?: boolean;
  tabId?: number;
}

/** Wraps Chrome 151's mimeHandler API to keep it mockable outside Chrome. */
export interface PdfStreamAdapter {
  getStreamInfo(): Promise<PdfStreamInfo>;
  abortAndFallbackToNativeHandler(): Promise<void>;
}

export interface PdfViewport {
  width: number;
  height: number;
  scale: number;
}

export interface PdfJsRenderTask {
  promise: Promise<void>;
  cancel?: () => void;
}

export interface PdfJsPageProxy {
  getViewport(options: { scale: number }): PdfViewport;
  getTextContent(): Promise<{ items: Array<Partial<PdfTextItem>> }>;
  render(options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewport;
    canvas?: HTMLCanvasElement;
  }): PdfJsRenderTask;
}

export interface PdfJsDocumentProxy {
  numPages: number;
  fingerprint?: string;
  fingerprints?: Array<string | null>;
  getPage(pageNumber: number): Promise<PdfJsPageProxy>;
  destroy?: () => Promise<void> | void;
}

export interface PdfJsLoadingTask {
  promise: Promise<PdfJsDocumentProxy>;
  destroy?: () => Promise<void> | void;
  onPassword?: (updatePassword: (password: string) => void, reason: number) => void;
}

export interface PdfJsModule {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(options: { data: Uint8Array }): PdfJsLoadingTask;
}

export type PdfJsLoader = () => Promise<PdfJsModule>;

export interface PdfPageRenderer {
  pageIndex: number;
  render(canvas: HTMLCanvasElement, scale: number): Promise<PdfViewport>;
  extractText(): Promise<PdfPageTextContent>;
}
