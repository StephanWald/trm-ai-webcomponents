---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - README.md
  - docs/docusaurus.config.ts
autonomous: true
requirements: []

must_haves:
  truths:
    - "README.md exists at repo root with install instructions, component overview, and doc links"
    - "Install instructions show GitHub Release tarball URL (not bare npm install)"
    - "README links to live GitHub Pages docs site"
    - "Docusaurus footer no longer references npm — links to GitHub Releases instead"
  artifacts:
    - path: "README.md"
      provides: "Repository landing page with install, components, docs links"
      min_lines: 60
    - path: "docs/docusaurus.config.ts"
      provides: "Updated footer with GitHub Releases link instead of npm"
      contains: "releases"
  key_links:
    - from: "README.md"
      to: "https://stephanwald.github.io/trm-ai-webcomponents/"
      via: "markdown link"
      pattern: "stephanwald.github.io/trm-ai-webcomponents"
    - from: "README.md"
      to: "GitHub Releases"
      via: "install command"
      pattern: "releases/download"
---

<objective>
Create a comprehensive README.md for the repository and fix the Docusaurus footer to reference GitHub Releases instead of npm.

Purpose: The repo has no README — visitors see nothing on the GitHub landing page. The README should provide install instructions using GitHub Release tarballs (not npm), link to the live docs site with interactive demos, and give a quick overview of all three components. Additionally, the Docusaurus footer currently links to npmjs.com which is incorrect since this package is distributed via GitHub Releases.

Output: README.md at repo root; updated docs/docusaurus.config.ts footer
</objective>

<execution_context>
@/Users/beff/.claude/get-shit-done/workflows/execute-plan.md
@/Users/beff/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@docs/docs/getting-started.md
@docs/docusaurus.config.ts
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create README.md with GitHub Release install instructions, component overview, and docs links</name>
  <files>README.md</files>
  <action>
Create README.md at the repository root with the following sections:

**Header:** Package name `@skillspilot/webcomponents` with a one-line description: "Stencil.js-based library of production-ready web components for the Skillspilot/TRM-AI platform." Add a link badge or prominent link to the live documentation site.

**Documentation link:** Prominent link to https://stephanwald.github.io/trm-ai-webcomponents/ — mention it has interactive live demos for each component.

**Installation section** with two methods:

1. **GitHub Release (npm install from tarball):**
   ```bash
   npm install https://github.com/StephanWald/trm-ai-webcomponents/releases/download/v{VERSION}/skillspilot-webcomponents-{VERSION}.tgz
   ```
   Note: Replace `{VERSION}` with the desired version (e.g., `0.0.1`). Check the [Releases page](https://github.com/StephanWald/trm-ai-webcomponents/releases) for available versions.

2. **CDN (Script Tag):**
   ```html
   <script type="module" src="https://cdn.jsdelivr.net/npm/@skillspilot/webcomponents/dist/skillspilot/skillspilot.esm.js"></script>
   ```

**Usage section:** Show the ES module import pattern with `defineCustomElements()` from the loader, and a brief HTML example using `<sp-org-chart>` (reuse the quick start from getting-started.md).

**Components section:** A table or list of the three components with one-line descriptions and links to their docs pages:
- `<sp-org-chart>` — Interactive hierarchical org chart with drag-and-drop, filtering, and keyboard navigation. [Docs](https://stephanwald.github.io/trm-ai-webcomponents/components/sp-org-chart)
- `<sp-walkthrough>` — Video walkthrough with timed overlay panels for guided tutorials. [Docs](https://stephanwald.github.io/trm-ai-webcomponents/components/sp-walkthrough)
- `<sp-markdown-editor>` — Full-featured markdown editor with toolbar, preview, split mode, and voice dictation. [Docs](https://stephanwald.github.io/trm-ai-webcomponents/components/sp-markdown-editor)

**Peer Dependencies section:** Brief note that sp-markdown-editor has optional peer deps (marked, dompurify, prismjs, turndown) with a one-liner install command. Link to the docs for details.

**Theming section:** Brief mention of DWC theming system with `--dwc-*` CSS custom properties. Link to https://stephanwald.github.io/trm-ai-webcomponents/theming for full guide.

**Browser Support:** Chrome 67+, Firefox 63+, Safari 10.1+, Edge 79+.

**License:** MIT

Keep it concise — the README is a gateway to the docs site, not a replacement.
  </action>
  <verify>Confirm README.md exists at repo root; visually inspect that install command uses GitHub Releases URL pattern (not bare `npm install @skillspilot/webcomponents`); confirm docs links point to stephanwald.github.io.</verify>
  <done>README.md exists with GitHub Release tarball install instructions, CDN alternative, component table with docs links, and prominent link to live docs site.</done>
</task>

<task type="auto">
  <name>Task 2: Update Docusaurus footer to replace npm link with GitHub Releases link</name>
  <files>docs/docusaurus.config.ts</files>
  <action>
In docs/docusaurus.config.ts, find the footer links section. The "More" group currently has:
```ts
{
  label: 'npm',
  href: 'https://www.npmjs.com/package/@skillspilot/webcomponents',
},
```

Replace it with:
```ts
{
  label: 'Releases',
  href: 'https://github.com/StephanWald/trm-ai-webcomponents/releases',
},
```

This reflects the actual distribution method (GitHub Releases with tarballs, not npm registry).

Also fix the editUrl on line 34 — it currently says `tree/main/docs/` but the repo uses `master` branch. Change to `tree/master/docs/`.
  </action>
  <verify>Run `cd /Users/beff/_sp/trm-ai-webcomponents/docs && npx docusaurus build` to confirm the docs site still builds successfully with the updated config.</verify>
  <done>Docusaurus footer shows "Releases" linking to GitHub Releases page instead of npm. editUrl uses master branch.</done>
</task>

</tasks>

<verification>
- README.md exists at repo root and contains: GitHub Release install URL, CDN script tag, component list with docs links, link to live docs site
- No reference to bare `npm install @skillspilot/webcomponents` as the primary install method (GitHub Release tarball is primary)
- Docusaurus config footer links to GitHub Releases, not npmjs.com
- Docusaurus build succeeds
</verification>

<success_criteria>
- README.md is present, well-structured, and serves as an effective landing page for the GitHub repo
- Install instructions correctly use GitHub Release tarball URL pattern
- All external links (docs site, releases, component pages) are correct
- Docusaurus footer no longer references npm
</success_criteria>

<output>
After completion, create `.planning/quick/1-improve-readme-with-docs-links-github-ar/1-SUMMARY.md`
</output>
