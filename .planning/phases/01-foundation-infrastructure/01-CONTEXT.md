# Phase 1: Foundation & Infrastructure - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the Stencil.js project skeleton with dual output targets (dist for CDN lazy-loading, dist-custom-elements for bundler tree-shaking), DWC theming system with CSS custom properties, CI/CD via GitHub Actions, peer dependency configuration, and Changesets versioning. A test component (sp-example) validates the entire pipeline before any real component work begins.

</domain>

<decisions>
## Implementation Decisions

### DWC Theming Approach
- Dark mode: Respect DWC tokens when present, but also support a component-level attribute override (e.g., `theme="dark"`) for standalone use without DWC
- Token depth, fallback defaults, and CSS `::part()` granularity: Claude's discretion — pick the right level of integration per component, ensure components work standalone with a clean neutral look

### Project Structure
- Monorepo layout: Claude's discretion on flat vs packages structure — pick the cleanest approach for Stencil + Docusaurus coexistence
- Shared styles: Use Stencil's `globalStyle` config for shared DWC token mappings and base styles
- Test component (sp-example): Claude's discretion on scope — should validate that theming, build outputs, and testing all work end-to-end

### Peer Dependency Loading
- CDN loading strategy, missing dep behavior, version ranges, package-level vs component-level peer declarations: All Claude's discretion — optimize for best developer experience across both npm and CDN consumption paths
- Key context: Only Markdown Editor (Phase 4) needs peer deps. OrgChart and Walkthrough have no external deps.

### CI/CD Workflow Design
- Branch strategy: Git flow (develop + feature branches, release branches for publishing)
- Publish trigger: GitHub Release creation triggers npm publish with provenance
- Docs deployment: Docusaurus deploys to GitHub Pages on every merge to main
- GitHub repo: Needs to be created (not yet set up)
- npm account: Publish under https://www.npmjs.com/~howdydoody (may need @skillspilot org creation)

### Claude's Discretion
- DWC token mapping depth (core vs comprehensive)
- Fallback color palette when DWC theme is absent
- CSS `::part()` granularity per component
- Monorepo structure (flat vs packages)
- sp-example test component scope
- Peer dependency CDN loading strategy
- Missing dependency error handling approach
- Peer dependency version ranges

</decisions>

<specifics>
## Specific Ideas

- Stencil's `globalStyle` config is the preferred mechanism for shared theming — user explicitly chose this over a shared SCSS file
- npm publishing should go under the `~howdydoody` npm account, potentially creating an `@skillspilot` org scope
- Git flow branching was explicitly chosen — not trunk-based development

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-infrastructure*
*Context gathered: 2026-01-31*
