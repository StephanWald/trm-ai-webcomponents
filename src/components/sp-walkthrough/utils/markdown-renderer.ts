/**
 * MarkdownRenderer - Markdown to HTML conversion for sp-walkthrough scene descriptions.
 *
 * Copied from sp-markdown-editor/utils/markdown-renderer.ts to avoid cross-component
 * bundling issues in Stencil. Uses marked for parsing (if available) with DOMPurify
 * for sanitization, and plain-text fallback when libraries are not present.
 */
export class MarkdownRenderer {
  private marked: any = null;
  private DOMPurify: any = null;

  constructor() {
    // Try to import marked (peer dependency)
    try {
      this.marked = (window as any).marked;
      if (!this.marked) {
        if (typeof require !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          this.marked = require('marked');
        }
      }
    } catch (e) {
      // marked not available — will use plaintext fallback
    }

    // Try to import DOMPurify (peer dependency)
    try {
      this.DOMPurify = (window as any).DOMPurify;
      if (!this.DOMPurify) {
        if (typeof require !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          this.DOMPurify = require('dompurify');
        }
      }
    } catch (e) {
      // DOMPurify not available — HTML sanitization will be skipped
    }

    // Configure marked if available
    if (this.marked) {
      try {
        this.marked.setOptions({
          gfm: true,
          breaks: false,
        });
      } catch (e) {
        // Older versions of marked may not support all options — ignore
      }
    }
  }

  /**
   * Render markdown to sanitized HTML.
   * Falls back to escaped plaintext when marked is not available.
   */
  render(markdown: string): string {
    if (!markdown) return '';

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
            'hr', 'span', 'div',
          ],
          ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'class',
            'type', 'checked', 'disabled',
          ],
        });
      }

      return html;
    } catch (e) {
      return this.escapeHtml(markdown);
    }
  }

  /**
   * Escape HTML special characters for plaintext fallback
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
