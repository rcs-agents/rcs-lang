import { join } from 'path';
import type { Options } from '@wdio/types';

export const config: Options.Testrunner = {
  runner: 'local',
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: './tsconfig.json',
    },
  },

  specs: ['./apps/extension/tests/e2e/**/*.test.ts'],

  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      browserName: 'vscode',
      browserVersion: 'stable',
      'wdio:vscodeOptions': {
        extensionPath: join(__dirname, 'apps', 'extension'),
        workspacePath: join(__dirname, 'apps', 'extension', 'tests', 'fixtures'),
        userSettings: {
          'editor.fontSize': 14,
          'workbench.colorTheme': 'Default Light+',
          'rcl.trace.server': 'verbose',
        },
      },
    },
  ],

  logLevel: 'info',
  bail: 0,

  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: ['vscode'],

  framework: 'mocha',

  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    retries: 1,
  },

  reporters: ['spec'],

  beforeSession: async (config, capabilities, specs) => {
    console.log('Starting VSCode extension tests...');
  },

  afterSession: async (config, capabilities, specs) => {
    console.log('VSCode extension tests completed.');
  },
};
