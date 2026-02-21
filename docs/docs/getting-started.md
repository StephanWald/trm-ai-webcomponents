---
title: Getting Started
sidebar_position: 1
slug: /
---

# Getting Started

Skillspilot Web Components is a library of production-ready web components for the Skillspilot/TRM-AI platform. Components are distributed via GitHub Releases and work in any web application without framework lock-in.

## Installation

### GitHub Release (recommended)

Install directly from a GitHub Release tarball:

```bash
npm install https://github.com/StephanWald/trm-ai-webcomponents/releases/download/v0.0.1/skillspilot-webcomponents-0.0.1.tgz
```

Replace `0.0.1` with the version you want. Check the [Releases page](https://github.com/StephanWald/trm-ai-webcomponents/releases) for all available versions.

**ES module import (lazy-loading, recommended):**

```js
import { defineCustomElements } from '@skillspilot/webcomponents/loader';

// Auto-registers all sp-* components when they are first used
defineCustomElements();
```

**Direct component import (bundle specific components):**

```js
import '@skillspilot/webcomponents/dist/components';
```

### Script Tag

Add this script tag to your HTML `<head>`. It auto-registers all components immediately:

```html
<script
  type="module"
  src="https://stephanwald.github.io/trm-ai-webcomponents/wc/skillspilot.esm.js"
></script>
```

No `import` or `defineCustomElements` call is needed — the script auto-registers all `sp-*` elements.

## Quick Start

Once installed (or the script tag is included), use components directly in HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script
    type="module"
    src="https://stephanwald.github.io/trm-ai-webcomponents/wc/skillspilot.esm.js"
  ></script>
</head>
<body>
  <sp-org-chart></sp-org-chart>

  <script>
    const chart = document.querySelector('sp-org-chart');
    chart.nodes = [
      { id: '1', label: 'CEO', name: 'Alice Johnson' },
      { id: '2', label: 'CTO', name: 'Bob Smith', parentId: '1' },
      { id: '3', label: 'CFO', name: 'Carol White', parentId: '1' },
    ];
  </script>
</body>
</html>
```

## Peer Dependencies

`sp-markdown-editor` uses several optional peer dependencies for full functionality. They are optional — the editor loads gracefully without them, but certain features will be disabled:

| Package | Feature | Required For |
|---------|---------|-------------|
| `marked` | Markdown parsing | Preview mode, WYSIWYG mode |
| `dompurify` | HTML sanitization | Safe preview rendering |
| `prismjs` | Syntax highlighting | Code block highlighting |
| `turndown` | HTML to Markdown | Paste from clipboard, WYSIWYG to source |

Install all peer dependencies at once:

```bash
npm install marked dompurify prismjs turndown
```

The other components (`sp-org-chart`, `sp-walkthrough`) have no peer dependencies.

## Browser Support

All components use the Web Components standard (Custom Elements v1, Shadow DOM v1). Supported in:

- Chrome 67+
- Firefox 63+
- Safari 10.1+
- Edge 79+ (Chromium-based)

## Next Steps

- [Theming](./theming) — Learn how to customize components using `--dwc-*` CSS tokens
- [sp-org-chart](./components/sp-org-chart) — Hierarchical org chart with drag-and-drop
- [sp-walkthrough](./components/sp-walkthrough) — Interactive video walkthrough component
- [sp-markdown-editor](./components/sp-markdown-editor) — Full-featured markdown editor
