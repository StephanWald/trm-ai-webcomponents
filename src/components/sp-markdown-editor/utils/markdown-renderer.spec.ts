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
    beforeEach(() => {
      (window as any).marked = {
        parse: jest.fn((md: string) => `<p>${md}</p>`),
        setOptions: jest.fn(),
        use: jest.fn(),
        Renderer: jest.fn().mockImplementation(function() {
          this.code = jest.fn((code: string, _lang?: string) => `<pre><code>${code}</code></pre>`);
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
  });
});
