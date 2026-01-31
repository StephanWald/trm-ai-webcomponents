# Roadmap: Skillspilot Web Components

## Overview

This roadmap transforms three existing vanilla JS components into production-ready Stencil web components distributed via npm and CDN. Following infrastructure-first, simple-to-complex principles, we establish build/theming/testing foundations before porting OrgChart (simplest, 1k LOC), Walkthrough (medium, 3.6k LOC), and Markdown Editor (most complex, 7k LOC). Final phases validate testing coverage and publish comprehensive documentation with automated distribution.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Infrastructure** - Stencil project, build pipeline, theming system, CI/CD
- [x] **Phase 2: OrgChart Component** - Simplest component with drag-and-drop, filtering, tests
- [ ] **Phase 3: Walkthrough Component** - Medium component with timeline, DOM highlighting, author mode
- [ ] **Phase 4: Markdown Editor Component** - Complex component with WYSIWYG, peer deps, voice dictation
- [ ] **Phase 5: Testing & Quality** - Coverage enforcement, accessibility testing, fallback validation
- [ ] **Phase 6: Documentation & Publishing** - Docusaurus site, GitHub Pages, npm/CDN distribution

## Phase Details

### Phase 1: Foundation & Infrastructure
**Goal**: Working Stencil project with dual output targets, DWC theming, CI/CD workflows, and peer dependency configuration ready for component development
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-08, THEME-01, THEME-02, THEME-03, THEME-04
**Success Criteria** (what must be TRUE):
  1. Developer can run `npm run build` and see both `dist` (lazy-loaded CDN) and `dist-custom-elements` (tree-shakeable bundler) output directories
  2. Developer can run `npm test` and see passing Stencil test runner with Jest and Playwright configured
  3. Package.json correctly declares peer dependencies for heavy libraries (marked, DOMPurify, Prism.js, Turndown) without bundling them
  4. GitHub Actions CI workflow runs build, lint, and tests automatically on every push/PR
  5. Test component (sp-example) consumes DWC CSS custom properties and renders with sensible defaults when no theme is loaded
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md -- Stencil project scaffolding with dual output targets, package.json, peer dependencies
- [x] 01-02-PLAN.md -- DWC theming system, sp-example component, spec + E2E tests
- [x] 01-03-PLAN.md -- GitHub Actions CI/CD workflows, Changesets, ESLint

### Phase 2: OrgChart Component
**Goal**: Fully functional sp-org-chart component with hierarchical rendering, drag-and-drop reorganization, filtering, and comprehensive tests proving component patterns work
**Depends on**: Phase 1
**Requirements**: ORGC-01, ORGC-02, ORGC-03, ORGC-04, ORGC-05, ORGC-06, ORGC-07, ORGC-08, ORGC-09, ORGC-10, ORGC-11, ORGC-12, ORGC-13, TEST-01, TEST-02
**Success Criteria** (what must be TRUE):
  1. Developer can provide flat user array with reportsTo relationships and see hierarchical tree rendered with visual connectors
  2. User can drag a user tile and drop on new manager, triggering hierarchy-change event with updated structure
  3. User can filter org chart by name/role and see filtered user plus all subordinates plus full chain of command, with non-matches dimmed
  4. User can select tile (single-click), double-click to trigger custom action, or long-press 4 seconds to delete with countdown timer
  5. Test suite covers props, state, events, methods (Jest spec) and rendering, interactions, accessibility (E2E)
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Core component with types, utilities, rendering, interactions, filtering, and public API
- [x] 02-02-PLAN.md — Jest spec tests and Playwright E2E tests for full coverage

