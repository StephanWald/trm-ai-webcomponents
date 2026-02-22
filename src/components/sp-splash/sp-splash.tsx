import { Component, Prop, State, Event, EventEmitter, Method, Watch, Host, h } from '@stencil/core';
import { SplashCloseEventDetail } from './types';

/**
 * sp-splash — Full-screen modal overlay with backdrop blur, gradient header,
 * named slots for all content areas, multiple dismiss mechanisms, and fade/slide animations.
 *
 * @part overlay - The full-screen backdrop overlay element
 * @part container - The centered modal container card
 * @part close-button - The close (X) button in the top-right corner
 * @part header - The gradient header area containing logo, title, subtitle slots
 * @part body - The main content area
 * @part footer - The footer area
 *
 * @slot logo - Optional logo/icon displayed at the top of the header
 * @slot title - Main title text in the gradient header
 * @slot subtitle - Subtitle text beneath the title in the header
 * @slot body - Main body content below the header
 * @slot footer - Footer content (calls-to-action, buttons, etc.)
 */
@Component({
  tag: 'sp-splash',
  styleUrl: 'sp-splash.css',
  shadow: true,
})
export class SpSplash {
  /**
   * Controls visibility of the splash screen. Reflects to attribute. (SPLS-04)
   */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;

  /**
   * Whether pressing the Escape key dismisses the splash. (SPLS-03)
   */
  @Prop() closeOnEscape: boolean = true;

  /**
   * Whether clicking the backdrop overlay dismisses the splash. (SPLS-03)
   */
  @Prop() closeOnBackdrop: boolean = true;

  /**
   * Theme override for standalone usage.
   * @type {'light' | 'dark' | 'auto'}
   */
  @Prop() theme: 'light' | 'dark' | 'auto' = 'auto';

  /** Internal visibility state driving CSS classes */
  @State() isVisible: boolean = false;

  /** Emitted when the splash is dismissed by any mechanism (SPLS-05) */
  @Event() splashClose: EventEmitter<SplashCloseEventDetail>;

  /** Stable reference for attach/detach of keydown listener */
  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.closeOnEscape) {
      this.dismiss('escape');
    }
  };

  /** Handle backdrop click — only dismiss if click target is the overlay itself, not a child */
  private handleBackdropClick = (event: MouseEvent) => {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.dismiss('backdrop');
    }
  };

  /** Handle close button click */
  private handleCloseClick = () => {
    this.dismiss('button');
  };

  /** Dismiss the splash with the given reason */
  private dismiss(reason: 'button' | 'escape' | 'backdrop'): void {
    this.open = false;
    this.splashClose.emit({ reason });
  }

  /** Sync initial open prop — @Watch does not fire for initial values */
  componentDidLoad(): void {
    if (this.open) {
      this.isVisible = true;
      this.attachKeydownListener();
    }
  }

  /** Watch for open prop changes — sync visibility and listeners */
  @Watch('open')
  onOpenChange(newVal: boolean): void {
    if (newVal) {
      this.isVisible = true;
      this.attachKeydownListener();
    } else {
      this.isVisible = false;
      this.detachKeydownListener();
    }
  }

  /** Show the splash (SPLS-04) */
  @Method()
  async show(): Promise<void> {
    this.open = true;
  }

  /** Hide the splash (SPLS-04) */
  @Method()
  async hide(): Promise<void> {
    this.open = false;
  }

  /** Attach keydown listener to document for Escape dismiss */
  private attachKeydownListener(): void {
    document.addEventListener('keydown', this.handleKeydown);
  }

  /** Detach keydown listener from document */
  private detachKeydownListener(): void {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback(): void {
    this.detachKeydownListener();
  }

  render() {
    const hostClass = {
      'theme-light': this.theme === 'light',
      'theme-dark': this.theme === 'dark',
    };

    return (
      <Host class={hostClass}>
        <div
          class={{ 'splash-overlay': true, open: this.isVisible }}
          part="overlay"
          onClick={this.handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-hidden={(!this.isVisible).toString()}
        >
          <div class="splash-container" part="container">
            <button
              class="close-button"
              part="close-button"
              onClick={this.handleCloseClick}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <header class="splash-header" part="header">
              <div class="splash-logo">
                <slot name="logo" />
              </div>
              <div class="splash-title">
                <slot name="title" />
              </div>
              <div class="splash-subtitle">
                <slot name="subtitle" />
              </div>
            </header>
            <div class="splash-body" part="body">
              <slot name="body" />
            </div>
            <footer class="splash-footer" part="footer">
              <slot name="footer" />
            </footer>
          </div>
        </div>
      </Host>
    );
  }
}
