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
// import { MarkdownRenderer } from './utils/markdown-renderer';
// import { FileHandler } from './utils/file-handler';
// import { SpeechRecognizer } from './utils/speech-recognizer';

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
  // private markdownRenderer: MarkdownRenderer;
  // private speechRecognizer: SpeechRecognizer;
  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private sourceTextareaRef: HTMLTextAreaElement;
  private lastHistoryPush: number = 0;

  componentWillLoad() {
    // Initialize utilities
    this.historyManager = new HistoryManager(this.maxHistory);
    // this.markdownRenderer = new MarkdownRenderer();
    // this.speechRecognizer = new SpeechRecognizer();

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

    // Clean up speech recognizer (Plan 02 will uncomment)
    // this.speechRecognizer.destroy();
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
      </div>
    );
  }

  render() {
    return (
      <div class="editor-container">
        {/* Toolbar */}
        {this.renderToolbar()}

        {/* Editor body */}
        <div class="editor-body">
          {this.currentMode === 'source' && (
            <textarea
              class="source-editor"
              part="source-editor"
              value={this.content}
              placeholder={this.placeholder}
              onInput={this.handleInput}
              ref={el => (this.sourceTextareaRef = el as HTMLTextAreaElement)}
            ></textarea>
          )}

          {this.currentMode === 'wysiwyg' && (
            <div class="wysiwyg-editor" part="wysiwyg-editor">
              {/* Plan 03 will populate WYSIWYG mode */}
            </div>
          )}

          {this.currentMode === 'split' && (
            <div class="split-editor">
              {/* Plan 03 will populate split mode */}
            </div>
          )}
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
