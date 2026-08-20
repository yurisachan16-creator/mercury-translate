import {describe, expect, it} from 'vitest';

import {PdfDocumentController} from '@/entrypoints/utils/pdfDocument';

describe('PDF document controller', () => {
  it('uses PDF.js document fingerprints without retaining source bytes in its public state', async () => {
    const controller = await PdfDocumentController.load(new Uint8Array([1, 2, 3]).buffer, {
      loader: async () => ({
        GlobalWorkerOptions: {workerSrc: ''},
        getDocument: () => ({
          promise: Promise.resolve({
            numPages: 2,
            fingerprints: ['pdfjs-fingerprint', null],
            getPage: async () => { throw new Error('not needed for this test'); },
          }),
        }),
      }),
    });
    expect(controller.pageCount).toBe(2);
    expect(controller.fingerprint).toBe('pdfjs-fingerprint');
    expect(JSON.stringify(controller)).not.toContain('1,2,3');
  });

  it('classifies a password callback for immediate native-viewer fallback', async () => {
    const loadingTask: Record<string, unknown> = {
      promise: new Promise(() => undefined),
      destroy: async () => undefined,
    };
    Object.defineProperty(loadingTask, 'onPassword', {
      set(handler: (updatePassword: (password: string) => void, reason: number) => void) {
        queueMicrotask(() => handler(() => undefined, 1));
      },
    });

    await expect(PdfDocumentController.load(new Uint8Array([1, 2, 3]).buffer, {
      loader: async () => ({
        GlobalWorkerOptions: {workerSrc: ''},
        getDocument: () => loadingTask as never,
      }),
    })).rejects.toMatchObject({reason: 'password'});
  });
});
