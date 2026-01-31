import { Component, Prop, State, Event, EventEmitter, Method, Watch, h } from '@stencil/core';
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

  render() {
    return (
      <div class="editor-container">
        {/* Toolbar placeholder - Plan 02 will populate */}
        <div class="toolbar" part="toolbar"></div>

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
