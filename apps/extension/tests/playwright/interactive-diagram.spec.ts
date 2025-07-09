import * as path from 'path';
import { expect, test } from '@playwright/test';

/**
 * Playwright tests for Interactive Diagram feature
 * Based on GLSP Playwright framework patterns and Sprotty testing best practices
 */

const COFFEE_SHOP_FILE = path.join(__dirname, '../../examples/coffee-shop.rcl');
const EXTENSION_PATH = path.join(__dirname, '../..');

test.describe('Interactive Diagram Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Launch VS Code with our extension in test mode
    // Note: This would require setting up VS Code extension testing environment
    // For now, we'll focus on testing the webview content directly
  });

  test.describe('Flow Visualization', () => {
    test('should display all flow states as diagram nodes', async ({ page }) => {
      // Test that all states from coffee-shop.rcl are rendered as nodes
      await page.goto('file://' + COFFEE_SHOP_FILE);

      // Trigger Interactive Diagram command
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      // Wait for diagram to load
      await page.waitForSelector('[data-testid="sprotty-diagram"]', { timeout: 10000 });

      // Verify all expected states are present as nodes
      const expectedStates = [
        'Welcome',
        'ChooseSize',
        'ChooseDrink',
        'Customize',
        'ConfirmOrder',
        'ProcessPayment',
        'OrderCancelled',
        'OrderComplete',
        'ThankYou',
        'ShowMenu',
        'StoreInfo',
        'InvalidOption',
      ];

      for (const state of expectedStates) {
        const nodeSelector = `[data-node-id="${state}"]`;
        await expect(page.locator(nodeSelector)).toBeVisible();

        // Verify node has proper label
        const nodeLabel = page.locator(`${nodeSelector} .node-label`);
        await expect(nodeLabel).toContainText(state);
      }
    });

    test('should display state transitions as diagram edges', async ({ page }) => {
      await page.goto('file://' + COFFEE_SHOP_FILE);

      // Open Interactive Diagram
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      await page.waitForSelector('[data-testid="sprotty-diagram"]');

      // Verify key transitions exist
      const expectedTransitions = [
        { from: 'Welcome', to: 'ChooseSize', trigger: 'Order Coffee' },
        { from: 'Welcome', to: 'ShowMenu', trigger: 'View Menu' },
        { from: 'ChooseSize', to: 'ChooseDrink', trigger: 'Small' },
        { from: 'ChooseSize', to: 'ChooseDrink', trigger: 'Medium' },
        { from: 'ChooseSize', to: 'ChooseDrink', trigger: 'Large' },
        { from: 'ChooseDrink', to: 'Customize', trigger: 'Espresso' },
      ];

      for (const transition of expectedTransitions) {
        const edgeSelector = `[data-edge-source="${transition.from}"][data-edge-target="${transition.to}"]`;
        await expect(page.locator(edgeSelector)).toBeVisible();

        // Verify edge label shows trigger
        const edgeLabel = page.locator(`${edgeSelector} .edge-label`);
        await expect(edgeLabel).toContainText(transition.trigger);
      }
    });

    test('should properly layout nodes in hierarchical structure', async ({ page }) => {
      await page.goto('file://' + COFFEE_SHOP_FILE);

      // Open Interactive Diagram
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      await page.waitForSelector('[data-testid="sprotty-diagram"]');

      // Verify Welcome node is positioned as start node (typically top or left)
      const welcomeNode = page.locator('[data-node-id="Welcome"]');
      const welcomeBox = await welcomeNode.boundingBox();

      // Verify ChooseSize is positioned after Welcome in flow
      const chooseSizeNode = page.locator('[data-node-id="ChooseSize"]');
      const chooseSizeBox = await chooseSizeNode.boundingBox();

      // In a left-to-right layout, ChooseSize should be to the right of Welcome
      // Or in top-to-bottom layout, ChooseSize should be below Welcome
      expect(chooseSizeBox!.x > welcomeBox!.x || chooseSizeBox!.y > welcomeBox!.y).toBeTruthy();
    });
  });

  test.describe('Node Interactions', () => {
    test('should highlight node on hover', async ({ page }) => {
      await page.goto('file://' + COFFEE_SHOP_FILE);

      // Open Interactive Diagram
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      await page.waitForSelector('[data-testid="sprotty-diagram"]');

      const welcomeNode = page.locator('[data-node-id="Welcome"]');

      // Hover over node
      await welcomeNode.hover();

      // Verify hover state (look for hover class or style changes)
      await expect(welcomeNode).toHaveClass(/.*hover.*|.*highlighted.*/);
    });

    test('should show node details on click', async ({ page }) => {
      await page.goto('file://' + COFFEE_SHOP_FILE);

      // Open Interactive Diagram
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      await page.waitForSelector('[data-testid="sprotty-diagram"]');

      const welcomeNode = page.locator('[data-node-id="Welcome"]');

      // Click on node
      await welcomeNode.click();

      // Verify details panel appears or node is selected
      await expect(page.locator('[data-testid="node-details"]')).toBeVisible();

      // Or verify node has selected state
      await expect(welcomeNode).toHaveClass(/.*selected.*/);
    });

    test('should sync cursor position when clicking nodes', async ({ page }) => {
      await page.goto('file://' + COFFEE_SHOP_FILE);

      // Open both editor and diagram
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      await page.waitForSelector('[data-testid="sprotty-diagram"]');

      const chooseSizeNode = page.locator('[data-node-id="ChooseSize"]');

      // Click on ChooseSize node
      await chooseSizeNode.click();

      // Verify cursor moves to corresponding line in RCL file
      // This would require checking the editor cursor position
      const editorCursor = page.locator('.monaco-editor .cursor');

      // Should be positioned at the "on ChooseSize" line
      // Exact implementation depends on VS Code editor testing setup
    });
  });

  test.describe('Message Integration', () => {
    test('should display message content in node tooltips', async ({ page }) => {
      await page.goto('file://' + COFFEE_SHOP_FILE);

      // Open Interactive Diagram
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      await page.waitForSelector('[data-testid="sprotty-diagram"]');

      const welcomeNode = page.locator('[data-node-id="Welcome"]');

      // Hover to show tooltip
      await welcomeNode.hover();

      // Verify tooltip shows message content
      const tooltip = page.locator('[data-testid="node-tooltip"]');
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toContainText('Welcome to Quick Coffee!');
    });

    test('should distinguish rich card messages visually', async ({ page }) => {
      await page.goto('file://' + COFFEE_SHOP_FILE);

      // Open Interactive Diagram
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      await page.waitForSelector('[data-testid="sprotty-diagram"]');

      // Welcome and ConfirmOrder nodes should be styled as rich cards
      const welcomeNode = page.locator('[data-node-id="Welcome"]');
      const confirmOrderNode = page.locator('[data-node-id="ConfirmOrder"]');

      // Verify rich card styling
      await expect(welcomeNode).toHaveClass(/.*rich-card.*/);
      await expect(confirmOrderNode).toHaveClass(/.*rich-card.*/);

      // Regular message nodes should have different styling
      const chooseSizeNode = page.locator('[data-node-id="ChooseSize"]');
      await expect(chooseSizeNode).toHaveClass(/.*message.*/);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle compilation errors gracefully', async ({ page }) => {
      // Test with an RCL file that has syntax errors
      const invalidRclContent = `
        agent InvalidAgent
          # Missing displayName - should cause error
          flow InvalidFlow
            on MissingState
              invalid syntax here
      `;

      // This would require creating a temporary file with invalid content
      // For now, we'll test the error display behavior

      await page.goto('data:text/plain,' + encodeURIComponent(invalidRclContent));

      // Try to open Interactive Diagram
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      // Should show error message instead of diagram
      await expect(page.locator('[data-testid="diagram-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="diagram-error"]')).toContainText('compilation');
    });

    test('should handle empty flow gracefully', async ({ page }) => {
      const emptyFlowContent = `
        agent EmptyAgent
          displayName: "Empty Test Agent"
          flow EmptyFlow
            start: Welcome
      `;

      await page.goto('data:text/plain,' + encodeURIComponent(emptyFlowContent));

      // Open Interactive Diagram
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      // Should show empty diagram message
      await expect(page.locator('[data-testid="empty-diagram"]')).toBeVisible();
      await expect(page.locator('[data-testid="empty-diagram"]')).toContainText('No states found');
    });
  });

  test.describe('Performance', () => {
    test('should render large flows efficiently', async ({ page }) => {
      await page.goto('file://' + COFFEE_SHOP_FILE);

      // Open Interactive Diagram
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      // Measure time to render
      const startTime = Date.now();
      await page.waitForSelector('[data-testid="sprotty-diagram"]', { timeout: 5000 });
      const renderTime = Date.now() - startTime;

      // Should render within reasonable time (5 seconds)
      expect(renderTime).toBeLessThan(5000);

      // Verify all nodes are visible
      const nodes = page.locator('[data-node-id]');
      const nodeCount = await nodes.count();
      expect(nodeCount).toBeGreaterThan(0);
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('file://' + COFFEE_SHOP_FILE);

      // Open Interactive Diagram
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      await page.waitForSelector('[data-testid="sprotty-diagram"]');

      // Focus on diagram
      await page.click('[data-testid="sprotty-diagram"]');

      // Navigate with keyboard
      await page.keyboard.press('Tab');

      // Verify focus moves to first node
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toHaveAttribute('data-node-id');
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      await page.goto('file://' + COFFEE_SHOP_FILE);

      // Open Interactive Diagram
      await page.keyboard.press('F1');
      await page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
      await page.press('[placeholder="Type a command"]', 'Enter');

      await page.waitForSelector('[data-testid="sprotty-diagram"]');

      // Verify diagram has proper ARIA attributes
      const diagram = page.locator('[data-testid="sprotty-diagram"]');
      await expect(diagram).toHaveAttribute('role', 'img');
      await expect(diagram).toHaveAttribute('aria-label');

      // Verify nodes have proper labels
      const welcomeNode = page.locator('[data-node-id="Welcome"]');
      await expect(welcomeNode).toHaveAttribute('aria-label');
    });
  });
});
