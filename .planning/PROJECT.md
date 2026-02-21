# Skillspilot Web Components

## What This Is

A Stencil.js-based library of production-ready web components (`<sp-*>`) for the Skillspilot/TRM-AI team management platform. Ships components — including `<sp-org-chart>`, `<sp-walkthrough>`, `<sp-markdown-editor>`, and communication/utility components — as standalone HTML custom elements distributed via npm and CDN, with DWC (`--dwc-*`) CSS custom property theming, comprehensive test coverage, and Docusaurus documentation.

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

## Current Milestone: v1.1 Visual Parity & Communication

**Goal:** Achieve 1:1 visual/behavioral parity with original prototypes for sp-org-chart and sp-walkthrough, and port communication UI and core utility components.

**Target features:**
- Org chart: vertical indented list layout, full data model (firstName/lastName/email/phone/branch), drag preview, timed delete, branch filtering
- Walkthrough: Tabler SVG icons, progress bar, skip ±10s, restart, popup scene list, vertical volume, custom captions, markdown text bubble, highlight animations
- New components: sp-language-selector, sp-language-list, sp-voice-input-button, sp-communication-preferences, sp-splash, sp-popover

### Active

- [ ] `<sp-org-chart>` 1:1 visual parity with original prototype (vertical list layout, full data model, drag/drop behaviors)
- [ ] `<sp-walkthrough>` 1:1 visual parity with original prototype (Tabler icons, progress bar, all controls, highlight animations)
- [ ] `<sp-language-selector>` + `<sp-language-list>` ported from vanilla JS
- [ ] `<sp-voice-input-button>` ported from vanilla JS
- [ ] `<sp-communication-preferences>` (selector + list) ported from vanilla JS
- [ ] `<sp-splash>` splash screen ported from vanilla JS
- [ ] `<sp-popover>` positioning component ported from vanilla JS
- [ ] Updated Docusaurus docs for new and changed components
- [ ] Tests for all new and refactored components

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

Shipped v1.0 with ~21,300 LOC TypeScript/CSS across 155 files.

**Tech stack:** Stencil.js v4, TypeScript, Jest + Playwright, Docusaurus 3, GitHub Actions
**Components:** 3 production-ready (`sp-org-chart`, `sp-walkthrough`, `sp-markdown-editor`), 7 more being ported in v1.1
**Distribution:** npm package + CDN (unpkg/jsdelivr) + GitHub Releases artifacts
**Documentation:** Docusaurus site on GitHub Pages with live examples and auto-generated API docs
**Test coverage:** 70% minimum enforced across all metrics; components render with sensible defaults when DWC theme is not loaded
**Peer dependencies:** marked, DOMPurify, Prism.js, Turndown (not bundled)

**10+ components total:** v1.0 covers 3. The remaining components will be ported in future milestones.

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

| 1:1 visual parity over creative redesign | Original prototypes are the source of truth; Stencil ports must match visually | — Pending |

---
*Last updated: 2026-02-21 after v1.1 milestone start*
