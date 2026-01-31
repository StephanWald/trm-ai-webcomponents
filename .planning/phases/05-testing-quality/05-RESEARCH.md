# Phase 5: Testing & Quality - Research

**Researched:** 2026-01-31
**Domain:** Test coverage enforcement and fallback rendering validation for Stencil.js web components
**Confidence:** HIGH

## Summary

This phase focuses on enforcing test quality gates via Jest coverage thresholds in CI and validating that components render with sensible defaults when DWC theme tokens are not loaded. The project already has 335 passing tests with 56.43% statement coverage, 46.34% branch coverage, and 50% function coverage. Current coverage gaps are primarily in component main files (sp-markdown-editor.tsx: 40.43%, sp-org-chart.tsx: 39.7%, sp-walkthrough.tsx: 40.95%) and some utility files (youtube-wrapper.ts: 14.58%, draggable-mixin.ts: 2.08%).

Stencil uses Jest as its test runner with configuration in stencil.config.ts rather than jest.config.js. Coverage thresholds are configured via the `testing.coverageThreshold` property following standard Jest patterns. When thresholds aren't met, Jest fails with a non-zero exit code, automatically failing CI builds. The existing DWC theme implementation already uses the `var(--dwc-*, fallback)` pattern throughout, providing built-in fallback rendering - tests just need to validate these fallbacks produce usable UI.

**Primary recommendation:** Configure Jest coverageThreshold in stencil.config.ts to enforce 70% minimum across all metrics globally, exclude E2E files and generated output via coveragePathIgnorePatterns, add spec tests targeting uncovered branches/statements in component main files, and create fallback rendering tests that verify components remain readable/functional without DWC theme loaded.

## Standard Stack

The established testing tools for Stencil.js projects:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Jest | 29.7.0 | Unit test runner | Built into Stencil Test Runner, official recommendation for spec tests |
| @stencil/core/testing | 4.41.0+ | Stencil testing utilities | Provides newSpecPage, mockDocument, waitForChanges for component testing |
| Playwright | 1.58.1+ | E2E test runner | Official Stencil recommendation via @stencil/playwright adapter |
| @stencil/playwright | 0.2.1+ | Stencil-Playwright adapter | Extends Playwright with waitForChanges, spyOnEvent, component hydration awareness |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @axe-core/playwright | Latest | Accessibility testing | For automated WCAG compliance checks in E2E tests |
| jest-coverage-report-action | Latest | GitHub Actions coverage reporting | For PR coverage comments and threshold enforcement in CI |
| Corti | Latest | SpeechRecognition mock | For testing browser APIs like SpeechRecognition without real implementation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Jest built into Stencil | Jest 30+ via jest-stencil-runner | More flexibility but requires manual configuration of presets, transpilation |
| Playwright | WebdriverIO, Puppeteer | WebdriverIO more heavyweight, Puppeteer deprecated by Stencil team |
| Coverage in stencil.config.ts | Separate jest.config.js | Doesn't work with `stencil test` command, requires manual Jest invocation |

**Installation:**
```bash
# Core testing stack already installed
npm install --save-dev @stencil/core@^4.41.0 jest@^29.7.0 @playwright/test@^1.58.1 @stencil/playwright@^0.2.1

# Optional: Accessibility testing
npm install --save-dev @axe-core/playwright

# Optional: Browser API mocking
npm install --save-dev corti
```

## Architecture Patterns

### Recommended Test Structure
```
src/
├── components/
│   ├── sp-component/
│   │   ├── sp-component.tsx           # Component implementation
│   │   ├── sp-component.spec.ts       # Unit tests (Jest)
│   │   ├── sp-component.e2e.ts        # E2E tests (Playwright)
│   │   ├── sp-component.css           # Component styles
│   │   └── utils/
│   │       ├── helper.ts
│   │       └── helper.spec.ts         # Utility unit tests
└── global/
    └── dwc-theme.css                  # Global theme tokens with fallbacks
```

### Pattern 1: Jest Coverage Threshold Configuration
**What:** Configure minimum coverage percentages in Stencil config that fail builds when not met
**When to use:** Always - enforces quality gates in CI/CD pipelines
**Example:**
```typescript
// Source: https://stenciljs.com/docs/testing-config + https://jestjs.io/docs/configuration#coveragethreshold-object
// stencil.config.ts
import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'skillspilot',
  globalStyle: 'src/global/dwc-theme.css',
  outputTargets: [/* ... */],
  testing: {
    // Coverage collection
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/*.e2e.ts',
      '!src/components.d.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

    // Exclude E2E and generated files
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '\\.e2e\\.ts$',
      '/dist/',
      '/www/',
      'components\\.d\\.ts$',
    ],

    // Enforce 70% minimum across all metrics
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
};
```

