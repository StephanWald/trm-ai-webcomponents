# Phase 1: Foundation & Infrastructure - Research

**Researched:** 2026-01-31
**Domain:** Stencil.js web component library development, build tooling, CI/CD automation
**Confidence:** HIGH

## Summary

Stencil.js v4.41 is the current stable version (released 2026-01-02), designed specifically for building reusable component libraries rather than full applications. It compiles TypeScript web components with zero runtime dependencies and excels at dual output targets: `dist` for CDN lazy-loading and `dist-custom-elements` for tree-shakeable bundler integration.

The standard modern stack combines Stencil with Changesets for version management, GitHub Actions with npm trusted publishing for secure CI/CD, and Playwright (v4.13.0+ required) alongside Stencil's built-in Jest-based test runner for comprehensive testing. DWC theming integrates via CSS custom properties with fallback values, exposed through both CSS variables and `::part()` selectors for granular control.

Critical architecture decisions include using `customElementsExportBehavior: 'auto-define-custom-elements'` for the dist-custom-elements target to enable auto-registration, marking heavy libraries (marked, DOMPurify, Prism.js, Turndown) as optional peer dependencies via `peerDependenciesMeta`, and leveraging Stencil's `globalStyle` config for shared theming that automatically applies to shadow DOM components.

**Primary recommendation:** Use a flat monorepo structure with Stencil's `globalStyle` for DWC token mappings, dual output targets configured for both CDN and npm bundler consumption, optional peer dependencies with runtime detection, and GitHub Actions with npm trusted publishing (requires npm 11.5.1+, Node 24.x) for secure automated releases.

## Standard Stack

The established libraries/tools for Stencil component library development:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @stencil/core | 4.41.0+ | Web component compiler | Official Stencil compiler, zero-runtime, framework-agnostic output |
| TypeScript | Latest | Type-safe component development | Built into Stencil, enables better DX and tooling |
| @changesets/cli | Latest | Version management & changelogs | Industry standard for monorepo versioning, integrates with GitHub Actions |

### Testing
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @stencil/playwright | Latest (experimental) | E2E browser testing | Stencil 4.13.0+, modern E2E testing across all browsers |
| @playwright/test | Latest | Test runner for Playwright | Required alongside Stencil Playwright adapter |
| Stencil Test Runner | Built-in | Unit tests with Jest v27-29 | Built-in, no additional setup, uses Puppeteer for browser testing |

### CI/CD
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| changesets/action | Latest | Automated release PRs | GitHub Actions integration, auto-generates version bump PRs |
| actions/setup-node | v4 | Node.js setup in workflows | Standard GitHub Actions, supports npm caching |
| npm | 11.5.1+ | Package publishing | Required for trusted publishing with provenance |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Changesets | semantic-release | Changesets better for monorepos, manual control vs fully automated |
| Playwright | Puppeteer/Cypress | Playwright is Stencil's recommended modern E2E solution |
| npm trusted publishing | Classic tokens | Trusted publishing is more secure, eliminates token management |

**Installation:**
```bash
# Initialize Stencil project
npm init stencil

# Add testing tools
npm install @stencil/playwright @playwright/test --save-dev
npx playwright install

# Add version management
npm install @changesets/cli --save-dev
npx changeset init

# Peer dependencies (for Markdown Editor only)
npm install marked DOMPurify prismjs turndown --save-peer
```

## Architecture Patterns

### Recommended Project Structure (Flat Monorepo)
```
trm-ai-webcomponents/
├── src/
│   ├── components/          # Web components (TSX files)
│   │   ├── sp-example/      # Test component
│   │   │   ├── sp-example.tsx
│   │   │   ├── sp-example.css
│   │   │   └── sp-example.spec.ts
│   ├── global/              # Shared styles and scripts
│   │   └── dwc-theme.css    # DWC token mappings
│   ├── utils/               # Shared utilities
│   └── index.html           # Dev testing environment
├── docs/                    # Docusaurus documentation site
│   ├── package.json         # Separate Node project
│   └── docs/                # Documentation content
├── dist/                    # Lazy-loaded CDN output
├── dist-custom-elements/    # Tree-shakeable bundler output
├── .changeset/              # Changeset files
├── stencil.config.ts        # Stencil configuration
├── playwright.config.ts     # Playwright E2E config
└── package.json             # Root package
```

