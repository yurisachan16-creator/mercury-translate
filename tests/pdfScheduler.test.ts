import {describe, expect, it} from 'vitest';

import {getPdfVisiblePageWindow, PdfPageScheduler} from '@/entrypoints/utils/pdfScheduler';

function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

describe('PDF viewport scheduler', () => {
  it('returns a bounded visible ±1 window', () => {
    expect(getPdfVisiblePageWindow(0, 4)).toEqual([0, 1]);
    expect(getPdfVisiblePageWindow(2, 4)).toEqual([1, 2, 3]);
    expect(getPdfVisiblePageWindow(3, 4)).toEqual([2, 3]);
  });

  it('prioritizes the visible page and cancels work that leaves the window', async () => {
    const started: number[] = [];
    const cancelled: number[] = [];
    const scheduler = new PdfPageScheduler({pageCount: 8});
    scheduler.setRunner(({pageIndex, signal}) => new Promise<void>((resolve, reject) => {
      started.push(pageIndex);
      signal.addEventListener('abort', () => {
        cancelled.push(pageIndex);
        reject(new Error('cancelled'));
      }, {once: true});
      if (pageIndex === 0) resolve();
    }));

    scheduler.updateVisiblePage(5);
    await tick();
    expect(started).toEqual([5]);

    scheduler.updateVisiblePage(0);
    await tick();
    await tick();
    expect(cancelled).toEqual([5]);
    expect(started).toContain(0);
    scheduler.dispose();
  });

  it('reports real segment totals supplied by the page runner', async () => {
    const progress: Array<[number, number]> = [];
    const scheduler = new PdfPageScheduler({
      pageCount: 1,
      onProgress(event) {
        if (event.status === 'translating') {
          progress.push([event.completedSegments, event.totalSegments]);
        }
      },
    });
    scheduler.setRunner(async ({reportProgress}) => {
      reportProgress(0, 3);
      reportProgress(3, 3);
    });

    scheduler.updateVisiblePage(0);
    await tick();
    expect(progress).toEqual([[0, 0], [0, 3], [3, 3]]);
    scheduler.dispose();
  });

  // Regression: ISSUE-004 — cancelling PDF consent stops the queued page batch.
  // Found by /qa on 2026-08-20
  // Report: .gstack/qa-reports/qa-report-mercury-translate-browser-2026-08-20.md
  it('stops queued visible pages when the active runner cancels the batch', async () => {
    const started: number[] = [];
    const statuses: string[] = [];
    const scheduler = new PdfPageScheduler({
      pageCount: 5,
      onProgress(event) {
        statuses.push(`${event.pageIndex}:${event.status}`);
      },
    });
    scheduler.setRunner(({pageIndex}) => {
      started.push(pageIndex);
      scheduler.cancel();
      throw new Error('network consent cancelled');
    });

    scheduler.updateVisiblePage(2);
    await tick();
    await tick();

    expect(started).toEqual([2]);
    expect(statuses).toContain('2:cancelled');
    expect(statuses).not.toContain('1:translating');
    expect(statuses).not.toContain('3:translating');
    scheduler.dispose();
  });
});
