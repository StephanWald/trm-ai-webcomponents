/**
 * Placement type union for sp-popover positioning
 * Defines all 6 supported placement options (POPV-01)
 */
export type Placement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'
  | 'right-start'
  | 'left-start';

/**
 * The calculated CSS position for the popover, including which placement
 * was actually used (may differ from requested if viewport-flipped)
 */
export interface PopoverPosition {
  top: number;
  left: number;
  actualPlacement: Placement;
}

/**
 * Inputs to the positioning function
 */
export interface PositionOptions {
  anchorRect: DOMRect;
  popoverRect: { width: number; height: number };
  placement: Placement;
  margin?: number;
}