### Pattern 2: Fallback Rendering Tests
**What:** Validate components render with usable defaults when DWC theme tokens are not present
**When to use:** For each component to ensure standalone usability without theme framework
**Example:**
```typescript
// Source: Project pattern (dwc-theme.css uses var(--dwc-external-*, fallback))
// sp-component.spec.ts
describe('fallback rendering without DWC theme', () => {
  it('renders with readable text colors', async () => {
    const page = await newSpecPage({
      components: [SpComponent],
      html: '<sp-component></sp-component>',
      // Don't load global styles - test CSS custom property fallbacks
      supportsShadowDom: true,
    });

    const element = page.root?.shadowRoot?.querySelector('.component-text');
    const computedStyle = window.getComputedStyle(element as Element);

    // Verify fallback color is applied (not empty/invalid)
    expect(computedStyle.color).not.toBe('');
    expect(computedStyle.color).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
  });

  it('renders with adequate spacing', async () => {
    const page = await newSpecPage({
      components: [SpComponent],
      html: '<sp-component></sp-component>',
    });

    const container = page.root?.shadowRoot?.querySelector('.container');
    const computedStyle = window.getComputedStyle(container as Element);

    // Verify fallback padding is applied
    expect(computedStyle.padding).not.toBe('0px');
  });

  it('interactive elements are distinguishable', async () => {
    const page = await newSpecPage({
      components: [SpComponent],
      html: '<sp-component></sp-component>',
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    const computedStyle = window.getComputedStyle(button as Element);

    // Verify button has visible border or background
    const hasBorder = computedStyle.border !== 'none';
    const hasBackground = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
    expect(hasBorder || hasBackground).toBe(true);
  });
});
```

### Pattern 3: Browser API Mocking for Coverage
**What:** Mock browser APIs like SpeechRecognition, FileReader to test code paths without real implementations
**When to use:** When code uses browser APIs that are hard to test (speech, file I/O, print)
**Example:**
```typescript
// Source: https://github.com/TalAter/Corti + https://bholmes.dev/blog/mocking-browser-apis-fetch-localstorage-dates-the-easy-way-with-jest/
// speech-recognizer.spec.ts
beforeAll(() => {
  // Mock SpeechRecognition API
  const mockSpeechRecognition = jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    continuous: false,
    interimResults: false,
    lang: 'en-US',
    onresult: null,
    onerror: null,
    onend: null,
  }));

  (window as any).SpeechRecognition = mockSpeechRecognition;
  (window as any).webkitSpeechRecognition = mockSpeechRecognition;
});

it('starts speech recognition on button click', async () => {
  const mockStart = jest.fn();
  (window as any).SpeechRecognition.mockImplementation(() => ({
    start: mockStart,
    stop: jest.fn(),
    continuous: true,
    interimResults: true,
  }));

  const page = await newSpecPage({
    components: [SpMarkdownEditor],
    html: '<sp-markdown-editor></sp-markdown-editor>',
  });

  await page.rootInstance.startVoiceInput();
  expect(mockStart).toHaveBeenCalled();
});
```

### Pattern 4: Coverage Gap Analysis
**What:** Use coverage reports to identify untested code paths and target them with new tests
**When to use:** When adding tests to reach coverage threshold
**Example:**
```bash
# Source: Jest coverage reports + https://codewithhugo.com/jest-exclude-coverage/
# Run coverage report
npm test -- --coverage

# Analyze uncovered lines in report
# Example output shows:
# sp-markdown-editor.tsx | 40.43% | 33.69% | 38.57% | 41.02% | Lines 102-112,198,203...

# Add tests targeting specific uncovered line ranges:
# Lines 102-112: Mode switching logic
# Lines 255-266: Auto-save debouncing
# Lines 313-327: Toolbar action handlers
```

