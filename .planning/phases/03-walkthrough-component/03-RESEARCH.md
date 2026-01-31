# Phase 3: Walkthrough Component - Research

**Researched:** 2026-01-31
**Domain:** Video walkthrough components, DOM element highlighting, timeline synchronization, interactive tutorials
**Confidence:** HIGH

## Summary

The Walkthrough component requires implementing a video player (supporting both standard HTML5 video and YouTube embeds) with timeline-based scene synchronization that highlights DOM elements outside the component's shadow boundary. The standard approach involves using native HTMLVideoElement API for standard videos, YouTube IFrame API for YouTube embeds, and using fixed-position overlays with `getBoundingClientRect()` for DOM element highlighting that crosses shadow DOM boundaries.

Key technical decisions include: using `timeupdate` event (firing 4-250ms intervals) for scene timeline synchronization rather than `requestVideoFrameCallback()` which is overkill for simple scene transitions; implementing DOM overlays as direct body-appended elements positioned via `getBoundingClientRect()` to escape shadow DOM encapsulation; using PointerEvent API for draggable panel repositioning following patterns from Phase 2; and implementing author mode as a toggleable state with pointer tool for element selection similar to browser DevTools inspector.

The component should emit custom events for lifecycle (shown/hidden/aborted), scene changes, and timeline updates. WebVTT track elements provide built-in caption support with programmatic toggle via `textTracks` API. ESC key handling requires document-level event listener with proper cleanup in `disconnectedCallback()`.

**Primary recommendation:** Build with native HTMLVideoElement API as primary path, implement YouTube IFrame API wrapper for YouTube URLs, create overlay manager for DOM highlights that appends to document.body to escape shadow boundary, and use familiar author mode UX patterns from browser DevTools with save-via-event-emission for persistence.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native HTMLVideoElement API | - | Standard video playback | Built-in browser API, supports MP4/WebM, provides timeupdate events for timeline sync, WebVTT track support |
| YouTube IFrame Player API | - | YouTube embed playback | Official Google API, provides playback control, state events, time tracking compatible with standard video |
| Native HTMLTrackElement | - | WebVTT caption support | Built-in track element, programmatic on/off via textTracks API, CSS styling via ::cue pseudo-element |
| getBoundingClientRect() | - | DOM element positioning | Native API for element bounds relative to viewport, required for overlay positioning |
| PointerEvent API | - | Draggable panel | Unifies mouse/touch/pen, same pattern used in Phase 2 org-chart for drag interactions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| youtube-player (npm) | 5.6+ | YouTube API abstraction | Only if needing to queue API calls before player ready; built-in API is sufficient for this use case |
| Intro.js | 7.2+ | Alternative tour library | Reference implementation for spotlight/overlay patterns; don't use as dependency (10kB, different UX paradigm) |
| Shepherd.js | 11.2+ | Alternative tour library | Reference for step-by-step patterns; avoid dependency (too opinionated for our video-driven approach) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| timeupdate event | requestVideoFrameCallback() | requestVideoFrameCallback provides per-frame precision but is overkill for scene transitions; timeupdate fires 4-250ms which is sufficient |
| Body-appended overlays | Shadow DOM overlays | Shadow DOM overlays can't highlight elements outside shadow boundary; body-append required for cross-boundary highlights |
| YouTube IFrame API | video.js YouTube plugin | video.js adds 240kB+ bundle size; native IFrame API is 0kB and provides all needed functionality |
| Manual draggable | interact.js library | interact.js is 33kB minified; manual PointerEvent implementation is ~50 LOC and matches Phase 2 pattern |
| Custom event emitter | EventTarget/CustomEvent | Native CustomEvent with bubbles + composed flags is standard for web components |

**Installation:**
```bash
# No additional libraries required for core functionality
npm install @stencil/core@^4.41.0

# Already in project from Phase 1/2
```

## Architecture Patterns

### Recommended Project Structure
```
src/components/sp-walkthrough/
├── sp-walkthrough.tsx              # Main component class
├── sp-walkthrough.css              # Component styles (panel, controls)
├── sp-walkthrough.spec.ts          # Jest unit tests
├── sp-walkthrough.e2e.ts           # Playwright E2E tests
├── utils/
│   ├── overlay-manager.ts          # DOM overlay creation/positioning/cleanup
│   ├── youtube-wrapper.ts          # YouTube IFrame API abstraction
│   ├── timeline-engine.ts          # Scene advancement logic
│   └── draggable-mixin.ts          # Panel drag behavior (reusable)
└── types/
    └── walkthrough.types.ts        # Scene, TimelineEntry, WalkthroughConfig interfaces
```

