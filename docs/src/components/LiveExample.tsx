import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface LiveExampleProps {
  /** HTML code to render in the sandboxed iframe */
  code: string;
  /** Height of the iframe (default: '200px') */
  height?: string;
}

/**
 * LiveExample renders HTML code in a sandboxed iframe, allowing developers to
 * see and edit live examples directly in the documentation.
 *
 * The component JS is served from the docs site itself (copied into static/wc/
 * during the docs build), so no npm publish or external CDN is required.
 */
export default function LiveExample({ code, height = '200px' }: LiveExampleProps): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const [source, setSource] = useState(code.trim());

  // Serve components from the docs site's own static files (static/wc/)
  const wcScript = `${siteConfig.url}${siteConfig.baseUrl}wc/skillspilot.esm.js`;

  const srcDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script type="module" src="${wcScript}"></script>
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  ${source}
</body>
</html>`;

  return (
    <div className="live-example">
      <iframe
        srcDoc={srcDoc}
        style={{ height }}
        width="100%"
        title="Live example"
        sandbox="allow-scripts allow-same-origin"
      />
      <details>
        <summary>View / Edit Source</summary>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
          aria-label="Edit example source code"
        />
      </details>
    </div>
  );
}
