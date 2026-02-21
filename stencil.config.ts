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
    {
      type: 'docs-json',
      file: 'docs.json',
    },
  ],
  testing: {
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/*.e2e.ts',
      '!src/components.d.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'json-summary'],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '\\.e2e\\.ts$',
      '/dist/',
      '/www/',
      'components\\.d\\.ts$',
    ],
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
