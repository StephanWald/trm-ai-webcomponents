# Phase 6: Documentation & Publishing - Research

**Researched:** 2026-02-21
**Domain:** Docusaurus 3, Stencil docs-json, GitHub Pages deployment, npm publish with provenance, Changesets
**Confidence:** HIGH (primary stack verified via official docs and Context7)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Live examples:**
- Vanilla HTML/JS only — no framework-specific snippets for v1
- 3-5 key scenario examples per component (basic setup, common configs, event handling)
- Include theming/dark mode demos alongside default appearance
- Interactive approach at Claude's discretion (editable code blocks vs static snippets + preview)

**API docs generation:**
- Use Stencil's built-in `--docs-json` to extract props, events, methods, CSS custom properties, slots
- Render extracted JSON into Docusaurus component pages
- CSS custom properties (--dwc-* tokens) and ::part() selectors documented per-component only (not in a shared page)

**Release & publish workflow:**
- Releases triggered via GitHub Release UI → CI publishes to npm with provenance + deploys docs
- Package name: `@skillspilot/webcomponents` (scoped under @skillspilot org)
- Docs auto-deploy on every push to main (always reflects latest code)

### Claude's Discretion
- Live examples approach (embedded editable code editor vs static snippets + iframe preview)
- TypeScript type definitions display (inline vs linked to source)
- docs-json generation timing (part of every build vs separate docs command)
- Documentation versioning depth (full version picker vs latest + changelog)
- Docs site landing page design and navigation structure
- Getting-started guide flow and structure
- Theming guide organization

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DOCS-01 | Docusaurus site builds and deploys to GitHub Pages via GitHub Actions | GitHub Actions deploy-pages workflow + docusaurus.config.js baseUrl/org/project config |
| DOCS-02 | Each component has auto-generated API reference (props, events, methods, CSS custom properties, CSS parts) | Stencil docs-json output target produces JsonDocs conforming JSON; CSS @prop JSDoc annotations needed in CSS files |
| DOCS-03 | Each component has interactive live examples with editable code | Recommended: custom `<LiveExample>` React component rendering HTML in sandboxed iframe; theme-live-codeblock is JSX-only |
| DOCS-04 | Getting started guide covers npm install, CDN script tag, and basic component usage | Standard Docusaurus MDX page; CDN URL pattern from package.json unpkg field |
| DOCS-05 | Theming guide explains `--dwc-*` token usage, customization, and dark mode setup | Standard Docusaurus MDX page; CSS token inventory from existing components |
| DOCS-06 | Documentation is versioned and stays in sync with component releases | Docusaurus versioning CLI (`docs:version`) OR changelog-only approach; see Open Questions |
| INFRA-07 | GitHub Actions CD pipeline publishes to npm on release with provenance | Changesets action v1 + NPM_CONFIG_PROVENANCE=true + id-token:write; changeset config access=public already set |
</phase_requirements>

---

## Summary

Phase 6 requires building three distinct deliverables: (1) a Docusaurus 3.9 documentation site with component API reference pages and interactive examples, (2) automated GitHub Pages deployment on every push to master, and (3) a complete CD pipeline that publishes `@skillspilot/webcomponents` to npm with provenance when a Changeset PR is merged.

The standard stack is well-established. Docusaurus 3.9.2 is the current stable version and the de facto standard for component library documentation. Stencil's `docs-json` output target is the authoritative source for API metadata — it extracts `@Prop`, `@Event`, `@Method`, `::part()` (via `@part` JSDoc), and CSS custom properties (via `@prop` JSDoc in CSS files) automatically at build time. The key gap is that the project's CSS files currently use `--dwc-*` tokens but have **no `@prop` JSDoc annotations**, so CSS properties will not appear in the generated JSON without that work. Similarly, `@part` annotations in component `@Component` JSDoc blocks are already present in `sp-org-chart` but absent in the other two components.

