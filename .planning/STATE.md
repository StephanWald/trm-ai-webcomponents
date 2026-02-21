# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Developers can add a single script tag or npm install and immediately use production-ready, self-contained Skillspilot UI components that look and behave consistently — without framework lock-in.
**Current focus:** Phase 6: Documentation & Publishing

## Current Position

Phase: 6 of 6 (Documentation & Publishing)
Plan: 3 of 5 in current phase
Status: In Progress
Last activity: 2026-02-21 — Plan 06-03 complete, Docusaurus site scaffold with LiveExample + ApiReference components and getting-started/theming guides

Progress: [█████████░] 96%

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
| 05-testing-quality | 3/3 | ~70min | ~23min |
| 06-documentation-publishing | 3/5 | ~15min | ~5min |

**Recent Trend:**
- Last 5 plans: 04-01 (4.1min), 04-02 (3.0min), 04-03 (5.2min), 04-04 (19.0min)
- Trend: Foundation tasks fast (3-4min), feature tasks moderate (4-5min), testing tasks significantly longer (19min for comprehensive suite)

*Updated after each plan completion*
| Phase 05-testing-quality P01 | 87 | 2 tasks | 3 files |
| Phase 06-documentation-publishing P02 | 1 | 2 tasks | 2 files |
| Phase 06-documentation-publishing P01 | 10 | 2 tasks | 9 files |
| Phase 06-documentation-publishing P03 | 7 | 3 tasks | 14 files |

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
- [Phase 06-02]: NPM_CONFIG_PROVENANCE env var on changesets action step (not npm publish flag) for OIDC-based provenance attestation
- [Phase 06-02]: docs-deploy.yml must build Stencil before Docusaurus — docs.json must exist before Docusaurus imports it
- [Phase 06-02]: GitHub Pages native deploy: actions/upload-pages-artifact@v3 + actions/deploy-pages@v4 (no gh-pages branch needed)
- [Phase 06-01]: @part JSDoc docs strings (not just part= attributes) populate the docs field in docs.json — Stencil picks up part names from render method but docs only from @part tags in component JSDoc block
- [Phase 06-01]: sp-walkthrough deliberately exposes no CSS parts — panel is self-contained overlay; use CSS custom properties for theming instead of ::part() selectors
- [Phase 06-documentation-publishing]: Docusaurus docs-only mode (routeBasePath: '/') — component library docs served from site root without blog
- [Phase 06-documentation-publishing]: React.JSX.Element return type (not JSX.Element) — React 18 react-jsx transform no longer exposes global JSX namespace
- [Phase 06-documentation-publishing]: tsconfig.json uses moduleResolution:Bundler, jsx:react-jsx, esModuleInterop for Docusaurus 3.9.2 React component compilation

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-21 (phase execution)
Stopped at: Completed 06-03-PLAN.md — Docusaurus site scaffold in /docs; LiveExample iframe component + ApiReference docs.json tables; getting-started guide (npm + CDN) and theming guide (--dwc-* tokens, dark mode); site builds successfully
Resume file: None

## Next Steps

**Phase 6 In Progress - 3 of 5 plans executed**:

Plan 06-01 complete:
- stencil.config.ts docs-json output target added
- CSS @prop JSDoc annotations: sp-org-chart (29 props), sp-walkthrough (34 props), sp-markdown-editor (18 props)
- @part JSDoc annotations: sp-markdown-editor (5 parts with docs), sp-walkthrough (0 parts, documented by design)
- docs.json generated with complete API metadata

Plan 06-02 complete:
- release.yml updated with NPM_CONFIG_PROVENANCE and createGithubReleases
- docs-deploy.yml created for GitHub Pages deployment (build: Stencil then Docusaurus; deploy: native actions/deploy-pages@v4)

Plan 06-03 complete:
- Docusaurus 3 site scaffolded in /docs (package.json, docusaurus.config.ts, sidebars.ts)
- LiveExample.tsx: sandboxed iframe with editable source textarea, loads CDN script
- ApiReference.tsx: renders props/events/methods/styles/parts tables from docs.json data
- getting-started.md: npm install, CDN script tag, quick start, peer dependencies (DOCS-04)
- theming.md: --dwc-* tokens, customization, dark mode, CSS parts, DWC integration (DOCS-05)
- Site builds successfully: `npm run build` generates static files in docs/build/

**Ready for Plan 06-04**: Component pages with LiveExample and ApiReference

**No blockers or concerns**
