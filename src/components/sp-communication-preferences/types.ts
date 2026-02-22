/**
 * Communication channel type — one of the 6 supported channels (COMM-02).
 */
export type CommunicationChannel = 'APPLICATION' | 'EMAIL' | 'WHATSAPP' | 'PHONE' | 'MS_TEAMS' | 'GOOGLE_CHAT';

/**
 * Represents a single communication channel option.
 */
export interface ChannelInfo {
  /** Channel type identifier */
  type: CommunicationChannel;
  /** Human-readable display name (e.g. 'Application', 'Email') */
  label: string;
}

/**
 * Event payload emitted when the user selects a channel (COMM-03).
 */
export interface PreferenceChangeEventDetail {
  /** The selected channel type */
  channel: CommunicationChannel;
  /** Human-readable label of the selected channel */
  label: string;
}
