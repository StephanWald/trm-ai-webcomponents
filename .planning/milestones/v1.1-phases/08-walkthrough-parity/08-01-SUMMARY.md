---
phase: 08-walkthrough-parity
plan: "01"
subsystem: sp-walkthrough
tags: [icons, svg, tabler, controls, progress-bar, skip, restart, css-tokens, single-row-layout]
dependency_graph:
  requires: []
  provides: [tabler-svg-icons, progress-bar-seek, skip-controls, restart-control, single-row-controls, dwc-theming]
  affects: [sp-walkthrough]
tech_stack:
  added: []
  patterns: [tabler-svg-inline, renderProgressBar, formatTime-utility, controls-row-drag-handle]
key_files:
  created: []
  modified:
    - src/components/sp-walkthrough/sp-walkthrough.tsx
    - src/components/sp-walkthrough/sp-walkthrough.css
    - src/components/sp-walkthrough/sp-walkthrough.spec.ts
    - src/components/sp-walkthrough/sp-walkthrough.e2e.ts
decisions:
  - "Single-row controls-row replaces panel-header — acts as both drag handle and controls container"
  - "SVG icon helpers (iconPlay, iconPause, iconSkipBack10, etc.) are private TSX methods, same pattern as sp-org-chart"
  - "Progress bar uses div-based fill with percentage-width CSS for smooth seek display"
  - "formatTime returns mm:ss for sub-hour, h:mm:ss for 3600+ seconds"
  - "Previous/next scene buttons kept alongside skip-back/forward for manual mode navigation"
  - "Scene list uses hidden select + visible scene-list button combo for keyboard and click access"
metrics:
  duration: 9m
  completed_date: "2026-02-21"
  tasks_completed: 2
  files_modified: 4
---

# Phase 8 Plan 01: Tabler SVG Icons, Progress Bar, Skip/Restart Controls Summary

Replaced all emoji-based walkthrough controls with inline Tabler SVG icons, restructured the panel into a single-row controls layout, added a visual progress bar with click-to-seek, added skip ±10s and restart buttons, and ensured full DWC CSS custom property coverage throughout.

## What Was Built

### Icon System (WALK-01)
All previous emoji characters (▶, ⏸, ⏮, ⏭, 🔇, 🔊, ✕, CC) replaced with private TSX helper methods that return inline Tabler SVG icons: `iconPlay`, `iconPause`, `iconSkipBack10`, `iconSkipForward10`, `iconRestart`, `iconVolumeOn`, `iconVolumeOff`, `iconCaptions`, `iconSceneList`, `iconClose`, `iconPrevScene`, `iconNextScene`. Each uses `width="18" height="18"` and `class="icon"`.

### Single-Row Controls Layout (WALK-10)
Removed `.panel-header` and its associated `panel-title`/`close-btn` from a separate section. All controls now live in a single `.controls-row` flex container that also serves as the drag handle. Row order: play/pause, skip-back-10, skip-forward-10, restart, prev-scene, scene-counter, next-scene, progress-bar (flex-grow), time-display, volume, captions, scene-list, panel-title (margin-left: auto), close.

### Progress Bar (WALK-02)
`renderProgressBar()` renders `.progress-bar` with `.progress-bar__fill` whose width is `(currentTime / duration) * 100%`. `handleProgressClick(ev)` reads `getBoundingClientRect()` from the bar, calculates `fraction = (clientX - left) / width`, seeks to `fraction * duration`. Visible only when `videoSrc` is set.

### Skip Buttons (WALK-03)
- `handleSkipBack()`: seeks to `Math.max(0, currentTime - 10)` on both YouTube and standard video
- `handleSkipForward()`: seeks to `Math.min(duration, currentTime + 10)` (or `currentTime + 10` when duration is unknown)

### Restart Button (WALK-04)
Restart button in controls row calls `this.restart()`. The existing `restart()` method handles seeking to 0 and resetting scene to first.

### formatTime Utility
`formatTime(seconds: number): string` returns `"m:ss"` for sub-minute (e.g., `"0:30"`), `"m:ss"` for sub-hour (e.g., `"1:05"` for 65s), and `"h:mm:ss"` for 3600+ seconds.

### DWC Theming Audit (WALK-11)
All CSS properties use `var(--dwc-*, fallback)` pattern. Added fallback values to all remaining properties that lacked them (e.g., `font-family: var(--dwc-font-family, system-ui, sans-serif)`). New elements (`.progress-bar`, `.controls-row`, `.time-display`, `.icon`) all use DWC tokens.

## Tests

New spec tests added: skip back/forward clamp behavior, handleProgressClick fraction-to-time conversion, formatTime utility (0, 30, 65, 3661, NaN), progress bar render conditions, time display, SVG icon presence in all control buttons, no `.panel-header` in layout, `.controls-row` present, progress bar `role="slider"`, play button shows pause icon when playing.

Coverage: 85.91% statements, 76.44% branches, 88% functions — above the 70% threshold.

E2E tests updated: verify no `panel-header`, verify `controls-row`, verify skip/restart buttons, verify SVG icons in all control buttons, verify progress bar visibility with/without videoSrc.

Total: 555 spec tests passing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Previous/next scene buttons retained alongside skip-back/forward**
- **Found during:** Task 1
- **Issue:** The plan specified skip-back/forward replace prev/next, but manual mode (no video) requires prev/next for scene navigation. Skip-back/forward only work with video.
- **Fix:** Kept both sets of buttons. Skip-back/forward only render when `videoSrc` is set; prev/next render always.
- **Files modified:** sp-walkthrough.tsx
- **Commit:** 9a7417c

**2. [Rule 3 - Blocking] componentDidLoad draggable attach point updated**
- **Found during:** Task 1
- **Issue:** `makeDraggable(panel, '.panel-header')` would fail since `.panel-header` was removed.
- **Fix:** Updated to `makeDraggable(panel, '.controls-row')` so the new controls bar is the drag handle.
- **Files modified:** sp-walkthrough.tsx
- **Commit:** 9a7417c

## Self-Check: PASSED
