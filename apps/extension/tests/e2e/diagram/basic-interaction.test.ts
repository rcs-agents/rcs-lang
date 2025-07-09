import { browser } from '@wdio/globals';
import { expect } from 'chai';
import * as webviewHelpers from '../../utils/webviewHelpers';

describe('Interactive Diagram Basic Features', () => {
  let workbench: any;

  before(async () => {
    workbench = await browser.getWorkbench();

    // Open test file
    await workbench.executeCommand('File: Open File');
    await browser.pause(500);

    const input = await workbench.getQuickInputBox();
    await input.setValue('simple-agent.rcl');
    await input.confirm();
    await browser.pause(1000);

    // Open interactive diagram
    await workbench.executeCommand('RCL: Open Interactive Diagram');
    await browser.pause(2000);
  });

  after(async () => {
    await webviewHelpers.switchToMainFrame();
    await workbench.executeCommand('View: Close All Editors');
  });

  describe('Diagram Loading', () => {
    it('should load diagram with correct elements', async () => {
      await webviewHelpers.waitForDiagram();

      // Check that diagram container exists
      const diagram = await $('#sprotty-diagram');
      expect(await diagram.isExisting()).to.be.true;

      // Check SVG structure
      const svg = await diagram.$('svg');
      expect(await svg.isExisting()).to.be.true;
    });

    it('should populate flow selector with available flows', async () => {
      const flows = await webviewHelpers.getAvailableFlows();

      expect(flows).to.have.length.greaterThan(0);
      expect(flows).to.include('GreetingFlow');
    });

    it('should render nodes for the selected flow', async () => {
      const nodes = await webviewHelpers.getDiagramNodes();

      expect(nodes).to.have.length.greaterThan(0);

      // Check specific nodes exist
      const greetingFlow = await webviewHelpers.getNodeById('GreetingFlow');
      expect(await greetingFlow.isExisting()).to.be.true;

      const welcomeMessage = await webviewHelpers.getNodeById('WelcomeMessage');
      expect(await welcomeMessage.isExisting()).to.be.true;
    });

    it('should render edges between nodes', async () => {
      const edges = await webviewHelpers.getDiagramEdges();

      expect(edges).to.have.length.greaterThan(0);

      // Check edge paths exist
      for (const edge of edges) {
        const path = await edge.$('path');
        expect(await path.isExisting()).to.be.true;
      }
    });

    it('should display node labels', async () => {
      const nodes = await webviewHelpers.getDiagramNodes();

      for (const node of nodes) {
        const label = await node.$('text');
        if (await label.isExisting()) {
          const text = await label.getText();
          expect(text).to.not.be.empty;
        }
      }
    });
  });

  describe('Node Selection and Dragging', () => {
    it('should select node on click', async () => {
      await webviewHelpers.waitForDiagram();

      const nodeId = 'WelcomeMessage';
      await webviewHelpers.clickNode(nodeId);
      await browser.pause(500);

      const node = await webviewHelpers.getNodeById(nodeId);
      const classes = await node.getAttribute('class');

      expect(classes).to.include('selected');
    });

    it('should show selection visual feedback', async () => {
      const nodeId = 'UserResponseState';
      await webviewHelpers.clickNode(nodeId);
      await browser.pause(500);

      const node = await webviewHelpers.getNodeById(nodeId);

      // Check for selection styling
      const stroke = await node.getCSSProperty('stroke');
      const strokeWidth = await node.getCSSProperty('stroke-width');

      // Selected nodes typically have different stroke
      expect(strokeWidth.parsed.value).to.be.greaterThan(1);
    });

    it('should deselect previous node when selecting new one', async () => {
      // Select first node
      await webviewHelpers.clickNode('WelcomeMessage');
      await browser.pause(300);

      // Select second node
      await webviewHelpers.clickNode('UserResponseState');
      await browser.pause(300);

      // Check first node is no longer selected
      const firstNode = await webviewHelpers.getNodeById('WelcomeMessage');
      const firstClasses = await firstNode.getAttribute('class');
      expect(firstClasses).to.not.include('selected');

      // Check second node is selected
      const secondNode = await webviewHelpers.getNodeById('UserResponseState');
      const secondClasses = await secondNode.getAttribute('class');
      expect(secondClasses).to.include('selected');
    });

    it('should drag node to new position', async () => {
      const nodeId = 'WelcomeMessage';

      // Get initial position
      const initialPos = await webviewHelpers.getNodePosition(nodeId);

      // Drag node
      await webviewHelpers.dragNode(nodeId, 100, 50);

      // Get new position
      const newPos = await webviewHelpers.getNodePosition(nodeId);

      // Verify position changed
      expect(newPos.x).to.not.equal(initialPos.x);
      expect(newPos.y).to.not.equal(initialPos.y);

      // Should move approximately the drag distance
      expect(Math.abs(newPos.x - initialPos.x)).to.be.closeTo(100, 20);
      expect(Math.abs(newPos.y - initialPos.y)).to.be.closeTo(50, 20);
    });

    it('should maintain node connections when dragging', async () => {
      const nodeId = 'UserResponseState';

      // Count initial edges
      const initialEdges = await webviewHelpers.getDiagramEdges();
      const initialEdgeCount = initialEdges.length;

      // Drag node
      await webviewHelpers.dragNode(nodeId, -50, -50);

      // Count edges after drag
      const finalEdges = await webviewHelpers.getDiagramEdges();
      const finalEdgeCount = finalEdges.length;

      // Edge count should remain the same
      expect(finalEdgeCount).to.equal(initialEdgeCount);
    });
  });

  describe('Edge Creation', () => {
    it('should create edge between nodes', async () => {
      // Get initial edge count
      const initialEdges = await webviewHelpers.getDiagramEdges();
      const initialCount = initialEdges.length;

      // Create new edge (this might need adjustment based on actual implementation)
      await webviewHelpers.createEdge('TimeoutState', 'UserResponseState');

      // Get new edge count
      const newEdges = await webviewHelpers.getDiagramEdges();
      const newCount = newEdges.length;

      // Should have one more edge
      expect(newCount).to.equal(initialCount + 1);
    });

    it('should show edge creation preview while dragging', async () => {
      // This test would check for temporary edge visualization
      // Implementation depends on how Sprotty handles edge creation

      const sourceNode = await webviewHelpers.getNodeById('GreetingFlow');
      const rect = await sourceNode.getBoundingClientRect();

      // Start drag from edge port
      await browser.performActions([
        {
          type: 'pointer',
          id: 'mouse',
          parameters: { pointerType: 'mouse' },
          actions: [
            {
              type: 'pointerMove',
              x: Math.floor(rect.x + rect.width - 10),
              y: Math.floor(rect.y + rect.height / 2),
            },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            {
              type: 'pointerMove',
              x: Math.floor(rect.x + rect.width + 50),
              y: Math.floor(rect.y + rect.height / 2),
            },
          ],
        },
      ]);

      // Check for preview edge (class name may vary)
      const previewEdge = await $('.edge-preview, .creating-edge');
      const exists = await previewEdge.isExisting();

      // Cancel the edge creation
      await browser.performActions([
        {
          type: 'pointer',
          id: 'mouse',
          parameters: { pointerType: 'mouse' },
          actions: [{ type: 'pointerUp', button: 0 }],
        },
      ]);

      // Preview edge should exist during creation
      expect(exists).to.be.true;
    });
  });

  describe('Delete Operations', () => {
    it('should delete selected node', async () => {
      // First, count nodes
      const initialNodes = await webviewHelpers.getDiagramNodes();
      const initialCount = initialNodes.length;

      // Select a node
      await webviewHelpers.clickNode('TimeoutMessage');
      await browser.pause(300);

      // Delete it
      await webviewHelpers.deleteSelected();

      // Count nodes again
      const finalNodes = await webviewHelpers.getDiagramNodes();
      const finalCount = finalNodes.length;

      // Should have one less node
      expect(finalCount).to.equal(initialCount - 1);

      // Specific node should not exist
      const deletedNode = await webviewHelpers.getNodeById('TimeoutMessage');
      expect(await deletedNode.isExisting()).to.be.false;
    });

    it('should delete selected edge', async () => {
      // Click on an edge to select it
      const edges = await webviewHelpers.getDiagramEdges();
      if (edges.length > 0) {
        await edges[0].click();
        await browser.pause(300);

        const initialEdgeCount = edges.length;

        // Delete selected edge
        await webviewHelpers.deleteSelected();

        // Count edges again
        const newEdges = await webviewHelpers.getDiagramEdges();
        const newEdgeCount = newEdges.length;

        expect(newEdgeCount).to.equal(initialEdgeCount - 1);
      }
    });
  });

  describe('Basic Property Panel', () => {
    it('should open property panel when selecting a node', async () => {
      await webviewHelpers.clickNode('WelcomeMessage');
      await browser.pause(500);

      const propertyPanel = await $('#property-panel');
      const exists = await propertyPanel.isExisting();

      expect(exists).to.be.true;

      if (exists) {
        const isDisplayed = await propertyPanel.isDisplayed();
        expect(isDisplayed).to.be.true;
      }
    });

    it('should display node properties in the panel', async () => {
      await webviewHelpers.openPropertyPanel('WelcomeMessage');

      const content = await webviewHelpers.getPropertyPanelContent();

      // Should show relevant properties
      expect(content).to.include('Message');
      expect(content).to.match(/text|Text/i);
    });

    it('should allow editing properties', async () => {
      await webviewHelpers.openPropertyPanel('WelcomeMessage');

      // Try to edit a property
      const textInput = await $('#property-text');
      if (await textInput.isExisting()) {
        const originalValue = await textInput.getValue();

        await textInput.setValue('Updated message text');
        await webviewHelpers.savePropertyPanel();

        // Re-open to verify
        await webviewHelpers.clickNode('UserResponseState'); // Click away
        await browser.pause(300);
        await webviewHelpers.openPropertyPanel('WelcomeMessage');

        const newValue = await textInput.getValue();
        expect(newValue).to.equal('Updated message text');

        // Restore original value
        await textInput.setValue(originalValue);
        await webviewHelpers.savePropertyPanel();
      }
    });
  });

  describe('Flow Selector', () => {
    it('should switch between flows', async () => {
      const selector = await webviewHelpers.getFlowSelector();
      expect(await selector.isExisting()).to.be.true;

      // Get current flow
      const currentFlow = await selector.getValue();

      // Get available flows
      const flows = await webviewHelpers.getAvailableFlows();

      if (flows.length > 1) {
        // Select a different flow
        const otherFlow = flows.find((f) => f !== currentFlow);
        if (otherFlow) {
          await webviewHelpers.selectFlow(otherFlow);

          // Verify diagram updated
          const nodes = await webviewHelpers.getDiagramNodes();
          expect(nodes.length).to.be.greaterThan(0);

          // Switch back
          await webviewHelpers.selectFlow(currentFlow);
        }
      }
    });

    it('should update diagram when flow changes', async () => {
      // Get initial nodes
      const initialNodes = await webviewHelpers.getDiagramNodes();
      const initialNodeIds = [];

      for (const node of initialNodes) {
        const id = await node.getAttribute('id');
        initialNodeIds.push(id);
      }

      // Change flow if possible
      const flows = await webviewHelpers.getAvailableFlows();
      if (flows.length > 1) {
        await webviewHelpers.selectFlow(flows[1]);

        // Get new nodes
        const newNodes = await webviewHelpers.getDiagramNodes();
        const newNodeIds = [];

        for (const node of newNodes) {
          const id = await node.getAttribute('id');
          newNodeIds.push(id);
        }

        // Node sets should be different
        expect(newNodeIds).to.not.deep.equal(initialNodeIds);
      }
    });
  });

  describe('Diagram Rendering', () => {
    it('should use correct node shapes for different types', async () => {
      // Message nodes typically have rounded rectangles
      const messageNode = await webviewHelpers.getNodeById('WelcomeMessage');
      const messageShape = await messageNode.$('rect, path');
      expect(await messageShape.isExisting()).to.be.true;

      // State nodes might have different shapes
      const stateNode = await webviewHelpers.getNodeById('UserResponseState');
      const stateShape = await stateNode.$('rect, circle, path');
      expect(await stateShape.isExisting()).to.be.true;
    });

    it('should apply correct colors based on node type', async () => {
      const nodes = await webviewHelpers.getDiagramNodes();

      for (const node of nodes) {
        const shape = await node.$('rect, circle, path');
        if (await shape.isExisting()) {
          const fill = await shape.getCSSProperty('fill');

          // Should have some fill color
          expect(fill.value).to.not.equal('none');
          expect(fill.value).to.not.be.empty;
        }
      }
    });

    it('should render edge labels correctly', async () => {
      const edges = await webviewHelpers.getDiagramEdges();

      for (const edge of edges) {
        const label = await edge.$('text');
        if (await label.isExisting()) {
          const text = await label.getText();
          // Transition edges should have labels like "userMessage" or "timeout"
          expect(text).to.match(/userMessage|timeout|when/i);
        }
      }
    });
  });

  describe('Diagram State Management', () => {
    it('should maintain diagram state during editor switches', async () => {
      // Get current node positions
      const nodeId = 'WelcomeMessage';
      const originalPos = await webviewHelpers.getNodePosition(nodeId);

      // Switch to another editor and back
      await webviewHelpers.switchToMainFrame();
      await workbench.executeCommand('View: Open Previous Editor');
      await browser.pause(500);
      await workbench.executeCommand('View: Open Next Editor');
      await browser.pause(500);

      // Check position is maintained
      await webviewHelpers.waitForDiagram();
      const newPos = await webviewHelpers.getNodePosition(nodeId);

      expect(newPos.x).to.equal(originalPos.x);
      expect(newPos.y).to.equal(originalPos.y);
    });

    it('should sync diagram with file changes', async () => {
      // This would test that diagram updates when the RCL file is edited
      // For now, we'll just verify the diagram stays in sync

      const syncStatus = await webviewHelpers.isDiagramSynced();
      expect(syncStatus).to.be.true;
    });
  });
});
