/**
 * YouTube IFrame API wrapper implementing the VideoPlayer interface
 * Normalizes YouTube API to match HTMLVideoElement interface
 */

import { VideoPlayer } from '../types/walkthrough.types';

// Extend window to include YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Check if a URL is a YouTube video URL
 */
export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/watch|youtu\.be\/|youtube\.com\/embed\/)/.test(url);
}

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url: string): string | null {
  // youtube.com/watch?v=VIDEO_ID
  let match = url.match(/[?&]v=([^&]+)/);
  if (match) return match[1];

  // youtu.be/VIDEO_ID
  match = url.match(/youtu\.be\/([^?]+)/);
  if (match) return match[1];

  // youtube.com/embed/VIDEO_ID
  match = url.match(/youtube\.com\/embed\/([^?]+)/);
  if (match) return match[1];

  return null;
}

/**
 * YouTube player wrapper implementing VideoPlayer interface
 */
export class YouTubePlayerWrapper implements VideoPlayer {
  private player: any = null;
  private listeners: Map<string, Array<(...args: unknown[]) => void>> = new Map();
  private timeTrackingInterval: number | null = null;
  private commandQueue: Array<() => void> = [];
  private isReady: boolean = false;

  constructor(private containerElement: HTMLElement, private videoId: string) {
    this.initializePlayer();
  }

  /**
   * Load YouTube IFrame API and create player
   */
  private initializePlayer(): void {
    if (!window.YT) {
      // Load YouTube IFrame API script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);

      // Set up callback for when API loads
      window.onYouTubeIframeAPIReady = () => {
        this.createPlayer();
      };
    } else {
      // API already loaded
      this.createPlayer();
    }
  }

  /**
   * Create the YouTube player instance
   */
  private createPlayer(): void {
    this.player = new window.YT.Player(this.containerElement, {
      videoId: this.videoId,
      playerVars: {
        enablejsapi: 1,
      },
      events: {
        onReady: () => this.handlePlayerReady(),
        onStateChange: (event: any) => this.handleStateChange(event),
      },
    });
  }

  /**
   * Handle player ready event
   */
  private handlePlayerReady(): void {
    this.isReady = true;
    this.emit('ready');

    // Execute queued commands
    this.commandQueue.forEach(cmd => cmd());
    this.commandQueue = [];
  }

  /**
   * Handle player state changes
   */
  private handleStateChange(event: any): void {
    const PlayerState = window.YT.PlayerState;

    switch (event.data) {
      case PlayerState.PLAYING:
        this.startTimeTracking();
        this.emit('play');
        break;

      case PlayerState.PAUSED:
        this.stopTimeTracking();
        this.emit('pause');
        break;

      case PlayerState.ENDED:
        this.stopTimeTracking();
        this.emit('ended');
        break;
    }
  }

  /**
   * Start tracking time updates (YouTube doesn't provide timeupdate event)
   */
  private startTimeTracking(): void {
    this.stopTimeTracking();

    // Simulate timeupdate event at 250ms intervals (matches HTML5 video frequency)
    this.timeTrackingInterval = window.setInterval(() => {
      this.emit('timeupdate');
    }, 250);
  }

  /**
   * Stop time tracking
   */
  private stopTimeTracking(): void {
    if (this.timeTrackingInterval) {
      window.clearInterval(this.timeTrackingInterval);
      this.timeTrackingInterval = null;
    }
  }

  /**
   * Execute command immediately if ready, otherwise queue it
   */
  private executeOrQueue(command: () => void): void {
    if (this.isReady) {
      command();
    } else {
      this.commandQueue.push(command);
    }
  }

  // VideoPlayer interface implementation

  play(): void {
    this.executeOrQueue(() => {
      this.player?.playVideo();
    });
  }

  pause(): void {
    this.executeOrQueue(() => {
      this.player?.pauseVideo();
    });
  }

  getCurrentTime(): number {
    if (!this.isReady || !this.player) return 0;
    return this.player.getCurrentTime() || 0;
  }

  getDuration(): number {
    if (!this.isReady || !this.player) return 0;
    return this.player.getDuration() || 0;
  }

  seekTo(seconds: number): void {
    this.executeOrQueue(() => {
      this.player?.seekTo(seconds, true);
    });
  }

  setVolume(volume: number): void {
    this.executeOrQueue(() => {
      // YouTube uses 0-100 scale, we use 0-1
      this.player?.setVolume(volume * 100);
    });
  }

  isMuted(): boolean {
    if (!this.isReady || !this.player) return false;
    return this.player.isMuted() || false;
  }

  setMuted(muted: boolean): void {
    this.executeOrQueue(() => {
      if (muted) {
        this.player?.mute();
      } else {
        this.player?.unMute();
      }
    });
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (...args: unknown[]) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index >= 0) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to registered listeners
   */
  private emit(event: string): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback());
    }
  }

  destroy(): void {
    this.stopTimeTracking();
    this.listeners.clear();
    this.commandQueue = [];
    this.player?.destroy();
    this.player = null;
    this.isReady = false;
  }
}
