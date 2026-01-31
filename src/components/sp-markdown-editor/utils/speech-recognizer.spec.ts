import { SpeechRecognizer } from './speech-recognizer';

describe('SpeechRecognizer', () => {
  let originalSpeechRecognition: any;
  let originalWebkitSpeechRecognition: any;

  beforeEach(() => {
    originalSpeechRecognition = (window as any).SpeechRecognition;
    originalWebkitSpeechRecognition = (window as any).webkitSpeechRecognition;
  });

  afterEach(() => {
    (window as any).SpeechRecognition = originalSpeechRecognition;
    (window as any).webkitSpeechRecognition = originalWebkitSpeechRecognition;
  });

  describe('isSupported', () => {
    it('returns true when SpeechRecognition API available', () => {
      (window as any).SpeechRecognition = jest.fn().mockImplementation(() => ({
        continuous: false,
        interimResults: false,
        lang: '',
      }));

      const recognizer = new SpeechRecognizer();
      expect(recognizer.isSupported()).toBe(true);
    });

    it('returns true when webkitSpeechRecognition API available', () => {
      (window as any).SpeechRecognition = undefined;
      (window as any).webkitSpeechRecognition = jest.fn().mockImplementation(() => ({
        continuous: false,
        interimResults: false,
        lang: '',
      }));

      const recognizer = new SpeechRecognizer();
      expect(recognizer.isSupported()).toBe(true);
    });

    it('returns false when API unavailable', () => {
      (window as any).SpeechRecognition = undefined;
      (window as any).webkitSpeechRecognition = undefined;

      const recognizer = new SpeechRecognizer();
      expect(recognizer.isSupported()).toBe(false);
    });
  });

  describe('start', () => {
    let mockRecognition: any;
    let startSpy: jest.Mock;

    beforeEach(() => {
      startSpy = jest.fn();
      mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: '',
        start: startSpy,
        stop: jest.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };

      (window as any).SpeechRecognition = jest.fn(() => mockRecognition);
    });

    it('calls recognition.start()', () => {
      const recognizer = new SpeechRecognizer();
      const onResult = jest.fn();

      recognizer.start(onResult);

      expect(startSpy).toHaveBeenCalled();
    });

    it('sets recognition to active state', () => {
      const recognizer = new SpeechRecognizer();
      const onResult = jest.fn();

      recognizer.start(onResult);

      expect(recognizer.isActive()).toBe(true);
    });

    it('calls onResult callback with transcript', () => {
      const recognizer = new SpeechRecognizer();
      const onResult = jest.fn();

      recognizer.start(onResult);

      // Simulate recognition result
      const mockEvent = {
        results: [
          Object.assign(
            [{ transcript: 'Hello world', confidence: 0.9 }],
            { isFinal: true }
          )
        ],
      };

      mockRecognition.onresult(mockEvent);

      expect(onResult).toHaveBeenCalledWith('Hello world', true);
    });

    it('calls onError callback on error', () => {
      const recognizer = new SpeechRecognizer();
      const onResult = jest.fn();
      const onError = jest.fn();

      recognizer.start(onResult, onError);

      // Simulate error
      mockRecognition.onerror({ error: 'no-speech' });

      expect(onError).toHaveBeenCalledWith('no-speech');
    });

    it('sets active to false on error', () => {
      const recognizer = new SpeechRecognizer();
      const onResult = jest.fn();
      const onError = jest.fn();

      recognizer.start(onResult, onError);
      expect(recognizer.isActive()).toBe(true);

      mockRecognition.onerror({ error: 'no-speech' });

      expect(recognizer.isActive()).toBe(false);
    });

    it('does nothing if already active', () => {
      const recognizer = new SpeechRecognizer();
      const onResult = jest.fn();

      recognizer.start(onResult);
      startSpy.mockClear();

      recognizer.start(onResult); // Second call

      expect(startSpy).not.toHaveBeenCalled();
    });

    it('calls onError if API not supported', () => {
      (window as any).SpeechRecognition = undefined;
      (window as any).webkitSpeechRecognition = undefined;

      const recognizer = new SpeechRecognizer();
      const onResult = jest.fn();
      const onError = jest.fn();

      recognizer.start(onResult, onError);

      expect(onError).toHaveBeenCalledWith('Speech recognition not supported in this browser');
    });

    it('handles start errors gracefully', () => {
      startSpy.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const recognizer = new SpeechRecognizer();
      const onResult = jest.fn();
      const onError = jest.fn();

      recognizer.start(onResult, onError);

      expect(onError).toHaveBeenCalledWith('Permission denied');
      expect(recognizer.isActive()).toBe(false);
    });

    it('sets active to false on onend event', () => {
      const recognizer = new SpeechRecognizer();
      const onResult = jest.fn();

      recognizer.start(onResult);
      expect(recognizer.isActive()).toBe(true);

      mockRecognition.onend();

      expect(recognizer.isActive()).toBe(false);
    });
  });

  describe('stop', () => {
    let mockRecognition: any;
    let stopSpy: jest.Mock;

    beforeEach(() => {
      stopSpy = jest.fn();
      mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: '',
        start: jest.fn(),
        stop: stopSpy,
        onresult: null,
        onerror: null,
        onend: null,
      };

      (window as any).SpeechRecognition = jest.fn(() => mockRecognition);
    });

    it('calls recognition.stop()', () => {
      const recognizer = new SpeechRecognizer();
      const onResult = jest.fn();

      recognizer.start(onResult);
      recognizer.stop();

      expect(stopSpy).toHaveBeenCalled();
    });

    it('sets active to false', () => {
      const recognizer = new SpeechRecognizer();
      const onResult = jest.fn();

      recognizer.start(onResult);
      expect(recognizer.isActive()).toBe(true);

      recognizer.stop();

      expect(recognizer.isActive()).toBe(false);
    });

    it('does nothing if not active', () => {
      const recognizer = new SpeechRecognizer();
      recognizer.stop();

      expect(stopSpy).not.toHaveBeenCalled();
    });
  });

  describe('isActive', () => {
    let mockRecognition: any;

    beforeEach(() => {
      mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: '',
        start: jest.fn(),
        stop: jest.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };

      (window as any).SpeechRecognition = jest.fn(() => mockRecognition);
    });

    it('returns false initially', () => {
      const recognizer = new SpeechRecognizer();
      expect(recognizer.isActive()).toBe(false);
    });

    it('returns true when listening', () => {
      const recognizer = new SpeechRecognizer();
      recognizer.start(jest.fn());

      expect(recognizer.isActive()).toBe(true);
    });

    it('returns false after stop', () => {
      const recognizer = new SpeechRecognizer();
      recognizer.start(jest.fn());
      recognizer.stop();

      expect(recognizer.isActive()).toBe(false);
    });
  });

  describe('destroy', () => {
    let mockRecognition: any;
    let stopSpy: jest.Mock;

    beforeEach(() => {
      stopSpy = jest.fn();
      mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: '',
        start: jest.fn(),
        stop: stopSpy,
        onresult: null,
        onerror: null,
        onend: null,
      };

      (window as any).SpeechRecognition = jest.fn(() => mockRecognition);
    });

    it('stops recognition', () => {
      const recognizer = new SpeechRecognizer();
      recognizer.start(jest.fn());

      recognizer.destroy();

      expect(stopSpy).toHaveBeenCalled();
    });

    it('nullifies recognition instance', () => {
      const recognizer = new SpeechRecognizer();
      recognizer.start(jest.fn());

      recognizer.destroy();

      // After destroy, isSupported should still return false if called again
      expect(recognizer.isActive()).toBe(false);
    });

    it('clears event handlers', () => {
      const recognizer = new SpeechRecognizer();
      recognizer.start(jest.fn());

      recognizer.destroy();

      expect(mockRecognition.onresult).toBeNull();
      expect(mockRecognition.onerror).toBeNull();
      expect(mockRecognition.onend).toBeNull();
    });

    it('handles destroy when not active', () => {
      const recognizer = new SpeechRecognizer();

      expect(() => recognizer.destroy()).not.toThrow();
    });
  });
});
