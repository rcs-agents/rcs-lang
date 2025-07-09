import type { Locator, Page } from '@playwright/test';

/**
 * Helper functions for Interactive Diagram testing
 * Based on GLSP and Sprotty testing patterns
 */

export class DiagramTestHelpers {
  constructor(private page: Page) {}

  /**
   * Open the Interactive Diagram for the current RCL file
   */
  async openInteractiveDiagram(): Promise<void> {
    // Trigger the command palette
    await this.page.keyboard.press('F1');

    // Type and execute the Interactive Diagram command
    await this.page.fill('[placeholder="Type a command"]', 'RCL: Open Interactive Diagram');
    await this.page.press('[placeholder="Type a command"]', 'Enter');

    // Wait for the diagram to load
    await this.page.waitForSelector('[data-testid="sprotty-diagram"]', { timeout: 10000 });
  }

  /**
   * Get the diagram container
   */
  getDiagram(): Locator {
    return this.page.locator('[data-testid="sprotty-diagram"]');
  }

  /**
   * Get a specific node by its state ID
   */
  getNode(stateId: string): Locator {
    return this.page.locator(`[data-node-id="${stateId}"]`);
  }

  /**
   * Get an edge between two nodes
   */
  getEdge(sourceId: string, targetId: string): Locator {
    return this.page.locator(`[data-edge-source="${sourceId}"][data-edge-target="${targetId}"]`);
  }

  /**
   * Get all visible nodes in the diagram
   */
  getAllNodes(): Locator {
    return this.page.locator('[data-node-id]');
  }

  /**
   * Get all visible edges in the diagram
   */
  getAllEdges(): Locator {
    return this.page.locator('[data-edge-source]');
  }

  /**
   * Click on a node and wait for selection
   */
  async clickNode(stateId: string): Promise<void> {
    const node = this.getNode(stateId);
    await node.click();

    // Wait for selection state to be applied
    await this.page.waitForTimeout(100);
  }

  /**
   * Hover over a node and wait for hover effects
   */
  async hoverNode(stateId: string): Promise<void> {
    const node = this.getNode(stateId);
    await node.hover();

    // Wait for hover effects to be applied
    await this.page.waitForTimeout(100);
  }

  /**
   * Check if a node has a specific CSS class
   */
  async nodeHasClass(stateId: string, className: string): Promise<boolean> {
    const node = this.getNode(stateId);
    const classes = (await node.getAttribute('class')) || '';
    return classes.includes(className);
  }

  /**
   * Get the tooltip for a node
   */
  getNodeTooltip(): Locator {
    return this.page.locator('[data-testid="node-tooltip"]');
  }

  /**
   * Get the details panel for selected nodes
   */
  getDetailsPanel(): Locator {
    return this.page.locator('[data-testid="node-details"]');
  }

  /**
   * Get error message if diagram fails to load
   */
  getErrorMessage(): Locator {
    return this.page.locator('[data-testid="diagram-error"]');
  }

  /**
   * Get empty diagram message
   */
  getEmptyMessage(): Locator {
    return this.page.locator('[data-testid="empty-diagram"]');
  }

  /**
   * Wait for diagram to finish rendering
   */
  async waitForDiagramReady(): Promise<void> {
    // Wait for diagram container
    await this.page.waitForSelector('[data-testid="sprotty-diagram"]');

    // Wait for at least one node to be present (for non-empty diagrams)
    try {
      await this.page.waitForSelector('[data-node-id]', { timeout: 5000 });
    } catch {
      // If no nodes found, might be an empty diagram - that's okay
    }

    // Give additional time for layout and rendering
    await this.page.waitForTimeout(500);
  }

  /**
   * Get the bounding box of a node
   */
  async getNodeBounds(
    stateId: string,
  ): Promise<{ x: number; y: number; width: number; height: number } | null> {
    const node = this.getNode(stateId);
    return await node.boundingBox();
  }

  /**
   * Check if the diagram is laid out in a hierarchical manner
   */
  async validateHierarchicalLayout(startStateId: string, nextStateId: string): Promise<boolean> {
    const startBounds = await this.getNodeBounds(startStateId);
    const nextBounds = await this.getNodeBounds(nextStateId);

    if (!startBounds || !nextBounds) {
      return false;
    }

    // In a left-to-right layout, next state should be to the right
    // In a top-to-bottom layout, next state should be below
    return nextBounds.x > startBounds.x || nextBounds.y > startBounds.y;
  }

  /**
   * Navigate using keyboard
   */
  async navigateWithKeyboard(): Promise<void> {
    // Focus on the diagram
    await this.getDiagram().click();

    // Use Tab to navigate between elements
    await this.page.keyboard.press('Tab');
  }

  /**
   * Check accessibility attributes
   */
  async validateAccessibility(): Promise<{ hasRole: boolean; hasLabel: boolean }> {
    const diagram = this.getDiagram();

    const role = await diagram.getAttribute('role');
    const label = await diagram.getAttribute('aria-label');

    return {
      hasRole: role !== null,
      hasLabel: label !== null,
    };
  }
}

/**
 * Create test RCL content for different scenarios
 */
export const TestRclContent = {
  simple: `
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

  complex: `
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

  withErrors: `
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