**Rationale:** Flat structure works well for single-package libraries. Docusaurus in separate folder with own package.json avoids dependency conflicts. Stencil and Docusaurus can coexist cleanly without workspace complexity.

### Pattern 1: Dual Output Target Configuration
**What:** Configure both `dist` (lazy-loading) and `dist-custom-elements` (tree-shakeable) output targets simultaneously.

**When to use:** Always, for component libraries that need both CDN and npm bundler consumption.

**Example:**
```typescript
// Source: https://stenciljs.com/docs/publishing
import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'skillspilot',
  globalStyle: 'src/global/dwc-theme.css',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      isPrimaryPackageOutputTarget: true,
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false, // Bundle runtime for easier consumption
      generateTypeDeclarations: true,
    },
    {
      type: 'www',
      copy: [{ src: '**/*.html' }, { src: '**/*.css' }],
      serviceWorker: null,
    },
  ],
};
```

### Pattern 2: DWC Theming with Fallbacks
**What:** CSS custom properties with fallback values for standalone component usage without DWC loaded.

**When to use:** All components, ensures graceful degradation when DWC theme is absent.

**Example:**
```css
/* Source: https://stenciljs.com/docs/styling + CSS custom properties MDN */
/* In src/global/dwc-theme.css */
:root {
  /* DWC token mappings - users can override these */
  --dwc-color-primary: var(--dwc-brand-primary, #0066cc);
  --dwc-color-surface: var(--dwc-neutral-100, #ffffff);
  --dwc-color-text: var(--dwc-neutral-900, #1a1a1a);
  --dwc-spacing-md: var(--dwc-space-4, 1rem);
  --dwc-font-family: var(--dwc-font-sans, system-ui, sans-serif);
}

/* In component CSS */
:host {
  color: var(--dwc-color-text);
  background: var(--dwc-color-surface);
  padding: var(--dwc-spacing-md);
  font-family: var(--dwc-font-family);
}

/* Expose parts for structural overrides */
::part(heading) {
  /* Consumers can style: sp-example::part(heading) { ... } */
}
```

### Pattern 3: Optional Peer Dependency Configuration
**What:** Declare heavy libraries as optional peer dependencies, detected and loaded at runtime only when component is used.

**When to use:** Only for Markdown Editor component (Phase 4) which needs marked, DOMPurify, Prism.js, Turndown.

**Example:**
```json
// Source: https://pnpm.io/next/package_json + npm peer dependencies docs
{
  "peerDependencies": {
    "marked": "^12.0.0 || ^13.0.0",
    "dompurify": "^3.0.0",
    "prismjs": "^1.29.0",
    "turndown": "^7.1.0"
  },
  "peerDependenciesMeta": {
    "marked": { "optional": true },
    "dompurify": { "optional": true },
    "prismjs": { "optional": true },
    "turndown": { "optional": true }
  }
}
```

**Runtime detection pattern:**
```typescript
// In sp-markdown-editor component
async componentWillLoad() {
  try {
    const marked = await import('marked');
    this.markdownParser = marked;
  } catch {
    console.warn('marked not found. Install as peer dependency: npm install marked');
    this.markdownParser = null;
  }
}
```

### Pattern 4: Package.json Exports for Dual Targets
**What:** Conditional exports mapping for both distribution strategies.

**When to use:** Always, enables proper imports for both CDN and bundler consumers.

**Example:**
```json
// Source: https://stenciljs.com/docs/publishing
{
  "name": "@skillspilot/webcomponents",
  "version": "1.0.0",
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.js",
  "es2015": "./dist/esm/index.js",
  "es2017": "./dist/esm/index.js",
  "types": "./dist/types/index.d.ts",
  "unpkg": "dist/skillspilot/skillspilot.esm.js",
  "collection": "dist/collection/collection-manifest.json",
  "collection:main": "dist/collection/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/types/index.d.ts"
    },
    "./loader": {
      "import": "./loader/index.js",
      "require": "./loader/index.cjs.js",
      "types": "./loader/index.d.ts"
    },
    "./dist/custom-elements": {
      "import": "./dist/components/index.js",
      "types": "./dist/components/index.d.ts"
    }
  }
}
```

