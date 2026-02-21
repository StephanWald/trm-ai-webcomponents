---
title: Changelog
sidebar_position: 10
---

# Changelog

This page tracks changes across releases of `@skillspilot/webcomponents`.

---

## 0.0.1 (Initial Development)

> Status: Unreleased — in active development

Initial build of the Skillspilot Web Components library. Implements three production-ready components with DWC theming, full test coverage, and automated CI/CD publishing.

### Components

- **`sp-org-chart`** — Hierarchical org chart with drag-and-drop reorganization (long-press 500ms), search/filter with ancestor chain visibility, user selection via click/double-click, CSS tree connectors, and DWC theming support (29 CSS custom properties, 5 CSS parts).

- **`sp-walkthrough`** — Interactive video walkthrough player with timed scene timeline, DOM element highlighting via fixed-position overlays, YouTube embed support, author mode for recording new walkthroughs, and voice-over caption support. Exposes 34 CSS custom properties for theming.

- **`sp-markdown-editor`** — Full-featured markdown editor with source/WYSIWYG/split view modes, formatting toolbar (bold, italic, headings, lists, code, links), syntax highlighting via Prism.js, voice dictation (Web Speech API), file import/export, undo/redo history, auto-save, and print support. Exposes 18 CSS custom properties and 5 CSS parts.

### Infrastructure

- Stencil.js v4 build system with lazy-loading CDN distribution (`dist/skillspilot/`)
- DWC design token theming (`--dwc-*` variables) with `theme-light` / `theme-dark` class support
- Jest unit test suite (510+ tests, 80%+ coverage thresholds)
- Playwright E2E test suite
- GitHub Actions CI/CD with automated npm publishing via Changesets
- GitHub Pages documentation site (this site)

### Documentation

- Getting started guide (npm install + CDN usage)
- Theming guide (`--dwc-*` tokens, dark mode, CSS parts)
- Interactive component documentation with live examples
- Auto-generated API reference from Stencil `docs-json` output

---

## Versioning Strategy

This project uses [Changesets](https://github.com/changesets/changesets) for version management. When a pull request includes user-facing changes, a changeset file is committed alongside the code. On merge to `master`, the release workflow publishes the new version to npm and creates a GitHub Release with the generated changelog.

Future releases will have automatically generated changelogs appended to this page.

> **Full Docusaurus documentation versioning** (version picker in the navbar, historical API references per version) will be added when the project reaches **v1.0.0** with breaking API changes. Until then, this changelog and the latest documentation serve as the version reference.
