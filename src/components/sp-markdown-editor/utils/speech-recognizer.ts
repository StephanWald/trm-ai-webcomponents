/**
 * SpeechRecognizer - Web Speech API wrapper
 *
 * Pattern 5: Feature detection with graceful degradation
 */
export class SpeechRecognizer {
  private recognition: any = null;
  private active: boolean = false;

  constructor() {
    // Feature detect SpeechRecognition (with webkit prefix)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  /**
   * Check if speech recognition is supported in this browser
   * @returns True if supported
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Start speech recognition
   * @param onResult Callback for recognition results
   * @param onError Optional error callback
   */
  start(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      if (onError) {
        onError('Speech recognition not supported in this browser');
      }
      return;
    }

    if (this.active) {
      return; // Already running
    }

    // Set up event handlers
    this.recognition.onresult = (event: any) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const transcript = lastResult[0].transcript;
      const isFinal = lastResult.isFinal;

      onResult(transcript, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      if (onError) {
        onError(event.error);
      }
      this.active = false;
    };

    this.recognition.onend = () => {
      this.active = false;
    };

    // Start recognition
    try {
      this.recognition.start();
      this.active = true;
    } catch (e) {
      if (onError) {
        onError((e as Error).message);
      }
      this.active = false;
    }
  }

  /**
   * Stop speech recognition
   */
  stop(): void {
    if (this.recognition && this.active) {
      this.recognition.stop();
      this.active = false;
    }
  }

  /**
   * Check if recognition is currently active
   * @returns True if listening
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Destroy the recognizer instance
   */
  destroy(): void {
    this.stop();
    if (this.recognition) {
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
      this.recognition = null;
    }
  }
}
