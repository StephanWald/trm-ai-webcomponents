import { TimelineEngine } from './timeline-engine';
import { Scene } from '../types/walkthrough.types';

describe('TimelineEngine', () => {
  const sampleScenes: Scene[] = [
    { id: '1', title: 'Scene 1', timestamp: 0, highlightSelector: '#element1' },
    { id: '2', title: 'Scene 2', timestamp: 5.5, highlightSelector: '#element2' },
    { id: '3', title: 'Scene 3', timestamp: 10.0, highlightSelector: '#element3' },
    { id: '4', title: 'Scene 4', timestamp: 15.2, highlightSelector: '#element4' },
  ];

  describe('constructor', () => {
    it('creates engine with scenes array', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine).toBeTruthy();
      expect(engine.getSceneCount()).toBe(4);
    });

    it('sorts scenes by timestamp ascending', () => {
      const unsortedScenes: Scene[] = [
        { id: '1', title: 'Scene 1', timestamp: 10.0 },
        { id: '2', title: 'Scene 2', timestamp: 0 },
        { id: '3', title: 'Scene 3', timestamp: 5.5 },
      ];

      const engine = new TimelineEngine(unsortedScenes);
      const sorted = engine.getAllScenes();

      expect(sorted[0].timestamp).toBe(0);
      expect(sorted[1].timestamp).toBe(5.5);
      expect(sorted[2].timestamp).toBe(10.0);
    });

    it('handles empty scenes array', () => {
      const engine = new TimelineEngine([]);
      expect(engine.getSceneCount()).toBe(0);
    });
  });

  describe('getCurrentSceneIndex', () => {
    it('returns -1 before first scene', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getCurrentSceneIndex(-1)).toBe(-1);
    });

    it('returns 0 at first scene timestamp', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getCurrentSceneIndex(0)).toBe(0);
    });

    it('returns latest scene at exact timestamp', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getCurrentSceneIndex(5.5)).toBe(1);
      expect(engine.getCurrentSceneIndex(10.0)).toBe(2);
    });

    it('returns correct scene between timestamps', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getCurrentSceneIndex(3.0)).toBe(0);
      expect(engine.getCurrentSceneIndex(7.5)).toBe(1);
      expect(engine.getCurrentSceneIndex(12.0)).toBe(2);
    });

    it('returns last scene for time beyond final timestamp', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getCurrentSceneIndex(100.0)).toBe(3);
    });
  });

  describe('getScene', () => {
    it('returns scene at valid index', () => {
      const engine = new TimelineEngine(sampleScenes);
      const scene = engine.getScene(1);
      expect(scene).toBeTruthy();
      expect(scene?.id).toBe('2');
      expect(scene?.title).toBe('Scene 2');
    });

    it('returns null for negative index', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getScene(-1)).toBeNull();
    });

    it('returns null for index beyond array length', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getScene(10)).toBeNull();
    });
  });

  describe('getSceneCount', () => {
    it('returns correct count for populated scenes', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getSceneCount()).toBe(4);
    });

    it('returns 0 for empty scenes', () => {
      const engine = new TimelineEngine([]);
      expect(engine.getSceneCount()).toBe(0);
    });
  });

  describe('setScenes', () => {
    it('updates scenes array and re-sorts by timestamp', () => {
      const engine = new TimelineEngine(sampleScenes);
      const newScenes: Scene[] = [
        { id: '5', title: 'Scene 5', timestamp: 20.0 },
        { id: '6', title: 'Scene 6', timestamp: 2.0 },
      ];

      engine.setScenes(newScenes);

      expect(engine.getSceneCount()).toBe(2);
      const sorted = engine.getAllScenes();
      expect(sorted[0].timestamp).toBe(2.0);
      expect(sorted[1].timestamp).toBe(20.0);
    });

    it('handles setting empty array', () => {
      const engine = new TimelineEngine(sampleScenes);
      engine.setScenes([]);
      expect(engine.getSceneCount()).toBe(0);
    });
  });

  describe('getNextScene', () => {
    it('returns next scene from valid index', () => {
      const engine = new TimelineEngine(sampleScenes);
      const next = engine.getNextScene(1);
      expect(next).toBeTruthy();
      expect(next?.id).toBe('3');
    });

    it('returns null when at last scene', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getNextScene(3)).toBeNull();
    });

    it('returns null for negative index', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getNextScene(-1)).toBeNull();
    });

    it('returns null for index beyond array', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getNextScene(10)).toBeNull();
    });
  });

  describe('getPreviousScene', () => {
    it('returns previous scene from valid index', () => {
      const engine = new TimelineEngine(sampleScenes);
      const prev = engine.getPreviousScene(2);
      expect(prev).toBeTruthy();
      expect(prev?.id).toBe('2');
    });

    it('returns null when at first scene', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getPreviousScene(0)).toBeNull();
    });

    it('returns null for negative index', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getPreviousScene(-1)).toBeNull();
    });

    it('returns null for index beyond array', () => {
      const engine = new TimelineEngine(sampleScenes);
      expect(engine.getPreviousScene(10)).toBeNull();
    });
  });

  describe('getAllScenes', () => {
    it('returns all scenes in sorted order', () => {
      const engine = new TimelineEngine(sampleScenes);
      const scenes = engine.getAllScenes();
      expect(scenes.length).toBe(4);
      expect(scenes[0].id).toBe('1');
      expect(scenes[3].id).toBe('4');
    });

    it('returns copy of scenes array (immutable)', () => {
      const engine = new TimelineEngine(sampleScenes);
      const scenes1 = engine.getAllScenes();
      const scenes2 = engine.getAllScenes();
      expect(scenes1).not.toBe(scenes2);
    });
  });
});
