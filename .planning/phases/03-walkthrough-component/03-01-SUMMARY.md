---
phase: 03-walkthrough-component
plan: 01
type: execute
status: complete
subsystem: walkthrough
tags: [stencil, web-components, video, youtube, timeline, overlay, draggable, dwc-theming]

# Dependency Graph
requires:
  - 01-01-foundation  # Stencil config, build setup, component structure patterns
  - 01-02-dwc-theming  # DWC token patterns for consistent theming
  - 02-01-orgchart  # Component patterns (shadow DOM, events, methods, props)

provides:
  - sp-walkthrough-component  # Core walkthrough component
  - overlay-manager  # DOM overlay utility (escapes shadow boundary)
  - timeline-engine  # Scene advancement logic
  - youtube-wrapper  # YouTube IFrame API normalization
  - draggable-mixin  # PointerEvent-based drag utility

affects:
  - 03-02-author-mode  # Will extend component with editing capabilities
  - 03-03-testing  # Test suite will validate all walkthrough functionality

# Tech Stack
tech-stack:
  added:
    - YouTube IFrame API  # For YouTube video embedding
  patterns:
    - PointerEvent API for draggable behavior
    - AbortController for event cleanup
    - Fixed-position overlays to escape shadow DOM
    - requestAnimationFrame throttling for scroll/resize
    - VideoPlayer interface normalization (YouTube + standard video)

# Key Files
key-files:
  created:
    - src/components/sp-walkthrough/types/walkthrough.types.ts
    - src/components/sp-walkthrough/utils/overlay-manager.ts
    - src/components/sp-walkthrough/utils/timeline-engine.ts
    - src/components/sp-walkthrough/utils/youtube-wrapper.ts
    - src/components/sp-walkthrough/utils/draggable-mixin.ts
    - src/components/sp-walkthrough/sp-walkthrough.tsx
    - src/components/sp-walkthrough/sp-walkthrough.css
  modified:
    - src/index.html  # Added walkthrough demo section
    - src/components.d.ts  # Auto-generated type definitions

# Decisions
decisions:
  - id: WALK-01-overlay-strategy
    choice: Fixed-position overlays appended to document.body
    reasoning: Shadow DOM encapsulation prevents highlighting external elements; fixed positioning with getBoundingClientRect provides viewport-relative coordinates that update on scroll/resize
    alternatives:
      - "Shadow DOM overlays: Cannot cross shadow boundary"
      - "Absolute positioning: Requires document scroll offset calculations"
    impact: Overlays successfully highlight any DOM element on page regardless of shadow boundaries

  - id: WALK-02-youtube-normalization
    choice: Custom wrapper implementing VideoPlayer interface
    reasoning: Normalizes YouTube IFrame API to match HTMLVideoElement patterns (getCurrentTime, play, pause, etc.) for consistent component logic
    alternatives:
      - "video.js YouTube plugin: 240kB+ bundle size"
      - "Separate code paths: Duplicated logic for YouTube vs standard video"
    impact: Single unified video playback logic supports both standard and YouTube videos seamlessly

  - id: WALK-03-time-tracking
    choice: timeupdate event for standard video, 250ms interval for YouTube
    reasoning: timeupdate event fires 4-250ms which is sufficient for scene transitions; YouTube lacks timeupdate so we simulate it at 250ms to match
    alternatives:
      - "requestVideoFrameCallback: Overkill for simple scene transitions, 25-60fps overhead"
      - "Slower intervals: Risk missing scene timestamps during seeking"
    impact: Scene advancement works reliably without performance overhead

  - id: WALK-04-scroll-resize-throttle
    choice: requestAnimationFrame throttling with passive listeners
    reasoning: Scroll/resize fire frequently; rAF throttling limits updates to 60fps while passive flag improves scroll performance
    alternatives:
      - "Every event: Wasteful, causes jank"
      - "Debouncing: Overlays lag behind scroll, poor UX"
    impact: Smooth overlay repositioning during scroll/resize without performance penalty

  - id: WALK-05-draggable-implementation
    choice: Manual PointerEvent-based implementation
    reasoning: PointerEvent API unifies mouse/touch/pen; manual implementation is ~50 LOC matching Phase 2 patterns vs 33kB library
    alternatives:
      - "interact.js: 33kB for simple drag behavior"
      - "Mouse-only events: No touch support"
    impact: Zero-dependency draggable panel with full pointer device support

