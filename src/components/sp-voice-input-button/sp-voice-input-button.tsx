import { Component, Prop, State, Event, EventEmitter, Method, Element, Host, h } from '@stencil/core';
import { VoiceInputMode, VoiceInputState, VoiceStartEventDetail, VoiceStopEventDetail, VoiceErrorEventDetail, TranscriptionUpdateEventDetail } from './types';
import { LanguageChangeEventDetail } from '../sp-language-selector/types';
import { getBrowserPreferredLanguages } from '../sp-language-selector/utils/languages';
import { renderMicrophoneIcon, renderGlobeIcon, renderRobotIcon } from '../sp-language-selector/utils/icons';

/**
 * A circular 44px microphone button that triggers voice input.
 *
 * Hovering starts a 2-second progress bar cue then opens a language dropdown.
 * Listening state shows a red pulse animation and a blinking recording indicator.
 * Error state triggers a shake animation with an error message display.
 * A mode indicator badge shows globe (browser) or robot (AI) icon.
 *
 * @part button - The main circular button element
 * @part progress-bar - The hover-cue progress bar container
 * @part recording-indicator - The blinking red dot during listening
 * @part mode-indicator - The mode badge (globe or robot)
 * @part error-message - The error message text below the button
 */
@Component({
  tag: 'sp-voice-input-button',
  styleUrl: 'sp-voice-input-button.css',
  shadow: true,
})
export class SpVoiceInputButton {
  /** Host element reference */
  @Element() el: HTMLElement;

  /**
   * Controls whether speech recognition uses the browser Web Speech API or an AI service (VOIC-06).
   * @type {'browser' | 'ai'}
   */
  @Prop() mode: VoiceInputMode = 'browser';

  /**
   * ISO 639-1 language code for voice input (VOIC-02).
   * Mutable so the component can update it after language selection.
   */
  @Prop({ mutable: true, reflect: true }) selectedLanguage: string = 'en';

  /**
   * Disables the button — prevents all interaction.
   */
  @Prop() disabled: boolean = false;

  /**
   * Compact display mode — smaller button size.
   */
  @Prop() compact: boolean = false;

  /**
   * Theme override for standalone usage.
   * @type {'light' | 'dark' | 'auto'}
   */
  @Prop() theme: 'light' | 'dark' | 'auto' = 'auto';

  /**
   * Milliseconds for the hover progress bar before the language dropdown appears (VOIC-02).
   */
  @Prop() hoverCueDuration: number = 2000;

  // ---- Events (VOIC-04) ----

  /** Emitted when listening begins */
  @Event() voiceStart: EventEmitter<VoiceStartEventDetail>;

  /** Emitted when listening ends */
  @Event() voiceStop: EventEmitter<VoiceStopEventDetail>;

  /** Emitted when a voice input error occurs */
  @Event() voiceError: EventEmitter<VoiceErrorEventDetail>;

  /** Emitted when speech recognition produces a result */
  @Event() transcriptionUpdate: EventEmitter<TranscriptionUpdateEventDetail>;

  /** Emitted when the user selects a language from the dropdown */
  @Event() languageChange: EventEmitter<LanguageChangeEventDetail>;

  // ---- Internal state ----

  /** Current visual state in the state machine */
  @State() currentState: VoiceInputState = 'idle';

  /** Current error message text */
  @State() errorMessage: string = '';

  /** Progress 0–100 during hover-cue animation */
  @State() hoverProgress: number = 0;

  // ---- Private members ----

  /** Interval handle for hover progress animation */
  private hoverTimer: ReturnType<typeof setInterval> | null = null;

  /** Reference to the language popover */
  private popoverRef: HTMLSpPopoverElement | null = null;

  /** Timer for auto-clearing error state after 3 seconds */
  private errorClearTimer: ReturnType<typeof setTimeout> | null = null;

  /** Browser-preferred language codes, computed once on load */
  private preferredLanguages: string[] = [];

  componentWillLoad() {
    this.preferredLanguages = getBrowserPreferredLanguages();
  }

  disconnectedCallback() {
    this.clearHoverTimer();
    this.clearErrorTimer();
  }

  // ---- Public methods (called by parent to drive state machine) ----

  /**
   * Transition to listening state and emit voiceStart (VOIC-03).
   */
  @Method()
  async startListening(): Promise<void> {
    if (this.disabled) return;
    this.clearHoverTimer();
    this.clearErrorTimer();
    this.hoverProgress = 0;
    this.currentState = 'listening';
    this.voiceStart.emit({ language: this.selectedLanguage, mode: this.mode });
  }

  /**
   * Transition to idle state and emit voiceStop.
   */
  @Method()
  async stopListening(): Promise<void> {
    if (this.currentState !== 'listening') return;
    this.currentState = 'idle';
    this.voiceStop.emit({ language: this.selectedLanguage, mode: this.mode });
  }

