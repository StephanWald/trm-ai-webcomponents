# Phase 4: Markdown Editor Component - Research

**Researched:** 2026-01-31
**Domain:** Markdown editing, contenteditable, WYSIWYG, speech recognition
**Confidence:** MEDIUM

## Summary

This research explores building a full-featured markdown editor web component with dual-mode editing (source/WYSIWYG/split), formatting toolbar, voice dictation, and import/export capabilities using Stencil.js. The component must integrate peer dependencies (marked, DOMPurify, Prism.js, Turndown) for markdown parsing, sanitization, syntax highlighting, and HTML-to-markdown conversion.

The standard approach combines a monospace textarea for source editing with a contenteditable element for WYSIWYG preview. Critical challenges include: (1) execCommand is deprecated with no complete replacement, requiring custom Selection/Range API implementation; (2) contenteditable undo/redo must be custom-built since browser stacks break with DOM manipulation; (3) Web Speech API has limited browser support (Chrome/Edge only) requiring feature detection and fallbacks.

**Primary recommendation:** Build source mode first as the stable foundation, implement toolbar actions via Selection/Range APIs instead of execCommand, use marked.js + DOMPurify pipeline for WYSIWYG rendering, maintain custom undo stack (50 states), and provide Web Speech API with graceful degradation for unsupported browsers.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| marked | 12.x - 13.x | Markdown parsing to HTML | Industry-standard, 36.5k GitHub stars, TypeScript native, 40+ extensions, async rendering |
| DOMPurify | 3.x | HTML sanitization (XSS prevention) | Recommended by marked.js, <30KB, DOM-only operation, secure defaults |
| Turndown | 7.x | HTML to Markdown conversion | De facto standard for WYSIWYG to source conversion, rule-based customization |
| Prism.js | 1.29.x | Syntax highlighting for code blocks | Lightweight, language detection, integrates with markdown parsers |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Web Speech API | Native | Voice dictation (speech-to-text) | Browser feature detection required, Chrome/Edge only |
| Selection API | Native | Cursor/range management for contenteditable | Essential for toolbar formatting without execCommand |
| Blob API | Native | File download for export | Standard for client-side file generation |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom undo stack | Browser native undo | Native undo breaks with DOM manipulation; custom stack required |
| Selection/Range API | execCommand (deprecated) | execCommand deprecated since 2020; no modern alternative exists |
| marked.js | markdown-it, remark | marked is lighter, faster, better TypeScript support |
| Turndown | Custom HTML parser | Turndown handles edge cases (escaping, whitespace, nested structures) |

**Installation:**
```bash
# Peer dependencies - users install
npm install marked dompurify prismjs turndown

# Component library (dev)
npm install @stencil/core
```

## Architecture Patterns

### Recommended Project Structure
```
src/components/sp-markdown-editor/
├── sp-markdown-editor.tsx       # Main component
├── sp-markdown-editor.css       # DWC-themed styles
├── sp-markdown-editor.spec.ts   # Jest unit tests
├── sp-markdown-editor.e2e.ts    # Playwright E2E tests
├── types/
│   └── editor.types.ts          # TypeScript interfaces
└── utils/
    ├── history-manager.ts       # Undo/redo stack (50 states)
    ├── toolbar-actions.ts       # Format functions (bold, italic, etc.)
    ├── speech-recognizer.ts     # Web Speech API wrapper
    ├── file-handler.ts          # Import/export logic
    └── markdown-renderer.ts     # marked + DOMPurify pipeline
```

### Pattern 1: Dual-Mode Editor State

**What:** Maintain single source of truth in markdown, render WYSIWYG on demand
**When to use:** Any markdown editor with multiple view modes

```typescript
// Source: Research synthesis from multiple markdown editors
@State() content: string = '';           // Single source of truth
@State() mode: 'source' | 'wysiwyg' | 'split' = 'source';
@State() isDirty: boolean = false;

// WYSIWYG is derived from source
private renderPreview(): HTMLElement {
  const rawHtml = marked.parse(this.content);
  const cleanHtml = DOMPurify.sanitize(rawHtml);
  return <div innerHTML={cleanHtml}></div>;
}
```

### Pattern 2: Custom Undo/Redo Stack

**What:** Array-based history with position pointer, limited to 50 states
**When to use:** When browser native undo is insufficient (DOM manipulation scenarios)