### Anti-Patterns to Avoid
- **Testing implementation details:** Don't test internal state that users can't observe; test public API and rendered output
- **Snapshot testing everything:** Snapshot tests are fragile for frequently changing UI; prefer targeted assertions
- **Ignoring coverage with istanbul comments:** Don't use `/* istanbul ignore */` to hide hard-to-test code; mock dependencies instead
- **100% coverage obsession:** 70% is pragmatic threshold; chasing last 30% often tests trivial code at high cost
- **E2E tests for unit coverage:** E2E tests are slow and don't count toward Jest coverage; use spec tests for coverage metrics

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CI coverage enforcement | Custom script parsing coverage JSON | Jest coverageThreshold + jest-coverage-report-action | Jest native threshold support fails builds automatically; GitHub Actions provide PR comments with delta |
| Accessibility testing | Manual keyboard navigation tests | @axe-core/playwright | Axe catches 30-40% of WCAG issues automatically; manual tests miss edge cases |
| SpeechRecognition mocking | Custom mock implementation | Corti library | Handles complex event lifecycle, multiple browser prefixes (webkit, moz), edge cases |
| Coverage exclusion | Manually editing coverage reports | coveragePathIgnorePatterns + istanbul comments | Jest built-in exclusion prevents files from being instrumented, faster and more reliable |
| Component hydration waiting | setTimeout or manual polling | @stencil/playwright waitForChanges() | Knows Stencil lifecycle, waits for actual hydration not arbitrary timeouts |

**Key insight:** Testing infrastructure has mature solutions for coverage enforcement, accessibility validation, and API mocking. Custom implementations miss edge cases and require ongoing maintenance. Use proven tools that integrate with Jest/Playwright ecosystems.

## Common Pitfalls

### Pitfall 1: Coverage Threshold Configuration Scope Confusion
**What goes wrong:** Configuring thresholds in jest.config.js instead of stencil.config.ts, causing thresholds to be ignored
**Why it happens:** Jest documentation shows jest.config.js examples, but Stencil overrides this with its own config
**How to avoid:** Always configure testing options in stencil.config.ts under the `testing` property; jest.config.js is ignored when using `stencil test` command
**Warning signs:** Running `npm test` succeeds but coverage threshold isn't enforced; no "Coverage threshold" messages in output

### Pitfall 2: E2E Tests Counted Toward Coverage
**What goes wrong:** Including .e2e.ts files in coverage calculation inflates coverage metrics without testing component logic
**Why it happens:** Default collectCoverageFrom patterns may be too broad
**How to avoid:** Explicitly exclude E2E files via `coveragePathIgnorePatterns: ['\\.e2e\\.ts$']` or `collectCoverageFrom: ['!src/**/*.e2e.ts']`
**Warning signs:** Coverage report shows .e2e.ts files listed; coverage jumps unexpectedly when E2E tests are added

### Pitfall 3: Testing Shadow DOM Without supportsShadowDom Flag
**What goes wrong:** Tests pass but don't reflect real browser behavior because Shadow DOM isn't enabled
**Why it happens:** newSpecPage defaults to mocking Shadow DOM for easier testing but misses real-world issues
**How to avoid:** Set `supportsShadowDom: true` in newSpecPage options when testing CSS, slots, or fallback rendering
**Warning signs:** Tests pass but E2E tests or manual testing shows different behavior; CSS selectors work in tests but fail in browser

### Pitfall 4: Fallback Values Not Actually Tested
**What goes wrong:** Assuming var(--dwc-*, fallback) works without validating fallback values render correctly
**Why it happens:** Tests use global styles which load DWC tokens, masking fallback behavior
**How to avoid:** Create dedicated test suites that don't load global styles; use `getComputedStyle()` to verify actual rendered values match fallback expectations
**Warning signs:** Components look broken when used outside Skillspilot/DWC ecosystem; users report "invisible text" or "collapsed layout"

### Pitfall 5: Hard-Coding Coverage Percentages for Individual Files
**What goes wrong:** Setting per-file thresholds like `'./src/components/sp-org-chart/sp-org-chart.tsx': { statements: 90 }` creates maintenance burden
**Why it happens:** Trying to enforce strict coverage on critical files
**How to avoid:** Use global threshold for baseline quality; address coverage gaps with targeted tests rather than per-file rules
**Warning signs:** Config file full of individual file paths; build failures on minor refactoring; team spends time adjusting thresholds instead of writing tests

### Pitfall 6: Mocking Too Little or Too Much
**What goes wrong:** Not mocking browser APIs leads to test failures in CI; over-mocking leads to tests that pass but don't catch real bugs
**Why it happens:** Balancing test isolation vs. integration is hard
**How to avoid:** Mock only external dependencies (browser APIs, network, file system); don't mock component internals or utility functions within your codebase
**Warning signs:** Tests fail with "SpeechRecognition is not defined" in CI; tests pass but production has speech recognition bugs