  /**
   * Transition to error state with a message and emit voiceError.
   * Automatically clears back to idle after 3 seconds (VOIC-05).
   */
  @Method()
  async setError(message: string): Promise<void> {
    this.clearHoverTimer();
    this.clearErrorTimer();
    this.hoverProgress = 0;
    this.errorMessage = message;
    this.currentState = 'error';
    this.voiceError.emit({ message, language: this.selectedLanguage, mode: this.mode });
    // Auto-clear error after 3 seconds
    this.errorClearTimer = setTimeout(() => {
      this.errorClearTimer = null;
      if (this.currentState === 'error') {
        this.currentState = 'idle';
        this.errorMessage = '';
      }
    }, 3000);
  }

  /**
   * Emit a transcription result event (called by parent during active listening).
   */
  @Method()
  async emitTranscription(text: string, isFinal: boolean): Promise<void> {
    this.transcriptionUpdate.emit({ text, isFinal, language: this.selectedLanguage, mode: this.mode });
  }

  // ---- Private helpers ----

  private clearHoverTimer() {
    if (this.hoverTimer !== null) {
      clearInterval(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  private clearErrorTimer() {
    if (this.errorClearTimer !== null) {
      clearTimeout(this.errorClearTimer);
      this.errorClearTimer = null;
    }
  }

  // ---- Event handlers ----

  private handleMouseEnter = () => {
    if (this.disabled || this.currentState === 'listening' || this.currentState === 'error') return;
    if (this.currentState !== 'idle') return;

    this.currentState = 'hover-cue';
    this.hoverProgress = 0;

    const stepMs = 50;
    const totalSteps = this.hoverCueDuration / stepMs;
    const increment = 100 / totalSteps;

    this.hoverTimer = setInterval(() => {
      this.hoverProgress = Math.min(100, this.hoverProgress + increment);
      if (this.hoverProgress >= 100) {
        this.clearHoverTimer();
        this.currentState = 'language-select';
        this.popoverRef?.showPopover();
      }
    }, stepMs);
  };

  private handleMouseLeave = () => {
    if (this.currentState === 'hover-cue') {
      this.clearHoverTimer();
      this.hoverProgress = 0;
      this.currentState = 'idle';
    }
  };

  private handleButtonClick = () => {
    if (this.disabled) return;

    if (this.currentState === 'listening') {
      // Stop listening
      this.currentState = 'idle';
      this.voiceStop.emit({ language: this.selectedLanguage, mode: this.mode });
    } else if (this.currentState === 'error') {
      // Reset to idle
      this.clearErrorTimer();
      this.currentState = 'idle';
      this.errorMessage = '';
    } else {
      // idle or language-select — start listening
      this.clearHoverTimer();
      this.hoverProgress = 0;
      this.popoverRef?.hidePopover();
      this.currentState = 'listening';
      this.voiceStart.emit({ language: this.selectedLanguage, mode: this.mode });
    }
  };

  private handleLanguageSelected = (event: CustomEvent<LanguageChangeEventDetail>) => {
    this.selectedLanguage = event.detail.code;
    this.popoverRef?.hidePopover();
    this.currentState = 'idle';
    this.languageChange.emit(event.detail);
  };

  private handlePopoverClose = () => {
    if (this.currentState === 'language-select') {
      this.currentState = 'idle';
    }
  };

  render() {
    const isListening = this.currentState === 'listening';
    const isError = this.currentState === 'error';
    const isHoverCue = this.currentState === 'hover-cue';

    const hostClass = {
      'theme-light': this.theme === 'light',
      'theme-dark': this.theme === 'dark',
      'compact': this.compact,
    };

    const buttonClass = {
      'voice-button': true,
      'listening': isListening,
      'error': isError,
      'hover-cue': isHoverCue,
      'disabled': this.disabled,
    };

    return (
      <Host class={hostClass}>
        {/* Main microphone button (VOIC-01) */}
        <button
          class={buttonClass}
          part="button"
          disabled={this.disabled}
          aria-label={isListening ? 'Stop recording' : 'Start voice input'}
          aria-pressed={isListening.toString()}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          onClick={this.handleButtonClick}
        >
          {renderMicrophoneIcon(20)}

          {/* Progress bar overlay — hover cue animation (VOIC-02) */}
          <div class={{ 'progress-bar': true, 'visible': isHoverCue }} part="progress-bar">
            <div class="progress-fill" style={{ width: `${this.hoverProgress}%` }} />
          </div>

          {/* Blinking red recording indicator — listening state only (VOIC-03) */}
          <div class={{ 'recording-indicator': true, 'visible': isListening }} part="recording-indicator" />

          {/* Mode indicator badge — globe (browser) or robot (AI) (VOIC-06) */}
          <div class="mode-indicator" part="mode-indicator">
            {this.mode === 'ai' ? renderRobotIcon(12) : renderGlobeIcon(12)}
          </div>
        </button>

        {/* Error message below button (VOIC-05) */}
        <div class={{ 'error-message': true, 'visible': isError }} part="error-message">
          {this.errorMessage}
        </div>

        {/* Language dropdown via sp-popover (VOIC-02) */}
        <sp-popover
          ref={el => (this.popoverRef = el as HTMLSpPopoverElement)}
          placement="bottom-start"
          close-on-click
          close-on-escape
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
