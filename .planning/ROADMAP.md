# Roadmap: Skillspilot Web Components

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6 (shipped 2026-02-21)
- 🚧 **v1.1 Visual Parity & Communication** — Phases 7-12 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-6) — SHIPPED 2026-02-21</summary>

- [x] Phase 1: Foundation & Infrastructure (3/3 plans) — completed 2026-01-31
- [x] Phase 2: OrgChart Component (2/2 plans) — completed 2026-01-31
- [x] Phase 3: Walkthrough Component (3/3 plans) — completed 2026-01-31
- [x] Phase 4: Markdown Editor Component (4/4 plans) — completed 2026-01-31
- [x] Phase 5: Testing & Quality (3/3 plans) — completed 2026-02-20
- [x] Phase 6: Documentation & Publishing (5/5 plans) — completed 2026-02-21

</details>

### 🚧 v1.1 Visual Parity & Communication (In Progress)

**Milestone Goal:** Achieve 1:1 visual/behavioral parity with original prototypes for sp-org-chart and sp-walkthrough, and deliver five new communication and utility components.

**Phase Numbering:** Continues from v1.0. v1.1 occupies phases 7-12.

- [x] **Phase 7: Org Chart Parity** — Rebuild sp-org-chart to match original prototype layout, data model, and behaviors (completed 2026-02-21)
- [x] **Phase 8: Walkthrough Parity** — Upgrade sp-walkthrough to match original prototype controls, animations, and rendering (completed 2026-02-21)
- [ ] **Phase 9: Popover Utility** — Deliver sp-popover as a reusable viewport-aware positioning foundation
- [ ] **Phase 10: Language & Voice** — Port sp-language-selector, sp-language-list, and sp-voice-input-button
- [ ] **Phase 11: Communication & Splash** — Port sp-communication-preferences and sp-splash
- [ ] **Phase 12: Docs & Tests** — Complete documentation and test coverage for all v1.1 components

## Phase Details

### Phase 7: Org Chart Parity
**Goal**: sp-org-chart renders and behaves identically to the original prototype — vertical indented list layout, full user/branch data model, drag-and-drop with custom preview, timed delete, branch filtering, and full event/method API
**Depends on**: Phase 6 (v1.0 complete)
**Requirements**: ORGC-01, ORGC-02, ORGC-03, ORGC-04, ORGC-05, ORGC-06, ORGC-07, ORGC-08, ORGC-09, ORGC-10, ORGC-11, ORGC-12
**Success Criteria** (what must be TRUE):
  1. The org chart renders as a vertical indented list with CSS border connectors matching the original prototype layout
  2. User tiles show avatar, name, role, email, phone, and branch badge; branch tiles show square logo avatar with branch styling
  3. Dragging a user node shows a floating avatar+name preview following the cursor; drop zones with SVG icons appear for Unlink and Delete; holding the Delete zone for 4 seconds with a countdown overlay completes the delete
  4. Branch filtering dims non-matching users and hides unrelated branches when filterMode and filterBranchId props are set
  5. Component emits user-click, user-dblclick, hierarchy-change, and user-delete events with correct detail shapes; highlightUser, scrollToUser, clearHighlight, and getSelected methods work as documented
**Plans**: 3 plans
Plans:
- [ ] 07-01-PLAN.md — Data model and tree utilities rewrite (types, tree-builder, tree-filter, tree-sorter)
- [ ] 07-02-PLAN.md — Component rendering rewrite (vertical list layout, expanded tiles, CSS, events, methods)
- [ ] 07-03-PLAN.md — Drag-drop interactions and branch filtering (custom preview, SVG drop zones, timed delete, filtering)

### Phase 8: Walkthrough Parity
**Goal**: sp-walkthrough controls, animations, and rendering match the original prototype — Tabler icons throughout, progress bar, skip/restart, scene list popup, vertical volume slider, custom captions, markdown text bubble, and highlight glow animations
**Depends on**: Phase 6 (v1.0 complete)
**Requirements**: WALK-01, WALK-02, WALK-03, WALK-04, WALK-05, WALK-06, WALK-07, WALK-08, WALK-09, WALK-10, WALK-11
**Success Criteria** (what must be TRUE):
  1. All controls display Tabler SVG icons (play, pause, skip-back/forward-10, restart, volume, subtitles, scene list, and tool/pointer/edit controls)
  2. The controls row shows a clickable progress bar; skip ±10s and restart buttons are present and functional
  3. The scene list opens as a custom popup (not a native select) showing title and timestamp per scene
  4. The volume control opens as a vertical popup slider; captions render as a styled overlay (dark background, white text) not native browser captions
  5. Highlighted elements animate with a reddish-brown border and dual glow; active highlights use the green state with a 1.5s breathing animation; scene descriptions support markdown (headings, lists, code) in the text bubble
**Plans**: 2 plans
Plans:
- [ ] 08-01-PLAN.md — Controls rewrite: Tabler SVG icons, single-row layout, progress bar, skip/restart, DWC theming
- [ ] 08-02-PLAN.md — Popups, captions, markdown, highlights: scene list popup, volume popup, custom captions, markdown text bubble, highlight animations