### Pattern 1: Video Timeline Synchronization
**What:** Advance scenes based on video currentTime matching timeline entry timestamps
**When to use:** On timeupdate event from HTMLVideoElement or YouTube player state change
**Example:**
```typescript
// Source: MDN HTMLVideoElement timeupdate event
interface TimelineEntry {
  timestamp: number;        // Seconds
  sceneId: string;
  title: string;
  description?: string;
  highlightSelector?: string;  // CSS selector for DOM highlight
}

private currentSceneIndex: number = 0;
private timeline: TimelineEntry[] = [];

private handleTimeUpdate = () => {
  const currentTime = this.videoElement.currentTime;

  // Check if we should advance to next scene
  if (this.currentSceneIndex < this.timeline.length - 1) {
    const nextScene = this.timeline[this.currentSceneIndex + 1];

    if (currentTime >= nextScene.timestamp) {
      this.advanceToScene(this.currentSceneIndex + 1);
    }
  }
};

private advanceToScene(index: number) {
  this.currentSceneIndex = index;
  const scene = this.timeline[index];

  // Update highlights
  if (scene.highlightSelector) {
    this.overlayManager.highlightElement(scene.highlightSelector);
  } else {
    this.overlayManager.clearHighlights();
  }

  // Emit event
  this.sceneChanged.emit({
    sceneId: scene.sceneId,
    sceneIndex: index,
    timestamp: scene.timestamp
  });
}
```

### Pattern 2: Cross-Shadow-Boundary DOM Highlighting
**What:** Create overlay elements appended to document.body positioned over target elements
**When to use:** When highlighting DOM elements specified in timeline entries
**Example:**
```typescript
// Source: MDN getBoundingClientRect + composed events patterns
class OverlayManager {
  private overlays: HTMLElement[] = [];
  private readonly OVERLAY_Z_INDEX = 9999;

  highlightElement(selector: string): void {
    this.clearHighlights();

    // Find target element (could be anywhere in document)
    const targetElement = document.querySelector(selector);
    if (!targetElement) {
      console.warn(`Element not found: ${selector}`);
      return;
    }

    // Get position relative to viewport
    const rect = targetElement.getBoundingClientRect();

    // Create fixed-position overlay
    const overlay = document.createElement('div');
    overlay.className = 'sp-walkthrough-highlight';
    overlay.style.position = 'fixed';
    overlay.style.top = `${rect.top}px`;
    overlay.style.left = `${rect.left}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.zIndex = `${this.OVERLAY_Z_INDEX}`;
    overlay.style.pointerEvents = 'none'; // Don't block interactions
    overlay.style.border = '3px solid var(--dwc-color-primary, #0066cc)';
    overlay.style.borderRadius = '4px';
    overlay.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.5)'; // Spotlight effect

    // Append to body (escapes shadow boundary)
    document.body.appendChild(overlay);
    this.overlays.push(overlay);

    // Update on scroll/resize
    const updatePosition = () => {
      const newRect = targetElement.getBoundingClientRect();
      overlay.style.top = `${newRect.top}px`;
      overlay.style.left = `${newRect.left}px`;
    };

    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);

    // Store cleanup function
    overlay.dataset.cleanup = 'scroll,resize';
  }

  clearHighlights(): void {
    this.overlays.forEach(overlay => {
      // Remove event listeners
      if (overlay.dataset.cleanup) {
        // In real implementation, store cleanup functions
        window.removeEventListener('scroll', () => {});
        window.removeEventListener('resize', () => {});
      }
      overlay.remove();
    });
    this.overlays = [];
  }

  cleanup(): void {
    this.clearHighlights();
  }
}
```

### Pattern 3: YouTube IFrame API Wrapper
**What:** Normalize YouTube player API to match HTMLVideoElement interface
**When to use:** When video source is YouTube URL (detect via URL pattern)
**Example:**
```typescript
// Source: Google Developers YouTube IFrame API Reference
interface VideoPlayer {
  play(): void;
  pause(): void;
  getCurrentTime(): number;
  getDuration(): number;
  seekTo(seconds: number): void;
  setVolume(volume: number): void;
  on(event: string, callback: Function): void;
}

class YouTubePlayerWrapper implements VideoPlayer {
  private player: YT.Player | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(private containerElement: HTMLElement, private videoId: string) {
    this.initializePlayer();
  }

