import { Container, ContainerModule } from 'inversify';
import {
  ActionHandlerRegistry,
  Command,
  CommandExecutionContext,
  type LocalModelSource,
  MouseListener,
  SCompartmentImpl,
  SCompartmentView,
  SEdgeImpl,
  SGraphImpl,
  SGraphView,
  SLabelImpl,
  SLabelView,
  type SModelElementImpl,
  SModelRootImpl,
  SNodeImpl,
  SRoutingHandleImpl,
  TYPES,
  configureModelElement,
  configureViewerOptions,
  loadDefaultModules,
} from 'sprotty';
import type { Action } from 'sprotty-protocol';
import { RCLCodeGenerator } from './codeGenerator.js';
import { type EdgeLayoutInfo, edgeLayoutManager } from './edges.js';
import { LayoutEngine } from './layout.js';
import { ConnectionValidator, MatchBlockNode, NodeFactory, RCLNodeImpl } from './nodes.js';
import { PropertyManager } from './properties.js';
import type { DiagramConfig, DiagramState, PropertyFormData, RCLFlowModel } from './types.js';
import { RCLEdgeView, RCLNodeView, RCLRoutingHandleView } from './views.js';

export class RCLDiagramEngine {
  private container: Container;
  private modelSource: LocalModelSource;
  private state: DiagramState;
  private config: DiagramConfig;
  private layoutEngine: LayoutEngine;
  private propertyManager: PropertyManager;
  private codeGenerator: RCLCodeGenerator;
  private currentEditingNode: string | null = null;
  private edgeReconnectHandler: EdgeReconnectHandler | null = null;

  constructor(containerId: string, config: DiagramConfig = {}) {
    this.config = {
      enableZoom: true,
      enablePan: true,
      enableNodeDrag: true,
      enableEdgeReconnect: true,
      autoLayout: true,
      nodeSpacing: { x: 180, y: 100 },
      ...config,
    };

    this.state = {
      flows: {},
      messages: {},
      agent: {},
      selectedNodes: new Set(),
      selectedEdges: new Set(),
      zoom: 1,
      pan: { x: 0, y: 0 },
    };

    this.layoutEngine = new LayoutEngine(this.config.nodeSpacing!);
    this.propertyManager = new PropertyManager();
    this.codeGenerator = new RCLCodeGenerator();
    this.container = this.createContainer();
    this.modelSource = this.container.get<LocalModelSource>(TYPES.ModelSource);

    this.initializeDiagram(containerId);
    this.setupEventListeners();
  }

