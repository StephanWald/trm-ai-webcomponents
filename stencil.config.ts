import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'skillspilot',
  globalStyle: 'src/global/dwc-theme.css',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
      generateTypeDeclarations: true,
    },
    {
      type: 'www',
      copy: [{ src: '**/*.html' }, { src: '**/*.css' }],
      serviceWorker: null,
    },
  ],
};