# Metrics
duration: 5.2 min
completed: 2026-01-31
commits: 2
files-created: 7
files-modified: 2
---

# Phase 03 Plan 01: Walkthrough Component Summary

**One-liner:** Complete sp-walkthrough web component with video playback (standard + YouTube), timeline-synced scene advancement, cross-shadow-boundary DOM highlighting, draggable panel, and full navigation/control UI

## What Was Built

Created the core sp-walkthrough web component implementing all non-author-mode requirements (WALK-01 through WALK-06, WALK-10 through WALK-15).

**Component features:**
- Video playback supporting both standard files (MP4/WebM) and YouTube embeds via normalized VideoPlayer interface
- Timeline synchronization with automatic scene advancement based on currentTime
- DOM element highlighting using fixed-position overlays that escape shadow DOM boundaries
- Manual navigation controls (previous/next/scene dropdown) for non-video mode
- Draggable panel with viewport constraints using PointerEvent API
- Volume/mute controls and WebVTT caption toggle
- ESC key abort functionality with proper cleanup
- Public API methods: show(), hide(), play(), pause(), restart(), abort()
- Custom events: walkthroughShown, walkthroughHidden, walkthroughAborted, sceneChanged, timelineUpdated
- DWC theming with light/dark overrides

**Utility modules (pure, reusable):**
- **OverlayManager:** Creates/positions/cleans up fixed-position overlays on document.body with scroll/resize tracking via requestAnimationFrame throttling
- **TimelineEngine:** Pure scene lookup by currentTime with sorted scene management
- **YouTubePlayerWrapper:** Normalizes YouTube IFrame API to VideoPlayer interface with time tracking via 250ms interval
- **draggable-mixin:** PointerEvent-based drag behavior with viewport constraints and cleanup function
- **walkthrough.types:** TypeScript interfaces for Scene, WalkthroughConfig, SceneChangeDetail, TimelineUpdateDetail, VideoPlayer

## How It Works

**Initialization:**
1. Component loads with scenes prop containing Scene[] array (each scene has id, title, description, timestamp, highlightSelector)
2. OverlayManager initialized for DOM highlights, TimelineEngine initialized with sorted scenes
3. If videoSrc provided, determine if YouTube URL or standard video and set up appropriate player

**Video playback flow:**
1. User calls show() method or clicks show button in demo
2. Component advances to first scene (index 0), highlights target element if highlightSelector present
3. On video timeupdate event (or 250ms interval for YouTube), TimelineEngine.getCurrentSceneIndex(currentTime) determines active scene
4. If scene index changed, advanceToScene() updates highlights and emits sceneChanged event
5. OverlayManager creates fixed-position div on document.body positioned via getBoundingClientRect()
6. Scroll/resize listeners update overlay positions via requestAnimationFrame throttling

**Manual navigation flow:**
1. Previous/Next buttons seek video to scene timestamp (or advance scene index in manual mode)
2. Scene dropdown allows jumping to specific scene by seeking to its timestamp
3. Play/pause, volume, mute, captions controls interact with video player (standard or YouTube wrapper)

**Cleanup:**
1. ESC key triggers abort() method
2. OverlayManager.cleanup() removes all overlays and aborts event listeners via AbortController
3. YouTubePlayerWrapper.destroy() stops time tracking interval and destroys player
4. makeDraggable cleanup function aborts PointerEvent listeners

## Key Implementation Details

