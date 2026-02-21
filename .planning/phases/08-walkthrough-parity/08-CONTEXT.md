# Phase 8: Walkthrough Parity - Context

**Gathered:** 2026-02-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Upgrade sp-walkthrough to match the original prototype's controls, animations, and rendering. This covers: Tabler icons throughout, visual progress bar with click-to-seek, skip/restart buttons, scene list as custom popup, vertical volume slider popup, custom caption overlay (not native), markdown in scene descriptions, highlight glow animations, single-row controls layout, and DWC theming. Author mode and core playback architecture are already built — this phase is about visual/behavioral parity, not new capabilities.

</domain>

<decisions>
## Implementation Decisions

### Overall approach
- Faithful port — match the original prototype as closely as possible in functionality and style
- No redesign or reimagining — the requirements (WALK-01 through WALK-11) define the target
- Work from requirements only — no external reference prototype to compare against

### Tabler icons (WALK-01)
- Follow the same icon approach used by sp-org-chart
- Researcher should check how org chart imports/renders Tabler icons and replicate that pattern

### Popup behavior (WALK-05, WALK-06)
- Build local popup logic within sp-walkthrough for scene list and volume slider
- Do NOT depend on Phase 9 (sp-popover) — keep this phase independent
- Simple positioning relative to their trigger buttons is sufficient

### Markdown rendering (WALK-08)
- Reuse the markdown rendering approach from sp-markdown-editor
- Researcher should identify what library/utility sp-markdown-editor uses and apply it to scene description text bubbles
- Must support: h1-h3, p, ul, ol, code, pre

### Claude's Discretion
- Exact popup positioning and dismiss behavior for scene list and volume slider
- How to structure the progress bar (canvas, div-based, SVG)
- Animation implementation details for highlight glow (CSS animations vs JS)
- How to refactor the controls bar from current emoji-based to Tabler icon-based single row
- Custom caption overlay positioning and styling details

</decisions>

<specifics>
## Specific Ideas

No specific requirements beyond WALK-01 through WALK-11 — open to standard approaches that match the described behaviors.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-walkthrough-parity*
*Context gathered: 2026-02-21*
