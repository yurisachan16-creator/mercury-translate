import type { PdfTranslationProgress } from '@/entrypoints/types/pdf';

export const PDF_VISIBLE_PAGE_RADIUS = 1;

export function getPdfVisiblePageWindow(
  visiblePageIndex: number,
  pageCount: number,
  radius = PDF_VISIBLE_PAGE_RADIUS,
): number[] {
  if (!Number.isInteger(visiblePageIndex) || pageCount <= 0) return [];
  const start = Math.max(0, visiblePageIndex - Math.max(0, radius));
  const end = Math.min(pageCount - 1, visiblePageIndex + Math.max(0, radius));
  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
}

export interface PdfPageWork {
  pageIndex: number;
  signal: AbortSignal;
  reportProgress(completedSegments: number, totalSegments: number): void;
}

export interface PdfPageSchedulerOptions {
  pageCount: number;
  radius?: number;
  onProgress?: (progress: PdfTranslationProgress) => void;
}

/**
 * A one-at-a-time, viewport-prioritized scheduler. Updating the viewport
 * immediately aborts queued and in-flight work outside of the current ±1
 * window, so a large PDF never becomes an eager whole-document translation.
 */
export class PdfPageScheduler {
  private readonly pageCount: number;
  private readonly radius: number;
  private readonly onProgress?: (progress: PdfTranslationProgress) => void;
  private readonly completed = new Set<number>();
  private readonly failed = new Set<number>();
  private wanted: number[] = [];
  private queue: number[] = [];
  private active: { pageIndex: number; controller: AbortController } | null = null;
  private runner: ((work: PdfPageWork) => Promise<void>) | null = null;
  private loopPromise: Promise<void> | null = null;
  private disposed = false;

  constructor(options: PdfPageSchedulerOptions) {
    this.pageCount = Math.max(0, options.pageCount);
    this.radius = Math.max(0, options.radius ?? PDF_VISIBLE_PAGE_RADIUS);
    this.onProgress = options.onProgress;
  }

  setRunner(runner: (work: PdfPageWork) => Promise<void>): void {
    this.runner = runner;
  }

  updateVisiblePage(pageIndex: number): void {
    if (this.disposed) return;
    this.wanted = getPdfVisiblePageWindow(pageIndex, this.pageCount, this.radius);
    this.queue = this.wanted
      .filter(index => !this.completed.has(index) && !this.failed.has(index))
      .sort((left, right) => Math.abs(left - pageIndex) - Math.abs(right - pageIndex));
    this.failed.forEach((index) => {
      if (!this.wanted.includes(index)) this.failed.delete(index);
    });

    if (this.active && !this.wanted.includes(this.active.pageIndex)) {
      this.active.controller.abort();
    }

    void this.ensureLoop();
  }

  retry(pageIndex: number): void {
    if (this.disposed || pageIndex < 0 || pageIndex >= this.pageCount) return;
    this.completed.delete(pageIndex);
    this.failed.delete(pageIndex);
    this.queue = [pageIndex, ...this.queue.filter(item => item !== pageIndex)];
    void this.ensureLoop();
  }

  cancel(): void {
    this.queue = [];
    this.active?.controller.abort();
  }

  dispose(): void {
    this.disposed = true;
    this.cancel();
  }

  private async ensureLoop(): Promise<void> {
    if (this.loopPromise || !this.runner || this.disposed) return;
    this.loopPromise = this.drain().finally(() => {
      this.loopPromise = null;
      if (this.queue.length > 0 && !this.disposed) void this.ensureLoop();
    });
    await this.loopPromise;
  }

  private async drain(): Promise<void> {
    while (!this.disposed && this.queue.length > 0 && this.runner) {
      const pageIndex = this.nextPage();
      if (pageIndex === undefined) return;
      const controller = new AbortController();
      this.active = { pageIndex, controller };
      this.onProgress?.({ pageIndex, completedSegments: 0, totalSegments: 0, status: 'translating' });

      try {
        await this.runner({
          pageIndex,
          signal: controller.signal,
          reportProgress: (completedSegments, totalSegments) => {
            if (controller.signal.aborted) return;
            this.onProgress?.({
              pageIndex,
              completedSegments,
              totalSegments,
              status: 'translating',
            });
          },
        });
        if (!controller.signal.aborted) {
          this.completed.add(pageIndex);
          this.failed.delete(pageIndex);
          this.onProgress?.({ pageIndex, completedSegments: 0, totalSegments: 0, status: 'translated' });
        } else {
          this.onProgress?.({ pageIndex, completedSegments: 0, totalSegments: 0, status: 'cancelled' });
        }
      } catch (error) {
        if (controller.signal.aborted) {
          this.onProgress?.({ pageIndex, completedSegments: 0, totalSegments: 0, status: 'cancelled' });
        } else {
          this.failed.add(pageIndex);
          this.onProgress?.({
            pageIndex,
            completedSegments: 0,
            totalSegments: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'PDF page translation failed',
          });
        }
      } finally {
        if (this.active?.controller === controller) this.active = null;
      }
    }
  }

  private nextPage(): number | undefined {
    while (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next === undefined) return undefined;
      if (this.wanted.includes(next) && !this.completed.has(next)) return next;
    }
    return undefined;
  }
}