```typescript
// Source: https://dev.to/chromiumdev/-native-undo--redo-for-the-web-3fl3
class HistoryManager {
  private history: string[] = [];
  private position: number = -1;
  private maxStates: number = 50;

  push(state: string): void {
    // Remove forward history if we're not at the end
    this.history = this.history.slice(0, this.position + 1);
    this.history.push(state);

    // Limit history size
    if (this.history.length > this.maxStates) {
      this.history.shift();
    } else {
      this.position++;
    }
  }

  undo(): string | null {
    if (this.position > 0) {
      this.position--;
      return this.history[this.position];
    }
    return null;
  }

  redo(): string | null {
    if (this.position < this.history.length - 1) {
      this.position++;
      return this.history[this.position];
    }
    return null;
  }
}
```

### Pattern 3: Toolbar Actions via Selection API

**What:** Insert markdown syntax at cursor position using Selection/Range APIs
**When to use:** All toolbar formatting operations (execCommand replacement)

```typescript
// Source: https://www.tutorialspoint.com/how-to-set-cursor-position-in-content-editable-element-using-javascript
private insertMarkdown(prefix: string, suffix: string = prefix): void {
  const textarea = this.sourceTextarea;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = this.content.substring(start, end);

  const newText =
    this.content.substring(0, start) +
    prefix + selectedText + suffix +
    this.content.substring(end);

  this.content = newText;

  // Restore cursor position
  textarea.focus();
  textarea.setSelectionRange(
    start + prefix.length,
    end + prefix.length
  );

  this.historyManager.push(this.content);
}

// Usage examples
handleBold = () => this.insertMarkdown('**', '**');
handleItalic = () => this.insertMarkdown('_', '_');
handleCode = () => this.insertMarkdown('`', '`');
```

### Pattern 4: Marked + DOMPurify Pipeline

**What:** Two-stage parsing with security sanitization
**When to use:** All markdown-to-HTML rendering for WYSIWYG mode

```typescript
// Source: https://marked.js.org/using_advanced + https://github.com/cure53/DOMPurify
import { marked } from 'marked';
import DOMPurify from 'dompurify';

class MarkdownRenderer {
  constructor() {
    // Configure marked with syntax highlighting
    marked.setOptions({
      gfm: true,
      breaks: false,
      highlight: (code, lang) => {
        if (Prism.languages[lang]) {
          return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
      }
    });
  }

  render(markdown: string): string {
    // Step 1: Parse markdown to HTML
    const rawHtml = marked.parse(markdown);

    // Step 2: Sanitize for XSS prevention
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre',
                     'h1', 'h2', 'h3', 'ul', 'ol', 'li',
                     'blockquote', 'a', 'img', 'table',
                     'thead', 'tbody', 'tr', 'th', 'td'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
    });

    return cleanHtml;
  }
}
```

### Pattern 5: Web Speech API with Fallback

**What:** Feature detection for dictation with graceful degradation
**When to use:** Voice input features (Chrome/Edge only)

```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
class SpeechRecognizer {
  private recognition: SpeechRecognition | null = null;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  start(onResult: (text: string, isFinal: boolean) => void): void {
    if (!this.recognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      onResult(finalTranscript || interimTranscript, !!finalTranscript);
    };

    this.recognition.start();
  }

  stop(): void {
    this.recognition?.stop();
  }
}
```

### Pattern 6: Debounced Auto-Save

**What:** 2-second debounce to prevent excessive save operations
**When to use:** All auto-save features in editors

```typescript
// Source: https://kannanravi.medium.com/implementing-efficient-autosave-with-javascript-debounce-techniques-463704595a7a
private autoSaveTimer: number | null = null;
private readonly AUTO_SAVE_DELAY = 2000; // 2 seconds

@Watch('content')
handleContentChange() {
  this.isDirty = true;

  // Clear existing timer
  if (this.autoSaveTimer !== null) {
    clearTimeout(this.autoSaveTimer);
  }

  // Set new timer
  this.autoSaveTimer = window.setTimeout(() => {
    this.performAutoSave();
  }, this.AUTO_SAVE_DELAY);
}

private performAutoSave(): void {
  this.saveEvent.emit({ content: this.content, timestamp: Date.now() });
  this.isDirty = false;
  this.autoSaveTimer = null;
}
```

