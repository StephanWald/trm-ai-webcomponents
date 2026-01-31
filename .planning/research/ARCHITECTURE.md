# Architecture Research: Stencil.js Component Library

**Research Date:** 2026-01-30
**Scope:** Greenfield architecture for @skillspilot/webcomponents Stencil.js library
**Focus:** Project structure, build pipeline, testing, documentation, and component boundaries

---

## Executive Summary

Stencil.js provides a compiler-based approach to building framework-agnostic web components with built-in lazy loading, multiple distribution strategies, and comprehensive testing capabilities. For @skillspilot/webcomponents, the recommended architecture is a **monorepo structure** with separate directories for components and documentation, utilizing Stencil's dual output targets (dist + dist-custom-elements) for maximum flexibility, peer dependencies for heavy libraries, and CSS custom properties for theming.

---

## 1. Recommended Project Structure

Based on Stencil.js best practices and the project requirements, here's the recommended directory layout:

```
trm-ai-webcomponents/
├── .planning/                    # Project planning documents
│   ├── research/                 # Research artifacts
│   └── PROJECT.md                # Core project context
│
├── packages/                     # Monorepo packages
│   ├── components/               # Stencil component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── sp-markdown-editor/
│   │   │   │   │   ├── sp-markdown-editor.tsx
│   │   │   │   │   ├── sp-markdown-editor.css
│   │   │   │   │   ├── sp-markdown-editor.spec.ts
│   │   │   │   │   ├── sp-markdown-editor.e2e.ts
│   │   │   │   │   └── readme.md
│   │   │   │   ├── sp-walkthrough/
│   │   │   │   │   ├── sp-walkthrough.tsx
│   │   │   │   │   ├── sp-walkthrough.css
│   │   │   │   │   ├── sp-walkthrough.spec.ts
│   │   │   │   │   ├── sp-walkthrough.e2e.ts
│   │   │   │   │   └── readme.md
│   │   │   │   └── sp-org-chart/
│   │   │   │       ├── sp-org-chart.tsx
│   │   │   │       ├── sp-org-chart.css
│   │   │   │       ├── sp-org-chart.spec.ts
│   │   │   │       ├── sp-org-chart.e2e.ts
│   │   │   │       └── readme.md
│   │   │   ├── globals/
│   │   │   │   ├── theme.css         # DWC custom properties
│   │   │   │   └── index.ts          # Global utilities
│   │   │   ├── utils/
│   │   │   │   └── helpers.ts        # Shared utilities
│   │   │   └── index.ts              # Main entry point
│   │   ├── dist/                     # Lazy-loaded output (gitignored)
│   │   ├── dist-custom-elements/     # Bundler-friendly output (gitignored)
│   │   ├── www/                      # Dev server output (gitignored)
│   │   ├── stencil.config.ts         # Stencil configuration
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── readme.md
│   │
│   └── docs/                         # Docusaurus documentation
│       ├── docs/
│       │   ├── getting-started/
│       │   ├── components/
│       │   │   ├── markdown-editor.md
│       │   │   ├── walkthrough.md
│       │   │   └── org-chart.md
│       │   └── theming.md
│       ├── src/
│       │   ├── components/           # Custom React components for docs
│       │   └── pages/                # Landing pages
│       ├── static/
│       ├── docusaurus.config.js
│       ├── package.json
│       └── sidebars.js
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Build + test on PR
│       ├── release.yml               # npm publish on tag
│       └── docs.yml                  # Deploy docs to GitHub Pages
│
├── package.json                      # Root package.json (workspace config)
├── pnpm-workspace.yaml               # or npm/yarn workspaces
├── .gitignore
└── readme.md
```

### Key Structural Principles

1. **One component per directory**: Each component gets its own folder with co-located tests, styles, and auto-generated readme
2. **Monorepo organization**: Components and docs in separate packages but same repo for tight coupling
3. **Multiple output targets**: Both `dist` (lazy-loaded) and `dist-custom-elements` (bundler-friendly) for different consumption patterns
4. **Global styles in dedicated folder**: DWC theme variables defined in `globals/theme.css` using `:root` pseudo-class to penetrate shadow DOM

---

## 2. Component Boundaries & Data Flow

### Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Consumer Application                     │
│  (React, Vue, Angular, vanilla HTML + <script> tag)         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTML attributes / JS properties
                   │ DOM events (CustomEvent)
                   │
    ┌──────────────┼──────────────┬──────────────────────┐
    │              │              │                      │
┌───▼────────┐ ┌──▼──────────┐ ┌─▼──────────┐  ┌──────▼────────┐
│sp-markdown-│ │sp-walkthrough│ │sp-org-chart│  │  Future       │
│   editor   │ │              │ │            │  │  Components   │
└────────────┘ └──────────────┘ └────────────┘  └───────────────┘
     │                │                │
     │ External       │ External       │ No external
     │ dependencies   │ dependencies   │ dependencies
     ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐
│ marked      │  │ (future:    │
│ DOMPurify   │  │  timeline   │
│ Prism.js    │  │  libs?)     │
│ Turndown    │  │             │
│ (peer deps) │  │             │
└─────────────┘  └─────────────┘

     ▲ All components consume
     │
┌────┴─────────────────────────────────────┐
│  DWC Theme (--dwc-* CSS custom props)    │
│  Defined in globals/theme.css            │
└──────────────────────────────────────────┘
```

### Data Flow Patterns

#### 1. Props (Parent → Child)
- **Direction**: Consumer app → Component
- **Mechanism**: HTML attributes (dash-case) or JS properties (camelCase)
- **Use cases**: Initial configuration, runtime updates
- **Example**: `<sp-markdown-editor initial-value="# Hello" theme="dark"></sp-markdown-editor>`

#### 2. Events (Child → Parent)
- **Direction**: Component → Consumer app
- **Mechanism**: CustomEvent via `@Event()` decorator
- **Use cases**: User interactions, state changes, validation errors
- **Example**:
  ```typescript
  @Event() spValueChange: EventEmitter<string>;
  // Consumer: element.addEventListener('spValueChange', handler)
  ```

#### 3. Internal State
- **Scope**: Component-internal only
- **Mechanism**: `@State()` decorator triggers re-renders
- **Use cases**: UI state, intermediate calculations
- **Not exposed**: State never leaks to parent

#### 4. Watch Handlers
- **Mechanism**: `@Watch()` decorator observes prop/state changes
- **Use cases**: Side effects, validation, derived state updates
- **Example**: `@Watch('value') valueChanged(newVal, oldVal) { ... }`

### Component-Specific Boundaries

#### sp-markdown-editor
- **External Dependencies**: marked, DOMPurify, Prism.js, Turndown (peer deps)
- **Props**: `initialValue`, `mode` (wysiwyg/source/split), `theme`, `enableVoice`, `sanitize`
- **Events**: `spValueChange`, `spModeChange`, `spError`
- **Internal State**: Editor state, cursor position, undo/redo stack
- **Boundary**: Self-contained — no communication with other components

#### sp-walkthrough
- **External Dependencies**: TBD (possibly video/timeline libs as peer deps)
- **Props**: `scenes` (JSON array), `autoplay`, `captionsEnabled`, `authorMode`
- **Events**: `spSceneChange`, `spComplete`, `spInteraction`
- **Internal State**: Current scene index, playback state, highlighted elements
- **Boundary**: May need to access DOM elements outside component (for highlighting) — requires careful scoping

#### sp-org-chart
- **External Dependencies**: None (pure vanilla implementation)
- **Props**: `data` (hierarchical JSON), `draggable`, `filterEnabled`
- **Events**: `spNodeSelect`, `spNodeMove`, `spFilterChange`
- **Internal State**: Expanded/collapsed nodes, drag state, filter criteria
- **Boundary**: Fully self-contained

---

## 3. Build Pipeline Architecture

### Stencil Configuration (stencil.config.ts)

```typescript
import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'skillspilot-webcomponents',
  globalStyle: 'src/globals/theme.css',
  outputTargets: [
    // 1. Lazy-loaded distribution (CDN + npm)
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      dir: 'dist',
      collectionDir: 'collection',
    },

    // 2. Bundler-friendly custom elements
    {
      type: 'dist-custom-elements',
      dir: 'dist-custom-elements',
      generateTypeDeclarations: true,
      externalRuntime: false, // Bundle Stencil runtime
    },

    // 3. Auto-generated README files
    {
      type: 'docs-readme',
      dir: 'readme',
      strict: true,
    },

    // 4. JSON docs for Docusaurus integration
    {
      type: 'docs-json',
      file: '../docs/static/component-api.json',
    },

    // 5. Development server
    {
      type: 'www',
      serviceWorker: null,
      baseUrl: '/',
    },
  ],
  testing: {
    browserHeadless: 'new',
    collectCoverage: true,
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
  plugins: [sass()],
  extras: {
    enableImportInjection: true,
  },
};
```

### Build Phases

#### Phase 1: Development
```bash
npm run dev              # Start dev server with hot reload
npm run build            # Production build (all output targets)
npm run test             # Run spec + e2e tests
npm run test.watch       # Watch mode for TDD
```

#### Phase 2: CI Validation
```yaml
# .github/workflows/ci.yml
- Checkout code
- Install dependencies (pnpm install)
- Lint (ESLint + TypeScript checks)
- Build components (npm run build)
- Run tests with coverage (npm run test)
- Upload coverage to Codecov
```

#### Phase 3: Publishing
```yaml
# .github/workflows/release.yml (on git tag)
- Build production bundles
- Update package.json version
- Publish to npm registry
- Create GitHub release with changelog
```

#### Phase 4: Documentation Deployment
```yaml
# .github/workflows/docs.yml
- Build Stencil components (generates component-api.json)
- Copy built components to docs/static
- Build Docusaurus site
- Deploy to GitHub Pages (gh-pages branch)
```

### Output Artifacts

| Output Target | Purpose | Consumers | Files Generated |
|--------------|---------|-----------|-----------------|
| `dist` | Lazy-loaded via CDN | Script tag users | `esm/`, `loader/`, `collection/`, `types/` |
| `dist-custom-elements` | Tree-shakable for bundlers | Webpack/Vite/Rollup | Individual component modules + types |
| `docs-readme` | Auto-generated docs | GitHub, npm package page | `readme.md` per component |
| `docs-json` | Structured API docs | Docusaurus site | `component-api.json` |
| `www` | Development preview | Local development | Static site in `www/` |

---

## 4. Testing Architecture

### Testing Strategy

Stencil provides two complementary testing approaches:

#### Unit Tests (.spec.ts)
- **Framework**: Jest (built into Stencil)
- **Scope**: Component methods, state logic, prop validation
- **Tool**: `newSpecPage()` from `@stencil/core/testing`
- **Example**:
  ```typescript
  import { newSpecPage } from '@stencil/core/testing';
  import { SpMarkdownEditor } from './sp-markdown-editor';

  describe('sp-markdown-editor', () => {
    it('renders with initial value', async () => {
      const page = await newSpecPage({
        components: [SpMarkdownEditor],
        html: `<sp-markdown-editor initial-value="# Test"></sp-markdown-editor>`,
      });
      expect(page.root).toEqualHtml(`
        <sp-markdown-editor initial-value="# Test">
          <div class="editor">...</div>
        </sp-markdown-editor>
      `);
    });
  });
  ```

#### E2E Tests (.e2e.ts)
- **Framework**: Puppeteer (built into Stencil)
- **Scope**: DOM rendering, event handling, component interaction
- **Tool**: `newE2EPage()` from `@stencil/core/testing`
- **Example**:
  ```typescript
  import { newE2EPage } from '@stencil/core/testing';

  describe('sp-markdown-editor e2e', () => {
    it('emits spValueChange when content updates', async () => {
      const page = await newE2EPage();
      await page.setContent('<sp-markdown-editor></sp-markdown-editor>');

      const element = await page.find('sp-markdown-editor');
      const spy = await element.spyOnEvent('spValueChange');

      element.setProperty('value', '# New Content');
      await page.waitForChanges();

      expect(spy).toHaveReceivedEventDetail('# New Content');
    });
  });
  ```

### Test Organization

```
sp-markdown-editor/
├── sp-markdown-editor.tsx           # Component implementation
├── sp-markdown-editor.spec.ts       # Unit tests (logic)
├── sp-markdown-editor.e2e.ts        # E2E tests (rendering)
└── test-utils/                      # Shared test helpers
    ├── mock-data.ts
    └── test-helpers.ts
