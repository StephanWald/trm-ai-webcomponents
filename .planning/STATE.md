# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Developers can add a single script tag or npm install and immediately use production-ready, self-contained Skillspilot UI components that look and behave consistently — without framework lock-in.
**Current focus:** Phase 5: Testing & Quality

## Current Position

Phase: 5 of 6 (Testing & Quality)
Plan: 3 of 3 in current phase
Status: Complete
Last activity: 2026-02-20 — Plan 05-03 complete, sp-markdown-editor coverage gap tests added (83.75% coverage)

Progress: [█████████░] 92%

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 5.6 min
- Total execution time: 1.12 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-infrastructure | 3/3 | 9.5min | 3.2min |
| 02-orgchart-component | 2/2 | 10.0min | 5.0min |
| 03-walkthrough-component | 3/3 | 15.5min | 5.2min |
| 04-markdown-editor-component | 4/4 | 31.3min | 7.8min |
| 05-testing-quality | 2/3 | ~70min (running) | ~35min |

**Recent Trend:**
- Last 5 plans: 04-01 (4.1min), 04-02 (3.0min), 04-03 (5.2min), 04-04 (19.0min)
- Trend: Foundation tasks fast (3-4min), feature tasks moderate (4-5min), testing tasks significantly longer (19min for comprehensive suite)

