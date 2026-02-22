import { Component, Prop, Event, EventEmitter, Host, h } from '@stencil/core';
import { ChannelInfo, CommunicationChannel, PreferenceChangeEventDetail } from '../sp-communication-preferences/types';
import { CHANNELS } from '../sp-communication-preferences/utils/channels';
import { renderChannelIcon, renderCheckIcon } from '../sp-communication-preferences/utils/icons';

/**
 * Dropdown panel displaying the 6 available communication channels.
 *
 * @part container - Root listbox container
 * @part channel-item - Individual channel row
 */
@Component({
  tag: 'sp-communication-list',
  styleUrl: 'sp-communication-list.css',
  shadow: true,
})
export class SpCommunicationList {
  /**
   * Full list of channels to display.
   * Defaults to the bundled CHANNELS array.
   */
  @Prop() channels: ChannelInfo[] = CHANNELS;

  /**
   * Currently selected channel type (COMM-04).
   * The matching item shows a checkmark and highlight.
   */
  @Prop() selectedChannel: CommunicationChannel = 'APPLICATION';

  /**
   * Theme override for standalone usage (COMM-05).
   * @type {'light' | 'dark' | 'auto'}
   */
  @Prop() theme: 'light' | 'dark' | 'auto' = 'auto';

  /**
   * Compact display mode — smaller padding and font (COMM-05).
   */
  @Prop() compact: boolean = false;

  /**
   * Emitted when the user selects a channel (COMM-03).
   */
  @Event() preferenceChange: EventEmitter<PreferenceChangeEventDetail>;

  private handleChannelClick(channel: ChannelInfo) {
    this.preferenceChange.emit({ channel: channel.type, label: channel.label });
  }

  private renderChannelItem(channel: ChannelInfo) {
    const isSelected = channel.type === this.selectedChannel;
    return (
      <div
        key={channel.type}
        class={{ 'channel-item': true, selected: isSelected }}
        part="channel-item"
        role="option"
        aria-selected={isSelected.toString()}
        onClick={() => this.handleChannelClick(channel)}
      >
        <span class="channel-icon">{renderChannelIcon(channel.type, 18)}</span>
        <span class="channel-label">{channel.label}</span>
        <span class="check-icon">{renderCheckIcon(16)}</span>
      </div>
    );
  }

  render() {
    const hostClass = {
      'theme-light': this.theme === 'light',
      'theme-dark': this.theme === 'dark',
    };

    return (
      <Host class={hostClass}>
        <div
          class={{ 'channel-list': true, compact: this.compact }}
          part="container"
          role="listbox"
          aria-label="Select communication channel"
        >
          {this.channels.map(channel => this.renderChannelItem(channel))}
        </div>
      </Host>
    );
  }
}