**Cross-shadow-boundary highlighting:**
- Overlays appended to document.body with position: fixed to escape shadow DOM encapsulation
- getBoundingClientRect() provides viewport-relative coordinates (top/left/width/height)
- Scroll/resize listeners update positions via requestAnimationFrame to throttle to 60fps
- AbortController manages all overlay event listeners for clean teardown

**YouTube API integration:**
- Check URL pattern to detect YouTube vs standard video
- YouTubePlayerWrapper loads IFrame API script if not present, queues commands until ready
- Implements VideoPlayer interface (play, pause, getCurrentTime, getDuration, seekTo, setVolume, etc.)
- Simulates timeupdate event at 250ms interval (YouTube doesn't provide native timeupdate)
- Handles PlayerState changes (PLAYING/PAUSED/ENDED) to emit corresponding events

**Draggable panel:**
- makeDraggable() attaches PointerEvent listeners to drag handle
- On pointerdown: record start positions, set pointer capture
- On pointermove: calculate delta, constrain to viewport bounds (0 to window.innerWidth - panelWidth), update left/top styles
- On pointerup: release pointer capture, reset cursor
- Returns cleanup function that aborts AbortController for all listeners

**Timeline synchronization:**
- TimelineEngine stores scenes sorted by timestamp ascending
- getCurrentSceneIndex() uses reverse iteration to find latest scene where timestamp <= currentTime
- Handles seeking (multiple scenes may be skipped in single timeupdate) by always finding correct scene for currentTime
- No assumptions about sequential scene advancement

## Integration Points

**With Phase 1 Foundation:**
- Uses Stencil @Component, @Prop, @State, @Event, @Method decorators following established patterns
- Follows shadow: true with DWC theming via CSS custom properties
- Build succeeds with no TypeScript errors

**With Phase 2 OrgChart:**
- Reuses DWC token patterns (--dwc-color-primary, --dwc-spacing-md, etc.)
- Follows same component structure (props, state, events, methods, render)
- Uses similar event cleanup patterns (storing handler references for removeEventListener)

**With external page DOM:**
- Overlays highlight any element on page via CSS selector (e.g., '#demo-element-1')
- Works across shadow boundaries by appending to document.body
- Does not interfere with page layout (pointer-events: none on overlays)

## Deviations from Plan

None - plan executed exactly as written.

All required features implemented:
- ✅ Video playback (standard + YouTube)
- ✅ Timeline synchronization
- ✅ DOM element highlighting
- ✅ Manual navigation
- ✅ Draggable panel
- ✅ Volume/captions controls
- ✅ Scene dropdown
- ✅ ESC abort
- ✅ Public API methods
- ✅ Custom events
- ✅ DWC theming

Author mode (WALK-07/08/09) intentionally deferred to Plan 02 as specified.

## Testing Notes

**Manual testing via index.html:**
- Manual walkthrough demo (no video, prev/next navigation)
- Video walkthrough demo (YouTube video with scene highlighting)
- Event logging shows walkthroughShown, sceneChanged, walkthroughAborted events
- Demo elements (#demo-element-1, #demo-element-2) highlight correctly during scenes
- Panel is draggable, stays within viewport bounds
- ESC key aborts walkthrough and cleans up overlays

**Build verification:**
- `npm run build` succeeds with no errors
- `npx tsc --noEmit` passes with no TypeScript errors
- All 7 new files created, 2 existing files modified

**Known edge cases for Plan 03 testing:**
- YouTube API script loading race condition (handled via command queue)
- Scroll/resize during overlay positioning (handled via rAF throttling)
- Multiple walkthrough instances (each has own OverlayManager/AbortController)
- Video seeking past multiple scenes (TimelineEngine.getCurrentSceneIndex handles correctly)

## Next Phase Readiness

**For Plan 02 (Author Mode):**
- Component structure supports authorMode prop (stubbed)
- timelineUpdated event already implemented for scene CRUD
- Pointer tool pattern researched (see 03-RESEARCH.md Pattern 5)
- Scene management via TimelineEngine.setScenes() ready for dynamic updates

**For Plan 03 (Testing):**
- All public methods testable via component API
- Event emissions observable for verification
- OverlayManager.highlightElement() can be tested with mock DOM elements
- YouTubePlayerWrapper can be tested in isolation with mocked YT global

**Known gaps:**
- Author mode UI not implemented (intentional, Plan 02)
- No test suite yet (intentional, Plan 03)
- WebVTT captions tested with native track element but no custom styling yet

## Decisions Made

1. **Fixed-position overlays over shadow DOM overlays** - Shadow DOM cannot cross boundaries; fixed positioning with getBoundingClientRect enables highlighting any page element
2. **Custom YouTube wrapper over video.js plugin** - 0kB vs 240kB+; wrapper provides all needed functionality
3. **timeupdate event over requestVideoFrameCallback** - 4-250ms frequency sufficient for scene transitions without 60fps overhead
4. **requestAnimationFrame throttling for scroll/resize** - Limits overlay updates to 60fps for smooth performance
5. **Manual PointerEvent implementation over interact.js** - 50 LOC vs 33kB library; matches Phase 2 patterns

## Lessons Learned

**What went well:**
- Utility module separation kept component clean and logic testable
- VideoPlayer interface abstraction made YouTube integration seamless
- AbortController pattern simplified all event cleanup (scroll, resize, ESC key, drag)
- Research phase provided clear patterns for overlay positioning and YouTube API

**What was tricky:**
- Select element value attribute not supported in Stencil JSX - used selected prop on option instead
- YouTube IFrame API loads asynchronously - command queue pattern prevents race conditions
- getBoundingClientRect() returns viewport-relative coords requiring scroll/resize listeners

**For next time:**
- Consider extracting draggable-mixin to shared utils folder for reuse across components
- WebVTT caption styling via ::cue pseudo-element could be added in theming phase
- Time formatting utility (MM:SS) might be useful if we add progress bars later

## Artifacts

**Source files:**
```
src/components/sp-walkthrough/
├── types/
│   └── walkthrough.types.ts          (Scene, WalkthroughConfig, events, VideoPlayer interface)
├── utils/
│   ├── overlay-manager.ts             (DOM overlay creation/positioning/cleanup)
│   ├── timeline-engine.ts             (Scene lookup by currentTime)
│   ├── youtube-wrapper.ts             (YouTube IFrame API normalization)
│   └── draggable-mixin.ts             (PointerEvent drag behavior)
├── sp-walkthrough.tsx                 (Main component - 550+ LOC)
└── sp-walkthrough.css                 (DWC-themed styles with light/dark overrides)
```

**Demo:**
```
src/index.html                         (Manual + video walkthrough demos with event logging)
```

**Commits:**
- 7e4924c: feat(03-01): create types and utility modules for sp-walkthrough
- e4c74df: feat(03-01): create sp-walkthrough component with full functionality

**Requirements coverage:**
- ✅ WALK-01: Fixed-position panel with video playback
- ✅ WALK-02: Timeline-based scene advancement
- ✅ WALK-03: DOM element highlighting (cross-boundary)
- ✅ WALK-04: Standard video (MP4/WebM) support
- ✅ WALK-05: YouTube embed support
- ✅ WALK-06: Manual navigation (prev/next)
- ✅ WALK-10: Draggable panel repositioning
- ✅ WALK-11: WebVTT captions with toggle
- ✅ WALK-12: Volume control with mute
- ✅ WALK-13: Scene dropdown navigation
- ✅ WALK-14: ESC key abort with cleanup
- ✅ WALK-15: Events and public API methods

**Deferred to Plan 02:**
- WALK-07: Author mode UI
- WALK-08: Scene creation/editing
- WALK-09: Pointer tool for element selection
