# Phase 6: Documentation & Publishing - Context

**Gathered:** 2026-02-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Comprehensive Docusaurus documentation site deployed to GitHub Pages, npm package published as @skillspilot/webcomponents with CDN availability (jsdelivr/unpkg), and automated release workflow with changelogs. Covers requirements DOCS-01 through DOCS-06 and INFRA-07.

</domain>

<decisions>
## Implementation Decisions

### Live examples
- Vanilla HTML/JS only — no framework-specific snippets for v1
- 3-5 key scenario examples per component (basic setup, common configs, event handling)
- Include theming/dark mode demos alongside default appearance
- Interactive approach at Claude's discretion (editable code blocks vs static snippets + preview)

### API docs generation
- Use Stencil's built-in `--docs-json` to extract props, events, methods, CSS custom properties, slots
- Render extracted JSON into Docusaurus component pages
- CSS custom properties (--dwc-* tokens) and ::part() selectors documented per-component only (not in a shared page)

### Release & publish workflow
- Releases triggered via GitHub Release UI → CI publishes to npm with provenance + deploys docs
- Package name: `@skillspilot/webcomponents` (scoped under @skillspilot org)
- Docs auto-deploy on every push to main (always reflects latest code)

### Claude's Discretion
- Live examples approach (embedded editable code editor vs static snippets + iframe preview)
- TypeScript type definitions display (inline vs linked to source)
- docs-json generation timing (part of every build vs separate docs command)
- Documentation versioning depth (full version picker vs latest + changelog)
- Docs site landing page design and navigation structure
- Getting-started guide flow and structure
- Theming guide organization

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for Docusaurus + Stencil docs sites.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-documentation-publishing*
*Context gathered: 2026-02-21*
