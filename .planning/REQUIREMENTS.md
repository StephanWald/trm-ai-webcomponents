# Requirements: Skillspilot Web Components

**Defined:** 2026-02-21
**Core Value:** Developers can add a single script tag or npm install and immediately use production-ready, self-contained Skillspilot UI components that look and behave consistently — without framework lock-in.

## v1.1 Requirements

Requirements for v1.1 release. Each maps to roadmap phases.

### Org Chart Parity (ORGC)

- [x] **ORGC-01**: Org chart renders as vertical indented list (subordinates nested below/right with left-margin indent and CSS border connectors), matching original layout
- [x] **ORGC-02**: User data model supports firstName, lastName, email, phone, branchId, branchName, branchLogo, avatar, role, reportsTo fields
- [x] **ORGC-03**: User tile displays horizontally (avatar left, info right) with name, role, email, phone, and branch badge
- [x] **ORGC-04**: Branch entities (no lastName) render with square logo avatar and branch-specific styling
- [x] **ORGC-05**: Branch filtering via filterMode and filterBranchId props dims non-matching users and hides unrelated branches
- [x] **ORGC-06**: Drag-and-drop shows custom floating preview (avatar + name) following cursor, hiding native drag image
- [x] **ORGC-07**: Drop zones appear bottom-right with SVG icons for Unlink and Delete actions
- [x] **ORGC-08**: Delete drop zone requires 4-second timed hold with circular progress countdown overlay following cursor
- [x] **ORGC-09**: Editable prop defaults to true; when false, drag and delete are disabled
- [x] **ORGC-10**: Component emits user-click, user-dblclick, hierarchy-change, and user-delete events with original event detail shapes
- [x] **ORGC-11**: highlightUser, scrollToUser, clearHighlight, and getSelected public methods work correctly
- [x] **ORGC-12**: All colors/fonts use DWC CSS custom properties with sensible fallback defaults

### Walkthrough Parity (WALK)

- [x] **WALK-01**: Controls use Tabler SVG icons (play, pause, skip-back-10, skip-forward-10, restart, close, volume, volume-off, chevron-left/right, list, tool, pointer, plus, check, pencil, trash, subtitles, copy)
- [x] **WALK-02**: Visual progress bar displays in controls row showing current playback position with click-to-seek
- [x] **WALK-03**: Skip backward 10s and skip forward 10s buttons present and functional
- [x] **WALK-04**: Restart button returns playback to beginning
- [x] **WALK-05**: Scene list displays as custom popup (not native select dropdown) with title and timestamp per scene
- [x] **WALK-06**: Volume control renders as vertical popup slider (rotated 90deg) with custom thumb/track styling
- [x] **WALK-07**: Custom caption rendering with styled overlay (dark background, white text, text shadow) instead of native browser captions
- [x] **WALK-08**: Scene description supports markdown rendering in text bubble (h1-h3, p, ul, ol, code, pre)
- [x] **WALK-09**: Highlight animations match original: reddish-brown border with dual glow, green active state, breathing animation (1.5s ease-in-out)
- [x] **WALK-10**: Controls layout matches original single-row design without separate panel header
- [x] **WALK-11**: All colors/fonts use DWC CSS custom properties with sensible fallback defaults

### Language Selector (LANG)

- [ ] **LANG-01**: sp-language-selector renders as inline button with globe icon, uppercase language code, and dropdown arrow
- [ ] **LANG-02**: sp-language-list renders animated slide-in dropdown with browser-preferred languages section and alphabetically sorted others
- [ ] **LANG-03**: User can select a language and component emits languageChange event with language code
- [ ] **LANG-04**: Selected language shows checkmark indicator in list
- [ ] **LANG-05**: List auto-hides after 3 seconds when mouse leaves, with viewport boundary detection
- [ ] **LANG-06**: Components support enabled/disabled state, compact mode, and dark theme via DWC variables

### Voice Input Button (VOIC)

- [ ] **VOIC-01**: sp-voice-input-button renders as circular button (44px) with microphone SVG icon
- [ ] **VOIC-02**: Hover triggers language cue with 2-second progress bar, then language dropdown appears
- [ ] **VOIC-03**: Listening state changes button to red with pulse animation and blinking recording indicator
- [ ] **VOIC-04**: Component emits start, stop, error, transcriptionUpdate, and languageChange events
- [ ] **VOIC-05**: Error state triggers shake animation with error message display
- [ ] **VOIC-06**: Mode indicator shows browser (globe) or AI (robot) icon based on mode prop

### Communication Preferences (COMM)

- [ ] **COMM-01**: sp-communication-preferences selector renders icon-based button showing current channel preference
- [ ] **COMM-02**: Dropdown list shows available channels (APPLICATION, EMAIL, WHATSAPP, PHONE, MS_TEAMS, GOOGLE_CHAT) with icons and labels
- [ ] **COMM-03**: User can select a channel and component emits preferenceChange event
- [ ] **COMM-04**: Selected channel shows checkmark in list with highlight styling
- [ ] **COMM-05**: Components support compact mode and dark theme via DWC variables

### Splash Screen (SPLS)

- [ ] **SPLS-01**: sp-splash renders full-screen modal overlay with backdrop blur
- [ ] **SPLS-02**: Splash container displays with gradient header, content area, and footer
- [ ] **SPLS-03**: Close button (top-right), Escape key, and backdrop click all dismiss the splash
- [ ] **SPLS-04**: Show/hide methods control visibility with fade/slide animations
- [ ] **SPLS-05**: Component emits close event when dismissed
- [ ] **SPLS-06**: Content is customizable via slots (logo, title, subtitle, body, footer)

