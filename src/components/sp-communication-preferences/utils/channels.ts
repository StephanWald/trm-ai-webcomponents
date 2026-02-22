import { ChannelInfo, CommunicationChannel } from '../types';

/**
 * All 6 supported communication channels in display order (COMM-02).
 */
export const CHANNELS: ChannelInfo[] = [
  { type: 'APPLICATION', label: 'Application' },
  { type: 'EMAIL', label: 'Email' },
  { type: 'WHATSAPP', label: 'WhatsApp' },
  { type: 'PHONE', label: 'Phone' },
  { type: 'MS_TEAMS', label: 'MS Teams' },
  { type: 'GOOGLE_CHAT', label: 'Google Chat' },
];

/**
 * Look up a channel by its type identifier.
 * Returns undefined if the type is not in the CHANNELS array.
 */
export function getChannelByType(type: CommunicationChannel): ChannelInfo | undefined {
  return CHANNELS.find(c => c.type === type);
}