```

### Coverage Targets

As configured in `stencil.config.ts`:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### CI Integration

```yaml
# Example CI test command
npm run test -- --ci --coverage --maxWorkers=2
```

---

## 5. Documentation Architecture

### Docusaurus Integration Strategy

Since there's no native Stencil + Docusaurus plugin, use **custom integration via JSON docs**:

#### 1. Component API Generation
```typescript
// stencil.config.ts
{
  type: 'docs-json',
  file: '../docs/static/component-api.json'
}
```

Generates structured JSON with:
- Component props (name, type, default, description)
- Events (name, detail type)
- Methods (signature, return type)
- CSS custom properties
- Slots

#### 2. Docusaurus Consumption
```jsx
// docs/src/components/ComponentAPI.jsx
import React from 'react';
import componentAPI from '@site/static/component-api.json';

export function ComponentAPI({ name }) {
  const component = componentAPI.components.find(c => c.tag === name);
  return (
    <div>
      <h3>Props</h3>
      <table>
        {component.props.map(prop => (
          <tr key={prop.name}>
            <td><code>{prop.name}</code></td>
            <td>{prop.type}</td>
            <td>{prop.docs}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

#### 3. Live Component Demos
```html
<!-- docs/docs/components/markdown-editor.md -->
import ComponentAPI from '@site/src/components/ComponentAPI';

# Markdown Editor

<ComponentAPI name="sp-markdown-editor" />

## Live Demo

<sp-markdown-editor initial-value="# Try me!"></sp-markdown-editor>

<script type="module" src="/components/sp-markdown-editor.js"></script>
```

### Documentation Structure

```
docs/
├── docs/
│   ├── introduction.md
│   ├── getting-started/
│   │   ├── installation.md       # npm vs CDN
│   │   └── theming.md            # DWC custom properties
│   ├── components/
│   │   ├── markdown-editor.md    # API + examples
│   │   ├── walkthrough.md
│   │   └── org-chart.md
│   └── guides/
│       ├── peer-dependencies.md  # marked, DOMPurify setup
│       └── framework-usage.md    # React, Vue, Angular examples
├── static/
│   ├── component-api.json        # Auto-generated from Stencil
│   └── components/               # Built component bundles for demos
└── docusaurus.config.js
```

### GitHub Pages Deployment

```yaml
# .github/workflows/docs.yml
name: Deploy Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Components
        run: |
          cd packages/components
          npm run build

      - name: Copy Components to Docs
        run: |
          mkdir -p packages/docs/static/components
          cp -r packages/components/dist/* packages/docs/static/components/

      - name: Build Docusaurus
        run: |
          cd packages/docs
          npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./packages/docs/build
```

---

## 6. Dependency Management Strategy

### Peer Dependencies Approach

For heavy libraries (marked, DOMPurify, Prism.js, Turndown), use **peer dependencies** to:
1. Reduce bundle size
2. Let consumers control versions
3. Avoid duplicate imports

#### package.json Configuration
```json
{
  "name": "@skillspilot/webcomponents",
  "peerDependencies": {
    "marked": "^13.0.0",
    "dompurify": "^3.0.0",
    "prismjs": "^1.29.0",
    "turndown": "^7.1.0"
  },
  "peerDependenciesMeta": {
    "marked": { "optional": false },
    "dompurify": { "optional": false },
    "prismjs": { "optional": true },
    "turndown": { "optional": true }
  }
}
```

#### Component Import Pattern
```typescript
// sp-markdown-editor.tsx
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Graceful degradation if optional deps missing
let Prism;
try {
  Prism = await import('prismjs');
} catch {
  console.warn('Prism.js not available - syntax highlighting disabled');
}
```

### Bundle Size Implications

| Component | Peer Deps | Estimated Size (bundled) | Size (with peers external) |
|-----------|-----------|--------------------------|----------------------------|
| sp-markdown-editor | marked, DOMPurify, Prism, Turndown | ~450 KB | ~25 KB |
| sp-walkthrough | TBD | TBD | ~15 KB |
| sp-org-chart | None | ~12 KB | ~12 KB |
| **Total Library** | — | ~477 KB | ~52 KB |

---

## 7. CSS Theming Architecture

### DWC Custom Property System

All components consume `--dwc-*` CSS custom properties defined in `globals/theme.css`:

```css
/* packages/components/src/globals/theme.css */
:root {
  /* Colors */
  --dwc-color-primary: #007bff;
  --dwc-color-secondary: #6c757d;
  --dwc-color-success: #28a745;
  --dwc-color-danger: #dc3545;
  --dwc-color-warning: #ffc107;
  --dwc-color-info: #17a2b8;
  --dwc-color-background: #ffffff;
  --dwc-color-surface: #f8f9fa;
  --dwc-color-text: #212529;
  --dwc-color-text-muted: #6c757d;

  /* Typography */
  --dwc-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --dwc-font-size-sm: 0.875rem;
  --dwc-font-size-base: 1rem;
  --dwc-font-size-lg: 1.25rem;
  --dwc-font-weight-normal: 400;
  --dwc-font-weight-bold: 600;

  /* Spacing */
  --dwc-spacing-xs: 0.25rem;
  --dwc-spacing-sm: 0.5rem;
  --dwc-spacing-md: 1rem;
  --dwc-spacing-lg: 1.5rem;
  --dwc-spacing-xl: 2rem;

  /* Borders */
  --dwc-border-radius: 0.25rem;
  --dwc-border-width: 1px;
  --dwc-border-color: #dee2e6;

  /* Shadows */
  --dwc-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --dwc-shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --dwc-shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

### Component-Level Consumption

```css
/* sp-markdown-editor.css */
:host {
  display: block;
  font-family: var(--dwc-font-family);
  font-size: var(--dwc-font-size-base);
  color: var(--dwc-color-text);
}

.editor-toolbar {
  background: var(--dwc-color-surface);
  border-bottom: var(--dwc-border-width) solid var(--dwc-border-color);
  padding: var(--dwc-spacing-sm);
}

.editor-content {
  padding: var(--dwc-spacing-md);
  background: var(--dwc-color-background);
}

button.primary {
  background: var(--dwc-color-primary);
  color: white;
  border-radius: var(--dwc-border-radius);
  padding: var(--dwc-spacing-sm) var(--dwc-spacing-md);
}
```

### Shadow DOM Considerations

- **Global styles in `:root`** penetrate Shadow DOM boundaries for CSS custom properties
- Component-specific styles use Shadow DOM scoping (`:host`, `:host-context()`)
- Theme variables cascade from light DOM → shadow DOM

---

## 8. Suggested Build Order (Component Dependencies)

### Phase 1: Infrastructure (Week 1-2)
**Dependencies**: None
**Deliverables**:
1. Initialize Stencil project with `npm init stencil`
2. Configure `stencil.config.ts` (output targets, testing, global styles)
3. Set up monorepo structure (packages/components, packages/docs)
4. Implement DWC theme system in `globals/theme.css`
5. Create GitHub Actions workflows (CI, release, docs deployment)
6. Initialize Docusaurus site
7. Configure peer dependencies in package.json

**Validation**: `npm run build` succeeds, CI pipeline runs, docs site builds

---

### Phase 2: sp-org-chart (Week 3)
**Dependencies**: Infrastructure complete
**Rationale**: Simplest component — no external dependencies, pure vanilla logic
**Deliverables**:
1. Port existing 1k LOC vanilla JS to Stencil TSX
2. Implement `@Prop()` for `data`, `draggable`, `filterEnabled`
3. Implement `@Event()` for `spNodeSelect`, `spNodeMove`, `spFilterChange`
4. Write unit tests (.spec.ts) for data parsing, filtering
5. Write E2E tests (.e2e.ts) for drag-and-drop, selection
6. Apply DWC theming to component styles
7. Document API in JSDoc comments (auto-generates readme)

**Validation**: Component renders in dev server, tests pass, builds to dist/

---

### Phase 3: sp-walkthrough (Week 4-5)
**Dependencies**: sp-org-chart complete (validates component pattern)
**Rationale**: Medium complexity — may require peer deps, has DOM interaction outside component
**Deliverables**:
1. Port 3.6k LOC from vanilla JS/webforJ (drop Java wrapper)
2. Define peer dependencies for any video/timeline libraries
3. Implement scene timeline logic with `@State()`
4. Implement DOM element highlighting (scoped queries via `querySelector`)
5. Author mode vs. viewer mode separation
6. Event handling for `spSceneChange`, `spComplete`, `spInteraction`
7. Unit + E2E tests for scene navigation, highlighting
8. DWC theming + component-specific styles

**Validation**: Component works in isolation, can highlight external DOM elements, tests pass

---

### Phase 4: sp-markdown-editor (Week 6-8)
**Dependencies**: sp-org-chart + sp-walkthrough complete (pattern maturity)
**Rationale**: Most complex — 7k LOC, multiple peer deps, rich interactions
**Deliverables**:
1. Port 7k LOC vanilla JS to Stencil
2. Configure peer deps: marked, DOMPurify, Prism.js, Turndown
3. Implement mode switching (WYSIWYG/source/split) with `@State()`
4. Toolbar component architecture (buttons, dropdowns)
5. Voice dictation integration
6. Import/export functionality
7. Sanitization with DOMPurify
8. Syntax highlighting with Prism.js
9. Comprehensive unit tests (parsing, sanitization, mode switching)
10. E2E tests (user interactions, keyboard shortcuts, voice input)
11. DWC theming + custom editor theme support

**Validation**: All editor modes work, voice input functional, sanitization active, tests pass

---

### Phase 5: Documentation & Publishing (Week 9-10)
**Dependencies**: All components complete
**Deliverables**:
1. Write Docusaurus getting-started guides (installation, theming)
2. Generate component API docs from `component-api.json`
3. Create live component demos in docs (embed built components)
4. Write framework usage guides (React, Vue, Angular)
5. Document peer dependency setup
6. Publish v1.0.0 to npm as `@skillspilot/webcomponents`
7. Deploy docs to GitHub Pages
8. Verify CDN distribution (unpkg, jsdelivr)
9. Create GitHub release with changelog

**Validation**: Docs live on GitHub Pages, npm package consumable, CDN links work

---

## 9. Distribution Strategy

### NPM Publishing

```json
// packages/components/package.json
{
  "name": "@skillspilot/webcomponents",
  "version": "1.0.0",
  "main": "dist/index.cjs.js",
  "module": "dist/index.js",
  "es2015": "dist/esm/index.js",
  "es2017": "dist/esm/index.js",
  "types": "dist/types/index.d.ts",
  "collection": "dist/collection/collection-manifest.json",
  "collection:main": "dist/collection/index.js",
  "unpkg": "dist/skillspilot-webcomponents/skillspilot-webcomponents.esm.js",
  "jsdelivr": "dist/skillspilot-webcomponents/skillspilot-webcomponents.esm.js",
  "files": [
    "dist/",
    "loader/"
  ]
}
```

### CDN Usage (Lazy Loading)

```html
<!-- unpkg -->
<script type="module" src="https://unpkg.com/@skillspilot/webcomponents@1.0.0/dist/skillspilot-webcomponents/skillspilot-webcomponents.esm.js"></script>

<!-- jsdelivr -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@skillspilot/webcomponents@1.0.0/dist/skillspilot-webcomponents/skillspilot-webcomponents.esm.js"></script>

<!-- Usage -->
<sp-org-chart data='{"name": "CEO", "children": [...]}' draggable></sp-org-chart>
```

Only `sp-org-chart` component code is downloaded (lazy-loaded).

### Bundler Usage (Tree-Shaking)

```typescript
// Vite/Webpack/Rollup app
import { defineCustomElements } from '@skillspilot/webcomponents/loader';
// OR import individual components
import '@skillspilot/webcomponents/dist-custom-elements/sp-org-chart';

defineCustomElements(window);
```

---

## 10. Quality Gates (Checklist)

### Component Boundaries
- [x] Each component's props/events clearly documented
- [x] Data flow direction explicit (props down, events up)
- [x] Internal state never exposed to parent
- [x] External dependencies declared as peer deps
- [x] No cross-component dependencies (fully isolated)

### Data Flow
- [x] Props use `@Prop()` decorator with TypeScript types
- [x] Events use `@Event()` with EventEmitter<T>
- [x] State managed with `@State()` for reactive updates
- [x] Watch handlers documented for side effects

### Build Order
- [x] Infrastructure first (config, theming, CI)
- [x] Simple → Complex component order (org-chart → walkthrough → markdown-editor)
- [x] Validation gates between phases (tests pass, builds succeed)
- [x] Documentation/publishing last (after all components working)

### Project Structure
- [x] Monorepo with packages/components + packages/docs
- [x] One component per directory with co-located tests
- [x] Global styles in dedicated folder
- [x] Multiple output targets (dist + dist-custom-elements + docs-json)

---

## 11. Key Architectural Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Dual output targets** (dist + dist-custom-elements) | CDN users need lazy loading; bundler users need tree-shaking | Larger build time, more complex config |
| **Peer dependencies** for heavy libs | Keeps bundle size small (~52KB vs ~477KB) | Consumers must install deps, potential version conflicts |
| **DWC theming via CSS custom properties** | Penetrates Shadow DOM, allows runtime theming | Less type-safe than Sass variables |
| **Monorepo with components + docs** | Single source of truth, docs stay in sync | More complex CI/CD, larger repo |
| **Build order: org-chart → walkthrough → markdown-editor** | Validates patterns early with simplest component first | Markdown editor (most valuable) ships last |
| **Stencil's built-in testing (Jest + Puppeteer)** | Zero configuration, optimized for web components | Can't swap out test frameworks easily |
| **JSON docs → Docusaurus** (no official plugin) | Manual integration, but flexible | More setup work than native plugin |

---

## 12. References & Sources

### Official Documentation
- [Stencil Distribution Guide](https://stenciljs.com/docs/distribution)
- [Publishing A Component Library](https://stenciljs.com/docs/publishing)
- [React Integration with Stencil](https://stenciljs.com/docs/react)
- [Styling Components](https://stenciljs.com/docs/styling)
- [Unit Testing](https://stenciljs.com/docs/unit-testing)
- [End-to-end Testing](https://stenciljs.com/docs/end-to-end-testing)
- [Documentation Generation](https://stenciljs.com/docs/doc-generation)
- [Component API Reference](https://stenciljs.com/docs/api)
- [Events](https://stenciljs.com/docs/events)
- [Properties](https://stenciljs.com/docs/properties)
- [Component Lifecycle Methods](https://stenciljs.com/docs/component-lifecycle)
- [Reactive Data](https://stenciljs.com/docs/reactive-data)

### Community Resources
- [Building React and Angular Component Libraries with Stencil and Nx](https://ionic.io/blog/building-react-and-angular-component-libraries-with-stencil-and-nx)
- [Advanced Stencil Component Styling](https://ionic.io/blog/advanced-stencil-component-styling)
- [Component Libraries with Stencil.js](https://dev.to/johnbwoodruff/component-libraries-with-stenciljs---about-stencil-10b7)
- [Creating and Integrating Design Systems with StencilJS](https://giancarlobuomprisco.com/stencil/creating-and-integrating-design-systems-with-stenciljs)
- [Implementing a Design Language System with Stencil.js](https://medium.com/@Danetag/implementing-a-design-language-system-with-stencil-js-515432918eb5)

### GitHub Examples
- [Nx-Stencil-React Monorepo](https://github.com/Mobiletainment/Nx-Stencil-React)
- [StencilJS MonoRepo Starter](https://github.com/BartAlcorn/stenciljs-monorepo-starter)
- [Stencil Lerna Monorepo](https://github.com/bitflower/stencil-lerna)
- [Infineon Design System Stencil](https://github.com/Infineon/infineon-design-system-stencil)
- [Stencil Markdown Plugin](https://github.com/natemoo-re/stencil-markdown)

### Package Examples
- [stencil-markdown npm](https://www.npmjs.com/package/stencil-markdown)
- [@utrecht/web-component-library-stencil](https://www.npmjs.com/package/@utrecht/web-component-library-stencil)

---

**End of Architecture Research**
*This document informs phase structure in the project roadmap. Component boundaries are defined, data flow is explicit, and build order prioritizes early pattern validation.*
