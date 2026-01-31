import { newSpecPage } from '@stencil/core/testing';
import { SpMarkdownEditor } from './sp-markdown-editor';

// Mock peer dependencies for Jest environment
beforeAll(() => {
  // Suppress console warnings in tests
  jest.spyOn(console, 'warn').mockImplementation();

  // Mock marked
  (window as any).marked = {
    parse: (md: string) => `<p>${md}</p>`,
    setOptions: jest.fn(),
    use: jest.fn(),
    Renderer: jest.fn().mockImplementation(function() {
      this.code = (code: string) => `<pre><code>${code}</code></pre>`;
      return this;
    }),
  };

  // Mock DOMPurify
  (window as any).DOMPurify = {
    sanitize: (html: string) => html,
  };
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('sp-markdown-editor', () => {
  describe('rendering', () => {
    it('renders with default props', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      expect(page.root).toBeTruthy();
    });

    it('renders source textarea in source mode', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor mode="source"></sp-markdown-editor>',
      });

      const textarea = page.root?.shadowRoot?.querySelector('.source-editor');
      expect(textarea).toBeTruthy();
    });

    it('renders with custom placeholder', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor placeholder="Custom placeholder"></sp-markdown-editor>',
      });

      const textarea = page.root?.shadowRoot?.querySelector('.source-editor');
      expect(textarea?.getAttribute('placeholder')).toBe('Custom placeholder');
    });

    it('renders toolbar with button groups', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      const toolbar = page.root?.shadowRoot?.querySelector('.toolbar');
      expect(toolbar).toBeTruthy();

      const buttonGroups = page.root?.shadowRoot?.querySelectorAll('.toolbar-group');
      expect(buttonGroups?.length).toBeGreaterThan(0);
    });

    it('renders footer with character/word count', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      const footer = page.root?.shadowRoot?.querySelector('.editor-footer');
      expect(footer).toBeTruthy();

      const stats = page.root?.shadowRoot?.querySelector('.stats');
      expect(stats).toBeTruthy();
    });

    it('renders mode switcher tabs', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      const modeSwitcher = page.root?.shadowRoot?.querySelector('.mode-switcher');
      expect(modeSwitcher).toBeTruthy();

      const tabs = page.root?.shadowRoot?.querySelectorAll('.mode-tab');
      expect(tabs?.length).toBe(3); // Source, Preview, Split
    });
  });

  describe('props', () => {
    it('value prop sets initial content', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor value="# Hello"></sp-markdown-editor>',
      });

      const content = await page.rootInstance.getContent();
      expect(content).toBe('# Hello');
    });

    it('mode prop sets initial editing mode', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor mode="wysiwyg"></sp-markdown-editor>',
      });

      const mode = await page.rootInstance.getMode();
      expect(mode).toBe('wysiwyg');
    });

    it('autoSave prop enables/disables auto-save', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor auto-save="false"></sp-markdown-editor>',
      });

      expect(page.rootInstance.autoSave).toBe(false);
    });

    it('placeholder prop sets textarea placeholder', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor placeholder="Write here..."></sp-markdown-editor>',
      });

      expect(page.rootInstance.placeholder).toBe('Write here...');
    });

    it('defaults mode to source', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      const mode = await page.rootInstance.getMode();
      expect(mode).toBe('source');
    });

    it('defaults autoSave to true', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      expect(page.rootInstance.autoSave).toBe(true);
    });
  });

  describe('state', () => {
    it('content updates on input', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      await page.rootInstance.setContent('New content');
      await page.waitForChanges();

      const content = await page.rootInstance.getContent();
      expect(content).toBe('New content');
    });

    it('isDirtyState becomes true on edit', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      textarea.value = 'Modified';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      await page.waitForChanges();

      const isDirty = await page.rootInstance.isDirty();
      expect(isDirty).toBe(true);
    });

    it('stats update on content change', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      await page.rootInstance.setContent('Hello world');
      await page.waitForChanges();

      const statsText = page.root?.shadowRoot?.querySelector('.stats')?.textContent;
      expect(statsText).toContain('11'); // 11 chars
      expect(statsText).toContain('2'); // 2 words
    });

    it('currentMode changes on mode switch', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      await page.rootInstance.setMode('wysiwyg');
      await page.waitForChanges();

      const mode = await page.rootInstance.getMode();
      expect(mode).toBe('wysiwyg');
    });
  });

  describe('events', () => {
    it('emits contentChange on input', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('contentChange', eventSpy);

      await page.rootInstance.setContent('Test content');
      await page.waitForChanges();

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail.content).toBe('Test content');
    });

    it('emits save on auto-save', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor auto-save="true" auto-save-delay="100"></sp-markdown-editor>',
      });

      jest.useFakeTimers();

      const eventSpy = jest.fn();
      page.root?.addEventListener('save', eventSpy);

      const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      textarea.value = 'Modified';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      // Fast-forward past auto-save delay
      jest.advanceTimersByTime(150);

      expect(eventSpy).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('emits modeChange on mode switch', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('modeChange', eventSpy);

      await page.rootInstance.setMode('wysiwyg');
      await page.waitForChanges();

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail.oldMode).toBe('source');
      expect(eventSpy.mock.calls[0][0].detail.newMode).toBe('wysiwyg');
    });

    it('emits save on Ctrl+S', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('save', eventSpy);

      const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      textarea.value = 'Content';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      await page.waitForChanges();

      // Simulate Ctrl+S
      const keyEvent = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true });
      page.root?.dispatchEvent(keyEvent);
      await page.waitForChanges();

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('methods', () => {
    it('getContent() returns current content', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor value="# Test"></sp-markdown-editor>',
      });

      const content = await page.rootInstance.getContent();
      expect(content).toBe('# Test');
    });

    it('setContent() updates content', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      await page.rootInstance.setContent('Updated content');
      await page.waitForChanges();

      const content = await page.rootInstance.getContent();
      expect(content).toBe('Updated content');
    });

    it('clear() empties content and history', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor value="# Test"></sp-markdown-editor>',
      });

      await page.rootInstance.clear();
      await page.waitForChanges();

      const content = await page.rootInstance.getContent();
      expect(content).toBe('');
    });

    it('getMode() returns current mode', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor mode="split"></sp-markdown-editor>',
      });

      const mode = await page.rootInstance.getMode();
      expect(mode).toBe('split');
    });

    it('setMode() changes mode and emits event', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('modeChange', eventSpy);

      await page.rootInstance.setMode('wysiwyg');
      await page.waitForChanges();

      const mode = await page.rootInstance.getMode();
      expect(mode).toBe('wysiwyg');
      expect(eventSpy).toHaveBeenCalled();
    });

    it('isDirty() returns dirty state', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      // Initially not dirty
      let isDirty = await page.rootInstance.isDirty();
      expect(isDirty).toBe(false);

      // Modify content
      const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      textarea.value = 'Modified';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      await page.waitForChanges();

      isDirty = await page.rootInstance.isDirty();
      expect(isDirty).toBe(true);
    });

    it('focusEditor() focuses textarea', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
      const focusSpy = jest.spyOn(textarea, 'focus');

      await page.rootInstance.focusEditor();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('mode switching', () => {
    it('switching to wysiwyg renders preview', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor value="# Hello"></sp-markdown-editor>',
      });

      await page.rootInstance.setMode('wysiwyg');
      await page.waitForChanges();

      const wysiwygEditor = page.root?.shadowRoot?.querySelector('.wysiwyg-editor');
      expect(wysiwygEditor).toBeTruthy();
    });

    it('switching to split renders both panes', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor value="# Hello"></sp-markdown-editor>',
      });

      await page.rootInstance.setMode('split');
      await page.waitForChanges();

      const sourcePane = page.root?.shadowRoot?.querySelector('.split-source');
      const previewPane = page.root?.shadowRoot?.querySelector('.split-preview');

      expect(sourcePane).toBeTruthy();
      expect(previewPane).toBeTruthy();
    });

    it('switching back to source preserves content', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor value="# Test"></sp-markdown-editor>',
      });

      await page.rootInstance.setMode('wysiwyg');
      await page.waitForChanges();

      await page.rootInstance.setMode('source');
      await page.waitForChanges();

      const content = await page.rootInstance.getContent();
      expect(content).toBe('# Test');
    });
  });

  describe('accessibility', () => {
    it('toolbar buttons have title attributes', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      const buttons = page.root?.shadowRoot?.querySelectorAll('.toolbar-btn');
      buttons?.forEach(btn => {
        expect(btn.getAttribute('title')).toBeTruthy();
      });
    });

    it('textarea has placeholder', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      const textarea = page.root?.shadowRoot?.querySelector('.source-editor');
      expect(textarea?.getAttribute('placeholder')).toBeTruthy();
    });
  });

  describe('word count', () => {
    it('counts words correctly', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      await page.rootInstance.setContent('Hello world');
      await page.waitForChanges();

      const statsText = page.root?.shadowRoot?.querySelector('.stats')?.textContent;
      expect(statsText).toContain('2'); // 2 words
    });

    it('returns 0 words for empty content', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      await page.rootInstance.setContent('');
      await page.waitForChanges();

      const statsText = page.root?.shadowRoot?.querySelector('.stats')?.textContent;
      expect(statsText).toContain('0 words');
    });

    it('handles whitespace-only content', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: '<sp-markdown-editor></sp-markdown-editor>',
      });

      await page.rootInstance.setContent('   \n\n   ');
      await page.waitForChanges();

      const statsText = page.root?.shadowRoot?.querySelector('.stats')?.textContent;
      expect(statsText).toContain('0 words');
    });
  });
});
