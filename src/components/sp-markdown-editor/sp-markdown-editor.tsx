import { Component, Prop, State, Event, EventEmitter, Method, Watch, Listen, h } from '@stencil/core';
import type {
  EditorMode,
  ToolbarState,
  EditorStats,
  ContentChangeEvent,
  SaveEvent,
  ModeChangeEvent,
  ImportEvent,
  ExportEvent,
  ImagePasteEvent,
} from './types/editor.types';
import { HistoryManager } from './utils/history-manager';
import { ToolbarActions, type ActionResult } from './utils/toolbar-actions';
import { MarkdownRenderer } from './utils/markdown-renderer';
import { FileHandler } from './utils/file-handler';
import { SpeechRecognizer } from './utils/speech-recognizer';

/**
 * Rich markdown editor component with source, WYSIWYG, and split editing modes.
 * Supports voice dictation, undo/redo history, auto-save, file import/export, and print.
 *
 * @part toolbar - The formatting toolbar containing bold, italic, heading, list, and utility buttons
 * @part mode-switcher - The mode switching tabs (Source / WYSIWYG / Split) at the right end of the toolbar
 * @part source-editor - The raw markdown source textarea used in source and split modes
 * @part wysiwyg-editor - The rendered HTML preview container used in WYSIWYG mode
 * @part footer - The status footer showing character count, word count, and auto-save indicator
 */
@Component({
  tag: 'sp-markdown-editor',
  styleUrl: 'sp-markdown-editor.css',
  shadow: true,
})
export class SpMarkdownEditor {
  // Props
  @Prop() mode: EditorMode = 'source';
  @Prop() value: string = '';
  @Prop() placeholder: string = 'Start typing markdown...';
  @Prop() autoSave: boolean = true;
  @Prop() autoSaveDelay: number = 2000;
  @Prop() maxHistory: number = 50;

  // State
  @State() content: string = '';
  @State() currentMode: EditorMode = 'source';
  @State() isDirtyState: boolean = false;
  @State() isSaving: boolean = false;
  @State() isListening: boolean = false;
  @State() toolbarState: ToolbarState = {
    bold: false,
    italic: false,
    strikethrough: false,
    code: false,
    heading: 0,
    quote: false,
    codeBlock: false,
    bulletList: false,
    numberedList: false,
    taskList: false,
  };
  @State() stats: EditorStats = { chars: 0, words: 0 };

  // Events
  @Event() contentChange: EventEmitter<ContentChangeEvent>;
  @Event() save: EventEmitter<SaveEvent>;
  @Event() modeChange: EventEmitter<ModeChangeEvent>;
  @Event() importFile: EventEmitter<ImportEvent>;
  @Event() exportFile: EventEmitter<ExportEvent>;
  @Event() imagePaste: EventEmitter<ImagePasteEvent>;

  // Private members
  private historyManager: HistoryManager;
  private markdownRenderer: MarkdownRenderer;
  private speechRecognizer: SpeechRecognizer;
  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private sourceTextareaRef: HTMLTextAreaElement;
  private fileInputRef: HTMLInputElement;
  private lastHistoryPush: number = 0;

  componentWillLoad() {
    // Initialize utilities
    this.historyManager = new HistoryManager(this.maxHistory);
    this.markdownRenderer = new MarkdownRenderer();
    this.speechRecognizer = new SpeechRecognizer();

    // Set initial content from value prop
    this.content = this.value;
    this.currentMode = this.mode;

    // Push initial state to history
    this.historyManager.push(this.content);

    // Compute initial stats
    this.updateStats();
  }

  disconnectedCallback() {
    // Clean up timers
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }

