# Stencil.js Component Library Pitfalls

Critical mistakes when porting vanilla JS web components to Stencil and distributing component libraries.

---

## 1. Peer Dependency Bundling Hell

### The Problem
Stencil automatically inlines third-party dependencies into component bundles. For components using marked (~50KB), DOMPurify (~20KB), Prism.js (~10KB), and Turndown (~15KB), this creates 95KB+ bundles **per component** even when consuming apps already have these libraries.

### Warning Signs
- Bundle sizes balloon unexpectedly (check `dist/` output)
- Multiple copies of the same library loaded in browser DevTools Network tab
- "Custom element already defined" errors when consuming app also uses your peer deps
- CDN distribution fails with CORS errors for web workers

### Prevention Strategy
1. **DO NOT rely on automatic bundling** for large dependencies
2. Use `externalRuntime` config and document peer dependency requirements:
```typescript
// stencil.config.ts
export const config: Config = {
  // Stencil has no built-in peer deps config - you must handle externally
  rollupPlugins: {
    after: [
      // Custom rollup config to externalize deps
    ]
  }
};
```
3. Document that consumers must provide marked/DOMPurify/Prism/Turndown
4. Use dynamic imports for large libraries to enable code splitting

### Phase to Address
**Phase 1 (Architecture)** - Define peer dependency strategy before any porting begins

---

## 2. Shadow DOM Event Retargeting Breaks Drag & Drop

### The Problem
Shadow DOM event retargeting changes `event.target` to the host element, breaking vanilla drag-and-drop code that relies on `dragstart`, `drop`, etc. targeting inner elements. Your OrgChart's drag-and-drop will mysteriously fail.

### Warning Signs
- `event.target` is always the custom element, never the dragged child
- Drop zone detection fails
- `dataTransfer` works but positioning logic breaks

### Prevention Strategy
1. **Replace all `event.target` with `event.composedPath()[0]`** in drag handlers:
```typescript
handleDragStart(event: DragEvent) {
  // WRONG: const dragged = event.target;
  // RIGHT:
  const dragged = event.composedPath()[0] as HTMLElement;
}
```
2. Ensure drag events have `composed: true` when using `@Event()`:
```typescript
@Event({
  eventName: 'orgNodeDragged',
  composed: true,  // CRITICAL
  bubbles: true
})
```
3. Test drag-and-drop early in development, not at the end

### Phase to Address
**Phase 2 (OrgChart Port)** - Before porting drag logic

---

## 3. CSS Custom Properties Are Not Enough for Theming

### The Problem
Your vanilla components use `--dwc-*` variables extensively. While CSS custom properties pierce Shadow DOM, they only allow changing predefined values, not adding new styles or overriding structural CSS.

### Warning Signs
- Users complain they can't customize layout/spacing/fonts beyond your variables
- Feature requests for "just let me override this one style"
- Dozens of new CSS variables requested to expose more styling

### Prevention Strategy
1. **Combine CSS custom properties with `::part()` selectors**:
```css
/* In component */
.markdown-toolbar::part(button) { /* ... */ }

/* Consumers can do */
markdown-editor::part(button) {
  /* Any styles they want */
}
```
2. Add `part` attributes to key elements:
```tsx
<button part="toolbar-button">Bold</button>
```
3. Document **both** theming approaches:
   - CSS vars for colors/spacing (easy)
   - `::part()` for structural changes (advanced)

### Phase to Address
**Phase 1 (Architecture)** - Define theming strategy in design phase

---

## 4. Async Lifecycle Timing Chaos

### The Problem
Vanilla components use synchronous `connectedCallback()`. Stencil's async rendering with `componentWillLoad()` returning Promises creates race conditions when loading data (e.g., Walkthrough loading video metadata).

### Warning Signs
- "Cannot read property of undefined" in `render()`
- Flashing of unstyled content
- Parent component renders before child finishes loading
- Data fetched in `componentWillLoad()` sometimes available, sometimes not

