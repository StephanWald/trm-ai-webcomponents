/**
 * ToolbarActions - Static utility class for markdown formatting operations
 *
 * All methods operate on content string and selection positions,
 * returning updated content and cursor positions for the component to apply.
 */

export interface ActionResult {
  content: string;
  selectionStart: number;
  selectionEnd: number;
}

export class ToolbarActions {
  /**
   * Wrap selected text with prefix and optional suffix
   * Toggle behavior: if already wrapped, unwrap
   */
  static wrapSelection(
    content: string,
    start: number,
    end: number,
    prefix: string,
    suffix?: string
  ): ActionResult {
    const actualSuffix = suffix ?? prefix;
    const before = content.substring(0, start);
    const selected = content.substring(start, end);
    const after = content.substring(end);

    // Check if already wrapped
    const prefixLen = prefix.length;
    const suffixLen = actualSuffix.length;
    const beforePrefix = before.slice(-prefixLen);
    const afterSuffix = after.slice(0, suffixLen);

    if (beforePrefix === prefix && afterSuffix === actualSuffix) {
      // Unwrap
      const newContent = before.slice(0, -prefixLen) + selected + after.slice(suffixLen);
      return {
        content: newContent,
        selectionStart: start - prefixLen,
        selectionEnd: end - prefixLen,
      };
    }

    // Wrap
    if (selected.length === 0) {
      // No selection - insert markers and place cursor between
      const newContent = before + prefix + actualSuffix + after;
      return {
        content: newContent,
        selectionStart: start + prefixLen,
        selectionEnd: start + prefixLen,
      };
    } else {
      // Wrap selection
      const newContent = before + prefix + selected + actualSuffix + after;
      return {
        content: newContent,
        selectionStart: start + prefixLen,
        selectionEnd: end + prefixLen,
      };
    }
  }

  /**
   * Apply bold formatting (**text**)
   */
  static bold(content: string, start: number, end: number): ActionResult {
    return ToolbarActions.wrapSelection(content, start, end, '**');
  }

  /**
   * Apply italic formatting (_text_)
   */
  static italic(content: string, start: number, end: number): ActionResult {
    return ToolbarActions.wrapSelection(content, start, end, '_');
  }

  /**
   * Apply strikethrough formatting (~~text~~)
   */
  static strikethrough(content: string, start: number, end: number): ActionResult {
    return ToolbarActions.wrapSelection(content, start, end, '~~');
  }

  /**
   * Apply inline code formatting (`text`)
   */
  static inlineCode(content: string, start: number, end: number): ActionResult {
    return ToolbarActions.wrapSelection(content, start, end, '`');
  }

  /**
   * Clear all markdown formatting from selection
   * Removes **, _, ~~, `, etc.
   */
  static clearFormatting(content: string, start: number, end: number): ActionResult {
    const selected = content.substring(start, end);
    // Remove common markdown syntax
    const cleaned = selected
      .replace(/\*\*/g, '')
      .replace(/_/g, '')
      .replace(/~~/g, '')
      .replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Convert links to plain text

    const before = content.substring(0, start);
    const after = content.substring(end);
    const newContent = before + cleaned + after;

    return {
      content: newContent,
      selectionStart: start,
      selectionEnd: start + cleaned.length,
    };
  }

  /**
   * Get line boundaries for cursor position
   */
  private static getLineBoundaries(content: string, pos: number): { start: number; end: number } {
    const lines = content.split('\n');
    let currentPos = 0;

    for (const line of lines) {
      const lineEnd = currentPos + line.length;
      if (pos >= currentPos && pos <= lineEnd) {
        return { start: currentPos, end: lineEnd };
      }
      currentPos = lineEnd + 1; // +1 for newline
    }

    return { start: 0, end: content.length };
  }