### Anti-Patterns to Avoid
- **Bundling peer dependencies:** Never include marked, DOMPurify, Prism, Turndown in main bundle. Stencil doesn't support Rollup's `external` option well; use optional peerDependencies instead.
- **Mixing dist and dist-custom-elements imports:** Consumers should use ONE strategy, not both. Provide clear documentation.
- **Over-exposing CSS parts:** Only expose `::part()` for structural elements consumers truly need to style. Too many parts = fragile API.
- **Mutating props:** Stencil doesn't enforce prop immutability at runtime (as of v1.3.3+). Use discipline and linting.
- **Forgetting www output target for Playwright:** Playwright requires `www` output target with copy config for HTML/CSS files.
- **Using `customElementsExportBehavior: 'single-export-module'` with globalScript:** Known bug where globalScript doesn't execute with this option.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Version management | Custom scripts parsing commits | @changesets/cli | Handles monorepo dependencies, changelog generation, semantic versioning |
| Markdown parsing | Custom regex-based parser | marked (peer dep) | Handles edge cases, XSS prevention with DOMPurify, extensibility |
| HTML sanitization | Custom allowlist/blocklist | DOMPurify (peer dep) | Battle-tested XSS protection, actively maintained |
| Syntax highlighting | Custom token parser | Prism.js (peer dep) | Supports 100+ languages, extensible, small core |
| HTML to Markdown | Custom HTML traversal | Turndown (peer dep) | Handles tables, nested lists, edge cases correctly |
| CDN lazy loading | Manual code-splitting logic | Stencil's dist target | Built-in, optimized, generates tiny registry files |
| CI/CD publishing | Manual npm publish scripts | GitHub Actions + changesets/action | Automated version PRs, provenance, security |

**Key insight:** Stencil's compiler-based approach means most build/bundle complexity is handled automatically. Focus on component logic, not tooling.

## Common Pitfalls

### Pitfall 1: Props Must Be Primitives for Attributes
**What goes wrong:** Defining `@Prop()` with complex types (objects, arrays) and expecting them to work via HTML attributes.

**Why it happens:** HTML attributes are always strings. Stencil can only reflect primitive types (string, number, boolean) as attributes.

**How to avoid:** For complex props, consumers must reference the element and assign properties programmatically:
```typescript
const element = document.querySelector('sp-component');
element.complexData = { foo: 'bar' }; // Property assignment, not attribute
```

**Warning signs:** Props with object/array types not updating when set via attributes in HTML.