### Phase 3: Walkthrough Component
**Goal**: Fully functional sp-walkthrough component with video playback, scene timeline synchronization, DOM element highlighting, author mode, and tests validating cross-boundary DOM interaction
**Depends on**: Phase 2
**Requirements**: WALK-01, WALK-02, WALK-03, WALK-04, WALK-05, WALK-06, WALK-07, WALK-08, WALK-09, WALK-10, WALK-11, WALK-12, WALK-13, WALK-14, WALK-15, TEST-01, TEST-02
**Success Criteria** (what must be TRUE):
  1. User sees walkthrough panel playing video (MP4/WebM) or YouTube embed in fixed position (lower-right default) with draggable repositioning
  2. Timeline advances scenes automatically at configured timestamps, highlighting DOM elements outside component boundaries with visual overlays
  3. User can navigate manually (prev/next) when no video present, jump to scenes via dropdown, and control volume/mute/captions
  4. Author can toggle author mode, use pointer tool to select DOM elements for highlighting, create/edit/delete scenes, and save via event emission
  5. User can press ESC to abort walkthrough, triggering cleanup of overlays and panel hide
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Markdown Editor Component
**Goal**: Fully functional sp-markdown-editor with source/WYSIWYG/split modes, formatting toolbar, voice dictation, import/export, undo/redo, using peer dependencies for marked/DOMPurify/Prism/Turndown
**Depends on**: Phase 3
**Requirements**: MDED-01, MDED-02, MDED-03, MDED-04, MDED-05, MDED-06, MDED-07, MDED-08, MDED-09, MDED-10, MDED-11, MDED-12, MDED-13, MDED-14, MDED-15, MDED-16, MDED-17, MDED-18, TEST-01, TEST-02
**Success Criteria** (what must be TRUE):
  1. User can switch between source (monospace textarea), WYSIWYG (contenteditable preview), and split modes while preserving content
  2. User can apply formatting via toolbar (bold, italic, strikethrough, code, headings, quotes, lists, links, images, tables) or keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+K, etc.)
  3. User can undo/redo up to 50 states across both editing modes without losing work
  4. User can import .md file and export content as .md download, activate voice dictation via Web Speech API, and print formatted markdown
  5. Component emits events (content-change, save, mode-change, import, export, image-paste) and exposes API methods (getContent, setContent, clear, getMode, setMode, isDirty, focus) with auto-save indicator and char/word count
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD
- [ ] 04-04: TBD

### Phase 5: Testing & Quality
**Goal**: Comprehensive test coverage enforcement, accessibility validation, and fallback behavior verification across all components
**Depends on**: Phase 4
**Requirements**: TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. CI enforces minimum 70% code coverage across all metrics (lines, branches, functions, statements) and fails builds below threshold
  2. All three components (sp-org-chart, sp-walkthrough, sp-markdown-editor) render with sensible visual defaults when DWC theme is not loaded
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Documentation & Publishing
**Goal**: Comprehensive Docusaurus documentation site live on GitHub Pages, published npm package, CDN availability, and automated release workflow with changelogs
**Depends on**: Phase 5
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05, DOCS-06, INFRA-07
**Success Criteria** (what must be TRUE):
  1. Developer can visit GitHub Pages URL and see Docusaurus site with getting-started guide (npm install + CDN script tag examples), theming guide, and component API reference
  2. Each component page shows auto-generated API docs (props, events, methods, CSS properties, CSS parts) and interactive live examples with editable code
  3. Developer can run `npm install @skillspilot/webcomponents` or add CDN script tag from jsdelivr/unpkg and immediately use components
  4. Maintainer can create GitHub release and see automated CI/CD publish to npm with provenance, generate changelog via Changesets, and deploy updated docs to GitHub Pages
  5. Documentation versioning keeps docs in sync with component releases, showing version picker with historical API references
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD
- [ ] 06-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | 3/3 | ✓ Complete | 2026-01-31 |
| 2. OrgChart Component | 2/2 | ✓ Complete | 2026-01-31 |
| 3. Walkthrough Component | 0/3 | Not started | - |
| 4. Markdown Editor Component | 0/4 | Not started | - |
| 5. Testing & Quality | 0/1 | Not started | - |
| 6. Documentation & Publishing | 0/3 | Not started | - |

---
*Roadmap created: 2026-01-31*
*Last updated: 2026-01-31 — Phase 2 complete*
