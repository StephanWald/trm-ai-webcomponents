/**
 * Core types for the sp-markdown-editor component
 */

/**
 * Editor mode - determines the editing interface shown
 */
export type EditorMode = 'source' | 'wysiwyg' | 'split';

/**
 * Toolbar state tracking for active formatting
 */
export interface ToolbarState {
  /** Bold text is active at cursor */
  bold: boolean;
  /** Italic text is active at cursor */
  italic: boolean;
  /** Strikethrough text is active at cursor */
  strikethrough: boolean;
  /** Inline code is active at cursor */
  code: boolean;
  /** Heading level (0 = no heading, 1-6 for h1-h6) */
  heading: number;
  /** Quote block is active at cursor */
  quote: boolean;
  /** Code block is active at cursor */
  codeBlock: boolean;
  /** Bullet list is active at cursor */
  bulletList: boolean;
  /** Numbered list is active at cursor */
  numberedList: boolean;
  /** Task list is active at cursor */
  taskList: boolean;
}

/**
 * Editor statistics (character and word count)
 */
export interface EditorStats {
  /** Total character count */
  chars: number;
  /** Total word count */
  words: number;
}

/**
 * Content change event detail
 */
export interface ContentChangeEvent {
  /** Updated content */
  content: string;
  /** Current editor mode */
  mode: EditorMode;
  /** Timestamp of change */
  timestamp: number;
}

/**
 * Save event detail
 */
export interface SaveEvent {
  /** Content being saved */
  content: string;
  /** Timestamp of save */
  timestamp: number;
}

/**
 * Mode change event detail
 */
export interface ModeChangeEvent {
  /** Previous mode */
  oldMode: EditorMode;
  /** New mode */
  newMode: EditorMode;
}

/**
 * Import event detail
 */
export interface ImportEvent {
  /** Imported filename */
  filename: string;
  /** File size in bytes */
  size: number;
  /** File content */
  content: string;
}

/**
 * Export event detail
 */
export interface ExportEvent {
  /** Exported filename */
  filename: string;
  /** File size in bytes */
  size: number;
}

/**
 * Image paste event detail
 */
export interface ImagePasteEvent {
  /** File object from paste */
  file: File;
  /** Data URL for preview */
  dataUrl: string;
}
