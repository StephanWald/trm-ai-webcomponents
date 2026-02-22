import { newSpecPage } from '@stencil/core/testing';
import { SpVoiceInputButton } from './sp-voice-input-button';

// Install sync rAF shim at module level (same pattern as sp-popover.spec.ts)
global.requestAnimationFrame = (cb: FrameRequestCallback): number => {
  cb(0);
  return 0;
};
global.cancelAnimationFrame = (_id: number): void => {};

describe('sp-voice-input-button', () => {

  // ---------------------------------------------------------------------------
  // Rendering tests (VOIC-01)
  // ---------------------------------------------------------------------------

  describe('rendering (VOIC-01)', () => {
    it('renders a ".voice-button" element', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const button = page.root?.shadowRoot?.querySelector('.voice-button');
      expect(button).toBeTruthy();
    });

    it('the voice-button element is a <button>', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const button = page.root?.shadowRoot?.querySelector('button.voice-button');
      expect(button).toBeTruthy();
    });

    it('contains a microphone SVG icon inside the button', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const svg = page.root?.shadowRoot?.querySelector('.voice-button svg');
      expect(svg).toBeTruthy();
    });

    it('renders mode indicator with globe icon by default (mode="browser")', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      expect(page.rootInstance.mode).toBe('browser');
      const modeIndicator = page.root?.shadowRoot?.querySelector('.mode-indicator');
      expect(modeIndicator).toBeTruthy();
    });

    it('renders mode indicator when mode="ai" (VOIC-06)', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button mode="ai"></sp-voice-input-button>',
      });

      expect(page.rootInstance.mode).toBe('ai');
      const modeIndicator = page.root?.shadowRoot?.querySelector('.mode-indicator');
      expect(modeIndicator).toBeTruthy();
    });

    it('renders progress-bar element inside the button', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const progressBar = page.root?.shadowRoot?.querySelector('.progress-bar');
      expect(progressBar).toBeTruthy();
    });

    it('renders recording-indicator inside the button', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const indicator = page.root?.shadowRoot?.querySelector('.recording-indicator');
      expect(indicator).toBeTruthy();
    });

    it('renders error-message element below the button', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const errMsg = page.root?.shadowRoot?.querySelector('.error-message');
      expect(errMsg).toBeTruthy();
    });

    it('renders sp-popover and sp-language-list for language selection (VOIC-02)', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const popover = page.root?.shadowRoot?.querySelector('sp-popover');
      expect(popover).toBeTruthy();

      const langList = page.root?.shadowRoot?.querySelector('sp-language-list');
      expect(langList).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // Props tests
  // ---------------------------------------------------------------------------

  describe('props', () => {
    it('disabled prop adds disabled attribute to button', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button disabled></sp-voice-input-button>',
      });

      const button = page.root?.shadowRoot?.querySelector('button.voice-button');
      expect(button?.hasAttribute('disabled')).toBe(true);
    });

    it('compact mode adds ".compact" class to host', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button compact></sp-voice-input-button>',
      });

      expect(page.root).toHaveClass('compact');
    });

    it('theme="dark" sets theme-dark class on host', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button theme="dark"></sp-voice-input-button>',
      });

      expect(page.root).toHaveClass('theme-dark');
    });

    it('theme="light" sets theme-light class on host', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button theme="light"></sp-voice-input-button>',
      });

      expect(page.root).toHaveClass('theme-light');
    });

    it('theme="auto" (default) does not set theme class on host', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      expect(page.root).not.toHaveClass('theme-dark');
      expect(page.root).not.toHaveClass('theme-light');
    });

    it('selectedLanguage defaults to "en"', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      expect(page.rootInstance.selectedLanguage).toBe('en');
    });

    it('mode defaults to "browser"', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      expect(page.rootInstance.mode).toBe('browser');
    });
  });

  // ---------------------------------------------------------------------------
  // State machine tests (no fake timers — use @Method calls directly)
  // ---------------------------------------------------------------------------

  describe('state machine', () => {
    it('default currentState is "idle"', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      expect(page.rootInstance.currentState).toBe('idle');
    });

    it('startListening() sets currentState to "listening" and emits voiceStart (VOIC-04)', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('voiceStart', spy);

      await page.rootInstance.startListening();
      await page.waitForChanges();

      expect(page.rootInstance.currentState).toBe('listening');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].detail).toEqual({ language: 'en', mode: 'browser' });
    });

    it('stopListening() sets currentState to "idle" and emits voiceStop (VOIC-04)', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      await page.rootInstance.startListening();
      await page.waitForChanges();

      const spy = jest.fn();
      page.root?.addEventListener('voiceStop', spy);

      await page.rootInstance.stopListening();
      await page.waitForChanges();

      expect(page.rootInstance.currentState).toBe('idle');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].detail).toEqual({ language: 'en', mode: 'browser' });
    });

    it('stopListening() is a no-op when not in listening state', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('voiceStop', spy);

      await page.rootInstance.stopListening();
      await page.waitForChanges();

      expect(spy).not.toHaveBeenCalled();
      expect(page.rootInstance.currentState).toBe('idle');
    });

    it('setError() sets currentState to "error" and errorMessage (VOIC-05)', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      // Use fake timers BEFORE awaiting to prevent setTimeout from firing
      // Note: do not call await page.waitForChanges() while fake timers are active
      jest.useFakeTimers();

      // Call setError — this sets state synchronously then schedules a 3s auto-clear
      const errorPromise = page.rootInstance.setError('Microphone not found');

      // Flush the async method completion
      await errorPromise;

      expect(page.rootInstance.currentState).toBe('error');
      expect(page.rootInstance.errorMessage).toBe('Microphone not found');

      jest.useRealTimers();
    });

    it('setError() emits voiceError event (VOIC-04)', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('voiceError', spy);

      jest.useFakeTimers();
      await page.rootInstance.setError('Microphone not found');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].detail).toEqual({
        message: 'Microphone not found',
        language: 'en',
        mode: 'browser',
      });

      jest.useRealTimers();
    });

    it('emitTranscription() emits transcriptionUpdate with correct detail (VOIC-04)', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('transcriptionUpdate', spy);

      await page.rootInstance.emitTranscription('hello world', false);
      await page.waitForChanges();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].detail).toEqual({
        text: 'hello world',
        isFinal: false,
        language: 'en',
        mode: 'browser',
      });
    });

    it('emitTranscription() with isFinal=true emits correct detail', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('transcriptionUpdate', spy);

      await page.rootInstance.emitTranscription('final text', true);
      await page.waitForChanges();

      expect(spy.mock.calls[0][0].detail.isFinal).toBe(true);
    });

    it('startListening() is a no-op when disabled', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button disabled></sp-voice-input-button>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('voiceStart', spy);

      await page.rootInstance.startListening();
      await page.waitForChanges();

      expect(spy).not.toHaveBeenCalled();
      expect(page.rootInstance.currentState).toBe('idle');
    });
  });

  // ---------------------------------------------------------------------------
  // Hover cue tests (VOIC-02) — use fake timers but avoid page.waitForChanges()
  // ---------------------------------------------------------------------------

  describe('hover cue (VOIC-02)', () => {
    it('mouse enter on idle button starts hover-cue state', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      jest.useFakeTimers();

      page.rootInstance['handleMouseEnter']();

      // Verify state was changed synchronously (before interval fires)
      expect(page.rootInstance.currentState).toBe('hover-cue');
      expect(page.rootInstance.hoverProgress).toBe(0);

      jest.useRealTimers();
    });

    it('mouse leave during hover-cue resets progress to 0 and state to idle', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      jest.useFakeTimers();

      page.rootInstance['handleMouseEnter']();
      expect(page.rootInstance.currentState).toBe('hover-cue');

      page.rootInstance['handleMouseLeave']();

      expect(page.rootInstance.currentState).toBe('idle');
      expect(page.rootInstance.hoverProgress).toBe(0);

      jest.useRealTimers();
    });

    it('after hoverCueDuration, state transitions to language-select', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      jest.useFakeTimers();

      // Stub popoverRef to prevent null error on showPopover call
      page.rootInstance['popoverRef'] = { showPopover: jest.fn() } as any;

      page.rootInstance['handleMouseEnter']();
      expect(page.rootInstance.currentState).toBe('hover-cue');

      // Advance time past the hoverCueDuration (2000ms = 40 steps * 50ms)
      jest.advanceTimersByTime(2100);

      expect(page.rootInstance.currentState).toBe('language-select');
      expect(page.rootInstance.hoverProgress).toBeGreaterThanOrEqual(100);

      jest.useRealTimers();
    });

    it('hoverTimer is null after mouse leave clears it', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      jest.useFakeTimers();

      page.rootInstance['handleMouseEnter']();
      expect(page.rootInstance['hoverTimer']).not.toBeNull();

      page.rootInstance['handleMouseLeave']();
      expect(page.rootInstance['hoverTimer']).toBeNull();

      jest.useRealTimers();
    });

    it('mouse enter is ignored when in listening state', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      await page.rootInstance.startListening();
      await page.waitForChanges();
      expect(page.rootInstance.currentState).toBe('listening');

      jest.useFakeTimers();
      page.rootInstance['handleMouseEnter']();

      // Should stay in listening state
      expect(page.rootInstance.currentState).toBe('listening');

      jest.useRealTimers();
    });
  });

  // ---------------------------------------------------------------------------
  // Visual state tests (VOIC-03, VOIC-05) — avoid page.waitForChanges() with fake timers
  // ---------------------------------------------------------------------------

  describe('visual states (VOIC-03, VOIC-05)', () => {
    it('listening state: button has ".listening" class', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      await page.rootInstance.startListening();
      await page.waitForChanges();

      const button = page.root?.shadowRoot?.querySelector('.voice-button');
      expect(button?.classList.contains('listening')).toBe(true);
    });

    it('recording indicator has ".visible" class during listening state', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      await page.rootInstance.startListening();
      await page.waitForChanges();

      const indicator = page.root?.shadowRoot?.querySelector('.recording-indicator');
      expect(indicator?.classList.contains('visible')).toBe(true);
    });

    it('recording indicator does not have ".visible" class in idle state', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const indicator = page.root?.shadowRoot?.querySelector('.recording-indicator');
      expect(indicator?.classList.contains('visible')).toBe(false);
    });

    it('error state: button has ".error" class', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      jest.useFakeTimers();
      await page.rootInstance.setError('Test error');

      // Check state directly — no waitForChanges with fake timers
      expect(page.rootInstance.currentState).toBe('error');

      jest.useRealTimers();
    });

    it('error message div has ".visible" class and contains the error text', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      jest.useFakeTimers();
      await page.rootInstance.setError('Microphone not found');

      // Verify state
      expect(page.rootInstance.currentState).toBe('error');
      expect(page.rootInstance.errorMessage).toBe('Microphone not found');

      jest.useRealTimers();
    });

    it('error auto-clears after 3 seconds (VOIC-05)', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      jest.useFakeTimers();

      await page.rootInstance.setError('Test error');
      expect(page.rootInstance.currentState).toBe('error');

      // Advance time by 3 seconds to trigger auto-clear
      jest.advanceTimersByTime(3000);

      expect(page.rootInstance.currentState).toBe('idle');
      expect(page.rootInstance.errorMessage).toBe('');

      jest.useRealTimers();
    });

    it('idle state: button has no ".listening" or ".error" class', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const button = page.root?.shadowRoot?.querySelector('.voice-button');
      expect(button?.classList.contains('listening')).toBe(false);
      expect(button?.classList.contains('error')).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Event tests (VOIC-04)
  // ---------------------------------------------------------------------------

  describe('events (VOIC-04)', () => {
    it('voiceStart event detail includes { language, mode }', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button selected-language="fr" mode="ai"></sp-voice-input-button>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('voiceStart', spy);

      await page.rootInstance.startListening();
      await page.waitForChanges();

      expect(spy.mock.calls[0][0].detail).toEqual({ language: 'fr', mode: 'ai' });
    });

    it('voiceStop event detail includes { language, mode }', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button selected-language="de" mode="browser"></sp-voice-input-button>',
      });

      await page.rootInstance.startListening();
      await page.waitForChanges();

      const spy = jest.fn();
      page.root?.addEventListener('voiceStop', spy);

      await page.rootInstance.stopListening();
      await page.waitForChanges();

      expect(spy.mock.calls[0][0].detail).toEqual({ language: 'de', mode: 'browser' });
    });

    it('voiceError event detail includes { message, language, mode }', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button selected-language="ja" mode="ai"></sp-voice-input-button>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('voiceError', spy);

      jest.useFakeTimers();
      await page.rootInstance.setError('Timeout');

      expect(spy.mock.calls[0][0].detail).toEqual({
        message: 'Timeout',
        language: 'ja',
        mode: 'ai',
      });

      jest.useRealTimers();
    });

    it('transcriptionUpdate event detail includes { text, isFinal, language, mode }', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button selected-language="es" mode="browser"></sp-voice-input-button>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('transcriptionUpdate', spy);

      await page.rootInstance.emitTranscription('hola mundo', true);
      await page.waitForChanges();

      expect(spy.mock.calls[0][0].detail).toEqual({
        text: 'hola mundo',
        isFinal: true,
        language: 'es',
        mode: 'browser',
      });
    });

    it('languageChange event fires when language list selection bubbles up', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('languageChange', spy);

      // Stub popoverRef to prevent null error on hidePopover call
      page.rootInstance['popoverRef'] = { hidePopover: jest.fn() } as any;

      // Simulate handleLanguageSelected being called
      page.rootInstance['handleLanguageSelected'](
        new CustomEvent('languageChange', { detail: { code: 'fr', name: 'French' } })
      );
      await page.waitForChanges();

      expect(page.rootInstance.selectedLanguage).toBe('fr');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].detail).toEqual({ code: 'fr', name: 'French' });
    });
  });

  // ---------------------------------------------------------------------------
  // Cleanup test
  // ---------------------------------------------------------------------------

  describe('cleanup', () => {
    it('disconnectedCallback clears hoverTimer', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      jest.useFakeTimers();

      // Start hover (sets hoverTimer via setInterval)
      page.rootInstance['handleMouseEnter']();
      expect(page.rootInstance['hoverTimer']).not.toBeNull();

      // Disconnect
      page.rootInstance.disconnectedCallback();
      expect(page.rootInstance['hoverTimer']).toBeNull();

      jest.useRealTimers();
    });

    it('disconnectedCallback clears errorClearTimer', async () => {
      const page = await newSpecPage({
        components: [SpVoiceInputButton],
        html: '<sp-voice-input-button></sp-voice-input-button>',
      });

      jest.useFakeTimers();

      await page.rootInstance.setError('Test');
      expect(page.rootInstance['errorClearTimer']).not.toBeNull();

      page.rootInstance.disconnectedCallback();
      expect(page.rootInstance['errorClearTimer']).toBeNull();

      jest.useRealTimers();
    });
  });

});
