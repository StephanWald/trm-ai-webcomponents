# Phase 7: Org Chart Parity - Context

**Gathered:** 2026-02-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild sp-org-chart to match the original prototype: vertical indented list layout, full user/branch data model, drag-and-drop with custom preview, timed delete, branch filtering, and full event/method API. The current horizontal tree with card layout is being replaced entirely.

</domain>

<decisions>
## Implementation Decisions

### Overall approach
- Faithful 1:1 reproduction of the original prototype — no creative reinterpretation
- Every visual detail, behavior, and interaction should match the prototype as closely as possible
- When in doubt, match the prototype over inventing something new

### Tile layout & content
- Match prototype exactly: user tiles show avatar (left), name, role, email, phone, branch badge (right)
- Branch entities render with square logo avatar and branch-specific styling per prototype
- Info density, spacing, typography, badge placement all follow prototype reference

### Tree connectors & indentation
- Vertical indented list with CSS border connectors matching the prototype layout
- Indent depth, connector line style, and nesting visual cues per prototype reference
- This is a fundamentally different layout from the current horizontal tree — full rewrite of rendering

### Drag-and-drop UX
- Custom floating preview (avatar + name) following cursor, hiding native drag image — per prototype
- Drop zones bottom-right with SVG icons for Unlink and Delete — per prototype
- 4-second timed hold with circular countdown overlay following cursor for Delete — per prototype
- All drag affordances and visual feedback match prototype

### Branch filtering behavior
- filterMode + filterBranchId dims non-matching users and hides unrelated branches — per prototype
- Visual treatment of "dimmed" state and structural visibility match prototype

### Claude's Discretion
- Internal code architecture (how to structure the rewrite — incremental vs full rebuild)
- Utility function organization and tree-building algorithm choices
- Test strategy and coverage approach
- CSS implementation details (custom properties, naming) within the constraint of matching prototype visuals

</decisions>

<specifics>
## Specific Ideas

- User directive: "just match as close as you can" — prototype fidelity is the primary success metric
- The current component already has drag-and-drop, events, methods, and filtering — these need to be refactored to match prototype behavior, not built from scratch
- Data model needs expansion: current User has (id, name, role, reportsTo, avatar) → needs (firstName, lastName, email, phone, branchId, branchName, branchLogo, avatar, role, reportsTo)
- Layout paradigm shift: horizontal recursive tree → vertical indented list with CSS border connectors

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-org-chart-parity*
*Context gathered: 2026-02-21*
