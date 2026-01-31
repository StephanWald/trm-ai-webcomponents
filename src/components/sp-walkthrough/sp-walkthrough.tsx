import { Component, Prop, State, Event, EventEmitter, Method, Element, Watch, h, Host } from '@stencil/core';
import { Scene, SceneChangeDetail, TimelineUpdateDetail } from './types/walkthrough.types';
import { OverlayManager } from './utils/overlay-manager';
import { TimelineEngine } from './utils/timeline-engine';
import { YouTubePlayerWrapper, isYouTubeUrl, extractVideoId } from './utils/youtube-wrapper';
import { makeDraggable } from './utils/draggable-mixin';

/**
 * Interactive walkthrough component with video playback and DOM element highlighting
 */
@Component({
  tag: 'sp-walkthrough',
  styleUrl: 'sp-walkthrough.css',
  shadow: true,
})
export class SpWalkthrough {
  @Element() el: HTMLElement;

  /**
   * Array of walkthrough scenes
   */
  @Prop() scenes: Scene[] = [];

  /**
   * Video source URL (MP4/WebM/YouTube) - optional for manual-only mode
   */
  @Prop() videoSrc?: string;

  /**
   * WebVTT captions file URL
   */
  @Prop() captionsSrc?: string;

  /**
   * Auto-play video on show
   */
  @Prop() autoPlay: boolean = false;

  /**
   * Author mode (stub for Plan 02)
   */
  @Prop() authorMode: boolean = false;

  /**
   * Theme override
   */
  @Prop() theme: 'light' | 'dark' | 'auto' = 'auto';

  @State() isVisible: boolean = false;
  @State() currentSceneIndex: number = -1;
  @State() isPlaying: boolean = false;
  @State() volume: number = 1.0;
  @State() isMuted: boolean = false;
  @State() captionsEnabled: boolean = false;
  @State() currentTime: number = 0;
  @State() duration: number = 0;

  /**
   * Emitted when walkthrough is shown
   */
  @Event() walkthroughShown: EventEmitter<void>;

  /**
   * Emitted when walkthrough is hidden
   */
  @Event() walkthroughHidden: EventEmitter<void>;

  /**
   * Emitted when walkthrough is aborted (ESC key or abort method)
   */
  @Event() walkthroughAborted: EventEmitter<void>;

  /**
   * Emitted when scene changes
   */
  @Event() sceneChanged: EventEmitter<SceneChangeDetail>;

  /**
   * Emitted when timeline is updated (author mode)
   */
  @Event() timelineUpdated: EventEmitter<TimelineUpdateDetail>;

  private videoElement: HTMLVideoElement;
  private overlayManager: OverlayManager;
  private timelineEngine: TimelineEngine;
  private youtubeWrapper: YouTubePlayerWrapper | null = null;
  private isYouTube: boolean = false;
  private cleanupDraggable: (() => void) | null = null;
  private escapeKeyHandler: (ev: KeyboardEvent) => void;

  @Watch('scenes')
  handleScenesChange() {
    if (this.timelineEngine) {
      this.timelineEngine.setScenes(this.scenes);
    }
  }

