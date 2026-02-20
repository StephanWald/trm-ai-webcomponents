/**
 * sp-markdown-editor spec part 1 of 4:
 * rendering, props/watchers, public API, isDirty, state display
 * STRICTLY ≤8 createPage() calls total
 */
import { newSpecPage } from '@stencil/core/testing';
import { SpMarkdownEditor } from './sp-markdown-editor';

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation();
  (window as any).marked = {
    parse: (md: string) => `<p>${md}</p>`,
    setOptions: jest.fn(),
    use: jest.fn(),
    Renderer: jest.fn().mockImplementation(function() {
      this.code = (code: string) => `<pre><code>${code}</code></pre>`;
      return this;
    }),
  };
  (window as any).DOMPurify = { sanitize: (html: string) => html };
});

afterAll(() => { jest.restoreAllMocks(); });

async function createPage(html: string = '<sp-markdown-editor></sp-markdown-editor>') {
  return newSpecPage({ components: [SpMarkdownEditor], html });
}

// Page 1
it('renders with toolbar, source editor, footer, button groups, mode tabs', async () => {
  const page = await createPage();
  expect(page.root?.shadowRoot?.querySelector('.toolbar')).toBeTruthy();
  expect(page.root?.shadowRoot?.querySelector('.source-editor')).toBeTruthy();
  expect(page.root?.shadowRoot?.querySelector('.editor-footer')).toBeTruthy();
  expect(page.root?.shadowRoot?.querySelectorAll('.toolbar-group')?.length).toBeGreaterThan(0);
  expect(page.root?.shadowRoot?.querySelectorAll('.mode-tab')?.length).toBe(3);
  const buttons = page.root?.shadowRoot?.querySelectorAll('.toolbar-btn');
  expect(buttons?.length).toBeGreaterThan(0);
  buttons?.forEach((btn: Element) => expect(btn.getAttribute('title')).toBeTruthy());
  const tabs = page.root?.shadowRoot?.querySelectorAll('.mode-tab');
  tabs?.forEach((tab: Element) => expect(tab.getAttribute('title')).toBeTruthy());
});

// Page 2
it('wysiwyg mode renders preview pane', async () => {
  const page = await createPage('<sp-markdown-editor mode="wysiwyg" value="# Hello"></sp-markdown-editor>');
  expect(page.root?.shadowRoot?.querySelector('.wysiwyg-editor')).toBeTruthy();
  expect(await page.rootInstance.getMode()).toBe('wysiwyg');
});

// Page 3
it('split mode renders both panes', async () => {
  const page = await createPage('<sp-markdown-editor mode="split" value="# Hello"></sp-markdown-editor>');
  expect(page.root?.shadowRoot?.querySelector('.split-source')).toBeTruthy();
  expect(page.root?.shadowRoot?.querySelector('.split-preview')).toBeTruthy();
  expect(await page.rootInstance.getMode()).toBe('split');
});

// Page 4: value/mode props + watchers
it('value/mode props and watchers update correctly', async () => {
  const page = await createPage('<sp-markdown-editor value="# Test" mode="source"></sp-markdown-editor>');
  expect(await page.rootInstance.getContent()).toBe('# Test');
  expect(await page.rootInstance.getMode()).toBe('source');
  page.rootInstance.handleValueChange('updated');
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toBe('updated');
  page.rootInstance.handleValueChange('updated'); // same value - ignored
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toBe('updated');
  page.rootInstance.handleModeChange('wysiwyg');
  await page.waitForChanges();
  expect(await page.rootInstance.getMode()).toBe('wysiwyg');
  page.rootInstance.handleModeChange('wysiwyg'); // same mode - ignored
  await page.waitForChanges();
  expect(await page.rootInstance.getMode()).toBe('wysiwyg');
});

// Page 5: public API setContent/clear/setMode
it('setContent, clear, setMode emit events and update state', async () => {
  const page = await createPage();
  const contentSpy = jest.fn();
  const modeSpy = jest.fn();
  page.root?.addEventListener('contentChange', contentSpy);
  page.root?.addEventListener('modeChange', modeSpy);
  await page.rootInstance.setContent('New content');
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toBe('New content');
  expect(contentSpy).toHaveBeenCalledWith(expect.objectContaining({
    detail: expect.objectContaining({ content: 'New content' }),
  }));
  await page.rootInstance.clear();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toBe('');
  await page.rootInstance.setMode('split');
  await page.waitForChanges();
  expect(await page.rootInstance.getMode()).toBe('split');
  expect(modeSpy).toHaveBeenCalled();
  expect(modeSpy.mock.calls[0][0].detail.oldMode).toBe('source');
});

// Page 6: isDirty + focusEditor
it('isDirty transitions on input, focusEditor calls focus, no-ops in wysiwyg', async () => {
  const page = await createPage();
  expect(await page.rootInstance.isDirty()).toBe(false);
  const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
  textarea.value = 'Modified';
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  await page.waitForChanges();
  expect(await page.rootInstance.isDirty()).toBe(true);
  const focusSpy = jest.spyOn(textarea, 'focus');
  await page.rootInstance.focusEditor();
  expect(focusSpy).toHaveBeenCalled();
});

// Page 7: focusEditor in wysiwyg mode
it('focusEditor no-ops in wysiwyg mode', async () => {
  const page = await createPage('<sp-markdown-editor mode="wysiwyg"></sp-markdown-editor>');
  await expect(page.rootInstance.focusEditor()).resolves.toBeUndefined();
});

// Page 8: state display
it('stats, word count, save indicator states', async () => {
  const page = await createPage();
  await page.rootInstance.setContent('Hello world');
  await page.waitForChanges();
  const statsText = page.root?.shadowRoot?.querySelector('.stats')?.textContent;
  expect(statsText).toContain('2');
  expect(statsText).toContain('11');
  await page.rootInstance.setContent('');
  await page.waitForChanges();
  expect(page.root?.shadowRoot?.querySelector('.stats')?.textContent).toContain('0 words');
  await page.rootInstance.setContent('   \n\n   ');
  await page.waitForChanges();
  expect(page.root?.shadowRoot?.querySelector('.stats')?.textContent).toContain('0 words');
  // save indicator: Saved -> Unsaved -> Saving
  expect(page.root?.shadowRoot?.querySelector('.save-indicator')?.textContent).toContain('Saved');
  page.rootInstance.isDirtyState = true;
  await page.waitForChanges();
  expect(page.root?.shadowRoot?.querySelector('.save-indicator')?.textContent).toContain('Unsaved');
  page.rootInstance.isSaving = true;
  await page.waitForChanges();
  expect(page.root?.shadowRoot?.querySelector('.save-indicator')?.textContent).toContain('Saving');
});
