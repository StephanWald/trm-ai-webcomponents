import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

// Helper: check current state of voice button via aria-label
async function getButtonAriaLabel(page: any): Promise<string | null> {
  return page.evaluate(() => {
    const el = document.querySelector('#voiceDemo');
    const button = el?.shadowRoot?.querySelector('.voice-button');
    return button?.getAttribute('aria-label') || null;
  });
}

// Helper: call a method on the voiceDemo element
async function callVoiceMethod(page: any, method: string, ...args: any[]): Promise<void> {
  await page.evaluate(([m, a]: [string, any[]]) => {
    const el = document.querySelector('#voiceDemo') as any;
    if (el && typeof el[m] === 'function') {
      el[m](...a);
    }
  }, [method, args]);
  await page.waitForTimeout(200);
}

test.describe('sp-voice-input-button E2E', () => {

  // ---------------------------------------------------------------------------
  // 1. Renders circular button with microphone icon
  // ---------------------------------------------------------------------------
  test('renders circular button with microphone icon', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const hasVoiceButton = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo');
      return !!el?.shadowRoot?.querySelector('.voice-button');
    });
    expect(hasVoiceButton).toBe(true);

    // Check microphone SVG is present
    const hasMicIcon = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo');
      return !!el?.shadowRoot?.querySelector('.voice-button svg');
    });
    expect(hasMicIcon).toBe(true);

    // Check aria-label indicates voice input
    const ariaLabel = await getButtonAriaLabel(page);
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('voice input');
  });

  // ---------------------------------------------------------------------------
  // 2. Button shows mode indicator
  // ---------------------------------------------------------------------------
  test('shows globe mode indicator for browser mode (default)', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const hasModeIndicator = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo');
      return !!el?.shadowRoot?.querySelector('.mode-indicator');
    });
    expect(hasModeIndicator).toBe(true);

    // Default mode is 'browser'
    const mode = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo') as any;
      return el?.mode;
    });
    expect(mode).toBe('browser');
  });

  test('shows robot mode indicator when mode="ai"', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const hasModeIndicator = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemoAI');
      return !!el?.shadowRoot?.querySelector('.mode-indicator');
    });
    expect(hasModeIndicator).toBe(true);

    const mode = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemoAI') as any;
      return el?.mode;
    });
    expect(mode).toBe('ai');
  });

  // ---------------------------------------------------------------------------
  // 3. startListening() changes button appearance to listening state
  // ---------------------------------------------------------------------------
  test('calling startListening() adds listening class to button', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Initially no listening class
    const initialListening = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo');
      const button = el?.shadowRoot?.querySelector('.voice-button');
      return button?.classList.contains('listening') || false;
    });
    expect(initialListening).toBe(false);

    // Call startListening via evaluate
    await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo') as any;
      if (el && typeof el.startListening === 'function') {
        el.startListening();
      }
    });
    await page.waitForTimeout(300);

    const isListening = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo');
      const button = el?.shadowRoot?.querySelector('.voice-button');
      return button?.classList.contains('listening') || false;
    });
    expect(isListening).toBe(true);

    // Also verify aria-label changed
    const ariaLabel = await getButtonAriaLabel(page);
    expect(ariaLabel).toContain('Stop recording');

    // Cleanup: stop listening
    await callVoiceMethod(page, 'stopListening');
  });

  // ---------------------------------------------------------------------------
  // 4. setError() shows error message below button
  // ---------------------------------------------------------------------------
  test('calling setError() shows error message with .visible class', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const errorMsg = 'Microphone not found';

    await page.evaluate((msg: string) => {
      const el = document.querySelector('#voiceDemo') as any;
      if (el && typeof el.setError === 'function') {
        el.setError(msg);
      }
    }, errorMsg);
    await page.waitForTimeout(300);

    const errorVisible = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo');
      const errDiv = el?.shadowRoot?.querySelector('.error-message');
      return errDiv?.classList.contains('visible') || false;
    });
    expect(errorVisible).toBe(true);

    const errorText = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo');
      return el?.shadowRoot?.querySelector('.error-message')?.textContent;
    });
    expect(errorText).toBe('Microphone not found');

    const buttonHasError = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo');
      const button = el?.shadowRoot?.querySelector('.voice-button');
      return button?.classList.contains('error') || false;
    });
    expect(buttonHasError).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 5. stopListening() returns button to idle state
  // ---------------------------------------------------------------------------
  test('calling stopListening() after startListening() returns to idle state', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Start listening
    await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo') as any;
      if (el && typeof el.startListening === 'function') {
        el.startListening();
      }
    });
    await page.waitForTimeout(200);

    // Verify listening
    const isListening = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo');
      return el?.shadowRoot?.querySelector('.voice-button')?.classList.contains('listening') || false;
    });
    expect(isListening).toBe(true);

    // Stop listening
    await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo') as any;
      if (el && typeof el.stopListening === 'function') {
        el.stopListening();
      }
    });
    await page.waitForTimeout(200);

    // Verify idle
    const stillListening = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemo');
      return el?.shadowRoot?.querySelector('.voice-button')?.classList.contains('listening') || false;
    });
    expect(stillListening).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 6. voiceStart event fires when startListening() is called
  // ---------------------------------------------------------------------------
  test('voiceStart event fires when startListening() is called', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const eventFired = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const el = document.querySelector('#voiceDemo') as any;
        if (!el) return resolve(false);

        el.addEventListener('voiceStart', () => resolve(true));
        el.startListening();

        setTimeout(() => resolve(false), 1000);
      });
    });

    expect(eventFired).toBe(true);

    // Cleanup
    await callVoiceMethod(page, 'stopListening');
  });

  // ---------------------------------------------------------------------------
  // 7. Disabled button does not respond to startListening()
  // ---------------------------------------------------------------------------
  test('disabled button does not enter listening state on startListening()', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate(() => {
      const el = document.querySelector('#voiceDemoDisabled') as any;
      if (el && typeof el.startListening === 'function') {
        el.startListening();
      }
    });
    await page.waitForTimeout(200);

    const isListening = await page.evaluate(() => {
      const el = document.querySelector('#voiceDemoDisabled');
      return el?.shadowRoot?.querySelector('.voice-button')?.classList.contains('listening') || false;
    });
    expect(isListening).toBe(false);
  });

});