### Prevention Strategy
1. **Always return Promise from `componentWillLoad()` when doing async work**:
```typescript
async componentWillLoad() {
  // CRITICAL: Must be async and return
  this.data = await fetch('/api/data').then(r => r.json());
  // Parent won't render until this completes
}
```
2. **Never use async `render()`** - it's not supported
3. Use loading states to prevent rendering with undefined data:
```typescript
render() {
  if (!this.data) return <div>Loading...</div>;
  // Safe to use this.data here
}
```
4. Call `await page.waitForChanges()` in E2E tests after updates

### Phase to Address
**Phase 2-4 (Component Ports)** - As each component is ported

---

## 5. @Watch Doesn't Fire on Initial Render

### The Problem
Vanilla components handle initial property values the same as updates. Stencil's `@Watch` only fires on **subsequent** changes, not initial render, causing initialization logic to be skipped.

### Warning Signs
- Component doesn't initialize correctly with props
- Works when props change, fails on first load
- Duplicate code in `componentWillLoad()` and `@Watch` handler

### Prevention Strategy
1. **Call watch handler manually in `componentWillLoad()`**:
```typescript
@Prop() videoUrl: string;

componentWillLoad() {
  this.handleVideoUrlChange(this.videoUrl, undefined);
}

@Watch('videoUrl')
handleVideoUrlChange(newUrl: string, oldUrl: string) {
  // Both initial and updates handled here
}
```
2. Or use computed state in `render()` instead of watch handlers
3. Document this timing difference when porting vanilla lifecycle code

### Phase to Address
**Phase 2-4 (Component Ports)** - During initial property handling

---

## 6. Reference Mutation Doesn't Trigger Re-renders

### The Problem
Vanilla components mutate objects/arrays directly. Stencil uses reference equality checks - `array.push()` or `object.property = value` won't trigger re-renders.

### Warning Signs
- UI doesn't update after state changes
- Forced to call `forceUpdate()`
- Timeline data in Walkthrough updates but doesn't re-render

### Prevention Strategy
1. **Always create new references with spread operator**:
```typescript
// WRONG:
this.items.push(newItem);

// RIGHT:
this.items = [...this.items, newItem];

// WRONG:
this.config.title = 'New Title';

// RIGHT:
this.config = { ...this.config, title: 'New Title' };
```
2. Apply to all `@State()` and `@Prop()` decorated properties
3. Search codebase for `.push()`, `.splice()`, `.sort()` in-place mutations

### Phase to Address
**Phase 2-4 (Component Ports)** - Code review before marking component complete

---

## 7. Slot Forwarding with Different Names Breaks

### The Problem
If your vanilla components pass slotted content through multiple levels with name changes, it will fail in Stencil. E.g., `<slot name="toolbar" slot="header">` doesn't work.

### Warning Signs
- Slotted content disappears in nested components
- Works in vanilla, breaks in Stencil
- Conditional slots always render even when hidden

### Prevention Strategy
1. **Keep slot names consistent across nesting levels**
2. Don't rename slots when forwarding:
```tsx
// WRONG:
<parent-component>
  <slot name="start" slot="main" />  // Renaming
</parent-component>

// RIGHT:
<parent-component>
  <slot name="toolbar" />  // Same name
</parent-component>
```
3. Enable `experimentalSlotFixes` in config if needed
4. Audit all `<slot>` usage in vanilla code before porting

### Phase to Address
**Phase 1 (Architecture)** - Map slot hierarchy in design phase

---

## 8. Custom Events Don't Escape Shadow DOM

### The Problem
Vanilla components dispatch events with `bubbles: true`. In Stencil with Shadow DOM, you **also** need `composed: true` for events to escape the shadow boundary.

### Warning Signs
- Parent components can't hear events from children
- Events work in DevTools but not in listening code
- `addEventListener` on custom element receives nothing

### Prevention Strategy
1. **Always set both `bubbles` and `composed` to true**:
```typescript
@Event({
  eventName: 'walkthroughComplete',
  composed: true,  // CRITICAL for Shadow DOM
  bubbles: true,
  cancelable: true
})
completed: EventEmitter<void>;
```
2. Test event propagation early with parent/child component examples
3. Check all vanilla event dispatches for missing `composed` flag

