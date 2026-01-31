# Project Research Summary

**Project:** @skillspilot/webcomponents
**Domain:** Stencil.js Web Component Library
**Researched:** 2026-01-30
**Confidence:** HIGH

## Executive Summary

This project involves building a modern, framework-agnostic web component library using Stencil.js for the Skillspilot/TRM-AI platform. The library will include three initial components (Markdown Editor, Walkthrough, OrgChart) distributed via npm and CDN with comprehensive documentation on GitHub Pages. Based on extensive research, the recommended approach is a **monorepo structure** with dual distribution targets (lazy-loaded CDN and tree-shakeable npm), peer dependencies for heavy libraries (marked, DOMPurify, Prism.js, Turndown), and CSS custom properties using the existing `--dwc-*` prefix for theming.

The stack centers on **Stencil 4.41.1** (latest stable with jsxImportSource support), **TypeScript 5.8.3**, **Jest 30+** for testing, and **Docusaurus 3.9.2** for documentation. The architecture follows web component best practices with Shadow DOM, framework wrappers for React/Vue/Angular, and automated release management via Changesets. Key competitive advantages come from accessibility-first design (WCAG 2.1 AA compliance), performance budgets, and interactive component playgrounds.

The primary risks involve **peer dependency management** (avoiding 95KB+ bundle bloat), **Shadow DOM event retargeting** (breaking drag-and-drop), and **Docusaurus SSR integration** (window is not defined errors). These are mitigated through explicit peer dependency configuration, `event.composedPath()` patterns, and JSON-based documentation generation. The recommended build order is infrastructure first, then simple-to-complex components (OrgChart → Walkthrough → Markdown Editor) to validate patterns early and defer complex porting until architecture is proven.

## Key Findings

### Recommended Stack

The research identified a **stability-focused 2025/2026 toolchain** prioritizing official tooling over bleeding-edge alternatives. Stencil 4.41.1 provides enterprise-grade web component compilation with built-in lazy loading, multiple distribution strategies, and comprehensive testing utilities. TypeScript 5.8.3 offers improved ESM support and safer compilation flags. The build pipeline uses Rollup (via Stencil) rather than Vite due to known integration issues.

**Core technologies:**
- **Stencil.js 4.41.1**: Framework-agnostic compiler with JSX support, lazy loading, multiple output targets — chosen for maturity and Ionic team backing
- **TypeScript 5.8.3**: Type safety with latest ESM improvements — stable production release
- **Jest 30+**: Unit testing via Stencil's built-in runner with `newSpecPage()` — zero-config integration
- **Playwright**: E2E testing via `@stencil/playwright` adapter — replacing deprecated Puppeteer for multi-browser support
- **Docusaurus 3.9.2**: Documentation with MDX, versioning, and GitHub Pages deployment — purpose-built for component libraries
- **Changesets**: Version management and changelog generation — better control than semantic-release
- **marked 17.0.1 + DOMPurify 3.3.1**: Markdown parsing with mandatory XSS sanitization — peer dependencies to reduce bundle size
- **jsDelivr**: Primary CDN with multi-provider fallback — superior global performance over unpkg

**Critical version requirements:**
- Stencil 4.13.0+ required for Playwright support
- TypeScript 5.8.x for stable `--module nodenext`
- DOMPurify 3.3.1 for security-critical sanitization (must stay current)

**Security considerations:**
- Always sanitize marked output with DOMPurify before rendering
- Use NPM Trusted Publishers for GitHub Actions (no long-lived tokens)
- Enable provenance statements in npm publish

### Expected Features

Research revealed that **developer experience, accessibility, and documentation quality** are the primary differentiators for component libraries in 2026, not just feature count. Framework independence is now table stakes rather than competitive advantage.

