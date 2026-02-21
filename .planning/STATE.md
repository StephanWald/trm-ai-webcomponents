# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-21)

**Core value:** Developers can add a single script tag or npm install and immediately use production-ready, self-contained Skillspilot UI components that look and behave consistently — without framework lock-in.
**Current focus:** v1.1 — Phase 7: Org Chart Parity

## Current Position

Phase: 7 of 12 (Org Chart Parity)
Plan: 3 of 5 in current phase (07-03 complete)
Status: In progress
Last activity: 2026-02-21 — Completed 07-03-PLAN.md: custom drag preview, SVG drop zones, timed delete, branch filtering

Progress: [███░░░░░░░] 15% (v1.1)

## Performance Metrics

**Velocity (v1.1):**
- Total plans completed: 3
- Average duration: 17.7m
- Total execution time: 52m

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 07-org-chart-parity | 3 | 52m | 17.3m |

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

### Pending Todos

None.

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Improve README with docs links, GitHub artifact install instructions, and live demo references | 2026-02-21 | b347e09 | [1-improve-readme-with-docs-links-github-ar](./quick/1-improve-readme-with-docs-links-github-ar/) |

## Session Continuity

Last session: 2026-02-21
Stopped at: Completed 07-03-PLAN.md (custom drag preview, SVG drop zones, timed delete, branch filtering)
Resume file: None
