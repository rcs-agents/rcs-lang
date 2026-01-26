import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect, test } from '@playwright/test';

test.describe('Enhanced Interactive Diagram Tests', () => {
  let _testRclContent: string;

  test.beforeAll(() => {
    // Create test RCL content
    _testRclContent = `agent TestDiagram
  displayName: "Test Diagram Agent"
  
  flow MainFlow
    start: Welcome
    
    on Welcome
      match @reply.text
        "Start" -> Processing
        "Help" -> ShowHelp
        :default -> Welcome
    
    on Processing
      match @reply.text
        "Continue" -> Complete
        "Cancel" -> Welcome
        :default -> Processing
    
    on ShowHelp
      # Show help information
      -> Welcome
      
    on Complete
      # End state
      
  messages Messages
    text Welcome "Welcome! Say 'Start' to begin or 'Help' for assistance."
    richCard ShowHelp "Help Information"
      description: "This is a test diagram showing different node types."
    text Processing "Processing your request..."
    text Complete "Process completed successfully!"
`;
  });

  test('should render diagram with correct node types', async ({ page }) => {
    // This test would run in a VS Code extension host environment
    // For now, we'll test the diagram rendering logic

    // Create a mock HTML page with our diagram
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 20px; }
    #sprotty-container { width: 800px; height: 600px; border: 1px solid #ccc; }
    ${fs.readFileSync(path.join(__dirname, '../../apps/extension/client/resources/sprotty-diagram.css'), 'utf8')}
  </style>
</head>
<body>
  <div id="root">
    <div class="toolbar">
      <select id="flowSelect">
        <option value="">Select Flow...</option>
      </select>
    </div>
    <div id="sprotty-container">
      <div class="loading">Loading...</div>
    </div>
  </div>
  <script>
    // Mock VS Code API
    window.acquireVsCodeApi = () => ({
      postMessage: (msg) => console.log('Message to extension:', msg),
      setState: (state) => console.log('State saved:', state),
      getState: () => ({})
    });
    
    ${fs.readFileSync(path.join(__dirname, '../../apps/extension/client/resources/interactive-diagram-enhanced.js'), 'utf8')}
  </script>
</body>
</html>`;

    // Set up the page
    await page.setContent(htmlContent);

    // Wait for diagram to initialize
    await page.waitForTimeout(500);

    // Send test data to the diagram
    await page.evaluate(() => {
      window.postMessage(
        {
          type: 'updateModel',
          data: {
            flows: {
              MainFlow: {
                id: 'MainFlow',
                nodes: [
                  {
                    id: 'Welcome',
                    type: 'start',
                    position: { x: 100, y: 100 },
                    data: { label: 'Welcome' },
                  },
                  {
                    id: 'Processing',
                    type: 'message',
                    position: { x: 300, y: 100 },
                    data: { label: 'Processing' },
                  },
                  {
                    id: 'ShowHelp',
                    type: 'rich_card',
                    position: { x: 300, y: 250 },
                    data: { label: 'Help' },
                  },
                  {
                    id: 'Complete',
                    type: 'end',
                    position: { x: 500, y: 100 },
                    data: { label: 'Complete' },
                  },
                ],
                edges: [
                  { id: 'e1', source: 'Welcome', target: 'Processing', data: { trigger: 'Start' } },
                  { id: 'e2', source: 'Welcome', target: 'ShowHelp', data: { trigger: 'Help' } },
                  {
                    id: 'e3',
                    source: 'Processing',
                    target: 'Complete',
                    data: { trigger: 'Continue' },
                  },
                  {
                    id: 'e4',
                    source: 'Processing',
                    target: 'Welcome',
                    data: { trigger: 'Cancel' },
                  },
                  { id: 'e5', source: 'ShowHelp', target: 'Welcome', data: {} },
                ],
              },
            },
            activeFlow: 'MainFlow',
            messages: {},
            agent: { name: 'TestDiagram' },
          },
        },
        '*',
      );
    });

    // Wait for rendering
    await page.waitForTimeout(1000);

    // Check that SVG was created
    const svg = await page.$('#sprotty-container svg');
    expect(svg).toBeTruthy();

    // Check for nodes
    const nodes = await page.$$('.diagram-node');
    expect(nodes.length).toBe(4);

    // Check for specific node types
    const startNode = await page.$('[data-node-id="Welcome"] circle');
    expect(startNode).toBeTruthy();

    const messageNode = await page.$('[data-node-id="Processing"] rect');
    expect(messageNode).toBeTruthy();

    const richCardNode = await page.$('[data-node-id="ShowHelp"] path');
    expect(richCardNode).toBeTruthy();

    const endNode = await page.$('[data-node-id="Complete"] circle');
    expect(endNode).toBeTruthy();

    // Check for edges
    const edges = await page.$$('.diagram-edge');
    expect(edges.length).toBe(5);

    // Check for edge labels
    const edgeLabels = await page.$$('.diagram-edge text');
    expect(edgeLabels.length).toBeGreaterThan(0);
  });

  test('should handle node selection', async ({ page }) => {
    // Set up page with diagram
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 20px; }
    #sprotty-container { width: 800px; height: 600px; border: 1px solid #ccc; }
    .diagram-node.selected > * { stroke-width: 3px !important; }
  </style>
</head>
<body>
  <div id="root">
    <div class="toolbar">
      <select id="flowSelect">
        <option value="">Select Flow...</option>
      </select>
    </div>
    <div id="sprotty-container"></div>
  </div>
  <script>
    window.acquireVsCodeApi = () => ({
      postMessage: (msg) => console.log('Message:', msg),
      setState: () => {},
      getState: () => ({})
    });
    
    ${fs.readFileSync(path.join(__dirname, '../../apps/extension/client/resources/interactive-diagram-enhanced.js'), 'utf8')}
  </script>
</body>
</html>`;

    await page.setContent(htmlContent);
    await page.waitForTimeout(500);

    // Send diagram data
    await page.evaluate(() => {
      window.postMessage(
        {
          type: 'updateModel',
          data: {
            flows: {
              TestFlow: {
                id: 'TestFlow',
                nodes: [
                  {
                    id: 'Node1',
                    type: 'message',
                    position: { x: 100, y: 100 },
                    data: { label: 'Node 1' },
                  },
                  {
                    id: 'Node2',
                    type: 'message',
                    position: { x: 300, y: 100 },
                    data: { label: 'Node 2' },
                  },
                ],
                edges: [],
              },
            },
            activeFlow: 'TestFlow',
            messages: {},
            agent: {},
          },
        },
        '*',
      );
    });

    await page.waitForTimeout(500);

    // Click on first node
    await page.click('[data-node-id="Node1"]');

    // Check that node is selected
    const isSelected = await page.$eval('[data-node-id="Node1"]', (el) =>
      el.classList.contains('selected'),
    );
    expect(isSelected).toBe(true);

    // Click on second node
    await page.click('[data-node-id="Node2"]');

    // Check that first node is no longer selected
    const firstNotSelected = await page.$eval(
      '[data-node-id="Node1"]',
      (el) => !el.classList.contains('selected'),
    );
    expect(firstNotSelected).toBe(true);

    // Check that second node is selected
    const secondSelected = await page.$eval('[data-node-id="Node2"]', (el) =>
      el.classList.contains('selected'),
    );
    expect(secondSelected).toBe(true);
  });

  test('should support pan and zoom', async ({ page }) => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; }
    #sprotty-container { width: 800px; height: 600px; border: 1px solid #ccc; }
  </style>
</head>
<body>
  <div id="root">
    <div class="toolbar">
      <select id="flowSelect"><option value="">Select Flow...</option></select>
    </div>
    <div id="sprotty-container"></div>
  </div>
  <script>
    window.acquireVsCodeApi = () => ({
      postMessage: () => {},
      setState: () => {},
      getState: () => ({})
    });
    ${fs.readFileSync(path.join(__dirname, '../../apps/extension/client/resources/interactive-diagram-enhanced.js'), 'utf8')}
  </script>
</body>
</html>`;

    await page.setContent(htmlContent);
    await page.waitForTimeout(500);

    // Send simple diagram
    await page.evaluate(() => {
      window.postMessage(
        {
          type: 'updateModel',
          data: {
            flows: {
              Test: {
                id: 'Test',
                nodes: [
                  { id: 'A', type: 'message', position: { x: 100, y: 100 }, data: { label: 'A' } },
                ],
                edges: [],
              },
            },
            activeFlow: 'Test',
            messages: {},
            agent: {},
          },
        },
        '*',
      );
    });

    await page.waitForTimeout(500);

    // Get initial transform
    const initialTransform = await page.$eval(
      '.diagram-viewport',
      (el) => el.getAttribute('transform') || '',
    );

    // Simulate pan by dragging
    await page.mouse.move(400, 300);
    await page.mouse.down();
    await page.mouse.move(500, 400);
    await page.mouse.up();

    // Check that transform changed
    const afterPanTransform = await page.$eval(
      '.diagram-viewport',
      (el) => el.getAttribute('transform') || '',
    );
    expect(afterPanTransform).not.toBe(initialTransform);

    // Simulate zoom
    await page.mouse.wheel(0, -100);

    // Check that transform includes scale
    const afterZoomTransform = await page.$eval(
      '.diagram-viewport',
      (el) => el.getAttribute('transform') || '',
    );
    expect(afterZoomTransform).toContain('scale');
  });
});
