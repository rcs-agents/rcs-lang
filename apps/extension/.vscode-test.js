const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
  // Test files pattern - look for integration tests
  files: 'dist/test/integration/**/*.test.js',

  // Extension development path
  extensionDevelopmentPath: process.cwd(),

  // Mocha options
  mocha: {
    timeout: 20000,
  },

  // VSCode version to test against
  version: 'stable',

  // Launch args
  launchArgs: ['--disable-extensions'],
});