  /**
   * Apply heading formatting (# text)
   * Toggles heading level on current line
   */
  static heading(content: string, start: number, _end: number, level: 1 | 2 | 3): ActionResult {
    const { start: lineStart, end: lineEnd } = ToolbarActions.getLineBoundaries(content, start);
    const before = content.substring(0, lineStart);
    const line = content.substring(lineStart, lineEnd);
    const after = content.substring(lineEnd);

    // Check current heading level
    const headingMatch = line.match(/^(#{1,6})\s/);
    const prefix = '#'.repeat(level) + ' ';

    let newLine: string;
    let cursorOffset = 0;

    if (headingMatch && headingMatch[1].length === level) {
      // Same level - remove heading
      newLine = line.replace(/^#{1,6}\s/, '');
      cursorOffset = -prefix.length;
    } else if (headingMatch) {
      // Different level - replace
      newLine = line.replace(/^#{1,6}\s/, prefix);
      cursorOffset = prefix.length - headingMatch[0].length;
    } else {
      // No heading - add
      newLine = prefix + line;
      cursorOffset = prefix.length;
    }

    const newContent = before + newLine + after;
    const newStart = start + cursorOffset;

    return {
      content: newContent,
      selectionStart: newStart,
      selectionEnd: newStart,
    };
  }

  /**
   * Apply blockquote formatting (> text)
   * Toggles > prefix on selected lines
   */
  static blockquote(content: string, start: number, end: number): ActionResult {
    return ToolbarActions.toggleLinePrefix(content, start, end, '> ');
  }

  /**
   * Apply code block formatting (```\ntext\n```)
   */
  static codeBlock(content: string, start: number, end: number): ActionResult {
    const before = content.substring(0, start);
    const selected = content.substring(start, end);
    const after = content.substring(end);

    // Check if already in code block
    const beforeTrimmed = before.trimEnd();
    const afterTrimmed = after.trimStart();

    if (beforeTrimmed.endsWith('```') && afterTrimmed.startsWith('```')) {
      // Unwrap code block
      const newBefore = beforeTrimmed.slice(0, -3).trimEnd();
      const newAfter = afterTrimmed.slice(3).trimStart();
      const newContent = newBefore + (newBefore ? '\n' : '') + selected + (newAfter ? '\n' : '') + newAfter;
      return {
        content: newContent,
        selectionStart: newBefore.length + (newBefore ? 1 : 0),
        selectionEnd: newBefore.length + (newBefore ? 1 : 0) + selected.length,
      };
    }

    // Wrap in code block
    const newContent = before + '```\n' + selected + '\n```' + after;
    return {
      content: newContent,
      selectionStart: start + 4,
      selectionEnd: end + 4,
    };
  }

  /**
   * Insert link formatting [text](url)
   */
  static link(content: string, start: number, end: number): ActionResult {
    const before = content.substring(0, start);
    const selected = content.substring(start, end);
    const after = content.substring(end);

    if (selected.length > 0) {
      // Has selection - use as link text
      const newContent = before + `[${selected}](https://)` + after;
      return {
        content: newContent,
        selectionStart: start + selected.length + 3, // Position in URL
        selectionEnd: start + selected.length + 11, // Select https://
      };
    } else {
      // No selection - insert template
      const newContent = before + '[link text](https://)' + after;
      return {
        content: newContent,
        selectionStart: start + 1, // Select "link text"
        selectionEnd: start + 10,
      };
    }
  }

  /**
   * Toggle line prefix for all lines in selection
   */
  private static toggleLinePrefix(content: string, start: number, end: number, prefix: string): ActionResult {
    const lines = content.split('\n');
    let currentPos = 0;
    let startLine = 0;
    let endLine = 0;

    // Find line indices for selection
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = currentPos + lines[i].length;
      if (start >= currentPos && start <= lineEnd) {
        startLine = i;
      }
      if (end >= currentPos && end <= lineEnd) {
        endLine = i;
        break;
      }
      currentPos = lineEnd + 1;
    }

    // Check if all selected lines have prefix
    let allHavePrefix = true;
    for (let i = startLine; i <= endLine; i++) {
      if (!lines[i].startsWith(prefix)) {
        allHavePrefix = false;
        break;
      }
    }

    // Toggle prefix
    let offset = 0;
    for (let i = startLine; i <= endLine; i++) {
      if (allHavePrefix) {
        lines[i] = lines[i].substring(prefix.length);
        offset -= prefix.length;
      } else if (!lines[i].startsWith(prefix)) {
        lines[i] = prefix + lines[i];
        if (i === startLine) {
          offset = prefix.length;
        }
      }
    }

    const newContent = lines.join('\n');
    return {
      content: newContent,
      selectionStart: start + (allHavePrefix ? -prefix.length : prefix.length),
      selectionEnd: end + offset,
    };
  }

  /**
   * Apply bullet list formatting (- item)
   */
  static bulletList(content: string, start: number, end: number): ActionResult {
    return ToolbarActions.toggleLinePrefix(content, start, end, '- ');
  }

  /**
   * Apply numbered list formatting (1. item)
   */
  static numberedList(content: string, start: number, end: number): ActionResult {
    const lines = content.split('\n');
    let currentPos = 0;
    let startLine = 0;
    let endLine = 0;

    // Find line indices
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = currentPos + lines[i].length;
      if (start >= currentPos && start <= lineEnd) {
        startLine = i;
      }
      if (end >= currentPos && end <= lineEnd) {
        endLine = i;
        break;
      }
      currentPos = lineEnd + 1;
    }

    // Check if all lines have numbered prefix
    let allHaveNumbers = true;
    for (let i = startLine; i <= endLine; i++) {
      if (!lines[i].match(/^\d+\.\s/)) {
        allHaveNumbers = false;
        break;
      }
    }

    // Toggle numbering
    if (allHaveNumbers) {
      // Remove numbers
      for (let i = startLine; i <= endLine; i++) {
        lines[i] = lines[i].replace(/^\d+\.\s/, '');
      }
    } else {
      // Add numbers
      let num = 1;
      for (let i = startLine; i <= endLine; i++) {
        if (!lines[i].match(/^\d+\.\s/)) {
          lines[i] = `${num}. ` + lines[i];
        }
        num++;
      }
    }

    const newContent = lines.join('\n');
    const offset = allHaveNumbers ? -3 : 3; // Approximate offset for "1. "

    return {
      content: newContent,
      selectionStart: start + offset,
      selectionEnd: end + offset,
    };
  }

  /**
   * Apply task list formatting (- [ ] item)
   */
  static taskList(content: string, start: number, end: number): ActionResult {
    return ToolbarActions.toggleLinePrefix(content, start, end, '- [ ] ');
  }

  /**
   * Insert image placeholder
   */
  static image(content: string, start: number, end: number): ActionResult {
    const before = content.substring(0, start);
    const selected = content.substring(start, end);
    const after = content.substring(end);

    const altText = selected.length > 0 ? selected : 'alt text';
    const newContent = before + `![${altText}](url)` + after;

    return {
      content: newContent,
      selectionStart: start + altText.length + 4, // Position in URL
      selectionEnd: start + altText.length + 7, // Select "url"
    };
  }

  /**
   * Insert markdown table
   */
  static table(content: string, start: number, end: number, rows: number = 3, cols: number = 3): ActionResult {
    const before = content.substring(0, start);
    const after = content.substring(end);

    // Build table
    const lines: string[] = [];

    // Header row
    const headerCells = Array(cols).fill('Header').map((h, i) => `${h}${i + 1}`);
    lines.push('| ' + headerCells.join(' | ') + ' |');

    // Separator row
    const separators = Array(cols).fill('---');
    lines.push('| ' + separators.join(' | ') + ' |');

    // Data rows
    for (let r = 1; r <= rows - 1; r++) {
      const cells = Array(cols).fill('Cell').map((c, i) => `${c}${i + 1}`);
      lines.push('| ' + cells.join(' | ') + ' |');
    }

    const tableText = lines.join('\n');
    const newContent = before + (before && !before.endsWith('\n') ? '\n' : '') + tableText + '\n' + after;

    return {
      content: newContent,
      selectionStart: start + (before && !before.endsWith('\n') ? 1 : 0) + 2, // First header cell
      selectionEnd: start + (before && !before.endsWith('\n') ? 1 : 0) + 2 + headerCells[0].length,
    };
  }

  /**
   * Insert horizontal rule
   */
  static horizontalRule(content: string, start: number, end: number): ActionResult {
    const before = content.substring(0, start);
    const after = content.substring(end);

    const newContent = before + (before && !before.endsWith('\n') ? '\n' : '') + '---\n' + after;
    const offset = (before && !before.endsWith('\n') ? 1 : 0) + 4;

    return {
      content: newContent,
      selectionStart: start + offset,
      selectionEnd: start + offset,
    };
  }
}
