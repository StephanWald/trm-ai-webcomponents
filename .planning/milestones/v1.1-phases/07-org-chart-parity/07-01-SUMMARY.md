---
phase: 07-org-chart-parity
plan: "01"
subsystem: sp-org-chart
tags: [data-model, types, tree-utilities, filtering, sorting, tdd]
dependency_graph:
  requires: []
  provides: [expanded-user-model, branch-entity-support, filterByBranch, getDisplayName, isBranch, BranchFilterMode]
  affects: [sp-org-chart-component, all-org-chart-plans]
tech_stack:
  added: []
  patterns: [expanded-interface, type-guard, display-name-helper, branch-filter-predicate]
key_files:
  created: []
  modified:
    - src/components/sp-org-chart/types/org-chart.types.ts
    - src/components/sp-org-chart/utils/tree-builder.ts
    - src/components/sp-org-chart/utils/tree-filter.ts
    - src/components/sp-org-chart/utils/tree-sorter.ts
    - src/components/sp-org-chart/utils/tree-builder.spec.ts
    - src/components/sp-org-chart/utils/tree-filter.spec.ts
    - src/components/sp-org-chart/utils/tree-sorter.spec.ts
decisions:
  - "Branch entities are users without lastName — isBranch() type guard is the canonical check"
  - "getDisplayName() centralises firstName+lastName formatting, used by sorter and builder warnings"
  - "filterByBranch mode ('highlight'|'isolate') is consumed by the component layer; filter logic is identical for both modes"
  - "Tree builder uses getDisplayName in cycle detection console.warn messages for better debuggability"
metrics:
  duration: "4 minutes"
  completed: "2026-02-21"
  tasks_completed: 3
  files_modified: 7
---

# Phase 07 Plan 01: Data Model Expansion and Tree Utility Updates Summary

Rewrote the sp-org-chart User interface from a 5-field model (id, name, role, reportsTo, avatar) to an 11-field model (id, firstName, lastName, email, phone, role, avatar, reportsTo, branchId, branchName, branchLogo) with branch entity support via isBranch() and getDisplayName() helpers, and updated all tree utilities and their passing spec tests.

## What Was Built

### Types (org-chart.types.ts)

Expanded `User` interface with all prototype-required fields:

```typescript
export interface User {
  id: string;
  firstName: string;
  lastName?: string;       // Absent for branch entities
  email?: string;
  phone?: string;
  role: string;
  avatar?: string;
  reportsTo?: string;
  branchId?: string;
  branchName?: string;
  branchLogo?: string;     // URL for branch square logo
}
```

Added helpers and new type:

- `getDisplayName(user)` — returns `"firstName lastName"` or `"firstName"` for branches
- `isBranch(user)` — returns `true` when `lastName` is absent
- `BranchFilterMode = 'none' | 'highlight' | 'isolate'`

`TreeNode` extends the new `User` (children + level fields unchanged).

### Tree Utilities

**tree-builder.ts:** Updated `console.warn` messages to use `getDisplayName()` instead of `user.name`. The spread `...user` carries all new fields into `TreeNode` automatically — no algorithm changes needed.

**tree-filter.ts:** Added `filterByBranch(roots, branchId, mode)` export. Branch entities match if their `id === branchId` OR `branchId === branchId`. Regular users match if `branchId === branchId`. The mode parameter ('highlight'|'isolate') is consumed by the component layer.

**tree-sorter.ts:** Replaced `a.name.localeCompare(b.name)` with `getDisplayName(a).localeCompare(getDisplayName(b))`.

### Spec Tests

All three utility spec files fully rewritten:

- **tree-builder.spec.ts** (11 tests): All User objects use firstName/lastName. Added 3 branch entity tests (branch-as-root, mixed tree, standalone branch entity).
- **tree-filter.spec.ts** (13 tests): Updated to new User model, predicates use `getDisplayName()`. Added 6 `filterByBranch` tests covering highlight mode, isolate mode, id matching, unknown branchId, ancestor chain, and mixed entities.
- **tree-sorter.spec.ts** (10 tests): Sorting assertions use `getDisplayName()`. Added 2 branch entity tests (branch-only sorting, mixed branch+user sorting).

**Test result:** 518 passed (all utilities PASS), 4 failures in `sp-org-chart.spec.ts` (component spec still uses old `name` field — addressed in Plan 02).

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | c73be53 | feat(07-01): rewrite User type to expanded data model |
| 2 | 9cbc70c | feat(07-01): update tree utilities for expanded data model |
| 3 | ea1edb9 | test(07-01): rewrite utility specs for expanded User data model |

## Decisions Made

1. **Branch entities are users without lastName** — `isBranch()` type guard is the canonical check throughout all utilities
2. **getDisplayName() centralises display name formatting** — used by sorter, builder cycle warnings, and test predicates
3. **filterByBranch mode is a component concern** — filter logic is identical for highlight/isolate; the component handles visual differences (dimming vs hiding)
4. **tree-builder algorithm is model-agnostic** — only uses `id` and `reportsTo` fields; spread carries new fields automatically

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

Files exist:
- [x] src/components/sp-org-chart/types/org-chart.types.ts
- [x] src/components/sp-org-chart/utils/tree-builder.ts
- [x] src/components/sp-org-chart/utils/tree-filter.ts
- [x] src/components/sp-org-chart/utils/tree-sorter.ts
- [x] src/components/sp-org-chart/utils/tree-builder.spec.ts
- [x] src/components/sp-org-chart/utils/tree-filter.spec.ts
- [x] src/components/sp-org-chart/utils/tree-sorter.spec.ts

Commits exist:
- [x] c73be53 (types rewrite)
- [x] 9cbc70c (utilities update)
- [x] ea1edb9 (spec tests rewrite)

## Self-Check: PASSED