### Phase to Address
**Phase 2-4 (Component Ports)** - When porting event logic

---

## 9. Dist vs. Dist-Custom-Elements Output Confusion

### The Problem
Stencil offers two distribution strategies with very different behaviors:
- `dist` = lazy-loaded, self-bootstrapping (Ionic style)
- `dist-custom-elements` = tree-shakeable, no lazy loading

Choosing wrong one breaks CDN usage or tree-shaking for npm consumers.

### Warning Signs
- CDN users get massive bundle downloads
- npm users complain about bundle size
- "Custom element already defined" errors
- Tree-shaking doesn't work

### Prevention Strategy
1. **Generate BOTH outputs** for different use cases:
```typescript
outputTargets: [
  { type: 'dist' },              // For CDN + lazy loading
  { type: 'dist-custom-elements' } // For npm + bundlers
]
```
2. Document which consumers should use which:
   - CDN/script tag → `dist` loader
   - Webpack/Vite/Rollup → `dist-custom-elements`
3. Set up npm package exports for both:
```json
{
  "main": "dist/index.cjs.js",
  "module": "dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/components/index.js",
      "require": "./dist/components/index.cjs.js"
    },
    "./loader": "./dist/loader/index.js"
  }
}
```

### Phase to Address
**Phase 1 (Architecture)** - Before any component porting

---

## 10. E2E Tests Don't Mock Fetch in Browser Context

### The Problem
Stencil E2E tests use Puppeteer (real browser). Mocking fetch/XHR in Node test context doesn't affect component code running in browser.

### Warning Signs
- Mocks work in unit tests, fail in E2E
- Components make real network requests during tests
- "Request is already handled!" Puppeteer errors
- E2E tests timeout waiting for network calls

### Prevention Strategy
1. **Use Puppeteer's `page.setRequestInterception()` for E2E mocks**:
```typescript
it('should render markdown', async () => {
  const page = await newE2EPage();
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('/api/')) {
      req.respond({ body: JSON.stringify({ data: 'mock' }) });
    } else {
      req.continue();
    }
  });
  // ...
});
```
2. Don't use Jest mocks (they run in Node, not browser)
3. Test components that fetch on `componentWillLoad()` carefully
4. Use `await page.waitForChanges()` after triggering updates

### Phase to Address
**Phase 5 (Testing Infrastructure)** - When setting up E2E test patterns

---

## 11. TypeScript Generated Types Drift from Runtime

### The Problem
Stencil auto-generates `components.d.ts` with types for JSX/HTMLElement interfaces. If this file isn't committed or gets out of sync, consumers get type errors even though runtime works.

### Warning Signs
- "Property X does not exist on type HTMLMyComponentElement"
- Types work locally but fail in consuming projects
- CI builds pass but local dev fails (or vice versa)

### Prevention Strategy
1. **Always commit `components.d.ts` to source control**
2. Add generation check to CI:
```bash
npm run build
git diff --exit-code src/components.d.ts
```
3. Enable `strict: true` in `tsconfig.json` from day one
4. Generate types for framework wrappers (React, Vue, Angular) if needed

### Phase to Address
**Phase 1 (Setup)** - In initial project config

---

## 12. Docusaurus Imports Web Components Directly (Build Fails)

### The Problem
Docusaurus (and Gatsby) generate static HTML using Node.js, which can't execute browser-only Web Component code. Direct imports cause "window is not defined" build errors.

### Warning Signs
- Docusaurus `npm run build` fails with "window is not defined"
- Works in dev mode, fails in production build
- Custom elements registration code runs during SSG

### Prevention Strategy
1. **Don't import components directly in Docusaurus**:
```jsx
// WRONG:
import 'dwc-markdown-editor';

// RIGHT - Use script tag or dynamic import:
useEffect(() => {
  import('dwc-markdown-editor');
}, []);
```
2. Or use Stencil's `docs-json` output target to generate docs:
```typescript
outputTargets: [
  {
    type: 'docs-json',
    file: 'docs/components.json'
  }
]
```
3. Build custom Docusaurus plugin to consume JSON and render docs
4. Load components via CDN in live examples only

