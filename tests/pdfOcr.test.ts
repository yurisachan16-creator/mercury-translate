import {describe, expect, it} from 'vitest';

import {createPdfOcrBlocks} from '@/entrypoints/utils/pdfOcr';

describe('PDF OCR block conversion', () => {
  it('maps 2× canvas coordinates back to bottom-origin PDF coordinates without retaining image data', () => {
    const blocks = createPdfOcrBlocks(3, [{
      text: 'Scanned heading',
      bbox: {x0: 20, y0: 40, x1: 100, y1: 80},
    }], {
      imageDataUrl: 'data:image/png;base64,never-persisted',
      imageWidth: 400,
      imageHeight: 800,
      pdfWidth: 200,
      pdfHeight: 400,
    });

    expect(blocks[0]).toMatchObject({
      pageIndex: 3,
      order: 0,
      text: 'Scanned heading',
      bbox: {x0: 10, x1: 50, y0: 360, y1: 380},
    });
    expect(JSON.stringify(blocks[0])).not.toContain('never-persisted');
  });
});
