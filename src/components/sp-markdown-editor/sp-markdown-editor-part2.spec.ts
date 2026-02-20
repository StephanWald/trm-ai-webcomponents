/**
 * sp-markdown-editor spec part 2 of 3:
 * auto-save, mode switching, modeChange event
 * STRICTLY ≤8 createPage() calls total
 * NOTE: Do NOT use jest.useFakeTimers() - it breaks subsequent createPage() calls.
 * Test auto-save by calling private methods directly on rootInstance.
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

// Page 1: auto-save fires when isDirty and performAutoSave called
it('performAutoSave emits save event when dirty, does not fire when clean', async () => {
  const page = await createPage('<sp-markdown-editor auto-save="true"></sp-markdown-editor>');
  const spy = jest.fn();
  page.root?.addEventListener('save', spy);
  // When not dirty, performAutoSave is a no-op
  page.rootInstance.isDirtyState = false;
  page.rootInstance['performAutoSave']();
  await page.waitForChanges();
  expect(spy).not.toHaveBeenCalled();
  // When dirty, performAutoSave emits save
  page.rootInstance.isDirtyState = true;
  page.rootInstance['performAutoSave']();
  await page.waitForChanges();
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy.mock.calls[0][0].detail.content).toBeDefined();
  // After save, isDirtyState is reset
  expect(page.rootInstance.isDirtyState).toBe(false);
});

// Page 2: auto-save disabled: triggerAutoSave no-ops when autoSave=false
it('no auto-save timer set when autoSave=false', async () => {
  const page = await createPage('<sp-markdown-editor auto-save="false"></sp-markdown-editor>');
  const spy = jest.fn();
  page.root?.addEventListener('save', spy);
  // triggerAutoSave should be a no-op when autoSave=false
  page.rootInstance['triggerAutoSave']();
  await page.waitForChanges();
  expect(page.rootInstance.autoSaveTimer).toBeNull();
  expect(spy).not.toHaveBeenCalled();
});

// Page 3: Ctrl+S saves immediately
it('Ctrl+S saves immediately regardless of timer', async () => {
  const page = await createPage('<sp-markdown-editor auto-save="true"></sp-markdown-editor>');
  const spy = jest.fn();
  page.root?.addEventListener('save', spy);
  // Set dirty state and content
  page.rootInstance.isDirtyState = true;
  page.rootInstance.content = 'Content';
  // Dispatch Ctrl+S
  page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true }));
  await page.waitForChanges();
  expect(spy).toHaveBeenCalled();
});

// Page 4: disconnectedCallback clears auto-save timer
it('disconnectedCallback clears auto-save timer and sets it to null', async () => {
  const page = await createPage('<sp-markdown-editor auto-save="true" auto-save-delay="60000"></sp-markdown-editor>');
  // Trigger auto-save to set timer
  page.rootInstance.isDirtyState = true;
  page.rootInstance['triggerAutoSave']();
  await page.waitForChanges();
  expect(page.rootInstance.autoSaveTimer).not.toBeNull();
  // disconnectedCallback should clear timer
  page.rootInstance.disconnectedCallback();
  expect(page.rootInstance.autoSaveTimer).toBeNull();
});

// Page 5: mode switching via tabs
it('tab clicks switch modes, emits modeChange, content preserved', async () => {
  const page = await createPage('<sp-markdown-editor value="preserved content"></sp-markdown-editor>');
  const spy = jest.fn();
  page.root?.addEventListener('modeChange', spy);
  const tabs = page.root?.shadowRoot?.querySelectorAll('.mode-tab');
  expect(tabs?.[0]?.classList.contains('active')).toBe(true); // source active
  (tabs?.[1] as HTMLButtonElement).click(); // wysiwyg
  await page.waitForChanges();
  expect(await page.rootInstance.getMode()).toBe('wysiwyg');
  expect(spy).toHaveBeenCalledTimes(1);
  (tabs?.[2] as HTMLButtonElement).click(); // split
  await page.waitForChanges();
  expect(await page.rootInstance.getMode()).toBe('split');
  (tabs?.[0] as HTMLButtonElement).click(); // source
  await page.waitForChanges();
  expect(await page.rootInstance.getMode()).toBe('source');
  expect(await page.rootInstance.getContent()).toBe('preserved content');
  const modeTabs = page.root?.shadowRoot?.querySelectorAll('.mode-tab');
  modeTabs?.forEach((tab: Element) => expect(tab.getAttribute('title')).toBeTruthy());
});

// Page 6: same tab no-op + active class
it('clicking same tab does not emit modeChange, active tab has active class', async () => {
  const page = await createPage('<sp-markdown-editor mode="wysiwyg"></sp-markdown-editor>');
  const spy = jest.fn();
  page.root?.addEventListener('modeChange', spy);
  const tabs = page.root?.shadowRoot?.querySelectorAll('.mode-tab');
  expect(tabs?.[1]?.classList.contains('active')).toBe(true); // wysiwyg active
  (tabs?.[1] as HTMLButtonElement).click(); // same tab
  await page.waitForChanges();
  expect(spy).not.toHaveBeenCalled();
});

// Page 7: modeChange event with old/new mode details
it('setMode emits modeChange event with correct old/new mode', async () => {
  const page = await createPage();
  const spy = jest.fn();
  page.root?.addEventListener('modeChange', spy);
  await page.rootInstance.setMode('wysiwyg');
  await page.waitForChanges();
  expect(spy.mock.calls[0][0].detail.oldMode).toBe('source');
  expect(spy.mock.calls[0][0].detail.newMode).toBe('wysiwyg');
  await page.rootInstance.setMode('split');
  await page.waitForChanges();
  expect(spy.mock.calls[1][0].detail.oldMode).toBe('wysiwyg');
  expect(spy.mock.calls[1][0].detail.newMode).toBe('split');
});

// Page 8: custom placeholder + contentChange event
it('renders with custom placeholder, input triggers contentChange event', async () => {
  const page = await createPage('<sp-markdown-editor placeholder="Type here..."></sp-markdown-editor>');
  expect(page.root?.shadowRoot?.querySelector('.source-editor')?.getAttribute('placeholder')).toBe('Type here...');
  const spy = jest.fn();
  page.root?.addEventListener('contentChange', spy);
  await page.rootInstance.setContent('event test content');
  await page.waitForChanges();
  expect(spy).toHaveBeenCalled();
  expect(spy.mock.calls[0][0].detail.content).toBe('event test content');
});