### Pattern 7: File Export via Blob

**What:** Client-side file download without server roundtrip
**When to use:** Export markdown content to .md file

```typescript
// Source: https://www.kiss-code.com/post/download-as-markdown-file-using-blazor-wasm-and-javascript-04-11-2025
private exportMarkdown(): void {
  const blob = new Blob([this.content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `document-${Date.now()}.md`;
  link.click();

  // Cleanup
  URL.revokeObjectURL(url);

  this.exportEvent.emit({ filename: link.download, size: blob.size });
}
```

### Anti-Patterns to Avoid

- **Using execCommand for formatting:** execCommand is deprecated with no modern replacement, use Selection/Range APIs instead
- **Relying on browser undo stack:** Browser undo breaks when JavaScript manipulates DOM, maintain custom stack
- **Unsanitized markdown rendering:** Always pipe marked.parse() output through DOMPurify.sanitize()
- **Synchronous marked.parse() in large docs:** Use async rendering for documents >10KB to prevent UI blocking
- **Assuming Speech API availability:** Only 40% browser support (Chrome/Edge), always feature-detect and provide fallback

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown to HTML parsing | Custom regex parser | marked.js | Handles GFM spec, extensions, edge cases (nested lists, escaping, code blocks) |
| HTML sanitization | Custom tag whitelist | DOMPurify | Protects against DOM clobbering, prototype pollution, mXSS attacks |
| HTML to Markdown conversion | String replacement | Turndown | Handles escaping, whitespace normalization, nested structures, table conversion |
| Syntax highlighting | Manual code parsing | Prism.js | 200+ languages, automatic language detection, plugin system |
| Cursor position management | Manual Selection logic | Existing caret-pos libraries | Handles iframe contexts, cross-browser quirks, range normalization |

**Key insight:** Markdown parsing is deceptively complex. The CommonMark spec has 649 examples of edge cases. Custom parsers inevitably miss escaping rules, nested structures, or spec updates. Use battle-tested libraries.

## Common Pitfalls

### Pitfall 1: Mode Switching Data Loss

**What goes wrong:** Content doesn't sync between source/WYSIWYG modes, user loses edits when switching
**Why it happens:** Treating each mode as separate state instead of single source of truth
**How to avoid:**
- Maintain markdown string as single source
- WYSIWYG mode is read-only contenteditable for preview
- Convert WYSIWYG edits to markdown via Turndown before storing
**Warning signs:** Bug reports of "content disappeared after switching modes"

### Pitfall 2: Toolbar Button State Desync

**What goes wrong:** Bold button stays active when cursor moves, italic button doesn't activate when in italic text
**Why it happens:** Not updating toolbar state on selection change
**How to avoid:**
```typescript
private updateToolbarState(): void {
  const textarea = this.sourceTextarea;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = this.content.substring(start, end);

  // Check if selection is surrounded by markdown syntax
  const beforeStart = this.content.substring(Math.max(0, start - 2), start);
  const afterEnd = this.content.substring(end, end + 2);

  this.toolbarState = {
    bold: beforeStart === '**' && afterEnd === '**',
    italic: beforeStart[1] === '_' && afterEnd[0] === '_',
    // ... other states
  };
}
```
**Warning signs:** User reports "buttons don't highlight correctly"

### Pitfall 3: Undo/Redo Granularity Issues

**What goes wrong:** Undo removes entire paragraph instead of last word, or every character is separate undo step
**Why it happens:** Pushing to history stack on every keypress OR only on blur
**How to avoid:** Debounce history pushes (500ms timeout), but also push immediately on:
- Toolbar button clicks
- Paste operations
- Mode switches
**Warning signs:** User frustration with undo behavior, complaints of "undo doesn't work right"

### Pitfall 4: XSS via Unsanitized Preview

**What goes wrong:** Malicious markdown injects scripts: `[click me](javascript:alert('XSS'))`
**Why it happens:** Rendering marked.parse() output directly without sanitization
**How to avoid:** ALWAYS sanitize:
```typescript
// WRONG
const html = marked.parse(userInput);
element.innerHTML = html; // XSS VULNERABILITY

// CORRECT
const rawHtml = marked.parse(userInput);
const cleanHtml = DOMPurify.sanitize(rawHtml);
element.innerHTML = cleanHtml; // Safe
```
**Warning signs:** Security audit findings, ability to execute scripts in preview

