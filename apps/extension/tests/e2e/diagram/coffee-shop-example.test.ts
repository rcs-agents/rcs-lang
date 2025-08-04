import { browser } from '@wdio/globals';
import { expect } from 'chai';
import * as webviewHelpers from '../../utils/webviewHelpers.js';

describe('Coffee Shop Example - Interactive Diagram', () => {
  let workbench: any;

  before(async () => {
    workbench = await (browser as any).getWorkbench();
  });

  after(async () => {
    await webviewHelpers.switchToMainFrame();
    await workbench.executeCommand('View: Close All Editors');
  });

  describe('Opening Coffee Shop Example', () => {
    it('should successfully open coffee-shop.rcl', async () => {
      // Open the coffee-shop.rcl file
      await workbench.executeCommand('File: Open File');
      await browser.pause(500);

      const input = await workbench.getQuickInputBox();
      await input.setValue('examples/coffee-shop.rcl');
      await input.confirm();
      await browser.pause(2000); // Give more time for large file

      // Verify file opened
      const editor = await workbench.getActiveTextEditor();
      expect(editor).to.exist;

      const content = await editor.getText();
      expect(content).to.include('agent Coffee Shop');
      expect(content).to.include('flow Order Flow');
    });

    it('should successfully execute "Open Interactive Diagram" command', async () => {
      // Execute the Open Interactive Diagram command
      await workbench.executeCommand('RCL: Open Interactive Diagram');
      await browser.pause(3000); // Give extra time for complex diagram

      // Verify the webview was created and diagram loaded
      await webviewHelpers.waitForDiagram(45000); // Increased timeout for complex diagram

      // Check that diagram container exists
      const diagram = await $('#sprotty-diagram');
      expect(await diagram.isExisting()).to.be.true;

      // Verify SVG was rendered
      const svg = await diagram.$('svg');
      expect(await svg.isExisting()).to.be.true;
    });
  });

  describe('Coffee Shop Flow Visualization', () => {
    beforeEach(async () => {
      // Ensure we're in the diagram webview
      await webviewHelpers.waitForDiagram();
    });

    it('should show the Order Flow in the flow selector', async () => {
      const flows = await webviewHelpers.getAvailableFlows();

      expect(flows).to.have.length.greaterThan(0);
      expect(flows).to.include('Order Flow');
    });

    it('should render nodes for coffee shop states', async () => {
      // Ensure Order Flow is selected
      await webviewHelpers.selectFlow('Order Flow');
      await browser.pause(1000);

      const nodes = await webviewHelpers.getDiagramNodes();
      expect(nodes).to.have.length.greaterThan(0);

      // Check for specific coffee shop states
      const expectedStates = [
        'Welcome',
        'Choose Size',
        'Choose Drink',
        'Customize',
        'Confirm Order',
        'Invalid Option',
      ];

      for (const stateName of expectedStates) {
        const node = await webviewHelpers.getNodeById(stateName);
        expect(await node.isExisting()).to.be.true;
      }
    });

    it('should render edges between states', async () => {
      await webviewHelpers.selectFlow('Order Flow');
      await browser.pause(1000);

      const edges = await webviewHelpers.getDiagramEdges();
      expect(edges).to.have.length.greaterThan(0);

      // Check that edges have proper paths
      for (const edge of edges) {
        const path = await edge.$('path');
        expect(await path.isExisting()).to.be.true;
      }
    });

    it('should show edge labels for transitions', async () => {
      await webviewHelpers.selectFlow('Order Flow');
      await browser.pause(1000);

      const edges = await webviewHelpers.getDiagramEdges();

      // Check for transition labels
      let foundLabels = 0;
      for (const edge of edges) {
        const label = await edge.$('text');
        if (await label.isExisting()) {
          const text = await label.getText();
          if (text) {
            foundLabels++;
            // Coffee shop should have labels like "Order Coffee", "Small", "Large", etc.
            expect(text).to.match(
              /(Order|Small|Medium|Large|Espresso|Cappuccino|timeout|userMessage)/i,
            );
          }
        }
      }

      expect(foundLabels).to.be.greaterThan(0);
    });
  });

  describe('Coffee Shop Context Variables', () => {
    beforeEach(async () => {
      await webviewHelpers.waitForDiagram();
      await webviewHelpers.selectFlow('Order Flow');
    });

    it('should handle Invalid Option state with @next context variable', async () => {
      // Find the Invalid Option state
      const invalidOptionNode = await webviewHelpers.getNodeById('Invalid Option');
      expect(await invalidOptionNode.isExisting()).to.be.true;

      // This state should be rendered properly despite using @next
      const classes = await invalidOptionNode.getAttribute('class');
      expect(classes).to.not.include('error');
    });

    it('should show context variable usage in transitions', async () => {
      // Look for transitions that use 'with' clauses
      const edges = await webviewHelpers.getDiagramEdges();

      // Coffee shop has transitions like: Choose Drink with size: "small", price: 3.50
      // These should render without errors
      expect(edges.length).to.be.greaterThan(5); // Complex flow should have many transitions
    });
  });

  describe('Interaction with Complex Flow', () => {
    beforeEach(async () => {
      await webviewHelpers.waitForDiagram();
      await webviewHelpers.selectFlow('Order Flow');
    });

    it('should allow selecting nodes in complex flow', async () => {
      // Test node selection
      await webviewHelpers.clickNode('Welcome');
      await browser.pause(500);

      const welcomeNode = await webviewHelpers.getNodeById('Welcome');
      const classes = await welcomeNode.getAttribute('class');
      expect(classes).to.include('selected');
    });

    it('should show property panel for coffee shop messages', async () => {
      // Select a node that should have message properties
      await webviewHelpers.clickNode('Welcome');
      await browser.pause(500);

      // Check if property panel appears (if implemented)
      const propertyPanel = await $('#property-panel');
      if (await propertyPanel.isExisting()) {
        const isDisplayed = await propertyPanel.isDisplayed();
        expect(isDisplayed).to.be.true;
      }
    });

    it('should handle dragging nodes in complex layout', async () => {
      const nodeId = 'Choose Size';

      // Get initial position
      const initialPos = await webviewHelpers.getNodePosition(nodeId);

      // Drag node
      await webviewHelpers.dragNode(nodeId, 50, 50);

      // Verify position changed
      const newPos = await webviewHelpers.getNodePosition(nodeId);

      expect(newPos.x).to.not.equal(initialPos.x);
      expect(newPos.y).to.not.equal(initialPos.y);
    });
  });

  describe('Performance with Complex Example', () => {
    it('should load coffee shop diagram within reasonable time', async () => {
      const startTime = Date.now();

      // Open file and diagram
      await workbench.executeCommand('File: Open File');
      await browser.pause(500);

      const input = await workbench.getQuickInputBox();
      await input.setValue('examples/coffee-shop.rcl');
      await input.confirm();

      await workbench.executeCommand('RCL: Open Interactive Diagram');
      await webviewHelpers.waitForDiagram(30000);

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Should load within 30 seconds
      expect(loadTime).to.be.lessThan(30000);
    });

    it('should maintain performance with complex state machine', async () => {
      await webviewHelpers.waitForDiagram();
      await webviewHelpers.selectFlow('Order Flow');

      const startTime = Date.now();

      // Perform multiple operations
      await webviewHelpers.clickNode('Welcome');
      await browser.pause(100);
      await webviewHelpers.clickNode('Choose Size');
      await browser.pause(100);
      await webviewHelpers.clickNode('Choose Drink');
      await browser.pause(100);

      const endTime = Date.now();
      const operationTime = endTime - startTime;

      // Operations should be responsive
      expect(operationTime).to.be.lessThan(2000);
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle if coffee-shop.rcl has compilation errors', async () => {
      // This test ensures the diagram doesn't crash if there are validation issues
      await webviewHelpers.waitForDiagram();

      // Even if there are semantic issues, the diagram should still render what it can
      const diagram = await $('#sprotty-diagram');
      expect(await diagram.isExisting()).to.be.true;

      // Should not show a blank or crashed state
      const svg = await diagram.$('svg');
      expect(await svg.isExisting()).to.be.true;
    });

    it('should show loading state during processing', async () => {
      // Check for loading indicators
      const loadingText = await $('.loading, [data-loading], .spinner');

      // If loading indicators exist, they should eventually disappear
      if (await loadingText.isExisting()) {
        await loadingText.waitForDisplayed({ reverse: true, timeout: 30000 });
      }

      // Diagram should be ready
      const diagram = await $('#sprotty-diagram');
      await diagram.waitForDisplayed({ timeout: 5000 });
    });
  });
});
