# Requirements: Skillspilot Web Components

**Defined:** 2026-01-30
**Core Value:** Developers can add a single script tag or npm install and immediately use production-ready Skillspilot UI components

## v1 Requirements

### Infrastructure

- [x] **INFRA-01**: Stencil.js project compiles TypeScript components to web components with lazy-loading support
- [x] **INFRA-02**: Build produces dual output targets: `dist` (lazy-loaded/CDN) and `dist-custom-elements` (tree-shakeable/bundler)
- [x] **INFRA-03**: Package published to npm as `@skillspilot/webcomponents` with correct exports and type definitions
- [x] **INFRA-04**: Components loadable via CDN script tag from unpkg/jsdelivr and auto-register custom elements
- [x] **INFRA-05**: Heavy libraries (marked, DOMPurify, Prism.js, Turndown) configured as peer dependencies, not bundled
- [x] **INFRA-06**: GitHub Actions CI pipeline runs build, lint, and tests on every push/PR
- [ ] **INFRA-07**: GitHub Actions CD pipeline publishes to npm on release with provenance
- [x] **INFRA-08**: Changesets configured for version management and automated changelog generation

### Theming

- [x] **THEME-01**: All components consume `--dwc-*` CSS custom properties for colors, typography, and spacing
- [x] **THEME-02**: Components expose `::part()` selectors for structural styling override
- [x] **THEME-03**: Components support light and dark mode via `--dwc-*` color tokens
- [x] **THEME-04**: Components render with sensible visual defaults when no DWC theme is loaded

### Markdown Editor (`<sp-markdown-editor>`)

- [ ] **MDED-01**: Component renders a source mode editor (textarea) with monospace font and syntax-aware styling
- [ ] **MDED-02**: Component renders a WYSIWYG mode editor (contenteditable) with live markdown preview
- [ ] **MDED-03**: User can switch between source and WYSIWYG modes while preserving content
- [ ] **MDED-04**: Formatting toolbar provides bold, italic, strikethrough, inline code, and clear formatting
- [ ] **MDED-05**: Formatting toolbar provides heading levels (H1, H2, H3)
- [ ] **MDED-06**: Formatting toolbar provides block-level formatting (quote, code block, link)
- [ ] **MDED-07**: Formatting toolbar provides list formatting (bullet, numbered, task list)
- [ ] **MDED-08**: Formatting toolbar provides insert actions (image, table, horizontal rule)
- [ ] **MDED-09**: Undo/redo works across both editing modes (up to 50 states)
- [ ] **MDED-10**: Keyboard shortcuts work for common formatting (Ctrl+B, Ctrl+I, Ctrl+K, Ctrl+S, Ctrl+Z, Ctrl+Y)
- [ ] **MDED-11**: User can import a `.md` file and have its content loaded into the editor
- [ ] **MDED-12**: User can export editor content as a `.md` file download
- [ ] **MDED-13**: Voice dictation via Web Speech API can be activated to input text by speaking
- [ ] **MDED-14**: Component emits events: `content-change`, `save`, `mode-change`, `import`, `export`, `image-paste`
- [ ] **MDED-15**: Component exposes API methods: `getContent()`, `setContent()`, `clear()`, `getMode()`, `setMode()`, `isDirty()`, `focus()`
- [ ] **MDED-16**: Auto-save with debounce (2-second delay) and save indicator UI
- [ ] **MDED-17**: Character and word count displayed in editor footer
- [ ] **MDED-18**: Print support renders formatted markdown in print-friendly layout

### Walkthrough (`<sp-walkthrough>`)

