/**
 * sp-markdown-editor spec part 3 of 4:
 * voice dictation, import file operations
 * STRICTLY ≤5 createPage() calls total (complex mocks = higher memory per page)
 *
 * NOTE: Stencil newSpecPage() creates a MockWindow (not JSDOM window).
 * Browser APIs like SpeechRecognition set on (window as any) in tests are NOT visible
 * to the component. Must mock speechRecognizer on rootInstance directly after page creation.
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

/**
 * Set up a mock speech recognizer on the rootInstance.
 * Since newSpecPage uses MockWindow (not JSDOM window), we must replace
 * the speechRecognizer property directly and trigger a re-render.
 * Returns the mock and callbacks captured from start().
 */
function setupMockSpeechRecognizer(page: any) {
  let capturedOnResult: ((text: string, isFinal: boolean) => void) | null = null;
  let capturedOnError: ((error: string) => void) | null = null;
  const mockSpeechRecognizer = {
    isSupported: jest.fn(() => true),
    start: jest.fn((onResult: (text: string, isFinal: boolean) => void, onError: (error: string) => void) => {
      capturedOnResult = onResult;
      capturedOnError = onError;
    }),
    stop: jest.fn(),
    isActive: jest.fn(() => false),
    destroy: jest.fn(),
  };
  page.rootInstance.speechRecognizer = mockSpeechRecognizer;
  return { mockSpeechRecognizer, getOnResult: () => capturedOnResult, getOnError: () => capturedOnError };
}

function findVoiceBtn(page: any): HTMLButtonElement {
  return Array.from(page.root?.shadowRoot?.querySelectorAll('.toolbar-btn') ?? [])
    .find((btn: any) => btn.textContent?.trim() === '🎤') as HTMLButtonElement;
}

// Page 1: voice start/stop/result
it('voice dictation: start, receive final result, stop; webkit SpeechRecognizer isSupported', async () => {
  const page = await createPage('<sp-markdown-editor value="Hello"></sp-markdown-editor>');
  const { mockSpeechRecognizer, getOnResult } = setupMockSpeechRecognizer(page);

  // Trigger re-render so voice button appears (isSupported() now returns true)
  // Must change state to a different value to actually trigger re-render
  page.rootInstance.isListening = true;
  await page.waitForChanges();
  page.rootInstance.isListening = false;
  await page.waitForChanges();

  const voiceBtn = findVoiceBtn(page);
  expect(voiceBtn).toBeTruthy();

  // Start listening
  voiceBtn?.click();
  await page.waitForChanges();
  expect(page.rootInstance.isListening).toBe(true);
  expect(mockSpeechRecognizer.start).toHaveBeenCalled();

  // Simulate final result
  const onResult = getOnResult();
  expect(onResult).not.toBeNull();
  onResult!(' world', true);
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toContain('world');

  // Stop listening
  page.rootInstance.isListening = true; // simulate still listening
  await page.waitForChanges();
  page.rootInstance['handleVoiceToggle']();
  await page.waitForChanges();
  expect(mockSpeechRecognizer.stop).toHaveBeenCalled();
  expect(page.rootInstance.isListening).toBe(false);

  // Verify webkit SpeechRecognizer isSupported logic directly via JSDOM window
  delete (window as any).SpeechRecognition;
  delete (window as any).webkitSpeechRecognition;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SpeechRecognizer: SR } = require('./utils/speech-recognizer');
  // No recognition available -> not supported
  const unsupported = new SR();
  expect(unsupported.isSupported()).toBe(false);
  // webkit fallback -> supported
  const mockRecog = { start: jest.fn(), stop: jest.fn(), continuous: false, interimResults: false, lang: '' };
  (window as any).webkitSpeechRecognition = jest.fn(() => mockRecog);
  const supported = new SR();
  expect(supported.isSupported()).toBe(true);
  delete (window as any).webkitSpeechRecognition;
});

// Page 2: voice interim results + error handling
it('voice dictation: interim not appended, error resets isListening', async () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  const page = await createPage('<sp-markdown-editor value="Hello"></sp-markdown-editor>');
  const { getOnResult, getOnError } = setupMockSpeechRecognizer(page);

  // Start listening
  page.rootInstance.isListening = false;
  await page.waitForChanges();
  page.rootInstance['handleVoiceToggle']();
  await page.waitForChanges();
  expect(page.rootInstance.isListening).toBe(true);

  const initialContent = await page.rootInstance.getContent();

  // Simulate interim result (isFinal = false) - should NOT append
  const onResult = getOnResult();
  onResult!('interim text', false);
  await page.waitForChanges();
  expect(await page.rootInstance.getContent()).toBe(initialContent);

  // Simulate error - should reset isListening
  const onError = getOnError();
  expect(onError).not.toBeNull();
  onError!('network');
  await page.waitForChanges();
  expect(page.rootInstance.isListening).toBe(false);
  expect(consoleSpy).toHaveBeenCalledWith('Speech recognition error:', 'network');

  consoleSpy.mockRestore();
});

// Page 3: import file input trigger
describe('import file trigger', () => {
  it('import button triggers file input click', async () => {
    const page = await createPage();
    const fileInput = page.root?.shadowRoot?.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(fileInput, 'click');
    const importBtn = Array.from(page.root?.shadowRoot?.querySelectorAll('.toolbar-btn') ?? [])
      .find((btn: any) => btn.textContent?.trim() === '↓') as HTMLButtonElement;
    importBtn?.click();
    await page.waitForChanges();
    expect(clickSpy).toHaveBeenCalled();
  });
});

// Page 4: import file content (no-op and successful load)
describe('import file content', () => {
  it('no file is no-op, file loads content and emits importFile', async () => {
    const page = await createPage();
    const importSpy = jest.fn();
    page.root?.addEventListener('importFile', importSpy);
    const fileInput = page.root?.shadowRoot?.querySelector('input[type="file"]') as HTMLInputElement;

    // no-file no-op
    Object.defineProperty(fileInput, 'files', { value: [], configurable: true });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await page.waitForChanges();
    expect(await page.rootInstance.getContent()).toBe('');

    // successful load
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
    expect(importSpy).toHaveBeenCalled();
  });
});

// Page 5: import file error
describe('import file error', () => {
  it('file read error logs error to console', async () => {
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
});
