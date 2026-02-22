/**
 * Controls whether speech recognition uses the browser Web Speech API or an AI service.
 */
export type VoiceInputMode = 'browser' | 'ai';

/**
 * Visual state machine for the sp-voice-input-button component.
 * - idle: default resting state
 * - hover-cue: progress bar animating before showing language dropdown
 * - language-select: language dropdown is open
 * - listening: actively recording speech (red pulse)
 * - error: an error occurred (shake animation + message)
 */
export type VoiceInputState = 'idle' | 'hover-cue' | 'language-select' | 'listening' | 'error';

/**
 * Event payload emitted when voice recording begins (VOIC-04).
 */
export interface VoiceStartEventDetail {
  /** ISO 639-1 language code for the active input language */
  language: string;
  /** Whether browser API or AI service is being used */
  mode: VoiceInputMode;
}

/**
 * Event payload emitted when voice recording ends (VOIC-04).
 */
export interface VoiceStopEventDetail {
  /** ISO 639-1 language code for the active input language */
  language: string;
  /** Whether browser API or AI service was being used */
  mode: VoiceInputMode;
}

/**
 * Event payload emitted when a voice input error occurs (VOIC-04, VOIC-05).
 */
export interface VoiceErrorEventDetail {
  /** Human-readable error message */
  message: string;
  /** ISO 639-1 language code active at time of error */
  language: string;
  /** Whether browser API or AI service was being used */
  mode: VoiceInputMode;
}

/**
 * Event payload emitted when speech recognition produces a result (VOIC-04).
 */
export interface TranscriptionUpdateEventDetail {
  /** Recognized text (may be partial or final) */
  text: string;
  /** True when this is the final result for the utterance */
  isFinal: boolean;
  /** ISO 639-1 language code used for recognition */
  language: string;
  /** Whether browser API or AI service produced the result */
  mode: VoiceInputMode;
}
