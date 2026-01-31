import { HistoryManager } from './history-manager';

describe('HistoryManager', () => {
  describe('constructor', () => {
    it('creates history manager with default maxStates', () => {
      const manager = new HistoryManager();
      expect(manager).toBeTruthy();
    });

    it('creates history manager with custom maxStates', () => {
      const manager = new HistoryManager(10);
      expect(manager).toBeTruthy();
    });
  });

  describe('push', () => {
    it('adds state to history', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      expect(manager.getCurrent()).toBe('state 1');
    });

    it('truncates forward history when not at end', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');
      manager.push('state 3');

      // Go back twice
      manager.undo();
      manager.undo();
      expect(manager.getCurrent()).toBe('state 1');

      // Push new state - should truncate state 2 and state 3
      manager.push('new state');
      expect(manager.getCurrent()).toBe('new state');
      expect(manager.canRedo()).toBe(false);
    });

    it('enforces maxStates limit by shifting oldest', () => {
      const manager = new HistoryManager(3);
      manager.push('state 1');
      manager.push('state 2');
      manager.push('state 3');
      manager.push('state 4'); // Should remove state 1

      // Can't undo past state 2
      manager.undo();
      manager.undo();
      expect(manager.getCurrent()).toBe('state 2');
      expect(manager.canUndo()).toBe(false);
    });

    it('multiple pushes at maxStates keeps sliding window', () => {
      const manager = new HistoryManager(2);
      manager.push('state 1');
      manager.push('state 2');
      manager.push('state 3');

      expect(manager.getCurrent()).toBe('state 3');
      manager.undo();
      expect(manager.getCurrent()).toBe('state 2');
      expect(manager.canUndo()).toBe(false);
    });
  });

  describe('undo', () => {
    it('returns previous state', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');

      const previous = manager.undo();
      expect(previous).toBe('state 1');
      expect(manager.getCurrent()).toBe('state 1');
    });

    it('returns null at beginning of history', () => {
      const manager = new HistoryManager();
      manager.push('state 1');

      const result = manager.undo();
      expect(result).toBeNull();
      expect(manager.getCurrent()).toBe('state 1');
    });

    it('returns null on empty history', () => {
      const manager = new HistoryManager();
      const result = manager.undo();
      expect(result).toBeNull();
    });

    it('can undo multiple times', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');
      manager.push('state 3');

      manager.undo();
      expect(manager.getCurrent()).toBe('state 2');
      manager.undo();
      expect(manager.getCurrent()).toBe('state 1');
    });
  });

  describe('redo', () => {
    it('returns next state', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');
      manager.undo();

      const next = manager.redo();
      expect(next).toBe('state 2');
      expect(manager.getCurrent()).toBe('state 2');
    });

    it('returns null at end of history', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');

      const result = manager.redo();
      expect(result).toBeNull();
    });

    it('returns null on empty history', () => {
      const manager = new HistoryManager();
      const result = manager.redo();
      expect(result).toBeNull();
    });

    it('can redo multiple times', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');
      manager.push('state 3');

      manager.undo();
      manager.undo();

      manager.redo();
      expect(manager.getCurrent()).toBe('state 2');
      manager.redo();
      expect(manager.getCurrent()).toBe('state 3');
    });
  });

  describe('undo then redo', () => {
    it('round-trips correctly', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');
      manager.push('state 3');

      // Undo twice
      manager.undo();
      manager.undo();
      expect(manager.getCurrent()).toBe('state 1');

      // Redo twice
      manager.redo();
      manager.redo();
      expect(manager.getCurrent()).toBe('state 3');
    });
  });

  describe('push after undo', () => {
    it('clears redo history', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');
      manager.push('state 3');

      // Undo to state 1
      manager.undo();
      manager.undo();
      expect(manager.canRedo()).toBe(true);

      // Push new state - should clear redo
      manager.push('new state');
      expect(manager.canRedo()).toBe(false);
    });
  });

  describe('canUndo', () => {
    it('returns true when can undo', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');

      expect(manager.canUndo()).toBe(true);
    });

    it('returns false at beginning', () => {
      const manager = new HistoryManager();
      manager.push('state 1');

      expect(manager.canUndo()).toBe(false);
    });

    it('returns false on empty history', () => {
      const manager = new HistoryManager();
      expect(manager.canUndo()).toBe(false);
    });
  });

  describe('canRedo', () => {
    it('returns true when can redo', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');
      manager.undo();

      expect(manager.canRedo()).toBe(true);
    });

    it('returns false at end', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');

      expect(manager.canRedo()).toBe(false);
    });

    it('returns false on empty history', () => {
      const manager = new HistoryManager();
      expect(manager.canRedo()).toBe(false);
    });
  });

  describe('getCurrent', () => {
    it('returns current state', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');

      expect(manager.getCurrent()).toBe('state 2');
    });

    it('returns null for empty history', () => {
      const manager = new HistoryManager();
      expect(manager.getCurrent()).toBeNull();
    });

    it('returns correct state after undo', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');
      manager.undo();

      expect(manager.getCurrent()).toBe('state 1');
    });

    it('returns correct state after redo', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');
      manager.undo();
      manager.redo();

      expect(manager.getCurrent()).toBe('state 2');
    });
  });

  describe('clear', () => {
    it('resets history', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.push('state 2');

      manager.clear();

      expect(manager.getCurrent()).toBeNull();
      expect(manager.canUndo()).toBe(false);
      expect(manager.canRedo()).toBe(false);
    });

    it('allows new states after clear', () => {
      const manager = new HistoryManager();
      manager.push('state 1');
      manager.clear();
      manager.push('new state');

      expect(manager.getCurrent()).toBe('new state');
    });
  });
});