**Must have (table stakes):**
- **TypeScript support**: Full `.d.ts` generation — Stencil handles automatically
- **NPM distribution with tree-shaking**: ESM format with `sideEffects: false` — prevents 51.9kB+ waste
- **WCAG 2.1 Level AA compliance**: ARIA, keyboard navigation, screen reader support — non-negotiable in 2026
- **Responsive design**: Mobile-first CSS, touch-friendly targets (44x44px minimum)
- **Framework-agnostic distribution**: Works in React, Vue, Angular, vanilla JS — Stencil's core value
- **CSS custom properties theming**: `--dwc-*` prefix following design token hierarchy — already in use
- **Component documentation with live examples**: Auto-generated prop tables, interactive demos, code snippets
- **Semantic versioning with changelog**: SemVer 2.0 with automated tooling — prevents breaking changes without notice
- **Basic unit testing**: 70% coverage minimum for core logic — regression prevention
- **Browser support policy**: Last 2 versions of evergreen browsers — clearly documented

**Should have (competitive differentiators):**
- **Interactive component playground**: In-browser editor with live preview — increases adoption rates
- **Automated accessibility testing**: axe-core in CI with blocking failures — demonstrates quality commitment
- **Multi-theme support**: Beyond light/dark (high-contrast, brand themes) — shows theming isn't afterthought
- **Performance budget enforcement**: Per-component size limits in CI — prevents bloat accumulation
- **Real-world example applications**: Full demos showing components together — builds confidence

**Defer (v2+):**
- **Migration codemods**: jscodeshift transforms for breaking changes — high effort, needed only when breaking changes occur
- **Figma integration**: Design token sync and component mirroring — requires design team collaboration
- **Framework-specific wrapper packages**: Idiomatic React/Vue wrappers — wait for user demand
- **Visual regression testing**: Chromatic/Percy screenshots — valuable but expensive for initial release
- **Custom icon library**: Design and maintain icon set — not core competency, use slots for standard icon libs

### Architecture Approach

The architecture follows a **monorepo structure with packages/components and packages/docs** to maintain tight coupling while enabling independent versioning. Stencil's compiler generates two output targets: `dist` (lazy-loaded for CDN users) and `dist-custom-elements` (tree-shakeable for bundler users). Components communicate via props (parent → child), CustomEvents (child → parent), and consume shared theming via `--dwc-*` CSS custom properties defined in `globals/theme.css`.

**Major components:**
1. **sp-markdown-editor** (7k LOC): WYSIWYG/source/split modes with toolbar, voice dictation, import/export — peer depends on marked, DOMPurify, Prism.js, Turndown (95KB total if bundled, 25KB if external)
2. **sp-walkthrough** (3.6k LOC): Interactive scene timeline with DOM element highlighting — may peer depend on video/timeline libraries, requires careful DOM scoping
3. **sp-org-chart** (1k LOC): Hierarchical tree with drag-and-drop, filtering — fully self-contained, no external dependencies

**Key patterns:**
- **Peer dependencies for heavy libraries**: Avoid bundling marked/DOMPurify/Prism/Turndown — documented in package.json peerDependencies
- **Shadow DOM with CSS custom properties**: `:root` variables penetrate shadow boundaries for theming
- **Dual output targets**: CDN users get lazy loading, npm users get tree-shaking
- **Component-level testing**: Co-located `.spec.ts` (unit) and `.e2e.ts` (E2E) files
- **JSON docs generation**: `docs-json` output target feeds Docusaurus (no direct imports to avoid SSR issues)

**Data flow:**
- Props: HTML attributes (dash-case) or JS properties (camelCase) for configuration
- Events: CustomEvent with `composed: true, bubbles: true` to escape shadow DOM
- State: Component-internal via `@State()`, never exposed to parent
- Watch handlers: `@Watch()` for side effects (must call manually in componentWillLoad for initial render)

### Critical Pitfalls

Research identified 18 pitfalls specific to Stencil and web component porting. The top 5 are critical for project success:

1. **Peer dependency bundling hell**: Stencil inlines third-party deps by default, creating 95KB+ bundles even when consuming apps have the same libraries — **Mitigation**: Use dynamic imports for marked/DOMPurify/Prism/Turndown, document peer dependencies, test bundle sizes with bundlephobia.com
2. **Shadow DOM event retargeting breaks drag-and-drop**: `event.target` always returns host element, not dragged child — **Mitigation**: Replace all `event.target` with `event.composedPath()[0]` in drag handlers, test early
3. **CSS custom properties are not enough for theming**: Variables only allow changing predefined values, not structural CSS — **Mitigation**: Combine `--dwc-*` variables with `::part()` selectors for advanced customization
4. **Async lifecycle timing chaos**: Stencil's async rendering creates race conditions when loading data — **Mitigation**: Always return Promise from `componentWillLoad()`, use loading states in render(), call `await page.waitForChanges()` in E2E tests
5. **@Watch doesn't fire on initial render**: Initialization logic in watch handlers gets skipped — **Mitigation**: Call watch handler manually in `componentWillLoad()`

**Additional critical pitfalls:**
- Reference mutation doesn't trigger re-renders (use spread operator for all state updates)
- Custom events need `composed: true` to escape shadow DOM (not just `bubbles: true`)
- Dist vs. dist-custom-elements confusion (generate both, document use cases)
- Docusaurus imports web components directly (use JSON docs, load via CDN in examples)
- Large dependencies cause initial load bottleneck (dynamic imports, code-splitting)

## Implications for Roadmap

Based on research, the recommended phase structure follows a **infrastructure-first, simple-to-complex** approach that validates patterns early and defers risky work until architecture is proven.

### Phase 1: Foundation & Infrastructure
**Rationale:** Establish build pipeline, theming system, and CI/CD before any component work to avoid rework and validate tooling choices early
**Delivers:** Working Stencil project with dual output targets, DWC theme system, GitHub Actions workflows, Docusaurus site skeleton, peer dependency configuration
**Duration:** 1-2 weeks
**Addresses features:**
- TypeScript support (table stakes)
- CSS custom properties theming (table stakes)
- NPM distribution with tree-shaking (table stakes)
- Semantic versioning setup (table stakes)
**Avoids pitfalls:**
- [9] Dist vs. dist-custom-elements output confusion
- [1] Peer dependency bundling hell
- [17] Browser support decision
- [18] Stencil version pinning
**Validation criteria:** `npm run build` succeeds, CI pipeline runs, docs site builds, package.json exports configured

---

### Phase 2: sp-org-chart (Simple Component)
**Rationale:** Start with the simplest component (1k LOC, no external dependencies) to validate component patterns, testing strategy, and theming before tackling complex components
**Delivers:** Fully functional OrgChart with drag-and-drop, filtering, unit/E2E tests, DWC theming
**Duration:** 1 week
**Uses stack:**
- Stencil component architecture (@Prop, @Event, @State)
- Jest for unit tests (newSpecPage)
- Playwright for E2E tests
- DWC theme variables
**Implements architecture:**
- Component boundaries (props down, events up)
- Shadow DOM with CSS custom properties
- Co-located test pattern
**Avoids pitfalls:**
- [2] Shadow DOM event retargeting (drag-and-drop requires `event.composedPath()`)
- [6] Reference mutation (immutable state updates)
- [8] Custom events need `composed: true`
**Research flag:** SKIP — standard Stencil patterns, well-documented

---

### Phase 3: sp-walkthrough (Medium Component)
**Rationale:** Second-simplest component (3.6k LOC, potential peer deps) validates DOM interaction patterns outside component boundaries and peer dependency handling
**Delivers:** Walkthrough component with scene timeline, DOM highlighting, author/viewer modes, tests
**Duration:** 2 weeks
**Uses stack:**
- Peer dependency pattern (if video/timeline libraries needed)
- Shadow DOM scoped queries for external element highlighting
**Implements architecture:**
- Cross-boundary DOM interaction (highlighting elements outside component)
- State management for timeline
- Event patterns for scene changes
**Avoids pitfalls:**
- [4] Async lifecycle timing (scene loading)
- [5] @Watch initial render (timeline initialization)
- [15] Java webforJ wrapper removal (API redesign for TypeScript idioms)
**Research flag:** MEDIUM — May need API research for video/timeline libraries if interactive walkthroughs require them

