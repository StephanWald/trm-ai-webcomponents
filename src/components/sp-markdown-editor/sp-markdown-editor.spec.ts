import { newSpecPage } from '@stencil/core/testing';
import { SpMarkdownEditor } from './sp-markdown-editor';

// Mock peer dependencies for Jest environment
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

function findToolbarBtn(page: any, text: string): HTMLButtonElement {
  return Array.from(page.root?.shadowRoot?.querySelectorAll('.toolbar-btn') ?? [])
    .find((btn: any) => btn.textContent?.trim() === text) as HTMLButtonElement;
}

// ============================================================
// Group 1: rendering and basic structure (shared page)
// ============================================================
describe('sp-markdown-editor rendering', () => {
  let page: any;
  beforeAll(async () => { page = await createPage(); });

  it('renders with toolbar, source editor, footer', () => {
    expect(page.root?.shadowRoot?.querySelector('.toolbar')).toBeTruthy();
    expect(page.root?.shadowRoot?.querySelector('.source-editor')).toBeTruthy();
    expect(page.root?.shadowRoot?.querySelector('.editor-footer')).toBeTruthy();
  });

  it('has toolbar button groups and 3 mode tabs', () => {
    expect(page.root?.shadowRoot?.querySelectorAll('.toolbar-group')?.length).toBeGreaterThan(0);
    expect(page.root?.shadowRoot?.querySelectorAll('.mode-tab')?.length).toBe(3);
  });

  it('toolbar buttons have title attributes', () => {
    page.root?.shadowRoot?.querySelectorAll('.toolbar-btn')?.forEach((btn: Element) => {
      expect(btn.getAttribute('title')).toBeTruthy();
    });
  });

  it('mode tabs have title attributes', () => {
    page.root?.shadowRoot?.querySelectorAll('.mode-tab')?.forEach((tab: Element) => {
      expect(tab.getAttribute('title')).toBeTruthy();
    });
  });

  it('custom placeholder is rendered', async () => {
    const p = await createPage('<sp-markdown-editor placeholder="Custom placeholder"></sp-markdown-editor>');
    expect(p.root?.shadowRoot?.querySelector('.source-editor')?.getAttribute('placeholder')).toBe('Custom placeholder');
  });

  it('wysiwyg mode renders preview pane', async () => {
    const p = await createPage('<sp-markdown-editor mode="wysiwyg" value="# Hello"></sp-markdown-editor>');
    expect(p.root?.shadowRoot?.querySelector('.wysiwyg-editor')).toBeTruthy();
  });

  it('split mode renders both panes', async () => {
    const p = await createPage('<sp-markdown-editor mode="split" value="# Hello"></sp-markdown-editor>');
    expect(p.root?.shadowRoot?.querySelector('.split-source')).toBeTruthy();
    expect(p.root?.shadowRoot?.querySelector('.split-preview')).toBeTruthy();
  });
});