### Phase 9: Popover Utility
**Goal**: sp-popover is a reusable viewport-aware positioning component with 6 placement options, boundary detection, configurable dismiss behaviors, a named slot for content, enter animation, and open/close events
**Depends on**: Phase 6 (v1.0 complete)
**Requirements**: POPV-01, POPV-02, POPV-03, POPV-04, POPV-05, POPV-06
**Success Criteria** (what must be TRUE):
  1. sp-popover positions its slotted content relative to an anchor element in any of 6 placements (bottom-start, bottom-end, top-start, top-end, right-start, left-start)
  2. When a popover would overflow the viewport, it auto-repositions to stay within a 10px margin
  3. Close-on-outside-click and close-on-escape behaviors can be toggled independently via props
  4. showPopover, hidePopover, togglePopover, and updatePosition methods work correctly; the component emits popover-open and popover-close events; content enters with a fade+slide animation
**Plans**: 2 plans
Plans:
- [ ] 09-01-PLAN.md — Core component: types, positioning engine, CSS animation, and full component implementation
- [ ] 09-02-PLAN.md — Tests: positioning utility unit tests, component spec tests, and E2E tests

### Phase 10: Language & Voice
**Goal**: sp-language-selector, sp-language-list, and sp-voice-input-button are fully ported from the vanilla JS originals with correct visual states, animations, events, and DWC theming
**Depends on**: Phase 9 (Popover Utility)
**Requirements**: LANG-01, LANG-02, LANG-03, LANG-04, LANG-05, LANG-06, VOIC-01, VOIC-02, VOIC-03, VOIC-04, VOIC-05, VOIC-06
**Success Criteria** (what must be TRUE):
  1. sp-language-selector renders as an inline button with a globe icon, uppercase language code, and dropdown arrow; clicking opens sp-language-list as an animated slide-in dropdown with a browser-preferred section and alphabetically sorted others
  2. Selecting a language emits a languageChange event with the language code; the selected language shows a checkmark in the list; the list auto-hides 3 seconds after the mouse leaves
  3. sp-voice-input-button renders as a 44px circular button with a microphone icon; hovering triggers a 2-second progress bar cue then opens the language dropdown
  4. When listening, the button turns red with a pulse animation and blinking recording indicator; errors trigger a shake animation with an error message; the mode indicator shows a globe or robot icon based on the mode prop
  5. Both component groups emit their full event sets (languageChange, start, stop, error, transcriptionUpdate) and support enabled/disabled, compact mode, and dark theme via DWC variables
**Plans**: TBD

### Phase 11: Communication & Splash
**Goal**: sp-communication-preferences (selector + list) and sp-splash are fully ported with correct channel icons, selection state, dismiss behaviors, slot-based content, and DWC theming
**Depends on**: Phase 9 (Popover Utility)
**Requirements**: COMM-01, COMM-02, COMM-03, COMM-04, COMM-05, SPLS-01, SPLS-02, SPLS-03, SPLS-04, SPLS-05, SPLS-06
**Success Criteria** (what must be TRUE):
  1. sp-communication-preferences renders an icon-based button showing the current channel; clicking opens a dropdown list of all 6 channels (APPLICATION, EMAIL, WHATSAPP, PHONE, MS_TEAMS, GOOGLE_CHAT) with icons and labels
  2. Selecting a channel emits a preferenceChange event; the selected channel shows a checkmark and highlight in the list; compact mode and dark theme work via DWC variables
  3. sp-splash renders a full-screen modal overlay with backdrop blur, gradient header, content area, and footer; all content areas are customizable via named slots (logo, title, subtitle, body, footer)
  4. Clicking the backdrop, pressing Escape, or clicking the close button all dismiss sp-splash with a fade/slide animation; show and hide methods control visibility programmatically; the component emits a close event on dismissal
**Plans**: TBD

### Phase 12: Docs & Tests
**Goal**: Every v1.1 component has up-to-date Docusaurus API reference pages and passes the 70% test coverage threshold
**Depends on**: Phases 7-11 (all v1.1 components complete)
**Requirements**: DOCS-01, DOCS-02, DOCS-03
**Success Criteria** (what must be TRUE):
  1. Docusaurus API reference pages for sp-org-chart and sp-walkthrough accurately reflect all new props, events, and methods added in v1.1
  2. New Docusaurus pages exist for sp-language-selector, sp-voice-input-button, sp-communication-preferences, sp-splash, and sp-popover — each with usage examples and prop tables
  3. Stencil spec and e2e tests for all new and refactored v1.1 components report 70% coverage or higher across statements, branches, functions, and lines
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | v1.0 | 3/3 | Complete | 2026-01-31 |
| 2. OrgChart Component | v1.0 | 2/2 | Complete | 2026-01-31 |
| 3. Walkthrough Component | v1.0 | 3/3 | Complete | 2026-01-31 |
| 4. Markdown Editor Component | v1.0 | 4/4 | Complete | 2026-01-31 |
| 5. Testing & Quality | v1.0 | 3/3 | Complete | 2026-02-20 |
| 6. Documentation & Publishing | v1.0 | 5/5 | Complete | 2026-02-21 |
| 7. Org Chart Parity | 3/3 | Complete   | 2026-02-21 | - |
| 8. Walkthrough Parity | 2/2 | Complete   | 2026-02-21 | - |
| 9. Popover Utility | v1.1 | 0/2 | Not started | - |
| 10. Language & Voice | v1.1 | 0/TBD | Not started | - |
| 11. Communication & Splash | v1.1 | 0/TBD | Not started | - |
| 12. Docs & Tests | v1.1 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-31*
*Last updated: 2026-02-21 — v1.1 milestone roadmap added (phases 7-12)*