For interactive live examples with vanilla HTML/web components, the `@docusaurus/theme-live-codeblock` plugin is **not suitable** — it is JSX/React-only (powered by react-live). The recommended approach for this project is a custom `<LiveExample>` React component embedded in MDX that renders an HTML string in a sandboxed `<iframe>` using a blob URL or srcdoc. This lets users see the rendered output and optionally edit the source. This pattern is well-established in design system documentation (e.g., Adobe Spectrum, FAST, Lion) and is the most practical option for vanilla HTML web components without a dedicated playground server.

The CD pipeline is mostly in place: the existing `release.yml` workflow already uses `changesets/action@v1`. The only two things it needs are (1) `NPM_CONFIG_PROVENANCE: true` env var added to the changesets action step, and (2) an `NPM_TOKEN` secret configured in GitHub repo settings. The Changesets config already has `"access": "public"` which is required for scoped packages.

**Primary recommendation:** Build Docusaurus site in a `/docs` directory at the repo root; add `docs-json` output target to Stencil config; annotate component CSS files with `@prop` JSDoc; write custom `<LiveExample>` iframe component for interactive demos; add `docs-deploy.yml` workflow; update `release.yml` for provenance.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@docusaurus/core` | 3.9.2 | Documentation site framework | Meta-maintained, React-based, Markdown+MDX, versioning built-in |
| `@docusaurus/preset-classic` | 3.9.2 | Docs + navbar + footer + search | Bundled preset, covers all needed features |
| `docusaurus` (CLI) | 3.9.2 | Build, serve, deploy commands | Same package, required for `npm run build` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@docusaurus/theme-live-codeblock` | 3.9.2 | Live JSX code blocks | Skip — JSX-only, not useful for vanilla HTML demos |
| Stencil `docs-json` output target | built-in (Stencil 4.41) | Generate component API JSON | Add to `stencil.config.ts` alongside existing targets |
| `actions/deploy-pages@v4` | v4 | Deploy static build to GitHub Pages | GitHub-native, replaces `peaceiris/actions-gh-pages` |
| `actions/upload-pages-artifact@v3` | v3 | Upload Docusaurus build artifact | Pairs with deploy-pages |
| `changesets/action@v1` | v1 | Version + publish via Changesets | Already configured in release.yml |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom `<LiveExample>` iframe | `@docusaurus/theme-live-codeblock` | live-codeblock is React/JSX-only; can't render HTML custom elements |
| Custom `<LiveExample>` iframe | StackBlitz embeds | Requires external service dependency; overkill for 3 components |
| Docusaurus versioning | Changelog-only (no version picker) | Versioning adds build complexity; changelog is sufficient for early-stage project |
| `docs-json` + custom component | `docs-readme` (markdown) | JSON gives full programmatic control; markdown requires swizzling or custom plugin |
| Provenance via `NPM_CONFIG_PROVENANCE` | npm trusted publishing (OIDC) | OIDC trusted publishing works only on cloud runners and requires npm account config; `NPM_TOKEN` + provenance flag is simpler for initial setup |

**Installation:**
```bash
# In a new /docs directory at repo root
npm init docusaurus@latest docs -- --typescript
# Or scaffold manually:
npm install --save-dev @docusaurus/core@3.9.2 @docusaurus/preset-classic@3.9.2
```

---

## Architecture Patterns

### Recommended Project Structure

```
/                              # repo root (existing Stencil project)
├── docs/                      # NEW: Docusaurus site (separate package)
│   ├── docs/                  # MDX content pages
│   │   ├── getting-started.md
│   │   ├── theming.md
│   │   └── components/
│   │       ├── sp-org-chart.mdx
│   │       ├── sp-walkthrough.mdx
│   │       └── sp-markdown-editor.mdx
│   ├── src/
│   │   ├── components/
│   │   │   └── LiveExample.tsx  # custom iframe live demo component
│   │   └── theme/
│   │       └── MDXComponents.tsx  # register LiveExample globally
│   ├── static/
│   │   └── .nojekyll          # disable GitHub Pages Jekyll processing
│   ├── docusaurus.config.ts
│   ├── sidebars.ts
│   └── package.json           # separate from Stencil package.json
├── docs.json                  # generated by Stencil docs-json (at root or docs/)
├── stencil.config.ts          # add docs-json output target
└── .github/workflows/
    ├── ci.yml                 # existing
    ├── release.yml            # update: add provenance
    └── docs-deploy.yml        # NEW: deploy docs on push to master
```

