import CryptoJS from 'crypto-js';

import type { PdfOcrLine, PdfPageRenderer, PdfTextBlock } from '@/entrypoints/types/pdf';

export const PDF_OCR_RENDER_SCALE = 2;

export interface PdfOcrCanvasSource {
  imageDataUrl: string;
  imageWidth: number;
  imageHeight: number;
  pdfWidth: number;
  pdfHeight: number;
}

/** Render a single on-demand page at 2×; it is never written to IndexedDB. */
export async function renderPdfPageForOcr(renderer: PdfPageRenderer): Promise<PdfOcrCanvasSource> {
  const canvas = document.createElement('canvas');
  const viewport = await renderer.render(canvas, PDF_OCR_RENDER_SCALE);
  return {
    imageDataUrl: canvas.toDataURL('image/png'),
    imageWidth: canvas.width,
    imageHeight: canvas.height,
    pdfWidth: viewport.width,
    pdfHeight: viewport.height,
  };
}

function toPdfCoordinates(
  bbox: PdfOcrLine['bbox'],
  source: PdfOcrCanvasSource,
) {
  const xScale = source.pdfWidth / Math.max(1, source.imageWidth);
  const yScale = source.pdfHeight / Math.max(1, source.imageHeight);
  // Canvas Y runs top-to-bottom while PDF coordinates run bottom-to-top.
  return {
    x0: Math.max(0, bbox.x0 * xScale),
    x1: Math.max(0, bbox.x1 * xScale),
    y0: Math.max(0, source.pdfHeight - bbox.y1 * yScale),
    y1: Math.max(0, source.pdfHeight - bbox.y0 * yScale),
  };
}

export function createPdfOcrBlocks(
  pageIndex: number,
  lines: PdfOcrLine[],
  source: PdfOcrCanvasSource,
): PdfTextBlock[] {
  return lines.flatMap((line, order) => {
    const text = line.text.replace(/[\s\u3000]+/g, ' ').trim();
    if (!text) return [];
    const contentHash = CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
    return [{
      id: `${pageIndex}:ocr:${order}:${contentHash.slice(0, 16)}`,
      pageIndex,
      order,
      text,
      contentHash,
      bbox: toPdfCoordinates(line.bbox, source),
      lineCount: 1,
    }];
  });
}
