import * as fs from 'node:fs';
import * as path from 'node:path';
import type { FullConfig } from '@playwright/test';

/**
 * Global teardown for Playwright tests
 * Cleans up VS Code extension testing environment
 */
async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Cleaning up Playwright test environment...');

  // Close browser context and browser
  const browser = (global as any).testBrowser;
  const context = (global as any).testContext;

  if (context) {
    await context.close();
  }

  if (browser) {
    await browser.close();
  }

  // Clean up test fixtures
  await cleanupTestFixtures();

  console.log('✅ Playwright teardown complete');
}

async function cleanupTestFixtures() {
  const fixturesDir = path.join(__dirname, '../fixtures');

  if (fs.existsSync(fixturesDir)) {
    try {
      // Remove test fixtures directory
      fs.rmSync(fixturesDir, { recursive: true, force: true });
      console.log('🗑️  Test fixtures cleaned up');
    } catch (error) {
      console.warn('⚠️  Failed to clean up test fixtures:', error);
    }
  }
}

export default globalTeardown;
