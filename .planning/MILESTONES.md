# Milestones

## v1.0 MVP (Shipped: 2026-02-21)

**Phases completed:** 6 phases, 20 plans
**Timeline:** 22 days (Jan 30 → Feb 21, 2026)
**Commits:** 103 (29 feat)
**Files:** 155 files, ~21,300 LOC TypeScript/CSS
**Git range:** 029d00d → d84340d

**Delivered:** Three production-ready Stencil web components (`<sp-org-chart>`, `<sp-walkthrough>`, `<sp-markdown-editor>`) with DWC theming, comprehensive tests, Docusaurus documentation site, and CI/CD publishing pipeline.

**Key accomplishments:**
1. Stencil.js v4 build pipeline with dual output targets (dist + dist-custom-elements), DWC theming, CI/CD workflows
2. `<sp-org-chart>` — hierarchical tree rendering, drag-and-drop reorganization, filtering, long-press deletion
3. `<sp-walkthrough>` — YouTube/video integration, timeline engine, overlay manager, author mode, draggable panel
4. `<sp-markdown-editor>` — source/WYSIWYG/split modes, formatting toolbar, voice dictation, import/export, auto-save
5. 70% code coverage enforcement across all components with fallback tests for unthemed usage
6. Docusaurus documentation site with live examples, auto-generated API references, getting-started and theming guides

---


## v1.1 Visual Parity & Communication (Shipped: 2026-02-22)

**Phases completed:** 6 phases, 16 plans, 36 tasks
**Timeline:** 2 days (Feb 21 → Feb 22, 2026)
**Commits:** 69
**Files:** 112 files modified, +23,805 / -2,652 lines (~28,600 LOC total)
**Git range:** 26522b1 → 5aa9002

**Delivered:** Achieved 1:1 visual/behavioral parity with original prototypes for sp-org-chart and sp-walkthrough, and ported five new communication and utility components — sp-popover, sp-language-selector, sp-voice-input-button, sp-communication-preferences, and sp-splash — with full test suite (844 spec + 115 E2E tests, 89.65% coverage) and Docusaurus documentation for all 10 components.

**Key accomplishments:**
1. Rebuilt sp-org-chart with vertical list layout, expanded 11-field data model, custom drag preview, timed delete with countdown overlay, and branch filtering
2. Upgraded sp-walkthrough with Tabler SVG icons, progress bar, custom scene list/volume popups, caption overlay, markdown text bubble, and highlight glow animations
3. Created sp-popover as reusable viewport-aware positioning foundation with 6 placements, boundary detection, and configurable dismiss behaviors — shared by 3 consumer components
4. Ported sp-language-selector + sp-language-list and sp-voice-input-button with 5-state machine, hover cue, pulse/shake animations, and browser/AI mode indicator
5. Ported sp-communication-preferences with 6-channel icon system and sp-splash full-screen modal overlay with backdrop blur and slot-based content
6. Complete Docusaurus documentation for all 8 new/updated components, 844 spec tests (89.65% coverage), 115 Playwright E2E tests

**Tech debt deferred:**
- `src/index.html` demo uses v1.0 data model for org chart
- `getting-started.md` Quick Start uses stale v1.0 API shape
- `languageChange` event name conflicts with native DOM `change` event in some host setups
- 4 files with individual branch coverage below 70% (global threshold passes)

---

