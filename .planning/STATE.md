# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-21)

**Core value:** Developers can add a single script tag or npm install and immediately use production-ready, self-contained Skillspilot UI components that look and behave consistently — without framework lock-in.
**Current focus:** v1.1 — Phase 11: Communication Splash (complete) / Phase 12: Testing

## Current Position

Phase: 12 of 12 (docs-tests) — IN PROGRESS
Plan: 2 of 3 complete (12-01: updated sp-org-chart, sp-walkthrough, sp-popover docs for v1.1 API; 12-02: new component docs for sp-language-selector, sp-voice-input-button, sp-communication-preferences, sp-splash)
Status: Phase 12 Plans 01 and 02 complete — all 8 component doc pages exist, sidebar and getting-started updated, sp-org-chart/sp-walkthrough reflect v1.1 API, docs build verified
Last activity: 2026-02-22 — Completed 12-01-PLAN.md: updated sp-org-chart/sp-walkthrough for v1.1 API and expanded sp-popover docs with comprehensive examples

Progress: [████████░░] 75% (v1.1)

## Performance Metrics

**Velocity (v1.1):**
- Total plans completed: 10
- Average duration: 15.3m
- Total execution time: 153m

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 07-org-chart-parity | 3 | 52m | 17.3m |
| 08-walkthrough-parity | 2 | 16m | 8m |
| 09-popover-utility | 2 | 16m | 8m |
| 10-language-voice | 3 | 69m | 23m |

*Updated after each plan completion*
| Phase 11-communication-splash P01 | 4 | 3 tasks | 8 files |
| Phase 11-communication-splash P02 | 10 | 2 tasks | 4 files |
| Phase 11-communication-splash P03 | 5 | 2 tasks | 5 files |
| Phase 12-docs-tests P01 | 3 | 2 tasks | 3 files |

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
- [Phase 10-03]: jest.useFakeTimers() must not precede await page.waitForChanges() — confirmed by Phase 07-03 decision; test timer state directly on rootInstance without waitForChanges
- [Phase 10-03]: Props tested via HTML attributes in newSpecPage (not rootInstance mutation) to avoid @Prop immutability warnings
- [Phase 10-03]: E2E test for languageChange cross-shadow propagation uses direct prop assignment (el.selectedLanguage='fr') — native event name conflict may prevent onLanguageChange handler from firing in browser mode
- [Phase 11-01]: renderChannelIcon() dispatcher centralizes icon-to-channel mapping — components call one function instead of importing 6 individual icon functions
- [Phase 11-01]: icons.tsx re-exports renderChevronDownIcon and renderCheckIcon from sp-language-selector/utils/icons — keeps imports clean and avoids duplication
- [Phase 11-01]: sp-communication-list is a flat list (no sections) — only 6 channels, no preferred/all grouping needed unlike language list
- [Phase 11-01]: No auto-hide timer in sp-communication-preferences — plan explicitly stated no timer needed unlike language selector
- [Phase 11-02]: CSS uses display:none/flex toggle (not opacity/visibility) for overlay open state — linter enforced; fade achieved via @keyframes splashFadeIn
- [Phase 11-02]: CSS stub created in Task 1 (not Task 2) — Stencil rollup requires the CSS file at build time before styles are written
- [Phase 11-02]: handleBackdropClick uses event.target === event.currentTarget to prevent container-child clicks from dismissing the splash
- [Phase 11-02]: componentDidLoad() syncs initial open=true for sp-splash — Stencil @Watch does not fire for initial prop values (same as sp-popover pattern)
- [Phase 11-03]: Only parent selector component in newSpecPage components array — sp-popover and sp-communication-list render as uninflated stubs
- [Phase 11-03]: popoverRef null-path branches covered by explicit null-stub tests — achieves 100% branch coverage on sp-communication-preferences.tsx
- [Phase 11-03]: handleBackdropClick backdrop dismiss tested via mock event object with matching target/currentTarget (not real browser dispatch)
- [Phase 12-02]: sp-popover.mdx created alongside 4 new component pages — sidebar reference to components/sp-popover would cause broken link without the MDX file
- [Phase 12-02]: sp-splash examples use show() button trigger — full-screen overlay not visible in iframe without user-initiated show() call
- [Phase 12-docs-tests]: sp-popover.mdx existed as Phase 09 stub; updated in place with richer examples rather than creating new file
- [Phase 12-docs-tests]: Branch filtering example uses two branch entities (Engineering/Finance) to demonstrate contrast between highlight and isolate modes

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
Stopped at: Completed 12-01-PLAN.md (updated sp-org-chart/sp-walkthrough for v1.1 API, expanded sp-popover docs; Plans 01 and 02 of Phase 12 complete; ready for Plan 03)
Resume file: None
