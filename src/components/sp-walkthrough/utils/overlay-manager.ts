/**
 * Manages DOM element highlighting via fixed-position overlays
 * Overlays are appended to document.body to escape shadow DOM boundaries
 */

interface OverlayReference {
  overlay: HTMLElement;
  target: Element;
}

export class OverlayManager {
  private overlays: OverlayReference[] = [];
  private abortController: AbortController;
  private pendingRAF: number | null = null;

  constructor() {
    this.abortController = new AbortController();
  }

  /**
   * Highlight a DOM element by creating a fixed-position overlay
   * @param selector CSS selector for the element to highlight
   */
  highlightElement(selector: string): void {
    this.clearHighlights();

    // Find target element anywhere in document
    const targetElement = document.querySelector(selector);
    if (!targetElement) {
      console.warn(`[sp-walkthrough] Element not found: ${selector}`);
      return;
    }

    // Create overlay with spotlight effect
    const overlay = this.createOverlay(targetElement);

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
   * Create overlay element positioned over target
   */
  private createOverlay(target: Element): HTMLElement {
    const rect = target.getBoundingClientRect();

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
    overlay.style.border = '3px solid var(--dwc-color-primary, #0066cc)';
    overlay.style.borderRadius = '4px';
    overlay.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.5)'; // Spotlight effect
    overlay.style.transition = 'all 0.3s ease';

    return overlay;
  }

  /**
   * Update overlay positions based on current target positions
   * Called on scroll/resize via requestAnimationFrame throttling
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
   * Remove all overlays and clean up event listeners
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
   * Complete cleanup - call when component is destroyed
   */
  cleanup(): void {
    this.clearHighlights();
  }
}
