import { Component, Prop, State, Event, EventEmitter, Host, h } from '@stencil/core';
import { CommunicationChannel, PreferenceChangeEventDetail } from './types';
import { getChannelByType } from './utils/channels';
import { renderChannelIcon, renderChevronDownIcon } from './utils/icons';

/**
 * Inline trigger button that opens a communication channel selection dropdown via sp-popover.
 *
 * @part trigger - The button element
 */
@Component({
  tag: 'sp-communication-preferences',
  styleUrl: 'sp-communication-preferences.css',
  shadow: true,
})
export class SpCommunicationPreferences {
  /**
   * Currently selected communication channel (COMM-01).
   * Mutable so parent can update via prop.
   */
  @Prop({ mutable: true, reflect: true }) selectedChannel: CommunicationChannel = 'APPLICATION';

  /**
   * Disables the button — prevents opening the dropdown (COMM-05).
   */
  @Prop() disabled: boolean = false;

  /**
   * Compact display mode — smaller padding and font (COMM-05).
   */
  @Prop() compact: boolean = false;

  /**
   * Theme override for standalone usage (COMM-05).
   * @type {'light' | 'dark' | 'auto'}
   */
  @Prop() theme: 'light' | 'dark' | 'auto' = 'auto';

  /**
   * Emitted when the user selects a channel (COMM-03).
   * Re-emitted from sp-communication-list.
   */
  @Event() preferenceChange: EventEmitter<PreferenceChangeEventDetail>;

  /** Tracks whether the dropdown is currently open */
  @State() isOpen: boolean = false;

  /** Reference to sp-popover for open/close control */
  private popoverRef: HTMLSpPopoverElement | null = null;

  disconnectedCallback() {
    // No auto-hide timer for communication preferences — nothing to clean up
  }

  private handleButtonClick = () => {
    if (this.disabled) return;
    this.popoverRef?.togglePopover();
  };

  private handleChannelSelected = (event: CustomEvent<PreferenceChangeEventDetail>) => {
    this.selectedChannel = event.detail.channel;
    this.popoverRef?.hidePopover();
    this.preferenceChange.emit(event.detail);
  };

  private handlePopoverOpen = () => {
    this.isOpen = true;
  };

  private handlePopoverClose = () => {
    this.isOpen = false;
  };

  render() {
    const hostClass = {
      'theme-light': this.theme === 'light',
      'theme-dark': this.theme === 'dark',
    };

    const channelInfo = getChannelByType(this.selectedChannel);
    const channelLabel = channelInfo?.label ?? this.selectedChannel;

    return (
      <Host class={hostClass}>
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
          {renderChannelIcon(this.selectedChannel, 16)}
          <span class="channel-label">{channelLabel}</span>
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
          <sp-communication-list
            selectedChannel={this.selectedChannel}
            compact={this.compact}
            theme={this.theme}
            onPreferenceChange={this.handleChannelSelected}
          />
        </sp-popover>
      </Host>
    );
  }
}
