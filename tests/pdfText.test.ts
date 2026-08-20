import {describe, expect, it} from 'vitest';

import {
  PDF_SCANNED_PAGE_CHARACTER_THRESHOLD,
  clusterPdfTextBlocks,
  createPdfPageSource,
  isScannedPdfPage,
} from '@/entrypoints/utils/pdfText';

describe('PDF text extraction', () => {
  it('uses the documented <20 non-whitespace character threshold for scanned pages', () => {
    expect(isScannedPdfPage([{str: 'x'.repeat(PDF_SCANNED_PAGE_CHARACTER_THRESHOLD - 1), transform: [1, 0, 0, 10, 0, 10]}])).toBe(true);
    expect(isScannedPdfPage([{str: 'x'.repeat(PDF_SCANNED_PAGE_CHARACTER_THRESHOLD), transform: [1, 0, 0, 10, 0, 10]}])).toBe(false);
  });

  it('clusters PDF.js runs into ordered, hash-identified paragraph blocks', () => {
    const blocks = clusterPdfTextBlocks(2, [
      {str: 'world', transform: [1, 0, 0, 10, 42, 100], width: 25, height: 10},
      {str: 'Hello', transform: [1, 0, 0, 10, 10, 100], width: 28, height: 10},
      {str: 'second', transform: [1, 0, 0, 10, 10, 72], width: 30, height: 10},
      {str: 'paragraph', transform: [1, 0, 0, 10, 44, 72], width: 50, height: 10},
    ]);

    expect(blocks).toHaveLength(2);
    expect(blocks.map(block => block.text)).toEqual(['Hello world', 'second paragraph']);
    expect(blocks[0]).toMatchObject({pageIndex: 2, order: 0});
    expect(blocks[0].id).toMatch(/^2:0:[0-9a-f]{16}$/);
    expect(blocks[0].contentHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('keeps CJK runs together and leaves scanned pages without fabricated text blocks', () => {
    const blocks = clusterPdfTextBlocks(0, [
      {str: '你好', transform: [1, 0, 0, 10, 10, 100], width: 20, height: 10},
      {str: '世界', transform: [1, 0, 0, 10, 31, 100], width: 20, height: 10},
    ]);
    expect(blocks[0].text).toBe('你好世界');

    const source = createPdfPageSource({
      pageIndex: 0,
      width: 400,
      height: 600,
      items: [{str: 'tiny', transform: [1, 0, 0, 10, 10, 100]}],
    });
    expect(source).toMatchObject({kind: 'scanned', blocks: []});
  });
});
