/**
 * Manages DOM element highlighting via fixed-position overlays.
 * Overlays are appended to document.body to escape shadow DOM boundaries.
 *
 * Default highlight: reddish-brown border (#8B4513) with dual glow.
 * Active highlight: green border (#28a745) with 1.5s breathing animation.
 */

interface OverlayReference {
  overlay: HTMLElement;
  target: Element;
}

/** Options for highlight appearance */
export interface HighlightOptions {
  /** When true, uses green breathing animation instead of static reddish-brown glow */
  active?: boolean;
}

/** ID of the injected global styles element */
const STYLES_ID = 'sp-walkthrough-highlight-styles';

/** Inject @keyframes animation once into document.head */
function injectHighlightStyles(): void {
  if (document.getElementById(STYLES_ID)) return;

  const style = document.createElement('style');
  style.id = STYLES_ID;
  style.textContent = `
    @keyframes sp-walkthrough-breathe {
      0%, 100% {
        box-shadow: 0 0 10px rgba(40, 167, 69, 0.5), 0 0 20px rgba(40, 167, 69, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.5);
      }
      50% {
        box-shadow: 0 0 20px rgba(40, 167, 69, 0.8), 0 0 40px rgba(40, 167, 69, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5);
      }
    }
  `.trim();

  document.head.appendChild(style);
}

export class OverlayManager {
  private overlays: OverlayReference[] = [];
  private abortController: AbortController;
  private pendingRAF: number | null = null;

  constructor() {
    this.abortController = new AbortController();
  }

  /**
   * Highlight a DOM element by creating a fixed-position overlay.
   * @param selector CSS selector for the element to highlight
   * @param options Optional highlight options (active state for green breathing animation)
   */
  highlightElement(selector: string, options?: HighlightOptions): void {
    this.clearHighlights();

    // Find target element anywhere in document
    const targetElement = document.querySelector(selector);
    if (!targetElement) {
      console.warn(`[sp-walkthrough] Element not found: ${selector}`);
      return;
    }

    // Inject animation styles if needed (idempotent)
    injectHighlightStyles();

    // Create overlay with spotlight effect
    const overlay = this.createOverlay(targetElement, options);

    // Append to document.body to escape shadow DOM
    document.body.appendChild(overlay);

    // Store reference for cleanup and position updates
    this.overlays.push({ overlay, target: targetElement });

    // Add scroll and resize listeners with passive flag
    window.addEventListener('scroll', this.handleScroll, {
      passive: true,
      signal: this.abortController.signal,
    });

    window.addEventListener('resize', this.handleResize, {
      signal: this.abortController.signal,
    });
  }

  /**
   * Create overlay element positioned over target with appropriate animation.
   */
  private createOverlay(target: Element, options?: HighlightOptions): HTMLElement {
    const rect = target.getBoundingClientRect();
    const isActive = options?.active === true;

    const overlay = document.createElement('div');
    overlay.className = 'sp-walkthrough-highlight';

    // Fixed position to align with viewport coordinates from getBoundingClientRect
    overlay.style.position = 'fixed';
    overlay.style.top = `${rect.top}px`;
    overlay.style.left = `${rect.left}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.zIndex = '10000';
    overlay.style.pointerEvents = 'none'; // Don't block interactions with highlighted element
    overlay.style.borderRadius = '4px';
    overlay.style.transition = 'all 0.3s ease';

    if (isActive) {
      // Active state: green border with breathing glow animation
      overlay.style.border = '3px solid #28a745';
      overlay.style.animation = 'sp-walkthrough-breathe 1.5s ease-in-out infinite';
    } else {
      // Default state: reddish-brown border with dual static glow + spotlight
      overlay.style.border = '3px solid #8B4513';
      overlay.style.boxShadow =
        '0 0 10px rgba(139, 69, 19, 0.5), 0 0 20px rgba(139, 69, 19, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.5)';
    }

    return overlay;
  }

  /**
   * Update overlay positions based on current target positions.
   * Called on scroll/resize via requestAnimationFrame throttling.
   */
  updatePositions(): void {
    this.overlays.forEach(({ overlay, target }) => {
      const rect = target.getBoundingClientRect();
      overlay.style.top = `${rect.top}px`;
      overlay.style.left = `${rect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
    });
  }

  /**
   * Throttled scroll handler using requestAnimationFrame
   */
  private handleScroll = () => {
    if (this.pendingRAF) return;

    this.pendingRAF = requestAnimationFrame(() => {
      this.updatePositions();
      this.pendingRAF = null;
    });
  };

  /**
   * Resize handler
   */
  private handleResize = () => {
    if (this.pendingRAF) return;

    this.pendingRAF = requestAnimationFrame(() => {
      this.updatePositions();
      this.pendingRAF = null;
    });
  };

  /**
   * Remove all overlays and clean up event listeners.
   * Injected styles are left in place (lightweight and reusable).
   */
  clearHighlights(): void {
    // Cancel any pending animation frame
    if (this.pendingRAF) {
      cancelAnimationFrame(this.pendingRAF);
      this.pendingRAF = null;
    }

    // Remove all overlay elements from DOM
    this.overlays.forEach(({ overlay }) => {
      overlay.remove();
    });

    this.overlays = [];

    // Abort all event listeners
    this.abortController.abort();

    // Create new AbortController for next set of listeners
    this.abortController = new AbortController();
  }

  /**
   * Complete cleanup - call when component is destroyed.
   */
  cleanup(): void {
    this.clearHighlights();
  }
}
