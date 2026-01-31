/**
 * HistoryManager - Undo/redo stack implementation
 *
 * Pattern 2: Maintains a history array with a position pointer.
 * New states truncate forward history. Bounded by maxStates limit.
 */
export class HistoryManager {
  private history: string[] = [];
  private position: number = -1;
  private maxStates: number;

  /**
   * Create a new history manager
   * @param maxStates Maximum number of states to keep (default 50)
   */
  constructor(maxStates: number = 50) {
    this.maxStates = maxStates;
  }

  /**
   * Push a new state to the history
   * Truncates any forward history when pushing
   * @param state Content state to save
   */
  push(state: string): void {
    // Truncate forward history
    this.history = this.history.slice(0, this.position + 1);

    // Add new state
    this.history.push(state);
    this.position++;

    // Enforce max states limit
    if (this.history.length > this.maxStates) {
      const excess = this.history.length - this.maxStates;
      this.history = this.history.slice(excess);
      this.position -= excess;
    }
  }

  /**
   * Undo to previous state
   * @returns Previous state or null if at beginning
   */
  undo(): string | null {
    if (!this.canUndo()) {
      return null;
    }

    this.position--;
    return this.history[this.position];
  }

  /**
   * Redo to next state
   * @returns Next state or null if at end
   */
  redo(): string | null {
    if (!this.canRedo()) {
      return null;
    }

    this.position++;
    return this.history[this.position];
  }

  /**
   * Check if undo is available
   * @returns True if can undo
   */
  canUndo(): boolean {
    return this.position > 0;
  }

  /**
   * Check if redo is available
   * @returns True if can redo
   */
  canRedo(): boolean {
    return this.position < this.history.length - 1;
  }

  /**
   * Get current state without changing position
   * @returns Current state or null if history is empty
   */
  getCurrent(): string | null {
    if (this.position < 0 || this.position >= this.history.length) {
      return null;
    }
    return this.history[this.position];
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.position = -1;
  }
}