### Popover (POPV)

- [ ] **POPV-01**: sp-popover positions content relative to anchor element with 6 placement options (bottom-start, bottom-end, top-start, top-end, right-start, left-start)
- [ ] **POPV-02**: Popover respects viewport boundaries with 10px margin and auto-repositions
- [ ] **POPV-03**: Close-on-outside-click and close-on-escape behaviors are configurable
- [ ] **POPV-04**: showPopover, hidePopover, togglePopover, and updatePosition public methods work correctly
- [ ] **POPV-05**: Content is inserted via named slot with enter animation (fade + slide)
- [ ] **POPV-06**: Component emits popover-open and popover-close events

### Documentation & Testing (DOCS)

- [ ] **DOCS-01**: Docusaurus API reference pages updated for refactored sp-org-chart and sp-walkthrough
- [ ] **DOCS-02**: Docusaurus pages created for each new component (language-selector, voice-input-button, communication-preferences, splash, popover)
- [ ] **DOCS-03**: Stencil spec and e2e tests written for all new and refactored components meeting 70% coverage threshold

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Framework Wrappers

- **WRAP-01**: React wrapper package with typed components
- **WRAP-02**: Angular wrapper package with directives
- **WRAP-03**: Vue wrapper package with typed components

### Quality & Tooling

- **QUAL-01**: Visual regression testing with screenshot comparison in CI
- **QUAL-02**: Automated accessibility testing (axe-core) in CI
- **QUAL-03**: Performance budget enforcement (bundle size limits per component)
- **QUAL-04**: Component playground with real-time prop editing and code generation

### Additional Components

- **COMP-01**: Port speech components (SpeechTranscription, UnifiedSpeechToText, TextToSpeech)
- **COMP-02**: Port avatar components (KaiAvatar, TalkingAvatar, DIDStreaming, TalkingHead)
- **COMP-03**: Port ElevenLabsConversation voice AI component
- **COMP-04**: Port AudioRecorder utility

## Out of Scope

| Feature | Reason |
|---------|--------|
| Speech/avatar components | Complex external dependencies (WebRTC, Three.js, ElevenLabs API); defer to v2 |
| Framework wrappers | Web components work everywhere; wrappers add complexity for v1.x |
| Visual regression testing | Defer to after visual parity is achieved |
| ElevenLabs conversation | Requires API key integration and WebRTC; separate milestone |
| Server-side rendering | CDN/client-side only |
| Custom themes beyond DWC | DWC theme engine handles this |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ORGC-01 | Phase 7 | Complete |
| ORGC-02 | Phase 7 | Complete |
| ORGC-03 | Phase 7 | Complete |
| ORGC-04 | Phase 7 | Complete |
| ORGC-05 | Phase 7 | Complete |
| ORGC-06 | Phase 7 | Complete |
| ORGC-07 | Phase 7 | Complete |
| ORGC-08 | Phase 7 | Complete |
| ORGC-09 | Phase 7 | Complete |
| ORGC-10 | Phase 7 | Complete |
| ORGC-11 | Phase 7 | Complete |
| ORGC-12 | Phase 7 | Complete |
| WALK-01 | Phase 8 | Complete |
| WALK-02 | Phase 8 | Complete |
| WALK-03 | Phase 8 | Complete |
| WALK-04 | Phase 8 | Complete |
| WALK-05 | Phase 8 | Complete |
| WALK-06 | Phase 8 | Complete |
| WALK-07 | Phase 8 | Complete |
| WALK-08 | Phase 8 | Complete |
| WALK-09 | Phase 8 | Complete |
| WALK-10 | Phase 8 | Complete |
| WALK-11 | Phase 8 | Complete |
| LANG-01 | Phase 10 | Pending |
| LANG-02 | Phase 10 | Pending |
| LANG-03 | Phase 10 | Pending |
| LANG-04 | Phase 10 | Pending |
| LANG-05 | Phase 10 | Pending |
| LANG-06 | Phase 10 | Pending |
| VOIC-01 | Phase 10 | Pending |
| VOIC-02 | Phase 10 | Pending |
| VOIC-03 | Phase 10 | Pending |
| VOIC-04 | Phase 10 | Pending |
| VOIC-05 | Phase 10 | Pending |
| VOIC-06 | Phase 10 | Pending |
| COMM-01 | Phase 11 | Pending |
| COMM-02 | Phase 11 | Pending |
| COMM-03 | Phase 11 | Pending |
| COMM-04 | Phase 11 | Pending |
| COMM-05 | Phase 11 | Pending |
| SPLS-01 | Phase 11 | Pending |
| SPLS-02 | Phase 11 | Pending |
| SPLS-03 | Phase 11 | Pending |
| SPLS-04 | Phase 11 | Pending |
| SPLS-05 | Phase 11 | Pending |
| SPLS-06 | Phase 11 | Pending |
| POPV-01 | Phase 9 | Pending |
| POPV-02 | Phase 9 | Pending |
| POPV-03 | Phase 9 | Pending |
| POPV-04 | Phase 9 | Pending |
| POPV-05 | Phase 9 | Pending |
| POPV-06 | Phase 9 | Pending |
| DOCS-01 | Phase 12 | Pending |
| DOCS-02 | Phase 12 | Pending |
| DOCS-03 | Phase 12 | Pending |

**Coverage:**
- v1.1 requirements: 50 total
- Mapped to phases: 50
- Unmapped: 0

---
*Requirements defined: 2026-02-21*
*Last updated: 2026-02-21 — traceability complete, all 50 requirements mapped to phases 7-12*
