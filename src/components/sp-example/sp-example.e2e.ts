import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('sp-example E2E', () => {
  test('component renders and is visible on page', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const component = page.locator('sp-example').first();
    await expect(component).toBeVisible();
  });

  test('heading text matches prop value', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Test default heading
    const defaultComponent = page.locator('sp-example').first();
    const defaultHeading = defaultComponent.locator('h2');
    await expect(defaultHeading).toHaveText('Example Component');

    // Test custom heading
    const customComponents = page.locator('sp-example[heading="Custom Heading Example"]');
    const customHeading = customComponents.locator('h2');
    await expect(customHeading).toHaveText('Custom Heading Example');
  });

  test('dark theme variant has correct CSS class', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const darkThemeComponent = page.locator('sp-example[theme="dark"]');
    await expect(darkThemeComponent).toHaveClass(/theme-dark/);
  });

  test('light theme variant has correct CSS class', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const lightThemeComponent = page.locator('sp-example[theme="light"]');
    await expect(lightThemeComponent).toHaveClass(/theme-light/);
  });

  test('component responds to theme attribute change', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const component = page.locator('sp-example').first();

    // Initially no theme class
    await expect(component).not.toHaveClass(/theme-dark/);
    await expect(component).not.toHaveClass(/theme-light/);

    // Change to dark theme
    await page.evaluate(() => {
      const el = document.querySelector('sp-example');
      if (el) el.setAttribute('theme', 'dark');
    });

    await expect(component).toHaveClass(/theme-dark/);

    // Change to light theme
    await page.evaluate(() => {
      const el = document.querySelector('sp-example');
      if (el) el.setAttribute('theme', 'light');
    });

    await expect(component).toHaveClass(/theme-light/);
  });

  test('click event fires when button is clicked', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Listen for custom event
    const eventFired = page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const component = document.querySelector('sp-example');
        component?.addEventListener('spExampleClick', () => {
          resolve(true);
        });

        // Trigger button click via shadow DOM
        const button = component?.shadowRoot?.querySelector('button');
        (button as HTMLElement)?.click();
      });
    });

    await expect(eventFired).resolves.toBe(true);
  });
});