  private createContainer(): Container {
    const rclDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
      // Configure diagram elements

      // Configure node views
      configureModelElement({ bind, isBound }, 'rcl:start', RCLNodeImpl, RCLNodeView);
      configureModelElement({ bind, isBound }, 'rcl:message', RCLNodeImpl, RCLNodeView);
      configureModelElement({ bind, isBound }, 'rcl:rich_card', RCLNodeImpl, RCLNodeView);
      configureModelElement({ bind, isBound }, 'rcl:end', RCLNodeImpl, RCLNodeView);
      configureModelElement({ bind, isBound }, 'rcl:condition', RCLNodeImpl, RCLNodeView);
      configureModelElement({ bind, isBound }, 'rcl:match', MatchBlockNode, RCLNodeView);
      configureModelElement({ bind, isBound }, 'rcl:match_option', RCLNodeImpl, RCLNodeView);

      // Configure edge views
      configureModelElement({ bind, isBound }, 'rcl:edge', SEdgeImpl, RCLEdgeView);

      // Configure routing handle
      configureModelElement(
        { bind, isBound },
        'routing-handle',
        SRoutingHandleImpl,
        RCLRoutingHandleView,
      );

      // Configure basic elements
      configureModelElement({ bind, isBound }, 'graph', SGraphImpl, SGraphView);
      configureModelElement({ bind, isBound }, 'label', SLabelImpl, SLabelView);
      configureModelElement({ bind, isBound }, 'comp', SCompartmentImpl, SCompartmentView);

      // Configure viewer options
      configureViewerOptions(
        { bind, isBound, rebind },
        {
          needsClientLayout: this.config.autoLayout,
          needsServerLayout: false,
          baseDiv: '',
          hiddenDiv: '',
          popupDiv: '',
          zoomLimits: { min: 0.1, max: 5.0 },
        },
      );

      // Add mouse listener for edge reconnection
      bind(EdgeReconnectHandler).toSelf().inSingletonScope();
      bind(TYPES.MouseListener).toService(EdgeReconnectHandler);
    });

    const container = new Container();
    loadDefaultModules(container as any);
    container.load(rclDiagramModule);

    // Store edge reconnect handler reference
    this.edgeReconnectHandler = container.get(EdgeReconnectHandler);
    this.edgeReconnectHandler.onEdgeReconnected = (edgeId, newSource, newTarget) => {
      this.handleEdgeReconnected(edgeId, newSource, newTarget);
    };

    return container;
  }

  private initializeDiagram(containerId: string): void {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container element ${containerId} not found`);
    }

    // Initialize the Sprotty diagram
    this.modelSource.setModel({
      type: 'graph',
      id: 'root',
      children: [],
    });
  }

  private setupEventListeners(): void {
    // Listen for node edit events
    document.addEventListener('node-edit', (e: Event) => {
      const customEvent = e as CustomEvent;
      const nodeId = customEvent.detail.nodeId;
      this.openPropertyEditor(nodeId);
    });

    // Listen for edge modified events
    document.addEventListener('edge-modified', (e: Event) => {
      const customEvent = e as CustomEvent;
      const edgeId = customEvent.detail.edgeId;
      this.updateEdgeInModel(edgeId);
    });

    // Listen for edge reconnection events
    document.addEventListener('edge-reconnected', (e: Event) => {
      const customEvent = e as CustomEvent;
      const { edgeId, endpointType, newNodeId } = customEvent.detail;
      this.handleEdgeEndpointReconnection(edgeId, endpointType, newNodeId);
    });
  }

  private openPropertyEditor(nodeId: string): void {
    const flow = this.state.flows[this.state.activeFlow!];
    if (!flow) return;

    const node = flow.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    this.currentEditingNode = nodeId;

    // Create property editor form
    const editorElement = this.propertyManager.createPropertyEditor(node, (formData) => {
      this.handlePropertyUpdate(nodeId, formData);
    });

    // Show in sidebar or modal
    this.showPropertyEditor(editorElement);
  }

  private handlePropertyUpdate(nodeId: string, formData: PropertyFormData): void {
    const flow = this.state.flows[this.state.activeFlow!];
    if (!flow) return;

    const nodeIndex = flow.nodes.findIndex((n) => n.id === nodeId);
    if (nodeIndex === -1) return;

    // Update node data
    const updatedNode = { ...flow.nodes[nodeIndex] };
    updatedNode.data.label = formData.label;

    // Update message data based on form
    if (formData.messageType) {
      updatedNode.data.messageData = this.createMessageDataFromForm(formData);
    }

    // Update node in flow
    flow.nodes[nodeIndex] = updatedNode;

    // Generate updated RCL code for this node
    const updatedNodeCode = this.codeGenerator.generateNodeUpdate(updatedNode, formData);

    // Create a source update event with the node information
    const sourceUpdate = {
      nodeId: nodeId,
      nodeType: updatedNode.type,
      oldLabel: flow.nodes[nodeIndex].data.label,
      newLabel: formData.label,
      updatedCode: updatedNodeCode,
      formData: formData,
    };

    // Trigger update
    this.updateModel(flow);

    // Call the callback with both the form data and the generated code
    if (this.onNodePropertyChanged) {
      this.onNodePropertyChanged(nodeId, formData, sourceUpdate);
    }

    // Close editor
    this.hidePropertyEditor();
  }

  private createMessageDataFromForm(formData: PropertyFormData): any {
    const messageData: any = {
      messageTrafficType: formData.messageTrafficType,
      contentMessage: {},
    };

    switch (formData.messageType) {
      case 'text':
        messageData.contentMessage.text = formData.text;
        break;

      case 'richCard':
        messageData.contentMessage.richCard = {
          standaloneCard: {
            cardOrientation: formData.cardOrientation,
            cardContent: {
              title: formData.cardTitle,
              description: formData.cardDescription,
            },
          },
        };
        break;

      case 'carousel':
        messageData.contentMessage.richCard = {
          carouselCard: {
            cardWidth: formData.cardWidth,
            cardContents: [],
          },
        };
        break;
    }

    // Add suggestions
    if (formData.suggestions && formData.suggestions.length > 0) {
      messageData.contentMessage.suggestions = formData.suggestions.map((s: any) => {
        if (s.type === 'reply') {
          return {
            reply: {
              text: s.text,
              postbackData: s.postbackData,
            },
          };
        } else {
          const action: any = {
            text: s.text,
            postbackData: s.postbackData,
          };

          // Add specific action type
          switch (s.actionType) {
            case 'openUrl':
              action.openUrlAction = s.actionData || { url: '' };
              break;
            case 'dial':
              action.dialAction = s.actionData || { phoneNumber: '' };
              break;
            // ... other action types
          }

          return { action };
        }
      });
    }

    return messageData;
  }

  private showPropertyEditor(editorElement: HTMLElement): void {
    // Implementation depends on UI framework
    // For now, append to a sidebar element
    const sidebar = document.querySelector('.diagram-sidebar') || this.createSidebar();
    const content = sidebar.querySelector('#sidebar-content') || sidebar;
    content.innerHTML = '';
    content.appendChild(editorElement);
    sidebar.classList.add('open');
  }

  private hidePropertyEditor(): void {
    const sidebar = document.querySelector('.diagram-sidebar');
    if (sidebar) {
      sidebar.classList.remove('open');
    }
    this.currentEditingNode = null;
  }

  private createSidebar(): HTMLElement {
    const sidebar = document.createElement('div');
    sidebar.className = 'diagram-sidebar';
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <h3>Properties</h3>
        <button class="close-btn" onclick="this.parentElement.parentElement.classList.remove('open')">×</button>
      </div>
      <div id="sidebar-content"></div>
    `;
    document.body.appendChild(sidebar);
    return sidebar;
  }

  private updateEdgeInModel(edgeId: string): void {
    const flow = this.state.flows[this.state.activeFlow!];
    if (!flow) return;

    const edge = flow.edges.find((e) => e.id === edgeId);
    if (!edge) return;

    // Get updated routing info
    const routing = edgeLayoutManager.getRouting(edgeId);
    edge.waypoints = routing.waypoints;
    edge.routingType = routing.type;

    // Trigger model update
    this.updateModel(flow);
  }

  private handleEdgeReconnected(edgeId: string, newSource: string, newTarget: string): void {
    const flow = this.state.flows[this.state.activeFlow!];
    if (!flow) return;

    const edgeIndex = flow.edges.findIndex((e) => e.id === edgeId);
    if (edgeIndex === -1) return;

    // Validate connection
    const sourceNode = flow.nodes.find((n) => n.id === newSource);
    const targetNode = flow.nodes.find((n) => n.id === newTarget);

    if (!sourceNode || !targetNode) return;

    const sourceImpl = NodeFactory.createNode(sourceNode.type, sourceNode.id, sourceNode.data);
    const targetImpl = NodeFactory.createNode(targetNode.type, targetNode.id, targetNode.data);

    if (!ConnectionValidator.canConnect(sourceImpl, targetImpl, 'right', 'left')) {
      // Invalid connection - revert
      this.updateModel(flow);
      return;
    }

    // Update edge
    flow.edges[edgeIndex] = {
      ...flow.edges[edgeIndex],
      source: newSource,
      target: newTarget,
    };

    // Trigger update
    this.updateModel(flow);
    this.onEdgeReconnected?.(edgeId, newSource, newTarget);
  }

  /**
   * Handle edge endpoint reconnection (moving source or target to different node)
   */
  private handleEdgeEndpointReconnection(
    edgeId: string,
    endpointType: 'source' | 'target',
    newNodeId: string,
  ): void {
    const flow = this.state.flows[this.state.activeFlow!];
    if (!flow) return;

    const edgeIndex = flow.edges.findIndex((e) => e.id === edgeId);
    if (edgeIndex === -1) return;

    const edge = flow.edges[edgeIndex];
    const newSource = endpointType === 'source' ? newNodeId : edge.source;
    const newTarget = endpointType === 'target' ? newNodeId : edge.target;

    // Validate the new connection
    const sourceNode = flow.nodes.find((n) => n.id === newSource);
    const targetNode = flow.nodes.find((n) => n.id === newTarget);

    if (!sourceNode || !targetNode) return;

    // Don't allow self-connections
    if (newSource === newTarget) {
      console.warn('Cannot create self-connection');
      this.updateModel(flow);
      return;
    }

    // Check if connection is valid
    const sourceImpl = NodeFactory.createNode(sourceNode.type, sourceNode.id, sourceNode.data);
    const targetImpl = NodeFactory.createNode(targetNode.type, targetNode.id, targetNode.data);

    if (!ConnectionValidator.canConnect(sourceImpl, targetImpl, 'right', 'left')) {
      console.warn('Invalid connection type');
      this.updateModel(flow);
      return;
    }

    // Update edge
    flow.edges[edgeIndex] = {
      ...edge,
      source: newSource,
      target: newTarget,
    };

    // Clear any waypoints as the edge path needs to be recalculated
    edgeLayoutManager.clearWaypoints(edgeId);

    // Trigger update
    this.updateModel(flow);
    this.onEdgeReconnected?.(edgeId, newSource, newTarget);
  }

  public updateModel(flowData: RCLFlowModel): void {
    if (!flowData) return;

    // Layout multi-edges to prevent overlapping
    const edgeLayouts = edgeLayoutManager.layoutMultiEdges(flowData.edges, flowData.nodes);

    // Apply layout if auto-layout is enabled
    const layoutedFlow = this.config.autoLayout ? this.layoutEngine.layoutFlow(flowData) : flowData;

    // Convert to Sprotty model
    const sprottyModel = this.convertToSprottyModel(layoutedFlow, edgeLayouts);

    // Update the diagram
    this.modelSource.setModel(sprottyModel);

    // Update state
    this.state.flows[flowData.id] = layoutedFlow;
    this.state.activeFlow = flowData.id;
  }

  private convertToSprottyModel(flow: RCLFlowModel, edgeLayouts: Map<string, EdgeLayoutInfo>): any {
    const children: any[] = [];

    // Convert nodes
    flow.nodes.forEach((node) => {
      const nodeImpl = NodeFactory.createNode(node.type, node.id, node.data);

      children.push({
        type: `rcl:${node.type}`,
        id: node.id,
        position: node.position,
        size: nodeImpl.size,
        children: [
          {
            type: 'label',
            id: `${node.id}_label`,
            text: node.data.label,
            position: { x: 10, y: 20 },
          },
        ],
        data: node.data,
      });

      // Add match options if this is a match block
      if (node.type === 'match' && node.data.matchOptions) {
        // Match options are rendered as part of the match block
      }
    });

    // Convert edges with layout information
    flow.edges.forEach((edge) => {
      const layoutInfo = edgeLayouts.get(edge.id);

      // Calculate connection points based on layout info
      const sourceNode = flow.nodes.find((n) => n.id === edge.source);
      const targetNode = flow.nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return;

      const sourcePoint = this.getConnectionPoint(
        sourceNode,
        layoutInfo?.sourceConnection || { side: 'right', offset: 0.5 },
      );
      const targetPoint = this.getConnectionPoint(
        targetNode,
        layoutInfo?.targetConnection || { side: 'left', offset: 0.5 },
      );

      children.push({
        type: 'rcl:edge',
        id: edge.id,
        sourceId: edge.source,
        targetId: edge.target,
        sourcePoint,
        targetPoint,
        layoutInfo,
        children: edge.data?.label
          ? [
              {
                type: 'label',
                id: `${edge.id}_label`,
                text: edge.data.label,
                edgePlacement: {
                  position: 0.5,
                  side: 'top',
                  rotate: false,
                },
              },
            ]
          : [],
        data: edge.data,
      });
    });

    return {
      type: 'graph',
      id: 'root',
      children,
    };
  }

  private getConnectionPoint(
    node: RCLFlowModel['nodes'][0],
    connection: { side: string; offset: number },
  ): { x: number; y: number } {
    const nodeImpl = NodeFactory.createNode(node.type, node.id, node.data);
    nodeImpl.position = node.position;
    nodeImpl.updateConnectionPoints();

    const point = nodeImpl.getConnectionPoint(connection.side as any);

    // Apply offset along the side
    const offset = connection.offset;
    switch (connection.side) {
      case 'top':
      case 'bottom':
        point.x = nodeImpl.size.width * offset;
        break;
      case 'left':
      case 'right':
        point.y = nodeImpl.size.height * offset;
        break;
    }

    return {
      x: node.position.x + point.x,
      y: node.position.y + point.y,
    };
  }

  public selectNode(nodeId: string): void {
    this.state.selectedNodes.clear();
    this.state.selectedNodes.add(nodeId);
    this.onNodeSelected?.(nodeId);
  }

  public selectEdge(edgeId: string): void {
    this.state.selectedEdges.clear();
    this.state.selectedEdges.add(edgeId);
    this.onEdgeSelected?.(edgeId);
  }

  public getSelectedNode(): string | null {
    return this.state.selectedNodes.values().next().value || null;
  }

  public getSelectedEdge(): string | null {
    return this.state.selectedEdges.values().next().value || null;
  }

  public zoomToFit(): void {
    // Implementation for zoom to fit
    // TODO: Implement zoom to fit using proper actions
  }

  public setZoom(factor: number): void {
    this.state.zoom = Math.max(0.1, Math.min(5.0, factor));
    // Apply zoom through Sprotty
  }

  public setPan(x: number, y: number): void {
    this.state.pan = { x, y };
    // Apply pan through Sprotty
  }

  // Event handlers
  public onNodeSelected?: (nodeId: string) => void;
  public onEdgeSelected?: (edgeId: string) => void;
  public onNodeMoved?: (nodeId: string, position: { x: number; y: number }) => void;
  public onEdgeReconnected?: (edgeId: string, newSource: string, newTarget: string) => void;
  public onNodePropertyChanged?: (
    nodeId: string,
    properties: PropertyFormData,
    sourceUpdate: any,
  ) => void;
  public onModelChanged?: () => void;

  /**
   * Generate RCL source code for the current flow
   */
  public generateFlowCode(): string | null {
    if (!this.state.activeFlow) return null;

    const flow = this.state.flows[this.state.activeFlow];
    if (!flow) return null;

    return this.codeGenerator.generateFlowCode(flow);
  }

  /**
   * Get the current flow model
   */
  public getCurrentFlow(): RCLFlowModel | null {
    if (!this.state.activeFlow) return null;
    return this.state.flows[this.state.activeFlow] || null;
  }

  public dispose(): void {
    // Cleanup resources
    document.removeEventListener('node-edit', this.openPropertyEditor as any);
    document.removeEventListener('edge-modified', this.updateEdgeInModel as any);
  }
}

