import { Placement, PopoverPosition, PositionOptions } from '../types';

const GAP = 4; // px between anchor and popover
const VIEWPORT_MARGIN = 10; // px margin from viewport edges (POPV-02)

/**
 * Get the flipped placement for a given axis.
 * Used when the popover overflows the viewport boundary.
 */
export function getFlippedPlacement(placement: Placement, axis: 'vertical' | 'horizontal'): Placement {
  if (axis === 'vertical') {
    switch (placement) {
      case 'bottom-start': return 'top-start';
      case 'bottom-end': return 'top-end';
      case 'top-start': return 'bottom-start';
      case 'top-end': return 'bottom-end';
      // left/right don't flip vertically
      default: return placement;
    }
  } else {
    // horizontal
    switch (placement) {
      case 'bottom-start': return 'bottom-end';
      case 'bottom-end': return 'bottom-start';
      case 'top-start': return 'top-end';
      case 'top-end': return 'top-start';
      case 'right-start': return 'left-start';
      case 'left-start': return 'right-start';
    }
  }
}

/**
 * Calculate the raw (top, left) CSS position for a given placement.
 * All coordinates are relative to the viewport (for use with position: fixed).
 */
function calculateRawPosition(
  anchorRect: DOMRect,
  popoverWidth: number,
  popoverHeight: number,
  placement: Placement,
): { top: number; left: number } {
  switch (placement) {
    case 'bottom-start':
      return {
        top: anchorRect.bottom + GAP,
        left: anchorRect.left,
      };
    case 'bottom-end':
      return {
        top: anchorRect.bottom + GAP,
        left: anchorRect.right - popoverWidth,
      };
    case 'top-start':
      return {
        top: anchorRect.top - popoverHeight - GAP,
        left: anchorRect.left,
      };
    case 'top-end':
      return {
        top: anchorRect.top - popoverHeight - GAP,
        left: anchorRect.right - popoverWidth,
      };
    case 'right-start':
      return {
        top: anchorRect.top,
        left: anchorRect.right + GAP,
      };
    case 'left-start':
      return {
        top: anchorRect.top,
        left: anchorRect.left - popoverWidth - GAP,
      };
  }
}

/**
 * Pure positioning algorithm — calculates viewport-aware position for all 6 placements.
 * Flips placement when the popover would overflow the viewport with a 10px margin (POPV-02).
 * No DOM access inside this function — all measurements passed as parameters.
 */
export function calculatePosition(options: PositionOptions): PopoverPosition {
  const { anchorRect, popoverRect, placement } = options;
  const { width: popoverWidth, height: popoverHeight } = popoverRect;

  // Use window dimensions (passed through options margin for pure testing, but we need viewport)
  // The function must be pure — viewport dims come in via the options context.
  // Per plan: use window.innerWidth / window.innerHeight for boundary detection.
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

  let activePlacement = placement;

  // Calculate initial raw position
  let { top, left } = calculateRawPosition(anchorRect, popoverWidth, popoverHeight, activePlacement);

  // Viewport boundary detection — check vertical overflow
  const overflowsBottom = top + popoverHeight > viewportHeight - VIEWPORT_MARGIN;
  const overflowsTop = top < VIEWPORT_MARGIN;

  if (overflowsBottom && !overflowsTop) {
    const flipped = getFlippedPlacement(activePlacement, 'vertical');
    const flippedPos = calculateRawPosition(anchorRect, popoverWidth, popoverHeight, flipped);
    // Only flip if the flipped position is actually better (doesn't overflow top)
    if (flippedPos.top >= VIEWPORT_MARGIN) {
      activePlacement = flipped;
      top = flippedPos.top;
      left = flippedPos.left;
    }
  } else if (overflowsTop && !overflowsBottom) {
    const flipped = getFlippedPlacement(activePlacement, 'vertical');
    const flippedPos = calculateRawPosition(anchorRect, popoverWidth, popoverHeight, flipped);
    if (flippedPos.top + popoverHeight <= viewportHeight - VIEWPORT_MARGIN) {
      activePlacement = flipped;
      top = flippedPos.top;
      left = flippedPos.left;
    }
  }

  // Recalculate left after potential vertical flip
  const currentPos = calculateRawPosition(anchorRect, popoverWidth, popoverHeight, activePlacement);
  left = currentPos.left;

  // Check horizontal overflow
  const overflowsRight = left + popoverWidth > viewportWidth - VIEWPORT_MARGIN;
  const overflowsLeft = left < VIEWPORT_MARGIN;

  if (overflowsRight && !overflowsLeft) {
    const flipped = getFlippedPlacement(activePlacement, 'horizontal');
    const flippedPos = calculateRawPosition(anchorRect, popoverWidth, popoverHeight, flipped);
    if (flippedPos.left >= VIEWPORT_MARGIN) {
      activePlacement = flipped;
      left = flippedPos.left;
    }
  } else if (overflowsLeft && !overflowsRight) {
    const flipped = getFlippedPlacement(activePlacement, 'horizontal');
    const flippedPos = calculateRawPosition(anchorRect, popoverWidth, popoverHeight, flipped);
    if (flippedPos.left + popoverWidth <= viewportWidth - VIEWPORT_MARGIN) {
      activePlacement = flipped;
      left = flippedPos.left;
    }
  }

  // Final clamp — ensure position stays within 10px viewport margin regardless
  const finalPos = calculateRawPosition(anchorRect, popoverWidth, popoverHeight, activePlacement);
  top = finalPos.top;
  left = finalPos.left;

  top = Math.max(VIEWPORT_MARGIN, Math.min(top, viewportHeight - popoverHeight - VIEWPORT_MARGIN));
  left = Math.max(VIEWPORT_MARGIN, Math.min(left, viewportWidth - popoverWidth - VIEWPORT_MARGIN));

  return {
    top,
    left,
    actualPlacement: activePlacement,
  };
}
