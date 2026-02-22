import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

// Helper: open the splash via method call
async function openSplash(page: any, id = '#splashDemo') {
  await page.evaluate((elId: string) => {
    const el = document.querySelector(elId) as any;
    if (el) el.show();
  }, id);
  await page.waitForTimeout(300);
}

// Helper: check if splash overlay has .open class
async function isSplashOpen(page: any, id = '#splashDemo'): Promise<boolean> {
  return page.evaluate((elId: string) => {
    const el = document.querySelector(elId);
    return !!el?.shadowRoot?.querySelector('.splash-overlay.open');
  }, id);
}

test.describe('sp-splash E2E', () => {

  // ---------------------------------------------------------------------------
  // 1. Splash is hidden by default
  // ---------------------------------------------------------------------------
  test('splash is hidden by default — overlay does not have .open class', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const open = await isSplashOpen(page);
    expect(open).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 2. Calling show() opens the splash
  // ---------------------------------------------------------------------------
  test('calling show() opens the splash — overlay gets .open class', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await openSplash(page);

    const open = await isSplashOpen(page);
    expect(open).toBe(true);

    // Clean up — hide so other tests start clean
    await page.evaluate(() => {
      const el = document.querySelector('#splashDemo') as any;
      if (el) el.hide();
    });
    await page.waitForTimeout(200);
  });

  // ---------------------------------------------------------------------------
  // 3. Close button dismisses the splash
  // ---------------------------------------------------------------------------
  test('close button dismisses the splash', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await openSplash(page);
    expect(await isSplashOpen(page)).toBe(true);

    // Click the close button via shadow DOM
    await page.evaluate(() => {
      const el = document.querySelector('#splashDemo');
      const closeBtn = el?.shadowRoot?.querySelector('.close-button') as HTMLElement;
      closeBtn?.click();
    });
    await page.waitForTimeout(300);

    expect(await isSplashOpen(page)).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 4. Escape key dismisses the splash
  // ---------------------------------------------------------------------------
  test('Escape key dismisses the splash', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await openSplash(page);
    expect(await isSplashOpen(page)).toBe(true);

    // Press Escape via keyboard
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    expect(await isSplashOpen(page)).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 5. Backdrop click dismisses the splash
  // ---------------------------------------------------------------------------
  test('backdrop click dismisses the splash', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await openSplash(page);
    expect(await isSplashOpen(page)).toBe(true);

    // Click directly on the overlay element (simulating backdrop click)
    // We simulate this by dispatching a click on the overlay with target === currentTarget
    await page.evaluate(() => {
      const el = document.querySelector('#splashDemo');
      const overlay = el?.shadowRoot?.querySelector('.splash-overlay') as HTMLElement;
      if (overlay) {
        // Dispatch a MouseEvent so target equals the overlay element
        overlay.dispatchEvent(new MouseEvent('click', { bubbles: false }));
      }
    });
    await page.waitForTimeout(300);

    // The overlay is the handler's currentTarget; since the event was dispatched
    // directly on the overlay, target === currentTarget, so it should dismiss
    expect(await isSplashOpen(page)).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 6. splashClose event fires with correct reason
  // ---------------------------------------------------------------------------
  test('splashClose event fires with reason "button" when close button is clicked', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const result = await page.evaluate(() => {
      return new Promise<string>((resolve) => {
        const el = document.querySelector('#splashDemo') as any;
        if (!el) return resolve('no-element');

        el.addEventListener('splashClose', (e: CustomEvent<{ reason: string }>) => {
          resolve(e.detail.reason);
        });

        el.show().then(() => {
          setTimeout(() => {
            const closeBtn = el.shadowRoot?.querySelector('.close-button') as HTMLElement;
            closeBtn?.click();
          }, 100);
        });

        setTimeout(() => resolve('timeout'), 2000);
      });
    });

    expect(result).toBe('button');
  });

  // ---------------------------------------------------------------------------
  // 7. Named slots render custom content
  // ---------------------------------------------------------------------------
  test('named slots render custom content — slotted text is in the DOM', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await openSplash(page);

    // The splashDemo in index.html has slot="title" with "Welcome to Skillspilot"
    const titleText = await page.evaluate(() => {
      const el = document.querySelector('#splashDemo');
      // Slotted content lives in the light DOM (outside shadow root)
      const titleSlot = el?.querySelector('[slot="title"]');
      return titleSlot?.textContent;
    });
    expect(titleText).toBe('Welcome to Skillspilot');

    // Overlay should be visible
    const open = await isSplashOpen(page);
    expect(open).toBe(true);

    // Clean up
    await page.evaluate(() => {
      const el = document.querySelector('#splashDemo') as any;
      if (el) el.hide();
    });
    await page.waitForTimeout(200);
  });

});
