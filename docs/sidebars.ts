import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'getting-started',
      label: 'Getting Started',
    },
    {
      type: 'doc',
      id: 'theming',
      label: 'Theming',
    },
    {
      type: 'category',
      label: 'Components',
      items: [
        {
          type: 'doc',
          id: 'components/sp-org-chart',
          label: 'sp-org-chart',
        },
        {
          type: 'doc',
          id: 'components/sp-walkthrough',
          label: 'sp-walkthrough',
        },
        {
          type: 'doc',
          id: 'components/sp-markdown-editor',
          label: 'sp-markdown-editor',
        },
        {
          type: 'doc',
          id: 'components/sp-popover',
          label: 'sp-popover',
        },
        {
          type: 'doc',
          id: 'components/sp-language-selector',
          label: 'sp-language-selector',
        },
        {
          type: 'doc',
          id: 'components/sp-voice-input-button',
          label: 'sp-voice-input-button',
        },
        {
          type: 'doc',
          id: 'components/sp-communication-preferences',
          label: 'sp-communication-preferences',
        },
        {
          type: 'doc',
          id: 'components/sp-splash',
          label: 'sp-splash',
        },
      ],
    },
    {
      type: 'doc',
      id: 'changelog',
      label: 'Changelog',
    },
  ],
};

export default sidebars;
