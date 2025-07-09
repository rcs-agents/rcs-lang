const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig([
  {
    label: 'unitTests',
    files: 'apps/extension/**/tests/unit/**/*.test.ts',
    version: 'stable',
    workspaceFolder: '.',
    mocha: {
      timeout: 20000,
      ui: 'bdd',
      color: true,
    },
  },
  {
    label: 'integrationTests',
    files: 'apps/extension/**/tests/integration/**/*.test.ts',
    version: 'stable',
    workspaceFolder: '.',
    launchArgs: ['--disable-extensions', '--disable-workspace-trust'],
    mocha: {
      timeout: 60000,
      ui: 'bdd',
      color: true,
    },
  },
  {
    label: 'e2eTests',
    files: 'apps/extension/**/tests/e2e/**/*.test.ts',
    version: 'stable',
    workspaceFolder: '.',
    launchArgs: ['--disable-extensions', '--disable-workspace-trust'],
    mocha: {
      timeout: 120000,
      ui: 'bdd',
      color: true,
      retries: 2,
    },
  },
]);
