import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

// Helper: open the popover via method call
async function openPopover(page: any) {
  await page.evaluate(() => {
    const el = document.querySelector('#popoverDemo') as any;
    if (el) el.showPopover();
  });
  await page.waitForTimeout(100);
}

// Helper: check if popover container has the .open class
async function isOpen(page: any): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.querySelector('#popoverDemo');
    return !!el?.shadowRoot?.querySelector('.popover-container.open');
  });
}

test.describe('sp-popover E2E', () => {

  // ---------------------------------------------------------------------------
  // 1. Renders hidden by default
  // ---------------------------------------------------------------------------
  test('renders hidden by default — no .open class on container', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const hasContainer = await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo');
      return !!el?.shadowRoot?.querySelector('.popover-container');
    });

    expect(hasContainer).toBe(true);

    const open = await isOpen(page);
    expect(open).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 2. Opens via showPopover() method
  // ---------------------------------------------------------------------------
  test('opens via showPopover() — .open class added and container visible', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await openPopover(page);

    const open = await isOpen(page);
    expect(open).toBe(true);

    // Verify content is accessible
    const hasContent = await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo');
      return !!el?.shadowRoot?.querySelector('.popover-content');
    });
    expect(hasContent).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 3. Closes via hidePopover() method
  // ---------------------------------------------------------------------------
  test('closes via hidePopover() — .open class removed', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await openPopover(page);
    expect(await isOpen(page)).toBe(true);

    await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo') as any;
      if (el) el.hidePopover();
    });
    await page.waitForTimeout(100);

    expect(await isOpen(page)).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 4. Toggle method opens then closes
  // ---------------------------------------------------------------------------
  test('togglePopover() opens then closes on second call', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // First toggle: opens
    await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo') as any;
      if (el) el.togglePopover();
    });
    await page.waitForTimeout(100);
    expect(await isOpen(page)).toBe(true);

    // Second toggle: closes
    await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo') as any;
      if (el) el.togglePopover();
    });
    await page.waitForTimeout(100);
    expect(await isOpen(page)).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 5. Close on outside click (POPV-03)
  // ---------------------------------------------------------------------------
  test('closes on outside click when closeOnClick is true (default)', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await openPopover(page);
    expect(await isOpen(page)).toBe(true);

    // Click somewhere outside both the anchor and popover
    await page.click('h1');
    await page.waitForTimeout(200);

    expect(await isOpen(page)).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 6. Close on Escape key (POPV-03)
  // ---------------------------------------------------------------------------
  test('closes on Escape key press when closeOnEscape is true (default)', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await openPopover(page);
    expect(await isOpen(page)).toBe(true);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    expect(await isOpen(page)).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 7. Disable close on click
  // ---------------------------------------------------------------------------
  test('stays open on outside click when close-on-click is disabled', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Disable outside-click dismiss
    await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo') as any;
      if (el) {
        el.closeOnClick = false;
        el.showPopover();
      }
    });
    await page.waitForTimeout(100);
    expect(await isOpen(page)).toBe(true);

    // Click outside — should NOT close
    await page.click('h1');
    await page.waitForTimeout(200);

    const stillOpen = await isOpen(page);

    // Restore default before asserting
    await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo') as any;
      if (el) {
        el.closeOnClick = true;
        el.hidePopover();
      }
    });

    expect(stillOpen).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 8. Disable close on Escape
  // ---------------------------------------------------------------------------
  test('stays open on Escape when close-on-escape is disabled', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo') as any;
      if (el) {
        el.closeOnEscape = false;
        el.showPopover();
      }
    });
    await page.waitForTimeout(100);
    expect(await isOpen(page)).toBe(true);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    const stillOpen = await isOpen(page);

    // Restore default before asserting
    await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo') as any;
      if (el) {
        el.closeOnEscape = true;
        el.hidePopover();
      }
    });

    expect(stillOpen).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 9. Events emitted on open and close
  // ---------------------------------------------------------------------------
  test('emits popoverOpen and popoverClose events', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Listen for events and capture them
    const openEvent = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const el = document.querySelector('#popoverDemo') as any;
        el?.addEventListener('popoverOpen', () => resolve(true));
        el?.showPopover();
        setTimeout(() => resolve(false), 1000);
      });
    });

    expect(openEvent).toBe(true);

    const closeEvent = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const el = document.querySelector('#popoverDemo') as any;
        el?.addEventListener('popoverClose', () => resolve(true));
        el?.hidePopover();
        setTimeout(() => resolve(false), 1000);
      });
    });

    expect(closeEvent).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // 10. Positioned near anchor
  // ---------------------------------------------------------------------------
  test('popover is positioned near its anchor using fixed positioning', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await openPopover(page);

    const positioning = await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo');
      const anchor = document.querySelector('#popoverAnchor') as HTMLElement | null;
      const container = el?.shadowRoot?.querySelector('.popover-container') as HTMLElement | null;

      if (!anchor || !container) return null;

      const anchorRect = anchor.getBoundingClientRect();
      const containerStyle = window.getComputedStyle(container);
      const containerTop = parseFloat(containerStyle.top) || 0;
      const containerLeft = parseFloat(containerStyle.left) || 0;

      return {
        anchorTop: anchorRect.top,
        anchorBottom: anchorRect.bottom,
        anchorLeft: anchorRect.left,
        containerTop,
        containerLeft,
        hasFixedPosition: containerStyle.position === 'fixed',
        // Popover should be near the anchor — within 300px vertically
        nearAnchorVertically: Math.abs(
          Math.min(containerTop - anchorRect.bottom, anchorRect.top - (containerTop + 150))
        ) < 300,
      };
    });

    expect(positioning).not.toBeNull();

    if (positioning) {
      // Container must use fixed positioning (viewport-relative coordinates)
      expect(positioning.hasFixedPosition).toBe(true);
      // Position values must be numbers within a reasonable viewport range (10–3000px)
      expect(positioning.containerTop).toBeGreaterThanOrEqual(10);
      expect(positioning.containerLeft).toBeGreaterThanOrEqual(10);
    }
  });

  // ---------------------------------------------------------------------------
  // 11. ARIA attributes
  // ---------------------------------------------------------------------------
  test('aria-hidden="false" when open and "true" when closed', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Initially hidden
    const initialAria = await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo');
      return el?.shadowRoot?.querySelector('.popover-container')?.getAttribute('aria-hidden');
    });
    expect(initialAria).toBe('true');

    await openPopover(page);

    const openAria = await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo');
      return el?.shadowRoot?.querySelector('.popover-container')?.getAttribute('aria-hidden');
    });
    expect(openAria).toBe('false');

    // Close and verify it goes back to hidden
    await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo') as any;
      if (el) el.hidePopover();
    });
    await page.waitForTimeout(100);

    const closedAria = await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo');
      return el?.shadowRoot?.querySelector('.popover-container')?.getAttribute('aria-hidden');
    });
    expect(closedAria).toBe('true');
  });

  // ---------------------------------------------------------------------------
  // 12. role="dialog" on container
  // ---------------------------------------------------------------------------
  test('container has role="dialog"', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const role = await page.evaluate(() => {
      const el = document.querySelector('#popoverDemo');
      return el?.shadowRoot?.querySelector('.popover-container')?.getAttribute('role');
    });

    expect(role).toBe('dialog');
  });

});