// ============================================================
// Group 2: props, watchers, and public API (shared page)
// ============================================================
describe('sp-markdown-editor props and API', () => {
  let page: any;
  beforeAll(async () => {
    page = await createPage('<sp-markdown-editor value="# Test" mode="source"></sp-markdown-editor>');
  });

  it('value prop sets initial content', async () => {
    expect(await page.rootInstance.getContent()).toBe('# Test');
  });

  it('mode prop sets initial mode', async () => {
    expect(await page.rootInstance.getMode()).toBe('source');
  });

  it('autoSave prop is false by default-configurable', async () => {
    const p = await createPage('<sp-markdown-editor auto-save="false"></sp-markdown-editor>');
    expect(p.rootInstance.autoSave).toBe(false);
  });

  it('value watcher updates content', async () => {
    page.rootInstance.handleValueChange('updated');
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('updated');
  });

  it('value watcher ignores same value', async () => {
    page.rootInstance.handleValueChange('updated');
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('updated');
  });

  it('mode watcher updates mode', async () => {
    page.rootInstance.handleModeChange('wysiwyg');
    await page.waitForChanges();
    expect(await page.rootInstance.getMode()).toBe('wysiwyg');
    page.rootInstance.handleModeChange('source');
    await page.waitForChanges();
    expect(await page.rootInstance.getMode()).toBe('source');
  });

  it('setContent updates content and emits contentChange', async () => {
    const eventSpy = jest.fn();
    page.root?.addEventListener('contentChange', eventSpy);
    await page.rootInstance.setContent('New content');
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('New content');
    expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
      detail: expect.objectContaining({ content: 'New content' }),
    }));
    page.root?.removeEventListener('contentChange', eventSpy);
  });

  it('clear resets content to empty', async () => {
    await page.rootInstance.setContent('Some text');
    await page.waitForChanges();
    await page.rootInstance.clear();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('');
  });

  it('setMode changes mode and emits modeChange', async () => {
    const eventSpy = jest.fn();
    page.root?.addEventListener('modeChange', eventSpy);
    await page.rootInstance.setMode('split');
    await page.waitForChanges();
    expect(await page.rootInstance.getMode()).toBe('split');
    expect(eventSpy).toHaveBeenCalled();
    await page.rootInstance.setMode('source');
    await page.waitForChanges();
    page.root?.removeEventListener('modeChange', eventSpy);
  });

  it('isDirty returns false initially and true after input', async () => {
    await page.rootInstance.setContent('');
    await page.waitForChanges();
    // Reset dirty state by accessing internal state
    page.rootInstance.isDirtyState = false;
    await page.waitForChanges();
    expect(await page.rootInstance.isDirty()).toBe(false);
    const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
    textarea.value = 'Modified';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await page.waitForChanges();
    expect(await page.rootInstance.isDirty()).toBe(true);
  });

  it('focusEditor calls focus on textarea', async () => {
    await page.rootInstance.setMode('source');
    await page.waitForChanges();
    const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
    const focusSpy = jest.spyOn(textarea, 'focus');
    await page.rootInstance.focusEditor();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('focusEditor no-ops in wysiwyg mode', async () => {
    const p = await createPage('<sp-markdown-editor mode="wysiwyg"></sp-markdown-editor>');
    await expect(p.rootInstance.focusEditor()).resolves.toBeUndefined();
  });
});

// ============================================================
// Group 3: state display (shared page)
// ============================================================
describe('sp-markdown-editor state display', () => {
  let page: any;
  beforeAll(async () => { page = await createPage(); });

  it('stats update on content change', async () => {
    await page.rootInstance.setContent('Hello world');
    await page.waitForChanges();
    const statsText = page.root?.shadowRoot?.querySelector('.stats')?.textContent;
    expect(statsText).toContain('2'); // 2 words
    expect(statsText).toContain('11'); // 11 chars
  });

  it('word count handles empty and whitespace', async () => {
    await page.rootInstance.setContent('');
    await page.waitForChanges();
    expect(page.root?.shadowRoot?.querySelector('.stats')?.textContent).toContain('0 words');
    await page.rootInstance.setContent('   \n\n   ');
    await page.waitForChanges();
    expect(page.root?.shadowRoot?.querySelector('.stats')?.textContent).toContain('0 words');
  });

  it('save indicator: Saved, Unsaved, Saving states', async () => {
    page.rootInstance.isDirtyState = false;
    page.rootInstance.isSaving = false;
    await page.waitForChanges();
    expect(page.root?.shadowRoot?.querySelector('.save-indicator')?.textContent).toContain('Saved');
    page.rootInstance.isDirtyState = true;
    await page.waitForChanges();
    expect(page.root?.shadowRoot?.querySelector('.save-indicator')?.textContent).toContain('Unsaved');
    page.rootInstance.isSaving = true;
    await page.waitForChanges();
    expect(page.root?.shadowRoot?.querySelector('.save-indicator')?.textContent).toContain('Saving');
  });
});