  private initializePlayer(): void {
    // Load YouTube IFrame API script if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => this.createPlayer();
    } else {
      this.createPlayer();
    }
  }

  private createPlayer(): void {
    this.player = new YT.Player(this.containerElement, {
      videoId: this.videoId,
      events: {
        onReady: () => this.emit('ready'),
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            this.startTimeTracking();
          } else {
            this.stopTimeTracking();
          }
        }
      }
    });
  }

  private timeTrackingInterval: number | null = null;

  private startTimeTracking(): void {
    this.stopTimeTracking();
    // Simulate timeupdate event (YouTube doesn't provide it)
    this.timeTrackingInterval = window.setInterval(() => {
      this.emit('timeupdate');
    }, 250); // Match HTML5 video timeupdate frequency
  }

  private stopTimeTracking(): void {
    if (this.timeTrackingInterval) {
      window.clearInterval(this.timeTrackingInterval);
      this.timeTrackingInterval = null;
    }
  }

  play(): void {
    this.player?.playVideo();
  }

  pause(): void {
    this.player?.pauseVideo();
  }

  getCurrentTime(): number {
    return this.player?.getCurrentTime() || 0;
  }

  getDuration(): number {
    return this.player?.getDuration() || 0;
  }

  seekTo(seconds: number): void {
    this.player?.seekTo(seconds, true);
  }

  setVolume(volume: number): void {
    this.player?.setVolume(volume * 100); // YouTube uses 0-100
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string): void {
    this.listeners.get(event)?.forEach(cb => cb());
  }

  cleanup(): void {
    this.stopTimeTracking();
    this.player?.destroy();
  }
}
```

### Pattern 4: Draggable Fixed-Position Panel
**What:** Use PointerEvent API to allow panel repositioning with constrained bounds
**When to use:** When user drags panel via drag handle
**Example:**
```typescript
// Source: Phase 2 PointerEvent patterns + W3Schools draggable element tutorial
private panelElement: HTMLElement;
private isDragging: boolean = false;
private dragStartPos: { x: number; y: number } | null = null;
private panelStartPos: { x: number; y: number } | null = null;

private handleDragStart = (ev: PointerEvent) => {
  this.isDragging = true;
  this.dragStartPos = { x: ev.clientX, y: ev.clientY };

  const rect = this.panelElement.getBoundingClientRect();
  this.panelStartPos = { x: rect.left, y: rect.top };

  // Capture pointer for consistent drag behavior
  (ev.target as HTMLElement).setPointerCapture(ev.pointerId);

  // Change cursor
  document.body.style.cursor = 'grabbing';
};

private handleDragMove = (ev: PointerEvent) => {
  if (!this.isDragging || !this.dragStartPos || !this.panelStartPos) return;

  const deltaX = ev.clientX - this.dragStartPos.x;
  const deltaY = ev.clientY - this.dragStartPos.y;

  let newX = this.panelStartPos.x + deltaX;
  let newY = this.panelStartPos.y + deltaY;

  // Constrain to viewport bounds
  const maxX = window.innerWidth - this.panelElement.offsetWidth;
  const maxY = window.innerHeight - this.panelElement.offsetHeight;

  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  this.panelElement.style.left = `${newX}px`;
  this.panelElement.style.top = `${newY}px`;
};

private handleDragEnd = (ev: PointerEvent) => {
  this.isDragging = false;
  this.dragStartPos = null;
  this.panelStartPos = null;

  (ev.target as HTMLElement).releasePointerCapture(ev.pointerId);
  document.body.style.cursor = '';
};
```

### Pattern 5: Author Mode with Pointer Tool
**What:** Toggle mode allowing scene editing and element selection via click
**When to use:** When editable prop is true, user can create/edit/delete scenes
**Example:**
```typescript
// Source: Browser DevTools inspector patterns + contenteditable patterns
@Prop() authorMode: boolean = false;
@State() pointerToolActive: boolean = false;
@State() editingSceneIndex: number | null = null;

private handlePointerToolClick = (ev: MouseEvent) => {
  if (!this.pointerToolActive) return;

  ev.preventDefault();
  ev.stopPropagation();

  // Find element under cursor (excluding walkthrough UI)
  const target = ev.target as HTMLElement;
  if (target.closest('sp-walkthrough')) return;

  // Generate CSS selector for target
  const selector = this.generateSelector(target);

  // If editing existing scene, update it
  if (this.editingSceneIndex !== null) {
    this.timeline[this.editingSceneIndex].highlightSelector = selector;
    this.emitTimelineUpdate();
  }

  // Deactivate pointer tool
  this.pointerToolActive = false;
  document.body.style.cursor = '';
};

private generateSelector(element: HTMLElement): string {
  // Prefer ID selector
  if (element.id) {
    return `#${element.id}`;
  }

  // Use class selector if unique
  if (element.className) {
    const classes = element.className.split(' ').filter(c => c.trim());
    if (classes.length > 0) {
      const selector = `.${classes.join('.')}`;
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
    }
  }

  // Fall back to tag + nth-child path
  let path = [];
  let current = element;

  while (current && current !== document.body) {
    const siblings = Array.from(current.parentElement?.children || []);
    const index = siblings.indexOf(current) + 1;
    path.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
    current = current.parentElement!;
  }

  return path.join(' > ');
}