    // Clean up speech recognizer
    if (this.speechRecognizer) {
      this.speechRecognizer.destroy();
    }
  }

  @Watch('value')
  handleValueChange(newValue: string) {
    if (newValue !== this.content) {
      this.content = newValue;
      this.historyManager.push(newValue);
      this.updateStats();
    }
  }

  @Watch('mode')
  handleModeChange(newMode: EditorMode) {
    if (newMode !== this.currentMode) {
      this.currentMode = newMode;
    }
  }

  // Public API Methods
  @Method()
  async getContent(): Promise<string> {
    return this.content;
  }

  @Method()
  async setContent(value: string): Promise<void> {
    this.content = value;
    this.historyManager.push(value);
    this.updateStats();
    this.emitContentChange();
  }

  @Method()
  async clear(): Promise<void> {
    this.content = '';
    this.historyManager.clear();
    this.historyManager.push('');
    this.updateStats();
    this.emitContentChange();
  }

  @Method()
  async getMode(): Promise<EditorMode> {
    return this.currentMode;
  }

  @Method()
  async setMode(mode: EditorMode): Promise<void> {
    const oldMode = this.currentMode;
    this.currentMode = mode;
    this.modeChange.emit({ oldMode, newMode: mode });
  }

  @Method()
  async isDirty(): Promise<boolean> {
    return this.isDirtyState;
  }

  @Method()
  async focusEditor(): Promise<void> {
    if (this.sourceTextareaRef) {
      this.sourceTextareaRef.focus();
    }
  }

  // Content change handler
  private handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    this.content = target.value;
    this.isDirtyState = true;

    // Update stats
    this.updateStats();

    // Debounced history push (only push after 500ms pause in typing)
    const now = Date.now();
    if (now - this.lastHistoryPush > 500) {
      this.historyManager.push(this.content);
      this.lastHistoryPush = now;
    }

    // Emit content change event
    this.emitContentChange();

    // Trigger auto-save
    this.triggerAutoSave();
  };

  // Emit content change event
  private emitContentChange() {
    this.contentChange.emit({
      content: this.content,
      mode: this.currentMode,
      timestamp: Date.now(),
    });
  }

  // Trigger auto-save debounce
  private triggerAutoSave() {
    if (!this.autoSave) {
      return;
    }

    // Clear existing timer
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    // Set new timer
    this.autoSaveTimer = setTimeout(() => {
      this.performAutoSave();
    }, this.autoSaveDelay);
  }

  // Perform auto-save
  private performAutoSave() {
    if (!this.isDirtyState) {
      return;
    }

    // Emit save event
    this.save.emit({
      content: this.content,
      timestamp: Date.now(),
    });

    // Update state
    this.isDirtyState = false;
    this.isSaving = true;

    // Flash saving indicator
    setTimeout(() => {
      this.isSaving = false;
    }, 500);
  }

  // Update character and word count
  private updateStats() {
    this.stats = {
      chars: this.content.length,
      words: this.content.trim().length === 0 ? 0 : this.content.trim().split(/\s+/).filter(w => w.length > 0).length,
    };
  }

  // Render save indicator
  private renderSaveIndicator() {
    if (this.isSaving) {
      return <span class="save-indicator saving">Saving...</span>;
    }
    if (this.isDirtyState) {
      return <span class="save-indicator dirty">Unsaved changes</span>;
    }
    return <span class="save-indicator saved">Saved</span>;
  }

  // Handle mode switch
  private handleModeSwitch = (newMode: EditorMode) => {
    const oldMode = this.currentMode;
    if (oldMode === newMode) {
      return;
    }

    this.currentMode = newMode;
    this.modeChange.emit({ oldMode, newMode });

    // Focus appropriate element after mode switch
    requestAnimationFrame(() => {
      if (newMode === 'source' && this.sourceTextareaRef) {
        this.sourceTextareaRef.focus();
      }
    });
  };

  // Render WYSIWYG preview mode
  private renderWysiwyg() {
    const html = this.markdownRenderer.render(this.content);

    return (
      <div
        class="wysiwyg-editor"
        part="wysiwyg-editor"
        innerHTML={html}
      ></div>
    );
  }

  // Render split mode (source + preview side by side)
  private renderSplit() {
    const html = this.markdownRenderer.render(this.content);

    return (
      <div class="split-editor">
        <div class="split-pane split-source">
          <textarea
            class="source-editor"
            value={this.content}
            placeholder={this.placeholder}
            onInput={this.handleInput}
            onPaste={this.handlePaste}
            ref={el => (this.sourceTextareaRef = el as HTMLTextAreaElement)}
          ></textarea>
        </div>
        <div class="split-pane split-preview">
          <div class="wysiwyg-preview" innerHTML={html}></div>
        </div>
      </div>
    );
  }

  // Render mode switcher tabs
  private renderModeSwitcher() {
    return (
      <div class="mode-switcher" part="mode-switcher">
        <button
          class={`mode-tab ${this.currentMode === 'source' ? 'active' : ''}`}
          onClick={() => this.handleModeSwitch('source')}
          title="Source mode"
        >
          Source
        </button>
        <button
          class={`mode-tab ${this.currentMode === 'wysiwyg' ? 'active' : ''}`}
          onClick={() => this.handleModeSwitch('wysiwyg')}
          title="Preview mode"
        >
          Preview
        </button>
        <button
          class={`mode-tab ${this.currentMode === 'split' ? 'active' : ''}`}
          onClick={() => this.handleModeSwitch('split')}
          title="Split mode"
        >
          Split
        </button>
      </div>
    );
  }

  // Handle file import
  private handleImportClick = () => {
    if (this.fileInputRef) {
      this.fileInputRef.click();
    }
  };

  private handleFileSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      const content = await FileHandler.importFile(file);
      this.content = content;
      this.historyManager.push(content);
      this.updateStats();
      this.emitContentChange();

      // Emit import event
      this.importFile.emit({
        filename: file.name,
        size: file.size,
        content,
      });

      // Clear input so same file can be imported again
      input.value = '';
    } catch (error) {
      console.error('File import failed:', error);
    }
  };

  // Handle file export
  private handleExportClick = () => {
    const result = FileHandler.exportFile(this.content);

    // Emit export event
    this.exportFile.emit({
      filename: result.filename,
      size: result.size,
    });
  };

  // Handle voice dictation toggle
  private handleVoiceToggle = () => {
    if (this.isListening) {
      this.speechRecognizer.stop();
      this.isListening = false;
    } else {
      this.speechRecognizer.start(
        (text: string, isFinal: boolean) => {
          if (isFinal) {
            // Append final transcribed text to content
            this.content = this.content + (this.content ? ' ' : '') + text;
            this.isDirtyState = true;
            this.updateStats();
            this.historyManager.push(this.content);
            this.emitContentChange();
            this.triggerAutoSave();
          }
        },
        (error: string) => {
          console.error('Speech recognition error:', error);
          this.isListening = false;
        }
      );
      this.isListening = true;
    }
  };

  // Handle print
  private handlePrint = () => {
    const html = this.markdownRenderer.render(this.content);

    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    // Write HTML with styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print</title>
          <style>
            body {
              font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 { font-size: 2em; font-weight: 700; margin-top: 0.67em; margin-bottom: 0.67em; border-bottom: 2px solid #e0e0e0; padding-bottom: 0.3em; }
            h2 { font-size: 1.5em; font-weight: 600; margin-top: 0.83em; margin-bottom: 0.83em; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.3em; }
            h3 { font-size: 1.17em; font-weight: 600; margin-top: 1em; margin-bottom: 1em; }
            h4, h5, h6 { font-weight: 600; margin-top: 1em; margin-bottom: 1em; }
            p { margin-top: 1em; margin-bottom: 1em; }
            code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 0.9em; background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
            pre { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 0.9em; background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; margin: 1em 0; }
            pre code { background: none; padding: 0; }
            blockquote { margin: 1em 0; padding-left: 16px; border-left: 4px solid #1976d2; color: #666; font-style: italic; }
            ul, ol { margin: 1em 0; padding-left: 2em; }
            li { margin: 0.5em 0; }
            table { border-collapse: collapse; width: 100%; margin: 1em 0; }
            th, td { border: 1px solid #e0e0e0; padding: 8px 12px; text-align: left; }
            th { background: #f5f5f5; font-weight: 600; }
            a { color: #1976d2; text-decoration: none; }
            img { max-width: 100%; height: auto; }
            hr { border: none; border-top: 2px solid #e0e0e0; margin: 2em 0; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Handle image paste in textarea
  private handlePaste = (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) {
      return;
    }

    // Look for image in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') === 0) {
        event.preventDefault();

        const file = item.getAsFile();
        if (!file) {
          continue;
        }

        // Create data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;

          // Emit image paste event
          this.imagePaste.emit({
            file,
            dataUrl,
          });

          // Insert placeholder markdown
          const placeholder = `![image](paste)`;
          if (this.sourceTextareaRef) {
            const start = this.sourceTextareaRef.selectionStart;
            const end = this.sourceTextareaRef.selectionEnd;
            this.content = this.content.substring(0, start) + placeholder + this.content.substring(end);
            this.isDirtyState = true;
            this.updateStats();
            this.historyManager.push(this.content);
            this.emitContentChange();
            this.triggerAutoSave();

            // Update cursor position
            requestAnimationFrame(() => {
              if (this.sourceTextareaRef) {
                const newPos = start + placeholder.length;
                this.sourceTextareaRef.selectionStart = newPos;
                this.sourceTextareaRef.selectionEnd = newPos;
                this.sourceTextareaRef.focus();
              }
            });
          }
        };

        reader.readAsDataURL(file);
        break;
      }
    }
  };

  // Apply toolbar action helper
  private applyToolbarAction(actionFn: (content: string, start: number, end: number) => ActionResult) {
    if (!this.sourceTextareaRef) {
      return;
    }

    const start = this.sourceTextareaRef.selectionStart;
    const end = this.sourceTextareaRef.selectionEnd;
    const result = actionFn(this.content, start, end);

    // Update content
    this.content = result.content;
    this.isDirtyState = true;

    // Update stats
    this.updateStats();

    // Push to history
    this.historyManager.push(this.content);

    // Emit content change
    this.emitContentChange();

    // Update cursor position after render
    requestAnimationFrame(() => {
      if (this.sourceTextareaRef) {
        this.sourceTextareaRef.selectionStart = result.selectionStart;
        this.sourceTextareaRef.selectionEnd = result.selectionEnd;
        this.sourceTextareaRef.focus();
      }
    });

    // Trigger auto-save
    this.triggerAutoSave();
  }

  // Toolbar button handlers
  private handleUndo = () => {
    const previousState = this.historyManager.undo();
    if (previousState !== null) {
      this.content = previousState;
      this.updateStats();
      this.emitContentChange();
      if (this.sourceTextareaRef) {
        this.sourceTextareaRef.focus();
      }
    }
  };

  private handleRedo = () => {
    const nextState = this.historyManager.redo();
    if (nextState !== null) {
      this.content = nextState;
      this.updateStats();
      this.emitContentChange();
      if (this.sourceTextareaRef) {
        this.sourceTextareaRef.focus();
      }
    }
  };

  // Keyboard shortcut handler
  @Listen('keydown')
  handleKeyDown(event: KeyboardEvent) {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;

    if (!isCtrlOrCmd) {
      return;
    }

    // Ctrl+B - Bold
    if (event.key === 'b' || event.key === 'B') {
      event.preventDefault();
      this.applyToolbarAction(ToolbarActions.bold);
      return;
    }

    // Ctrl+I - Italic
    if (event.key === 'i' || event.key === 'I') {
      event.preventDefault();
      this.applyToolbarAction(ToolbarActions.italic);
      return;
    }

    // Ctrl+K - Link
    if (event.key === 'k' || event.key === 'K') {
      event.preventDefault();
      this.applyToolbarAction(ToolbarActions.link);
      return;
    }

    // Ctrl+S - Save
    if (event.key === 's' || event.key === 'S') {
      event.preventDefault();
      // Flush auto-save immediately
      if (this.autoSaveTimer) {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = null;
      }
      this.performAutoSave();
      return;
    }

    // Ctrl+Z - Undo
    if (event.key === 'z' || event.key === 'Z') {
      if (!event.shiftKey) {
        event.preventDefault();
        this.handleUndo();
        return;
      }
    }

    // Ctrl+Y or Ctrl+Shift+Z - Redo
    if (event.key === 'y' || event.key === 'Y' || (event.shiftKey && (event.key === 'z' || event.key === 'Z'))) {
      event.preventDefault();
      this.handleRedo();
      return;
    }
  }

  // Render toolbar
  private renderToolbar() {
    const canUndo = this.historyManager.canUndo();
    const canRedo = this.historyManager.canRedo();

    return (
      <div class="toolbar" part="toolbar">
        {/* Group 1: History */}
        <div class="toolbar-group">
          <button class="toolbar-btn" title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={this.handleUndo}>
            ↶
          </button>
          <button class="toolbar-btn" title="Redo (Ctrl+Y)" disabled={!canRedo} onClick={this.handleRedo}>
            ↷
          </button>
        </div>

        <div class="toolbar-separator"></div>

        {/* Group 2: Inline formatting */}
        <div class="toolbar-group">
          <button
            class="toolbar-btn"
            title="Bold (Ctrl+B)"
            onClick={() => this.applyToolbarAction(ToolbarActions.bold)}
          >
            B
          </button>
          <button
            class="toolbar-btn"
            title="Italic (Ctrl+I)"
            onClick={() => this.applyToolbarAction(ToolbarActions.italic)}
          >
            I
          </button>
          <button
            class="toolbar-btn"
            title="Strikethrough"
            onClick={() => this.applyToolbarAction(ToolbarActions.strikethrough)}
          >
            S
          </button>
          <button
            class="toolbar-btn"
            title="Inline Code"
            onClick={() => this.applyToolbarAction(ToolbarActions.inlineCode)}
          >
            `
          </button>
          <button
            class="toolbar-btn"
            title="Clear Formatting"
            onClick={() => this.applyToolbarAction(ToolbarActions.clearFormatting)}
          >
            Tx
          </button>
        </div>

        <div class="toolbar-separator"></div>

        {/* Group 3: Headings */}
        <div class="toolbar-group">
          <button
            class="toolbar-btn"
            title="Heading 1"
            onClick={() => this.applyToolbarAction((c, s, e) => ToolbarActions.heading(c, s, e, 1))}
          >
            H1
          </button>
          <button
            class="toolbar-btn"
            title="Heading 2"
            onClick={() => this.applyToolbarAction((c, s, e) => ToolbarActions.heading(c, s, e, 2))}
          >
            H2
          </button>
          <button
            class="toolbar-btn"
            title="Heading 3"
            onClick={() => this.applyToolbarAction((c, s, e) => ToolbarActions.heading(c, s, e, 3))}
          >
            H3
          </button>
        </div>

        <div class="toolbar-separator"></div>

        {/* Group 4: Block formatting */}
        <div class="toolbar-group">
          <button
            class="toolbar-btn"
            title="Blockquote"
            onClick={() => this.applyToolbarAction(ToolbarActions.blockquote)}
          >
            "
          </button>
          <button
            class="toolbar-btn"
            title="Code Block"
            onClick={() => this.applyToolbarAction(ToolbarActions.codeBlock)}
          >
            {'{}'}
          </button>
          <button
            class="toolbar-btn"
            title="Link (Ctrl+K)"
            onClick={() => this.applyToolbarAction(ToolbarActions.link)}
          >
            🔗
          </button>
        </div>

        <div class="toolbar-separator"></div>

        {/* Group 5: Lists */}
        <div class="toolbar-group">
          <button
            class="toolbar-btn"
            title="Bullet List"
            onClick={() => this.applyToolbarAction(ToolbarActions.bulletList)}
          >
            •
          </button>
          <button
            class="toolbar-btn"
            title="Numbered List"
            onClick={() => this.applyToolbarAction(ToolbarActions.numberedList)}
          >
            1.
          </button>
          <button
            class="toolbar-btn"
            title="Task List"
            onClick={() => this.applyToolbarAction(ToolbarActions.taskList)}
          >
            ☐
          </button>
        </div>

        <div class="toolbar-separator"></div>

        {/* Group 6: Insert */}
        <div class="toolbar-group">
          <button
            class="toolbar-btn"
            title="Insert Image"
            onClick={() => this.applyToolbarAction(ToolbarActions.image)}
          >
            IMG
          </button>
          <button
            class="toolbar-btn"
            title="Insert Table"
            onClick={() => this.applyToolbarAction(ToolbarActions.table)}
          >
            ⊞
          </button>
          <button
            class="toolbar-btn"
            title="Horizontal Rule"
            onClick={() => this.applyToolbarAction(ToolbarActions.horizontalRule)}
          >
            ―
          </button>
        </div>

        <div class="toolbar-separator"></div>

        {/* Group 7: File operations */}
        <div class="toolbar-group">
          <button
            class="toolbar-btn"
            title="Import Markdown File"
            onClick={this.handleImportClick}
          >
            ↓
          </button>
          <button
            class="toolbar-btn"
            title="Export Markdown File"
            onClick={this.handleExportClick}
          >
            ↑
          </button>
        </div>

        <div class="toolbar-separator"></div>

        {/* Group 8: Voice and Print */}
        <div class="toolbar-group">
          {this.speechRecognizer.isSupported() && (
            <button
              class={`toolbar-btn ${this.isListening ? 'active listening' : ''}`}
              title={this.isListening ? 'Stop Dictation' : 'Voice Dictation'}
              onClick={this.handleVoiceToggle}
            >
              🎤
            </button>
          )}
          <button
            class="toolbar-btn"
            title="Print"
            onClick={this.handlePrint}
          >
            🖨
          </button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div class="editor-container">
        {/* Hidden file input for import */}
        <input
          type="file"
          accept=".md,.markdown,.txt"
          style={{ display: 'none' }}
          onChange={this.handleFileSelect}
          ref={el => (this.fileInputRef = el as HTMLInputElement)}
        />

        {/* Toolbar with mode switcher */}
        <div class="toolbar-container">
          {this.renderToolbar()}
          {this.renderModeSwitcher()}
        </div>

        {/* Editor body - conditional rendering based on mode */}
        <div class="editor-body">
          {this.currentMode === 'source' && (
            <textarea
              class="source-editor"
              part="source-editor"
              value={this.content}
              placeholder={this.placeholder}
              onInput={this.handleInput}
              onPaste={this.handlePaste}
              ref={el => (this.sourceTextareaRef = el as HTMLTextAreaElement)}
            ></textarea>
          )}

          {this.currentMode === 'wysiwyg' && this.renderWysiwyg()}

          {this.currentMode === 'split' && this.renderSplit()}
        </div>

        {/* Footer */}
        <div class="editor-footer" part="footer">
          <div class="stats">
            <span class="stat-item">{this.stats.chars} characters</span>
            <span class="stat-item">{this.stats.words} words</span>
          </div>
          {this.renderSaveIndicator()}
        </div>
      </div>
    );
  }
}
