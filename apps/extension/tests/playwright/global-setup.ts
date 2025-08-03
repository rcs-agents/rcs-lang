import * as fs from 'node:fs';
import * as path from 'node:path';
import { type FullConfig, chromium } from '@playwright/test';

/**
 * Global setup for Playwright tests
 * Sets up VS Code extension testing environment
 */
async function globalSetup(_config: FullConfig) {
  console.log('🔧 Setting up Playwright test environment...');

  // Build extension if needed
  const extensionPath = path.join(__dirname, '../..');
  const outPath = path.join(extensionPath, 'client/out');

  if (!fs.existsSync(outPath)) {
    console.log('📦 Building extension...');
    const { spawn } = require('node:child_process');

    await new Promise((resolve, reject) => {
      const build = spawn('npm', ['run', 'compile'], {
        cwd: extensionPath,
        stdio: 'inherit',
      });

      build.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Extension built successfully');
          resolve(void 0);
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    });
  }

  // Create test fixtures
  await createTestFixtures();

  // Launch browser for VS Code testing
  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Store browser context for tests
  (global as any).testBrowser = browser;
  (global as any).testContext = context;

  console.log('✅ Playwright setup complete');
}

async function createTestFixtures() {
  const fixturesDir = path.join(__dirname, '../fixtures');

  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  // Create test RCL files for various scenarios
  const testFiles = {
    'simple-flow.rcl': `
agent SimpleAgent
  displayName: "Simple Test Agent"
  
  flow SimpleFlow
    start: Welcome
    
    on Welcome
      match @reply.text
        "Start" -> Complete
        :default -> Welcome
    
    on Complete
      # End state
      
  messages Messages
    text Welcome "Welcome! Say 'Start' to begin."
    text Complete "Task completed!"
`,

    'complex-flow.rcl': `
agent ComplexAgent
  displayName: "Complex Test Agent"
  
  flow ComplexFlow
    start: Entry
    
    on Entry
      match @reply.text
        "Path A" -> PathA
        "Path B" -> PathB
        :default -> Entry
    
    on PathA
      match @reply.text
        "Continue" -> Merge
        "Back" -> Entry
        :default -> PathA
    
    on PathB
      match @reply.text
        "Continue" -> Merge
        "Back" -> Entry
        :default -> PathB
    
    on Merge
      match @reply.text
        "Finish" -> Complete
        :default -> Merge
    
    on Complete
      # End state
      
  messages Messages
    text Entry "Choose your path: A or B"
    text PathA "You chose Path A. Continue or go Back?"
    text PathB "You chose Path B. Continue or go Back?"
    text Merge "Paths merged. Ready to Finish?"
    text Complete "Journey completed!"
`,

    'error-flow.rcl': `
agent ErrorAgent
  # Missing displayName - should cause error
  
  flow ErrorFlow
    # Missing start state
    
    on InvalidState
      invalid syntax here
      
  messages Messages
    # Missing message definitions
`,
  };

  for (const [filename, content] of Object.entries(testFiles)) {
    const filePath = path.join(fixturesDir, filename);
    fs.writeFileSync(filePath, content.trim());
  }

  console.log('📁 Test fixtures created');
}

export default globalSetup;