// ============================================================
// Group 4: auto-save (separate page needed for timers)
// ============================================================
describe('sp-markdown-editor auto-save', () => {
  it('auto-save fires after delay and debounces rapid input', async () => {
    const page = await createPage('<sp-markdown-editor auto-save="true" auto-save-delay="1000"></sp-markdown-editor>');
    jest.useFakeTimers();
    const eventSpy = jest.fn();
    page.root?.addEventListener('save', eventSpy);
    const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
    textarea.value = 'First';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    jest.advanceTimersByTime(500); // debounce resets
    textarea.value = 'Second';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    jest.advanceTimersByTime(900); // still debouncing
    expect(eventSpy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200); // now fires
    expect(eventSpy).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('auto-save disabled when autoSave=false', async () => {
    const page = await createPage('<sp-markdown-editor auto-save="false"></sp-markdown-editor>');
    jest.useFakeTimers();
    const eventSpy = jest.fn();
    page.root?.addEventListener('save', eventSpy);
    const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
    textarea.value = 'Content';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    jest.advanceTimersByTime(10000);
    expect(eventSpy).not.toHaveBeenCalled();
    jest.useRealTimers();
    // performAutoSave no-ops when not dirty
    page.rootInstance.isDirtyState = false;
    page.rootInstance['performAutoSave']();
    await page.waitForChanges();
    expect(eventSpy).not.toHaveBeenCalled();
  });

  it('Ctrl+S triggers immediate save and disconnectedCallback clears timer', async () => {
    const page = await createPage('<sp-markdown-editor auto-save="true" auto-save-delay="2000"></sp-markdown-editor>');
    const saveEventSpy = jest.fn();
    page.root?.addEventListener('save', saveEventSpy);
    const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
    textarea.value = 'Content';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await page.waitForChanges();
    page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true }));
    await page.waitForChanges();
    expect(saveEventSpy).toHaveBeenCalled();
    // disconnectedCallback clears timer
    jest.useFakeTimers();
    textarea.value = 'More content';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await page.waitForChanges();
    expect(page.rootInstance.autoSaveTimer).not.toBeNull();
    page.rootInstance.disconnectedCallback();
    expect(page.rootInstance.autoSaveTimer).toBeNull();
    jest.useRealTimers();
  });
});

// ============================================================
// Group 5: mode switching via tabs (shared page)
// ============================================================
describe('sp-markdown-editor mode switching', () => {
  let page: any;
  beforeAll(async () => { page = await createPage('<sp-markdown-editor value="preserved content"></sp-markdown-editor>'); });

  it('clicking tabs switches to wysiwyg, split, source', async () => {
    const eventSpy = jest.fn();
    page.root?.addEventListener('modeChange', eventSpy);
    const tabs = page.root?.shadowRoot?.querySelectorAll('.mode-tab');
    (tabs?.[1] as HTMLButtonElement).click(); // wysiwyg
    await page.waitForChanges();
    expect(await page.rootInstance.getMode()).toBe('wysiwyg');
    (tabs?.[2] as HTMLButtonElement).click(); // split
    await page.waitForChanges();
    expect(await page.rootInstance.getMode()).toBe('split');
    (tabs?.[0] as HTMLButtonElement).click(); // source
    await page.waitForChanges();
    expect(await page.rootInstance.getMode()).toBe('source');
    page.root?.removeEventListener('modeChange', eventSpy);
  });

  it('clicking same tab does not emit modeChange, active tab has active class', async () => {
    const eventSpy = jest.fn();
    page.root?.addEventListener('modeChange', eventSpy);
    const tabs = page.root?.shadowRoot?.querySelectorAll('.mode-tab');
    expect(tabs?.[0]?.classList.contains('active')).toBe(true); // source is active
    (tabs?.[0] as HTMLButtonElement).click();
    await page.waitForChanges();
    expect(eventSpy).not.toHaveBeenCalled();
    page.root?.removeEventListener('modeChange', eventSpy);
  });

  it('content preserved across mode switches', async () => {
    expect(await page.rootInstance.getContent()).toBe('preserved content');
  });
});

