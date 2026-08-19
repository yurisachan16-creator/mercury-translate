import CryptoJS from 'crypto-js';

import type {
  PdfPageSource,
  PdfPageTextContent,
  PdfRect,
  PdfTextBlock,
  PdfTextItem,
} from '@/entrypoints/types/pdf';

export const PDF_SCANNED_PAGE_CHARACTER_THRESHOLD = 20;

interface PositionedTextItem {
  text: string;
  bbox: PdfRect;
  hasEOL: boolean;
}

interface PdfTextLine {
  items: PositionedTextItem[];
  text: string;
  bbox: PdfRect;
  medianHeight: number;
}

function unionRect(left: PdfRect, right: PdfRect): PdfRect {
  return {
    x0: Math.min(left.x0, right.x0),
    y0: Math.min(left.y0, right.y0),
    x1: Math.max(left.x1, right.x1),
    y1: Math.max(left.y1, right.y1),
  };
}

function rectHeight(rect: PdfRect): number {
  return Math.max(1, rect.y1 - rect.y0);
}

function rectCenterY(rect: PdfRect): number {
  return (rect.y0 + rect.y1) / 2;
}

function median(values: number[]): number {
  if (values.length === 0) return 1;
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0
    ? (ordered[middle - 1] + ordered[middle]) / 2
    : ordered[middle];
}

function normalizeText(value: string): string {
  return value.replace(/[\s\u3000]+/g, ' ').trim();
}

function hasCjkBoundary(value: string, fromEnd: boolean): boolean {
  const character = fromEnd ? value.at(-1) : value.at(0);
  return !!character && /[\u2e80-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(character);
}

function joinLineText(items: PositionedTextItem[]): string {
  let result = '';
  let previous: PositionedTextItem | undefined;

  for (const item of items) {
    if (!result) {
      result = item.text;
      previous = item;
      continue;
    }

    const gap = Math.max(0, item.bbox.x0 - (previous?.bbox.x1 || item.bbox.x0));
    const referenceHeight = Math.max(rectHeight(item.bbox), previous ? rectHeight(previous.bbox) : 1);
    const requiresSpace = !hasCjkBoundary(result, true)
      && !hasCjkBoundary(item.text, false)
      && gap > Math.max(1, referenceHeight * 0.12);
    result += requiresSpace ? ` ${item.text}` : item.text;
    previous = item;
  }

  return normalizeText(result);
}

/** Convert PDF.js text content into display-independent PDF-space boxes. */
export function positionPdfTextItems(items: PdfTextItem[]): PositionedTextItem[] {
  return items.flatMap((item) => {
    const text = normalizeText(item.str || '');
    if (!text) return [];

    const transform = item.transform || [];
    const x = Number(transform[4]) || 0;
    const baselineY = Number(transform[5]) || 0;
    const transformWidth = Math.hypot(Number(transform[0]) || 0, Number(transform[1]) || 0);
    const transformHeight = Math.hypot(Number(transform[2]) || 0, Number(transform[3]) || 0);
    const height = Math.max(1, Math.abs(Number(item.height) || transformHeight || 1));
    const width = Math.max(
      Math.max(1, text.length) * Math.max(1, transformWidth || height * 0.45),
      Math.abs(Number(item.width) || 0),
    );

    return [{
      text,
      bbox: { x0: x, y0: baselineY - height, x1: x + width, y1: baselineY },
      hasEOL: Boolean(item.hasEOL),
    }];
  });
}

/**
 * Group positioned runs first into visual lines, then into paragraphs. PDF
 * text has no semantic paragraph tree, so the rules are intentionally stable
 * and conservative instead of attempting table/formula reconstruction.
 */
export function clusterPdfTextBlocks(pageIndex: number, items: PdfTextItem[]): PdfTextBlock[] {
  const positioned = positionPdfTextItems(items).sort((left, right) => {
    const yDifference = rectCenterY(right.bbox) - rectCenterY(left.bbox);
    return Math.abs(yDifference) > 0.5 ? yDifference : left.bbox.x0 - right.bbox.x0;
  });
  const lines: PdfTextLine[] = [];

  for (const item of positioned) {
    const candidate = lines.find((line) => {
      const centerDifference = Math.abs(rectCenterY(line.bbox) - rectCenterY(item.bbox));
      const tolerance = Math.max(line.medianHeight, rectHeight(item.bbox)) * 0.55;
      return centerDifference <= tolerance;
    });

    if (!candidate) {
      lines.push({
        items: [item],
        text: item.text,
        bbox: {...item.bbox},
        medianHeight: rectHeight(item.bbox),
      });
      continue;
    }

    candidate.items.push(item);
    candidate.items.sort((left, right) => left.bbox.x0 - right.bbox.x0);
    candidate.bbox = unionRect(candidate.bbox, item.bbox);
    candidate.medianHeight = median(candidate.items.map(entry => rectHeight(entry.bbox)));
    candidate.text = joinLineText(candidate.items);
  }

  lines.sort((left, right) => {
    const yDifference = right.bbox.y1 - left.bbox.y1;
    return Math.abs(yDifference) > 0.5 ? yDifference : left.bbox.x0 - right.bbox.x0;
  });

  const blocks: Array<{ lines: PdfTextLine[]; bbox: PdfRect }> = [];
  for (const line of lines) {
    const previousBlock = blocks.at(-1);
    const previousLine = previousBlock?.lines.at(-1);
    const verticalGap = previousLine ? Math.max(0, previousLine.bbox.y0 - line.bbox.y1) : Infinity;
    const heightReference = previousLine
      ? Math.max(previousLine.medianHeight, line.medianHeight)
      : line.medianHeight;
    const startsNewParagraph = !previousLine
      || verticalGap > heightReference * 1.6
      || previousLine.items.some(item => item.hasEOL && previousLine.items.length === 1);

    if (startsNewParagraph || !previousBlock) {
      blocks.push({ lines: [line], bbox: {...line.bbox} });
    } else {
      previousBlock.lines.push(line);
      previousBlock.bbox = unionRect(previousBlock.bbox, line.bbox);
    }
  }

  return blocks.flatMap((block, order) => {
    const text = normalizeText(block.lines.map(line => line.text).filter(Boolean).join(' '));
    if (!text) return [];
    const contentHash = CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
    return [{
      id: `${pageIndex}:${order}:${contentHash.slice(0, 16)}`,
      pageIndex,
      order,
      text,
      contentHash,
      bbox: block.bbox,
      lineCount: block.lines.length,
    }];
  });
}

export function countPdfNonWhitespaceCharacters(items: PdfTextItem[]): number {
  return items.reduce((total, item) => total + (item.str || '').replace(/[\s\u3000]/g, '').length, 0);
}

export function isScannedPdfPage(items: PdfTextItem[]): boolean {
  return countPdfNonWhitespaceCharacters(items) < PDF_SCANNED_PAGE_CHARACTER_THRESHOLD;
}

export function createPdfPageSource(content: PdfPageTextContent): PdfPageSource {
  const nonWhitespaceCharacterCount = countPdfNonWhitespaceCharacters(content.items);
  const kind = nonWhitespaceCharacterCount < PDF_SCANNED_PAGE_CHARACTER_THRESHOLD ? 'scanned' : 'text';
  return {
    pageIndex: content.pageIndex,
    kind,
    blocks: kind === 'text' ? clusterPdfTextBlocks(content.pageIndex, content.items) : [],
    nonWhitespaceCharacterCount,
  };
}
