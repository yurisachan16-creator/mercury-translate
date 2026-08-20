import {describe, expect, it} from 'vitest';

import {getPdfBlockFocusScrollPosition} from '@/entrypoints/utils/pdfBlockFocus';

describe('PDF original block focus', () => {
  it('centers the exact bbox overlay instead of only its page', () => {
    const target = getPdfBlockFocusScrollPosition({
      top: 100,
      left: 40,
      scrollTop: 800,
      scrollLeft: 0,
      clientHeight: 400,
      clientWidth: 500,
      scrollHeight: 3000,
      scrollWidth: 900,
    }, {
      top: 500,
      left: 240,
      width: 120,
      height: 24,
    });

    // The overlay's document-space top is 1200 and it is centered in the
    // 400px pane (1200 - (400 - 24) / 2), not at the page's top.
    expect(target).toEqual({top: 1012, left: 10});
  });

  it('keeps bbox focus within both scrollable pane bounds', () => {
    const target = getPdfBlockFocusScrollPosition({
      top: 0,
      left: 0,
      scrollTop: 0,
      scrollLeft: 20,
      clientHeight: 300,
      clientWidth: 400,
      scrollHeight: 700,
      scrollWidth: 650,
    }, {
      top: 650,
      left: 620,
      width: 80,
      height: 80,
    });

    expect(target).toEqual({top: 400, left: 250});
  });
});
