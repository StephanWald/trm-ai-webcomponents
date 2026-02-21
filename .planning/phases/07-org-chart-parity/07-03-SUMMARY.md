---
phase: 07-org-chart-parity
plan: 03
subsystem: ui
tags: [stencil, drag-and-drop, css-animation, web-components, typescript, jest]

# Dependency graph
requires:
  - phase: 07-02
    provides: vertical list layout, branch tile rendering, editable prop, filterMode/filterBranchId props

provides:
  - Custom floating drag preview with avatar+name following cursor
  - Native drag ghost hidden via transparent 1x1 image
  - SVG drop zones positioned at bottom-right (not emoji, not centered)
  - 4-second timed delete via drag-hold on delete zone with circular countdown overlay
  - cancelDeleteHold() resets all hold state; releasing before 4s cancels deletion
  - Branch filtering: highlight mode dims non-matching, isolate mode hides unrelated branches
  - Comprehensive spec tests for all drag/delete/filter behaviors
  - Updated E2E tests with new User interface (firstName/lastName)

affects: [07-04, 07-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - document-level dragover listener for cursor tracking (attached/detached during drag lifecycle)
    - setDragImage(transparentImg, 0, 0) to suppress native browser drag ghost
    - position:fixed floating overlay elements for drag preview and countdown
    - setInterval-based progress tracking with cancelDeleteHold() cleanup
    - typeof Image guard for JSDOM test environment compatibility

key-files:
  created: []
  modified:
    - src/components/sp-org-chart/sp-org-chart.tsx
    - src/components/sp-org-chart/sp-org-chart.css
    - src/components/sp-org-chart/sp-org-chart.spec.ts
    - src/components/sp-org-chart/sp-org-chart.e2e.ts
    - src/components.d.ts

key-decisions:
  - "Timed delete uses drag-hold on delete drop zone (not long-press on tiles) — matches prototype interaction model"
  - "Countdown overlay uses position:fixed to follow cursor independently of scroll position"
  - "typeof Image guard in componentWillLoad enables JSDOM spec test compatibility without test mocks"
  - "Fake timers removed from spec tests that use newSpecPage() to prevent async resolution timeouts"
  - "handleDeleteZoneRelease cancels hold without deleting — releasing before 4s is intentional cancel gesture"

patterns-established:
  - "Document-level event listeners (dragover) attached in handleDragStart and detached in cleanupDragState/disconnectedCallback"
  - "Fixed-position floating elements (drag preview, countdown overlay) rendered inside shadow DOM work correctly for cursor-following UX"

requirements-completed: [ORGC-05, ORGC-06, ORGC-07, ORGC-08]

# Metrics
duration: 41min
completed: 2026-02-21
---

# Phase 07 Plan 03: Drag-Drop UX and Branch Filtering Summary

**Custom floating drag preview, SVG drop zones at bottom-right, 4-second timed delete with countdown overlay, and branch filter highlight/isolate modes — all spec-tested with 530 passing tests**

## Performance

- **Duration:** 41 min
- **Started:** 2026-02-21T12:37:18Z
- **Completed:** 2026-02-21T13:18:30Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Custom floating drag preview (avatar + name) follows cursor via document-level dragover listener; native browser drag ghost hidden with `setDragImage(transparent, 0, 0)`
- Drop zones moved from bottom-center with emoji icons to bottom-right with SVG icons (X for unlink, trash for delete)
- Delete zone requires 4-second drag-hold; circular countdown overlay follows cursor showing remaining seconds; releasing before 4s cancels
- Old long-press deletion (pointerdown/move/up on tiles) fully removed
- Branch filtering verified: `filterMode='highlight'` dims non-matching users; `filterMode='isolate'` hides unrelated branches
- 530 spec tests pass (all suites green); E2E tests updated for new User interface

## Task Commits

Each task was committed atomically:

1. **Task 1: Custom drag preview, SVG drop zones, timed delete** - `86a3486` (feat)
2. **Task 2: Spec and E2E test updates** - `05c2481` (test)
3. **Chore: Auto-generated types** - `e3e1b6b` (chore)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/components/sp-org-chart/sp-org-chart.tsx` - Added draggedUser/dragPreviewPos states, document dragover listener, handleDeleteZoneDragOver/Leave/Release, cancelDeleteHold, renderDeleteCountdown; removed long-press handlers
- `src/components/sp-org-chart/sp-org-chart.css` - Added .drag-preview, .drag-preview__avatar, .drag-preview__name, .drop-zone-container (replacing .drop-zones), .drop-zone__icon (SVG sizing), .countdown-overlay; removed old .countdown-ring
- `src/components/sp-org-chart/sp-org-chart.spec.ts` - Removed 450+ lines of long-press tests; added ~300 lines for drag preview, SVG drop zones, countdown, deleteHold cancel, branch filter mode tests; fixed fake timer cascade bug
- `src/components/sp-org-chart/sp-org-chart.e2e.ts` - Rewrote all tests with firstName/lastName User interface; added vertical layout, branch tile, expanded info, branch filtering via props tests
- `src/components.d.ts` - Auto-generated; exports BranchFilterMode, updated editable default docs

## Decisions Made
- **Timed delete via drag-hold:** `handleDeleteZoneDragOver` starts a 16ms setInterval that tracks elapsed time; completion triggers `deleteUser()` then `cleanupDragState()`. Releasing before 4s calls `handleDeleteZoneRelease` which calls `cancelDeleteHold()` — no instant delete.
- **Countdown overlay position:fixed:** Follows `deleteCountdownPos` (updated from dragover events), positioned above cursor at `y - 60px`. Works independently of page scroll.
- **typeof Image guard:** `new Image()` unavailable in JSDOM. Guard in `componentWillLoad` ensures graceful degradation; tests set `transparentImg` manually when testing setDragImage calls.
- **No fake timers in newSpecPage tests:** `jest.useFakeTimers()` before `await page.waitForChanges()` blocks Stencil's internal promise resolution. Fix: removed fake timers from tests that only set state directly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Image constructor unavailable in JSDOM test environment**
- **Found during:** Task 1 (running spec tests post-implementation)
- **Issue:** `new Image(1, 1)` in `componentWillLoad` threw `ReferenceError: Image is not defined` in JSDOM, causing all 85 spec tests to fail
- **Fix:** Added `typeof Image !== 'undefined'` guard around the Image constructor call
- **Files modified:** `src/components/sp-org-chart/sp-org-chart.tsx`
- **Verification:** All spec tests pass (530/530)
- **Committed in:** `86a3486` (Task 1 commit)

**2. [Rule 1 - Bug] Fake timers placed before newSpecPage() caused cascade timeout**
- **Found during:** Task 2 (running updated spec tests)
- **Issue:** `jest.useFakeTimers()` in `handleDeleteZoneDragLeave` test was called at line 1401 after `newSpecPage()` completed, then `page.waitForChanges()` used fake-timer environment and never resolved. This caused 27 subsequent tests to timeout at 22.5s each (587s total).
- **Fix:** Removed `jest.useFakeTimers()` / `jest.useRealTimers()` from tests that set state directly without starting real intervals
- **Files modified:** `src/components/sp-org-chart/sp-org-chart.spec.ts`
- **Verification:** 530/530 tests pass, total runtime back to normal
- **Committed in:** `05c2481` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (Rule 1 - bugs)
**Impact on plan:** Both were environment compatibility issues, not logic errors. No scope creep. All planned features delivered.

## Issues Encountered
- The `--testPathPattern` flag in Stencil's jest runner uses regex character splitting, so `sp-org-chart` matched all files including sp-walkthrough patterns. Used direct file output capture to verify results.
- `setDragImage` test needed manual `transparentImg` injection since JSDOM doesn't provide `Image` constructor — resolved by setting the property in the test setup.

## Next Phase Readiness
- Drag-and-drop UX matches prototype spec: custom preview, SVG zones, timed delete
- Branch filtering fully functional with highlight/isolate modes
- All tests passing, build clean
- Ready for Plan 04 (remaining prototype parity features or polish)

---
*Phase: 07-org-chart-parity*
*Completed: 2026-02-21*