private activatePointerTool(): void {
  this.pointerToolActive = true;
  document.body.style.cursor = 'crosshair';

  // Add global listener
  document.addEventListener('click', this.handlePointerToolClick, { capture: true });
}

private deactivatePointerTool(): void {
  this.pointerToolActive = false;
  document.body.style.cursor = '';
  document.removeEventListener('click', this.handlePointerToolClick, { capture: true });
}
```

### Pattern 6: ESC Key Abort Handler
**What:** Global ESC key listener that aborts walkthrough and cleans up overlays
**When to use:** Component is shown, listen for ESC to abort
**Example:**
```typescript
// Source: React modal ESC patterns + event cleanup best practices
private escapeKeyHandler: (ev: KeyboardEvent) => void;

componentDidLoad() {
  this.escapeKeyHandler = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') {
      this.abort();
    }
  };
}

@Method()
async show(): Promise<void> {
  this.isVisible = true;

  // Add ESC listener
  document.addEventListener('keydown', this.escapeKeyHandler);

  this.walkthroughShown.emit();
}

@Method()
async abort(): Promise<void> {
  // Clean up overlays
  this.overlayManager.cleanup();

  // Reset state
  this.currentSceneIndex = 0;
  this.isVisible = false;

  // Remove ESC listener
  document.removeEventListener('keydown', this.escapeKeyHandler);

  this.walkthroughAborted.emit();
}

disconnectedCallback() {
  // Ensure cleanup even if abort() not called
  document.removeEventListener('keydown', this.escapeKeyHandler);
  this.overlayManager?.cleanup();

  // Clean up video player
  if (this.youtubeWrapper) {
    this.youtubeWrapper.cleanup();
  }
}
```

### Pattern 7: WebVTT Caption Toggle
**What:** Programmatic control of caption track visibility
**When to use:** User clicks caption toggle button
**Example:**
```typescript
// Source: MDN Adding captions and subtitles to HTML5 video
private toggleCaptions(): void {
  const video = this.videoElement;
  if (!video) return;

  // Check if any track is showing
  let hasActiveTrack = false;

  for (const track of video.textTracks) {
    if (track.mode === 'showing') {
      hasActiveTrack = true;
      track.mode = 'hidden';
    }
  }

  // If none showing, show first track
  if (!hasActiveTrack && video.textTracks.length > 0) {
    video.textTracks[0].mode = 'showing';
  }

  this.captionsEnabled = !hasActiveTrack;
}

// In render
renderCaptionButton() {
  if (!this.videoElement?.textTracks?.length) return null;

  return (
    <button
      class="caption-toggle"
      onClick={() => this.toggleCaptions()}
      aria-label={this.captionsEnabled ? 'Hide captions' : 'Show captions'}
    >
      CC
    </button>
  );
}
```

### Anti-Patterns to Avoid
- **Don't use requestVideoFrameCallback for scene timing** - It's designed for per-frame video processing (canvas drawing, ML inference); timeupdate event is sufficient for scene transitions
- **Don't create overlays inside shadow DOM** - Shadow DOM encapsulation prevents highlighting external elements; append overlays to document.body
- **Don't forget to remove global event listeners** - ESC key handler, pointer tool click listener must be removed in disconnectedCallback
- **Don't update overlay positions on every scroll/resize** - Use passive event listeners and requestAnimationFrame to throttle updates
- **Don't embed YouTube without enablejsapi=1 parameter** - Required for IFrame API to work via postMessage communication
- **Don't store positions in state, use CSS** - getBoundingClientRect returns viewport-relative values; use them directly in fixed positioning, don't store

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Video player UI | Custom controls with play/pause/seek | Native controls="controls" | Browser-optimized, keyboard accessible, respects system preferences, zero code |
| YouTube embed control | Custom iframe postMessage wrapper | Official YouTube IFrame API | Handles async loading, queues commands, error handling, maintained by Google |
| Smooth scrolling to element | requestAnimationFrame-based animation | scrollIntoView({ behavior: 'smooth' }) | Native browser optimization, respects prefers-reduced-motion |
| CSS selector generation | Manual DOM traversal | Use ID > class > nth-child fallback pattern | Balances specificity and brittleness, standard DevTools approach |
| Overlay spotlight effect | Complex SVG masks | box-shadow: 0 0 0 9999px rgba(0,0,0,0.5) | Single CSS property, hardware accelerated, no DOM overhead |
| Time formatting | String manipulation | Intl.DateTimeFormat or simple MM:SS function | Handles edge cases, localization-ready |

**Key insight:** Video APIs (both HTML5 and YouTube) are mature and well-supported. Browser DevTools patterns (element selector, inspector) are familiar to developers. Overlays via fixed positioning + getBoundingClientRect is the standard approach used by tour libraries like Intro.js and Shepherd.js.

## Common Pitfalls

### Pitfall 1: Overlays Don't Update on Scroll/Resize
**What goes wrong:** Highlighted element scrolls but overlay stays in original position
**Why it happens:** getBoundingClientRect is viewport-relative and changes when viewport scrolls; overlays created once don't update
**How to avoid:** Add scroll and resize listeners to update overlay positions, or use position: absolute with document coordinates (rect + scroll offset)
**Warning signs:** Overlay disconnects from target element during scrolling, resize breaks positioning
```typescript
// WRONG: Set position once
const rect = element.getBoundingClientRect();
overlay.style.top = `${rect.top}px`;