## Code Examples

Verified patterns from official sources:

### GitHub Actions CI with Coverage Threshold
```yaml
# Source: https://github.com/ArtiomTr/jest-coverage-report-action
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [master, develop]
  pull_request:
    branches: [master, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run build

      # Jest coverage with threshold enforcement
      - name: Run tests with coverage
        run: npm test -- --coverage
        # Jest will exit with code 1 if threshold not met, failing the build

      # Optional: Report coverage in PR comments
      - name: Jest Coverage Report
        if: github.event_name == 'pull_request'
        uses: ArtiomTr/jest-coverage-report-action@v2
        with:
          threshold: 70
          annotations: coverage

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E Tests
        run: npm run test.e2e
```

### Excluding Files from Coverage
```typescript
// Source: https://codewithhugo.com/jest-exclude-coverage/
// stencil.config.ts
export const config: Config = {
  testing: {
    // Method 1: collectCoverageFrom with negation patterns
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',          // Exclude type definitions
      '!src/**/*.e2e.ts',        // Exclude E2E tests
      '!src/components.d.ts',    // Exclude generated component types
    ],

    // Method 2: coveragePathIgnorePatterns with regex
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '\\.e2e\\.ts$',            // Exclude E2E files
      '/dist/',                  // Exclude build output
      '/www/',                   // Exclude dev server output
      'components\\.d\\.ts$',    // Exclude generated types
    ],
  },
};
```

### Inline Coverage Exclusion
```typescript
// Source: https://eloquentcode.com/istanbul-ignore-syntax-for-jest-code-coverage
// Use sparingly - prefer mocking over exclusion

/* istanbul ignore file */
// At top of file: exclude entire file from coverage

export class LegacyUtil {
  /* istanbul ignore next */
  deprecatedMethod() {
    // Exclude specific function
    return oldImplementation();
  }

  handleBrowserQuirk() {
    if (isIE11) {
      /* istanbul ignore next */
      return ie11Workaround();
    } else {
      return standardImplementation();
    }
  }
}
```

### Testing Component Without Theme
```typescript
// Source: Project pattern (dwc-theme.css implementation)
// sp-org-chart.spec.ts
describe('fallback rendering', () => {
  it('renders tree with system fonts when DWC theme not loaded', async () => {
    const page = await newSpecPage({
      components: [SpOrgChart],
      html: `
        <sp-org-chart>
          <script type="application/json">
            [{"id":"1","name":"CEO","managerId":null}]
          </script>
        </sp-org-chart>
      `,
      supportsShadowDom: true,
    });

    // Component uses var(--dwc-font-family, system-ui, -apple-system, ...)
    const tile = page.root?.shadowRoot?.querySelector('.user-tile');
    const computedStyle = window.getComputedStyle(tile as Element);

    // Verify fallback font stack is applied
    expect(computedStyle.fontFamily).toContain('system-ui');
  });

  it('has readable text with fallback colors', async () => {
    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    const text = page.root?.shadowRoot?.querySelector('.user-name');
    const computedStyle = window.getComputedStyle(text as Element);

    // Component uses var(--dwc-color-text, #1a1a1a)
    // Verify fallback color provides contrast
    expect(computedStyle.color).toBe('rgb(26, 26, 26)'); // #1a1a1a
  });

  it('layout does not collapse without theme spacing', async () => {
    const page = await newSpecPage({
      components: [SpOrgChart],
      html: `
        <sp-org-chart>
          <script type="application/json">
            [{"id":"1","name":"CEO","managerId":null}]
          </script>
        </sp-org-chart>
      `,
    });

    await page.waitForChanges();

    const container = page.root?.shadowRoot?.querySelector('.tree-container');
    const rect = (container as Element).getBoundingClientRect();

    // Verify container has height (not collapsed)
    expect(rect.height).toBeGreaterThan(0);
  });
});
```

