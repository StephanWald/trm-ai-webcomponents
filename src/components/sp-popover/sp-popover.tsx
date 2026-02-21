import { Component, Prop, State, Event, EventEmitter, Method, Element, Watch, Host, h } from '@stencil/core';
import { Placement } from './types';
import { calculatePosition } from './utils/position';

/**
 * @part container - Positioned wrapper div (position: fixed)
 * @part content - Visual panel with background, border, shadow
 */
@Component({
  tag: 'sp-popover',
  styleUrl: 'sp-popover.css',
  shadow: true,
})
export class SpPopover {
  /** Host element reference for anchor resolution */
  @Element() el: HTMLElement;

  /**
   * Preferred placement of the popover relative to its anchor (POPV-01).
   * Will auto-flip if it overflows the viewport (POPV-02).
   * @type {'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right-start' | 'left-start'}
   */
  @Prop() placement: Placement = 'bottom-start';

  /**
   * Controls visibility. Can be bound via prop or toggled via methods.
   * Reflects to attribute.
   */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;

  /**
   * Close the popover when clicking outside it and its anchor (POPV-03).
   */
  @Prop() closeOnClick: boolean = true;

  /**
   * Close the popover when pressing the Escape key (POPV-03).
   */
  @Prop() closeOnEscape: boolean = true;

  /**
   * Anchor element reference. Can be:
   * - A CSS selector string (resolved via document.querySelector)
   * - A direct HTMLElement reference
   * - null/omitted: uses the previous sibling element
   */
  @Prop() anchor: string | HTMLElement = null;

  /**
   * Theme override for standalone usage.
   * @type {'light' | 'dark' | 'auto'}
   */
  @Prop() theme: 'light' | 'dark' | 'auto' = 'auto';

  /** Internal open state — drives render */
  @State() isOpen: boolean = false;

  /** Computed CSS position from positioning algorithm */
  @State() positionStyle: { top: string; left: string } | null = null;

  /** Emitted when the popover opens (POPV-06) */
  @Event() popoverOpen: EventEmitter<void>;

  /** Emitted when the popover closes (POPV-06) */
  @Event() popoverClose: EventEmitter<void>;

  // Stable handler references for attach/detach
  private clickHandler = (event: MouseEvent) => {
    const anchorEl = this.resolveAnchor();
    const target = event.target as Node;
    // Close if click is outside the popover host AND outside the anchor
    if (!this.el.contains(target) && (!anchorEl || !anchorEl.contains(target))) {
      this.hidePopover();
    }
  };

  private keydownHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.hidePopover();
    }
  };

  private rafHandle: number | null = null;

  /** Watch for external prop changes — sync open state */
  @Watch('open')
  onOpenChange(newVal: boolean) {
    if (newVal) {
      this.openInternal();
    } else {
      this.closeInternal();
    }
  }

  /** Open the popover, calculate position, and emit popover-open (POPV-04) */
  @Method()
  async showPopover(): Promise<void> {
    if (this.isOpen) return;
    this.open = true;
    this.openInternal();
  }

  /** Close the popover and emit popover-close (POPV-04) */
  @Method()
  async hidePopover(): Promise<void> {
    if (!this.isOpen) return;
    this.open = false;
    this.closeInternal();
  }

  /** Toggle between open and closed states (POPV-04) */
  @Method()
  async togglePopover(): Promise<void> {
    if (this.isOpen) {
      await this.hidePopover();
    } else {
      await this.showPopover();
    }
  }

  /**
   * Recalculate position without changing open state.
   * Useful after scroll/resize events (POPV-04).
   */
  @Method()
  async updatePosition(): Promise<void> {
    this.computePosition();
  }

  /** Resolve the anchor element from prop (selector, element, or previous sibling) */
  private resolveAnchor(): HTMLElement | null {
    if (this.anchor instanceof HTMLElement) {
      return this.anchor;
    }
    if (typeof this.anchor === 'string' && this.anchor) {
      return document.querySelector(this.anchor) as HTMLElement | null;
    }
    return this.el.previousElementSibling as HTMLElement | null;
  }

  /** Calculate and set the CSS position using the positioning utility */
  private computePosition(): void {
    const anchorEl = this.resolveAnchor();
    if (!anchorEl) return;

    const anchorRect = anchorEl.getBoundingClientRect();

    // Measure the popover container from shadow DOM
    const container = this.el.shadowRoot?.querySelector('.popover-container') as HTMLElement | null;
    const popoverRect = container
      ? { width: container.offsetWidth, height: container.offsetHeight }
      : { width: 0, height: 0 };

    const pos = calculatePosition({
      anchorRect,
      popoverRect,
      placement: this.placement,
    });

    this.positionStyle = {
      top: `${pos.top}px`,
      left: `${pos.left}px`,
    };
  }

  /** Internal open flow — position, show, attach listeners */
  private openInternal(): void {
    // Use rAF to ensure the popover DOM is rendered before measuring dimensions
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
    }
    this.rafHandle = requestAnimationFrame(() => {
      this.rafHandle = null;
      this.computePosition();
      this.isOpen = true;
      this.popoverOpen.emit();
      this.attachDismissListeners();
    });
  }

  /** Internal close flow — hide, detach listeners */
  private closeInternal(): void {
    this.isOpen = false;
    this.popoverClose.emit();
    this.detachDismissListeners();
  }

  /** Attach outside-click and escape listeners when popover is open */
  private attachDismissListeners(): void {
    if (this.closeOnClick) {
      // Use setTimeout to avoid catching the click that opened the popover
      setTimeout(() => {
        document.addEventListener('click', this.clickHandler, true);
      }, 0);
    }
    if (this.closeOnEscape) {
      document.addEventListener('keydown', this.keydownHandler);
    }
  }

  /** Detach all document-level dismiss listeners */
  private detachDismissListeners(): void {
    document.removeEventListener('click', this.clickHandler, true);
    document.removeEventListener('keydown', this.keydownHandler);
  }

  disconnectedCallback(): void {
    this.detachDismissListeners();
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }

  render() {
    const hostClass = {
      'theme-light': this.theme === 'light',
      'theme-dark': this.theme === 'dark',
    };

    return (
      <Host class={hostClass}>
        <div
          class={{ 'popover-container': true, 'open': this.isOpen }}
          part="container"
          style={this.positionStyle ? { top: this.positionStyle.top, left: this.positionStyle.left } : {}}
          role="dialog"
          aria-hidden={(!this.isOpen).toString()}
        >
          <div class="popover-content" part="content">
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
