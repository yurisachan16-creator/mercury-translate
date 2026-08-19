export interface PdfBlockFocusViewport {
  scrollTop: number;
  scrollLeft: number;
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollWidth: number;
  top: number;
  left: number;
}

export interface PdfBlockFocusRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface PdfBlockFocusPosition {
  top: number;
  left: number;
}

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(Math.max(value, lower), Math.max(lower, upper));
}

/**
 * Returns the pane scroll coordinates that center an original-text overlay
 * (whose geometry is derived from the PDF block bbox). It deliberately works
 * from viewport-relative DOM rectangles so canvas scaling and page margins do
 * not change the target.
 */
export function getPdfBlockFocusScrollPosition(
  pane: PdfBlockFocusViewport,
  block: PdfBlockFocusRect,
): PdfBlockFocusPosition {
  const documentTop = pane.scrollTop + block.top - pane.top;
  const documentLeft = pane.scrollLeft + block.left - pane.left;
  return {
    top: clamp(
      documentTop - (pane.clientHeight - block.height) / 2,
      0,
      pane.scrollHeight - pane.clientHeight,
    ),
    left: clamp(
      documentLeft - (pane.clientWidth - block.width) / 2,
      0,
      pane.scrollWidth - pane.clientWidth,
    ),
  };
}
