import * as fs from 'node:fs';
import * as path from 'node:path';
import { browser } from '@wdio/globals';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import * as webviewHelpers from '../utils/webviewHelpers.js';

// Use global expect from Jest/browser environment
declare const expect: any;

// Add custom matcher
if (expect?.extend) {
  expect.extend({ toMatchImageSnapshot });
}

describe('Visual Regression Tests', () => {
  let workbench: any;
  const screenshotDir = path.join(__dirname, '..', 'screenshots');

  before(async () => {
    // Create screenshot directory if it doesn't exist
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    workbench = await (browser as any).getWorkbench();
  });

  after(async () => {
    await webviewHelpers.switchToMainFrame();
    await workbench.executeCommand('View: Close All Editors');
  });

  describe('Diagram Rendering Consistency', () => {
    const testFiles = ['simple-agent.rcl', 'error-cases.rcl', 'examples/coffee-shop.rcl'];

    for (const testFile of testFiles) {
      it(`should render ${testFile} consistently`, async () => {
        // Open file
        await workbench.executeCommand('File: Open File');
        await browser.pause(500);

        const input = await workbench.getQuickInputBox();
        await input.setValue(testFile);
        await input.confirm();
        await browser.pause(1000);

        // Open diagram
        await workbench.executeCommand('RCL: Open Interactive Diagram');
        await browser.pause(2000);

        await webviewHelpers.waitForDiagram();

        // Wait for diagram to stabilize
        await browser.pause(1000);

        // Take screenshot
        const _diagram = await $('#sprotty-diagram');
        const screenshot = await browser.takeScreenshot();

        // Compare with baseline
        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: `diagram-${path.basename(testFile, '.rcl')}`,
          customSnapshotsDir: path.join(__dirname, '..', '__image_snapshots__'),
          customDiffDir: path.join(__dirname, '..', '__image_snapshots__', '__diff_output__'),
          failureThreshold: 0.01,
          failureThresholdType: 'percent',
        });

        // Close editor
        await webviewHelpers.switchToMainFrame();
        await workbench.executeCommand('View: Close Active Editor');
      });
    }
  });

  describe('Theme Compatibility', () => {
    const themes = [
      { name: 'Light', command: 'Preferences: Color Theme', value: 'Default Light+' },
      { name: 'Dark', command: 'Preferences: Color Theme', value: 'Default Dark+' },
    ];

    for (const theme of themes) {
      it(`should render correctly in ${theme.name} theme`, async () => {
        // Change theme
        await webviewHelpers.switchToMainFrame();
        await workbench.executeCommand(theme.command);
        await browser.pause(500);

        const themeInput = await workbench.getQuickInputBox();
        await themeInput.setValue(theme.value);
        await themeInput.confirm();
        await browser.pause(1000);

        // Open test file
        await workbench.executeCommand('File: Open File');
        await browser.pause(500);

        const fileInput = await workbench.getQuickInputBox();
        await fileInput.setValue('simple-agent.rcl');
        await fileInput.confirm();
        await browser.pause(1000);

        // Open diagram
        await workbench.executeCommand('RCL: Open Interactive Diagram');
        await browser.pause(2000);

        await webviewHelpers.waitForDiagram();
        await browser.pause(1000);

        // Take screenshot
        const _diagram = await $('#sprotty-diagram');
        const screenshot = await browser.takeScreenshot();

        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: `diagram-theme-${theme.name.toLowerCase()}`,
          customSnapshotsDir: path.join(__dirname, '..', '__image_snapshots__'),
          customDiffDir: path.join(__dirname, '..', '__image_snapshots__', '__diff_output__'),
          failureThreshold: 0.02,
          failureThresholdType: 'percent',
        });

        // Close editor
        await webviewHelpers.switchToMainFrame();
        await workbench.executeCommand('View: Close Active Editor');
      });
    }

    // Reset to default theme
    after(async () => {
      await webviewHelpers.switchToMainFrame();
      await workbench.executeCommand('Preferences: Color Theme');
      await browser.pause(500);

      const themeInput = await workbench.getQuickInputBox();
      await themeInput.setValue('Default Light+');
      await themeInput.confirm();
    });
  });

  describe('Interactive State Visualization', () => {
    beforeEach(async () => {
      // Open test file
      await workbench.executeCommand('File: Open File');
      await browser.pause(500);

      const input = await workbench.getQuickInputBox();
      await input.setValue('simple-agent.rcl');
      await input.confirm();
      await browser.pause(1000);

      // Open diagram
      await workbench.executeCommand('RCL: Open Interactive Diagram');
      await browser.pause(2000);

      await webviewHelpers.waitForDiagram();
    });

    afterEach(async () => {
      await webviewHelpers.switchToMainFrame();
      await workbench.executeCommand('View: Close Active Editor');
    });

    it('should show node selection state correctly', async () => {
      // Select a node
      await webviewHelpers.clickNode('WelcomeMessage');
      await browser.pause(500);

      // Take screenshot of selected state
      const _diagram = await $('#sprotty-diagram');
      const screenshot = await browser.takeScreenshot();

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'diagram-node-selected',
        customSnapshotsDir: path.join(__dirname, '..', '__image_snapshots__'),
        failureThreshold: 0.01,
        failureThresholdType: 'percent',
      });
    });

    it('should show hover state correctly', async () => {
      const node = await webviewHelpers.getNodeById('UserResponseState');

      // Hover over node
      await node.moveTo();
      await browser.pause(500);

      // Take screenshot of hover state
      const _diagram = await $('#sprotty-diagram');
      const screenshot = await browser.takeScreenshot();

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'diagram-node-hover',
        customSnapshotsDir: path.join(__dirname, '..', '__image_snapshots__'),
        failureThreshold: 0.01,
        failureThresholdType: 'percent',
      });
    });

    it('should show synchronized state correctly', async () => {
      // Trigger synchronization
      await webviewHelpers.switchToMainFrame();
      const textEditor = await workbench.getActiveTextEditor();
      await textEditor.moveCursor(13, 6); // GreetingFlow line
      await browser.pause(500);

      // Take screenshot of synchronized state
      await webviewHelpers.waitForDiagram();
      const _diagram = await $('#sprotty-diagram');
      const screenshot = await browser.takeScreenshot();

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'diagram-node-synchronized',
        customSnapshotsDir: path.join(__dirname, '..', '__image_snapshots__'),
        failureThreshold: 0.01,
        failureThresholdType: 'percent',
      });
    });
  });

  describe('Edge Rendering', () => {
    beforeEach(async () => {
      // Open test file
      await workbench.executeCommand('File: Open File');
      await browser.pause(500);

      const input = await workbench.getQuickInputBox();
      await input.setValue('simple-agent.rcl');
      await input.confirm();
      await browser.pause(1000);

      // Open diagram
      await workbench.executeCommand('RCL: Open Interactive Diagram');
      await browser.pause(2000);

      await webviewHelpers.waitForDiagram();
    });

    afterEach(async () => {
      await webviewHelpers.switchToMainFrame();
      await workbench.executeCommand('View: Close Active Editor');
    });

    it('should render edge labels correctly', async () => {
      // Focus on area with edges
      const diagram = await $('#sprotty-diagram');
      const svg = await diagram.$('svg');

      // Pan to show edges clearly
      await svg.moveTo();
      await browser.pause(500);

      const screenshot = await browser.takeScreenshot();

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'diagram-edge-labels',
        customSnapshotsDir: path.join(__dirname, '..', '__image_snapshots__'),
        failureThreshold: 0.01,
        failureThresholdType: 'percent',
      });
    });

    it('should show edge creation preview', async () => {
      // Start creating an edge
      const sourceNode = await webviewHelpers.getNodeById('GreetingFlow');
      const rect = await (sourceNode as any).getRect();

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
              x: Math.floor(rect.x + rect.width + 100),
              y: Math.floor(rect.y + rect.height / 2),
            },
          ],
        },
      ]);

      await browser.pause(500);

      // Take screenshot with edge preview
      const _diagram = await $('#sprotty-diagram');
      const screenshot = await browser.takeScreenshot();

      // Cancel edge creation
      await browser.performActions([
        {
          type: 'pointer',
          id: 'mouse',
          parameters: { pointerType: 'mouse' },
          actions: [{ type: 'pointerUp', button: 0 }],
        },
      ]);

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'diagram-edge-creation-preview',
        customSnapshotsDir: path.join(__dirname, '..', '__image_snapshots__'),
        failureThreshold: 0.02,
        failureThresholdType: 'percent',
      });
    });
  });

  describe('Layout Consistency', () => {
    it('should maintain consistent layout after node movements', async () => {
      // Open test file
      await workbench.executeCommand('File: Open File');
      await browser.pause(500);

      const input = await workbench.getQuickInputBox();
      await input.setValue('simple-agent.rcl');
      await input.confirm();
      await browser.pause(1000);

      // Open diagram
      await workbench.executeCommand('RCL: Open Interactive Diagram');
      await browser.pause(2000);

      await webviewHelpers.waitForDiagram();

      // Move a node
      await webviewHelpers.dragNode('WelcomeMessage', 50, 50);
      await browser.pause(500);

      // Reset layout (if available)
      const resetButton = await $('#reset-layout');
      if (await resetButton.isExisting()) {
        await resetButton.click();
        await browser.pause(1000);
      }

      // Take screenshot
      const _diagram = await $('#sprotty-diagram');
      const screenshot = await browser.takeScreenshot();

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'diagram-layout-reset',
        customSnapshotsDir: path.join(__dirname, '..', '__image_snapshots__'),
        failureThreshold: 0.02,
        failureThresholdType: 'percent',
      });

      await webviewHelpers.switchToMainFrame();
      await workbench.executeCommand('View: Close Active Editor');
    });
  });

  describe('Error State Visualization', () => {
    it('should show error indicators on invalid nodes', async () => {
      // Open file with errors
      await workbench.executeCommand('File: Open File');
      await browser.pause(500);

      const input = await workbench.getQuickInputBox();
      await input.setValue('error-cases.rcl');
      await input.confirm();
      await browser.pause(1000);

      // Open diagram
      await workbench.executeCommand('RCL: Open Interactive Diagram');
      await browser.pause(2000);

      await webviewHelpers.waitForDiagram();
      await browser.pause(1000);

      // Take screenshot showing error states
      const _diagram = await $('#sprotty-diagram');
      const screenshot = await browser.takeScreenshot();

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'diagram-error-states',
        customSnapshotsDir: path.join(__dirname, '..', '__image_snapshots__'),
        failureThreshold: 0.02,
        failureThresholdType: 'percent',
      });

      await webviewHelpers.switchToMainFrame();
      await workbench.executeCommand('View: Close Active Editor');
    });
  });

  describe('Zoom and Pan', () => {
    beforeEach(async () => {
      // Open test file
      await workbench.executeCommand('File: Open File');
      await browser.pause(500);

      const input = await workbench.getQuickInputBox();
      await input.setValue('simple-agent.rcl');
      await input.confirm();
      await browser.pause(1000);

      // Open diagram
      await workbench.executeCommand('RCL: Open Interactive Diagram');
      await browser.pause(2000);

      await webviewHelpers.waitForDiagram();
    });

    afterEach(async () => {
      await webviewHelpers.switchToMainFrame();
      await workbench.executeCommand('View: Close Active Editor');
    });

    it('should render correctly when zoomed in', async () => {
      // Zoom in (if zoom controls available)
      const zoomIn = await $('#zoom-in');
      if (await zoomIn.isExisting()) {
        await zoomIn.click();
        await zoomIn.click();
        await browser.pause(500);
      }

      const _diagram = await $('#sprotty-diagram');
      const screenshot = await browser.takeScreenshot();

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'diagram-zoomed-in',
        customSnapshotsDir: path.join(__dirname, '..', '__image_snapshots__'),
        failureThreshold: 0.02,
        failureThresholdType: 'percent',
      });
    });

    it('should render correctly when zoomed out', async () => {
      // Zoom out
      const zoomOut = await $('#zoom-out');
      if (await zoomOut.isExisting()) {
        await zoomOut.click();
        await zoomOut.click();
        await browser.pause(500);
      }

      const _diagram = await $('#sprotty-diagram');
      const screenshot = await browser.takeScreenshot();

      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'diagram-zoomed-out',
        customSnapshotsDir: path.join(__dirname, '..', '__image_snapshots__'),
        failureThreshold: 0.02,
        failureThresholdType: 'percent',
      });
    });
  });
});
