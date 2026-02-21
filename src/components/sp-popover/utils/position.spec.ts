import { calculatePosition, getFlippedPlacement } from './position';

// Standard anchor and popover dimensions used across most tests
const ANCHOR: DOMRect = {
  top: 200,
  left: 200,
  bottom: 240,
  right: 320,
  width: 120,
  height: 40,
  x: 200,
  y: 200,
  toJSON: () => ({}),
} as DOMRect;

const POPOVER = { width: 200, height: 150 };

const GAP = 4; // matches position.ts

// Helpers for setting viewport size
let originalInnerWidth: number;
let originalInnerHeight: number;

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
}

beforeEach(() => {
  originalInnerWidth = window.innerWidth;
  originalInnerHeight = window.innerHeight;
  // Default to a roomy 1280x800 viewport for most tests
  setViewport(1280, 800);
});

afterEach(() => {
  setViewport(originalInnerWidth, originalInnerHeight);
});

// ---------------------------------------------------------------------------
// getFlippedPlacement
// ---------------------------------------------------------------------------

describe('getFlippedPlacement()', () => {
  describe('vertical axis', () => {
    it('flips bottom-start to top-start', () => {
      expect(getFlippedPlacement('bottom-start', 'vertical')).toBe('top-start');
    });

    it('flips bottom-end to top-end', () => {
      expect(getFlippedPlacement('bottom-end', 'vertical')).toBe('top-end');
    });

    it('flips top-start to bottom-start', () => {
      expect(getFlippedPlacement('top-start', 'vertical')).toBe('bottom-start');
    });

    it('flips top-end to bottom-end', () => {
      expect(getFlippedPlacement('top-end', 'vertical')).toBe('bottom-end');
    });

    it('does not flip right-start vertically (no-op)', () => {
      expect(getFlippedPlacement('right-start', 'vertical')).toBe('right-start');
    });

    it('does not flip left-start vertically (no-op)', () => {
      expect(getFlippedPlacement('left-start', 'vertical')).toBe('left-start');
    });
  });

  describe('horizontal axis', () => {
    it('flips bottom-start to bottom-end', () => {
      expect(getFlippedPlacement('bottom-start', 'horizontal')).toBe('bottom-end');
    });

    it('flips bottom-end to bottom-start', () => {
      expect(getFlippedPlacement('bottom-end', 'horizontal')).toBe('bottom-start');
    });

    it('flips top-start to top-end', () => {
      expect(getFlippedPlacement('top-start', 'horizontal')).toBe('top-end');
    });

    it('flips top-end to top-start', () => {
      expect(getFlippedPlacement('top-end', 'horizontal')).toBe('top-start');
    });

    it('flips right-start to left-start', () => {
      expect(getFlippedPlacement('right-start', 'horizontal')).toBe('left-start');
    });

    it('flips left-start to right-start', () => {
      expect(getFlippedPlacement('left-start', 'horizontal')).toBe('right-start');
    });
  });
});

// ---------------------------------------------------------------------------
// calculatePosition — all 6 placements (no overflow, roomy viewport)
// ---------------------------------------------------------------------------

describe('calculatePosition() — placement coordinates', () => {
  it('bottom-start: top = anchor.bottom + gap, left = anchor.left', () => {
    const result = calculatePosition({ anchorRect: ANCHOR, popoverRect: POPOVER, placement: 'bottom-start' });
    expect(result.top).toBe(ANCHOR.bottom + GAP);
    expect(result.left).toBe(ANCHOR.left);
    expect(result.actualPlacement).toBe('bottom-start');
  });

  it('bottom-end: top = anchor.bottom + gap, left = anchor.right - popoverWidth', () => {
    const result = calculatePosition({ anchorRect: ANCHOR, popoverRect: POPOVER, placement: 'bottom-end' });
    expect(result.top).toBe(ANCHOR.bottom + GAP);
    expect(result.left).toBe(ANCHOR.right - POPOVER.width);
    expect(result.actualPlacement).toBe('bottom-end');
  });

  it('top-start: top = anchor.top - popoverHeight - gap, left = anchor.left', () => {
    const result = calculatePosition({ anchorRect: ANCHOR, popoverRect: POPOVER, placement: 'top-start' });
    expect(result.top).toBe(ANCHOR.top - POPOVER.height - GAP);
    expect(result.left).toBe(ANCHOR.left);
    expect(result.actualPlacement).toBe('top-start');
  });

  it('top-end: top = anchor.top - popoverHeight - gap, left = anchor.right - popoverWidth', () => {
    const result = calculatePosition({ anchorRect: ANCHOR, popoverRect: POPOVER, placement: 'top-end' });
    expect(result.top).toBe(ANCHOR.top - POPOVER.height - GAP);
    expect(result.left).toBe(ANCHOR.right - POPOVER.width);
    expect(result.actualPlacement).toBe('top-end');
  });

  it('right-start: top = anchor.top, left = anchor.right + gap', () => {
    const result = calculatePosition({ anchorRect: ANCHOR, popoverRect: POPOVER, placement: 'right-start' });
    expect(result.top).toBe(ANCHOR.top);
    expect(result.left).toBe(ANCHOR.right + GAP);
    expect(result.actualPlacement).toBe('right-start');
  });

  it('left-start: top = anchor.top, left = anchor.left - popoverWidth - gap', () => {
    // Use an anchor far enough from the left edge so the placement fits without clamping.
    // ANCHOR.left = 200, popover width = 200, gap = 4 → left = 200 - 200 - 4 = -4 (overflows).
    // Use anchor at left=500 so left = 500 - 200 - 4 = 296 > 10 (no clamp, no flip).
    const farAnchor: DOMRect = {
      ...ANCHOR,
      left: 500,
      right: 620,
      x: 500,
    } as DOMRect;
    const result = calculatePosition({ anchorRect: farAnchor, popoverRect: POPOVER, placement: 'left-start' });
    expect(result.top).toBe(farAnchor.top);
    expect(result.left).toBe(farAnchor.left - POPOVER.width - GAP);
    expect(result.actualPlacement).toBe('left-start');
  });
});

