/**
 * Core types for the sp-walkthrough component
 */

/**
 * Scene configuration for a single step in the walkthrough
 */
export interface Scene {
  /** Unique identifier for this scene */
  id: string;

  /** Display title for the scene */
  title: string;

  /** Optional description/instructions for the scene */
  description?: string;

  /** Timestamp in seconds when this scene should activate (for video-synced walkthroughs) */
  timestamp: number;

  /** CSS selector for the DOM element to highlight during this scene */
  highlightSelector?: string;

  /** Duration in seconds for manual mode auto-advance (optional) */
  duration?: number;
}

/**
 * Complete walkthrough configuration
 */
export interface WalkthroughConfig {
  /** Array of scenes in the walkthrough */
  scenes: Scene[];

  /** URL for video source (MP4/WebM/YouTube) - optional for manual-only mode */
  videoSrc?: string;

  /** URL for WebVTT captions file - optional */
  captionsSrc?: string;

  /** Auto-play video on show - default false */
  autoPlay?: boolean;

  /** Default panel position - default { bottom: 20, right: 20 } */
  position?: {
    bottom?: number;
    right?: number;
    top?: number;
    left?: number;
  };
}

/**
 * Detail for scene change events
 */
export interface SceneChangeDetail {
  /** ID of the new scene */
  sceneId: string;

  /** Index of the new scene in the scenes array */
  sceneIndex: number;

  /** Current video timestamp in seconds */
  timestamp: number;
}

/**
 * Detail for timeline update events (author mode)
 */
export interface TimelineUpdateDetail {
  /** Updated scenes array */
  scenes: Scene[];

  /** Type of change that occurred */
  changeType: 'create' | 'update' | 'delete';

  /** ID of the affected scene */
  affectedSceneId: string;
}

/**
 * Normalized video player interface for both HTMLVideoElement and YouTube
 */
export interface VideoPlayer {
  /** Start or resume playback */
  play(): void;

  /** Pause playback */
  pause(): void;

  /** Get current playback time in seconds */
  getCurrentTime(): number;

  /** Get total video duration in seconds */
  getDuration(): number;

  /** Seek to specific time in seconds */
  seekTo(seconds: number): void;

  /** Set volume (0.0 to 1.0) */
  setVolume(volume: number): void;

  /** Check if currently muted */
  isMuted(): boolean;

  /** Set muted state */
  setMuted(muted: boolean): void;

  /** Register event listener */
  on(event: string, callback: Function): void;

  /** Remove event listener */
  off(event: string, callback: Function): void;

  /** Clean up and destroy player */
  destroy(): void;
}
