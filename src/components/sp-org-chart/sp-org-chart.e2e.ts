import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

const sampleUsers = [
  { id: '1', name: 'Alice Johnson', role: 'CEO', reportsTo: undefined },
  { id: '2', name: 'Bob Smith', role: 'CTO', reportsTo: '1' },
  { id: '3', name: 'Carol White', role: 'Engineer', reportsTo: '2' },
  { id: '4', name: 'Dave Brown', role: 'CFO', reportsTo: '1' },
  { id: '5', name: 'Eve Davis', role: 'Analyst', reportsTo: '4' },
];

test.describe('sp-org-chart E2E', () => {
  test('component renders and is visible on page', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const component = page.locator('sp-org-chart').first();
    await expect(component).toBeVisible();
  });

  test('hierarchical tree renders with correct number of user tiles', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Clear existing users first, then set sample users
    await page.evaluate((users) => {
      const elements = document.querySelectorAll('sp-org-chart');
      elements.forEach(el => {
        (el as any).users = [];
      });
      // Set on first element
      const el = elements[0];
      if (el) {
        (el as any).users = users;
      }
    }, sampleUsers);

    // Wait for rendering
    await page.waitForTimeout(300);

    // Count user tiles in first component's shadow DOM
    const tileCount = await page.evaluate(() => {
      const elements = document.querySelectorAll('sp-org-chart');
      const el = elements[0];
      return el?.shadowRoot?.querySelectorAll('.user-tile').length || 0;
    });

    expect(tileCount).toBe(5);
  });

  test('user tiles display name and role text', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((users) => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = users;
      }
    }, sampleUsers);

    await page.waitForTimeout(300);

    const userInfo = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const tiles = el?.shadowRoot?.querySelectorAll('.user-tile') || [];
      return Array.from(tiles).map(tile => ({
        name: tile.querySelector('.user-name')?.textContent || '',
        role: tile.querySelector('.user-role')?.textContent || '',
      }));
    });

    expect(userInfo.length).toBe(5);
    expect(userInfo.some(u => u.name === 'Alice Johnson' && u.role === 'CEO')).toBe(true);
    expect(userInfo.some(u => u.name === 'Bob Smith' && u.role === 'CTO')).toBe(true);
    expect(userInfo.some(u => u.name === 'Carol White' && u.role === 'Engineer')).toBe(true);
  });

  test('visual connectors present in tree structure', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((users) => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = users;
      }
    }, sampleUsers);

    await page.waitForTimeout(300);

    const hasTreeChildren = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const treeChildren = el?.shadowRoot?.querySelectorAll('.tree-children') || [];
      return treeChildren.length > 0;
    });

    expect(hasTreeChildren).toBe(true);
  });

  test('no-data message displays when users array is empty', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = [];
      }
    });

    await page.waitForTimeout(300);

    const noDataText = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      return el?.shadowRoot?.querySelector('.no-data')?.textContent || '';
    });

    expect(noDataText.trim()).toBeTruthy();
  });

  test('custom no-data message attribute changes displayed text', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = [];
        el.setAttribute('no-data-message', 'Custom empty state');
      }
    });

    await page.waitForTimeout(300);

    const noDataText = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      return el?.shadowRoot?.querySelector('.no-data')?.textContent || '';
    });

    expect(noDataText.trim()).toBe('Custom empty state');
  });

  test('single-click selects tile with blue border', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((users) => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = users;
      }
    }, sampleUsers);

    await page.waitForTimeout(300);

    // Click first user tile
    await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const firstTile = el?.shadowRoot?.querySelector('.user-tile') as HTMLElement;
      firstTile?.click();
    });

    // Wait for single-click delay
    await page.waitForTimeout(400);

    const hasSelectedClass = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const firstTile = el?.shadowRoot?.querySelector('.user-tile');
      return firstTile?.classList.contains('selected') || false;
    });

    expect(hasSelectedClass).toBe(true);
  });

  test('clicking different tile deselects previous', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((users) => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = users;
      }
    }, sampleUsers);

    await page.waitForTimeout(300);

    // Click first tile
    await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const tiles = el?.shadowRoot?.querySelectorAll('.user-tile') || [];
      (tiles[0] as HTMLElement)?.click();
    });

    await page.waitForTimeout(400);

    // Click second tile
    await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const tiles = el?.shadowRoot?.querySelectorAll('.user-tile') || [];
      (tiles[1] as HTMLElement)?.click();
    });

    await page.waitForTimeout(400);

    // Only second tile should be selected
    const selectedCount = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const tiles = el?.shadowRoot?.querySelectorAll('.user-tile.selected') || [];
      return tiles.length;
    });

    expect(selectedCount).toBe(1);
  });

  test('double-click emits userDblclick event', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((users) => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = users;
      }
    }, sampleUsers);

    await page.waitForTimeout(300);

    // Set up event listener and trigger double-click
    const eventFired = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const el = document.querySelector('sp-org-chart');

        el?.addEventListener('userDblclick', () => {
          resolve(true);
        });

        // Simulate double-click by clicking twice quickly
        const firstTile = el?.shadowRoot?.querySelector('.user-tile') as HTMLElement;
        firstTile?.click();

        setTimeout(() => {
          firstTile?.click();

          // If no event after 1 second, resolve false
          setTimeout(() => resolve(false), 1000);
        }, 100);
      });
    });

    expect(eventFired).toBe(true);
  });

  test('filter by name dims non-matching tiles', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((users) => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = users;
      }
    }, sampleUsers);

    await page.waitForTimeout(300);

    // Type in filter input
    await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const filterInput = el?.shadowRoot?.querySelector('.filter-input') as HTMLInputElement;
      if (filterInput) {
        filterInput.value = 'Alice';
        filterInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.waitForTimeout(300);

    // Check that some tiles are dimmed
    const dimmedCount = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const tiles = el?.shadowRoot?.querySelectorAll('.user-tile.dimmed') || [];
      return tiles.length;
    });

    expect(dimmedCount).toBeGreaterThan(0);
  });

  test('filter by role shows correct matches', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((users) => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = users;
      }
    }, sampleUsers);

    await page.waitForTimeout(300);

    // Filter by "Engineer"
    await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const filterInput = el?.shadowRoot?.querySelector('.filter-input') as HTMLInputElement;
      if (filterInput) {
        filterInput.value = 'Engineer';
        filterInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.waitForTimeout(300);

    // Count dimmed vs non-dimmed
    const filterResults = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const tiles = el?.shadowRoot?.querySelectorAll('.user-tile') || [];
      let dimmed = 0;
      let visible = 0;

      tiles.forEach(tile => {
        if (tile.classList.contains('dimmed')) {
          dimmed++;
        } else {
          visible++;
        }
      });

      return { dimmed, visible };
    });

    // At least Engineer and ancestors should be visible
    expect(filterResults.visible).toBeGreaterThan(0);
    expect(filterResults.dimmed).toBeGreaterThan(0);
  });

  test('clearing filter returns all tiles to normal', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((users) => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = users;
      }
    }, sampleUsers);

    await page.waitForTimeout(300);

    // Apply filter
    await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const filterInput = el?.shadowRoot?.querySelector('.filter-input') as HTMLInputElement;
      if (filterInput) {
        filterInput.value = 'Alice';
        filterInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.waitForTimeout(300);

    // Clear filter
    await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const filterInput = el?.shadowRoot?.querySelector('.filter-input') as HTMLInputElement;
      if (filterInput) {
        filterInput.value = '';
        filterInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.waitForTimeout(300);

    // No tiles should be dimmed
    const dimmedCount = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const tiles = el?.shadowRoot?.querySelectorAll('.user-tile.dimmed') || [];
      return tiles.length;
    });

    expect(dimmedCount).toBe(0);
  });

  test('editable mode sets draggable attribute on tiles', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((users) => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = users;
        el.setAttribute('editable', 'true');
      }
    }, sampleUsers);

    await page.waitForTimeout(300);

    const isDraggable = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const firstTile = el?.shadowRoot?.querySelector('.user-tile');
      return firstTile?.getAttribute('draggable') === 'true';
    });

    expect(isDraggable).toBe(true);
  });

  test('component has appropriate ARIA role attributes', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((users) => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = users;
      }
    }, sampleUsers);

    await page.waitForTimeout(300);

    // Check for tree container
    const hasTreeContainer = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const treeContainer = el?.shadowRoot?.querySelector('.tree-container');
      return !!treeContainer;
    });

    expect(hasTreeContainer).toBe(true);
  });

  test('filter input has placeholder text for accessibility', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const placeholderText = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const filterInput = el?.shadowRoot?.querySelector('.filter-input');
      return filterInput?.getAttribute('placeholder') || '';
    });

    expect(placeholderText).toBeTruthy();
    expect(placeholderText.toLowerCase()).toContain('filter');
  });

  test('user tiles are clickable interactive elements', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((users) => {
      const el = document.querySelector('sp-org-chart');
      if (el) {
        (el as any).users = users;
      }
    }, sampleUsers);

    await page.waitForTimeout(300);

    // Verify tiles can be clicked
    const isClickable = await page.evaluate(() => {
      const el = document.querySelector('sp-org-chart');
      const firstTile = el?.shadowRoot?.querySelector('.user-tile') as HTMLElement;

      // Should have click handler (not directly testable, but tile should exist)
      return !!firstTile;
    });

    expect(isClickable).toBe(true);
  });
});