// RIGHT: Update on scroll/resize
const updatePosition = () => {
  const rect = element.getBoundingClientRect();
  overlay.style.top = `${rect.top}px`;
  overlay.style.left = `${rect.left}px`;
};

window.addEventListener('scroll', updatePosition, { passive: true });
window.addEventListener('resize', updatePosition);
```

### Pitfall 2: Memory Leaks from Event Listeners
**What goes wrong:** Component removed but ESC handler, scroll listeners still attached, causing memory leaks
**Why it happens:** Event listeners added to document/window aren't automatically removed when component unmounts
**How to avoid:** Store listener references and remove in disconnectedCallback; use AbortController for modern cleanup
**Warning signs:** Multiple walkthrough instances add multiple listeners, memory usage grows
```typescript
// WRONG: Anonymous function can't be removed
componentDidLoad() {
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') this.abort();
  });
}

// RIGHT: Named function stored and removed
private escapeHandler = (ev: KeyboardEvent) => {
  if (ev.key === 'Escape') this.abort();
};

componentDidLoad() {
  document.addEventListener('keydown', this.escapeHandler);
}

disconnectedCallback() {
  document.removeEventListener('keydown', this.escapeHandler);
}

// BETTER: Use AbortController
private abortController = new AbortController();

componentDidLoad() {
  document.addEventListener('keydown', this.escapeHandler, {
    signal: this.abortController.signal
  });
}

disconnectedCallback() {
  this.abortController.abort(); // Removes all listeners with this signal
}
```

### Pitfall 3: YouTube IFrame API Not Loaded
**What goes wrong:** Creating YT.Player throws "YT is not defined" error
**Why it happens:** IFrame API script loads asynchronously; code runs before API ready
**How to avoid:** Check window.YT existence, load script if needed, wait for onYouTubeIframeAPIReady callback
**Warning signs:** Intermittent "YT is not defined" errors, works on refresh but not initial load
```typescript
// WRONG: Assume API loaded
const player = new YT.Player(element, { videoId: 'abc123' });

// RIGHT: Load and wait
if (!window.YT) {
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(script);

  // Store callback for when API loads
  window.onYouTubeIframeAPIReady = () => {
    this.createYouTubePlayer();
  };
} else {
  this.createYouTubePlayer();
}
```

### Pitfall 4: Fixed Position Panel Escapes Viewport
**What goes wrong:** Dragging panel near edge causes it to go partially or fully off-screen
**Why it happens:** Drag calculations don't constrain position to viewport bounds
**How to avoid:** Clamp panel position to [0, viewport - panelSize] range
**Warning signs:** Users report panel disappearing, can't find controls after dragging
```typescript
// WRONG: No bounds checking
const newX = this.panelStartPos.x + deltaX;
this.panel.style.left = `${newX}px`;

// RIGHT: Constrain to viewport
const maxX = window.innerWidth - this.panel.offsetWidth;
const newX = Math.max(0, Math.min(this.panelStartPos.x + deltaX, maxX));
this.panel.style.left = `${newX}px`;
```

### Pitfall 5: timeupdate Event Fires Irregularly
**What goes wrong:** Scenes advance at wrong times or skip scenes entirely
**Why it happens:** timeupdate event fires 4-250ms intervals (not fixed), multiple scenes may be passed in single update
**How to avoid:** Check all scenes between last time and current time, or use >= comparison and track current scene index
**Warning signs:** Scenes skip when seeking, fast playback rates break scene timing
```typescript
// WRONG: Assumes scenes fire in order
private handleTimeUpdate = () => {
  const currentTime = this.video.currentTime;
  const nextScene = this.timeline[this.currentSceneIndex + 1];

  if (currentTime >= nextScene.timestamp) {
    this.currentSceneIndex++;
    this.showScene(this.currentSceneIndex);
  }
};