### Phase to Address
**Phase 6 (Documentation)** - When integrating with Docusaurus

---

## 13. Large Dependencies Cause Initial Load Bottleneck

### The Problem
The Markdown Editor is 7k LOC plus marked/DOMPurify/Prism/Turndown. Bundling all ~95KB on first interaction creates noticeable lag.

### Warning Signs
- First render takes >500ms
- Lighthouse performance score tanks
- "Long tasks" warnings in DevTools
- Users see blank component before hydration

### Prevention Strategy
1. **Use dynamic imports for heavy deps**:
```typescript
async componentWillLoad() {
  // Don't bundle - load on demand
  const [marked, DOMPurify] = await Promise.all([
    import('marked'),
    import('dompurify')
  ]);
  this.marked = marked.default;
  this.purify = DOMPurify.default;
}
```
2. With `dist` output, each component is already lazy-loaded
3. Show loading state while heavy deps load:
```tsx
render() {
  if (!this.marked) return <div class="loading">Loading editor...</div>;
  // ...
}
```
4. Consider code-splitting Prism.js by language

### Phase to Address
**Phase 3 (Markdown Editor Port)** - Before finalizing architecture

---

## 14. Nested Component Dependencies Serialize Load

### The Problem
If `CmpA` uses `CmpB` which uses `CmpC`, browser loads 3 scripts **sequentially**, creating waterfall delays even with `dist` lazy loading.

### Warning Signs
- Network tab shows serial component script loads
- Time-to-interactive suffers
- Lighthouse flags "Critical request chains"

### Prevention Strategy
1. **Flatten component hierarchy where possible**
2. Avoid nesting Stencil components deeply
3. Use CSS and slots instead of wrapper components
4. Preload critical component bundles:
```html
<link rel="modulepreload" href="/build/markdown-editor.entry.js">
```
5. Accept that some serialization is unavoidable with lazy loading

### Phase to Address
**Phase 1 (Architecture)** - Design flat component hierarchy

---

## 15. Java webforJ Wrapper Removal Might Leave Breaking APIs

### The Problem
The Walkthrough has a Java/webforJ wrapper being dropped. If vanilla component APIs were designed around Java interop, they might not be idiomatic for Stencil/TypeScript consumers.

### Warning Signs
- Component props expect JSON strings instead of objects
- Method names follow Java conventions (e.g., `getTimelineData()` instead of `timelineData` prop)
- Events use custom serialization for Java compatibility
- APIs feel awkward in TypeScript

### Prevention Strategy
1. **Audit all public APIs for Java-isms before porting**:
   - Convert string props to proper types (arrays, objects)
   - Replace getter/setter methods with `@Prop()` where appropriate
   - Use idiomatic event names
2. Create migration guide if breaking changes are needed
3. Version bump appropriately (major if breaking)
4. Test APIs feel natural in React/Vue/Angular examples

### Phase to Address
**Phase 2 (Walkthrough Port)** - During API design review

---

## 16. Hydration Mismatches Between SSR and Client

### The Problem
If you use Stencil's SSR/hydration features, differences between server-rendered HTML and client-side render cause content to flash or disappear.

### Warning Signs
- Content flashes on page load
- Elements present in HTML source missing after hydration
- "Hydration failed" warnings in console
- Props reset after initial render

### Prevention Strategy
1. **Ensure `componentWillLoad()` is deterministic**:
```typescript
// WRONG - different on server vs client:
componentWillLoad() {
  this.timestamp = Date.now();
}

// RIGHT - same on both:
componentWillLoad() {
  this.timestamp = this.propTimestamp || Date.now();
}
```
2. Don't rely on browser-only APIs in initial render
3. Use Stencil's `shadow: true` with SSR hydration support
4. Test SSR builds separately

### Phase to Address
**Phase 6+ (Optional SSR)** - Only if implementing SSR

---

