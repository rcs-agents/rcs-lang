import * as path from 'path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Interactive Diagram testing
 * Based on GLSP Playwright and VS Code extension testing patterns
 */
export default defineConfig({
  testDir: './tests/playwright',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['line'],
  ],

  // Shared settings for all the projects below
  use: {
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Record video on failure
    video: 'retain-on-failure',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Global test timeout
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Uncomment for Firefox testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],

  // Run your local dev server before starting the tests (disabled for now)
  // webServer: {
  //   command: 'npm run serve:test',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 60000,
  // },

  // Global setup and teardown
  globalSetup: path.join(__dirname, 'tests/playwright/global-setup.ts'),
  globalTeardown: path.join(__dirname, 'tests/playwright/global-teardown.ts'),

  // Test configuration
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  // Output directory for test artifacts
  outputDir: 'test-results/',
});