// ============================================================
// Group 6: toolbar actions (shared page)
// ============================================================
describe('sp-markdown-editor toolbar actions', () => {
  let page: any;
  let textarea: HTMLTextAreaElement;
  beforeAll(async () => {
    page = await createPage('<sp-markdown-editor value="Hello world"></sp-markdown-editor>');
    textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
  });

  it('bold wraps selection with **', async () => {
    await page.rootInstance.setContent('Hello world');
    textarea.selectionStart = 0; textarea.selectionEnd = 5;
    findToolbarBtn(page, 'B')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('**Hello**');
  });

  it('italic wraps selection with _', async () => {
    await page.rootInstance.setContent('Hello world');
    textarea.selectionStart = 0; textarea.selectionEnd = 5;
    findToolbarBtn(page, 'I')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('_Hello_');
  });

  it('strikethrough wraps selection with ~~', async () => {
    await page.rootInstance.setContent('Hello world');
    textarea.selectionStart = 0; textarea.selectionEnd = 5;
    findToolbarBtn(page, 'S')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('~~Hello~~');
  });

  it('H1 adds # prefix to line', async () => {
    await page.rootInstance.setContent('Hello');
    textarea.selectionStart = 0; textarea.selectionEnd = 0;
    findToolbarBtn(page, 'H1')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('# Hello');
  });

  it('H2 adds ## prefix to line', async () => {
    await page.rootInstance.setContent('Hello');
    textarea.selectionStart = 0; textarea.selectionEnd = 0;
    findToolbarBtn(page, 'H2')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('## Hello');
  });

  it('bullet list adds - prefix', async () => {
    await page.rootInstance.setContent('item');
    textarea.selectionStart = 0; textarea.selectionEnd = 4;
    findToolbarBtn(page, '•')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('- item');
  });

  it('numbered list adds 1. prefix', async () => {
    await page.rootInstance.setContent('item');
    textarea.selectionStart = 0; textarea.selectionEnd = 4;
    findToolbarBtn(page, '1.')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('1. item');
  });

  it('task list adds - [ ] prefix', async () => {
    await page.rootInstance.setContent('item');
    textarea.selectionStart = 0; textarea.selectionEnd = 4;
    findToolbarBtn(page, '☐')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('- [ ] item');
  });

  it('link inserts [link text](https://)', async () => {
    await page.rootInstance.setContent('');
    textarea.selectionStart = 0; textarea.selectionEnd = 0;
    findToolbarBtn(page, '🔗')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('[link text](https://)');
  });

  it('image inserts ![alt text](url)', async () => {
    await page.rootInstance.setContent('');
    textarea.selectionStart = 0; textarea.selectionEnd = 0;
    findToolbarBtn(page, 'IMG')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('![alt text](url)');
  });

  it('table inserts markdown table', async () => {
    await page.rootInstance.setContent('');
    textarea.selectionStart = 0; textarea.selectionEnd = 0;
    findToolbarBtn(page, '⊞')?.click();
    await page.waitForChanges();
    const content = await page.rootInstance.getContent();
    expect(content).toContain('| Header1 |');
    expect(content).toContain('| --- |');
  });

  it('horizontal rule inserts ---', async () => {
    await page.rootInstance.setContent('');
    textarea.selectionStart = 0; textarea.selectionEnd = 0;
    findToolbarBtn(page, '―')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('---');
  });

  it('undo/redo cycle works via buttons', async () => {
    await page.rootInstance.setContent('initial');
    await page.rootInstance.setContent('modified');
    await page.waitForChanges();
    findToolbarBtn(page, '↶')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('initial');
    findToolbarBtn(page, '↷')?.click();
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('modified');
  });

  it('undo button disabled initially, enabled after edit', async () => {
    const p = await createPage();
    expect(findToolbarBtn(p, '↶')?.disabled).toBe(true);
    await p.rootInstance.setContent('something');
    await p.waitForChanges();
    expect(findToolbarBtn(p, '↶')?.disabled).toBe(false);
  });

  it('toolbar no-ops without textarea ref (wysiwyg mode)', async () => {
    const p = await createPage('<sp-markdown-editor mode="wysiwyg"></sp-markdown-editor>');
    expect(() => {
      p.rootInstance['applyToolbarAction'](() => ({
        content: 'test', selectionStart: 0, selectionEnd: 0,
      }));
    }).not.toThrow();
  });

  it('undo/redo no-ops on empty history', async () => {
    const p = await createPage();
    expect(() => p.rootInstance['handleUndo']()).not.toThrow();
    expect(() => p.rootInstance['handleRedo']()).not.toThrow();
  });
});