## 17. IE11/Old Browser Support Forces Polyfills and Compromises

### The Problem
Stencil v4 drops IE11 support, but projects might still have legacy requirements. Adding polyfills breaks build optimization and increases bundle size.

### Warning Signs
- Client requests IE11 support after Stencil v4 upgrade
- CSS variables don't work in old browsers
- Shadow DOM polyfills needed
- Bundle size balloons with polyfills

### Prevention Strategy
1. **Clarify browser support requirements BEFORE choosing Stencil v4**
2. If IE11 needed, stay on Stencil v2/v3
3. Or accept no Shadow DOM for legacy browsers:
```typescript
@Component({
  tag: 'my-component',
  shadow: false,  // For IE11 compat
  scoped: true    // CSS scoping fallback
})
```
4. Document supported browsers in README

### Phase to Address
**Phase 1 (Architecture)** - Before Stencil version selection

---

## 18. Breaking Changes Between Stencil v3 → v4

### The Problem
Stencil v4 has breaking changes around path aliases, docs-json output, and deprecated browser support. Upgrading mid-project causes build failures.

### Warning Signs
- Build works locally, fails in CI (different Stencil versions)
- Generated docs-json format changes break tooling
- Import paths suddenly break
- Tests fail after `npm install`

### Prevention Strategy
1. **Pin Stencil version in package.json** (exact version, not `^`):
```json
{
  "devDependencies": {
    "@stencil/core": "4.41.3"  // Not ^4.41.3
  }
}
```
2. Review [BREAKING_CHANGES.md](https://github.com/stenciljs/core/blob/main/BREAKING_CHANGES.md) before upgrading
3. Test build on CI before merging version bumps
4. Use `transformAliasedImportPaths: false` if imports break

### Phase to Address
**Phase 1 (Setup)** - Initial package.json config

---

## Phase-Specific Pitfall Summary

### Phase 1 (Architecture & Setup)
- [1] Peer dependency strategy
- [3] CSS theming approach
- [7] Slot hierarchy design
- [9] Output target selection
- [11] TypeScript config
- [14] Component hierarchy
- [17] Browser support decision
- [18] Stencil version pinning

### Phases 2-4 (Component Porting)
- [2] Drag-and-drop event retargeting
- [4] Async lifecycle timing
- [5] @Watch initial render
- [6] Reference mutation
- [8] Custom event composition
- [13] Dynamic imports for large deps
- [15] API design post-Java wrapper

### Phase 5 (Testing)
- [10] E2E mocking strategy

### Phase 6 (Documentation)
- [12] Docusaurus integration

### Optional/Future
- [16] SSR hydration (if needed)

---

## Sources

- [Stencil FAQ](https://stenciljs.com/docs/faq)
- [Stencil Distribution Docs](https://stenciljs.com/docs/distribution)
- [Stencil Module Bundling](https://stenciljs.com/docs/module-bundling)
- [Stencil Component Lifecycle](https://stenciljs.com/docs/component-lifecycle)
- [Stencil Events Documentation](https://stenciljs.com/docs/events)
- [Stencil Styling Documentation](https://stenciljs.com/docs/styling)
- [Stencil Testing Overview](https://stenciljs.com/docs/testing-overview)
- [Stencil Reactive Data](https://stenciljs.com/docs/reactive-data)
- [Stencil SSR Documentation](https://stenciljs.com/docs/server-side-rendering)
- [Stencil Custom Elements](https://stenciljs.com/docs/custom-elements)
- [GitHub: Stencil Core Issues](https://github.com/stenciljs/core/issues)
- [Shadow DOM Event Retargeting](https://javascript.info/shadow-dom-events)
- [Handling Web Components and Drag and Drop](https://justinribeiro.com/chronicle/2020/07/14/handling-web-components-and-drag-and-drop-with-event.composedpath/)
- [Stencil Upgrading to v4](https://stenciljs.com/docs/introduction/upgrading-to-stencil-four)
- [Stencil Breaking Changes Log](https://github.com/stenciljs/core/blob/main/BREAKING_CHANGES.md)
