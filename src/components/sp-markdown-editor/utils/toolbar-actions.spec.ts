import { ToolbarActions } from './toolbar-actions';

describe('ToolbarActions', () => {
  describe('bold', () => {
    it('wraps selection with **', () => {
      const result = ToolbarActions.bold('Hello world', 0, 5);
      expect(result.content).toBe('**Hello** world');
      expect(result.selectionStart).toBe(2);
      expect(result.selectionEnd).toBe(7);
    });

    it('wraps at cursor with ** and positions cursor', () => {
      const result = ToolbarActions.bold('Hello world', 5, 5);
      expect(result.content).toBe('Hello**** world');
      expect(result.selectionStart).toBe(7);
      expect(result.selectionEnd).toBe(7);
    });

    it('unwraps if already bold', () => {
      const result = ToolbarActions.bold('**Hello** world', 2, 7);
      expect(result.content).toBe('Hello world');
      expect(result.selectionStart).toBe(0);
      expect(result.selectionEnd).toBe(5);
    });
  });

  describe('italic', () => {
    it('wraps selection with _', () => {
      const result = ToolbarActions.italic('Hello world', 0, 5);
      expect(result.content).toBe('_Hello_ world');
      expect(result.selectionStart).toBe(1);
      expect(result.selectionEnd).toBe(6);
    });

    it('wraps at cursor with _ and positions cursor', () => {
      const result = ToolbarActions.italic('Hello world', 5, 5);
      expect(result.content).toBe('Hello__ world');
      expect(result.selectionStart).toBe(6);
      expect(result.selectionEnd).toBe(6);
    });

    it('unwraps if already italic', () => {
      const result = ToolbarActions.italic('_Hello_ world', 1, 6);
      expect(result.content).toBe('Hello world');
      expect(result.selectionStart).toBe(0);
      expect(result.selectionEnd).toBe(5);
    });
  });

  describe('strikethrough', () => {
    it('wraps selection with ~~', () => {
      const result = ToolbarActions.strikethrough('Hello world', 0, 5);
      expect(result.content).toBe('~~Hello~~ world');
      expect(result.selectionStart).toBe(2);
      expect(result.selectionEnd).toBe(7);
    });

    it('unwraps if already strikethrough', () => {
      const result = ToolbarActions.strikethrough('~~Hello~~ world', 2, 7);
      expect(result.content).toBe('Hello world');
      expect(result.selectionStart).toBe(0);
      expect(result.selectionEnd).toBe(5);
    });
  });

  describe('inlineCode', () => {
    it('wraps selection with backticks', () => {
      const result = ToolbarActions.inlineCode('Hello world', 0, 5);
      expect(result.content).toBe('`Hello` world');
      expect(result.selectionStart).toBe(1);
      expect(result.selectionEnd).toBe(6);
    });

    it('unwraps if already code', () => {
      const result = ToolbarActions.inlineCode('`Hello` world', 1, 6);
      expect(result.content).toBe('Hello world');
      expect(result.selectionStart).toBe(0);
      expect(result.selectionEnd).toBe(5);
    });
  });

  describe('clearFormatting', () => {
    it('removes ** from bold text', () => {
      const result = ToolbarActions.clearFormatting('**Hello**', 0, 9);
      expect(result.content).toBe('Hello');
      expect(result.selectionStart).toBe(0);
      expect(result.selectionEnd).toBe(5);
    });

    it('removes _ from italic text', () => {
      const result = ToolbarActions.clearFormatting('_Hello_', 0, 7);
      expect(result.content).toBe('Hello');
      expect(result.selectionStart).toBe(0);
      expect(result.selectionEnd).toBe(5);
    });

    it('removes ~~ from strikethrough text', () => {
      const result = ToolbarActions.clearFormatting('~~Hello~~', 0, 9);
      expect(result.content).toBe('Hello');
      expect(result.selectionStart).toBe(0);
      expect(result.selectionEnd).toBe(5);
    });

    it('removes backticks from inline code', () => {
      const result = ToolbarActions.clearFormatting('`code`', 0, 6);
      expect(result.content).toBe('code');
      expect(result.selectionStart).toBe(0);
      expect(result.selectionEnd).toBe(4);
    });

    it('converts links to plain text', () => {
      const result = ToolbarActions.clearFormatting('[Google](https://google.com)', 0, 28);
      expect(result.content).toBe('Google');
      expect(result.selectionStart).toBe(0);
      expect(result.selectionEnd).toBe(6);
    });

    it('handles mixed formatting', () => {
      const result = ToolbarActions.clearFormatting('**bold** and _italic_', 0, 21);
      expect(result.content).toBe('bold and italic');
    });
  });

  describe('heading', () => {
    it('adds # prefix to line', () => {
      const result = ToolbarActions.heading('Hello world', 0, 0, 1);
      expect(result.content).toBe('# Hello world');
      expect(result.selectionStart).toBe(2);
    });

    it('adds ## prefix for level 2', () => {
      const result = ToolbarActions.heading('Hello world', 0, 0, 2);
      expect(result.content).toBe('## Hello world');
      expect(result.selectionStart).toBe(3);
    });

    it('adds ### prefix for level 3', () => {
      const result = ToolbarActions.heading('Hello world', 0, 0, 3);
      expect(result.content).toBe('### Hello world');
      expect(result.selectionStart).toBe(4);
    });

    it('toggles heading off when same level', () => {
      const result = ToolbarActions.heading('# Hello world', 2, 2, 1);
      expect(result.content).toBe('Hello world');
      expect(result.selectionStart).toBe(0);
    });

    it('replaces heading level when different', () => {
      const result = ToolbarActions.heading('# Hello world', 2, 2, 2);
      expect(result.content).toBe('## Hello world');
      expect(result.selectionStart).toBe(3);
    });

    it('works with cursor mid-line', () => {
      const result = ToolbarActions.heading('Hello world', 7, 7, 1);
      expect(result.content).toBe('# Hello world');
    });
  });

  describe('blockquote', () => {
    it('adds > prefix to line', () => {
      const result = ToolbarActions.blockquote('Hello world', 0, 11);
      expect(result.content).toBe('> Hello world');
      expect(result.selectionStart).toBe(2);
    });

    it('toggles > prefix off if present', () => {
      const result = ToolbarActions.blockquote('> Hello world', 2, 13);
      expect(result.content).toBe('Hello world');
      expect(result.selectionStart).toBe(0);
    });

    it('handles multiple lines', () => {
      const result = ToolbarActions.blockquote('Line 1\nLine 2', 0, 13);
      expect(result.content).toBe('> Line 1\n> Line 2');
    });

    it('toggles off multiple lines', () => {
      const result = ToolbarActions.blockquote('> Line 1\n> Line 2', 0, 17);
      expect(result.content).toBe('Line 1\nLine 2');
    });
  });

  describe('codeBlock', () => {
    it('wraps selection in ``` fences', () => {
      const result = ToolbarActions.codeBlock('const x = 1;', 0, 12);
      expect(result.content).toBe('```\nconst x = 1;\n```');
      expect(result.selectionStart).toBe(4);
      expect(result.selectionEnd).toBe(16);
    });

    it('unwraps code block if present', () => {
      const result = ToolbarActions.codeBlock('```\nconst x = 1;\n```', 4, 16);
      expect(result.content).toContain('const x = 1;');
      expect(result.content).not.toContain('```');
    });
  });

  describe('link', () => {
    it('inserts [text](url) pattern', () => {
      const result = ToolbarActions.link('', 0, 0);
      expect(result.content).toBe('[link text](https://)');
      expect(result.selectionStart).toBe(1);
      expect(result.selectionEnd).toBe(10); // Selects "link text"
    });

    it('uses selected text in link', () => {
      const result = ToolbarActions.link('Google', 0, 6);
      expect(result.content).toBe('[Google](https://)');
      expect(result.selectionStart).toBe(9); // Position in URL
      expect(result.selectionEnd).toBe(17); // Selects "https://"
    });

    it('preserves surrounding content', () => {
      const result = ToolbarActions.link('Visit Google here', 6, 12);
      expect(result.content).toBe('Visit [Google](https://) here');
    });
  });

  describe('bulletList', () => {
    it('adds - prefix to line', () => {
      const result = ToolbarActions.bulletList('Item 1', 0, 6);
      expect(result.content).toBe('- Item 1');
      expect(result.selectionStart).toBe(2);
    });

    it('toggles - prefix off if present', () => {
      const result = ToolbarActions.bulletList('- Item 1', 2, 8);
      expect(result.content).toBe('Item 1');
      expect(result.selectionStart).toBe(0);
    });

    it('handles multiple lines', () => {
      const result = ToolbarActions.bulletList('Item 1\nItem 2', 0, 13);
      expect(result.content).toBe('- Item 1\n- Item 2');
    });
  });

  describe('numberedList', () => {
    it('adds numbered prefix to lines', () => {
      const result = ToolbarActions.numberedList('Item 1\nItem 2', 0, 13);
      expect(result.content).toBe('1. Item 1\n2. Item 2');
    });

    it('toggles numbers off if present', () => {
      const result = ToolbarActions.numberedList('1. Item 1\n2. Item 2', 0, 19);
      expect(result.content).toBe('Item 1\nItem 2');
    });

    it('adds numbers to single line', () => {
      const result = ToolbarActions.numberedList('Item 1', 0, 6);
      expect(result.content).toBe('1. Item 1');
    });
  });

  describe('taskList', () => {
    it('adds - [ ] prefix to line', () => {
      const result = ToolbarActions.taskList('Task 1', 0, 6);
      expect(result.content).toBe('- [ ] Task 1');
      expect(result.selectionStart).toBe(6);
    });

    it('toggles - [ ] prefix off if present', () => {
      const result = ToolbarActions.taskList('- [ ] Task 1', 6, 12);
      expect(result.content).toBe('Task 1');
      expect(result.selectionStart).toBe(0);
    });

    it('handles multiple lines', () => {
      const result = ToolbarActions.taskList('Task 1\nTask 2', 0, 13);
      expect(result.content).toBe('- [ ] Task 1\n- [ ] Task 2');
    });
  });

  describe('image', () => {
    it('inserts ![alt](url) pattern', () => {
      const result = ToolbarActions.image('', 0, 0);
      expect(result.content).toBe('![alt text](url)');
      expect(result.selectionStart).toBe(12); // Position in URL
      expect(result.selectionEnd).toBe(15); // Selects "url"
    });

    it('uses selected text as alt text', () => {
      const result = ToolbarActions.image('Screenshot', 0, 10);
      expect(result.content).toBe('![Screenshot](url)');
      expect(result.selectionStart).toBe(14);
      expect(result.selectionEnd).toBe(17);
    });

    it('preserves surrounding content', () => {
      const result = ToolbarActions.image('Look at this image here', 13, 18);
      expect(result.content).toBe('Look at this ![image](url) here');
    });
  });

  describe('table', () => {
    it('generates correct markdown table structure', () => {
      const result = ToolbarActions.table('', 0, 0, 3, 3);
      expect(result.content).toContain('| Header1 | Header2 | Header3 |');
      expect(result.content).toContain('| --- | --- | --- |');
      expect(result.content).toContain('| Cell1 | Cell2 | Cell3 |');
    });

    it('uses default 3x3 dimensions', () => {
      const result = ToolbarActions.table('', 0, 0);
      const lines = result.content.trim().split('\n');
      expect(lines.length).toBe(4); // Header + separator + 2 data rows
    });

    it('respects custom dimensions', () => {
      const result = ToolbarActions.table('', 0, 0, 2, 4);
      const lines = result.content.trim().split('\n');
      expect(lines.length).toBe(3); // Header + separator + 1 data row
      expect(lines[0]).toContain('Header4'); // 4 columns
    });

    it('selects first header cell', () => {
      const result = ToolbarActions.table('', 0, 0, 3, 3);
      const selectedText = result.content.substring(result.selectionStart, result.selectionEnd);
      expect(selectedText).toBe('Header1');
    });
  });

  describe('horizontalRule', () => {
    it('inserts --- on new lines', () => {
      const result = ToolbarActions.horizontalRule('', 0, 0);
      expect(result.content).toBe('---\n');
    });

    it('adds newline before if content exists', () => {
      const result = ToolbarActions.horizontalRule('Hello', 5, 5);
      expect(result.content).toBe('Hello\n---\n');
    });

    it('positions cursor after rule', () => {
      const result = ToolbarActions.horizontalRule('Hello', 5, 5);
      expect(result.selectionStart).toBe(10); // After "Hello\n---\n"
    });
  });

  describe('edge cases', () => {
    it('handles empty content for all operations', () => {
      expect(() => ToolbarActions.bold('', 0, 0)).not.toThrow();
      expect(() => ToolbarActions.heading('', 0, 0, 1)).not.toThrow();
      expect(() => ToolbarActions.link('', 0, 0)).not.toThrow();
      expect(() => ToolbarActions.table('', 0, 0)).not.toThrow();
    });

    it('handles operations at beginning of content', () => {
      const result = ToolbarActions.bold('Hello', 0, 0);
      expect(result.content).toBe('****Hello');
    });

    it('handles operations at end of content', () => {
      const result = ToolbarActions.bold('Hello', 5, 5);
      expect(result.content).toBe('Hello****');
    });
  });
});
