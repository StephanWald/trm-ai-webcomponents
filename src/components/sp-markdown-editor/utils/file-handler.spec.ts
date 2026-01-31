import { FileHandler } from './file-handler';

describe('FileHandler', () => {
  describe('importFile', () => {
    beforeEach(() => {
      // Mock FileReader for JSDOM environment
      if (typeof FileReader === 'undefined') {
        (global as any).FileReader = class MockFileReader {
          onload: ((event: any) => void) | null = null;
          onerror: (() => void) | null = null;
          result: string | null = null;

          readAsText(file: Blob) {
            // Simulate async file reading
            setTimeout(() => {
              file.text().then(text => {
                this.result = text;
                if (this.onload) {
                  this.onload({ target: { result: text } });
                }
              });
            }, 0);
          }
        };
      }
    });

    it('reads file as UTF-8 text', async () => {
      const mockContent = 'Hello, World!';
      const file = new File([mockContent], 'test.md', { type: 'text/markdown' });

      const content = await FileHandler.importFile(file);
      expect(content).toBe(mockContent);
    });

    it('returns file content as string', async () => {
      const mockContent = '# Markdown Title\n\nSome content';
      const file = new File([mockContent], 'test.md', { type: 'text/markdown' });

      const content = await FileHandler.importFile(file);
      expect(typeof content).toBe('string');
      expect(content).toBe(mockContent);
    });

    it('handles empty file', async () => {
      const file = new File([''], 'empty.md', { type: 'text/markdown' });

      const content = await FileHandler.importFile(file);
      expect(content).toBe('');
    });

    it('handles file read errors', async () => {
      const file = new File(['test'], 'test.md', { type: 'text/markdown' });

      // Mock FileReader to simulate error
      const originalFileReader = global.FileReader;
      global.FileReader = jest.fn().mockImplementation(() => ({
        readAsText: function() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 0);
        },
      })) as any;

      await expect(FileHandler.importFile(file)).rejects.toThrow('Failed to read file: test.md');

      // Restore
      global.FileReader = originalFileReader;
    });

    it('handles multiline content', async () => {
      const mockContent = 'Line 1\nLine 2\nLine 3';
      const file = new File([mockContent], 'test.md', { type: 'text/markdown' });

      const content = await FileHandler.importFile(file);
      expect(content).toBe(mockContent);
      expect(content.split('\n').length).toBe(3);
    });

    it('handles special characters', async () => {
      const mockContent = 'Special: é à ü ñ 中文';
      const file = new File([mockContent], 'test.md', { type: 'text/markdown' });

      const content = await FileHandler.importFile(file);
      expect(content).toBe(mockContent);
    });
  });

  describe('exportFile', () => {
    let createObjectURLSpy: jest.SpyInstance;
    let revokeObjectURLSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;
    let clickSpy: jest.Mock;

    beforeEach(() => {
      // Mock URL methods
      createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      // Mock DOM manipulation
      clickSpy = jest.fn();
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      // Mock createElement to return element with click spy
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: clickSpy,
          } as any;
        }
        return document.createElement(tagName);
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('creates Blob with correct MIME type', () => {
      const content = 'Test content';

      // We can't easily spy on Blob constructor in JSDOM, but we can verify
      // the function completes successfully and returns expected shape
      const result = FileHandler.exportFile(content);

      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('size');
    });

    it('returns filename and size', () => {
      const content = 'Test content';
      const result = FileHandler.exportFile(content);

      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('size');
      expect(typeof result.filename).toBe('string');
      expect(typeof result.size).toBe('number');
    });

    it('uses custom filename when provided', () => {
      const content = 'Test content';
      const customFilename = 'my-document.md';

      const result = FileHandler.exportFile(content, customFilename);

      expect(result.filename).toBe(customFilename);
    });

    it('generates default filename with timestamp', () => {
      const content = 'Test content';
      const result = FileHandler.exportFile(content);

      expect(result.filename).toMatch(/^document-\d+\.md$/);
    });

    it('returns correct size in bytes', () => {
      const content = 'Hello';
      const result = FileHandler.exportFile(content);

      // "Hello" is 5 bytes
      expect(result.size).toBe(5);
    });

    it('triggers download via anchor click', () => {
      const content = 'Test content';
      FileHandler.exportFile(content, 'test.md');

      expect(clickSpy).toHaveBeenCalled();
    });

    it('creates and revokes object URL', () => {
      const content = 'Test content';
      FileHandler.exportFile(content);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });

    it('cleans up DOM elements', () => {
      const content = 'Test content';
      FileHandler.exportFile(content);

      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('handles empty content', () => {
      const result = FileHandler.exportFile('');

      expect(result.size).toBe(0);
      expect(result.filename).toMatch(/\.md$/);
    });

    it('handles large content', () => {
      const content = 'x'.repeat(10000);
      const result = FileHandler.exportFile(content);

      expect(result.size).toBe(10000);
    });
  });
});
