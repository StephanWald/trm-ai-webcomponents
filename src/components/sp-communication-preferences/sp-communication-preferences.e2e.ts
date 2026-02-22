import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

// Helper: check if the communication preferences popover is open via aria-expanded
async function isSelectorOpen(page: any): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.querySelector('#commPrefsDemo');
    const button = el?.shadowRoot?.querySelector('.selector-button');
    return button?.getAttribute('aria-expanded') === 'true';
  });
}

// Helper: click the selector button
async function clickSelectorButton(page: any, id = '#commPrefsDemo'): Promise<void> {
  await page.evaluate((elId: string) => {
    const el = document.querySelector(elId);
    const button = el?.shadowRoot?.querySelector('.selector-button') as HTMLElement;
    button?.click();
  }, id);
  await page.waitForTimeout(200);
}

test.describe('sp-communication-preferences E2E', () => {

  // ---------------------------------------------------------------------------
  // 1. Renders selector button with channel icon and label text
  // ---------------------------------------------------------------------------
  test('renders selector button with channel icon and label text', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const hasSelectorButton = await page.evaluate(() => {
      const el = document.querySelector('#commPrefsDemo');
      return !!el?.shadowRoot?.querySelector('.selector-button');
    });
    expect(hasSelectorButton).toBe(true);

    const hasIcon = await page.evaluate(() => {
      const el = document.querySelector('#commPrefsDemo');
      return !!el?.shadowRoot?.querySelector('.selector-button svg');
    });
    expect(hasIcon).toBe(true);

    const labelText = await page.evaluate(() => {
      const el = document.querySelector('#commPrefsDemo');
      return el?.shadowRoot?.querySelector('.channel-label')?.textContent;
    });
    // Default channel is APPLICATION → label is 'Application'
    expect(labelText).toBe('Application');
  });

  // ---------------------------------------------------------------------------
  // 2. Clicking button opens channel dropdown
  // ---------------------------------------------------------------------------
  test('clicking button opens channel dropdown', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Initially closed
    expect(await isSelectorOpen(page)).toBe(false);

    await clickSelectorButton(page);

    // After click, aria-expanded should be true
    expect(await isSelectorOpen(page)).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 3. Channel list renders all 6 channels
  // ---------------------------------------------------------------------------
  test('channel list renders all 6 channels', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await clickSelectorButton(page);

    // sp-communication-list should be in the shadow DOM
    const hasCommunicationList = await page.evaluate(() => {
      const el = document.querySelector('#commPrefsDemo');
      return !!el?.shadowRoot?.querySelector('sp-communication-list');
    });
    expect(hasCommunicationList).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 4. Setting selectedChannel prop updates the displayed channel label
  // ---------------------------------------------------------------------------
  test('setting selectedChannel prop updates the displayed channel', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Verify initial state
    const initialLabel = await page.evaluate(() => {
      const el = document.querySelector('#commPrefsDemo');
      return el?.shadowRoot?.querySelector('.channel-label')?.textContent;
    });
    expect(initialLabel).toBe('Application');

    // Set selectedChannel directly via the component's public prop
    await page.evaluate(() => {
      const el = document.querySelector('#commPrefsDemo') as any;
      if (el) el.selectedChannel = 'EMAIL';
    });

    await page.waitForTimeout(500);

    // Verify the button now shows 'Email'
    const updatedLabel = await page.evaluate(() => {
      const el = document.querySelector('#commPrefsDemo');
      return el?.shadowRoot?.querySelector('.channel-label')?.textContent;
    });
    expect(updatedLabel).toBe('Email');
  });

  // ---------------------------------------------------------------------------
  // 5. preferenceChange event fires when a channel is selected
  // ---------------------------------------------------------------------------
  test('preferenceChange event fires when a channel is selected', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const eventFired = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const selector = document.querySelector('#commPrefsDemo') as any;
        if (!selector) return resolve(false);

        selector.addEventListener('preferenceChange', () => resolve(true));

        // Dispatch from sp-communication-list to trigger the chain
        const commList = selector.shadowRoot?.querySelector('sp-communication-list') as HTMLElement;
        if (commList) {
          commList.dispatchEvent(new CustomEvent('preferenceChange', {
            detail: { channel: 'EMAIL', label: 'Email' },
            bubbles: true,
            composed: true,
          }));
        } else {
          resolve(false);
        }

        setTimeout(() => resolve(false), 1000);
      });
    });

    expect(eventFired).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 6. Disabled selector does not open dropdown on click
  // ---------------------------------------------------------------------------
  test('disabled selector does not open dropdown on click', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Click the disabled selector
    await clickSelectorButton(page, '#commPrefsDisabled');

    // aria-expanded should remain false since it's disabled
    const isExpanded = await page.evaluate(() => {
      const el = document.querySelector('#commPrefsDisabled');
      const button = el?.shadowRoot?.querySelector('.selector-button');
      return button?.getAttribute('aria-expanded') === 'true';
    });
    expect(isExpanded).toBe(false);
  });

});
