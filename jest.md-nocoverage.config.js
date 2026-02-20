const { getJestPreset } = require('@stencil/core/testing');

const preset = getJestPreset();
// Remove testRegex to use testMatch instead
delete preset.testRegex;

module.exports = {
  ...preset,
  testMatch: [
    '**/sp-markdown-editor/sp-markdown-editor-part1.spec.ts',
    '**/sp-markdown-editor/sp-markdown-editor-part2.spec.ts',
    '**/sp-markdown-editor/sp-markdown-editor-part3.spec.ts',
    '**/sp-markdown-editor/sp-markdown-editor-part4.spec.ts',
    '**/sp-markdown-editor/sp-markdown-editor-part5.spec.ts',
  ],
  rootDir: '/Users/beff/_sp/trm-ai-webcomponents',
  maxWorkers: 5,
};