// ============================================================
// Group 7: keyboard shortcuts (shared page)
// ============================================================
describe('sp-markdown-editor keyboard shortcuts', () => {
  let page: any;
  let textarea: HTMLTextAreaElement;
  beforeAll(async () => {
    page = await createPage('<sp-markdown-editor value="Hello"></sp-markdown-editor>');
    textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
  });

  it('Ctrl+B bold, Ctrl+I italic, Ctrl+K link', async () => {
    await page.rootInstance.setContent('Hello');
    textarea.selectionStart = 0; textarea.selectionEnd = 5;
    page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true }));
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('**Hello**');

    await page.rootInstance.setContent('Hello');
    textarea.selectionStart = 0; textarea.selectionEnd = 5;
    page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', ctrlKey: true, bubbles: true }));
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('_Hello_');

    await page.rootInstance.setContent('');
    textarea.selectionStart = 0; textarea.selectionEnd = 0;
    page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('[link text](https://)');
  });

  it('Ctrl+Z undo, Ctrl+Shift+Z redo, Ctrl+Y redo', async () => {
    await page.rootInstance.setContent('initial');
    await page.rootInstance.setContent('modified');
    await page.waitForChanges();
    page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('initial');
    page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true }));
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('modified');
    page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    await page.waitForChanges();
    page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true }));
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('modified');
  });

  it('Meta key triggers shortcuts, non-ctrl key ignored', async () => {
    await page.rootInstance.setContent('Hello');
    textarea.selectionStart = 0; textarea.selectionEnd = 5;
    page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', metaKey: true, bubbles: true }));
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('**Hello**');

    await page.rootInstance.setContent('initial');
    page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: false, bubbles: true }));
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('initial');
  });
});

// ============================================================
// Group 8: voice dictation (needs beforeEach for SpeechRecognition)
// ============================================================
describe('sp-markdown-editor voice dictation', () => {
  let mockRecognition: any;
  let page: any;

  beforeEach(() => {
    mockRecognition = {
      start: jest.fn(), stop: jest.fn(),
      onresult: null as any, onerror: null as any, onend: null as any,
    };
    (window as any).SpeechRecognition = jest.fn(() => mockRecognition);
  });

  afterEach(() => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
  });

  it('voice button visible, starts/stops recognition, appends results', async () => {
    page = await createPage('<sp-markdown-editor value="Hello"></sp-markdown-editor>');
    expect(findToolbarBtn(page, '🎤')).toBeTruthy();

    findToolbarBtn(page, '🎤')?.click();
    await page.waitForChanges();
    expect(page.rootInstance.isListening).toBe(true);
    expect(mockRecognition.start).toHaveBeenCalled();

    mockRecognition.onresult({
      results: [Object.assign([{ transcript: ' world', confidence: 0.9 }], { isFinal: true })],
    });
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toContain('world');

    page.rootInstance.speechRecognizer['active'] = true;
    findToolbarBtn(page, '🎤')?.click();
    await page.waitForChanges();
    expect(mockRecognition.stop).toHaveBeenCalled();
    expect(page.rootInstance.isListening).toBe(false);
  });

  it('interim results not appended, errors reset isListening', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    page = await createPage('<sp-markdown-editor value="Hello"></sp-markdown-editor>');
    findToolbarBtn(page, '🎤')?.click();
    await page.waitForChanges();
    const initialContent = await page.rootInstance.getContent();
    mockRecognition.onresult({
      results: [Object.assign([{ transcript: 'interim', confidence: 0.5 }], { isFinal: false })],
    });
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe(initialContent);
    mockRecognition.onerror({ error: 'network' });
    await page.waitForChanges();
    expect(page.rootInstance.isListening).toBe(false);
    consoleSpy.mockRestore();
  });

  it('webkitSpeechRecognition detected as supported', async () => {
    delete (window as any).SpeechRecognition;
    (window as any).webkitSpeechRecognition = jest.fn(() => mockRecognition);
    const p = await createPage();
    expect(p.rootInstance.speechRecognizer.isSupported()).toBe(true);
  });
});

