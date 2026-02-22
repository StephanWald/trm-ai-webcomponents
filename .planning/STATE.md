# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-21)

**Core value:** Developers can add a single script tag or npm install and immediately use production-ready, self-contained Skillspilot UI components that look and behave consistently — without framework lock-in.
**Current focus:** v1.1 — Phase 10: Language & Voice (complete), moving to Phase 11

## Current Position

Phase: 10 of 12 (language-voice) — COMPLETE
Plan: 2 of 2 in current phase (both complete)
Status: Phase 10 complete — sp-language-selector, sp-language-list, and sp-voice-input-button delivered
Last activity: 2026-02-22 — Completed 10-02-PLAN.md: sp-voice-input-button (44px mic button, hover cue, red pulse, shake animation, mode indicator)

Progress: [█████░░░░░] 40% (v1.1)

## Performance Metrics

**Velocity (v1.1):**
- Total plans completed: 9
- Average duration: 9.9m
- Total execution time: 90m

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 07-org-chart-parity | 3 | 52m | 17.3m |
| 08-walkthrough-parity | 2 | 16m | 8m |
| 09-popover-utility | 2 | 16m | 8m |
| 10-language-voice | 2 | 6m | 3m |

*Updated after each plan completion*

## Accumulated Context

### Decisions

All v1.0 decisions in PROJECT.md Key Decisions table.

v1.1 key decisions:
- Original prototypes are the visual source of truth — sp-org-chart and sp-walkthrough must match 1:1
- sp-popover (Phase 9) built before language/comm components so they can use it for dropdowns
- sp-markdown-editor has no parity work in v1.1 — already production-ready
- [Phase 07-01]: Branch entities are users without lastName; isBranch() type guard is the canonical check
- [Phase 07-01]: filterByBranch mode (highlight/isolate) is a component concern; filter logic is identical for both modes
- [Phase 07-01]: getDisplayName() centralises firstName+lastName display name formatting across all utilities
- [Phase 07-02]: Filter input removed entirely — branch filtering via filterMode/filterBranchId props only
- [Phase 07-02]: editable defaults to true to match prototype drag-and-drop-on behavior
- [Phase 07-02]: applyBranchFilter() consumed at render layer (shouldDimNode/shouldHideNode) for highlight vs isolate
- [Phase 07-03]: Timed delete via drag-hold on delete drop zone (not long-press on tiles) — cancelDeleteHold() resets all hold state
- [Phase 07-03]: document-level dragover listener attached in handleDragStart and detached in cleanupDragState for floating preview cursor tracking
- [Phase 07-03]: typeof Image guard in componentWillLoad needed for JSDOM spec test compatibility
- [Phase 07-03]: jest.useFakeTimers() must never precede await page.waitForChanges() in Stencil spec tests (blocks async resolution)
- [Phase 08-01]: Single-row controls-row replaces panel-header — acts as both drag handle and controls container
- [Phase 08-01]: Previous/next scene buttons kept alongside skip-back/forward — skip only works with video, prev/next needed for manual mode
- [Phase 08-01]: SVG icon helpers are private TSX methods returning JSX — same pattern as sp-org-chart inline icons
- [Phase 08-02]: MarkdownRenderer copied into sp-walkthrough/utils/ rather than imported cross-component to avoid Stencil bundling issues
- [Phase 08-02]: TextTrack mode kept 'hidden' always; cuechange listener reads cues programmatically for custom caption overlay
- [Phase 08-02]: injectHighlightStyles() uses document.getElementById guard for idempotent @keyframes injection; clearHighlights() leaves styles in document.head
- [Phase 09-01]: anchor prop accepts string (CSS selector), HTMLElement, or null (falls back to previousElementSibling)
- [Phase 09-01]: position: fixed (not absolute) so positions match getBoundingClientRect() viewport coordinates
- [Phase 09-01]: rAF defers position compute in openInternal() so shadow DOM container has rendered dimensions before measurement
- [Phase 09-01]: Placement flip logic only flips when new position is actually better — then clamps to 10px margin
- [Phase 09-02]: global.requestAnimationFrame sync shim at module level required for Stencil spec tests when component uses rAF in lifecycle (mock-doc implements rAF as setTimeout which flushAll doesn't drain)
- [Phase 09-02]: showPopover/hidePopover should only set the open prop — @Watch drives openInternal/closeInternal to prevent double-open/close events
- [Phase 09-02]: componentDidLoad() needed for initial open=true — Stencil @Watch does not fire for initial prop values
- [Phase 10-01]: sp-language-selector embeds sp-popover in its own shadow DOM render — button is the popover's previousElementSibling anchor
- [Phase 10-01]: languageChange event name kept despite Stencil warning about native DOM conflict — plan requires this name, it is functional
- [Phase 10-01]: renderMicrophoneIcon included in icons.tsx proactively for Plan 02 voice button reuse
- [Phase 10-01]: Icon helpers as standalone exported TSX functions in utils/icons.tsx — not class methods
- [Phase 10-02]: State machine (5 states) drives all CSS class application — currentState is single source of truth
- [Phase 10-02]: Hover progress uses setInterval at 50ms steps for simplicity over requestAnimationFrame
- [Phase 10-02]: Error auto-clear via setTimeout 3000ms; clearErrorTimer() called in disconnectedCallback
- [Phase 10-02]: renderRobotIcon added to shared icons.tsx (not inline in voice button) — follows icons.tsx pattern

### Pending Todos

None.

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Improve README with docs links, GitHub artifact install instructions, and live demo references | 2026-02-21 | b347e09 | [1-improve-readme-with-docs-links-github-ar](./quick/1-improve-readme-with-docs-links-github-ar/) |

## Session Continuity

Last session: 2026-02-22
Stopped at: Completed 10-02-PLAN.md (sp-voice-input-button — Phase 10 complete, both plans done)
Resume file: None
