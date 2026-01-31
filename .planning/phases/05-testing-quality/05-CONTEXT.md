# Phase 5: Testing & Quality - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Enforce test coverage thresholds in CI and validate that all three components (sp-org-chart, sp-walkthrough, sp-markdown-editor) render with sensible visual defaults when DWC theme is not loaded. No new component features — this is quality enforcement only.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All areas deferred to Claude's judgment:

**Coverage policy:**
- Enforce 70% minimum across lines, branches, functions, statements via Jest coverage thresholds
- Exclude E2E test files and generated output from coverage calculation
- Hard-to-test browser APIs (SpeechRecognition, file I/O, print) can be covered via mock-based unit tests — no exemptions from threshold
- CI fails the build if any metric drops below 70%

**Fallback rendering:**
- Without DWC theme loaded, components should render with readable defaults (system fonts, neutral grays, adequate spacing)
- Existing `var(--dwc-*, fallback)` pattern already provides this — tests validate the fallback values produce usable UI
- Verify: text is readable, interactive elements are distinguishable, layout doesn't collapse

**Test gap strategy:**
- Identify coverage gaps in existing 335 tests and add targeted tests to reach 70% threshold
- Prefer adding spec tests over E2E tests for coverage (faster, more deterministic)
- Add fallback rendering tests as new spec tests per component

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-testing-quality*
*Context gathered: 2026-01-31*
