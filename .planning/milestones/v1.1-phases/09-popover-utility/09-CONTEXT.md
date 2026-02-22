# Phase 9: Popover Utility - Context

**Gathered:** 2026-02-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver sp-popover as a reusable viewport-aware positioning component. Supports 6 placement options, boundary detection with auto-repositioning, configurable dismiss behaviors (outside-click and ESC), named slot for content, fade+slide enter animation, and open/close events with public methods. This is a foundation component — Phases 10 and 11 will consume it for dropdowns.

</domain>

<decisions>
## Implementation Decisions

### Overall approach
- New component — no existing prototype to port from
- Requirements (POPV-01 through POPV-06) fully define the target behavior
- Build as a clean, reusable Stencil web component with shadow DOM

### Claude's Discretion
- Anchor mechanism (how popover knows its anchor element — prop with selector, parent element, or other pattern)
- Arrow/caret visual treatment (whether to include one)
- Visual styling (shadow, border, background — should follow DWC patterns)
- Internal positioning algorithm (manual calc vs Floating UI vs custom)
- Whether to refactor sp-walkthrough's local popups to use sp-popover (or leave as-is)
- Focus management approach
- Dismiss-on-scroll behavior
- Animation implementation details (CSS transitions vs keyframes)

</decisions>

<specifics>
## Specific Ideas

No specific requirements beyond POPV-01 through POPV-06 — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 09-popover-utility*
*Context gathered: 2026-02-21*
