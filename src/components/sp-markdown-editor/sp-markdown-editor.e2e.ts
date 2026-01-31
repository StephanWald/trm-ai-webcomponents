import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('sp-markdown-editor E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Add markdown editor to page
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.innerHTML = '<sp-markdown-editor></sp-markdown-editor>';
      document.body.appendChild(container);
    });

    await page.waitForTimeout(300);
  });

  test('component renders on page', async ({ page }) => {
    const hasComponent = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      return !!el;
    });

    expect(hasComponent).toBe(true);
  });

  test('source textarea is visible in default mode', async ({ page }) => {
    const hasTextarea = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      return !!el?.shadowRoot?.querySelector('.source-editor');
    });

    expect(hasTextarea).toBe(true);
  });

  test('toolbar buttons render', async ({ page }) => {
    const toolbarInfo = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const toolbar = el?.shadowRoot?.querySelector('.toolbar');
      const buttons = el?.shadowRoot?.querySelectorAll('.toolbar-btn');
      return {
        hasToolbar: !!toolbar,
        buttonCount: buttons?.length || 0,
      };
    });

    expect(toolbarInfo.hasToolbar).toBe(true);
    expect(toolbarInfo.buttonCount).toBeGreaterThan(0);
  });

  test('footer renders with stats', async ({ page }) => {
    const footerInfo = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const footer = el?.shadowRoot?.querySelector('.editor-footer');
      const stats = el?.shadowRoot?.querySelector('.editor-stats');
      return {
        hasFooter: !!footer,
        hasStats: !!stats,
      };
    });

    expect(footerInfo.hasFooter).toBe(true);
    expect(footerInfo.hasStats).toBe(true);
  });

  test('mode switcher tabs render', async ({ page }) => {
    const tabsInfo = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const modeSwitcher = el?.shadowRoot?.querySelector('.mode-switcher');
      const tabs = el?.shadowRoot?.querySelectorAll('.mode-tab');
      return {
        hasModeSwitcher: !!modeSwitcher,
        tabCount: tabs?.length || 0,
      };
    });

    expect(tabsInfo.hasModeSwitcher).toBe(true);
    expect(tabsInfo.tabCount).toBe(3);
  });

  test('typing in textarea updates content', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const textarea = el?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = 'Hello World';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.waitForTimeout(100);

    const content = await page.evaluate(async () => {
      const el = document.querySelector('sp-markdown-editor') as any;
      return await el.getContent();
    });

    expect(content).toBe('Hello World');
  });

  test('clicking mode tab switches view', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const tabs = el?.shadowRoot?.querySelectorAll('.mode-tab');
      const previewTab = Array.from(tabs || []).find(tab => tab.textContent?.includes('Preview')) as HTMLElement;
      previewTab?.click();
    });

    await page.waitForTimeout(300);

    const hasWysiwygEditor = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      return !!el?.shadowRoot?.querySelector('.wysiwyg-editor');
    });

    expect(hasWysiwygEditor).toBe(true);
  });

  test('undo button restores previous state', async ({ page }) => {
    // Type content
    await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const textarea = el?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = 'First';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.waitForTimeout(600); // Wait for debounced history push

    // Type more content
    await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const textarea = el?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = 'First Second';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.waitForTimeout(600);

    // Click undo button
    await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const buttons = el?.shadowRoot?.querySelectorAll('.toolbar-btn');
      const undoBtn = Array.from(buttons || []).find(btn => btn.getAttribute('title')?.includes('Undo')) as HTMLElement;
      undoBtn?.click();
    });

    await page.waitForTimeout(100);

    const content = await page.evaluate(async () => {
      const el = document.querySelector('sp-markdown-editor') as any;
      return await el.getContent();
    });

    expect(content).toBe('First');
  });

  test('source mode shows textarea', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const tabs = el?.shadowRoot?.querySelectorAll('.mode-tab');
      const sourceTab = Array.from(tabs || []).find(tab => tab.textContent?.includes('Source')) as HTMLElement;
      sourceTab?.click();
    });

    await page.waitForTimeout(300);

    const hasSourceEditor = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      return !!el?.shadowRoot?.querySelector('.source-editor');
    });

    expect(hasSourceEditor).toBe(true);
  });

  test('preview mode shows rendered HTML', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor') as any;
      el.setContent('# Hello World');
    });

    await page.waitForTimeout(100);

    await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const tabs = el?.shadowRoot?.querySelectorAll('.mode-tab');
      const previewTab = Array.from(tabs || []).find(tab => tab.textContent?.includes('Preview')) as HTMLElement;
      previewTab?.click();
    });

    await page.waitForTimeout(300);

    const hasWysiwyg = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const wysiwygEditor = el?.shadowRoot?.querySelector('.wysiwyg-editor');
      return {
        exists: !!wysiwygEditor,
        html: wysiwygEditor?.innerHTML || '',
      };
    });

    expect(hasWysiwyg.exists).toBe(true);
    expect(hasWysiwyg.html).toContain('Hello World');
  });

  test('split mode shows both panes', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const tabs = el?.shadowRoot?.querySelectorAll('.mode-tab');
      const splitTab = Array.from(tabs || []).find(tab => tab.textContent?.includes('Split')) as HTMLElement;
      splitTab?.click();
    });

    await page.waitForTimeout(300);

    const splitInfo = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      return {
        hasSourcePane: !!el?.shadowRoot?.querySelector('.split-source'),
        hasPreviewPane: !!el?.shadowRoot?.querySelector('.split-preview'),
      };
    });

    expect(splitInfo.hasSourcePane).toBe(true);
    expect(splitInfo.hasPreviewPane).toBe(true);
  });

  test('toolbar buttons have title attributes', async ({ page }) => {
    const allButtonsHaveTitles = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const buttons = el?.shadowRoot?.querySelectorAll('.toolbar-btn');
      return Array.from(buttons || []).every(btn => btn.getAttribute('title'));
    });

    expect(allButtonsHaveTitles).toBe(true);
  });

  test('textarea has placeholder', async ({ page }) => {
    const placeholder = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const textarea = el?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      return textarea?.placeholder || '';
    });

    expect(placeholder).toBeTruthy();
  });

  test('setContent() updates displayed content', async ({ page }) => {
    await page.evaluate(async () => {
      const el = document.querySelector('sp-markdown-editor') as any;
      await el.setContent('Updated content');
    });

    await page.waitForTimeout(100);

    const textareaValue = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const textarea = el?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      return textarea?.value || '';
    });

    expect(textareaValue).toBe('Updated content');
  });

  test('clear() empties the editor', async ({ page }) => {
    // Set initial content
    await page.evaluate(async () => {
      const el = document.querySelector('sp-markdown-editor') as any;
      await el.setContent('Some content');
    });

    await page.waitForTimeout(100);

    // Clear content
    await page.evaluate(async () => {
      const el = document.querySelector('sp-markdown-editor') as any;
      await el.clear();
    });

    await page.waitForTimeout(100);

    const content = await page.evaluate(async () => {
      const el = document.querySelector('sp-markdown-editor') as any;
      return await el.getContent();
    });

    expect(content).toBe('');
  });

  test('getContent() returns what was typed', async ({ page }) => {
    const testContent = 'Test content for retrieval';

    await page.evaluate((content) => {
      const el = document.querySelector('sp-markdown-editor');
      const textarea = el?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = content;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, testContent);

    await page.waitForTimeout(100);

    const retrievedContent = await page.evaluate(async () => {
      const el = document.querySelector('sp-markdown-editor') as any;
      return await el.getContent();
    });

    expect(retrievedContent).toBe(testContent);
  });

  test('stats update when content changes', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const textarea = el?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = 'Hello world test';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.waitForTimeout(100);

    const statsText = await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      return el?.shadowRoot?.querySelector('.editor-stats')?.textContent || '';
    });

    expect(statsText).toContain('16'); // 16 chars
    expect(statsText).toContain('3'); // 3 words
  });

  test('bold button wraps selection', async ({ page }) => {
    // Set content and selection
    await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const textarea = el?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = 'Hello world';
        textarea.setSelectionRange(0, 5); // Select "Hello"
        textarea.focus();
      }
    });

    await page.waitForTimeout(100);

    // Click bold button
    await page.evaluate(() => {
      const el = document.querySelector('sp-markdown-editor');
      const buttons = el?.shadowRoot?.querySelectorAll('.toolbar-btn');
      const boldBtn = Array.from(buttons || []).find(btn => btn.textContent?.trim() === 'B') as HTMLElement;
      boldBtn?.click();
    });

    await page.waitForTimeout(100);

    const content = await page.evaluate(async () => {
      const el = document.querySelector('sp-markdown-editor') as any;
      return await el.getContent();
    });

    expect(content).toBe('**Hello** world');
  });

  test('emits contentChange event', async ({ page }) => {
    const eventFired = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const el = document.querySelector('sp-markdown-editor');

        el?.addEventListener('contentChange', () => {
          resolve(true);
        });

        const textarea = el?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
        if (textarea) {
          textarea.value = 'Changed';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }

        setTimeout(() => resolve(false), 1000);
      });
    });

    expect(eventFired).toBe(true);
  });

  test('emits modeChange event when switching modes', async ({ page }) => {
    const eventDetail = await page.evaluate(() => {
      return new Promise<any>((resolve) => {
        const el = document.querySelector('sp-markdown-editor');

        el?.addEventListener('modeChange', (e: any) => {
          resolve(e.detail);
        });

        const tabs = el?.shadowRoot?.querySelectorAll('.mode-tab');
        const previewTab = Array.from(tabs || []).find(tab => tab.textContent?.includes('Preview')) as HTMLElement;
        previewTab?.click();

        setTimeout(() => resolve(null), 1000);
      });
    });

    expect(eventDetail).toBeTruthy();
    expect(eventDetail.oldMode).toBe('source');
    expect(eventDetail.newMode).toBe('wysiwyg');
  });
});
