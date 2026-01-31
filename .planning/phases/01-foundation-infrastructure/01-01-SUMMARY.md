---
phase: 01-foundation-infrastructure
plan: 01
subsystem: infra
tags: [stencil, typescript, web-components, build-pipeline, npm]

# Dependency graph
requires:
  - phase: none
    provides: initial project setup
provides:
  - Stencil.js v4.41.3 component library with dual output targets
  - Package manifest configured for npm publishing as @skillspilot/webcomponents
  - Build pipeline producing dist, dist-custom-elements (via dist/components), and www outputs
  - Optional peer dependency configuration for marked, DOMPurify, Prism.js, Turndown
  - DWC theme CSS placeholder for theming system
affects: [02-theming, 03-ci-cd, 04-markdown-editor, 05-walkthrough, 06-orgchart]

# Tech tracking
tech-stack:
  added: [@stencil/core@4.41.3, typescript]
  patterns: [dual-output-targets, optional-peer-dependencies, shadow-dom-components]

key-files:
  created:
    - stencil.config.ts (dual output target configuration)
    - package.json (@skillspilot/webcomponents with exports)
    - src/global/dwc-theme.css (placeholder for DWC theming)
    - src/components/sp-example/sp-example.tsx (placeholder component)
    - tsconfig.json (TypeScript configuration)
  modified: []

key-decisions:
  - "dist-custom-elements output via dist/components/ (Stencil v4 behavior) not separate dist-custom-elements/ directory"
  - "customElementsExportBehavior: auto-define-custom-elements for automatic registration"
  - "externalRuntime: false to bundle Stencil runtime for easier consumption"
  - "Peer dependencies marked as optional via peerDependenciesMeta"

patterns-established:
  - "Component naming: sp-* prefix (e.g., sp-example)"
  - "Shadow DOM components with ::part() for external styling"
  - "Global theming via src/global/dwc-theme.css referenced in stencil.config.ts"

# Metrics
duration: 2.6min
completed: 2026-01-31
---

# Phase 01 Plan 01: Foundation Infrastructure Summary

**Stencil.js v4.41.3 component library with dual outputs (dist + dist/components), npm package @skillspilot/webcomponents, and optional peer dependencies for heavy libraries**

## Performance

- **Duration:** 2.6 min (154s)
- **Started:** 2026-01-31T03:15:34Z
- **Completed:** 2026-01-31T03:17:58Z
- **Tasks:** 1
- **Files modified:** 13

## Accomplishments
- Initialized Stencil.js v4.41.3 project with dual output targets for both CDN and npm bundler consumption
- Configured package.json for publishing as @skillspilot/webcomponents with correct exports map
- Declared marked, DOMPurify, Prism.js, and Turndown as optional peer dependencies (not bundled)
- Created src/global/dwc-theme.css placeholder for DWC theming system (Plan 02)
- Build pipeline produces dist/, dist/components/ (custom elements), and www/ directories successfully

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Stencil project with dual output targets** - `33747bf` (feat)

## Files Created/Modified
- `package.json` - Package manifest with @skillspilot/webcomponents, dual exports, optional peer deps
- `stencil.config.ts` - Dual output targets (dist, dist-custom-elements, www) with globalStyle reference
- `tsconfig.json` - TypeScript configuration extending Stencil defaults
- `src/global/dwc-theme.css` - Empty placeholder for DWC theming (populated in Plan 02)
- `src/components/sp-example/sp-example.tsx` - Placeholder component for build verification
- `src/components/sp-example/sp-example.css` - Component styles
- `src/index.html` - Dev server entry point with script/link tags
- `src/index.ts` - Package entry point (auto-generated exports)
- `.gitignore` - Node/Stencil output directories excluded
- `.editorconfig` - 2-space indent, LF line endings
- `.prettierrc` - Single quotes, trailing commas, 100-char width

## Decisions Made

**dist-custom-elements output location:**
- Stencil v4.41.3 outputs custom elements to `dist/components/` not `dist-custom-elements/`
- Updated package.json files array to include only `dist/` and `loader/` (components are inside dist/)
- Exports map points to `./dist/components/index.js` for custom elements import

**Auto-registration behavior:**
- Used `customElementsExportBehavior: 'auto-define-custom-elements'` for automatic component registration on import
- Alternative `'default'` requires manual `defineCustomElement()` calls - chose auto for better DX

**Runtime bundling:**
- Set `externalRuntime: false` to bundle Stencil runtime with custom elements
- Makes consumption easier - consumers don't need to manage @stencil/core dependency
- Trade-off: slightly larger bundle, but simpler integration

## Deviations from Plan

None - plan executed exactly as written. The plan specified dual output targets, and while the directory structure differs slightly from the RESEARCH.md example (dist/components/ vs dist-custom-elements/), this is Stencil v4's standard behavior and aligns with the intent.

## Issues Encountered

**Initial build failure with src/index.ts:**
- Issue: src/index.ts tried to export from auto-generated src/components.d.ts before it existed
- Resolution: Changed to placeholder comment - Stencil generates proper exports automatically
- No impact on final output

**package.json files array validation error:**
- Issue: Stencil validated package.json looking for dist-custom-elements/ but actual output is dist/components/
- Resolution: Removed dist-custom-elements/ from files array (redundant since dist/ includes it)
- No impact - dist/ still includes all custom elements output

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 02 (Theming):**
- src/global/dwc-theme.css placeholder exists and referenced in stencil.config.ts
- Build pipeline functional
- sp-example component exists for theming verification

**Ready for Plan 03 (CI/CD):**
- package.json configured with correct exports and scripts
- Build script (`npm run build`) works without errors
- Test scripts defined (placeholder implementations)

**No blockers.** Foundation is solid for component development, theming, and automation.

---
*Phase: 01-foundation-infrastructure*
*Completed: 2026-01-31*