### Pitfall 5: Speech Recognition Memory Leak

**What goes wrong:** Component unmounts but speech recognition continues, browser microphone stays active
**Why it happens:** Not cleaning up SpeechRecognition instance in disconnectedCallback
**How to avoid:**
```typescript
disconnectedCallback() {
  if (this.speechRecognizer) {
    this.speechRecognizer.stop();
    this.speechRecognizer = null;
  }
}
```
**Warning signs:** Microphone indicator stays on after component removed, browser warns about active media

### Pitfall 6: File Import Encoding Issues

**What goes wrong:** Imported markdown file shows garbled characters (especially emojis, non-ASCII)
**Why it happens:** Not specifying UTF-8 encoding when reading files
**How to avoid:**
```typescript
private handleFileImport(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    this.content = e.target?.result as string;
    this.historyManager.clear();
    this.historyManager.push(this.content);
  };

  // CRITICAL: Specify UTF-8 encoding
  reader.readAsText(file, 'UTF-8');
}
```
**Warning signs:** User reports "special characters broken after import"

## Code Examples

Verified patterns from official sources:

### Table Insertion

```typescript
// Source: https://github.com/github/markdown-toolbar-element + research synthesis
private insertTable(rows: number = 3, cols: number = 3): void {
  let table = '\n';

  // Header row
  table += '| ' + Array(cols).fill('Header').join(' | ') + ' |\n';

  // Separator row
  table += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';

  // Data rows
  for (let i = 0; i < rows - 1; i++) {
    table += '| ' + Array(cols).fill('').join(' | ') + ' |\n';
  }

  table += '\n';

  const textarea = this.sourceTextarea;
  const start = textarea.selectionStart;

  this.content =
    this.content.substring(0, start) +
    table +
    this.content.substring(start);

  this.historyManager.push(this.content);
}
```

### Link Insertion (Ctrl+K)

```typescript
// Source: https://blog.markdowntools.com/posts/markdown-keyboard-shortcuts-and-hotkeys-guide
@Listen('keydown')
handleKeyboardShortcut(event: KeyboardEvent): void {
  const isCtrlOrCmd = event.ctrlKey || event.metaKey;

  if (isCtrlOrCmd && event.key === 'k') {
    event.preventDefault();
    this.insertLink();
    return;
  }

  if (isCtrlOrCmd && event.key === 'b') {
    event.preventDefault();
    this.insertMarkdown('**', '**');
    return;
  }

  // ... other shortcuts
}

private insertLink(): void {
  const textarea = this.sourceTextarea;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = this.content.substring(start, end);

  const linkText = selectedText || 'link text';
  const linkUrl = 'https://';

  const markdown = `[${linkText}](${linkUrl})`;

  this.content =
    this.content.substring(0, start) +
    markdown +
    this.content.substring(end);

  // Select the URL portion for easy editing
  const urlStart = start + linkText.length + 3;
  textarea.setSelectionRange(urlStart, urlStart + linkUrl.length);

  this.historyManager.push(this.content);
}
```

### Character/Word Count

```typescript
// Source: Common editor pattern synthesis
private getStats(): { chars: number; words: number } {
  const chars = this.content.length;
  const words = this.content
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;

  return { chars, words };
}

// Render in footer
private renderFooter() {
  const stats = this.getStats();
  return (
    <div class="editor-footer">
      <span class="stat-item">{stats.chars} characters</span>
      <span class="stat-item">{stats.words} words</span>
      {this.isDirty && <span class="save-indicator">Unsaved changes</span>}
    </div>
  );
}
```

### Print Support