*Updated after each plan completion*
| Phase 05-testing-quality P01 | 87 | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase 1: Stencil.js chosen for lazy loading + CDN distribution built-in (user-specified)
- Phase 1: Peer dependencies for heavy libs (marked, DOMPurify, Prism, Turndown) to keep bundle size small
- Phase 1: DWC theming over custom tokens for consistency with Skillspilot/DWC ecosystem
- 01-01: dist-custom-elements output via dist/components/ (Stencil v4 behavior)
- 01-01: customElementsExportBehavior: auto-define-custom-elements for automatic registration
- 01-01: externalRuntime: false to bundle Stencil runtime for easier consumption
- 01-02: DWC tokens use var(--dwc-external-*, fallback) pattern for external override capability
- 01-02: Theme overrides via :host(.theme-light) and :host(.theme-dark) CSS classes
- 01-02: Test suite uses Jest for spec tests, Playwright for E2E tests
- 01-03: ESLint 8 chosen over ESLint 9 for .eslintrc.json format compatibility
- 01-03: Repository uses 'master' branch instead of 'main' - Changesets and workflows configured accordingly
- 01-03: Node 20.x/22.x in CI, Node 24.x in Release for latest publishing features
- 02-01: CSS borders over SVG for tree connectors - simpler implementation for orthogonal lines
- 02-01: Manual long-press implementation over library - zero dependencies, full control
- 02-01: Timer-based click/double-click over native dblclick - better cross-browser reliability
- 02-01: Two-pass DFS filter algorithm - ensures ancestor chain visibility for UX clarity
- 02-01: Map-based cycle detection during tree building - prevents infinite loops
- 03-01: Fixed-position overlays on document.body to escape shadow DOM boundaries
- 03-01: Custom YouTube wrapper over video.js plugin - 0kB vs 240kB+
- 03-01: timeupdate event over requestVideoFrameCallback - sufficient precision without overhead
- 03-01: requestAnimationFrame throttling for scroll/resize overlay updates
- 03-02: CSS selector generation prioritizes stability: ID > data-attr > class > nth-child
- 03-02: Pointer tool uses document-level click handler with crosshair cursor
- 03-02: Timeline update events emit on every author action (create, update, delete)
- 03-02: Author mode UI uses DWC warning/info background colors for visual distinction
- 03-03: CSS.escape polyfill using Object.defineProperty for JSDOM compatibility
- 03-03: Mock getBoundingClientRect in overlay-manager tests for JSDOM environment
- 03-03: Shadow DOM E2E testing via page.evaluate accessing shadowRoot
- 04-01: Renamed focus() to focusEditor() to avoid conflict with HTML element prototype
- 04-01: Debounced history push at 500ms for typing performance, auto-save at 2000ms
- 04-01: Word count uses split(/\s+/) with filter for empty strings (0 words for empty content)
- 04-02: Text-based toolbar button labels (B, I, S, H1, etc.) to avoid icon library dependency
- 04-02: Toggle behavior for all formatting operations - unwrap if already wrapped
- 04-02: ActionResult pattern returns content + cursor positions for component to apply
- 04-02: requestAnimationFrame for cursor positioning after state updates
- 04-02: Ctrl/Cmd detection for Mac compatibility in keyboard shortcuts
- 04-03: Mode switcher tabs at right end of toolbar (avoids separate bar adding height)
- 04-03: WYSIWYG mode is preview-only (non-editable) using innerHTML rendering
- 04-03: Split mode with independent scrolling for source and preview panes
- 04-03: Voice dictation appends to end of content (predictable continuous dictation behavior)
- 04-03: Print uses temporary window with inline styles for consistent formatting
- 05-02: PointerEvent polyfill (class extends MouseEvent) needed in spec files because JSDOM lacks PointerEvent
- 05-02: Mock window.setInterval directly (not jest.useFakeTimers) for Stencil test env setInterval isolation
- 05-02: Object.defineProperty for requestAnimationFrame mocking (jest.spyOn cannot intercept unbound global RAF)
- 05-02: Call rootInstance.handlerMethod() directly instead of button.click() to avoid Node.js worker crashes
- 05-02: Use getAttribute('disabled') not .disabled property - Stencil mock-doc uses attribute not property
- [Phase 05-01]: Coverage thresholds in stencil.config.ts testing property (not jest.config.js) — Stencil ignores jest.config.js during stencil test
- [Phase 05-01]: jest.useFakeTimers() must be called after newSpecPage() — calling it in beforeEach before page setup causes 5000ms timeouts on all tests in the block
- [Phase 05-01]: window.setInterval in Stencil mock-doc is not intercepted by jest.useFakeTimers — test interval callback behavior via direct state manipulation instead of jest.advanceTimersByTime
- [Phase 05-03]: jest.useFakeTimers() banned entirely in sp-markdown-editor specs — even after useRealTimers() the next createPage() hangs; test auto-save by calling performAutoSave() directly
- [Phase 05-03]: newSpecPage creates MockWindow (isolated from JSDOM window) — set browser APIs (SpeechRecognition, window.open) on page.win or rootInstance, NOT on (window as any)
- [Phase 05-03]: jest.spyOn(document.createElement) MUST be set AFTER createPage() — spying before page creation intercepts Stencil render causing massive spy accumulation and OOM
- [Phase 05-03]: newSpecPage JSDOM OOM limit: ~4-5 complex pages per worker process (not 8); complex tests with mocks use more memory than simple render tests
- [Phase 05-03]: ToolbarActions static methods: use ClassName.method() not this.method() to preserve context when passed as function references

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-20 (phase execution)
Stopped at: Completed 05-03-PLAN.md — sp-markdown-editor coverage gap tests added (83.75% coverage)
Resume file: None

## Next Steps

**Phase 5 Complete - All 3 plans executed**:

Plan 05-01 complete:
- Jest coverage thresholds (70% min) and CI workflow updated

Plan 05-02 complete:
- draggable-mixin.spec.ts created (100% statement coverage)
- youtube-wrapper.spec.ts expanded (98.95% statement coverage)
- overlay-manager.spec.ts expanded (91.07% statement coverage)
- sp-walkthrough.spec.ts expanded with 80+ new tests, fallback rendering describe block

Plan 05-03 complete:
- sp-markdown-editor.tsx coverage: 40.43% → 83.75% (29 new tests in 5 parallel spec files)
- Fixed ToolbarActions class context bug (this → ToolbarActions.xxx)
- Key patterns: MockWindow isolation, createElement spy ordering, OOM avoidance

**Ready for Phase 6** (final phase)

**No blockers or concerns**