---

### Phase 4: sp-markdown-editor (Complex Component)
**Rationale:** Most complex component (7k LOC, 4 peer dependencies) — defer until patterns validated by simpler components
**Delivers:** Full-featured markdown editor with WYSIWYG/source/split modes, voice dictation, import/export, syntax highlighting, sanitization
**Duration:** 3 weeks
**Uses stack:**
- marked (parsing), DOMPurify (sanitization), Prism.js (highlighting), Turndown (HTML→MD)
- Peer dependency configuration
- Dynamic imports for code-splitting
**Implements architecture:**
- Component with heavy dependencies (peer deps pattern)
- Complex state management (mode switching, undo/redo)
- Dynamic import pattern for performance
**Avoids pitfalls:**
- [1] Peer dependency bundling (use dynamic imports)
- [13] Large dependencies bottleneck (code-splitting)
- [6] Reference mutation (editor state updates)
**Research flag:** SKIP — Markdown editor patterns well-documented, dependencies chosen

---

### Phase 5: Documentation & Examples
**Rationale:** Document all components after they're complete to ensure examples reflect actual behavior
**Delivers:** Comprehensive Docusaurus site with getting-started guides, API docs, live examples, framework usage guides, real-world demos
**Duration:** 2 weeks
**Uses stack:**
- Docusaurus 3.9.2
- component-api.json generation
- GitHub Pages deployment
**Implements architecture:**
- JSON docs integration (not direct imports)
- Live component demos via CDN
- Framework wrapper examples
**Avoids pitfalls:**
- [12] Docusaurus imports web components directly (use JSON docs, script tags)
**Research flag:** SKIP — Docusaurus integration approach defined in architecture research

---

### Phase 6: Publishing & Distribution
**Rationale:** Final phase validates full distribution pipeline (npm + CDN) and release automation
**Delivers:** Published npm package, CDN availability (jsDelivr/unpkg), GitHub release, automated changelog
**Duration:** 1 week
**Uses stack:**
- Changesets for version management
- NPM Trusted Publishers (GitHub Actions)
- jsDelivr + unpkg CDN
**Implements architecture:**
- Dual output validation (dist + dist-custom-elements)
- CDN lazy loading verification
- npm package consumption testing
**Avoids pitfalls:**
- [11] TypeScript generated types drift (commit components.d.ts)
**Research flag:** SKIP — Standard npm publishing, Changesets workflow documented

---

### Phase Ordering Rationale

**Why infrastructure first:** Stencil configuration, output targets, and theming system must be validated before component work to avoid rework. Pitfall research shows dist vs. dist-custom-elements confusion (#9) and peer dependency bundling (#1) can require architectural changes if discovered late.

**Why OrgChart → Walkthrough → Markdown Editor:** Simple-to-complex order validates component patterns early with minimal risk. OrgChart (1k LOC, no deps) proves Shadow DOM events, drag-and-drop, and theming. Walkthrough (3.6k LOC) validates peer deps and cross-boundary DOM interaction. Markdown Editor (7k LOC, 4 deps) benefits from proven patterns before tackling complexity.

**Why documentation after components:** Live examples and API docs must reflect actual component behavior. Early documentation risks rework as component APIs evolve. JSON docs generation ensures auto-sync with component code.

**Why publishing last:** Full distribution pipeline (npm + CDN) only testable with complete components. Changesets workflow and CDN verification require stable component builds.

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (Walkthrough):** May need API research for video/timeline libraries if interactive walkthroughs require them. Current research assumes no heavy dependencies, but implementation may reveal need for animation/video libs.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Infrastructure):** Stencil project setup, Docusaurus config, GitHub Actions — well-documented
- **Phase 2 (OrgChart):** Standard Stencil component patterns, drag-and-drop with composedPath() — addressed in pitfalls research
- **Phase 4 (Markdown Editor):** Markdown parsing, sanitization, syntax highlighting — dependencies chosen, patterns documented
- **Phase 5 (Documentation):** Docusaurus integration via JSON docs — architecture research defines approach
- **Phase 6 (Publishing):** npm publishing, Changesets, CDN distribution — standard workflows

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations from official docs, stable releases, and verified npm packages with download stats |
| Features | HIGH | Based on analysis of leading component libraries (Shoelace, Material Web, Fluent UI) and web component best practices |
| Architecture | HIGH | Stencil's official documentation covers monorepo setup, dual output targets, and testing strategies comprehensively |
| Pitfalls | HIGH | Sourced from Stencil GitHub issues, official FAQ, and community experience reports with specific code examples |

