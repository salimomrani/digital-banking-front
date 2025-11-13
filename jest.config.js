const { createCjsPreset } = require('jest-preset-angular/presets');

const cjsPreset = createCjsPreset({
  tsconfig: '<rootDir>/tsconfig.spec.json',
  stringifyContentPathRegex: '\\.(html|svg)$'
});

/** @type {import('jest').Config} */
module.exports = {
  ...cjsPreset,
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  resolver: 'jest-preset-angular/build/resolvers/ng-jest-resolver.js',
  testMatch: ['**/*.spec.ts']
};