### Mocking FileReader for File Upload Tests
```typescript
// Source: https://bholmes.dev/blog/mocking-browser-apis-fetch-localstorage-dates-the-easy-way-with-jest/
// file-handler.spec.ts
describe('file upload', () => {
  let mockFileReader: any;

  beforeEach(() => {
    mockFileReader = {
      readAsText: jest.fn(),
      result: '',
      onload: null,
      onerror: null,
    };

    (window as any).FileReader = jest.fn(() => mockFileReader);
  });

  it('reads markdown file content', async () => {
    const fileContent = '# Test Markdown';
    const mockFile = new File([fileContent], 'test.md', { type: 'text/markdown' });

    const page = await newSpecPage({
      components: [SpMarkdownEditor],
      html: '<sp-markdown-editor></sp-markdown-editor>',
    });

    // Trigger file upload
    const uploadPromise = page.rootInstance.loadFromFile(mockFile);

    // Simulate FileReader success
    mockFileReader.result = fileContent;
    mockFileReader.onload?.({ target: mockFileReader });

    await uploadPromise;
    const content = await page.rootInstance.getContent();

    expect(content).toBe(fileContent);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Puppeteer for E2E | Playwright via @stencil/playwright | 2023-2024 | Better cross-browser support, faster execution, Stencil-aware helpers |
| Jest v27 built-in | Jest v29 built-in + v30 external option | Stencil 4.13.0+ | Better ESM support, faster execution, optional newer Jest features |
| Manual coverage checking | coverageThreshold in config | Jest 20+ | Automatic build failures prevent coverage regressions |
| istanbul.js directly | Istanbul via Jest | Jest adoption | Integrated coverage without separate tool configuration |

**Deprecated/outdated:**
- **Puppeteer E2E testing:** Stencil team moved to Playwright; Puppeteer no longer officially supported
- **Stencil Test Runner for E2E:** Deprecated in favor of dedicated E2E frameworks (Playwright, WebdriverIO)
- **jest.config.js with Stencil:** Doesn't work with `stencil test` command; use stencil.config.ts testing property instead
- **Screenshots API:** Stencil removed built-in screenshot testing; use Playwright's screenshot capabilities

## Open Questions

Things that couldn't be fully resolved:

1. **E2E Coverage Collection**
   - What we know: Playwright doesn't naturally contribute to Jest coverage reports; E2E files excluded from coverage calculation
   - What's unclear: Whether to collect browser-side coverage during E2E tests and merge with unit coverage
   - Recommendation: Don't merge E2E coverage - focus on spec tests for coverage metrics, use E2E for integration validation only

2. **Accessibility Testing Threshold**
   - What we know: @axe-core/playwright can detect WCAG violations automatically; not part of this phase scope
   - What's unclear: Whether to add accessibility tests now or defer to future quality phase
   - Recommendation: Defer automated accessibility testing to future phase; Phase 5 focuses on coverage thresholds and fallback rendering only

3. **Coverage for Browser-Only APIs**
   - What we know: SpeechRecognition, FileReader, print() are hard to test; mocking is feasible
   - What's unclear: Whether mocked tests provide meaningful coverage or false confidence
   - Recommendation: Mock for coverage but also maintain manual testing checklist for real browser validation

## Sources

### Primary (HIGH confidence)
- Stencil Testing Config: https://stenciljs.com/docs/testing-config
- Jest Coverage Threshold: https://jestjs.io/docs/configuration#coveragethreshold-object
- Stencil Testing Overview: https://stenciljs.com/docs/testing-overview
- @stencil/playwright npm: https://www.npmjs.com/package/@stencil/playwright
- Stencil Playwright Overview: https://stenciljs.com/docs/testing/playwright/overview

### Secondary (MEDIUM confidence)
- Jest Coverage Exclusion Guide: https://codewithhugo.com/jest-exclude-coverage/
- Istanbul Ignore Syntax: https://eloquentcode.com/istanbul-ignore-syntax-for-jest-code-coverage
- Mocking Browser APIs with Jest: https://bholmes.dev/blog/mocking-browser-apis-fetch-localstorage-dates-the-easy-way-with-jest/
- Playwright Accessibility Testing: https://playwright.dev/docs/accessibility-testing
- Corti SpeechRecognition Mock: https://github.com/TalAter/Corti
- ArtiomTr jest-coverage-report-action: https://github.com/ArtiomTr/jest-coverage-report-action

### Tertiary (LOW confidence)
- Stencil Jest Search Results: Multiple community tutorials and blog posts from 2025-2026
- WebSearch results on testing best practices: Various community patterns, not officially verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools verified via official documentation and package.json inspection
- Architecture: HIGH - Patterns verified via Stencil docs, Jest docs, and existing project structure
- Pitfalls: MEDIUM - Based on common community issues and search results, not all officially documented

**Research date:** 2026-01-31
**Valid until:** 2026-03-31 (60 days - Stencil and Jest stable, slow-moving ecosystem)