// ============================================================
// Group 9: import/export/print (1-2 pages)
// ============================================================
describe('sp-markdown-editor import/export/print', () => {
  it('import: file input click, no-file no-op, file loads content', async () => {
    const page = await createPage();
    const importEventSpy = jest.fn();
    page.root?.addEventListener('importFile', importEventSpy);
    const fileInput = page.root?.shadowRoot?.querySelector('input[type="file"]') as HTMLInputElement;

    // Click triggers input
    const clickSpy = jest.spyOn(fileInput, 'click');
    findToolbarBtn(page, '↓')?.click();
    await page.waitForChanges();
    expect(clickSpy).toHaveBeenCalled();

    // No file: no-op
    Object.defineProperty(fileInput, 'files', { value: [], configurable: true });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('');

    // File with content
    const mockReader = {
      onload: null as any, onerror: null as any,
      readAsText: jest.fn(function(this: any) {
        setTimeout(() => { this.onload?.({ target: { result: '# Imported' } }); }, 0);
      }),
    };
    (global as any).FileReader = jest.fn(() => mockReader);
    const mockFile = new File(['# Imported'], 'test.md', { type: 'text/markdown' });
    Object.defineProperty(fileInput, 'files', { value: [mockFile], configurable: true });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 50));
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('# Imported');
    expect(importEventSpy).toHaveBeenCalled();
  });

  it('import handles file read error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const page = await createPage();
    const mockReader = {
      onload: null as any, onerror: null as any,
      readAsText: jest.fn(function(this: any) {
        setTimeout(() => { this.onerror?.(new Error('Read error')); }, 0);
      }),
    };
    (global as any).FileReader = jest.fn(() => mockReader);
    const fileInput = page.root?.shadowRoot?.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['content'], 'test.md', { type: 'text/markdown' });
    Object.defineProperty(fileInput, 'files', { value: [mockFile], configurable: true });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 50));
    await page.waitForChanges();
    expect(consoleSpy).toHaveBeenCalledWith('File import failed:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('export triggers exportFile event with filename', async () => {
    (URL as any).createObjectURL = jest.fn(() => 'blob:mock-url');
    (URL as any).revokeObjectURL = jest.fn();
    const mockAnchor = { href: '', download: '', click: jest.fn(), style: {} };
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor as any;
      return document.createElement.call(document, tag);
    });
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);
    const page = await createPage('<sp-markdown-editor value="# Export"></sp-markdown-editor>');
    const exportEventSpy = jest.fn();
    page.root?.addEventListener('exportFile', exportEventSpy);
    findToolbarBtn(page, '↑')?.click();
    await page.waitForChanges();
    expect(exportEventSpy).toHaveBeenCalled();
    expect(exportEventSpy.mock.calls[0][0].detail.filename).toContain('.md');
    jest.restoreAllMocks();
  });

  it('print opens window, writes content, calls print then close', async () => {
    const mockPrintWindow = {
      document: { write: jest.fn(), close: jest.fn() },
      focus: jest.fn(), print: jest.fn(), close: jest.fn(),
    };
    jest.spyOn(window, 'open').mockReturnValue(mockPrintWindow as any);
    const page = await createPage('<sp-markdown-editor value="# Print test"></sp-markdown-editor>');
    jest.useFakeTimers();
    findToolbarBtn(page, '🖨')?.click();
    await page.waitForChanges();
    expect(window.open).toHaveBeenCalledWith('', '_blank');
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    expect(mockPrintWindow.print).toHaveBeenCalled();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('print handles window.open returning null', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(window, 'open').mockReturnValue(null);
    const page = await createPage();
    findToolbarBtn(page, '🖨')?.click();
    await page.waitForChanges();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to open print window');
    consoleSpy.mockRestore();
    jest.restoreAllMocks();
  });
});

// ============================================================
// Group 10: fallback rendering without DWC theme (shared page)
// ============================================================
describe('sp-markdown-editor without DWC theme', () => {
  let page: any;
  beforeAll(async () => { page = await createPage('<sp-markdown-editor value="# Test content"></sp-markdown-editor>'); });

  it('full structure present without DWC tokens', () => {
    expect(page.root?.shadowRoot?.querySelector('.toolbar-container')).toBeTruthy();
    expect(page.root?.shadowRoot?.querySelector('.source-editor')).toBeTruthy();
    expect(page.root?.shadowRoot?.querySelector('.editor-footer')).toBeTruthy();
    expect(page.root?.shadowRoot?.querySelectorAll('.toolbar-btn')?.length).toBeGreaterThan(0);
  });

  it('content, modes, and stats functional without DWC theme', async () => {
    expect(await page.rootInstance.getContent()).toBe('# Test content');
    await page.rootInstance.setMode('wysiwyg');
    await page.waitForChanges();
    expect(await page.rootInstance.getMode()).toBe('wysiwyg');
    await page.rootInstance.setMode('split');
    await page.waitForChanges();
    expect(await page.rootInstance.getMode()).toBe('split');
    await page.rootInstance.setMode('source');
    await page.waitForChanges();
    await page.rootInstance.setContent('Hello world');
    await page.waitForChanges();
    const statsText = page.root?.shadowRoot?.querySelector('.stats')?.textContent;
    expect(statsText).toContain('2');
  });
});