// RIGHT: Find correct scene for current time
private handleTimeUpdate = () => {
  const currentTime = this.video.currentTime;

  // Find latest scene that should be active
  let targetIndex = 0;
  for (let i = this.timeline.length - 1; i >= 0; i--) {
    if (currentTime >= this.timeline[i].timestamp) {
      targetIndex = i;
      break;
    }
  }

  // Only update if scene changed
  if (targetIndex !== this.currentSceneIndex) {
    this.currentSceneIndex = targetIndex;
    this.showScene(targetIndex);
  }
};
```

### Pitfall 6: Author Mode Selector Too Specific or Too Broad
**What goes wrong:** Generated selector breaks on page changes (too specific) or highlights multiple elements (too broad)
**Why it happens:** nth-child selectors are fragile, class selectors may not be unique
**How to avoid:** Prefer ID > unique class > data-* attributes > nth-child path; validate uniqueness
**Warning signs:** Highlights break after page updates, multiple elements highlight simultaneously
```typescript
// WRONG: Always use nth-child path
const path = [];
let el = element;
while (el && el !== document.body) {
  const index = Array.from(el.parentElement.children).indexOf(el) + 1;
  path.unshift(`${el.tagName}:nth-child(${index})`);
  el = el.parentElement;
}
return path.join(' > '); // Fragile!

// RIGHT: Prefer stable selectors
private generateSelector(element: HTMLElement): string {
  // Best: ID
  if (element.id) return `#${element.id}`;

  // Good: data-* attributes
  if (element.dataset.walkthroughId) {
    return `[data-walkthrough-id="${element.dataset.walkthroughId}"]`;
  }

  // Okay: Class if unique
  if (element.className) {
    const selector = `.${element.className.split(' ').join('.')}`;
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  }

  // Fallback: nth-child with warning
  console.warn('Using fragile nth-child selector for element', element);
  return this.generateNthChildPath(element);
}
```

### Pitfall 7: Caption Tracks Not Loaded on Video Load
**What goes wrong:** Caption toggle button doesn't appear even though track elements exist
**Why it happens:** textTracks collection may be empty initially; tracks load asynchronously
**How to avoid:** Listen for 'loadedmetadata' event before accessing textTracks
**Warning signs:** Captions work on second load but not first, race condition behavior
```typescript
// WRONG: Access textTracks immediately
componentDidLoad() {
  if (this.video.textTracks.length > 0) {
    this.hasCaptions = true;
  }
}

// RIGHT: Wait for metadata loaded
componentDidLoad() {
  this.video.addEventListener('loadedmetadata', () => {
    this.hasCaptions = this.video.textTracks.length > 0;
  });
}
```

## Code Examples

Verified patterns from official sources:

### Scene Navigation with Dropdown
```typescript
// Source: Stencil Props and State patterns
renderSceneDropdown() {
  return (
    <select
      class="scene-selector"
      value={this.currentSceneIndex.toString()}
      onChange={(ev) => this.jumpToScene(parseInt((ev.target as HTMLSelectElement).value))}
    >
      {this.timeline.map((scene, index) => (
        <option key={scene.sceneId} value={index}>
          {scene.title}
        </option>
      ))}
    </select>
  );
}

@Method()
async jumpToScene(index: number): Promise<void> {
  if (index < 0 || index >= this.timeline.length) return;

  const scene = this.timeline[index];

  // Seek video to scene timestamp
  if (this.isYouTube) {
    this.youtubeWrapper.seekTo(scene.timestamp);
  } else {
    this.videoElement.currentTime = scene.timestamp;
  }

  // Update scene will happen via timeupdate event
}
```

### Volume Control with Mute
```typescript
// Source: MDN HTMLMediaElement volume/muted properties
@State() volume: number = 1.0;
@State() isMuted: boolean = false;

private handleVolumeChange = (ev: Event) => {
  const input = ev.target as HTMLInputElement;
  this.volume = parseFloat(input.value);

  if (this.isYouTube) {
    this.youtubeWrapper.setVolume(this.volume);
  } else {
    this.videoElement.volume = this.volume;
  }

  // Unmute if volume increased from 0
  if (this.volume > 0 && this.isMuted) {
    this.isMuted = false;
    if (!this.isYouTube) {
      this.videoElement.muted = false;
    }
  }
};

private toggleMute = () => {
  this.isMuted = !this.isMuted;

  if (this.isYouTube) {
    if (this.isMuted) {
      this.youtubeWrapper.setVolume(0);
    } else {
      this.youtubeWrapper.setVolume(this.volume);
    }
  } else {
    this.videoElement.muted = this.isMuted;
  }
};

