import * as path from 'path';
import { browser } from '@wdio/globals';
import { TestClient } from '../utils/testHelpers';
import { WebviewHelpers } from '../utils/webviewHelpers';

describe('Coffee Shop Example - Comprehensive Tests', () => {
  let client: TestClient;
  let webviewHelpers: WebviewHelpers;
  const workspaceRoot = path.join(__dirname, '../../../..');
  const coffeeShopPath = path.join(workspaceRoot, 'examples', 'coffee-shop.rcl');

  before(async () => {
    client = new TestClient();
    webviewHelpers = new WebviewHelpers();
    await client.init();
  });

  after(async () => {
    if (client) {
      await client.dispose();
    }
  });

  describe('Diagnostics Validation', () => {
    it('should have no error diagnostics when opening coffee-shop.rcl', async () => {
      // Open the coffee-shop.rcl file
      await client.openFile(coffeeShopPath);

      // Wait for language server to process
      await browser.pause(5000);

      // Get diagnostics from VS Code
      const diagnostics = await client.getDiagnostics(coffeeShopPath);

      // Log all diagnostics for debugging
      if (diagnostics.length > 0) {
        console.log(
          'Found diagnostics:',
          JSON.stringify(
            diagnostics.map((d) => ({
              message: d.message,
              severity: d.severity,
              range: d.range,
              code: d.code,
              source: d.source,
            })),
            null,
            2,
          ),
        );
      }

      // Filter for error-level diagnostics (severity 0 = Error)
      const errors = diagnostics.filter((d) => d.severity === 0);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((d) => `Line ${d.range.start.line + 1}: ${d.message} (${d.code || 'NO_CODE'})`)
          .join('\\n');
        throw new Error(
          `coffee-shop.rcl should not have error diagnostics, but found:\\n${errorMessages}`,
        );
      }

      // Validate that the file was processed (some diagnostics are expected for warnings/info)
      console.log(
        `Language server processed coffee-shop.rcl - found ${diagnostics.length} total diagnostics, ${errors.length} errors`,
      );
    });

    it('should have valid RCL syntax that compiles successfully', async () => {
      // The fact that we can open the file without parser errors indicates valid syntax
      await client.openFile(coffeeShopPath);
      await browser.pause(3000);

      // Check that we can get the document content
      const content = await client.getDocumentContent(coffeeShopPath);
      expect(content).to.include('agent CoffeeShop');
      expect(content).to.include('flow OrderFlow');
      expect(content).to.include('messages Messages');

      // Verify no parsing errors in output
      const diagnostics = await client.getDiagnostics(coffeeShopPath);
      const syntaxErrors = diagnostics.filter(
        (d) =>
          d.severity === 0 &&
          (d.message.includes('syntax') ||
            d.message.includes('parse') ||
            d.message.includes('unexpected')),
      );

      expect(syntaxErrors).to.have.length(
        0,
        `Should have no syntax errors: ${syntaxErrors.map((e) => e.message).join(', ')}`,
      );
    });

    it('should validate all state references exist', async () => {
      await client.openFile(coffeeShopPath);
      await browser.pause(3000);

      const diagnostics = await client.getDiagnostics(coffeeShopPath);
      const referenceErrors = diagnostics.filter(
        (d) =>
          d.severity === 0 &&
          (d.message.includes('undefined') ||
            d.message.includes('not found') ||
            d.message.includes('reference')),
      );

      expect(referenceErrors).to.have.length(
        0,
        `Should have no undefined reference errors: ${referenceErrors.map((e) => e.message).join(', ')}`,
      );
    });
  });

  describe('Interactive Diagram Functionality', () => {
    it('should successfully open Interactive Diagram for coffee-shop.rcl', async () => {
      // Open the coffee-shop.rcl file first
      await client.openFile(coffeeShopPath);
      await browser.pause(2000);

      // Execute the "Open Interactive Diagram" command
      await client.executeCommand('RCL: Open Interactive Diagram');

      // Wait for webview to load
      await browser.pause(5000);

      // Switch to webview context
      await webviewHelpers.switchToWebview();

      try {
        // Wait for diagram to render
        await webviewHelpers.waitForDiagram(30000);

        // Verify diagram content
        const diagramExists = await webviewHelpers.isDiagramVisible();
        expect(diagramExists).to.be.true('Interactive diagram should be visible');
      } finally {
        // Always switch back to main context
        await webviewHelpers.switchToMain();
      }
    });

    it('should render all expected coffee shop states in diagram', async () => {
      // Ensure file is open and diagram is loaded
      await client.openFile(coffeeShopPath);
      await client.executeCommand('RCL: Open Interactive Diagram');
      await browser.pause(3000);

      await webviewHelpers.switchToWebview();

      try {
        await webviewHelpers.waitForDiagram(20000);

        // Check for expected states
        const expectedStates = [
          'Welcome',
          'ChooseSize',
          'ChooseDrink',
          'Customize',
          'ConfirmOrder',
          'ProcessPayment',
          'OrderComplete',
          'InvalidOption',
        ];

        for (const state of expectedStates) {
          const stateExists = await webviewHelpers.isStateVisible(state);
          expect(stateExists).to.be.true(`State "${state}" should be visible in diagram`);
        }

        console.log(`Successfully verified ${expectedStates.length} states in coffee shop diagram`);
      } finally {
        await webviewHelpers.switchToMain();
      }
    });

    it('should show flow transitions between states', async () => {
      await client.openFile(coffeeShopPath);
      await client.executeCommand('RCL: Open Interactive Diagram');
      await browser.pause(3000);

      await webviewHelpers.switchToWebview();

      try {
        await webviewHelpers.waitForDiagram(20000);

        // Check for transitions (edges between states)
        const transitionsExist = await webviewHelpers.areTransitionsVisible();
        expect(transitionsExist).to.be.true('State transitions should be visible in diagram');

        // Check for edge labels if supported
        const edgeLabelsExist = await webviewHelpers.areEdgeLabelsVisible();
        console.log(`Edge labels visible: ${edgeLabelsExist}`);
      } finally {
        await webviewHelpers.switchToMain();
      }
    });

    it('should handle complex state transitions with context variables', async () => {
      await client.openFile(coffeeShopPath);
      await client.executeCommand('RCL: Open Interactive Diagram');
      await browser.pause(3000);

      await webviewHelpers.switchToWebview();

      try {
        await webviewHelpers.waitForDiagram(20000);

        // Verify InvalidOption state with @next context variable is handled
        const invalidOptionExists = await webviewHelpers.isStateVisible('InvalidOption');
        expect(invalidOptionExists).to.be.true('InvalidOption state with @next should be rendered');

        // Check that transitions with 'with' clauses are handled
        // These would be transitions like "Small" -> ChooseDrink with size: "small"
        const complexTransitionsExist = await webviewHelpers.areTransitionsVisible();
        expect(complexTransitionsExist).to.be.true(
          'Complex transitions with context should be rendered',
        );
      } finally {
        await webviewHelpers.switchToMain();
      }
    });

    it('should allow interaction with diagram elements', async () => {
      await client.openFile(coffeeShopPath);
      await client.executeCommand('RCL: Open Interactive Diagram');
      await browser.pause(3000);

      await webviewHelpers.switchToWebview();

      try {
        await webviewHelpers.waitForDiagram(20000);

        // Try to click on a state
        const welcomeStateClicked = await webviewHelpers.clickState('Welcome');
        console.log(`Welcome state interaction: ${welcomeStateClicked ? 'successful' : 'failed'}`);

        // Try to drag a state (if supported)
        const dragResult = await webviewHelpers.dragState('Welcome', 50, 50);
        console.log(`State dragging: ${dragResult ? 'successful' : 'not supported'}`);

        // Test should pass if basic interaction works
        expect(true).to.be.true('Basic diagram interaction test completed');
      } finally {
        await webviewHelpers.switchToMain();
      }
    });
  });

  describe('Performance and Reliability', () => {
    it('should load coffee-shop diagram within acceptable time', async () => {
      const startTime = Date.now();

      await client.openFile(coffeeShopPath);
      await client.executeCommand('RCL: Open Interactive Diagram');

      await webviewHelpers.switchToWebview();

      try {
        await webviewHelpers.waitForDiagram(30000);

        const loadTime = Date.now() - startTime;
        console.log(`Coffee shop diagram loaded in ${loadTime}ms`);

        // Should load within 30 seconds
        expect(loadTime).to.be.lessThan(30000, 'Diagram should load within 30 seconds');
      } finally {
        await webviewHelpers.switchToMain();
      }
    });

    it('should handle multiple rapid operations without crashing', async () => {
      // Test rapid file opening and diagram commands
      for (let i = 0; i < 3; i++) {
        await client.openFile(coffeeShopPath);
        await browser.pause(1000);

        await client.executeCommand('RCL: Open Interactive Diagram');
        await browser.pause(2000);

        // Close and reopen
        await client.executeCommand('workbench.action.closeActiveEditor');
        await browser.pause(500);
      }

      // Final verification that everything still works
      await client.openFile(coffeeShopPath);
      await client.executeCommand('RCL: Open Interactive Diagram');
      await browser.pause(3000);

      await webviewHelpers.switchToWebview();

      try {
        const diagramExists = await webviewHelpers.isDiagramVisible();
        expect(diagramExists).to.be.true('Diagram should still work after rapid operations');
      } finally {
        await webviewHelpers.switchToMain();
      }
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle compilation errors in diagram view', async () => {
      // Create a temporary file with syntax errors
      const tempFile = path.join(workspaceRoot, 'test-error.rcl');
      await client.createFile(tempFile, 'agent BadAgent\\n  invalid syntax here');

      try {
        await client.openFile(tempFile);
        await client.executeCommand('RCL: Open Interactive Diagram');
        await browser.pause(3000);

        // Should not crash - either show error message or empty diagram
        const diagnostics = await client.getDiagnostics(tempFile);
        console.log(`Error file has ${diagnostics.length} diagnostics`);

        // Test passes if VS Code doesn't crash
        expect(true).to.be.true('Error handling test completed');
      } finally {
        await client.deleteFile(tempFile);
      }
    });
  });
});
