import { Component, Prop, State, Event, EventEmitter, Element, Host, h } from '@stencil/core';
import { LanguageChangeEventDetail } from './types';
import { getBrowserPreferredLanguages } from './utils/languages';
import { renderGlobeIcon, renderChevronDownIcon } from './utils/icons';

/**
 * Inline trigger button that opens a language selection dropdown via sp-popover.
 *
 * @part trigger - The button element
 */
@Component({
  tag: 'sp-language-selector',
  styleUrl: 'sp-language-selector.css',
  shadow: true,
})
export class SpLanguageSelector {
  /** Host element reference */
  @Element() el: HTMLElement;

  /**
   * Currently selected language code (LANG-04).
   * Displayed uppercase in the button. Mutable so parent can update via prop.
   */
  @Prop({ mutable: true, reflect: true }) selectedLanguage: string = 'en';

  /**
   * Disables the button — prevents opening the dropdown (LANG-06).
   */
  @Prop() disabled: boolean = false;

  /**
   * Compact display mode — smaller padding and font (LANG-06).
   */
  @Prop() compact: boolean = false;

  /**
   * Theme override for standalone usage (LANG-06).
   * @type {'light' | 'dark' | 'auto'}
   */
  @Prop() theme: 'light' | 'dark' | 'auto' = 'auto';

  /**
   * Milliseconds before dropdown auto-hides after mouse leaves (LANG-05).
   */
  @Prop() autoHideDelay: number = 3000;

  /**
   * Emitted when the user selects a language (LANG-03).
   * Bubbles up from sp-language-list.
   */
  @Event() languageChange: EventEmitter<LanguageChangeEventDetail>;

  /** Tracks whether the dropdown is currently open */
  @State() isOpen: boolean = false;

  /** Browser-preferred language codes computed once on load */
  @State() preferredLanguages: string[] = [];

  /** Reference to sp-popover for open/close control */
  private popoverRef: HTMLSpPopoverElement | null = null;

  /** Timer for auto-hide after mouse leave (LANG-05) */
  private autoHideTimer: ReturnType<typeof setTimeout> | null = null;

  componentWillLoad() {
    this.preferredLanguages = getBrowserPreferredLanguages();
  }

  disconnectedCallback() {
    this.clearAutoHideTimer();
  }

  private clearAutoHideTimer() {
    if (this.autoHideTimer !== null) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }

  private handleButtonClick = () => {
    if (this.disabled) return;
    this.clearAutoHideTimer();
    this.popoverRef?.togglePopover();
  };

  private handleLanguageSelected = (event: CustomEvent<LanguageChangeEventDetail>) => {
    this.selectedLanguage = event.detail.code;
    this.popoverRef?.hidePopover();
    this.clearAutoHideTimer();
    this.languageChange.emit(event.detail);
  };

  private handleMouseLeave = () => {
    this.clearAutoHideTimer();
    this.autoHideTimer = setTimeout(() => {
      this.popoverRef?.hidePopover();
    }, this.autoHideDelay);
  };

  private handleMouseEnter = () => {
    this.clearAutoHideTimer();
  };

  private handlePopoverOpen = () => {
    this.isOpen = true;
  };

  private handlePopoverClose = () => {
    this.isOpen = false;
    this.clearAutoHideTimer();
  };

  render() {
    const hostClass = {
      'theme-light': this.theme === 'light',
      'theme-dark': this.theme === 'dark',
    };

    return (
      <Host
        class={hostClass}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
      >
        <button
          class={{
            'selector-button': true,
            open: this.isOpen,
            compact: this.compact,
          }}
          part="trigger"
          disabled={this.disabled}
          aria-expanded={this.isOpen.toString()}
          aria-haspopup="listbox"
          onClick={this.handleButtonClick}
        >
          {renderGlobeIcon(16)}
          <span class="lang-code">{this.selectedLanguage.toUpperCase()}</span>
          <span class={{ chevron: true, open: this.isOpen }}>
            {renderChevronDownIcon(14)}
          </span>
        </button>

        <sp-popover
          ref={el => (this.popoverRef = el as HTMLSpPopoverElement)}
          placement="bottom-start"
          close-on-click
          close-on-escape
          onPopoverOpen={this.handlePopoverOpen}
          onPopoverClose={this.handlePopoverClose}
        >
          <sp-language-list
            selectedLanguage={this.selectedLanguage}
            preferredLanguages={this.preferredLanguages}
            compact={this.compact}
            theme={this.theme}
            onLanguageChange={this.handleLanguageSelected}
          />
        </sp-popover>
      </Host>
    );
  }
}