renderVolumeControls() {
  return (
    <div class="volume-controls">
      <button
        class="mute-toggle"
        onClick={this.toggleMute}
        aria-label={this.isMuted ? 'Unmute' : 'Mute'}
      >
        {this.isMuted ? '🔇' : '🔊'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={this.volume}
        onInput={this.handleVolumeChange}
        aria-label="Volume"
      />
    </div>
  );
}
```

### Event Emission for Author Mode Saves
```typescript
// Source: Stencil Events documentation
import { Event, EventEmitter } from '@stencil/core';

@Event() walkthroughShown: EventEmitter<void>;
@Event() walkthroughHidden: EventEmitter<void>;
@Event() walkthroughAborted: EventEmitter<void>;

@Event() sceneChanged: EventEmitter<{
  sceneId: string;
  sceneIndex: number;
  timestamp: number;
}>;

@Event() timelineUpdated: EventEmitter<{
  timeline: TimelineEntry[];
  changeType: 'create' | 'update' | 'delete';
  affectedSceneId: string;
}>;

// In author mode
private saveScene(scene: TimelineEntry, isNew: boolean): void {
  if (isNew) {
    this.timeline.push(scene);
    this.timeline.sort((a, b) => a.timestamp - b.timestamp);
  } else {
    const index = this.timeline.findIndex(s => s.sceneId === scene.sceneId);
    if (index >= 0) {
      this.timeline[index] = scene;
    }
  }

  // Emit for parent to persist
  this.timelineUpdated.emit({
    timeline: this.timeline,
    changeType: isNew ? 'create' : 'update',
    affectedSceneId: scene.sceneId
  });
}

// Parent app listens and saves
walkthroughElement.addEventListener('timelineUpdated', (ev) => {
  const { timeline } = ev.detail;

  // Save to backend/localStorage
  fetch('/api/walkthroughs/123/timeline', {
    method: 'PUT',
    body: JSON.stringify({ timeline }),
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### Manual Navigation Mode (No Video)
```typescript
// Source: Stencil conditional rendering patterns
@Prop() videoSrc?: string;  // Optional - if not provided, manual mode

renderVideoOrPlaceholder() {
  if (this.videoSrc) {
    return this.renderVideo();
  } else {
    return (
      <div class="manual-mode-placeholder">
        <p>Use navigation buttons to advance through scenes</p>
      </div>
    );
  }
}

renderNavigationButtons() {
  return (
    <div class="nav-buttons">
      <button
        onClick={() => this.previousScene()}
        disabled={this.currentSceneIndex === 0}
      >
        Previous
      </button>
      <span class="scene-counter">
        {this.currentSceneIndex + 1} / {this.timeline.length}
      </span>
      <button
        onClick={() => this.nextScene()}
        disabled={this.currentSceneIndex === this.timeline.length - 1}
      >
        Next
      </button>
    </div>
  );
}

private nextScene(): void {
  if (this.currentSceneIndex < this.timeline.length - 1) {
    this.advanceToScene(this.currentSceneIndex + 1);
  }
}

private previousScene(): void {
  if (this.currentSceneIndex > 0) {
    this.advanceToScene(this.currentSceneIndex - 1);
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jQuery plugins (VideoSync) | Native HTMLVideoElement + Web Components | 2018-2020 | Zero dependencies, framework-agnostic, better performance |
| Flash-based video tutorials | HTML5 video with WebVTT | 2015-2017 | Mobile support, accessibility, no plugins required |
| iframe postMessage custom protocol | YouTube IFrame API official | 2015-2016 | Standardized, documented, maintained by Google |
| requestAnimationFrame for time tracking | timeupdate event | 2010-2012 | Battery friendly, sufficient precision for UX timing |
| Mutation observers for DOM changes | getBoundingClientRect on scroll/resize | 2018-2020 | More efficient, direct positioning, less overhead |
| Custom tour libraries (Hopscotch) | Intro.js, Shepherd.js patterns | 2019-2022 | Better a11y, modern APIs, active maintenance |
| SVG masks for spotlight | box-shadow 9999px spread | 2020-2022 | Simpler, hardware accelerated, single property |
| role="dialog" for panels | role="region" with aria-label | 2021-2023 | Better semantics for non-modal persistent panels |

**Deprecated/outdated:**
- Flash-based video walkthroughs: Removed from browsers in 2020, use HTML5 video
- jQuery VideoSync plugin: Unmaintained since 2014, use native APIs
- Custom video.js YouTube plugin: Adds 240kB when YouTube IFrame API is free
- Mutation observers for overlay positioning: Use scroll/resize listeners instead (more efficient for known events)
- role="application" for interactive panels: Breaks screen reader navigation, use role="region"

## Open Questions

Things that couldn't be fully resolved:

1. **requestVideoFrameCallback vs timeupdate for Timeline Sync**
   - What we know: requestVideoFrameCallback provides frame-accurate timing but fires 25-60 times per second; timeupdate fires 4-250ms intervals
   - What's unclear: Whether scene transition precision justifies the performance overhead of per-frame callbacks
   - Recommendation: Use timeupdate for initial implementation; only switch to requestVideoFrameCallback if users report scene timing issues (LOW confidence this will be needed)

2. **Overlay Update Throttling Strategy**
   - What we know: Scroll/resize events fire very frequently; updating overlays on every event is wasteful
   - What's unclear: Optimal throttle/debounce timing for overlay position updates
   - Recommendation: Use passive scroll listener with requestAnimationFrame throttling; accept 16ms lag on scroll for 60fps target

3. **YouTube vs Native Video Feature Parity**
   - What we know: YouTube IFrame API lacks some HTMLVideoElement features (playbackRate has limited values, no requestVideoFrameCallback)
   - What's unclear: Whether YouTube limitations require feature degradation or alternative UX
   - Recommendation: Document YouTube limitations (playbackRate, captions via YouTube UI only); don't build workarounds that add complexity

4. **CSS Selector Uniqueness Validation**
   - What we know: Generated selectors may become non-unique as page changes
   - What's unclear: Whether to validate uniqueness at runtime and warn, or trust author to test selectors
   - Recommendation: Validate on scene activation (querySelectorAll length check); show warning in author mode if non-unique

5. **Author Mode Persistence Strategy**
   - What we know: Component emits timelineUpdated event; parent app is responsible for persistence
   - What's unclear: Whether component should provide localStorage fallback or leave entirely to parent
   - Recommendation: Pure event emission approach; don't add localStorage (keeps component stateless, parent owns data)

## Sources

### Primary (HIGH confidence)
- [MDN HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement) - Core video API properties, methods, events
- [MDN requestVideoFrameCallback](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback) - Frame-accurate video timing API
- [Google Developers YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) - Official YouTube embed control
- [MDN Adding captions and subtitles to HTML5 video](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/Adding_captions_and_subtitles_to_HTML5_video) - WebVTT implementation patterns
- [MDN getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) - Element positioning API
- [MDN Event.composed](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed) - Shadow DOM event crossing
- [Stencil Methods Documentation](https://stenciljs.com/docs/methods) - @Method() decorator patterns
- [Stencil Events Documentation](https://stenciljs.com/docs/events) - @Event() decorator patterns

### Secondary (MEDIUM confidence)
- [W3C Media Synchronization](https://w3c.github.io/web-roadmaps/media/synchronized.html) - Timeline sync approaches
- [Smashing Magazine: Syncing Content With HTML5 Video](https://www.smashingmagazine.com/2011/03/syncing-content-with-html5-video/) - timeupdate event patterns
- [javascript.info: Shadow DOM Events](https://javascript.info/shadow-dom-events) - Event composition and boundaries
- [W3Schools Draggable Element](https://www.w3schools.com/howto/howto_js_draggable.asp) - Basic drag patterns
- [Intro.js](https://introjs.com/) - Tour library reference implementation for overlay patterns
- [Shepherd.js](https://www.shepherdjs.dev/) - Step-by-step tour patterns
- [GitHub timoxley/element-selector](https://github.com/timoxley/element-selector) - Pointer tool selection patterns
- [Medium: How getBoundingClientRect Works](https://medium.com/@AlexanderObregon/how-getboundingclientrect-works-and-what-it-returns-e67f5b3700cf) - Positioning best practices

### Tertiary (LOW confidence)
- [10 Best Drag And Drop JavaScript Libraries (2026 Update)](https://www.cssscript.com/best-drag-drop-javascript-libraries/) - Library landscape survey
- [TourGuide JS](https://tourguidejs.com/blog/best-tour-guide-libraries-reviewed.html) - Tour library comparison
- [jQuery Plugin VideoSync](https://www.jqueryscript.net/other/jQuery-Plugin-To-Sync-Html5-Video-With-Content-VideoSync.html) - Legacy approach reference
- [interact.js](https://interactjs.io/) - Draggable library reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - HTMLVideoElement, YouTube IFrame API, and getBoundingClientRect are mature, well-documented browser APIs
- Architecture: HIGH - Patterns verified against official docs, similar to established tour libraries, matches Phase 2 component structure
- Pitfalls: MEDIUM-HIGH - timeupdate irregularity and overlay positioning documented in official sources; selector generation pitfalls based on DevTools patterns but not extensively documented

**Research date:** 2026-01-31
**Valid until:** 2026-03-02 (30 days - stable domain with mature APIs)

**Notes:**
- Video APIs (HTML5 and YouTube) are stable and mature
- Shadow DOM event crossing and overlay patterns are well-established
- Main implementation decisions involve balancing precision (requestVideoFrameCallback) vs simplicity (timeupdate)
- Author mode UX should follow familiar browser DevTools patterns for discoverability
- No Context7 queries needed - all information available from MDN, Google Developers, and established library patterns
