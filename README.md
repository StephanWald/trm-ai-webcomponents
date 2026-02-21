# @skillspilot/webcomponents

Stencil.js-based library of production-ready web components for the Skillspilot/TRM-AI platform.

**[Live Documentation & Interactive Demos](https://stephanwald.github.io/trm-ai-webcomponents/)**

---

## Installation

### GitHub Release (recommended)

Install directly from a GitHub Release tarball:

```bash
npm install https://github.com/StephanWald/trm-ai-webcomponents/releases/download/v0.0.1/skillspilot-webcomponents-0.0.1.tgz
```

Replace `0.0.1` with the version you want. Check the [Releases page](https://github.com/StephanWald/trm-ai-webcomponents/releases) for all available versions.

### Script Tag

Load directly from the docs site — no build step required:

```html
<script
  type="module"
  src="https://stephanwald.github.io/trm-ai-webcomponents/wc/skillspilot.esm.js"
></script>
```

---

## Usage

**ES module (lazy-loading, recommended):**

```js
import { defineCustomElements } from '@skillspilot/webcomponents/loader';

defineCustomElements(); // auto-registers all sp-* components
```

**Quick start with `<sp-org-chart>`:**

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

---

## Components

| Component | Description | Docs |
|-----------|-------------|------|
| `<sp-org-chart>` | Interactive hierarchical org chart with drag-and-drop, filtering, and keyboard navigation | [Docs](https://stephanwald.github.io/trm-ai-webcomponents/components/sp-org-chart) |
| `<sp-walkthrough>` | Video walkthrough with timed overlay panels for guided tutorials | [Docs](https://stephanwald.github.io/trm-ai-webcomponents/components/sp-walkthrough) |
| `<sp-markdown-editor>` | Full-featured markdown editor with toolbar, preview, split mode, and voice dictation | [Docs](https://stephanwald.github.io/trm-ai-webcomponents/components/sp-markdown-editor) |

---

## Peer Dependencies

`sp-markdown-editor` has optional peer dependencies for full functionality:

```bash
npm install marked dompurify prismjs turndown
```

The editor loads gracefully without them, but preview, syntax highlighting, and paste features will be disabled. See the [Getting Started guide](https://stephanwald.github.io/trm-ai-webcomponents/) for details.

---

## Theming

Components use the DWC theming system via `--dwc-*` CSS custom properties. See the [Theming guide](https://stephanwald.github.io/trm-ai-webcomponents/theming) for the full list of tokens and customization examples.

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 67+ |
| Firefox | 63+ |
| Safari | 10.1+ |
| Edge (Chromium) | 79+ |

---

## License

MIT
