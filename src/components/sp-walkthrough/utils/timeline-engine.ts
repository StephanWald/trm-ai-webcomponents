/**
 * Timeline engine for managing scene advancement based on video currentTime
 * Pure data utility - no event handling or side effects
 */

import { Scene } from '../types/walkthrough.types';

export class TimelineEngine {
  private scenes: Scene[];

  constructor(scenes: Scene[]) {
    // Sort scenes by timestamp ascending
    this.scenes = [...scenes].sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Find the scene that should be active at the given currentTime
   * Returns the latest scene where timestamp <= currentTime
   * @param currentTime Current playback time in seconds
   * @returns Index of the active scene, or -1 if before first scene
   */
  getCurrentSceneIndex(currentTime: number): number {
    // Reverse iteration for efficiency (find latest matching scene)
    for (let i = this.scenes.length - 1; i >= 0; i--) {
      if (currentTime >= this.scenes[i].timestamp) {
        return i;
      }
    }

    // Before first scene
    return -1;
  }

  /**
   * Get scene at specific index
   * @param index Scene index
   * @returns Scene object or null if index out of bounds
   */
  getScene(index: number): Scene | null {
    if (index < 0 || index >= this.scenes.length) {
      return null;
    }
    return this.scenes[index];
  }

  /**
   * Get total number of scenes
   */
  getSceneCount(): number {
    return this.scenes.length;
  }

  /**
   * Update the scenes array (re-sorts by timestamp)
   * @param scenes New scenes array
   */
  setScenes(scenes: Scene[]): void {
    this.scenes = [...scenes].sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get the next scene after the given index
   * @param currentIndex Current scene index
   * @returns Next scene or null if at end
   */
  getNextScene(currentIndex: number): Scene | null {
    if (currentIndex < 0 || currentIndex >= this.scenes.length - 1) {
      return null;
    }
    return this.scenes[currentIndex + 1];
  }

  /**
   * Get the previous scene before the given index
   * @param currentIndex Current scene index
   * @returns Previous scene or null if at start
   */
  getPreviousScene(currentIndex: number): Scene | null {
    if (currentIndex <= 0 || currentIndex >= this.scenes.length) {
      return null;
    }
    return this.scenes[currentIndex - 1];
  }

  /**
   * Get all scenes in sorted order
   */
  getAllScenes(): Scene[] {
    return [...this.scenes];
  }
}
