---
title: Theming
sidebar_position: 2
---

# Theming

All Skillspilot web components use the `--dwc-*` CSS custom property system from the [DWC (Dynamic Web Components)](https://dwc.basis.com) design system. This ensures visual consistency when components are used alongside other DWC-based applications.

## DWC Token System

CSS custom properties (tokens) follow a consistent naming convention:

```
--dwc-<category>-<variant>-<modifier>
```

For example:
- `--dwc-color-primary` — primary brand color
- `--dwc-color-primary-text` — text color on primary background
- `--dwc-border-radius` — default corner radius
- `--dwc-font-size-m` — medium font size

Components work with **sensible defaults** when no external DWC theme is loaded — you do not need to configure anything to see functional components.

## Available Token Categories

### Colors

| Token | Description | Example |
|-------|-------------|---------|
| `--dwc-color-primary` | Primary brand color | Blue, used for interactive elements |
| `--dwc-color-success` | Success state color | Green |
| `--dwc-color-warning` | Warning state color | Orange/yellow |
| `--dwc-color-danger` | Error/danger state color | Red |
| `--dwc-color-default` | Neutral/default color | Gray |

### Spacing

| Token | Description |
|-------|-------------|
| `--dwc-space-xs` | Extra small spacing (4px) |
| `--dwc-space-s` | Small spacing (8px) |
| `--dwc-space-m` | Medium spacing (16px) |
| `--dwc-space-l` | Large spacing (24px) |
| `--dwc-space-xl` | Extra large spacing (32px) |

### Typography

| Token | Description |
|-------|-------------|
| `--dwc-font-family` | Base font family |
| `--dwc-font-size-s` | Small font size |
| `--dwc-font-size-m` | Medium font size |
| `--dwc-font-size-l` | Large font size |

### Borders and Shadows

| Token | Description |
|-------|-------------|
| `--dwc-border-radius` | Default border radius |
| `--dwc-border-width` | Default border width |
| `--dwc-shadow-m` | Medium drop shadow |
| `--dwc-shadow-l` | Large drop shadow (e.g., modals) |

See each component's API page for the specific tokens it supports.

## Customizing Tokens

### Global Override

Apply token overrides at the document level using the `:root` selector:

```css
:root {
  --dwc-color-primary: #3b82f6;       /* Custom blue */
  --dwc-border-radius: 4px;           /* Sharper corners */
  --dwc-font-family: 'Inter', sans-serif;
}
```

### Per-Component Override

Override tokens for a specific component instance using CSS on the element:

```css
/* All sp-org-chart instances */
sp-org-chart {
  --dwc-color-primary: #10b981;
}

/* A specific instance */
sp-org-chart#my-chart {
  --dwc-border-radius: 0;
}
```

## Dark Mode

Components support dark mode via the `theme-dark` CSS class on the host element. Apply it directly:

```html
<sp-org-chart class="theme-dark"></sp-org-chart>
```

Or apply it at the document level to affect all components at once:

```js
// Toggle dark mode across all sp-* components on the page
document.querySelectorAll('sp-org-chart, sp-walkthrough, sp-markdown-editor').forEach(el => {
  el.classList.toggle('theme-dark');
});
```

Internally, dark mode is handled via `:host(.theme-dark)` CSS selectors inside each component's Shadow DOM:

```css
/* Inside the component's shadow CSS */
:host {
  --component-bg: #ffffff;
}
:host(.theme-dark) {
  --component-bg: #1e1e1e;
}
```

## CSS Parts

CSS `::part()` selectors allow you to style specific internal elements of a component that the component author has deliberately exposed.

### Example: Styling sp-org-chart Parts

```css
/* Style the user tile card */
sp-org-chart::part(user-tile) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Style the connector lines */
sp-org-chart::part(connector) {
  border-color: #6366f1;
}
```

Available parts for each component are listed in the **CSS Parts** section of each component's API reference page.

:::note sp-walkthrough has no CSS parts
`sp-walkthrough` is a floating overlay panel and does not expose any CSS parts. Use CSS custom properties (`--dwc-*`) to theme it instead.
:::

## Integration with DWC

If your application already loads the full DWC theme stylesheet, Skillspilot components will **automatically inherit** all DWC token values. No additional configuration is needed — the components consume the same tokens that DWC already defines.

```html
<!-- If you already have this in your app, components are fully themed -->
<link rel="stylesheet" href="path/to/dwc-theme.css" />
```
