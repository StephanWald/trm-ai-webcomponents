/**
 * MarkdownRenderer - Markdown to HTML conversion with sanitization
 *
 * Pattern 4: Uses marked for parsing with GFM support, DOMPurify for sanitization.
 * Prism integration for syntax highlighting with fallback.
 */
export class MarkdownRenderer {
  private marked: any = null;
  private DOMPurify: any = null;
  private hasPrism: boolean = false;

  constructor() {
    // Try to import marked (peer dependency)
    try {
      this.marked = (window as any).marked;
      if (!this.marked) {
        // Try dynamic import if available
        if (typeof require !== 'undefined') {
          this.marked = require('marked');
        }
      }
    } catch (e) {
      console.warn('marked library not found - markdown rendering will use plaintext fallback');
    }

    // Try to import DOMPurify (peer dependency)
    try {
      this.DOMPurify = (window as any).DOMPurify;
      if (!this.DOMPurify) {
        if (typeof require !== 'undefined') {
          this.DOMPurify = require('dompurify');
        }
      }
    } catch (e) {
      console.warn('DOMPurify library not found - HTML sanitization will be disabled');
    }

    // Check for Prism availability
    this.hasPrism = typeof (window as any).Prism !== 'undefined';

    // Configure marked if available
    if (this.marked) {
      this.marked.setOptions({
        gfm: true,
        breaks: false,
        headerIds: true,
        mangle: false,
      });

      // Configure custom renderer for syntax highlighting
      const renderer = new this.marked.Renderer();
      const originalCode = renderer.code.bind(renderer);

      renderer.code = (code: string, language: string | undefined) => {
        if (this.hasPrism && language) {
          try {
            const Prism = (window as any).Prism;
            const grammar = Prism.languages[language];
            if (grammar) {
              const highlighted = Prism.highlight(code, grammar, language);
              return `<pre class="language-${language}"><code class="language-${language}">${highlighted}</code></pre>`;
            }
          } catch (e) {
            // Fall through to default rendering
          }
        }
        return originalCode(code, language);
      };

      this.marked.use({ renderer });
    }
  }

  /**
   * Render markdown to sanitized HTML
   * @param markdown Markdown source text
   * @returns Sanitized HTML string
   */
  render(markdown: string): string {
    // Fallback if marked is not available
    if (!this.marked) {
      return this.escapeHtml(markdown);
    }

    try {
      // Parse markdown to HTML
      const html = this.marked.parse(markdown);

      // Sanitize if DOMPurify is available
      if (this.DOMPurify) {
        return this.DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'del', 's', 'code', 'pre',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'blockquote',
            'a', 'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'hr',
            'input', 'span', 'div'
          ],
          ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'class',
            'type', 'checked', 'disabled'
          ],
        });
      }

      return html;
    } catch (e) {
      console.error('Markdown rendering failed:', e);
      return this.escapeHtml(markdown);
    }
  }

  /**
   * Escape HTML special characters
   * @param text Text to escape
   * @returns Escaped text
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