- [ ] **WALK-01**: Component plays video in a fixed-position panel (lower right by default)
- [ ] **WALK-02**: Timeline entries synchronize with video playback, advancing scenes at configured timestamps
- [ ] **WALK-03**: DOM elements specified in timeline entries are highlighted with visual overlays during their scene
- [ ] **WALK-04**: Component supports standard video files (MP4, WebM) and YouTube embeds
- [ ] **WALK-05**: Manual navigation mode works when no video is present (prev/next buttons)
- [ ] **WALK-06**: User can drag the walkthrough panel to reposition it on screen
- [ ] **WALK-07**: Author mode allows real-time editing of walkthrough content (scene creation/editing/deletion)
- [ ] **WALK-08**: Author mode includes pointer tool for selecting DOM elements to highlight
- [ ] **WALK-09**: Author mode saves configuration via event emission (for persistence by parent app)
- [ ] **WALK-10**: WebVTT captions display with toggle on/off capability
- [ ] **WALK-11**: Volume control with mute/unmute functionality
- [ ] **WALK-12**: Scene list dropdown for quick navigation to specific scenes
- [ ] **WALK-13**: Component emits events: `walkthrough-shown`, `walkthrough-hidden`, `walkthrough-aborted`, `scene-changed`, `timeline-updated`
- [ ] **WALK-14**: Component exposes API methods: `show()`, `hide()`, `play()`, `pause()`, `restart()`, `abort()`
- [ ] **WALK-15**: ESC key aborts the walkthrough

### OrgChart (`<sp-org-chart>`)

- [x] **ORGC-01**: Component renders hierarchical tree from flat user array using `reportsTo` relationships
- [x] **ORGC-02**: Users are sorted alphabetically within each level
- [x] **ORGC-03**: Visual connectors (vertical/horizontal lines) link parent-child relationships
- [x] **ORGC-04**: Drag-and-drop reassigns a user's manager and emits `hierarchy-change` event
- [x] **ORGC-05**: Drop zones (Unlink, Delete) appear during drag operations
- [x] **ORGC-06**: Branch filtering shows filtered user + all subordinates + full chain of command, dimming non-matching users
- [x] **ORGC-07**: Single-click selects a user tile (highlighted with blue border)
- [x] **ORGC-08**: Double-click emits `user-dblclick` event for custom actions
- [x] **ORGC-09**: Long-press (4 seconds) triggers user deletion with visual countdown timer
- [x] **ORGC-10**: Component exposes API methods: `getSelected()`, `highlightUser()`, `clearHighlight()`, `scrollToUser()`
- [x] **ORGC-11**: Component emits events: `user-click`, `user-dblclick`, `hierarchy-change`, `user-delete`
- [x] **ORGC-12**: Custom no-data message displayed when user array is empty
- [x] **ORGC-13**: Editable mode can be toggled on/off via attribute

### Testing

- [ ] **TEST-01**: Each component has Jest spec tests covering props, state, events, and methods
- [ ] **TEST-02**: Each component has E2E tests covering rendering, user interaction, and accessibility
- [ ] **TEST-03**: CI enforces minimum 70% code coverage across all metrics
- [ ] **TEST-04**: Tests validate that components work without DWC theme loaded (fallback defaults)

### Documentation

- [ ] **DOCS-01**: Docusaurus site builds and deploys to GitHub Pages via GitHub Actions
- [ ] **DOCS-02**: Each component has auto-generated API reference (props, events, methods, CSS custom properties, CSS parts)
- [ ] **DOCS-03**: Each component has interactive live examples with editable code
- [ ] **DOCS-04**: Getting started guide covers npm install, CDN script tag, and basic component usage
- [ ] **DOCS-05**: Theming guide explains `--dwc-*` token usage, customization, and dark mode setup
- [ ] **DOCS-06**: Documentation is versioned and stays in sync with component releases

## v2 Requirements

### Framework Wrappers

- **WRAP-01**: React wrapper package with typed components
- **WRAP-02**: Angular wrapper package with directives
- **WRAP-03**: Vue wrapper package with typed components

### Advanced Features

- **ADV-01**: Visual regression testing with screenshot comparison in CI
- **ADV-02**: Automated accessibility testing (axe-core) in CI
- **ADV-03**: Performance budget enforcement (bundle size limits per component)
- **ADV-04**: Component playground with real-time prop editing and code generation
- **ADV-05**: Multiple pre-built themes beyond light/dark

### Additional Components

- **COMP-01**: Port remaining 7+ Skillspilot components from other projects

