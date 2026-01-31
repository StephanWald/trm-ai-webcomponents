# Technology Stack for @skillspilot/webcomponents

**Research Date:** January 30, 2026
**Project:** Stencil.js Web Component Library (sp-* prefix)
**Distribution:** npm + CDN (unpkg/jsdelivr)
**Documentation:** Docusaurus on GitHub Pages

---

## Executive Summary

This stack recommendation focuses on the **standard 2025/2026 toolchain** for building production-ready Stencil.js web component libraries. The approach prioritizes:

1. **Stability over bleeding edge** - Using mature, well-tested versions
2. **Official tooling first** - Leveraging Stencil's built-in capabilities
3. **Minimal dependencies** - Only essential packages for the specified requirements
4. **Security by default** - Especially for markdown/HTML sanitization
5. **Modern standards** - ES modules, TypeScript 5.x, Jest 30+

---

## 1. Core Framework

### Stencil.js
- **Version:** `4.41.1` (January 2026)
- **Confidence:** ✅ **High** - Latest stable release
- **Rationale:**
  - v4.41.1 adds `jsxImportSource` support (no more manual `h` imports)
  - Built on TypeScript + JSX + Web Component standards
  - Framework-agnostic output (React, Angular, Vue wrappers available)
  - Enterprise-proven by Ionic team
  - Includes compiler, dev server, and testing utilities
- **Installation:** `npm install @stencil/core@4.41.1`
- **Why NOT v3.x:** Missing recent TypeScript improvements and JSX enhancements

