import { Component, Prop, State, Event, EventEmitter, Method, Element, Watch, h, Host } from '@stencil/core';
import { Scene, SceneChangeDetail, TimelineUpdateDetail } from './types/walkthrough.types';
import { OverlayManager } from './utils/overlay-manager';
import { TimelineEngine } from './utils/timeline-engine';
import { YouTubePlayerWrapper, isYouTubeUrl, extractVideoId } from './utils/youtube-wrapper';
import { makeDraggable } from './utils/draggable-mixin';
import { generateSelector, validateSelector } from './utils/selector-generator';

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
   * Author mode - enables scene editing and pointer tool
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

  // Author mode state
  @State() pointerToolActive: boolean = false;
  @State() editingSceneId: string | null = null;
  @State() editingSceneData: Partial<Scene> | null = null;

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
  private pointerToolHandler: ((ev: MouseEvent) => void) | null = null;

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

    // Cleanup pointer tool
    if (this.pointerToolHandler) {
      document.removeEventListener('click', this.pointerToolHandler, true);
      document.body.style.cursor = '';
    }
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
   * Author mode: Toggle pointer tool
   */
  private togglePointerTool = () => {
    this.pointerToolActive = !this.pointerToolActive;

    if (this.pointerToolActive) {
      // Activate pointer tool - attach click handler to document
      this.pointerToolHandler = this.handlePointerToolClick.bind(this);
      document.addEventListener('click', this.pointerToolHandler, true);
      document.body.style.cursor = 'crosshair';
    } else {
      // Deactivate pointer tool
      if (this.pointerToolHandler) {
        document.removeEventListener('click', this.pointerToolHandler, true);
        this.pointerToolHandler = null;
      }
      document.body.style.cursor = '';
    }
  };

  /**
   * Author mode: Handle pointer tool click on DOM element
   */
  private handlePointerToolClick = (ev: MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();

    const target = ev.target as HTMLElement;

    // Don't select elements within the walkthrough panel
    if (target.closest('sp-walkthrough')) {
      return;
    }

    // Generate selector for clicked element
    const selector = generateSelector(target);
    const validation = validateSelector(selector);

    // Update editing scene data with new selector
    if (this.editingSceneData) {
      this.editingSceneData = {
        ...this.editingSceneData,
        highlightSelector: selector,
      };
    }

    // Preview the highlight
    this.overlayManager.highlightElement(selector);

    // Deactivate pointer tool after selection
    this.togglePointerTool();

    // Log selector info for debugging
    console.log('[Author Mode] Selected element:', {
      selector,
      matchCount: validation.matchCount,
      element: target,
    });
  };

  /**
   * Author mode: Create new scene
   */
  private createScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      title: 'New Scene',
      description: '',
      timestamp: this.currentTime || 0,
      highlightSelector: '',
    };

    this.editingSceneId = newScene.id;
    this.editingSceneData = { ...newScene };
  };

  /**
   * Author mode: Edit existing scene
   */
  private editScene = (sceneId: string) => {
    const scene = this.timelineEngine.getAllScenes().find(s => s.id === sceneId);
    if (scene) {
      this.editingSceneId = sceneId;
      this.editingSceneData = { ...scene };
    }
  };

  /**
   * Author mode: Save scene (create or update)
   */
  private saveScene = () => {
    if (!this.editingSceneData) return;

    const allScenes = this.timelineEngine.getAllScenes();
    let updatedScenes: Scene[];
    let changeType: 'create' | 'update';

    const existingIndex = allScenes.findIndex(s => s.id === this.editingSceneId);

    if (existingIndex >= 0) {
      // Update existing scene
      updatedScenes = [...allScenes];
      updatedScenes[existingIndex] = this.editingSceneData as Scene;
      changeType = 'update';
    } else {
      // Create new scene
      updatedScenes = [...allScenes, this.editingSceneData as Scene];
      changeType = 'create';
    }

    // Sort by timestamp
    updatedScenes.sort((a, b) => a.timestamp - b.timestamp);

    // Update internal state
    this.scenes = updatedScenes;
    this.timelineEngine.setScenes(updatedScenes);

    // Emit timeline update event
    this.timelineUpdated.emit({
      scenes: updatedScenes,
      changeType,
      affectedSceneId: this.editingSceneId!,
    });

    // Clear editing state
    this.editingSceneId = null;
    this.editingSceneData = null;
  };

  /**
   * Author mode: Cancel scene editing
   */
  private cancelSceneEdit = () => {
    this.editingSceneId = null;
    this.editingSceneData = null;
    this.overlayManager.clearHighlights();
  };

  /**
   * Author mode: Delete scene
   */
  private deleteScene = (sceneId: string) => {
    const allScenes = this.timelineEngine.getAllScenes();
    const updatedScenes = allScenes.filter(s => s.id !== sceneId);

    // Update internal state
    this.scenes = updatedScenes;
    this.timelineEngine.setScenes(updatedScenes);

    // Emit timeline update event
    this.timelineUpdated.emit({
      scenes: updatedScenes,
      changeType: 'delete',
      affectedSceneId: sceneId,
    });

    // Clear editing state if deleting currently edited scene
    if (this.editingSceneId === sceneId) {
      this.editingSceneId = null;
      this.editingSceneData = null;
    }
  };

  /**
   * Author mode: Update editing scene field
   */
  private updateSceneField = (field: keyof Scene, value: any) => {
    if (!this.editingSceneData) return;

    this.editingSceneData = {
      ...this.editingSceneData,
      [field]: value,
    };
  };


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

  /**
   * Render author mode toolbar
   */
  private renderAuthorToolbar() {
    if (!this.authorMode) return null;

    return (
      <div class="author-toolbar">
        <button
          class={`author-btn ${this.pointerToolActive ? 'active' : ''}`}
          onClick={this.togglePointerTool}
          aria-label="Toggle pointer tool"
        >
          {this.pointerToolActive ? '✓ Pointer Tool' : 'Pointer Tool'}
        </button>
        <button class="author-btn" onClick={this.createScene} aria-label="Create new scene">
          + New Scene
        </button>
        {this.pointerToolActive && (
          <span class="pointer-tool-indicator">Click any element to select it</span>
        )}
      </div>
    );
  }

  /**
   * Render author mode scene list
   */
  private renderAuthorSceneList() {
    if (!this.authorMode) return null;

    const scenes = this.timelineEngine.getAllScenes();

    return (
      <div class="author-scene-list">
        <div class="scene-list-header">Scenes ({scenes.length})</div>
        <div class="scene-list">
          {scenes.map(scene => (
            <div key={scene.id} class="scene-list-item">
              <div class="scene-list-info">
                <div class="scene-list-title">{scene.title}</div>
                <div class="scene-list-meta">
                  {scene.timestamp.toFixed(1)}s
                  {scene.highlightSelector && ' • ' + scene.highlightSelector}
                </div>
              </div>
              <div class="scene-list-actions">
                <button
                  class="scene-action-btn"
                  onClick={() => this.editScene(scene.id)}
                  aria-label="Edit scene"
                >
                  Edit
                </button>
                <button
                  class="scene-action-btn delete"
                  onClick={() => this.deleteScene(scene.id)}
                  aria-label="Delete scene"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render author mode scene editor
   */
  private renderAuthorSceneEditor() {
    if (!this.authorMode || !this.editingSceneData) return null;

    const validation = this.editingSceneData.highlightSelector
      ? validateSelector(this.editingSceneData.highlightSelector)
      : null;

    return (
      <div class="scene-editor">
        <div class="scene-editor-header">
          {this.editingSceneId && this.editingSceneId.startsWith('scene-') ? 'New Scene' : 'Edit Scene'}
        </div>

        <div class="form-group">
          <label class="form-label">Title</label>
          <input
            type="text"
            class="form-input"
            value={this.editingSceneData.title || ''}
            onInput={e => this.updateSceneField('title', (e.target as HTMLInputElement).value)}
            placeholder="Scene title"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea
            class="form-textarea"
            value={this.editingSceneData.description || ''}
            onInput={e => this.updateSceneField('description', (e.target as HTMLTextAreaElement).value)}
            placeholder="Scene description"
            rows={3}
          />
        </div>

        <div class="form-group">
          <label class="form-label">Timestamp (seconds)</label>
          <input
            type="number"
            class="form-input"
            value={this.editingSceneData.timestamp || 0}
            onInput={e => this.updateSceneField('timestamp', parseFloat((e.target as HTMLInputElement).value) || 0)}
            step="0.1"
            min="0"
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            Highlight Selector
            {validation && validation.matchCount !== 1 && (
              <span class="selector-warning">
                {' '}
                (Warning: {validation.matchCount} matches)
              </span>
            )}
          </label>
          <input
            type="text"
            class="form-input"
            value={this.editingSceneData.highlightSelector || ''}
            onInput={e => this.updateSceneField('highlightSelector', (e.target as HTMLInputElement).value)}
            placeholder="CSS selector or use pointer tool"
          />
          <button class="form-help-btn" onClick={this.togglePointerTool}>
            Use Pointer Tool
          </button>
        </div>

        <div class="form-actions">
          <button class="form-btn primary" onClick={this.saveScene}>
            Save Scene
          </button>
          <button class="form-btn" onClick={this.cancelSceneEdit}>
            Cancel
          </button>
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
      'author-mode': this.authorMode,
    };

    return (
      <Host class={hostClass}>
        <div class="walkthrough-panel">
          <div class="panel-header">
            <span class="panel-title">
              {this.authorMode ? 'Walkthrough - Author Mode' : 'Walkthrough'}
            </span>
            <button class="close-btn" onClick={() => this.abort()} aria-label="Close walkthrough">
              ✕
            </button>
          </div>

          <div class="panel-content">
            {this.authorMode && this.renderAuthorToolbar()}
            {this.renderVideo()}
            {this.renderSceneInfo()}
            {this.renderControls()}
            {this.authorMode && this.renderAuthorSceneList()}
            {this.authorMode && this.renderAuthorSceneEditor()}
          </div>
        </div>
      </Host>
    );
  }
}