## Out of Scope

| Feature | Reason |
|---------|--------|
| Framework-specific code in core | Vanilla web components work everywhere; wrappers are v2 |
| Custom build pipeline | Stencil's compiler handles everything needed |
| Figma/design tool integration | Leveraging existing DWC theme engine instead |
| Server-side rendering | CDN/client-side distribution only |
| Java/webforJ wrapper layer | Pure browser-side web components |
| Polyfills for IE/legacy browsers | Modern browsers only (Web Components support required) |
| Custom icon library | Use existing icon solutions; not a differentiator |
| Mobile native wrappers | Web-only distribution for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 1 | Complete |
| INFRA-06 | Phase 1 | Complete |
| INFRA-07 | Phase 6 | Pending |
| INFRA-08 | Phase 1 | Complete |
| THEME-01 | Phase 1 | Complete |
| THEME-02 | Phase 1 | Complete |
| THEME-03 | Phase 1 | Complete |
| THEME-04 | Phase 1 | Complete |
| MDED-01 | Phase 4 | Pending |
| MDED-02 | Phase 4 | Pending |
| MDED-03 | Phase 4 | Pending |
| MDED-04 | Phase 4 | Pending |
| MDED-05 | Phase 4 | Pending |
| MDED-06 | Phase 4 | Pending |
| MDED-07 | Phase 4 | Pending |
| MDED-08 | Phase 4 | Pending |
| MDED-09 | Phase 4 | Pending |
| MDED-10 | Phase 4 | Pending |
| MDED-11 | Phase 4 | Pending |
| MDED-12 | Phase 4 | Pending |
| MDED-13 | Phase 4 | Pending |
| MDED-14 | Phase 4 | Pending |
| MDED-15 | Phase 4 | Pending |
| MDED-16 | Phase 4 | Pending |
| MDED-17 | Phase 4 | Pending |
| MDED-18 | Phase 4 | Pending |
| WALK-01 | Phase 3 | Pending |
| WALK-02 | Phase 3 | Pending |
| WALK-03 | Phase 3 | Pending |
| WALK-04 | Phase 3 | Pending |
| WALK-05 | Phase 3 | Pending |
| WALK-06 | Phase 3 | Pending |
| WALK-07 | Phase 3 | Pending |
| WALK-08 | Phase 3 | Pending |
| WALK-09 | Phase 3 | Pending |
| WALK-10 | Phase 3 | Pending |
| WALK-11 | Phase 3 | Pending |
| WALK-12 | Phase 3 | Pending |
| WALK-13 | Phase 3 | Pending |
| WALK-14 | Phase 3 | Pending |
| WALK-15 | Phase 3 | Pending |
| ORGC-01 | Phase 2 | Complete |
| ORGC-02 | Phase 2 | Complete |
| ORGC-03 | Phase 2 | Complete |
| ORGC-04 | Phase 2 | Complete |
| ORGC-05 | Phase 2 | Complete |
| ORGC-06 | Phase 2 | Complete |
| ORGC-07 | Phase 2 | Complete |
| ORGC-08 | Phase 2 | Complete |
| ORGC-09 | Phase 2 | Complete |
| ORGC-10 | Phase 2 | Complete |
| ORGC-11 | Phase 2 | Complete |
| ORGC-12 | Phase 2 | Complete |
| ORGC-13 | Phase 2 | Complete |
| TEST-01 | Phase 2, 3, 4 | Pending |
| TEST-02 | Phase 2, 3, 4 | Pending |
| TEST-03 | Phase 5 | Pending |
| TEST-04 | Phase 5 | Pending |
| DOCS-01 | Phase 6 | Pending |
| DOCS-02 | Phase 6 | Pending |
| DOCS-03 | Phase 6 | Pending |
| DOCS-04 | Phase 6 | Pending |
| DOCS-05 | Phase 6 | Pending |
| DOCS-06 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 68 total
- Mapped to phases: 68
- Unmapped: 0

---
*Requirements defined: 2026-01-30*
*Last updated: 2026-01-31 — Phase 2 requirements complete*