**Source:** [Stencil Releases](https://github.com/stenciljs/core/releases)

---

## 2. Language & Type System

### TypeScript
- **Version:** `5.8.3` (latest stable, February 2025)
- **Confidence:** ✅ **High**
- **Rationale:**
  - `--erasableSyntaxOnly` flag for safer compilation
  - Improved conditional return type checking
  - Better Node.js ESM support (`--module nodenext`)
  - Stable `--module node18` flag
  - Full Stencil JSX integration
- **Why NOT 5.9:** Still in development, not stable until Q2 2026
- **Installation:** `npm install typescript@5.8.3 --save-dev`

**Source:** [TypeScript 5.8 Release](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/)

---

## 3. Build & Bundling

### Rollup (via Stencil)
- **Version:** Managed by `@stencil/core` (no manual installation needed)
- **Confidence:** ✅ **High**
- **Rationale:**
  - Stencil uses Rollup internally for efficient code splitting
  - Zero-config for standard component libraries
  - Built-in tree-shaking and ES module support
  - Custom plugins can be added via `stencil.config.ts` if needed
- **Why NOT Vite directly:**
  - Vite integration with Stencil has known issues (GitHub #5654, #5637)
  - Rollup is battle-tested within Stencil's architecture
  - Vite better suited for consuming Stencil components, not building them

**Source:** [Stencil Module Bundling](https://stenciljs.com/docs/module-bundling)

---

## 4. Testing

### Jest (via Stencil Test Runner)
- **Version:** Jest 30+ (via `@stencil/core`)
- **Confidence:** ✅ **High**
- **Rationale:**
  - Stencil provides `@stencil/core/testing` with Jest runner for v30+
  - `newSpecPage()` for fast unit tests (no Puppeteer overhead)
  - Built-in mocking, snapshots, and coverage
  - Runs via `stencil test --spec`
  - Zero additional configuration for most use cases
- **Why NOT Jest v29:** Stencil's new runner requires Jest 30+
- **Installation:** Included with `@stencil/core`

**Source:** [Stencil Jest Documentation](https://stenciljs.com/docs/testing/jest)

### Playwright (for E2E testing)
- **Version:** Latest stable (via `@stencil/playwright`)
- **Confidence:** ⚠️ **Medium** - Experimental adapter
- **Rationale:**
  - Stencil is migrating from Puppeteer to Playwright
  - Multi-browser support (Chrome, Firefox, WebKit)
  - Modern async API, better debugging
  - Requires Stencil 4.13.0+
  - Supports `goto()` and `setContent()` test patterns
- **Why NOT Puppeteer:**
  - Puppeteer version locked to Stencil's dependency
  - Playwright offers better flexibility and cross-browser testing
  - Industry trend moving to Playwright for E2E
- **Installation:** `npm install @stencil/playwright --save-dev`
- **Note:** Still experimental - expect potential breaking changes

**Sources:**
- [Stencil Playwright E2E](https://stenciljs.com/docs/next/testing/playwright/e2e-testing)
- [Stencil Playwright Adapter](https://github.com/stenciljs/playwright)

---

## 5. Code Quality & Formatting

### ESLint
- **Version:** `9.x` (latest)
- **Plugin:** `@stencil/eslint-plugin` (official Stencil rules)
- **Confidence:** ✅ **High**
- **Rationale:**
  - Catches Stencil-specific issues (component lifecycle, decorators, etc.)
  - Supports flat config format (ESLint 9+)
  - TypeScript-aware via `@typescript-eslint/parser`
- **Installation:**
  ```bash
  npm install eslint @stencil/eslint-plugin @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev
  ```

**Source:** [Stencil ESLint Plugin](https://github.com/ionic-team/stencil-eslint)

### Prettier
- **Version:** Latest stable (3.x)
- **Confidence:** ✅ **High**
- **Rationale:**
  - Industry-standard code formatter
  - Works seamlessly with ESLint via `eslint-config-prettier`
  - Zero-config for most TypeScript/JSX projects
- **Installation:**
  ```bash
  npm install prettier eslint-config-prettier --save-dev
  ```
- **Key Package:** `eslint-config-prettier@10.1.8` disables conflicting ESLint rules

**Source:** [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier)

---

## 6. Documentation

### Docusaurus
- **Version:** `3.9.2` (latest stable, October 2025)
- **Confidence:** ✅ **High**
- **Rationale:**
  - Built for documentation sites (vs. general static generators)
  - MDX support (embed React components in Markdown)
  - Built-in versioning, search (Algolia), and i18n
  - Docs-as-code workflow (lives in Git repo)
  - React 19 support
  - GitHub Pages deployment via GitHub Actions
- **Installation:**
  ```bash
  npx create-docusaurus@latest docs classic
  npm install @docusaurus/core@3.9.2
  ```
- **Why NOT alternatives:**
  - VitePress: Vue-focused, less feature-rich for component libraries
  - Nextra: Newer, less mature ecosystem
  - GitBook: Not self-hosted, vendor lock-in

**Source:** [Docusaurus](https://docusaurus.io/)

---

## 7. Component Dependencies

### Markdown Editor Component Dependencies

#### marked
- **Version:** `17.0.1` (latest, November 2025)
- **Confidence:** ✅ **High**
- **Rationale:**
  - Fast, spec-compliant Markdown parser
  - 10,453+ npm dependents
  - Active maintenance
  - **Critical:** Does NOT sanitize output - must pair with DOMPurify

#### DOMPurify
- **Version:** `3.3.1` (latest, December 2025)
- **Confidence:** ✅ **High** - Security-critical
- **Rationale:**
  - Industry-standard XSS sanitizer
  - 23M+ weekly npm downloads
  - DOM-only, fast, configurable
  - Supports HTML, MathML, SVG
  - Node.js 18.x–25.x support via jsdom
  - **Non-negotiable for marked output**
- **Security Note:** Always sanitize marked output through DOMPurify before rendering

**Source:** [Using Markdown Securely](https://neworbit.co.uk/using-markdown-securely/)

#### Prism.js
- **Version:** `1.30.0` (latest, March 2025)
- **Confidence:** ⚠️ **Medium** - Slow updates
- **Rationale:**
  - Lightweight, extensible syntax highlighter
  - 4,987+ npm dependents
  - Supports 200+ languages
  - **Note:** Maintainers working on Prism v2, only accepting security PRs for v1
- **Alternatives to consider:**
  - `highlight.js` - More actively maintained
  - `shiki` - Modern, VS Code themes, better TypeScript support

#### Turndown
- **Version:** `7.2.2` (latest, October 2025)
- **Confidence:** ✅ **High**
- **Rationale:**
  - Converts HTML back to Markdown
  - 1,277+ npm dependents
  - Stable, mature library

**Sources:**
- [marked npm](https://www.npmjs.com/package/marked)
- [DOMPurify npm](https://www.npmjs.com/package/dompurify)
- [prismjs npm](https://www.npmjs.com/package/prismjs)
- [turndown npm](https://www.npmjs.com/package/turndown)

---

## 8. Distribution & CDN

### npm Publishing
- **Registry:** npmjs.com
- **Package Scope:** `@skillspilot/webcomponents`
- **Confidence:** ✅ **High**
- **Rationale:**
  - Industry standard for component libraries
  - Supports scoped packages (organization branding)
  - Semantic versioning support
  - Works with all package managers (npm, yarn, pnpm)

### CDN Strategy

#### jsDelivr (Primary)
- **URL Pattern:** `https://cdn.jsdelivr.net/npm/@skillspilot/webcomponents@{version}/{file}`
- **Confidence:** ✅ **High** - Recommended primary
- **Rationale:**
  - Multi-CDN strategy (Cloudflare + Fastly)
  - Sub-50ms TTFB globally in 2026 tests
  - Auto-fallback if one provider fails
  - 150B+ requests/month
  - Free for open-source
  - Supports ES modules, semver ranges, version pinning

#### unpkg (Secondary/Fallback)
- **URL Pattern:** `https://unpkg.com/@skillspilot/webcomponents@{version}/{file}`
- **Confidence:** ⚠️ **Medium** - Backup option
- **Rationale:**
  - Cloudflare Workers-based
  - Automatic npm mirror (available within minutes)
  - Marginally higher latency than jsDelivr in multi-continent tests
  - Good for unpkg-specific use cases
- **Why jsDelivr is preferred:** Better global performance and multi-CDN reliability

**Configuration in package.json:**
```json
{
  "unpkg": "dist/webcomponents/webcomponents.esm.js",
  "jsdelivr": "dist/webcomponents/webcomponents.esm.js"
}
```

**Sources:**
- [jsDelivr vs unpkg Comparison](https://blog.blazingcdn.com/en-us/javascript-cdn-latency-shootout-cdnjs-jsdelivr-unpkg-skypack)
- [jsDelivr](https://www.jsdelivr.com/)

---

## 9. Version Management & Release Automation

### Changesets
- **Version:** `@changesets/cli@2.29.8` (latest, November 2025)
- **Confidence:** ✅ **High** - Recommended over semantic-release
- **Rationale:**
  - Designed for component libraries and monorepos
  - Manual changeset creation = better control vs. conventional commits
  - Generates changelogs automatically
  - Supports independent versioning
  - `npx changeset publish` handles npm publication
  - Better for teams reviewing PRs with explicit version intent
- **Why NOT semantic-release:**
  - Fully automated (less control)
  - Requires strict conventional-commits discipline
  - Overkill for greenfield projects with small teams
  - Changesets better for "greenfield with control" approach

**Workflow:**
1. Developer runs `npx changeset` in PR
2. Selects version bump (major/minor/patch) and adds description
3. PR review includes changeset file
4. On merge to main, GitHub Action runs `changeset version`
5. Separate "Version Packages" PR created
6. On merge, `changeset publish` releases to npm

**Source:** [Changesets vs semantic-release](https://oleksiipopov.com/blog/npm-release-automation/)

---

## 10. CI/CD & Automation

### GitHub Actions
- **Confidence:** ✅ **High**
- **Rationale:**
  - Native GitHub integration
  - Free for public repos
  - NPM Trusted Publishers support (provenance statements)
  - No long-lived tokens needed
- **Key Workflows:**
  1. **Test & Build:** On PR/push
  2. **Release:** Via Changesets on version PR merge
  3. **Deploy Docs:** Docusaurus to GitHub Pages

**Modern Approach (2026):**
- Use **NPM Trusted Publishers** instead of access tokens
- Automatic provenance statements
- Configured per-package in npmjs.com UI
- Requires manual initial publish, then fully automated

**Example Publish Step:**
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    registry-url: 'https://registry.npmjs.org'
- run: npm publish --provenance
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NODE_AUTH_TOKEN }}
```

**Sources:**
- [NPM Provenance with GitHub Actions](https://www.thecandidstartup.org/2026/01/26/bootstrapping-npm-provenance-github-actions.html)
- [GitHub Actions npm Publish](https://github.com/marketplace/actions/npm-publish)

---

## 11. CSS Theming Strategy

### CSS Custom Properties (Variables)
- **Pattern:** `--dwc-*` prefix (e.g., `--dwc-primary-color`)
- **Confidence:** ✅ **High**
- **Rationale:**
  - Native browser support (no build step)
  - Pierces Shadow DOM boundaries
  - Acts as component "theming API"
  - Consumer can override at `:root` or component level
  - **Do NOT over-engineer:** Avoid excessive variables (old anti-pattern)
- **Complement with CSS Shadow Parts:**
  - `::part()` for structural styling beyond color/spacing
  - More flexibility than variables alone

**Best Practice (2026):**
```css
/* Component internal */
:host {
  color: var(--dwc-text-color, #333);
  background: var(--dwc-bg-color, #fff);
}

/* Consumer override */
:root {
  --dwc-text-color: #000;
  --dwc-bg-color: #f5f5f5;
}
```

**Sources:**
- [Web Component Theming Best Practices](https://cianfrani.dev/posts/web-component-best-practices/)
- [CSS Custom Properties in Web Components](https://coryrylan.com/blog/simple-css-custom-property-apis-with-web-components)

---

## 12. Framework Wrappers (Optional)

### React Output Target
- **Package:** `@stencil/react-output-target`
- **Confidence:** ⚠️ **Medium** - Optional, add if needed
- **Rationale:**
  - Generates React functional component wrappers
  - Auto-binds custom events and properties
  - TypeScript support
  - Requires `dist-custom-elements` output target
  - Built on `@lit/react`
  - Supports SSR (Next.js compatible)
- **When to use:** If significant React consumer base
- **When to skip:** If web components used directly (native support in React 19+)

**Configuration:**
```typescript
import { reactOutputTarget } from '@stencil/react-output-target';

export const config: Config = {
  outputTargets: [
    { type: 'dist-custom-elements' },
    reactOutputTarget({
      outDir: '../react-library/src/',
    }),
  ],
};
```

**Source:** [Stencil React Integration](https://stenciljs.com/docs/react)

---

## 13. What NOT to Use

### ❌ Avoid These

1. **Vite as primary bundler for Stencil:**
   - Known issues with Stencil integration (2024-2025)
   - Use for consuming components, not building them

2. **Puppeteer for new E2E tests:**
   - Version locked to Stencil dependency
   - Playwright offers better flexibility

3. **semantic-release (unless strict conventional-commits workflow):**
   - Too automated for most component library teams
   - Changesets provides better control

4. **Prism.js alternatives to evaluate (for new projects):**
   - Consider `shiki` or `highlight.js` for better maintenance
   - Prism v1 only receiving security updates

5. **Old Stencil patterns:**
   - Manual `h` imports (fixed in 4.41.0)
   - `dist` output target (use `dist-custom-elements` for tree-shaking)

6. **Experimental/alpha tools:**
   - Bleeding-edge bundlers (wait for Stencil support)
   - Unproven testing frameworks

---

## 14. Package.json Configuration

### Recommended Fields
```json
{
  "name": "@skillspilot/webcomponents",
  "version": "0.1.0",
  "description": "Opinionated web components for Skillspilot/TRM-AI platform",
  "main": "dist/index.cjs.js",
  "module": "dist/index.js",
  "types": "dist/types/index.d.ts",
  "unpkg": "dist/webcomponents/webcomponents.esm.js",
  "jsdelivr": "dist/webcomponents/webcomponents.esm.js",
  "files": [
    "dist/",
    "loader/"
  ],
  "scripts": {
    "build": "stencil build",
    "start": "stencil build --dev --watch --serve",
    "test": "stencil test --spec",
    "test.watch": "stencil test --spec --watch",
    "test.e2e": "stencil test --e2e",
    "lint": "eslint src/**/*.{ts,tsx}",
    "format": "prettier --write src/**/*.{ts,tsx,css}"
  },
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
    }
  }
}
```

---

## 15. Dependency Summary Table

| Category | Package | Version | Type | Confidence |
|----------|---------|---------|------|------------|
| **Core** | @stencil/core | 4.41.1 | dependency | ✅ High |
| **Language** | typescript | 5.8.3 | devDependency | ✅ High |
| **Testing** | (via @stencil/core) | Jest 30+ | included | ✅ High |
| **E2E** | @stencil/playwright | latest | devDependency | ⚠️ Medium |
| **Linting** | eslint | 9.x | devDependency | ✅ High |
| | @stencil/eslint-plugin | latest | devDependency | ✅ High |
| | @typescript-eslint/parser | latest | devDependency | ✅ High |
| | @typescript-eslint/eslint-plugin | latest | devDependency | ✅ High |
| **Formatting** | prettier | 3.x | devDependency | ✅ High |
| | eslint-config-prettier | 10.1.8 | devDependency | ✅ High |
| **Markdown** | marked | 17.0.1 | dependency | ✅ High |
| | dompurify | 3.3.1 | dependency | ✅ High |
| | prismjs | 1.30.0 | dependency | ⚠️ Medium |
| | turndown | 7.2.2 | dependency | ✅ High |
| **Docs** | @docusaurus/core | 3.9.2 | devDependency | ✅ High |
| **Release** | @changesets/cli | 2.29.8 | devDependency | ✅ High |

---

## 16. Security Considerations

### Critical
1. **Always sanitize marked output with DOMPurify** before rendering to DOM
2. **Use NPM Trusted Publishers** for GitHub Actions (no long-lived tokens)
3. **Keep DOMPurify updated** (security-critical dependency)
4. **Enable provenance statements** in npm publish

### Recommended
1. Run `npm audit` in CI pipeline
2. Use `eslint-plugin-security` for static analysis
3. Configure CSP headers for Docusaurus site
4. Review Dependabot PRs promptly (especially security patches)

---

## 17. Migration Notes

### From Vanilla JS to Stencil
- Existing components (~11.6k LOC total) will require refactoring
- Stencil uses decorators (`@Component`, `@Prop`, `@Event`, etc.)
- Shadow DOM by default (can be disabled per component)
- Lifecycle methods differ from vanilla JS patterns

### Testing Migration
- Stencil's `newSpecPage()` replaces manual JSDOM setup
- Event testing uses `@stencil/core/testing` utilities
- Coverage reports built-in via Jest

---

## 18. Performance Optimizations

### Built-in (Stencil handles)
- Lazy loading of components
- Tree-shaking via `dist-custom-elements`
- Automatic code splitting
- Dead code elimination

### Manual (if needed)
- Use `async` lifecycle methods for heavy operations
- Debounce expensive `@Watch` handlers
- Optimize Prism.js bundle (load languages dynamically)

---

## 19. Accessibility

### Standards
- Use semantic HTML in component templates
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Follow WCAG 2.1 AA guidelines

### Tools
- `eslint-plugin-jsx-a11y` (add to ESLint config)
- `axe-core` for automated testing
- Lighthouse CI in GitHub Actions

---

## 20. Roadmap Integration

### Phase 1: Foundation (Weeks 1-2)
- Set up Stencil project with TypeScript 5.8
- Configure ESLint + Prettier
- Initialize Docusaurus
- Set up GitHub Actions (build + test)

### Phase 2: Port Components (Weeks 3-6)
- Migrate Markdown Editor (marked, DOMPurify, Prism, Turndown)
- Migrate Walkthrough
- Migrate OrgChart
- Write unit tests for each

### Phase 3: Documentation (Week 7)
- Write Docusaurus component docs
- Add live demos
- Document theming API (--dwc-* variables)

### Phase 4: Release Automation (Week 8)
- Set up Changesets
- Configure npm publishing via GitHub Actions
- Test CDN distribution (jsDelivr + unpkg)
- Add provenance statements

---

## Sources

- [Stencil Documentation](https://stenciljs.com/docs/introduction)
- [Stencil GitHub Releases](https://github.com/stenciljs/core/releases)
- [TypeScript 5.8 Release](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/)
- [Docusaurus](https://docusaurus.io/)
- [Stencil Jest Testing](https://stenciljs.com/docs/testing/jest)
- [Stencil Playwright Adapter](https://github.com/stenciljs/playwright)
- [Stencil ESLint Plugin](https://github.com/ionic-team/stencil-eslint)
- [npm: marked](https://www.npmjs.com/package/marked)
- [npm: DOMPurify](https://www.npmjs.com/package/dompurify)
- [npm: prismjs](https://www.npmjs.com/package/prismjs)
- [npm: turndown](https://www.npmjs.com/package/turndown)
- [npm: @changesets/cli](https://www.npmjs.com/package/@changesets/cli)
- [jsDelivr vs unpkg Performance](https://blog.blazingcdn.com/en-us/javascript-cdn-latency-shootout-cdnjs-jsdelivr-unpkg-skypack)
- [Using Markdown Securely](https://neworbit.co.uk/using-markdown-securely/)
- [Web Component Theming Best Practices](https://cianfrani.dev/posts/web-component-best-practices/)
- [NPM Provenance with GitHub Actions](https://www.thecandidstartup.org/2026/01/26/bootstrapping-npm-provenance-github-actions.html)
- [Stencil React Integration](https://stenciljs.com/docs/react)
- [Changesets vs semantic-release](https://oleksiipopov.com/blog/npm-release-automation/)

---

**Document Version:** 1.0
**Last Updated:** January 30, 2026
**Reviewed By:** Claude Code Research Agent