  componentWillLoad() {
    // Initialize utilities
    this.overlayManager = new OverlayManager();
    this.timelineEngine = new TimelineEngine(this.scenes);

    // Determine if video source is YouTube
    if (this.videoSrc) {
      this.isYouTube = isYouTubeUrl(this.videoSrc);
    }

    // Setup ESC key handler
    this.escapeKeyHandler = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && this.isVisible) {
        this.abort();
      }
    };
  }

  componentDidLoad() {
    // Attach draggable behavior to panel
    const panel = this.el.shadowRoot?.querySelector('.walkthrough-panel') as HTMLElement;
    if (panel) {
      this.cleanupDraggable = makeDraggable(panel, '.panel-header');
    }
  }

  disconnectedCallback() {
    // Cleanup
    this.overlayManager?.cleanup();
    this.youtubeWrapper?.destroy();
    this.cleanupDraggable?.();
    document.removeEventListener('keydown', this.escapeKeyHandler);
  }

  /**
   * Show the walkthrough
   */
  @Method()
  async show(): Promise<void> {
    this.isVisible = true;

    // Add ESC listener
    document.addEventListener('keydown', this.escapeKeyHandler);

    // Start at first scene if scenes exist
    if (this.timelineEngine.getSceneCount() > 0) {
      this.advanceToScene(0);
    }

    // Auto-play if enabled
    if (this.autoPlay && this.videoSrc) {
      await this.play();
    }

    this.walkthroughShown.emit();
  }

  /**
   * Hide the walkthrough
   */
  @Method()
  async hide(): Promise<void> {
    this.isVisible = false;
    this.overlayManager.clearHighlights();
    document.removeEventListener('keydown', this.escapeKeyHandler);
    this.walkthroughHidden.emit();
  }

  /**
   * Play video
   */
  @Method()
  async play(): Promise<void> {
    if (this.isYouTube && this.youtubeWrapper) {
      this.youtubeWrapper.play();
      this.isPlaying = true;
    } else if (this.videoElement) {
      await this.videoElement.play();
      this.isPlaying = true;
    }
  }

  /**
   * Pause video
   */
  @Method()
  async pause(): Promise<void> {
    if (this.isYouTube && this.youtubeWrapper) {
      this.youtubeWrapper.pause();
      this.isPlaying = false;
    } else if (this.videoElement) {
      this.videoElement.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Restart walkthrough from beginning
   */
  @Method()
  async restart(): Promise<void> {
    this.currentSceneIndex = -1;

    if (this.isYouTube && this.youtubeWrapper) {
      this.youtubeWrapper.seekTo(0);
    } else if (this.videoElement) {
      this.videoElement.currentTime = 0;
    }

    if (this.timelineEngine.getSceneCount() > 0) {
      this.advanceToScene(0);
    }
  }

  /**
   * Abort walkthrough (cleans up and hides)
   */
  @Method()
  async abort(): Promise<void> {
    this.overlayManager.clearHighlights();
    this.currentSceneIndex = -1;
    this.isVisible = false;
    this.isPlaying = false;

    if (this.isYouTube && this.youtubeWrapper) {
      this.youtubeWrapper.pause();
    } else if (this.videoElement) {
      this.videoElement.pause();
    }

    document.removeEventListener('keydown', this.escapeKeyHandler);
    this.walkthroughAborted.emit();
  }

  /**
   * Advance to a specific scene
   */
  private advanceToScene(index: number): void {
    if (index < 0 || index >= this.timelineEngine.getSceneCount()) {
      return;
    }

    this.currentSceneIndex = index;
    const scene = this.timelineEngine.getScene(index);

    if (!scene) return;

    // Update highlights
    if (scene.highlightSelector) {
      this.overlayManager.highlightElement(scene.highlightSelector);
    } else {
      this.overlayManager.clearHighlights();
    }

    // Emit scene change event
    this.sceneChanged.emit({
      sceneId: scene.id,
      sceneIndex: index,
      timestamp: scene.timestamp,
    });
  }

  /**
   * Handle video timeupdate event
   */
  private handleTimeUpdate = () => {
    if (this.isYouTube && this.youtubeWrapper) {
      this.currentTime = this.youtubeWrapper.getCurrentTime();
    } else if (this.videoElement) {
      this.currentTime = this.videoElement.currentTime;
    }

    // Check if we should advance to a different scene
    const targetSceneIndex = this.timelineEngine.getCurrentSceneIndex(this.currentTime);

    if (targetSceneIndex !== this.currentSceneIndex && targetSceneIndex >= 0) {
      this.advanceToScene(targetSceneIndex);
    }
  };

  /**
   * Handle video loaded metadata
   */
  private handleLoadedMetadata = () => {
    if (this.isYouTube && this.youtubeWrapper) {
      this.duration = this.youtubeWrapper.getDuration();
    } else if (this.videoElement) {
      this.duration = this.videoElement.duration;
    }
  };

  /**
   * Handle play event
   */
  private handlePlay = () => {
    this.isPlaying = true;
  };

  /**
   * Handle pause event
   */
  private handlePause = () => {
    this.isPlaying = false;
  };

  /**
   * Navigate to previous scene
   */
  private handlePrevious = () => {
    if (this.currentSceneIndex > 0) {
      const prevScene = this.timelineEngine.getScene(this.currentSceneIndex - 1);
      if (prevScene) {
        // Seek to previous scene timestamp if video exists
        if (this.isYouTube && this.youtubeWrapper) {
          this.youtubeWrapper.seekTo(prevScene.timestamp);
        } else if (this.videoElement) {
          this.videoElement.currentTime = prevScene.timestamp;
        } else {
          // Manual mode - just advance scene
          this.advanceToScene(this.currentSceneIndex - 1);
        }
      }
    }
  };

  /**
   * Navigate to next scene
   */
  private handleNext = () => {
    if (this.currentSceneIndex < this.timelineEngine.getSceneCount() - 1) {
      const nextScene = this.timelineEngine.getScene(this.currentSceneIndex + 1);
      if (nextScene) {
        // Seek to next scene timestamp if video exists
        if (this.isYouTube && this.youtubeWrapper) {
          this.youtubeWrapper.seekTo(nextScene.timestamp);
        } else if (this.videoElement) {
          this.videoElement.currentTime = nextScene.timestamp;
        } else {
          // Manual mode - just advance scene
          this.advanceToScene(this.currentSceneIndex + 1);
        }
      }
    }
  };

  /**
   * Jump to specific scene from dropdown
   */
  private handleSceneSelect = (ev: Event) => {
    const select = ev.target as HTMLSelectElement;
    const index = parseInt(select.value, 10);

    if (isNaN(index)) return;

    const scene = this.timelineEngine.getScene(index);
    if (scene) {
      if (this.isYouTube && this.youtubeWrapper) {
        this.youtubeWrapper.seekTo(scene.timestamp);
      } else if (this.videoElement) {
        this.videoElement.currentTime = scene.timestamp;
      } else {
        this.advanceToScene(index);
      }
    }
  };

  /**
   * Toggle play/pause
   */
  private handlePlayPause = () => {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  };

  /**
   * Toggle mute
   */
  private handleMuteToggle = () => {
    this.isMuted = !this.isMuted;

    if (this.isYouTube && this.youtubeWrapper) {
      this.youtubeWrapper.setMuted(this.isMuted);
    } else if (this.videoElement) {
      this.videoElement.muted = this.isMuted;
    }
  };

  /**
   * Handle volume change
   */
  private handleVolumeChange = (ev: Event) => {
    const input = ev.target as HTMLInputElement;
    this.volume = parseFloat(input.value);

    if (this.isYouTube && this.youtubeWrapper) {
      this.youtubeWrapper.setVolume(this.volume);
    } else if (this.videoElement) {
      this.videoElement.volume = this.volume;
    }

    // Unmute if volume increased from 0
    if (this.volume > 0 && this.isMuted) {
      this.isMuted = false;
    }
  };

  /**
   * Toggle captions
   */
  private handleCaptionsToggle = () => {
    if (!this.videoElement?.textTracks?.length) return;

    this.captionsEnabled = !this.captionsEnabled;

    for (let i = 0; i < this.videoElement.textTracks.length; i++) {
      this.videoElement.textTracks[i].mode = this.captionsEnabled ? 'showing' : 'hidden';
    }
  };

  /**
   * Setup standard HTML video element
   */
  private setupStandardVideo(el: HTMLVideoElement) {
    this.videoElement = el;

    if (el) {
      el.addEventListener('timeupdate', this.handleTimeUpdate);
      el.addEventListener('loadedmetadata', this.handleLoadedMetadata);
      el.addEventListener('play', this.handlePlay);
      el.addEventListener('pause', this.handlePause);
    }
  }

  /**
   * Setup YouTube player wrapper
   */
  private setupYouTubeVideo(el: HTMLElement) {
    if (!this.videoSrc) return;

    const videoId = extractVideoId(this.videoSrc);
    if (!videoId) {
      console.error('[sp-walkthrough] Invalid YouTube URL:', this.videoSrc);
      return;
    }

    this.youtubeWrapper = new YouTubePlayerWrapper(el, videoId);

    // Attach event listeners
    this.youtubeWrapper.on('timeupdate', this.handleTimeUpdate);
    this.youtubeWrapper.on('ready', this.handleLoadedMetadata);
    this.youtubeWrapper.on('play', this.handlePlay);
    this.youtubeWrapper.on('pause', this.handlePause);
  }


  /**
   * Render video player
   */
  private renderVideo() {
    if (!this.videoSrc) {
      return (
        <div class="manual-mode-placeholder">
          <p>Use navigation buttons to advance through scenes</p>
        </div>
      );
    }

    if (this.isYouTube) {
      return <div class="video-container" ref={el => el && this.setupYouTubeVideo(el)}></div>;
    } else {
      return (
        <video class="video-element" ref={el => el && this.setupStandardVideo(el)}>
          <source src={this.videoSrc} />
          {this.captionsSrc && <track kind="captions" src={this.captionsSrc} />}
        </video>
      );
    }
  }

  /**
   * Render scene info
   */
  private renderSceneInfo() {
    const scene = this.timelineEngine.getScene(this.currentSceneIndex);

    if (!scene) {
      return <div class="scene-info">No active scene</div>;
    }

    return (
      <div class="scene-info">
        <div class="scene-title">{scene.title}</div>
        {scene.description && <div class="scene-description">{scene.description}</div>}
      </div>
    );
  }

  /**
   * Render controls bar
   */
  private renderControls() {
    const hasPrevious = this.currentSceneIndex > 0;
    const hasNext = this.currentSceneIndex < this.timelineEngine.getSceneCount() - 1;

    return (
      <div class="controls-bar">
        <div class="controls-left">
          {this.videoSrc && (
            <button class="control-btn" onClick={this.handlePlayPause} aria-label={this.isPlaying ? 'Pause' : 'Play'}>
              {this.isPlaying ? '⏸' : '▶'}
            </button>
          )}

          <button class="control-btn" onClick={this.handlePrevious} disabled={!hasPrevious} aria-label="Previous scene">
            ⏮
          </button>

          <button class="control-btn" onClick={this.handleNext} disabled={!hasNext} aria-label="Next scene">
            ⏭
          </button>

          <span class="scene-counter">
            {this.currentSceneIndex + 1} / {this.timelineEngine.getSceneCount()}
          </span>
        </div>

        <div class="controls-right">
          {this.videoSrc && (
            <div class="volume-controls">
              <button class="control-btn" onClick={this.handleMuteToggle} aria-label={this.isMuted ? 'Unmute' : 'Mute'}>
                {this.isMuted ? '🔇' : '🔊'}
              </button>
              <input
                type="range"
                class="volume-slider"
                min="0"
                max="1"
                step="0.1"
                value={this.volume}
                onInput={this.handleVolumeChange}
                aria-label="Volume"
              />
            </div>
          )}

          {this.videoElement?.textTracks?.length > 0 && (
            <button class="control-btn" onClick={this.handleCaptionsToggle} aria-label="Toggle captions">
              CC
            </button>
          )}

          {this.timelineEngine.getSceneCount() > 0 && (
            <select class="scene-selector" onChange={this.handleSceneSelect}>
              {this.timelineEngine.getAllScenes().map((scene, index) => (
                <option key={scene.id} value={index} selected={index === this.currentSceneIndex}>
                  {scene.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    );
  }

  render() {
    if (!this.isVisible) {
      return null;
    }

    const hostClass = {
      'theme-light': this.theme === 'light',
      'theme-dark': this.theme === 'dark',
    };

    return (
      <Host class={hostClass}>
        <div class="walkthrough-panel">
          <div class="panel-header">
            <span class="panel-title">Walkthrough</span>
            <button class="close-btn" onClick={() => this.abort()} aria-label="Close walkthrough">
              ✕
            </button>
          </div>

          <div class="panel-content">
            {this.renderVideo()}
            {this.renderSceneInfo()}
            {this.renderControls()}
          </div>
        </div>
      </Host>
    );
  }
}