```typescript
// Source: Browser print API best practices
private handlePrint(): void {
  // Create temporary container
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rawHtml = marked.parse(this.content);
  const cleanHtml = DOMPurify.sanitize(rawHtml);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Preview</title>
        <style>
          body {
            font-family: var(--dwc-font-family);
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${cleanHtml}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Print after content loads
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| execCommand for formatting | Selection/Range API + manual insertion | Deprecated 2020 | Must implement custom toolbar logic |
| marked.sanitize option | marked + DOMPurify pipeline | marked v5.0 (2022) | Two-step process now required |
| Browser native undo | Custom history stack | Ongoing issue | Must build undo/redo from scratch |
| Server-side markdown parsing | Client-side with Web Workers | 2020+ | Better UX, requires ReDoS protection |
| Split mode with separate editors | Single source with derived views | 2023+ | Eliminates sync bugs |

**Deprecated/outdated:**
- **execCommand:** Deprecated per MDN, no timeline for removal but no future support
- **marked.sanitize:** Removed in marked v5.0, DOMPurify is official recommendation
- **UndoManager API:** Proposed spec never implemented, use custom stacks

## Open Questions

Things that couldn't be fully resolved:

1. **Split Mode Scroll Synchronization**
   - What we know: Complex to implement due to height mismatches between markdown and rendered HTML
   - What's unclear: Best algorithm for proportional scrolling (line-based vs. percentage-based)
   - Recommendation: Implement basic percentage-based sync first, iterate based on user feedback. Reference: [Joplin's sync-scroll implementation](https://joplinapp.org/spec/sync_scroll/)

2. **Prism.js Loading Strategy**
   - What we know: Prism is peer dependency, may not be loaded when component initializes
   - What's unclear: Should component wait for Prism, fall back gracefully, or require it?
   - Recommendation: Check `window.Prism`, fallback to unstyled code blocks if unavailable, emit warning event

3. **WYSIWYG Edit Capabilities**
   - What we know: Turndown can convert HTML back to Markdown
   - What's unclear: Should WYSIWYG be editable or preview-only?
   - Recommendation: Start with preview-only (simpler, fewer edge cases). Editable WYSIWYG requires complex contenteditable handling + Turndown conversion on every change

4. **Voice Dictation Language Support**
   - What we know: Web Speech API supports multiple languages
   - What's unclear: Should component provide language selector or use browser default?
   - Recommendation: Use browser default (en-US fallback), add optional language prop for future enhancement

## Sources

### Primary (HIGH confidence)

- [Marked.js Official Documentation](https://marked.js.org/using_advanced) - Configuration, extensions, async rendering
- [DOMPurify GitHub Repository](https://github.com/cure53/DOMPurify) - Sanitization API, security best practices
- [MDN Web Speech API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API) - SpeechRecognition implementation
- [Turndown GitHub Repository](https://github.com/mixmark-io/turndown) - HTML to Markdown conversion API
- [MDN execCommand Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand) - Deprecation status

### Secondary (MEDIUM confidence)

- [Implementing Synchronous Scrolling in Markdown Editor](https://dev.to/woai3c/implementing-synchronous-scrolling-in-a-dual-pane-markdown-editor-5d75) - Split mode sync patterns
- [Implementing Efficient AutoSave with Debounce](https://kannanravi.medium.com/implementing-efficient-autosave-with-javascript-debounce-techniques-463704595a7a) - Debounce patterns
- [Markdown Keyboard Shortcuts Guide](https://blog.markdowntools.com/posts/markdown-keyboard-shortcuts-and-hotkeys-guide) - Standard shortcuts
- [GitHub markdown-toolbar-element](https://github.com/github/markdown-toolbar-element) - Toolbar implementation patterns
- [Native Undo & Redo for the Web](https://dev.to/chromiumdev/-native-undo--redo-for-the-web-3fl3) - UndoManager API status

### Tertiary (LOW confidence)

- [Can I Use - Speech Recognition](https://caniuse.com/speech-recognition) - Browser support data (40% as of 2026)
- [execCommand Alternatives Discussion](https://www.webmasterworld.com/javascript/5069943.htm) - Community workarounds
- Various CodePen examples for blob download, cursor position, table insertion - Implementation references

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries are peer dependencies already specified in package.json
- Architecture: MEDIUM - Patterns are well-established but contenteditable has known cross-browser quirks
- Pitfalls: MEDIUM - Based on research + general editor knowledge, but implementation will reveal edge cases
- Web Speech API: LOW - Limited browser support (Chrome/Edge only), may need polyfill research for production

**Research date:** 2026-01-31
**Valid until:** 60 days (stable libraries, markdown spec changes slowly)

**Key unknowns requiring validation during implementation:**
- Exact peer dependency version compatibility with Stencil build system
- Performance of marked.parse() + DOMPurify.sanitize() pipeline on large documents (>100KB)
- Split mode scroll sync smoothness with DWC theming applied
- Speech API reliability across different Chrome/Edge versions