/**
 * Mouse listener for edge reconnection
 */
class EdgeReconnectHandler extends MouseListener {
  private isDraggingHandle = false;
  private currentEdgeId: string | null = null;
  private handleType: 'source' | 'target' | null = null;

  public onEdgeReconnected?: (edgeId: string, newSource: string, newTarget: string) => void;

  mouseDown(target: SModelElementImpl, event: MouseEvent): (Action | Promise<Action>)[] {
    if (target instanceof SRoutingHandleImpl) {
      this.isDraggingHandle = true;
      const edge = target.parent as SEdgeImpl;
      this.currentEdgeId = edge.id;
      this.handleType = target.kind === 'source' ? 'source' : 'target';
    }
    return [];
  }

  mouseMove(target: SModelElementImpl, event: MouseEvent): (Action | Promise<Action>)[] {
    if (this.isDraggingHandle && this.currentEdgeId) {
      // Handle is being dragged - visual feedback handled by Sprotty
    }
    return [];
  }

  mouseUp(target: SModelElementImpl, event: MouseEvent): (Action | Promise<Action>)[] {
    if (this.isDraggingHandle && this.currentEdgeId && target instanceof RCLNodeImpl) {
      // Dropped on a node - reconnect edge
      const newNodeId = target.id;

      if (this.handleType === 'source') {
        this.onEdgeReconnected?.(this.currentEdgeId, newNodeId, '');
      } else {
        this.onEdgeReconnected?.(this.currentEdgeId, '', newNodeId);
      }
    }

    this.isDraggingHandle = false;
    this.currentEdgeId = null;
    this.handleType = null;

    return [];
  }
}
