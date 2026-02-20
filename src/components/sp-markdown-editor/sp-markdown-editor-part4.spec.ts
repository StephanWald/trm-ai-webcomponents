/**
 * sp-markdown-editor spec part 4 of 4:
 * export, print, fallback rendering
 * STRICTLY ≤4 createPage() calls total
 *
 * NOTE: jest.spyOn(document, 'createElement') must be set up AFTER createPage()
 * because Stencil creates many elements during rendering, and spying on createElement
 * BEFORE page creation causes excessive spy call accumulation and OOM.
 *
 * NOTE: window.open in tests refers to MockWindow.open (via Stencil testing env),
 * need to spy on page.win.open instead of window.open, or call handler directly.
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

// Page 1: export
describe('export', () => {
  it('export button emits exportFile event with .md filename', async () => {
    // Create page FIRST before setting up any document spies
    const page = await createPage('<sp-markdown-editor value="# Export"></sp-markdown-editor>');
    const exportSpy = jest.fn();
    page.root?.addEventListener('exportFile', exportSpy);

    // Set up mocks AFTER page creation to avoid intercepting Stencil's render
    (URL as any).createObjectURL = jest.fn(() => 'blob:mock-url');
    (URL as any).revokeObjectURL = jest.fn();
    const mockAnchor = { href: '', download: '', click: jest.fn(), style: {} };
    const origCreate = document.createElement.bind(document);
    const createSpy = jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor as any;
      return origCreate(tag);
    });
    const appendSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
    const removeSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);

    const exportBtn = Array.from(page.root?.shadowRoot?.querySelectorAll('.toolbar-btn') ?? [])
      .find((btn: any) => btn.textContent?.trim() === '↑') as HTMLButtonElement;
    exportBtn?.click();
    await page.waitForChanges();

    expect(exportSpy).toHaveBeenCalled();
    expect(exportSpy.mock.calls[0][0].detail.filename).toContain('.md');

    // Clean up spies to prevent memory retention
    createSpy.mockRestore();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });
});

// Page 2: print success
// Note: window.open in component code refers to MockWindow.open, not JSDOM window.
// We call handlePrint directly to avoid button-click path, and spy on page.win.open.
describe('print success', () => {
  it('print handler opens window, writes content, calls print after delay', async () => {
    const page = await createPage('<sp-markdown-editor value="# Print test"></sp-markdown-editor>');

    const mockPrintWindow = {
      document: { write: jest.fn(), close: jest.fn() },
      focus: jest.fn(), print: jest.fn(), close: jest.fn(),
    };
    // Spy on the MockWindow's open method (the window the component uses)
    (page.win as any).open = jest.fn(() => mockPrintWindow);

    // Call the print handler directly (avoids JSDOM window vs MockWindow mismatch)
    page.rootInstance['handlePrint']();
    await page.waitForChanges();

    expect((page.win as any).open).toHaveBeenCalledWith('', '_blank');
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    expect(mockPrintWindow.document.close).toHaveBeenCalled();
    // Wait for the 250ms setTimeout inside printDocument
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(mockPrintWindow.print).toHaveBeenCalled();
    expect(mockPrintWindow.close).toHaveBeenCalled();
  });
});

// Page 3: print failure
describe('print failure', () => {
  it('print logs error when window.open returns null', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const page = await createPage();

    // Spy on MockWindow.open to return null
    (page.win as any).open = jest.fn(() => null);

    page.rootInstance['handlePrint']();
    await page.waitForChanges();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to open print window');
    consoleSpy.mockRestore();
  });
});

// Page 4: fallback rendering without DWC theme
describe('fallback rendering without DWC theme', () => {
  it('full structure, content, stats, and modes functional', async () => {
    const page = await createPage('<sp-markdown-editor value="# Test content"></sp-markdown-editor>');
    expect(page.root?.shadowRoot?.querySelector('.toolbar-container')).toBeTruthy();
    expect(page.root?.shadowRoot?.querySelector('.source-editor')).toBeTruthy();
    expect(page.root?.shadowRoot?.querySelector('.editor-footer')).toBeTruthy();
    expect(page.root?.shadowRoot?.querySelectorAll('.toolbar-btn')?.length).toBeGreaterThan(0);
    expect(await page.rootInstance.getContent()).toBe('# Test content');
    await page.rootInstance.setContent('Hello world');
    await page.waitForChanges();
    expect(page.root?.shadowRoot?.querySelector('.stats')?.textContent).toContain('2');
    await page.rootInstance.setMode('wysiwyg');
    await page.waitForChanges();
    expect(await page.rootInstance.getMode()).toBe('wysiwyg');
    await page.rootInstance.setMode('source');
    await page.waitForChanges();
    expect(await page.rootInstance.getMode()).toBe('source');
    const tabs = page.root?.shadowRoot?.querySelectorAll('.mode-tab');
    expect(tabs?.length).toBe(3);
    tabs?.forEach((tab: Element) => expect(tab.getAttribute('title')).toBeTruthy());
  });
});
