import { h } from '@stencil/core';
import { CommunicationChannel } from '../types';
export { renderChevronDownIcon, renderCheckIcon } from '../../sp-language-selector/utils/icons';

/**
 * Renders a Tabler layout-grid icon as inline SVG.
 * Used for the APPLICATION channel.
 */
export function renderAppIcon(size: number = 18) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

/**
 * Renders a Tabler mail icon as inline SVG.
 * Used for the EMAIL channel.
 */
export function renderEmailIcon(size: number = 18) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3 7 12 13 21 7" />
    </svg>
  );
}

/**
 * Renders a Tabler brand-whatsapp icon as inline SVG.
 * Used for the WHATSAPP channel.
 */
export function renderWhatsappIcon(size: number = 18) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a0.5 0.5 0 0 0 1 0V9a0.5 0.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a0.5 0.5 0 0 0 0-1H15a0.5 0.5 0 0 0 0 1" />
    </svg>
  );
}

/**
 * Renders a Tabler phone icon as inline SVG.
 * Used for the PHONE channel.
 */
export function renderPhoneIcon(size: number = 18) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

/**
 * Renders a Tabler brand-teams icon as inline SVG.
 * Used for the MS_TEAMS channel.
 */
export function renderMsTeamsIcon(size: number = 18) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7h10v10H3z" />
      <path d="M13 7h8v8h-8" />
      <path d="M7 7V3h4" />
      <path d="M17 7V4h3" />
    </svg>
  );
}

/**
 * Renders a Tabler message-circle icon as inline SVG.
 * Used for the GOOGLE_CHAT channel.
 */
export function renderGoogleChatIcon(size: number = 18) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21a9 9 0 1 0-9-9c0 1.52 .38 2.95 1.05 4.2L3 21l4.8-1.05A9 9 0 0 0 12 21z" />
    </svg>
  );
}

/**
 * Dispatcher that returns the correct icon SVG for the given channel type.
 * Centralises the icon-to-channel mapping used by both components.
 */
export function renderChannelIcon(channel: CommunicationChannel, size: number = 18) {
  switch (channel) {
    case 'APPLICATION':
      return renderAppIcon(size);
    case 'EMAIL':
      return renderEmailIcon(size);
    case 'WHATSAPP':
      return renderWhatsappIcon(size);
    case 'PHONE':
      return renderPhoneIcon(size);
    case 'MS_TEAMS':
      return renderMsTeamsIcon(size);
    case 'GOOGLE_CHAT':
      return renderGoogleChatIcon(size);
  }
}
