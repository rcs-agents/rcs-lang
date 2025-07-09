import { browser } from '@wdio/globals';
import { expect } from 'chai';
import * as vscode from 'vscode';
import * as testHelpers from '../../utils/testHelpers';
import * as webviewHelpers from '../../utils/webviewHelpers';

describe('Cursor Synchronization', () => {
  let workbench: any;
  let textEditor: any;

  before(async () => {
    // Get VSCode workbench
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

    // Wait for diagram to load
    await webviewHelpers.waitForDiagram();
  });

  after(async () => {
    await webviewHelpers.switchToMainFrame();
    await workbench.executeCommand('View: Close All Editors');
  });

  describe('Editor to Diagram Sync', () => {
    beforeEach(async () => {
      // Switch to main frame to interact with editor
      await webviewHelpers.switchToMainFrame();
      textEditor = await workbench.getActiveTextEditor();
    });

    afterEach(async () => {
      // Ensure we're back in the webview for next test
      await webviewHelpers.waitForDiagram();
    });

    it('should highlight corresponding node when cursor is on flow definition', async () => {
      // Move cursor to GreetingFlow
      await textEditor.moveCursor(13, 6); // Line with "flow GreetingFlow"
      await browser.pause(500);

      // Check diagram
      await webviewHelpers.waitForDiagram();
      const isHighlighted = await webviewHelpers.isNodeHighlighted('GreetingFlow');
      expect(isHighlighted).to.be.true;
    });

    it('should highlight message node when cursor is on message reference', async () => {
      // Switch back to editor
      await webviewHelpers.switchToMainFrame();

      // Move cursor to WelcomeMessage reference in flow
      await textEditor.moveCursor(14, 11); // Line with "message WelcomeMessage"
      await browser.pause(500);

      // Check diagram
      await webviewHelpers.waitForDiagram();
      const isHighlighted = await webviewHelpers.isNodeHighlighted('WelcomeMessage');
      expect(isHighlighted).to.be.true;
    });

    it('should highlight state node when cursor is on state definition', async () => {
      await webviewHelpers.switchToMainFrame();

      // Move cursor to UserResponseState
      await textEditor.moveCursor(20, 7); // Line with "state UserResponseState"
      await browser.pause(500);

      // Check diagram
      await webviewHelpers.waitForDiagram();
      const isHighlighted = await webviewHelpers.isNodeHighlighted('UserResponseState');
      expect(isHighlighted).to.be.true;
    });

    it('should update highlight when cursor moves between nodes', async () => {
      await webviewHelpers.switchToMainFrame();

      // First position - GreetingFlow
      await textEditor.moveCursor(13, 6);
      await browser.pause(500);

      await webviewHelpers.waitForDiagram();
      let highlighted = await webviewHelpers.isNodeHighlighted('GreetingFlow');
      expect(highlighted).to.be.true;

      // Move to different node - UserResponseState
      await webviewHelpers.switchToMainFrame();
      await textEditor.moveCursor(20, 7);
      await browser.pause(500);

      await webviewHelpers.waitForDiagram();
      highlighted = await webviewHelpers.isNodeHighlighted('UserResponseState');
      expect(highlighted).to.be.true;

      // Check that previous node is no longer highlighted
      const previousHighlighted = await webviewHelpers.isNodeHighlighted('GreetingFlow');
      expect(previousHighlighted).to.be.false;
    });

    it('should show green glow animation on highlighted nodes', async () => {
      await webviewHelpers.switchToMainFrame();

      // Move cursor to trigger highlight
      await textEditor.moveCursor(13, 6);
      await browser.pause(500);

      await webviewHelpers.waitForDiagram();
      const node = await webviewHelpers.getNodeById('GreetingFlow');
      const classes = await node.getAttribute('class');

      // Check for animation classes
      expect(classes).to.include('synchronized');

      // Check for CSS animation
      const style = await node.getCSSProperty('animation-name');
      expect(style.value).to.include('pulse');
    });
  });

  describe('Diagram to Editor Sync', () => {
    beforeEach(async () => {
      // Ensure we're in the webview
      await webviewHelpers.waitForDiagram();
    });

    it('should jump to code when clicking on flow node', async () => {
      // Click on GreetingFlow node
      await webviewHelpers.clickNode('GreetingFlow');
      await browser.pause(500);

      // Switch to editor to check cursor position
      await webviewHelpers.switchToMainFrame();
      const position = await textEditor.getCursorPosition();

      // Should be on line 13 (0-indexed, so 12)
      expect(position.line).to.equal(12);
      expect(position.column).to.be.greaterThan(0);
    });

    it('should jump to message definition when clicking message node', async () => {
      await webviewHelpers.waitForDiagram();

      // Click on WelcomeMessage node
      await webviewHelpers.clickNode('WelcomeMessage');
      await browser.pause(500);

      await webviewHelpers.switchToMainFrame();
      const position = await textEditor.getCursorPosition();

      // Should jump to Messages section
      const content = await textEditor.getText();
      const lines = content.split('\n');
      const currentLine = lines[position.line];

      expect(currentLine).to.include('WelcomeMessage');
    });

    it('should jump to state definition when clicking state node', async () => {
      await webviewHelpers.waitForDiagram();

      // Click on UserResponseState node
      await webviewHelpers.clickNode('UserResponseState');
      await browser.pause(500);

      await webviewHelpers.switchToMainFrame();
      const position = await textEditor.getCursorPosition();

      // Should be on state definition line
      expect(position.line).to.equal(19); // Line 20 in 1-indexed
    });

    it('should center the view on the selected element', async () => {
      await webviewHelpers.waitForDiagram();

      // Click on a node that might be off-screen
      await webviewHelpers.clickNode('TimeoutState');
      await browser.pause(500);

      await webviewHelpers.switchToMainFrame();

      // Check that the editor scrolled to show the selection
      const visibleRange = await textEditor.getVisibleRange();
      const position = await textEditor.getCursorPosition();

      expect(position.line).to.be.greaterThanOrEqual(visibleRange.start.line);
      expect(position.line).to.be.lessThanOrEqual(visibleRange.end.line);
    });
  });

  describe('Bidirectional Sync Performance', () => {
    it('should handle rapid cursor movements without lag', async () => {
      const startTime = Date.now();

      // Perform rapid cursor movements
      for (let i = 0; i < 10; i++) {
        await webviewHelpers.switchToMainFrame();
        await textEditor.moveCursor(13 + i, 5);
        await browser.pause(50);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time (less than 2 seconds for 10 moves)
      expect(totalTime).to.be.lessThan(2000);
    });

    it('should handle rapid node clicks without missing updates', async () => {
      const nodes = ['GreetingFlow', 'UserResponseState', 'TimeoutState'];

      for (const nodeId of nodes) {
        await webviewHelpers.waitForDiagram();
        await webviewHelpers.clickNode(nodeId);
        await browser.pause(100);

        // Verify cursor moved
        await webviewHelpers.switchToMainFrame();
        const content = await textEditor.getSelectedText();
        expect(content).to.include(nodeId);
      }
    });

    it('should throttle updates to prevent flooding', async () => {
      await webviewHelpers.switchToMainFrame();

      // Track diagram update count
      let updateCount = 0;

      // Inject a counter in the webview
      await browser.execute(() => {
        (window as any).syncUpdateCount = 0;
        const originalHighlight = (window as any).highlightNode;
        (window as any).highlightNode = function (...args: any[]) {
          (window as any).syncUpdateCount++;
          return originalHighlight.apply(this, args);
        };
      });

      // Perform many rapid cursor movements
      for (let i = 0; i < 20; i++) {
        await textEditor.moveCursor(13, 5 + i);
        await browser.pause(10); // Very short pause
      }

      await browser.pause(500); // Wait for throttling

      // Get update count
      updateCount = await browser.execute(() => {
        return (window as any).syncUpdateCount || 0;
      });

      // Should be throttled (less than 20 updates)
      expect(updateCount).to.be.lessThan(20);
      expect(updateCount).to.be.greaterThan(0);
    });
  });

  describe('Sync Visual Feedback', () => {
    it('should show pulse animation when synchronized', async () => {
      await webviewHelpers.switchToMainFrame();
      await textEditor.moveCursor(13, 6);
      await browser.pause(200);

      await webviewHelpers.waitForDiagram();
      const node = await webviewHelpers.getNodeById('GreetingFlow');

      // Take screenshot for visual verification
      await webviewHelpers.takeDiagramScreenshot('sync-pulse-animation');

      // Check animation properties
      const animationDuration = await node.getCSSProperty('animation-duration');
      expect(animationDuration.value).to.equal('2s');

      const animationIterationCount = await node.getCSSProperty('animation-iteration-count');
      expect(animationIterationCount.value).to.equal('infinite');
    });

    it('should use green color for highlight effect', async () => {
      await webviewHelpers.switchToMainFrame();
      await textEditor.moveCursor(13, 6);
      await browser.pause(200);

      await webviewHelpers.waitForDiagram();
      const node = await webviewHelpers.getNodeById('GreetingFlow');

      // Get computed styles
      const filter = await node.getCSSProperty('filter');
      expect(filter.value).to.include('drop-shadow');

      // The green glow should be applied via CSS
      const boxShadow = await node.getCSSProperty('box-shadow');
      if (boxShadow.value !== 'none') {
        expect(boxShadow.value).to.include('0, 255, 0'); // RGB for green
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle cursor positions outside of syncable elements', async () => {
      await webviewHelpers.switchToMainFrame();

      // Move cursor to a comment or empty line
      await textEditor.moveCursor(1, 1); // Near top of file
      await browser.pause(500);

      // Check that no nodes are highlighted
      await webviewHelpers.waitForDiagram();
      const nodes = await webviewHelpers.getDiagramNodes();

      for (const node of nodes) {
        const highlighted = await node.getAttribute('class');
        expect(highlighted).to.not.include('synchronized');
      }
    });

    it('should handle multiple editor groups', async () => {
      await webviewHelpers.switchToMainFrame();

      // Split editor
      await workbench.executeCommand('View: Split Editor');
      await browser.pause(500);

      // Move cursor in the active editor
      await textEditor.moveCursor(13, 6);
      await browser.pause(500);

      // Sync should still work
      await webviewHelpers.waitForDiagram();
      const highlighted = await webviewHelpers.isNodeHighlighted('GreetingFlow');
      expect(highlighted).to.be.true;

      // Close split
      await webviewHelpers.switchToMainFrame();
      await workbench.executeCommand('View: Close Other Editors in Group');
    });

    it('should maintain sync after file edits', async () => {
      await webviewHelpers.switchToMainFrame();

      // Make a small edit
      await textEditor.moveCursor(5, 1);
      await textEditor.typeText('// Test comment\n');
      await browser.pause(500);

      // Move cursor to a flow
      await textEditor.moveCursor(14, 6); // Adjusted for new line
      await browser.pause(500);

      // Check sync still works
      await webviewHelpers.waitForDiagram();
      const highlighted = await webviewHelpers.isNodeHighlighted('GreetingFlow');
      expect(highlighted).to.be.true;

      // Undo the edit
      await webviewHelpers.switchToMainFrame();
      await workbench.executeCommand('Edit: Undo');
    });
  });
});
