import { PropertyManager, RCLDiagramEngine, type RCLFlowModel } from '@rcl/diagram';

interface FlowNode {
  id: number;
  label: string;
  flow: string;
  message: string;
  type: 'initial' | 'normal';
}

interface FlowEdge {
  from: number;
  to: number;
  label: string;
  type: 'normal' | 'default';
}

interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export class SprottyDiagramRenderer {
  private diagramEngine: RCLDiagramEngine | null = null;
  private propertyManager: PropertyManager;
  private container: HTMLElement | null = null;
  private currentFlowData: FlowData | null = null;
  private sidebarContainer: HTMLElement | null = null;

  constructor() {
    this.propertyManager = new PropertyManager();
    console.log('🎨 Sprotty Diagram Renderer initialized');
  }

  initialize() {
    this.container = document.getElementById('diagram-container');
    if (!this.container) {
      throw new Error('Diagram container not found');
    }

    this.setupDiagramContainer();
    this.setupSidebar();
    this.initializeSprottyDiagram();
  }

  private setupDiagramContainer() {
    if (!this.container) return;

    // Clear and setup container
    this.container.innerHTML = '';
    this.container.className = 'rcl-diagram-container';

    // Create Sprotty container
    const sprottyContainer = document.createElement('div');
    sprottyContainer.id = 'sprotty-diagram';
    sprottyContainer.style.width = '100%';
    sprottyContainer.style.height = '100%';

    this.container.appendChild(sprottyContainer);

    // Add zoom controls
    this.addZoomControls();
  }

  private setupSidebar() {
    // Create sidebar for property editing
    this.sidebarContainer = document.createElement('div');
    this.sidebarContainer.className = 'diagram-sidebar';
    this.sidebarContainer.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 100%;
      background: #2d2d30;
      border-left: 1px solid #444;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 1000;
      overflow-y: auto;
    `;

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      color: #d4d4d4;
      font-size: 20px;
      cursor: pointer;
      padding: 4px 8px;
    `;
    closeBtn.onclick = () => this.hideSidebar();

    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Node Properties';
    title.style.cssText = `
      margin: 0;
      padding: 16px;
      color: #d4d4d4;
      font-size: 14px;
      border-bottom: 1px solid #444;
    `;

    // Add content area
    const content = document.createElement('div');
    content.id = 'sidebar-content';
    content.style.padding = '16px';

    this.sidebarContainer.appendChild(closeBtn);
    this.sidebarContainer.appendChild(title);
    this.sidebarContainer.appendChild(content);
    this.container?.appendChild(this.sidebarContainer);
  }

  private addZoomControls() {
    const controls = document.createElement('div');
    controls.className = 'zoom-controls';
    controls.style.cssText = `
      position: absolute;
      bottom: 16px;
      right: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 100;
    `;

    const zoomIn = this.createZoomButton('+', () => this.diagramEngine?.setZoom(1.2));
    const zoomOut = this.createZoomButton('−', () => this.diagramEngine?.setZoom(0.8));
    const zoomFit = this.createZoomButton('⌘', () => this.diagramEngine?.zoomToFit());

    controls.appendChild(zoomIn);
    controls.appendChild(zoomOut);
    controls.appendChild(zoomFit);
    this.container?.appendChild(controls);
  }

  private createZoomButton(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = 'zoom-btn';
    btn.onclick = onClick;
    return btn;
  }

  private initializeSprottyDiagram() {
    if (!this.container) return;

    try {
      this.diagramEngine = new RCLDiagramEngine('sprotty-diagram', {
        enableZoom: true,
        enablePan: true,
        enableNodeDrag: true,
        enableEdgeReconnect: true,
        autoLayout: true,
        nodeSpacing: { x: 180, y: 100 },
      });

      // Set up event handlers
      this.diagramEngine.onNodeSelected = (nodeId: string) => {
        this.handleNodeSelected(nodeId);
      };

      this.diagramEngine.onEdgeSelected = (edgeId: string) => {
        this.handleEdgeSelected(edgeId);
      };

      this.diagramEngine.onModelChanged = () => {
        // Trigger recompilation or other updates
        console.log('Diagram model changed');
      };

      console.log('✅ Sprotty diagram engine initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Sprotty diagram:', error);
      this.showError('Failed to initialize diagram engine');
    }
  }

  updateFlowData(flowData: FlowData | undefined) {
    if (!flowData || !this.diagramEngine) return;

    this.currentFlowData = flowData;

    // Convert legacy format to RCL format
    const rclFlowModel: RCLFlowModel = this.convertToRCLModel(flowData);

    console.log('🔄 Updating Sprotty diagram with data:', {
      nodeCount: rclFlowModel.nodes.length,
      edgeCount: rclFlowModel.edges.length,
    });

    this.diagramEngine.updateModel(rclFlowModel);
  }

  private convertToRCLModel(flowData: FlowData): RCLFlowModel {
    const nodes = flowData.nodes.map((node) => ({
      id: node.id.toString(),
      type: node.type === 'initial' ? ('start' as const) : ('message' as const),
      position: { x: 0, y: 0 }, // Will be positioned by layout engine
      data: {
        label: node.label,
        messageData: node.message
          ? {
              contentMessage: {
                text: node.message,
              },
            }
          : undefined,
        rclMetadata: {
          hasConditions: false,
          hasSuggestions: false,
          messageType: 'text',
        },
      },
    }));

    const edges = flowData.edges.map((edge) => ({
      id: `${edge.from}-${edge.to}`,
      source: edge.from.toString(),
      target: edge.to.toString(),
      data: {
        label: edge.label,
        trigger: edge.label,
        condition: edge.type === 'default' ? undefined : edge.label,
      },
    }));

    return {
      id: 'main-flow',
      nodes,
      edges,
    };
  }

  private handleNodeSelected(nodeId: string) {
    console.log('Node selected:', nodeId);

    if (!this.currentFlowData) return;

    // Find the selected node
    const node = this.currentFlowData.nodes.find((n) => n.id.toString() === nodeId);
    if (!node) return;

    // Convert to RCL node format for property editing
    const rclNode = {
      id: nodeId,
      type: node.type === 'initial' ? ('start' as const) : ('message' as const),
      position: { x: 0, y: 0 },
      data: {
        label: node.label,
        text: node.message,
        messageData: node.message
          ? {
              contentMessage: {
                text: node.message,
              },
            }
          : undefined,
      },
    };

    this.showNodeProperties(rclNode);
  }

  private handleEdgeSelected(edgeId: string) {
    console.log('Edge selected:', edgeId);
    // TODO: Implement edge property editing
    this.hideSidebar();
  }

  private showNodeProperties(node: any) {
    if (!this.sidebarContainer) return;

    const content = this.sidebarContainer.querySelector('#sidebar-content');
    if (!content) return;

    // Clear existing content
    content.innerHTML = '';

    // Create property editor
    const propertyEditor = this.propertyManager.createPropertyEditor(node, (updatedNode) => {
      this.handleNodePropertyChanged(updatedNode);
    });

    content.appendChild(propertyEditor);
    this.showSidebar();
  }

  private handleNodePropertyChanged(updatedNode: any) {
    console.log('Node property changed:', updatedNode);

    // Update the current flow data
    if (this.currentFlowData) {
      const nodeIndex = this.currentFlowData.nodes.findIndex(
        (n) => n.id.toString() === updatedNode.id,
      );
      if (nodeIndex !== -1) {
        this.currentFlowData.nodes[nodeIndex].label = updatedNode.data.label;
        this.currentFlowData.nodes[nodeIndex].message = updatedNode.data.text || '';
      }
    }

    // Update the diagram
    if (this.diagramEngine && this.currentFlowData) {
      const rclModel = this.convertToRCLModel(this.currentFlowData);
      this.diagramEngine.updateModel(rclModel);
    }

    // Trigger recompilation
    // TODO: Add callback to parent component
  }

  private showSidebar() {
    if (this.sidebarContainer) {
      this.sidebarContainer.style.transform = 'translateX(0)';
    }
  }

  private hideSidebar() {
    if (this.sidebarContainer) {
      this.sidebarContainer.style.transform = 'translateX(100%)';
    }
  }

  private showError(message: string) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="diagram-error">
        <div>
          <h3>Diagram Error</h3>
          <p>${message}</p>
        </div>
      </div>
    `;
  }
}
