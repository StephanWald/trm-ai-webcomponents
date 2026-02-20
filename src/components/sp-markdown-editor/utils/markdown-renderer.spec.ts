import { MarkdownRenderer } from './markdown-renderer';

describe('MarkdownRenderer', () => {
  let originalMarked: any;
  let originalDOMPurify: any;
  let originalPrism: any;

  beforeEach(() => {
    // Save original values
    originalMarked = (window as any).marked;
    originalDOMPurify = (window as any).DOMPurify;
    originalPrism = (window as any).Prism;
  });

  afterEach(() => {
    // Restore original values
    (window as any).marked = originalMarked;
    (window as any).DOMPurify = originalDOMPurify;
    (window as any).Prism = originalPrism;
  });

  describe('with marked and DOMPurify available', () => {
    beforeEach(() => {
      // Mock marked
      (window as any).marked = {
        parse: jest.fn((md: string) => `<p>${md}</p>`),
        setOptions: jest.fn(),
        use: jest.fn(),
        Renderer: jest.fn().mockImplementation(() => ({
          code: jest.fn((code: string, _lang?: string) => `<pre><code>${code}</code></pre>`),
        })),
      };

      // Mock DOMPurify
      (window as any).DOMPurify = {
        sanitize: jest.fn((html: string) => html),
      };
    });

    it('calls marked.parse with input', () => {
      const renderer = new MarkdownRenderer();
      renderer.render('# Hello');

      expect((window as any).marked.parse).toHaveBeenCalledWith('# Hello');
    });

    it('calls DOMPurify.sanitize on marked output', () => {
      const renderer = new MarkdownRenderer();
      renderer.render('# Hello');

      expect((window as any).DOMPurify.sanitize).toHaveBeenCalledWith(
        '<p># Hello</p>',
        expect.objectContaining({
          ALLOWED_TAGS: expect.any(Array),
          ALLOWED_ATTR: expect.any(Array),
        })
      );
    });

    it('returns sanitized HTML', () => {
      (window as any).DOMPurify.sanitize = jest.fn((html: string) => `sanitized:${html}`);
      const renderer = new MarkdownRenderer();
      const result = renderer.render('# Hello');

      expect(result).toBe('sanitized:<p># Hello</p>');
    });

    it('handles empty string', () => {
      const renderer = new MarkdownRenderer();
      const result = renderer.render('');

      expect(result).toBe('<p></p>');
    });

    it('handles special characters', () => {
      const renderer = new MarkdownRenderer();
      renderer.render('<script>alert("xss")</script>');

      expect((window as any).marked.parse).toHaveBeenCalled();
      expect((window as any).DOMPurify.sanitize).toHaveBeenCalled();
    });
  });

  describe('without marked', () => {
    beforeEach(() => {
      (window as any).marked = undefined;
      (window as any).DOMPurify = undefined;

      // Suppress console warnings in tests
      jest.spyOn(console, 'warn').mockImplementation();
    });

    it('returns escaped HTML as fallback', () => {
      const renderer = new MarkdownRenderer();
      const result = renderer.render('# Hello');

      // Should escape as plain text
      expect(result).not.toContain('<p>');
      expect(result).toContain('# Hello');
    });

    it('escapes special characters', () => {
      const renderer = new MarkdownRenderer();
      const result = renderer.render('<script>alert("xss")</script>');

      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&lt;/script&gt;');
    });

    it('handles empty string', () => {
      const renderer = new MarkdownRenderer();
      const result = renderer.render('');

      expect(result).toBe('');
    });
  });

  describe('without DOMPurify', () => {
    beforeEach(() => {
      (window as any).marked = {
        parse: jest.fn((md: string) => `<p>${md}</p>`),
        setOptions: jest.fn(),
        use: jest.fn(),
        Renderer: jest.fn().mockImplementation(() => ({
          code: jest.fn((code: string, _lang?: string) => `<pre><code>${code}</code></pre>`),
        })),
      };
      (window as any).DOMPurify = undefined;

      jest.spyOn(console, 'warn').mockImplementation();
    });

    it('returns unsanitized HTML from marked', () => {
      const renderer = new MarkdownRenderer();
      const result = renderer.render('# Hello');

      expect(result).toBe('<p># Hello</p>');
    });

    it('does not call sanitize', () => {
      const renderer = new MarkdownRenderer();
      renderer.render('# Hello');

      // Should not crash, just returns raw HTML
      expect((window as any).marked.parse).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      // Mock marked to throw error
      (window as any).marked = {
        parse: jest.fn(() => {
          throw new Error('Parse error');
        }),
        setOptions: jest.fn(),
        use: jest.fn(),
        Renderer: jest.fn().mockImplementation(() => ({
          code: jest.fn(),
        })),
      };
      (window as any).DOMPurify = {
        sanitize: jest.fn((html: string) => html),
      };

      jest.spyOn(console, 'error').mockImplementation();
    });

    it('falls back to escaped text on parse error', () => {
      const renderer = new MarkdownRenderer();
      const result = renderer.render('# Hello');

      expect(result).toContain('# Hello');
      expect(console.error).toHaveBeenCalledWith('Markdown rendering failed:', expect.any(Error));
    });
  });

  describe('Prism integration', () => {
    let capturedCodeRenderer: ((code: string, language: string | undefined) => string) | null = null;
    let mockOriginalCode: jest.Mock;

    beforeEach(() => {
      capturedCodeRenderer = null;
      mockOriginalCode = jest.fn((code: string, _lang?: string) => `<pre><code>${code}</code></pre>`);

      (window as any).marked = {
        parse: jest.fn((md: string) => `<p>${md}</p>`),
        setOptions: jest.fn(),
        use: jest.fn((opts: any) => {
          // Capture the renderer that gets configured
          if (opts && opts.renderer && opts.renderer.code) {
            capturedCodeRenderer = opts.renderer.code;
          }
        }),
        Renderer: jest.fn().mockImplementation(function() {
          this.code = mockOriginalCode;
          return this;
        }),
      };
      (window as any).DOMPurify = {
        sanitize: jest.fn((html: string) => html),
      };
    });

    it('detects Prism availability', () => {
      (window as any).Prism = {
        languages: {
          javascript: {},
        },
        highlight: jest.fn((code: string) => code),
      };

      const renderer = new MarkdownRenderer();
      // Constructor should detect Prism
      expect(renderer).toBeTruthy();
    });

    it('works without Prism', () => {
      (window as any).Prism = undefined;

      const renderer = new MarkdownRenderer();
      const result = renderer.render('```js\nconst x = 1;\n```');

      // Should still render without syntax highlighting
      expect(result).toBeTruthy();
    });

    it('uses Prism syntax highlighting when available with a known language', () => {
      const mockHighlight = jest.fn((code: string) => `<span class="token">${code}</span>`);
      (window as any).Prism = {
        languages: {
          javascript: { js: true },
        },
        highlight: mockHighlight,
      };

      new MarkdownRenderer();

      // Directly invoke the captured code renderer (lines 54-67)
      expect(capturedCodeRenderer).not.toBeNull();
      const result = capturedCodeRenderer!('const x = 1;', 'javascript');

      expect(result).toContain('language-javascript');
      expect(result).toContain('<pre class="language-javascript">');
      expect(mockHighlight).toHaveBeenCalledWith('const x = 1;', { js: true }, 'javascript');
    });

    it('falls through to default rendering when language has no Prism grammar', () => {
      (window as any).Prism = {
        languages: {
          // 'unknownlang' not present
        },
        highlight: jest.fn(),
      };

      new MarkdownRenderer();

      expect(capturedCodeRenderer).not.toBeNull();
      const result = capturedCodeRenderer!('some code', 'unknownlang');

      // Should fall back to original code renderer
      expect(mockOriginalCode).toHaveBeenCalledWith('some code', 'unknownlang');
      expect(result).toContain('<pre><code>some code</code></pre>');
    });

    it('falls through to default rendering when no language is provided', () => {
      (window as any).Prism = {
        languages: { javascript: {} },
        highlight: jest.fn(),
      };

      new MarkdownRenderer();

      expect(capturedCodeRenderer).not.toBeNull();
      // language is undefined - hasPrism is true but language is falsy
      const result = capturedCodeRenderer!('some code', undefined);

      // Should fall back to original code renderer
      expect(mockOriginalCode).toHaveBeenCalledWith('some code', undefined);
      expect(result).toContain('<pre><code>some code</code></pre>');
    });

    it('handles Prism.highlight throwing an error gracefully', () => {
      (window as any).Prism = {
        languages: {
          javascript: { js: true },
        },
        highlight: jest.fn(() => {
          throw new Error('Prism error');
        }),
      };

      new MarkdownRenderer();

      expect(capturedCodeRenderer).not.toBeNull();
      // Should not throw - falls back to original renderer
      const result = capturedCodeRenderer!('const x = 1;', 'javascript');

      expect(mockOriginalCode).toHaveBeenCalled();
      expect(result).toContain('<pre><code>const x = 1;</code></pre>');
    });
  });
});
