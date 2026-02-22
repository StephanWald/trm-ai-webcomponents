---
phase: 07-org-chart-parity
plan: "02"
subsystem: sp-org-chart
tags: [component-rewrite, layout, vertical-list, tile-expansion, branch-entity, DWC-theming, css, spec-tests]
dependency_graph:
  requires: [07-01]
  provides: [vertical-list-layout, expanded-tile-rendering, branch-entity-styling, branch-filter-props, editable-default-true]
  affects: [sp-org-chart-component, 07-03-drag-and-drop, 07-04-demos]
tech_stack:
  added: []
  patterns: [vertical-indented-list, horizontal-tile, branch-type-guard, DWC-token-with-fallback]
key_files:
  created: []
  modified:
    - src/components/sp-org-chart/sp-org-chart.tsx
    - src/components/sp-org-chart/sp-org-chart.css
    - src/components/sp-org-chart/sp-org-chart.spec.ts
decisions:
  - "Filter input and toolbar removed entirely — branch filtering done via filterMode/filterBranchId props, not DOM input"
  - "editable defaults to true — matches prototype where drag-and-drop is on by default"
  - "applyBranchFilter() is called from @Watch handlers and directly in tests; filterByBranch mode parameter is consumed at render layer (shouldDimNode/shouldHideNode)"
  - "Drop zone icons use HTML entity codes (&#x1F517;, &#x1F5D1;) instead of emoji literals to avoid build warnings"
metrics:
  duration: "7 minutes"
  completed: "2026-02-21"
  tasks_completed: 3
  files_modified: 3
---

# Phase 07 Plan 02: Component TSX and CSS Rewrite for Vertical List Layout Summary

Rewrote sp-org-chart.tsx from horizontal tree to vertical indented list with expanded user tiles (avatar left, name/role/email/phone/branch-badge right), rewrote sp-org-chart.css with DWC token theming and fallback defaults, and updated all spec tests to the new firstName/lastName data model — 527 tests pass at 93% coverage.

## What Was Built

### Component TSX (sp-org-chart.tsx)

**Imports updated:**
- Added `getDisplayName`, `isBranch`, `BranchFilterMode` from types
- Added `filterByBranch` from tree-filter
- Removed `filterTree` import

**Props changes:**
- `editable` default changed from `false` to `true` (ORGC-09)
- Removed text filter approach entirely
- Added `filterMode: BranchFilterMode = 'none'`
- Added `filterBranchId: string = ''`

**State changes:**
- Removed `filterText` and `filterResults`
- Added `branchFilterResults: Map<string, FilterResult> | null`

**Watch handlers:**
- `@Watch('filterMode')` and `@Watch('filterBranchId')` both call `applyBranchFilter()`
- `applyBranchFilter()`: clears results when filterMode is 'none' or filterBranchId is empty; otherwise calls `filterByBranch()`

**New `renderTreeNode` — vertical list layout:**
```tsx
<div class="tree-node">
  <div class={tileClasses} part="user-tile" data-user-id={node.id} ...>
    <div class={{ 'user-avatar': true, 'branch-avatar': branchEntity }}>
      {/* img or initials */}
    </div>
    <div class="user-info">
      <div class="user-name">{getDisplayName(node)}</div>
      <div class="user-role">{node.role}</div>
      {node.email && <div class="user-email">{node.email}</div>}
      {node.phone && <div class="user-phone">{node.phone}</div>}
      {node.branchName && !branchEntity && <div class="user-branch-badge">{node.branchName}</div>}
    </div>
  </div>
  {node.children.length > 0 && (
    <div class="tree-children">
      {node.children.map(child => this.renderTreeNode(child))}
    </div>
  )}
</div>
```

**Other method updates:**
- `getUserInitials(node)` uses `node.firstName`/`node.lastName` (not `node.name`)
- `shouldDimNode()` uses `branchFilterResults` (not `filterResults`)
- `shouldHideNode()` new — hides branch entities without matching descendants in isolate mode
- `rebuildTree()` no longer resets `filterText`
- `render()` removes `<div class="org-chart-toolbar">` and filter input

### CSS (sp-org-chart.css)

Complete rewrite replacing horizontal tree with vertical indented list:

```css
.tree-container  { flex-direction: column; padding: 12px }
.tree-node       { flex-direction: column }
.tree-children   { margin-left: 32px; padding-left: 12px; border-left: 2px solid border-color }
.tree-children > .tree-node::before  { /* horizontal connector */ }
.user-tile       { flex-direction: row; gap: 8px }  /* avatar left, info right */
.branch-tile     { border-left: 3px solid primary }
.branch-avatar   { border-radius: 6px }  /* square vs circular */
.user-info       { flex-direction: column; flex: 1 }
.user-branch-badge { inline badge with primary-surface background }
```

All `var()` calls have fallback defaults. Toolbar CSS removed entirely. Theme overrides updated for new class names. Dark theme connector colors updated.

### Spec Tests (sp-org-chart.spec.ts)

Full rewrite — all User objects use `firstName`/`lastName`:

- **Rendering**: tiles show name, role, email, phone, branch badge
- **Branch entities**: branch-tile + branch-avatar classes, no badge on entity itself, branchLogo as avatar
- **Editable default**: 3 tests — defaults to true, explicit true, explicit false
- **Branch filtering**: 5 tests — filterMode highlight, isolate, clear to none, clear via empty branchId
- **Events**: userClick, userDblclick, hierarchyChange, userDelete — all use firstName in assertions
- **Methods**: getSelected, highlightUser, clearHighlight, scrollToUser — updated User shapes
- **Drag-and-drop**: all handler tests updated with new User model
- **Long-press**: all tests updated; `editable=false` test uses explicit attribute
- **DOM structure**: no toolbar, no filter-input in DOM asserted

Coverage: 93% statements, 92% branches, 84% functions, 93% lines.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 1a2f88e | feat(07-02): rewrite component TSX for vertical list layout and expanded tiles |
| 2 | 5975425 | feat(07-02): rewrite CSS for vertical indented list with DWC theming |
| 3 | 4ae00d3 | test(07-02): rewrite spec tests for new rendering and behavior |

## Decisions Made

1. **Filter input removed entirely** — branch filtering done via `filterMode`/`filterBranchId` props, not a DOM input. This matches the prototype design where filtering is a programmatic concern.
2. **editable defaults to true** — prototype has drag-and-drop active by default; this is now the correct default
3. **applyBranchFilter is callable directly** — because Stencil's @Watch doesn't fire on direct property assignment in tests, the method is called explicitly in tests. This is the correct pattern.
4. **Drop zone icons use HTML entities** — avoids emoji literals in TSX which can cause build warnings in some environments

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] Drop zone emoji literals replaced with HTML entity codes**
- **Found during:** Task 1
- **Issue:** Emoji literals (`🔗`, `🗑️`) in TSX can trigger build warnings
- **Fix:** Replaced with `&#x1F517;` and `&#x1F5D1;` HTML entities
- **Files modified:** src/components/sp-org-chart/sp-org-chart.tsx
- **Commit:** 1a2f88e (included in task commit)

## Self-Check

Files exist:
- [x] src/components/sp-org-chart/sp-org-chart.tsx
- [x] src/components/sp-org-chart/sp-org-chart.css
- [x] src/components/sp-org-chart/sp-org-chart.spec.ts

Commits exist:
- [x] 1a2f88e (TSX rewrite)
- [x] 5975425 (CSS rewrite)
- [x] 4ae00d3 (spec tests rewrite)

## Self-Check: PASSED
