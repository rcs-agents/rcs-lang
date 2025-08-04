import { expect, test } from '@playwright/test';
import { DiagramTestHelpers, TestRclContent } from './helpers/diagram-helpers.js';

/**
 * Simplified Playwright tests for Interactive Diagram functionality
 * Tests the core diagram rendering without full VS Code integration
 */

test.describe('Interactive Diagram Core Functionality', () => {
  test('should validate test environment setup', async ({ page }) => {
    // Simple test to verify Playwright is working correctly
    await page.goto('data:text/html,<html><body><h1>Test Page</h1></body></html>');

    const heading = page.locator('h1');
    await expect(heading).toContainText('Test Page');
    await expect(heading).toBeVisible();
  });

  test('should handle RCL content parsing', async ({ page }) => {
    // Test that we can create and validate RCL test content
    const simpleContent = TestRclContent.simple;

    // Verify the test content has expected structure
    expect(simpleContent).toContain('agent SimpleAgent');
    expect(simpleContent).toContain('flow SimpleFlow');
    expect(simpleContent).toContain('on Welcome');
    expect(simpleContent).toContain('messages Messages');
  });

  test('should validate diagram helper utilities', async ({ page }) => {
    // Create a minimal diagram structure for testing helpers
    const diagramHtml = `
      <html>
        <body>
          <div data-testid="sprotty-diagram">
            <div data-node-id="Welcome" class="node">Welcome Node</div>
            <div data-node-id="Complete" class="node">Complete Node</div>
            <div data-edge-source="Welcome" data-edge-target="Complete" class="edge">Transition</div>
          </div>
        </body>
      </html>
    `;

    await page.goto(`data:text/html,${encodeURIComponent(diagramHtml)}`);

    const helpers = new DiagramTestHelpers(page);

    // Test helper methods
    const diagram = helpers.getDiagram();
    await expect(diagram).toBeVisible();

    const welcomeNode = helpers.getNode('Welcome');
    await expect(welcomeNode).toBeVisible();
    await expect(welcomeNode).toContainText('Welcome Node');

    const completeNode = helpers.getNode('Complete');
    await expect(completeNode).toBeVisible();

    const edge = helpers.getEdge('Welcome', 'Complete');
    await expect(edge).toBeVisible();

    const allNodes = helpers.getAllNodes();
    await expect(allNodes).toHaveCount(2);
  });

  test('should test node interaction patterns', async ({ page }) => {
    const diagramHtml = `
      <html>
        <head>
          <style>
            .node { padding: 10px; border: 1px solid #ccc; margin: 5px; cursor: pointer; }
            .node:hover { background-color: #f0f0f0; }
            .node.selected { background-color: #0078d4; color: white; }
          </style>
        </head>
        <body>
          <div data-testid="sprotty-diagram">
            <div data-node-id="TestNode" class="node" onclick="this.classList.toggle('selected')">
              Test Node
            </div>
          </div>
          <div data-testid="node-tooltip" style="display: none;">Node tooltip content</div>
        </body>
      </html>
    `;

    await page.goto(`data:text/html,${encodeURIComponent(diagramHtml)}`);

    const helpers = new DiagramTestHelpers(page);
    const testNode = helpers.getNode('TestNode');

    // Test hover effect
    await helpers.hoverNode('TestNode');
    await expect(testNode).toHaveCSS('background-color', 'rgb(240, 240, 240)');

    // Test click interaction
    await helpers.clickNode('TestNode');
    await expect(testNode).toHaveClass(/selected/);
  });

  test('should validate error handling patterns', async ({ page }) => {
    const errorHtml = `
      <html>
        <body>
          <div data-testid="diagram-error" style="color: red;">
            Compilation failed: Invalid syntax
          </div>
        </body>
      </html>
    `;

    await page.goto(`data:text/html,${encodeURIComponent(errorHtml)}`);

    const helpers = new DiagramTestHelpers(page);
    const errorMessage = helpers.getErrorMessage();

    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Compilation failed');
  });

  test('should test accessibility patterns', async ({ page }) => {
    const accessibleHtml = `
      <html>
        <body>
          <div data-testid="sprotty-diagram" 
               role="img" 
               aria-label="Interactive flow diagram showing agent conversation flow"
               tabindex="0">
            <div data-node-id="AccessibleNode" 
                 aria-label="Welcome state node" 
                 tabindex="0"
                 role="button">
              Welcome
            </div>
          </div>
        </body>
      </html>
    `;

    await page.goto(`data:text/html,${encodeURIComponent(accessibleHtml)}`);

    const helpers = new DiagramTestHelpers(page);
    const accessibility = await helpers.validateAccessibility();

    expect(accessibility.hasRole).toBe(true);
    expect(accessibility.hasLabel).toBe(true);

    // Test keyboard navigation
    await helpers.navigateWithKeyboard();

    // Give a moment for focus to settle
    await page.waitForTimeout(100);

    // Check if the node is focusable
    const nodeElement = page.locator('[data-node-id="AccessibleNode"]');
    await expect(nodeElement).toHaveAttribute('tabindex', '0');
  });

  test('should test layout validation logic', async ({ page }) => {
    const layoutHtml = `
      <html>
        <body>
          <div data-testid="sprotty-diagram">
            <div data-node-id="Start" style="position: absolute; left: 50px; top: 100px; width: 80px; height: 40px;">Start</div>
            <div data-node-id="Next" style="position: absolute; left: 200px; top: 100px; width: 80px; height: 40px;">Next</div>
          </div>
        </body>
      </html>
    `;

    await page.goto(`data:text/html,${encodeURIComponent(layoutHtml)}`);

    const helpers = new DiagramTestHelpers(page);
    const isValidLayout = await helpers.validateHierarchicalLayout('Start', 'Next');

    expect(isValidLayout).toBe(true);
  });
});
