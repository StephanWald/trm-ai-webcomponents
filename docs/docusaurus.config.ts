import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Skillspilot Web Components',
  tagline: 'Production-ready web components for Skillspilot/TRM-AI',
  favicon: 'img/favicon.ico',

  // TODO: Update when GitHub remote is established
  url: 'https://skillspilot.github.io',
  // Matches repo name for GitHub Pages
  baseUrl: '/trm-ai-webcomponents/',

  // GitHub Pages deployment config
  organizationName: 'skillspilot',
  projectName: 'trm-ai-webcomponents',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          // Docs-only mode: no separate home page, docs served from /
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/skillspilot/trm-ai-webcomponents/tree/main/docs/',
        },
        // Disable blog for component library docs
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Skillspilot WC',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/skillspilot/trm-ai-webcomponents',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
            {
              label: 'Theming',
              to: '/theming',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/@skillspilot/webcomponents',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/skillspilot/trm-ai-webcomponents',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Skillspilot. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