**Overall confidence:** HIGH

### Gaps to Address

**Walkthrough component dependencies:** Research assumed no heavy external libraries, but implementation may reveal need for video/timeline/animation libraries. Current vanilla JS code should be audited for dependencies during Phase 3 planning. If libraries needed, evaluate as peer dependencies following Markdown Editor pattern.

**Framework wrapper demand:** Research recommends deferring React/Vue/Angular wrapper packages to v2+ based on industry trends (native web component support improving). However, if early user feedback shows strong demand, may need to reprioritize framework wrappers using Stencil's output target generators.

**Performance budgets:** While research recommends performance budget enforcement as differentiator, specific thresholds (e.g., sp-markdown-editor <50KB gzipped) need validation with built components. Phase 4 should measure actual bundle sizes and adjust budgets accordingly.

**Prism.js alternative:** Research flagged Prism.js as slow to update (maintainers only accepting security PRs for v1). If syntax highlighting becomes critical, evaluate `shiki` or `highlight.js` as alternatives during Phase 4. Current choice (Prism 1.30.0) is acceptable for v1 but may need replacement in v2+.

**SSR/hydration support:** Marked as optional/future in pitfall research. If server-side rendering becomes requirement, Phase 6+ will need additional research on Stencil SSR, deterministic componentWillLoad(), and hydration testing strategies.

## Sources

### Primary (HIGH confidence)
- [Stencil Documentation](https://stenciljs.com/docs/introduction) — Core framework patterns, lifecycle, testing, distribution
- [Stencil GitHub Releases](https://github.com/stenciljs/core/releases) — Version 4.41.1 features and breaking changes
- [TypeScript 5.8 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/) — Latest stable features
- [npm registry](https://www.npmjs.com/) — Package versions, download stats, peer dependency patterns (marked, DOMPurify, Prism.js, Turndown)
- [Docusaurus Documentation](https://docusaurus.io/) — Version 3.9.2 features and GitHub Pages deployment
- [Changesets Documentation](https://github.com/changesets/changesets) — Version management workflow
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) — Accessibility compliance requirements

### Secondary (MEDIUM confidence)
- [Web Component Best Practices](https://cianfrani.dev/posts/web-component-best-practices/) — Theming patterns, CSS custom properties
- [Shoelace Component Library](https://shoelace.style/) — Reference implementation for theming, documentation
- [Stencil ESLint Plugin](https://github.com/ionic-team/stencil-eslint) — Official linting rules
- [jsDelivr vs unpkg Performance](https://blog.blazingcdn.com/en-us/javascript-cdn-latency-shootout-cdnjs-jsdelivr-unpkg-skypack) — CDN latency comparison
- [NPM Provenance with GitHub Actions](https://www.thecandidstartup.org/2026/01/26/bootstrapping-npm-provenance-github-actions.html) — Modern publishing patterns
- [Component Library Features](https://retool.com/blog/what-makes-a-great-component-library) — Competitive analysis framework

### Tertiary (LOW confidence)
- [Stencil GitHub Issues](https://github.com/stenciljs/core/issues) — Community pitfalls and workarounds (requires validation)
- [Shadow DOM Event Retargeting](https://javascript.info/shadow-dom-events) — Theory, needs testing with Stencil
- [Tree-shaking with tsup](https://dorshinar.me/posts/treeshaking-with-tsup) — General bundling concepts, adapted for Stencil context

---
*Research completed: 2026-01-30*
*Ready for roadmap: yes*
