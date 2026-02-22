# Skillspilot Web Components

## What This Is

A Stencil.js-based library of production-ready web components (`<sp-*>`) for the Skillspilot/TRM-AI team management platform. Ships 10 components — `<sp-org-chart>`, `<sp-walkthrough>`, `<sp-markdown-editor>`, `<sp-popover>`, `<sp-language-selector>`, `<sp-language-list>`, `<sp-voice-input-button>`, `<sp-communication-preferences>`, `<sp-communication-list>`, and `<sp-splash>` — as standalone HTML custom elements distributed via npm and CDN, with DWC (`--dwc-*`) CSS custom property theming, 844 spec tests + 115 E2E tests, and Docusaurus documentation.

## Core Value

Developers can add a single script tag or npm install and immediately use production-ready, self-contained Skillspilot UI components that look and behave consistently — without framework lock-in.

## Requirements

### Validated

- ✓ Stencil.js project infrastructure with build, test, and CDN-ready output — v1.0
- ✓ `<sp-markdown-editor>` component ported from vanilla JS prototype — v1.0
- ✓ `<sp-walkthrough>` component ported from vanilla JS/webforJ prototype — v1.0
- ✓ `<sp-org-chart>` component ported from vanilla JS prototype — v1.0
- ✓ Shared `--dwc-*` CSS custom property theming across all components — v1.0
- ✓ Peer dependency strategy for heavy libraries (marked, DOMPurify, Prism.js, Turndown) — v1.0
- ✓ npm package published as `@skillspilot/webcomponents` — v1.0
- ✓ CDN distribution via unpkg/jsdelivr (lazy-loaded) — v1.0
- ✓ Stencil built-in testing (Jest spec + e2e) for all components — v1.0
- ✓ Docusaurus documentation site with component API docs, examples, and usage guides — v1.0
- ✓ GitHub Pages hosting for documentation — v1.0
- ✓ GitHub Actions CI/CD for build, test, and docs deployment — v1.0
- ✓ `<sp-org-chart>` 1:1 visual parity with original prototype (vertical list, full data model, drag/drop, branch filtering) — v1.1
- ✓ `<sp-walkthrough>` 1:1 visual parity with original prototype (Tabler icons, progress bar, scene list, volume, captions, highlights) — v1.1
- ✓ `<sp-popover>` viewport-aware positioning component with 6 placements and configurable dismiss — v1.1
- ✓ `<sp-language-selector>` + `<sp-language-list>` ported from vanilla JS — v1.1
- ✓ `<sp-voice-input-button>` ported from vanilla JS with state machine and animations — v1.1
- ✓ `<sp-communication-preferences>` + `<sp-communication-list>` ported from vanilla JS — v1.1
- ✓ `<sp-splash>` full-screen modal overlay ported from vanilla JS — v1.1
- ✓ Updated Docusaurus docs for all new and changed components — v1.1
- ✓ Tests for all new and refactored components (844 spec, 115 E2E, 89.65% coverage) — v1.1

### Active

(None — next milestone not yet planned)

### Future

- [ ] React wrapper package with typed components
- [ ] Angular wrapper package with directives
- [ ] Vue wrapper package with typed components
- [ ] Visual regression testing with screenshot comparison in CI
- [ ] Automated accessibility testing (axe-core) in CI
- [ ] Performance budget enforcement (bundle size limits per component)
- [ ] Component playground with real-time prop editing and code generation
- [ ] Port remaining speech/avatar components (SpeechTranscription, UnifiedSpeechToText, TextToSpeech, KaiAvatar, TalkingAvatar, DIDStreaming, TalkingHead, ElevenLabsConversation, AudioRecorder)

### Out of Scope

- Visual design system / Figma tokens — leveraging existing DWC theme engine
- Server-side rendering — CDN/client-side only
- Java/webforJ wrapper layer — pure browser-side web components
- Polyfills for IE/legacy browsers — modern browsers only
- Multiple pre-built themes beyond light/dark — DWC theme engine handles this

## Context

Shipped v1.1 with ~28,600 LOC TypeScript/CSS across 112 modified files (+23,805 / -2,652 lines from v1.0).

