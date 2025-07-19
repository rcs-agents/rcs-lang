import { $, $$, browser } from '@wdio/globals';
import { expect } from 'chai';

export class WebviewHelpers {
  async switchToWebview(): Promise<void> {
    const webview = await $('iframe.webview');
    await webview.waitForExist({ timeout: 10000 });
    await browser.switchToFrame(webview);
  }

  async switchToMain(): Promise<void> {
    await browser.switchToParentFrame();
  }

  async waitForDiagram(timeout = 30000): Promise<void> {
    // Wait for diagram container to exist
    const diagramContainer = await $('#sprotty-diagram, .diagram-container, .interactive-diagram');
    await diagramContainer.waitForExist({ timeout });

    // Wait for SVG content to load
    const svgContent = await $('svg, .diagram-svg');
    await svgContent.waitForExist({ timeout: 10000 });

    // Wait for initial render
    await browser.pause(1000);
  }

  async isDiagramVisible(): Promise<boolean> {
    try {
      const diagram = await $('#sprotty-diagram, .diagram-container, .interactive-diagram');
      return await diagram.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  async isStateVisible(stateName: string): Promise<boolean> {
    try {
      // Try multiple selectors for state nodes
      const selectors = [
        `[data-state="${stateName}"]`,
        `[id*="${stateName}"]`,
        `text=${stateName}`,
        `.state-node:contains("${stateName}")`,
        `g.sprotty-node:contains("${stateName}")`,
      ];

      for (const selector of selectors) {
        try {
          const element = await $(selector);
          if ((await element.isExisting()) && (await element.isDisplayed())) {
            return true;
          }
        } catch (e) {
          // Try next selector
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async areTransitionsVisible(): Promise<boolean> {
    try {
      // Look for edge/transition elements
      const selectors = ['g.sprotty-edge', '.edge', '.transition', 'path[stroke]', 'line[stroke]'];

      for (const selector of selectors) {
        try {
          const elements = await $$(selector);
          if (elements.length > 0) {
            return true;
          }
        } catch (e) {
          // Try next selector
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async areEdgeLabelsVisible(): Promise<boolean> {
    try {
      const labels = await $$('.edge-label, .transition-label, text[font-size]');
      return labels.length > 0;
    } catch (error) {
      return false;
    }
  }

  async clickState(stateName: string): Promise<boolean> {
    try {
      const selectors = [
        `[data-state="${stateName}"]`,
        `[id*="${stateName}"]`,
        `text=${stateName}`,
        `.state-node:contains("${stateName}")`,
      ];

      for (const selector of selectors) {
        try {
          const element = await $(selector);
          if ((await element.isExisting()) && (await element.isDisplayed())) {
            await element.click();
            return true;
          }
        } catch (e) {
          // Try next selector
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async dragState(stateName: string, deltaX: number, deltaY: number): Promise<boolean> {
    try {
      const selectors = [
        `[data-state="${stateName}"]`,
        `[id*="${stateName}"]`,
        `.state-node:contains("${stateName}")`,
      ];

      for (const selector of selectors) {
        try {
          const element = await $(selector);
          if ((await element.isExisting()) && (await element.isDisplayed())) {
            const rect = await (element as any).getRect();

            await browser.performActions([
              {
                type: 'pointer',
                id: 'mouse',
                parameters: { pointerType: 'mouse' },
                actions: [
                  {
                    type: 'pointerMove',
                    x: Math.floor(rect.x + rect.width / 2),
                    y: Math.floor(rect.y + rect.height / 2),
                  },
                  { type: 'pointerDown', button: 0 },
                  { type: 'pause', duration: 100 },
                  {
                    type: 'pointerMove',
                    x: Math.floor(rect.x + rect.width / 2 + deltaX),
                    y: Math.floor(rect.y + rect.height / 2 + deltaY),
                  },
                  { type: 'pause', duration: 100 },
                  { type: 'pointerUp', button: 0 },
                ],
              },
            ]);

            return true;
          }
        } catch (e) {
          // Try next selector
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async getFlowSelector(): Promise<any> {
    return await $('#flow-selector, .flow-dropdown, select[name="flow"]');
  }

  async selectFlow(flowName: string): Promise<void> {
    const selector = await this.getFlowSelector();
    await selector.selectByVisibleText(flowName);
    await browser.pause(500);
  }

  async getAvailableFlows(): Promise<string[]> {
    try {
      const selector = await this.getFlowSelector();
      const options = await selector.$$('option');
      const flows: string[] = [];

      for (const option of options) {
        const text = await option.getText();
        if (text && text.trim()) flows.push(text.trim());
      }

      return flows;
    } catch (error) {
      return [];
    }
  }

  async takeDiagramScreenshot(name: string): Promise<void> {
    try {
      const diagram = await $('#sprotty-diagram, .diagram-container, .interactive-diagram');
      await diagram.saveScreenshot(`./tests/screenshots/${name}.png`);
    } catch (error) {
      console.log(`Could not take screenshot: ${error}`);
    }
  }
}

/**
 * Wait for the interactive diagram webview to be loaded
 */
export async function waitForDiagram(timeout = 30000): Promise<void> {
  const webview = await $('iframe.webview');
  await webview.waitForExist({ timeout });

  // Switch to webview frame
  await browser.switchToFrame(webview);

  // Wait for Sprotty diagram container
  const diagram = await $('#sprotty-diagram');
  await diagram.waitForExist({ timeout: 10000 });

  // Wait for initial render
  await browser.pause(1000);
}

/**
 * Switch back to the main VSCode window from webview
 */
export async function switchToMainFrame(): Promise<void> {
  await browser.switchToParentFrame();
}

/**
 * Get all diagram nodes
 */
export async function getDiagramNodes() {
  const nodes = await $$('g.sprotty-node');
  return nodes;
}

/**
 * Get a specific node by its ID
 */
export async function getNodeById(nodeId: string) {
  const node = await $(`g.sprotty-node[id="${nodeId}"]`);
  return node;
}

/**
 * Click on a diagram node
 */
export async function clickNode(nodeId: string): Promise<void> {
  const node = await getNodeById(nodeId);
  await node.click();
}

/**
 * Check if a node is highlighted (has the highlight class)
 */
export async function isNodeHighlighted(nodeId: string): Promise<boolean> {
  const node = await getNodeById(nodeId);
  const classes = await node.getAttribute('class');
  return classes.includes('highlighted') || classes.includes('synchronized');
}

/**
 * Get the flow selector dropdown
 */
export async function getFlowSelector() {
  return await $('#flow-selector');
}

/**
 * Select a flow from the dropdown
 */
export async function selectFlow(flowName: string): Promise<void> {
  const selector = await getFlowSelector();
  await selector.selectByVisibleText(flowName);
  await browser.pause(500); // Wait for diagram update
}

/**
 * Get all available flows from the selector
 */
export async function getAvailableFlows(): Promise<string[]> {
  const selector = await getFlowSelector();
  const options = await selector.$$('option');
  const flows: string[] = [];

  for (const option of options) {
    const text = await option.getText();
    if (text) flows.push(text);
  }

  return flows;
}

/**
 * Drag a node from one position to another
 */
export async function dragNode(nodeId: string, deltaX: number, deltaY: number): Promise<void> {
  const node = await getNodeById(nodeId);
  const rect = await (node as any).getRect();

  await browser.performActions([
    {
      type: 'pointer',
      id: 'mouse',
      parameters: { pointerType: 'mouse' },
      actions: [
        {
          type: 'pointerMove',
          x: Math.floor(rect.x + rect.width / 2),
          y: Math.floor(rect.y + rect.height / 2),
        },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 100 },
        {
          type: 'pointerMove',
          x: Math.floor(rect.x + rect.width / 2 + deltaX),
          y: Math.floor(rect.y + rect.height / 2 + deltaY),
        },
        { type: 'pause', duration: 100 },
        { type: 'pointerUp', button: 0 },
      ],
    },
  ]);

  await browser.pause(500); // Wait for position update
}

/**
 * Get the position of a node
 */
export async function getNodePosition(nodeId: string): Promise<{ x: number; y: number }> {
  const node = await getNodeById(nodeId);
  const transform = await node.getAttribute('transform');

  // Parse transform="translate(x, y)"
  const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
  if (match) {
    return {
      x: Number.parseFloat(match[1]),
      y: Number.parseFloat(match[2]),
    };
  }

  return { x: 0, y: 0 };
}

/**
 * Create an edge between two nodes
 */
export async function createEdge(sourceNodeId: string, targetNodeId: string): Promise<void> {
  const sourceNode = await getNodeById(sourceNodeId);
  const targetNode = await getNodeById(targetNodeId);

  const sourceRect = await (sourceNode as any).getRect();
  const targetRect = await (targetNode as any).getRect();

  // Find edge port on source node (usually on the right)
  const sourceX = Math.floor(sourceRect.x + sourceRect.width - 10);
  const sourceY = Math.floor(sourceRect.y + sourceRect.height / 2);

  // Target center
  const targetX = Math.floor(targetRect.x + targetRect.width / 2);
  const targetY = Math.floor(targetRect.y + targetRect.height / 2);

  await browser.performActions([
    {
      type: 'pointer',
      id: 'mouse',
      parameters: { pointerType: 'mouse' },
      actions: [
        { type: 'pointerMove', x: sourceX, y: sourceY },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 100 },
        { type: 'pointerMove', x: targetX, y: targetY },
        { type: 'pause', duration: 100 },
        { type: 'pointerUp', button: 0 },
      ],
    },
  ]);

  await browser.pause(500);
}

/**
 * Get all edges in the diagram
 */
export async function getDiagramEdges() {
  const edges = await $$('g.sprotty-edge');
  return edges;
}

/**
 * Delete a selected element
 */
export async function deleteSelected(): Promise<void> {
  await browser.keys(['Delete']);
  await browser.pause(500);
}

/**
 * Open the property panel for a node
 */
export async function openPropertyPanel(nodeId: string): Promise<void> {
  await clickNode(nodeId);
  await browser.pause(500);

  // Check if property panel is visible
  const panel = await $('#property-panel');
  await panel.waitForDisplayed({ timeout: 5000 });
}

/**
 * Get property panel content
 */
export async function getPropertyPanelContent(): Promise<string> {
  const panel = await $('#property-panel');
  return await panel.getText();
}

/**
 * Set a property value in the property panel
 */
export async function setPropertyValue(propertyName: string, value: string): Promise<void> {
  const input = await $(`#property-${propertyName}`);
  await input.setValue(value);

  // Trigger change event
  await browser.keys(['Tab']);
  await browser.pause(500);
}

/**
 * Save property panel changes
 */
export async function savePropertyPanel(): Promise<void> {
  const saveButton = await $('#property-panel-save');
  await saveButton.click();
  await browser.pause(500);
}

/**
 * Take a screenshot of the diagram
 */
export async function takeDiagramScreenshot(name: string): Promise<void> {
  const diagram = await $('#sprotty-diagram');
  await diagram.saveScreenshot(`./tests/screenshots/${name}.png`);
}

/**
 * Wait for a specific node to appear
 */
export async function waitForNode(nodeId: string, timeout = 10000): Promise<void> {
  const node = await getNodeById(nodeId);
  await node.waitForExist({ timeout });
}

/**
 * Check if diagram is in sync with editor
 */
export async function isDiagramSynced(): Promise<boolean> {
  // Check for sync indicator
  const syncIndicator = await $('.sync-status');
  if (await syncIndicator.isExisting()) {
    const status = await syncIndicator.getAttribute('data-status');
    return status === 'synced';
  }
  return true; // Assume synced if no indicator
}
