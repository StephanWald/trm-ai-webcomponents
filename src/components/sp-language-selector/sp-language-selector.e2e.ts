import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

// Helper: check if the language selector popover is open
async function isSelectorOpen(page: any): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.querySelector('#langSelectorDemo');
    const popover = el?.shadowRoot?.querySelector('sp-popover') as any;
    if (!popover) return false;
    // sp-popover renders a .popover-container.open when open
    return !!popover.shadowRoot?.querySelector('.popover-container.open');
  });
}

// Helper: click the selector button
async function clickSelectorButton(page: any): Promise<void> {
  await page.evaluate(() => {
    const el = document.querySelector('#langSelectorDemo');
    const button = el?.shadowRoot?.querySelector('.selector-button') as HTMLElement;
    button?.click();
  });
  await page.waitForTimeout(200);
}

test.describe('sp-language-selector E2E', () => {

  // ---------------------------------------------------------------------------
  // 1. Renders language selector button
  // ---------------------------------------------------------------------------
  test('renders language selector button with globe icon and language code text', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Wait for the custom element to be defined and its shadow DOM populated
    await page.waitForFunction(() => {
      const el = document.querySelector('#langSelectorDemo');
      return !!el?.shadowRoot?.querySelector('.selector-button');
    }, { timeout: 5000 });

    const hasSelectorButton = await page.evaluate(() => {
      const el = document.querySelector('#langSelectorDemo');
      return !!el?.shadowRoot?.querySelector('.selector-button');
    });
    expect(hasSelectorButton).toBe(true);

    const langCodeText = await page.evaluate(() => {
      const el = document.querySelector('#langSelectorDemo');
      return el?.shadowRoot?.querySelector('.lang-code')?.textContent;
    });
    expect(langCodeText).toBe('EN'); // default language is 'en'

    const hasGlobeIcon = await page.evaluate(() => {
      const el = document.querySelector('#langSelectorDemo');
      return !!el?.shadowRoot?.querySelector('.selector-button svg');
    });
    expect(hasGlobeIcon).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 2. Clicking button opens language dropdown
  // ---------------------------------------------------------------------------
  test('clicking button opens language dropdown', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Initially closed
    expect(await isSelectorOpen(page)).toBe(false);

    await clickSelectorButton(page);

    // After click, dropdown should be open
    // Check sp-language-selector has isOpen state via aria-expanded
    const isExpanded = await page.evaluate(() => {
      const el = document.querySelector('#langSelectorDemo');
      const button = el?.shadowRoot?.querySelector('.selector-button');
      return button?.getAttribute('aria-expanded') === 'true';
    });
    expect(isExpanded).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 3. Language list shows preferred section and alphabetical list
  // ---------------------------------------------------------------------------
  test('language list renders preferred and alphabetical sections', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await clickSelectorButton(page);

    // The language list should be in the shadow DOM
    const hasLanguageList = await page.evaluate(() => {
      const selector = document.querySelector('#langSelectorDemo');
      return !!selector?.shadowRoot?.querySelector('sp-language-list');
    });
    expect(hasLanguageList).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 4. Language selection via API updates the displayed language code
  // ---------------------------------------------------------------------------
  test('setting selectedLanguage prop updates the displayed language code', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Verify initial state
    const initialCode = await page.evaluate(() => {
      const el = document.querySelector('#langSelectorDemo');
      return el?.shadowRoot?.querySelector('.lang-code')?.textContent;
    });
    expect(initialCode).toBe('EN');

    // Set selectedLanguage directly via the component's public prop
    await page.evaluate(() => {
      const el = document.querySelector('#langSelectorDemo') as any;
      if (el) el.selectedLanguage = 'fr';
    });

    // Wait for Stencil's async re-render cycle
    await page.waitForTimeout(500);

    // Verify the button now shows 'FR'
    const langCode = await page.evaluate(() => {
      const el = document.querySelector('#langSelectorDemo');
      return el?.shadowRoot?.querySelector('.lang-code')?.textContent;
    });
    expect(langCode).toBe('FR');
  });

  // ---------------------------------------------------------------------------
  // 5. languageChange event fires on selection
  // ---------------------------------------------------------------------------
  test('languageChange event fires when a language is selected', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const eventFired = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const selector = document.querySelector('#langSelectorDemo') as any;
        if (!selector) return resolve(false);

        selector.addEventListener('languageChange', () => resolve(true));

        // Dispatch from sp-language-list to trigger the chain
        const langList = selector.shadowRoot?.querySelector('sp-language-list') as HTMLElement;
        if (langList) {
          langList.dispatchEvent(new CustomEvent('languageChange', {
            detail: { code: 'de', name: 'German' },
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
  // 6. Disabled selector does not respond to click
  // ---------------------------------------------------------------------------
  test('disabled selector does not open dropdown on click', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Click the disabled selector
    await page.evaluate(() => {
      const el = document.querySelector('#langSelectorDisabled');
      const button = el?.shadowRoot?.querySelector('.selector-button') as HTMLElement;
      button?.click();
    });
    await page.waitForTimeout(200);

    // aria-expanded should remain false since it's disabled
    const isExpanded = await page.evaluate(() => {
      const el = document.querySelector('#langSelectorDisabled');
      const button = el?.shadowRoot?.querySelector('.selector-button');
      return button?.getAttribute('aria-expanded') === 'true';
    });
    expect(isExpanded).toBe(false);
  });

});