**Tech stack:** Stencil.js v4, TypeScript, Jest + Playwright, Docusaurus 3, GitHub Actions
**Components:** 10 production-ready (`sp-org-chart`, `sp-walkthrough`, `sp-markdown-editor`, `sp-popover`, `sp-language-selector`, `sp-language-list`, `sp-voice-input-button`, `sp-communication-preferences`, `sp-communication-list`, `sp-splash`)
**Distribution:** npm package + CDN (unpkg/jsdelivr) + GitHub Releases artifacts
**Documentation:** Docusaurus site on GitHub Pages with live examples and auto-generated API docs for all 10 components
**Test coverage:** 89.65% statement coverage (70% minimum enforced); 844 spec tests + 115 E2E tests
**Peer dependencies:** marked, DOMPurify, Prism.js, Turndown (not bundled)

**Known tech debt (from v1.1 audit):**
- `src/index.html` demo uses v1.0 data model for org chart
- `getting-started.md` Quick Start uses stale v1.0 API shape
- `languageChange` event name conflicts with native DOM `change` event in some host setups
- 4 files with individual branch coverage below 70% (global threshold passes)

## Constraints

- **Tech stack**: Stencil.js for component authoring — leverages its lazy-loading, CDN distribution, and web component compiler
- **Theming**: Must respect `--dwc-*` CSS custom properties from the DWC theme engine
- **Component prefix**: `sp-` (e.g., `<sp-markdown-editor>`)
- **Package name**: `@skillspilot/webcomponents` on npm
- **Documentation**: Docusaurus, hosted on GitHub Pages, part of the same monorepo
- **Testing**: Stencil built-in Jest spec and e2e tests
- **Dependencies**: Heavy libraries (marked, DOMPurify, Prism.js, Turndown) as peer dependencies — not bundled
- **Distribution**: Must work both as npm install and CDN script tag (unpkg/jsdelivr)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Stencil.js over Lit/vanilla | User-specified; lazy loading + CDN distribution built-in | ✓ Good — dual output targets work well |
| `sp-` prefix | Short, distinctive, represents Skillspilot | ✓ Good — clear namespace |
| Peer dependencies for heavy libs | Keeps bundle size small; consumers control versions | ✓ Good — clean separation |
| DWC theming over custom tokens | Consistency with existing Skillspilot/DWC ecosystem | ✓ Good — 80+ CSS custom properties across components |
| Docusaurus for docs | User-specified; rich plugin ecosystem, GitHub Pages support | ✓ Good — MDX pages with live examples |
| No framework wrappers in v1 | Vanilla web components work everywhere; wrappers can be added later | ✓ Good — defer to v2 |
| Monorepo (components + docs) | Single repo for consistency; docs stay in sync with components | ✓ Good — docs.json drives API reference |
| CSS borders over SVG for tree connectors | Simpler implementation for orthogonal lines in org chart | ✓ Good — clean rendering |
| Custom YouTube wrapper over video.js | 0kB vs 240kB+ dependency for walkthrough video | ✓ Good — minimal footprint |
| WYSIWYG as preview-only (not contenteditable) | Avoids contenteditable complexity; source mode is primary editor | ✓ Good — simpler, reliable |
| GitHub Releases over npm for distribution | Avoids npm publish complexity for initial release | ✓ Good — users install from GitHub artifact |
| 1:1 visual parity over creative redesign | Original prototypes are the source of truth; Stencil ports must match visually | ✓ Good — faithful reproduction, consistent UX |
| sp-popover as shared foundation | Built before language/comm components so all use same positioning engine | ✓ Good — 3 consumers share one popover |
| State machine for voice button | 5 states (idle, hover-cue, language-select, listening, error) drive all CSS | ✓ Good — predictable, testable |
| Local markdown-renderer copy in walkthrough | Avoids Stencil cross-component bundling issues | ✓ Good — isolated, no import side effects |
| Flat channel list (no sections) | Only 6 channels; preferred/all grouping not needed unlike language list | ✓ Good — simpler UX |

---
*Last updated: 2026-02-22 after v1.1 milestone completion*