### Pattern 1: Stencil docs-json Output Target

**What:** Stencil automatically generates a JSON file documenting all components — props (name, type, default, description), events (name, bubbles, composed, detail type), methods (signature, params, returns), CSS custom properties (requires `@prop` in CSS), CSS parts (requires `@part` in component JSDoc), and slots.

**When to use:** Add to stencil.config.ts as an additional output target alongside existing `dist`, `dist-custom-elements`, and `www`.

**Example:**
```typescript
// Source: https://stenciljs.com/docs/docs-json
// stencil.config.ts
import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'skillspilot',
  outputTargets: [
    { type: 'dist', esmLoaderPath: '../loader' },
    { type: 'dist-custom-elements', /* ... */ },
    { type: 'www', /* ... */ },
    {
      type: 'docs-json',
      file: 'docs.json',  // written at repo root, imported by Docusaurus
    }
  ],
};
```

**CSS @prop annotation required in component CSS files:**
```css
/* sp-org-chart.css */
:host {
  /**
   * @prop --dwc-color-primary: Primary accent color for tiles and selections
   * @prop --dwc-color-surface: Background color for user tiles
   * @prop --dwc-color-border: Border color for connectors and tiles
   * @prop --dwc-border-radius: Border radius for user tiles
   */
}
```

**@part annotation required in component @Component JSDoc:**
```typescript
/**
 * @part user-tile - Individual user tile element
 * @part tree-container - Main tree scrollable container
 * @part filter-input - Filter text input field
 */
@Component({ tag: 'sp-org-chart', shadow: true })
```

### Pattern 2: Docusaurus MDX Component API Page

**What:** Each component page in Docusaurus imports the generated `docs.json` and renders API tables via a custom React component. The component data is accessed by filtering the JSON array by `tag`.

**When to use:** Every `docs/components/*.mdx` page.

**Example:**
```mdx
---
title: sp-org-chart
description: Hierarchical organization chart component
---

import docsData from '../../../docs.json';
import ApiReference from '@site/src/components/ApiReference';
import LiveExample from '@site/src/components/LiveExample';

export const componentDocs = docsData.components.find(c => c.tag === 'sp-org-chart');

# sp-org-chart

<LiveExample code={`
<sp-org-chart
  editable="true"
  users='[{"id":"1","name":"Alice","role":"CEO"},{"id":"2","name":"Bob","reportsTo":"1"}]'>
</sp-org-chart>
<script src="https://cdn.jsdelivr.net/npm/@skillspilot/webcomponents/dist/skillspilot/skillspilot.esm.js" type="module"></script>
`} />

## API Reference

<ApiReference component={componentDocs} />
```

### Pattern 3: Custom LiveExample Iframe Component

**What:** Renders HTML code as an interactive iframe using `srcdoc`. For web components the iframe loads the CDN script, injects the HTML, and shows the live result. An editable textarea below shows the source.

