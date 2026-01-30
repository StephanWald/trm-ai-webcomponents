# Skillspilot Web Components

## What This Is

A Stencil.js-based library of opinionated, high-level web components (`<sp-*>`) for the Skillspilot/TRM-AI team management platform. Components are standalone HTML custom elements distributed via npm and CDN (unpkg/jsdelivr), designed for drop-in use in any web application. They adopt the DWC (`--dwc-*`) CSS custom property theming system for visual consistency with the BASIS Dynamic Web Client ecosystem.

## Core Value

Developers can add a single script tag or npm install and immediately use production-ready, self-contained Skillspilot UI components that look and behave consistently — without framework lock-in.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Stencil.js project infrastructure with build, test, and CDN-ready output
- [ ] `<sp-markdown-editor>` component ported from vanilla JS prototype
- [ ] `<sp-walkthrough>` component ported from vanilla JS/webforJ prototype
- [ ] `<sp-org-chart>` component ported from vanilla JS prototype
- [ ] Shared `--dwc-*` CSS custom property theming across all components
- [ ] Peer dependency strategy for heavy libraries (marked, DOMPurify, Prism.js, Turndown)
- [ ] npm package published as `@skillspilot/webcomponents`
- [ ] CDN distribution via unpkg/jsdelivr (lazy-loaded)
- [ ] Stencil built-in testing (Jest spec + e2e) for all components
- [ ] Docusaurus documentation site with component API docs, examples, and usage guides
- [ ] GitHub Pages hosting for documentation
- [ ] GitHub Actions CI/CD for build, test, and docs deployment

### Out of Scope

- Framework-specific wrappers (React, Angular, Vue) — vanilla web components only for v1
- Components beyond the initial three (Markdown Editor, Walkthrough, OrgChart) — future milestones will port the remaining 7+ components
- Visual design system / Figma tokens — leveraging existing DWC theme engine
- Server-side rendering — CDN/client-side only
- Java/webforJ wrapper layer — pure browser-side web components

## Context

- **Existing prototypes:** Three components exist across separate projects as vanilla JS custom elements. They work but have inconsistent structure, no shared build system, no tests, and no documentation.
  - Markdown Editor (~7k LOC): Full-featured split-view editor with WYSIWYG, source mode, toolbar, voice dictation, import/export. Uses marked, DOMPurify, Prism.js, Turndown.
  - Walkthrough (~3.6k LOC): Interactive video tutorial/onboarding component with scene timeline, DOM element highlighting, author mode, captions. Currently has a Java/webforJ wrapper layer that will be dropped.
  - OrgChart (~1k LOC): Hierarchical org visualization with drag-and-drop reorganization, filtering, user selection. Pure vanilla JS, no external dependencies.
- **Skillspilot platform:** AI-powered TRM (Team Relationship Management) platform for remote-first teams. Provides burnout prediction, multi-channel integration (WhatsApp, Slack, Teams), privacy-first analytics.
- **DWC theming:** Components should consume `--dwc-*` CSS custom properties (colors, typography, spacing) so they integrate visually when used alongside other DWC components. They are standalone — not running inside the BBj runtime.
- **10+ components total:** This milestone covers 3. The remaining components will be ported in future milestones once the infrastructure and patterns are established.

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
| Stencil.js over Lit/vanilla | User-specified; lazy loading + CDN distribution built-in | — Pending |
| `sp-` prefix | Short, distinctive, represents Skillspilot | — Pending |
| Peer dependencies for heavy libs | Keeps bundle size small; consumers control versions | — Pending |
| DWC theming over custom tokens | Consistency with existing Skillspilot/DWC ecosystem | — Pending |
| Docusaurus for docs | User-specified; rich plugin ecosystem, GitHub Pages support | — Pending |
| No framework wrappers in v1 | Vanilla web components work everywhere; wrappers can be added later | — Pending |
| Monorepo (components + docs) | Single repo for consistency; docs stay in sync with components | — Pending |

---
*Last updated: 2026-01-30 after initialization*