// ---------------------------------------------------------------------------
// calculatePosition — viewport flip logic
// ---------------------------------------------------------------------------

describe('calculatePosition() — viewport flip logic', () => {
  it('bottom-start flips to top-start when anchor is near the bottom of the viewport', () => {
    setViewport(1280, 800);
    // Anchor near bottom: bottom at 750, popover 150px tall → would overflow 800-10=790
    const anchorNearBottom: DOMRect = {
      top: 700, left: 200, bottom: 740, right: 320,
      width: 120, height: 40, x: 200, y: 700, toJSON: () => ({}),
    } as DOMRect;
    const result = calculatePosition({ anchorRect: anchorNearBottom, popoverRect: POPOVER, placement: 'bottom-start' });
    // 740 + 4 + 150 = 894 > 790 → should flip to top-start
    expect(result.actualPlacement).toBe('top-start');
  });

  it('top-start flips to bottom-start when anchor is near the top of the viewport', () => {
    setViewport(1280, 800);
    // Anchor near top: top at 5 → top-start would put popover at 5 - 150 - 4 = -149 < 10
    const anchorNearTop: DOMRect = {
      top: 5, left: 200, bottom: 45, right: 320,
      width: 120, height: 40, x: 200, y: 5, toJSON: () => ({}),
    } as DOMRect;
    const result = calculatePosition({ anchorRect: anchorNearTop, popoverRect: POPOVER, placement: 'top-start' });
    // -149 < 10 → flips to bottom-start: 45 + 4 = 49, fits in 800-10=790 → flip succeeds
    expect(result.actualPlacement).toBe('bottom-start');
  });

  it('bottom-start flips to bottom-end when anchor is near the right edge of the viewport', () => {
    setViewport(1280, 800);
    // Anchor near right: left at 1100 → bottom-start left=1100, 1100+200=1300 > 1280-10=1270
    const anchorNearRight: DOMRect = {
      top: 200, left: 1100, bottom: 240, right: 1200,
      width: 100, height: 40, x: 1100, y: 200, toJSON: () => ({}),
    } as DOMRect;
    const result = calculatePosition({ anchorRect: anchorNearRight, popoverRect: POPOVER, placement: 'bottom-start' });
    // bottom-end: left = 1200 - 200 = 1000, 1000 + 200 = 1200 < 1270 → flip succeeds
    expect(result.actualPlacement).toBe('bottom-end');
  });

  it('left-start flips to right-start when anchor is near the left edge of the viewport', () => {
    setViewport(1280, 800);
    // Anchor near left: left at 5 → left-start: left = 5 - 200 - 4 = -199 < 10
    const anchorNearLeft: DOMRect = {
      top: 200, left: 5, bottom: 240, right: 105,
      width: 100, height: 40, x: 5, y: 200, toJSON: () => ({}),
    } as DOMRect;
    const result = calculatePosition({ anchorRect: anchorNearLeft, popoverRect: POPOVER, placement: 'left-start' });
    // right-start: 105 + 4 = 109, 109 + 200 = 309 < 1270 → flip succeeds
    expect(result.actualPlacement).toBe('right-start');
  });
});

// ---------------------------------------------------------------------------
// calculatePosition — 10px margin clamping
// ---------------------------------------------------------------------------

describe('calculatePosition() — 10px margin clamping', () => {
  it('clamps top to at least 10px when vertical overflow cannot be resolved by flip', () => {
    setViewport(1280, 800);
    // Both sides overflow (small viewport, large popover placed at top) — clamping applies
    const smallViewport = 100;
    setViewport(smallViewport, smallViewport);
    const anchorCenter: DOMRect = {
      top: 40, left: 40, bottom: 60, right: 80,
      width: 40, height: 20, x: 40, y: 40, toJSON: () => ({}),
    } as DOMRect;
    // With a 300px tall popover in a 100px viewport, clamping kicks in
    const bigPopover = { width: 300, height: 300 };
    const result = calculatePosition({ anchorRect: anchorCenter, popoverRect: bigPopover, placement: 'top-start' });
    expect(result.top).toBeGreaterThanOrEqual(10);
  });

  it('clamps left to at least 10px', () => {
    setViewport(1280, 800);
    // An anchor at left=2, with a popover placed left-start, gets clamped to 10
    const anchorFarLeft: DOMRect = {
      top: 200, left: 2, bottom: 240, right: 102,
      width: 100, height: 40, x: 2, y: 200, toJSON: () => ({}),
    } as DOMRect;
    const result = calculatePosition({ anchorRect: anchorFarLeft, popoverRect: POPOVER, placement: 'left-start' });
    expect(result.left).toBeGreaterThanOrEqual(10);
  });

  it('result top never exceeds viewportHeight - popoverHeight - 10', () => {
    setViewport(1280, 800);
    const result = calculatePosition({ anchorRect: ANCHOR, popoverRect: POPOVER, placement: 'bottom-start' });
    expect(result.top).toBeLessThanOrEqual(800 - POPOVER.height - 10);
  });

  it('result left never exceeds viewportWidth - popoverWidth - 10', () => {
    setViewport(1280, 800);
    const result = calculatePosition({ anchorRect: ANCHOR, popoverRect: POPOVER, placement: 'bottom-start' });
    expect(result.left).toBeLessThanOrEqual(1280 - POPOVER.width - 10);
  });
});
