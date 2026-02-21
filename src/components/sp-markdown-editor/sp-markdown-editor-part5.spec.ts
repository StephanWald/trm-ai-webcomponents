/**
 * sp-markdown-editor spec part 5 of 5:
 * toolbar button actions + keyboard shortcuts (undo/redo/Z/Y)
 * STRICTLY ≤4 createPage() calls total
 *
 * These tests cover the render() method's onClick arrow functions (lines 674-810)
 * by clicking each toolbar button and verifying content transformation,
 * plus keyboard shortcuts for undo/redo (lines 568-646).
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

function getBtn(page: any, title: string): HTMLButtonElement | undefined {
  return Array.from(page.root?.shadowRoot?.querySelectorAll('.toolbar-btn') ?? [])
    .find((btn: any) => btn.getAttribute('title') === title) as HTMLButtonElement | undefined;
}

// getBtnByText: unused in current tests but available for future toolbar text-match tests
// function getBtnByText(page: any, text: string): HTMLButtonElement | undefined {
//   return Array.from(page.root?.shadowRoot?.querySelectorAll('.toolbar-btn') ?? [])
//     .find((btn: any) => btn.textContent?.trim() === text) as HTMLButtonElement | undefined;
// }

// Page 1: inline formatting buttons (Bold, Italic, Strikethrough, Inline Code, Clear)
it('inline formatting buttons modify content correctly', async () => {
  const page = await createPage('<sp-markdown-editor value="hello"></sp-markdown-editor>');
  const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;

  // Set selection to cover full text
  textarea.selectionStart = 0;
  textarea.selectionEnd = 5;

  // Bold
  getBtn(page, 'Bold (Ctrl+B)')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('**');

  // Reset
  await page.rootInstance.setContent('test');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;

  // Italic
  getBtn(page, 'Italic (Ctrl+I)')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('_test_');

  // Strikethrough
  await page.rootInstance.setContent('test');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;
  getBtn(page, 'Strikethrough')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('~~test~~');

  // Inline Code
  await page.rootInstance.setContent('test');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;
  getBtn(page, 'Inline Code')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('`test`');

  // Clear Formatting
  await page.rootInstance.setContent('**bold**');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 8;
  getBtn(page, 'Clear Formatting')?.click();
  await page.waitForChanges();
  const cleared = await page.rootInstance.getContent();
  expect(cleared).not.toContain('**');
});

// Page 2: heading + block formatting + list buttons
it('heading, blockquote, code block, link, list buttons work', async () => {
  const page = await createPage('<sp-markdown-editor value="line one"></sp-markdown-editor>');
  const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;

  textarea.selectionStart = 0;
  textarea.selectionEnd = 0;

  // H1
  getBtn(page, 'Heading 1')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('# ');

  // H2
  await page.rootInstance.setContent('line');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;
  getBtn(page, 'Heading 2')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('## ');

  // H3
  await page.rootInstance.setContent('line');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;
  getBtn(page, 'Heading 3')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('### ');

  // Blockquote
  await page.rootInstance.setContent('line');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;
  getBtn(page, 'Blockquote')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('> ');

  // Code Block
  await page.rootInstance.setContent('code');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;
  getBtn(page, 'Code Block')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('```');

  // Link (Ctrl+K)
  await page.rootInstance.setContent('text');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;
  getBtn(page, 'Link (Ctrl+K)')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('[text](https://)');

  // Bullet list
  await page.rootInstance.setContent('item');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;
  getBtn(page, 'Bullet List')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('- ');

  // Numbered list
  await page.rootInstance.setContent('item');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;
  getBtn(page, 'Numbered List')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('1. ');

  // Task list
  await page.rootInstance.setContent('item');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;
  getBtn(page, 'Task List')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('- [ ] ');
});

// Page 3: insert buttons (Image, Table, HR)
it('insert buttons (image, table, horizontal rule) work', async () => {
  const page = await createPage('<sp-markdown-editor value="start"></sp-markdown-editor>');
  const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;

  // Image
  textarea.selectionStart = 5;
  textarea.selectionEnd = 5;
  getBtn(page, 'Insert Image')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('![alt text](url)');

  // Table
  await page.rootInstance.setContent('');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 0;
  getBtn(page, 'Insert Table')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('| Header1 |');

  // Horizontal Rule
  await page.rootInstance.setContent('before');
  await page.waitForChanges();
  textarea.selectionStart = 6;
  textarea.selectionEnd = 6;
  getBtn(page, 'Horizontal Rule')?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('---');
});

// Page 4: undo/redo buttons + keyboard shortcuts Ctrl+Z/Y
it('undo/redo buttons and keyboard shortcuts work', async () => {
  const page = await createPage('<sp-markdown-editor></sp-markdown-editor>');

  // Set some content to create history
  await page.rootInstance.setContent('first');
  await page.waitForChanges();
  await page.rootInstance.setContent('second');
  await page.waitForChanges();
  await page.rootInstance.setContent('third');
  await page.waitForChanges();

  // Undo button
  const undoBtn = getBtn(page, 'Undo (Ctrl+Z)');
  undoBtn?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toBe('second');

  // Undo again
  undoBtn?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toBe('first');

  // Redo button
  const redoBtn = getBtn(page, 'Redo (Ctrl+Y)');
  redoBtn?.click();
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toBe('second');

  // Keyboard shortcuts: Ctrl+Z (undo)
  page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toBe('first');

  // Keyboard shortcut: Ctrl+Y (redo)
  page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true }));
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toBe('second');

  // Keyboard shortcut: Ctrl+Shift+Z (redo)
  page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true }));
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toBe('third');

  // Keyboard shortcut: Ctrl+B (bold)
  const textarea = page.root?.shadowRoot?.querySelector('.source-editor') as HTMLTextAreaElement;
  textarea.selectionStart = 0;
  textarea.selectionEnd = 5;
  page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true }));
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('**');

  // Keyboard shortcut: Ctrl+I (italic)
  await page.rootInstance.setContent('text');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;
  page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'i', ctrlKey: true, bubbles: true }));
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('_text_');

  // Keyboard shortcut: Ctrl+K (link)
  await page.rootInstance.setContent('url');
  await page.waitForChanges();
  textarea.selectionStart = 0;
  textarea.selectionEnd = 3;
  page.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('[url](https://)');
});