**Source:** [Stencil Props and Attributes (terodox.tech)](https://terodox.tech/stencil-js-part-3/)

### Pitfall 2: Immutability Not Enforced at Runtime
**What goes wrong:** Modifying `@Prop()` values inside components, causing unexpected behavior.

**Why it happens:** Stencil doesn't enforce `mutable: false` at runtime (as of v1.3.3+), only at compile time with TypeScript.

**How to avoid:** Discipline and ESLint rules. Never mutate props directly; use `@State()` for internal mutations.

**Warning signs:** Props changing unexpectedly, re-renders not triggering correctly.

**Source:** [StencilJS Prop Decorator Issues (terodox.tech)](https://terodox.tech/stencil-js-part-3/)

### Pitfall 3: Missing `www` Output Target Breaks Playwright
**What goes wrong:** Playwright tests fail with "no dev server" errors.

**Why it happens:** Playwright relies on pre-compiled output served by dev server. Requires `www` output target with `copy` config for HTML/CSS.

**How to avoid:** Always include `www` output target in stencil.config.ts when using Playwright:
```typescript
{
  type: 'www',
  copy: [{ src: '**/*.html' }, { src: '**/*.css' }],
}
```

**Warning signs:** Playwright adapter configuration errors, dev server won't start.

**Source:** [Stencil Playwright Overview](https://stenciljs.com/docs/testing/playwright/overview)

### Pitfall 4: CDN Auto-Registration vs Manual Registration Confusion
**What goes wrong:** Components don't register when using `dist-custom-elements` with `customElementsExportBehavior: 'default'`.

**Why it happens:** Default behavior exports `defineCustomElement()` functions but doesn't auto-call them. Requires manual registration.

**How to avoid:** Use `customElementsExportBehavior: 'auto-define-custom-elements'` for automatic registration on import. Document clearly which mode you're using.

**Warning signs:** Components imported but not rendering, "element not defined" errors.

**Source:** [Stencil Custom Elements](https://stenciljs.com/docs/custom-elements)

### Pitfall 5: npm Trusted Publishing Requires npm 11.5.1+ and Node 24.x
**What goes wrong:** Publishing fails with authentication errors despite correct workflow setup.

**Why it happens:** Trusted publishing requires npm 11.5.1+ which ships with Node 24.x. Older Node versions lack OIDC token support.

**How to avoid:** Always use `node-version: '24.x'` in GitHub Actions workflow. Verify with `npm --version` in CI logs.

**Warning signs:** "npm ERR! need auth" despite correct permissions, OIDC token errors.

**Source:** [Bootstrapping NPM Provenance with GitHub Actions (thecandidstartup.org)](https://www.thecandidstartup.org/2026/01/26/bootstrapping-npm-provenance-github-actions.html)

### Pitfall 6: Global Styles Need Manual Import for Light DOM
**What goes wrong:** Global styles apply to shadow DOM components but not light DOM content in `www` output.

**Why it happens:** Stencil auto-injects global styles into shadow roots via constructable stylesheets, but light DOM needs manual `<link>` tag.

**How to avoid:** Import global CSS in index.html for dev environment:
```html
<link rel="stylesheet" href="/build/global.css">
```

**Warning signs:** Theming works in components but not in test HTML pages.

**Source:** [Stencil Styling Documentation](https://stenciljs.com/docs/styling)

### Pitfall 7: Stencil Doesn't Support Rollup's `external` Option
**What goes wrong:** Attempting to use `rollupConfig.inputOptions.external` to exclude peer dependencies from bundle.

**Why it happens:** Stencil's TypeScript types and internal logic don't support the `external` option. It's flagged as an error and ignored.

**How to avoid:** Use `peerDependencies` + `peerDependenciesMeta` in package.json instead. For `dist-custom-elements`, `externalRuntime: true` marks `@stencil/core/*` as external.

**Warning signs:** TypeScript errors when adding `external` config, peer deps still bundled.

**Source:** [Stencil Issue #3226: rollup's 'external' option not supported](https://github.com/ionic-team/stencil/issues/3226)

## Code Examples

Verified patterns from official sources:

### DWC Theme with Component-Level Override
```typescript
// Source: https://stenciljs.com/docs/styling + context decisions
import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'sp-example',
  styleUrl: 'sp-example.css',
  shadow: true,
})
export class SpExample {
  @Prop() theme: 'light' | 'dark' | 'auto' = 'auto';

  render() {
    const hostClass = this.theme !== 'auto' ? `theme-${this.theme}` : '';

    return (
      <div class={hostClass} part="container">
        <h1 part="heading">Example Component</h1>
        <p part="content">Respects DWC tokens with standalone fallbacks</p>
      </div>
    );
  }
}
```

```css
/* sp-example.css */
:host {
  /* DWC tokens with fallbacks */
  --sp-color-bg: var(--dwc-color-surface, #ffffff);
  --sp-color-text: var(--dwc-color-text, #1a1a1a);
  --sp-color-primary: var(--dwc-color-primary, #0066cc);

  display: block;
  background: var(--sp-color-bg);
  color: var(--sp-color-text);
}

/* Component-level theme override */
:host(.theme-dark) {
  --sp-color-bg: #1a1a1a;
  --sp-color-text: #ffffff;
}

:host(.theme-light) {
  --sp-color-bg: #ffffff;
  --sp-color-text: #1a1a1a;
}

::part(heading) {
  color: var(--sp-color-primary);
}
```

### Changesets GitHub Actions Workflow
```yaml
# Source: https://github.com/changesets/changesets + npm trusted publishing docs
name: Release

on:
  push:
    branches:
      - main

permissions:
  contents: write
  pull-requests: write
  id-token: write # Required for npm provenance

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '24.x'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm run build
      - run: npm test

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: npm run release
          version: npm run version
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Playwright E2E Test Example
```typescript
// Source: https://stenciljs.com/docs/testing/playwright/overview
import { test, expect } from '@stencil/playwright';

test.describe('sp-example', () => {
  test('should render with DWC theme', async ({ page }) => {
    await page.setContent('<sp-example></sp-example>');

    const component = page.locator('sp-example');
    await expect(component).toBeVisible();

    const heading = component.locator('[part="heading"]');
    await expect(heading).toHaveText('Example Component');
  });

  test('should apply theme attribute override', async ({ page }) => {
    await page.setContent('<sp-example theme="dark"></sp-example>');

    const component = page.locator('sp-example');
    const container = component.locator('[part="container"]');

    await expect(container).toHaveClass(/theme-dark/);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| dist-custom-elements-bundle | dist-custom-elements with customElementsExportBehavior | Stencil v2.12.0 (2021) | Better tree-shaking, explicit control over auto-registration |
| npm classic tokens | npm trusted publishing (OIDC) | GA July 2025 | Eliminates token management, automatic provenance |
| Stencil Test Runner only | Stencil Test Runner + Playwright | Stencil v4.13.0 (2024) | Modern E2E testing across all browsers, experimental |
| Jest v27-29 built-in | Jest v30+ support | Stencil v4.x | Newer Jest features, standalone unit testing |
| Manual changeset management | changesets/action automation | ~2020 | Automated version PRs, reduces human error |

**Deprecated/outdated:**
- **dist-custom-elements-bundle:** Deprecated in v2.12.0, replaced by `dist-custom-elements` with better tree-shaking
- **rollupConfig.inputOptions.external:** Never fully supported, use peerDependencies instead
- **npm classic tokens:** Being phased out in favor of trusted publishing with OIDC
- **Manual component registration in bundle mode:** Use `customElementsExportBehavior: 'auto-define-custom-elements'` for simpler DX

## Open Questions

Things that couldn't be fully resolved:

1. **Exact DWC token list and versioning**
   - What we know: DWC uses CSS custom properties for colors, typography, spacing
   - What's unclear: Complete token reference documentation, DWC version compatibility, breaking changes
   - Recommendation: Start with core tokens (--dwc-color-*, --dwc-spacing-*, --dwc-font-*), expand as needed. Test with DWC loaded and unloaded.

2. **Optimal peer dependency version ranges**
   - What we know: `peerDependencies` supports semver ranges like `^12.0.0 || ^13.0.0`
   - What's unclear: Best practice for major version tolerance (allow both v12 and v13, or strict?)
   - Recommendation: Use caret ranges for single major version (`^12.0.0`), test explicitly. Update peer deps when breaking changes occur.

3. **CDN loading strategy for peer dependencies**
   - What we know: Peer deps marked optional won't auto-install, runtime detection needed
   - What's unclear: Best UX for CDN users missing peer deps (error, warning, graceful degradation?)
   - Recommendation: Console warning + graceful degradation for Markdown Editor. Display error message in component UI: "Install marked to enable markdown rendering."

4. **GitHub organization creation timing**
   - What we know: Repo doesn't exist yet, npm publish under ~howdydoody, may need @skillspilot org
   - What's unclear: Create @skillspilot npm org now or publish under ~howdydoody first?
   - Recommendation: Publish v0.x under ~howdydoody for testing, create @skillspilot org before v1.0.0 launch.

## Sources

### Primary (HIGH confidence)
- [Stencil.js Official Documentation](https://stenciljs.com/docs/introduction) - Introduction, version 4.41, core capabilities
- [Stencil Output Targets](https://stenciljs.com/docs/output-targets) - dist, www, dist-custom-elements configuration
- [Stencil Config Documentation](https://stenciljs.com/docs/config) - globalStyle, output targets, TypeScript setup
- [Stencil Styling Documentation](https://stenciljs.com/docs/styling) - CSS custom properties, theming, ::part() selectors
- [Stencil Distribution Guide](https://stenciljs.com/docs/distribution) - Publishing to npm, CDN setup, loader functionality
- [Stencil Testing Overview](https://stenciljs.com/docs/testing-overview) - Jest, Playwright, test runner support
- [Stencil Publishing Guide](https://stenciljs.com/docs/publishing) - package.json exports, dual targets, type definitions
- [Stencil Custom Elements](https://stenciljs.com/docs/custom-elements) - dist-custom-elements, customElementsExportBehavior options
- [Stencil Playwright Overview](https://stenciljs.com/docs/testing/playwright/overview) - Installation, configuration, requirements
- [Stencil FAQ](https://stenciljs.com/docs/faq) - Common questions, best practices, gotchas
- [Stencil Module Bundling](https://stenciljs.com/docs/module-bundling) - Rollup integration, external dependencies
- [Changesets GitHub Repository](https://github.com/changesets/changesets) - Installation, workflow, GitHub Actions integration
- [npm package.json Documentation](https://pnpm.io/next/package_json) - peerDependenciesMeta, optional peer dependencies
- [MDN: Using CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) - Fallback values, var() syntax

### Secondary (MEDIUM confidence)
- [Stencil dist vs dist-custom-elements Deep Dive](https://techblog.skeepers.io/stenciljs-a-deep-dive-on-the-inner-workings-of-output-targets-91199ace026e) - Output target internals, lazy loading vs tree-shaking
- [Changesets Documentation Site](https://changesets-docs.vercel.app/) - Overview, features, monorepo support
- [CSS Custom Properties API Guide (Cory Rylan)](https://coryrylan.com/blog/simple-css-custom-property-apis-with-web-components) - Web components theming patterns
- [GitHub Actions Building Node.js](https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs) - Standard Node.js CI workflow
- [npm Trusted Publishing Documentation](https://docs.npmjs.com/trusted-publishers/) - Setup, configuration, GitHub Actions integration
- [Bootstrapping NPM Provenance with GitHub Actions](https://www.thecandidstartup.org/2026/01/26/bootstrapping-npm-provenance-github-actions.html) - 2026 guide, npm 11.5.1 requirements, workflow setup
- [CSS Shadow Parts Guide](https://css-tricks.com/styling-in-the-shadow-dom-with-css-shadow-parts/) - ::part() best practices, exposing parts
- [Testing in 2026: Jest, React Testing Library, and Full Stack Testing Strategies](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies) - Modern testing approaches
- [Stencil Playwright Blog Post](https://ionic.io/blog/testing-stencil-components-with-ease-using-playwright) - Playwright adapter usage
- [Advanced Stencil Component Styling](https://ionic.io/blog/advanced-stencil-component-styling) - Global styles, theming strategies

### Tertiary (LOW confidence - WebSearch only, marked for validation)
- [StencilJS Props and Decorators](https://terodox.tech/stencil-js-part-3/) - @Prop, @Watch, @Method gotchas, immutability issues
- [Building Web Components with Stencil](https://dyte.io/blog/web-components-using-stencil/) - Project structure, folder organization
- [Stencil GitHub Issue #3226](https://github.com/ionic-team/stencil/issues/3226) - Rollup external option not supported
- [Stencil GitHub Issue #2512](https://github.com/stenciljs/core/issues/2512) - RFC for peer dependencies/external components config
- [Docusaurus in Monorepo Discussion](https://github.com/facebook/docusaurus/discussions/9992) - Separate folder approach for Docusaurus
- [Monorepo Best Practices 2026](https://medium.com/@sanjaytomar717/the-ultimate-guide-to-building-a-monorepo-in-2025-sharing-code-like-the-pros-ee4d6d56abaa) - General monorepo strategies

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Stencil docs, npm docs, GitHub Actions official docs all verified
- Architecture: HIGH - Stencil official docs provide clear patterns, verified with multiple sources
- Pitfalls: MEDIUM - Mix of official docs (HIGH) and community blog posts (MEDIUM), all cross-referenced
- Peer dependencies: MEDIUM - npm docs verified (HIGH) but Stencil-specific integration needs validation
- DWC integration: LOW - DWC token reference not found, pattern based on general CSS custom property best practices

**Research date:** 2026-01-31
**Valid until:** ~2026-03-31 (60 days - Stencil is stable, not fast-moving)

**Areas needing validation during planning:**
1. DWC token naming conventions and complete token list
2. Optimal peer dependency version ranges for marked, DOMPurify, Prism, Turndown
3. Exact npm org creation workflow (@skillspilot vs ~howdydoody)
4. GitHub repo creation and initial structure decisions