**When to use:** All component example blocks (decided by user: interactive approach at Claude's discretion).

**Example:**
```tsx
// Source: pattern established by design system docs (Lion, Spectrum, FAST)
// docs/src/components/LiveExample.tsx
import React, { useState } from 'react';

const CDN_SCRIPT = `<script src="https://cdn.jsdelivr.net/npm/@skillspilot/webcomponents/dist/skillspilot/skillspilot.esm.js" type="module"></script>`;

export default function LiveExample({ code, height = '200px' }: { code: string; height?: string }) {
  const [source, setSource] = useState(code.trim());
  const srcdoc = `<!DOCTYPE html><html><head>${CDN_SCRIPT}</head><body>${source}</body></html>`;

  return (
    <div className="live-example">
      <iframe
        srcDoc={srcdoc}
        style={{ width: '100%', height, border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '4px' }}
        sandbox="allow-scripts allow-same-origin"
        title="Live example"
      />
      <details>
        <summary>Show / Edit code</summary>
        <textarea
          value={source}
          onChange={e => setSource(e.target.value)}
          style={{ width: '100%', fontFamily: 'monospace', minHeight: '120px' }}
        />
      </details>
    </div>
  );
}
```

### Pattern 4: GitHub Pages Deployment Workflow

**What:** Separate workflow file triggered on push to master. Builds Docusaurus site and deploys to GitHub Pages using the new native GitHub Actions deployment (not `gh-pages` branch).

**When to use:** `.github/workflows/docs-deploy.yml` (new file).

**Example:**
```yaml
# Source: https://docusaurus.io/docs/deployment
name: Deploy Docs to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install root deps
        run: npm ci
      - name: Build Stencil (generates docs.json)
        run: npm run build
      - name: Install Docusaurus deps
        run: npm ci
        working-directory: docs
      - name: Build Docusaurus
        run: npm run build
        working-directory: docs
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Pattern 5: Changesets npm Publish with Provenance

**What:** The existing `release.yml` workflow is mostly correct. Add `NPM_CONFIG_PROVENANCE: true` to the changesets action environment and ensure `NPM_TOKEN` is set as a GitHub secret. Changesets already handles scoped public packages via `"access": "public"` in `.changeset/config.json` (already set in this project).

**When to use:** Update existing `.github/workflows/release.yml`.

**Example:**
```yaml
# Source: https://docs.npmjs.com/generating-provenance-statements/
- name: Create Release Pull Request or Publish
  uses: changesets/action@v1
  with:
    publish: npm run release
    version: npm run version
    title: 'chore: version packages'
    commit: 'chore: version packages'
    createGithubReleases: true
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
    NPM_CONFIG_PROVENANCE: 'true'  # ADD THIS
```

The `npm run release` script already runs `npm run build && changeset publish` which uses the `access: public` from `.changeset/config.json`. This is correct — no changes needed to `package.json` scripts.

### Anti-Patterns to Avoid

- **Putting Docusaurus inside the Stencil src/ tree:** Docusaurus is a separate build system with its own `package.json` and `node_modules`. Keep it in `/docs` at the repo root.
- **Generating docs-json to inside src/:** Write `docs.json` to the repo root or directly into the `docs/` directory. Avoid putting it in `dist/` (it gets cleaned on rebuild).
- **Using `@docusaurus/theme-live-codeblock` for HTML:** It only renders JSX expressions via react-live. Web component HTML requires the iframe approach.
- **Relying on Jekyll on GitHub Pages:** Always add a `.nojekyll` file to `docs/static/` to prevent Jekyll processing, which strips files starting with `_`.
- **First-time publish without `--access public`:** Scoped packages default to private. The `.changeset/config.json` already sets `"access": "public"`, which `changeset publish` respects. No additional flag needed.
- **Skipping `@prop` CSS annotations:** Stencil only documents CSS custom properties that have `@prop` JSDoc annotations in the CSS file. The current components have none — this must be added or CSS vars will not appear in the API reference.
- **Running Docusaurus build before Stencil build:** The Docusaurus build imports `docs.json` which is generated by `stencil build`. Always build Stencil first in CI.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Component API extraction | Custom TypeScript AST parser | Stencil `docs-json` output | Stencil already has full type info + JSDoc extraction; AST parsing is complex |
| Docs site framework | Custom static site generator | Docusaurus 3.9 | Versioning, search, MDX, React components, GitHub Pages deploy all built-in |
| CSS custom property documentation | Manual table in Markdown | `@prop` JSDoc in CSS + `docs-json` | Auto-updated on build; no manual sync needed |
| Changelog generation | Manual `CHANGELOG.md` editing | Changesets (already configured) | Automated from changeset files; already set up in Phase 1 |
| npm release automation | Manual `npm publish` from dev machine | `changesets/action@v1` + `NPM_TOKEN` | Provenance requires GitHub Actions OIDC; already wired up |
| Version picker | Custom nav dropdown | Docusaurus built-in versioning | One CLI command creates versioned docs snapshot |

**Key insight:** Every component in this project already has JSDoc on `@Prop` and `@Event` decorators. The docs-json output target turns that existing work into API reference content with zero additional effort — except the CSS `@prop` annotations which are currently missing.

---

## Common Pitfalls

### Pitfall 1: CSS Custom Properties Not Appearing in docs.json

**What goes wrong:** The `styles` array in the generated `docs.json` is empty for a component even though it uses many `--dwc-*` variables.

**Why it happens:** Stencil only documents CSS custom properties that have `@prop` JSDoc annotations in the component's `.css` file. Simply using `var(--dwc-color-primary)` in CSS without a comment does not produce documentation output.

**How to avoid:** Add JSDoc annotations at the top of each component's CSS file:
```css
:host {
  /**
   * @prop --dwc-color-primary: Primary accent color
   * @prop --dwc-color-surface: Background surface color
   */
}
```

**Warning signs:** Run `stencil build` and inspect `docs.json` — if `"styles": []` for any component, annotations are missing.

### Pitfall 2: parts Not Appearing in docs.json

**What goes wrong:** `"parts": []` even though the component renders elements with `part="..."` attributes.

**Why it happens:** Stencil extracts `@part` documentation from JSDoc on the `@Component` decorator, not from the template. The `part="..."` attributes in JSX are not parsed for documentation.

**How to avoid:** Add `@part` tags to the component-level JSDoc:
```typescript
/**
 * @part toolbar - The formatting toolbar
 * @part source-editor - The source textarea element
 * @part footer - The character/word count footer
 */
@Component({ tag: 'sp-markdown-editor', shadow: true })
```

Note: `sp-org-chart` already has `@part` annotations. `sp-markdown-editor` has `part=` attributes in JSX but no JSDoc `@part` tags. `sp-walkthrough` has no `part=` attributes at all.

**Warning signs:** `"parts": []` in docs.json for a component.

### Pitfall 3: GitHub Pages Shows 404 for Non-Root Routes

**What goes wrong:** Navigating directly to a component page (e.g. `https://org.github.io/repo/docs/components/sp-org-chart`) shows a 404.

**Why it happens:** GitHub Pages serves static files; Docusaurus uses client-side routing. Without proper configuration, direct URL access fails.

**How to avoid:** Docusaurus 3 handles this correctly when built with `npm run build` (generates static HTML for all routes). Ensure `.nojekyll` is in `docs/static/`. Ensure `baseUrl` in `docusaurus.config.ts` matches the repository name (e.g. `/trm-ai-webcomponents/`). This is a project with no remote currently — the `baseUrl` and GitHub org/project name will need to be filled in once the remote is established.

**Warning signs:** 404 on page refresh; works only from the root URL.

### Pitfall 4: Docusaurus Build Fails — Cannot Find docs.json

**What goes wrong:** Docusaurus build fails with module not found or import error for `docs.json`.

**Why it happens:** The workflow must run `stencil build` before `npm run build` in the docs directory. If CI only runs the Docusaurus build without the Stencil build, `docs.json` won't exist.

**How to avoid:** In the GitHub Actions workflow (and local dev), always build Stencil first. Either run from repo root `npm run build && cd docs && npm run build`, or set the docs workflow to depend on a Stencil build step.

**Warning signs:** Build fails in CI but works locally (if you happened to have a fresh `docs.json` from local Stencil build).

### Pitfall 5: Changeset PR Not Auto-Publishing Because of Missing NPM_TOKEN

**What goes wrong:** Changesets action creates the version PR but never publishes when the PR is merged.

**Why it happens:** `NPM_TOKEN` secret is not set in the GitHub repository settings, or it is expired/revoked. As of November 2025, npm classic tokens were revoked — existing stored tokens may no longer work.

**How to avoid:** Create a new npm Automation token (granular access token: read+write for `@skillspilot/webcomponents`) and add it as `NPM_TOKEN` secret to the GitHub repo. Alternatively, set up npm OIDC trusted publishing (more complex, eliminates the token entirely but requires npm account configuration).

**Warning signs:** Release workflow run shows `401 Unauthorized` from npm in the publish step.

### Pitfall 6: Live Examples Break When CDN Package Version Changes

**What goes wrong:** Interactive examples load the latest CDN version which may differ from the docs version being viewed.

**Why it happens:** CDN URLs without a pinned version (`@latest` or no version) always serve the newest package.

**How to avoid:** In the `LiveExample` component, use a version-pinned CDN URL. When creating a new docs version with `docusaurus docs:version`, update the CDN URL to pin to the released version. For the current (latest) docs, using the latest CDN is acceptable.

**Warning signs:** Examples work on latest but break on older versioned doc pages.

---

## Code Examples

Verified patterns from official sources:

### Stencil docs-json Configuration
```typescript
// Source: https://stenciljs.com/docs/docs-json
// stencil.config.ts — add alongside existing outputTargets
{
  type: 'docs-json',
  file: 'docs.json',  // writes to repo root
  supplementalPublicTypes: 'src/components.d.ts',  // optional: include generated types
}
```

### docs.json Shape (Key Interfaces)
```typescript
// Source: https://github.com/ionic-team/stencil/blob/main/src/declarations/stencil-public-docs.ts
interface JsonDocs {
  components: JsonDocsComponent[];
  timestamp: string;
  compiler: { name: string; version: string; typescriptVersion: string };
}

interface JsonDocsComponent {
  tag: string;              // 'sp-org-chart'
  encapsulation: 'shadow' | 'scoped' | 'none';
  docs: string;             // component-level JSDoc
  props: JsonDocsProp[];    // @Prop decorators
  events: JsonDocsEvent[];  // @Event decorators
  methods: JsonDocsMethod[]; // @Method decorators
  styles: JsonDocsStyle[];  // CSS @prop annotations → 'name', 'docs'
  parts: JsonDocsPart[];    // @part JSDoc tags → 'name', 'docs'
  slots: JsonDocsSlot[];    // @slot JSDoc tags → 'name', 'docs'
}

interface JsonDocsProp {
  name: string;
  type: string;
  default: string;
  docs: string;
  attr?: string;           // HTML attribute name
  required: boolean;
  mutable: boolean;
}
```

### Docusaurus Config for GitHub Pages
```typescript
// Source: https://docusaurus.io/docs/deployment
// docs/docusaurus.config.ts
import type { Config } from '@docusaurus/types';

const config: Config = {
  title: 'Skillspilot Web Components',
  tagline: 'Production-ready web components for Skillspilot/TRM-AI',
  url: 'https://skillspilot.github.io',       // GitHub org/user pages URL
  baseUrl: '/trm-ai-webcomponents/',           // repository name
  organizationName: 'skillspilot',             // GitHub org
  projectName: 'trm-ai-webcomponents',         // GitHub repo name
  trailingSlash: false,

  presets: [
    ['classic', {
      docs: {
        sidebarPath: './sidebars.ts',
        routeBasePath: '/',  // serve docs at root (docs-only mode)
      },
      blog: false,           // no blog
      theme: {
        customCss: './src/css/custom.css',
      },
    }],
  ],

  themeConfig: {
    navbar: {
      title: 'Skillspilot WC',
      items: [
        { type: 'docSidebar', sidebarId: 'docs', label: 'Docs' },
      ],
    },
  },
};

export default config;
```

### ApiReference React Component (skeleton)
```tsx
// docs/src/components/ApiReference.tsx
import React from 'react';

export default function ApiReference({ component }) {
  return (
    <>
      {component.props.length > 0 && (
        <>
          <h2>Properties</h2>
          <table>
            <thead><tr><th>Property</th><th>Attribute</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              {component.props.map(p => (
                <tr key={p.name}>
                  <td><code>{p.name}</code></td>
                  <td><code>{p.attr || '—'}</code></td>
                  <td><code>{p.type}</code></td>
                  <td><code>{p.default}</code></td>
                  <td>{p.docs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {/* similar tables for events, methods, styles, parts */}
    </>
  );
}
```

### Docusaurus Versioning CLI (when ready)
```bash
# Source: https://docusaurus.io/docs/versioning
# Run from the /docs directory after releasing a version
cd docs
npm run docusaurus docs:version 1.0.0

# Creates:
# versioned_docs/version-1.0.0/   (snapshot of docs/)
# versioned_sidebars/version-1.0.0-sidebars.json
# versions.json updated
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `peaceiris/actions-gh-pages` | `actions/deploy-pages@v4` + `actions/upload-pages-artifact@v3` | 2023 (GitHub native) | More secure; no gh-pages branch; OIDC-native |
| npm classic tokens (long-lived) | Granular access tokens or OIDC trusted publishing | Nov 2025 (classic tokens revoked) | Must create new token; existing stored tokens may be invalid |
| `changeset publish` without provenance | `changeset publish` + `NPM_CONFIG_PROVENANCE=true` | 2023 (npm provenance GA) | Supply chain security; shows "built on GitHub Actions" badge on npmjs.com |
| Manual `@part` JSDoc required | Stencil v4 still requires `@part` in JSDoc | Current | No change — template `part=""` attributes are not auto-documented |
| Docusaurus v2 | Docusaurus v3.9.2 (MDX v3, React 18) | Oct 2024 (v3 stable) | MDX v3 — lowercase JSX tags are rendered as HTML elements (not custom components) |

**Deprecated/outdated:**
- `gh-pages` branch approach: still functional but GitHub-native deployment is preferred
- `npm publish --access=public` override in release script: not needed when `.changeset/config.json` sets `"access": "public"` (already done in this project)
- Docusaurus v2: EOL — don't use it; v3.9.2 is the current target

---

## Open Questions

1. **GitHub repository remote URL / org name**
   - What we know: The local repo has no remote (`git remote get-url origin` returns nothing). The package.json says `@skillspilot/webcomponents` suggesting the npm org is `@skillspilot`.
   - What's unclear: The actual GitHub org name and repo name needed for `organizationName`, `projectName`, and `url` in `docusaurus.config.ts`. These determine the GitHub Pages URL.
   - Recommendation: Use placeholder values in config and leave a clear comment. The planner should note this as a "fill in when pushing to GitHub" step, not a blocker for building the site.

2. **Documentation versioning strategy (DOCS-06)**
   - What we know: Docusaurus has built-in versioning via `npm run docusaurus docs:version <version>`. The user left this to Claude's discretion. The official recommendation is to avoid versioning unless traffic is high and API changes frequently.
   - What's unclear: Whether a version picker adds enough value for a project with 3 components at v0.0.1 vs. just keeping the latest docs + a changelog page.
   - Recommendation: **Implement changelog-only for v1**. Create a `docs/docs/changelog.md` that summarizes changes per release. Add a note in the plan to implement full Docusaurus versioning when the project reaches v1.0.0 with breaking changes. This satisfies DOCS-06 ("stays in sync with releases") without premature complexity.

3. **Docs-json file path relative to Docusaurus**
   - What we know: `stencil.config.ts` can write `docs.json` anywhere. Docusaurus can import JSON from outside its `docs/` directory using relative imports.
   - What's unclear: Whether MDX can import `../../docs.json` (outside the Docusaurus package) reliably across local dev and CI.
   - Recommendation: Configure Stencil to write `docs.json` to `docs/src/data/docs.json` (inside the Docusaurus package). This avoids cross-package import issues and makes the path predictable. The Stencil build runs before Docusaurus build in CI, so the file will exist.

4. **CDN URL for live examples (unpkg vs jsdelivr)**
   - What we know: `package.json` has `"unpkg": "dist/skillspilot/skillspilot.esm.js"`. Both unpkg and jsdelivr will serve the package once published.
   - What's unclear: Which CDN to use in examples before the package is actually published (docs can be built and deployed before first npm publish).
   - Recommendation: Use the jsdelivr URL pattern (`https://cdn.jsdelivr.net/npm/@skillspilot/webcomponents@latest/dist/skillspilot/skillspilot.esm.js`) as it's more reliable for availability. Use a local build URL during development/before first publish.

---

## Sources

### Primary (HIGH confidence)
- [Stencil docs-json output target](https://stenciljs.com/docs/docs-json) — output target config, JSON schema, CSS @prop pattern
- [Stencil doc-generation overview](https://stenciljs.com/docs/doc-generation) — what is auto-extracted vs requires annotations
- [Stencil public docs TypeScript interface](https://github.com/ionic-team/stencil/blob/main/src/declarations/stencil-public-docs.ts) — JsonDocs, JsonDocsComponent, JsonDocsProp, JsonDocsEvent schemas
- [Docusaurus deployment docs](https://docusaurus.io/docs/deployment) — GitHub Actions workflow YAML for deploy-pages
- [Docusaurus versioning docs](https://docusaurus.io/docs/versioning) — `docs:version` CLI, versioned_docs structure, tradeoff guidance
- [Docusaurus changelog](https://docusaurus.io/changelog) — confirmed v3.9.2 as latest stable
- [Changesets config-file-options](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md) — `access: "public"` required for scoped packages
- [Changesets action](https://github.com/changesets/action) — inputs, GitHub releases, NPM_CONFIG_PROVENANCE pattern
- [npm provenance statements](https://docs.npmjs.com/generating-provenance-statements/) — `--provenance` flag, `id-token: write` permission requirement
- Existing project files: `.changeset/config.json` (`access: "public"` confirmed), `.github/workflows/release.yml` (changesets/action already configured), `stencil.config.ts` (no docs-json yet), component TSX files (JSDoc coverage varies)

### Secondary (MEDIUM confidence)
- [docusaurus-plugin-code-preview](https://github.com/sean-perkins/docusaurus-plugin-code-preview) — investigated and rejected (dormant, framework-focused, not suited to vanilla HTML)
- WebSearch verification of docs-json `usage/` folder pattern — verified multiple sources agree
- WebSearch on npm classic token revocation (Nov 2025) — multiple sources confirm; actionable for NPM_TOKEN setup

### Tertiary (LOW confidence)
- Live example iframe approach — established pattern in open-source design system docs (Lion, Spectrum) but not verified via a single authoritative source; recommendation is based on ecosystem patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Docusaurus 3.9.2 and Stencil docs-json verified via official docs
- Architecture: HIGH — GitHub Actions workflows verified; JSON schema verified via Stencil source
- Live examples approach: MEDIUM — iframe pattern is well-established but no single canonical doc; theme-live-codeblock limitation (JSX-only) is verified
- Pitfalls: HIGH — CSS @prop annotation requirement verified via official Stencil docs; GitHub Pages .nojekyll requirement verified
- INFRA-07 (provenance publish): HIGH — npm official docs + changesets repo confirm the approach

**Research date:** 2026-02-21
**Valid until:** 2026-03-21 (30 days — Docusaurus and Stencil are stable; Changesets action is stable)
