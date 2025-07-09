export interface DiagramNode {
  id: string;
  position: { x: number; y: number };
  data: {
    label: string;
    message?: string;
    flow?: string;
  };
  type: 'start' | 'end' | 'message' | 'rich_card';
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  data: {
    label: string;
  };
  type: 'normal' | 'default';
}

export interface DiagramData {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface DiagramModel {
  flows: { [key: string]: DiagramData };
  activeFlow: string | null;
  messages: any;
  agent: any;
}

export class SimpleDiagramRenderer {
  private container: HTMLElement;
  private svg: SVGSVGElement | null = null;
  private currentModel: DiagramModel | null = null;
  private isPreviewMode: boolean;

  constructor(containerId: string, isPreviewMode = false) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found`);
    }
    this.container = container;
    this.isPreviewMode = isPreviewMode;
  }

  initialize() {
    console.log('🎨 Initializing Simple Diagram Renderer...');
    this.createSVG();
  }

  private createSVG() {
    // Clear container
    this.container.innerHTML = '';

    // Create SVG element
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.setAttribute('viewBox', '0 0 800 600');
    this.svg.style.background = this.isPreviewMode ? '#f5f5f5' : '#1e1e1e';
    this.svg.style.border = this.isPreviewMode ? '1px solid #ddd' : '1px solid #444';
    this.svg.style.display = 'block';
    this.svg.style.position = 'relative';

    // Add styles
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    if (this.isPreviewMode) {
      // Simplified styles for preview mode
      style.textContent = `
        .node { cursor: default; }
        .node-start { fill: #81c784; stroke: #66bb6a; stroke-width: 1; }
        .node-end { fill: #e57373; stroke: #ef5350; stroke-width: 1; }
        .node-message { fill: #64b5f6; stroke: #42a5f5; stroke-width: 1; }
        .node-rich_card { fill: #ffb74d; stroke: #ffa726; stroke-width: 1; }
        .node-text { fill: #333; font-family: Arial, sans-serif; font-size: 11px; text-anchor: middle; dominant-baseline: middle; }
        .edge { stroke: #999; stroke-width: 1; fill: none; marker-end: url(#arrowhead); }
        .edge-default { stroke: #bbb; stroke-dasharray: 3,3; }
        .edge-text { fill: #666; font-family: Arial, sans-serif; font-size: 9px; text-anchor: middle; }
      `;
    } else {
      // Interactive styles for flow mode
      style.textContent = `
        .node { cursor: pointer; }
        .node:hover { opacity: 0.8; }
        .node-start { fill: #4caf50; stroke: #388e3c; }
        .node-end { fill: #f44336; stroke: #d32f2f; }
        .node-message { fill: #2196f3; stroke: #1976d2; }
        .node-rich_card { fill: #ff9800; stroke: #f57c00; }
        .node-text { fill: white; font-family: Arial, sans-serif; font-size: 12px; text-anchor: middle; dominant-baseline: middle; }
        .edge { stroke: #666; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
        .edge-default { stroke: #888; stroke-dasharray: 5,5; }
        .edge-text { fill: #ccc; font-family: Arial, sans-serif; font-size: 10px; text-anchor: middle; }
      `;
    }
    this.svg.appendChild(style);

    // Add arrow marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', '#666');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    this.svg.appendChild(defs);

    this.container.appendChild(this.svg);
  }

  updateModel(model: DiagramModel) {
    this.currentModel = model;
    this.render();
  }

  private render() {
    if (!this.svg || !this.currentModel) return;

    // Clear existing content (except style and defs)
    const existingElements = this.svg.querySelectorAll('g, circle, rect, line, path, text');
    existingElements.forEach((el) => el.remove());

    // Get active flow data
    const activeFlow = this.currentModel.activeFlow || Object.keys(this.currentModel.flows)[0];
    const flowData = activeFlow ? this.currentModel.flows[activeFlow] : null;

    if (!flowData || !flowData.nodes || flowData.nodes.length === 0) {
      this.renderEmptyState();
      return;
    }

    console.log(
      '🎨 Rendering diagram with',
      flowData.nodes.length,
      'nodes and',
      flowData.edges.length,
      'edges',
    );

    // Render edges first (so they appear behind nodes)
    this.renderEdges(flowData.edges);

    // Render nodes
    this.renderNodes(flowData.nodes);
  }

  private renderEmptyState() {
    if (!this.svg) return;

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '400');
    text.setAttribute('y', '300');
    text.setAttribute('class', 'edge-text');
    text.setAttribute('font-size', '16');
    text.textContent = 'No flow diagram available. Compile valid RCL code to see the flow.';
    this.svg.appendChild(text);
  }

  private renderNodes(nodes: DiagramNode[]) {
    if (!this.svg) return;

    nodes.forEach((node) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'node');
      group.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);

      // Node shape
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '-40');
      rect.setAttribute('y', '-20');
      rect.setAttribute('width', '80');
      rect.setAttribute('height', '40');
      rect.setAttribute('rx', '8');
      rect.setAttribute('class', `node-${node.type}`);
      group.appendChild(rect);

      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'node-text');
      text.textContent = this.truncateText(node.data.label, 10);
      group.appendChild(text);

      // Add tooltip
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${node.data.label} (${node.type})`;
      group.appendChild(title);

      this.svg.appendChild(group);
    });
  }

  private renderEdges(edges: DiagramEdge[]) {
    if (!this.svg || !this.currentModel) return;

    const flowData =
      this.currentModel.flows[
        this.currentModel.activeFlow || Object.keys(this.currentModel.flows)[0]
      ];
    if (!flowData) return;

    const nodeMap = new Map<string, DiagramNode>();
    flowData.nodes.forEach((node) => nodeMap.set(node.id, node));

    edges.forEach((edge) => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      if (!sourceNode || !targetNode) return;

      // Calculate edge path
      const x1 = sourceNode.position.x;
      const y1 = sourceNode.position.y;
      const x2 = targetNode.position.x;
      const y2 = targetNode.position.y;

      // Simple straight line for now
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1.toString());
      line.setAttribute('y1', y1.toString());
      line.setAttribute('x2', x2.toString());
      line.setAttribute('y2', y2.toString());
      line.setAttribute('class', `edge ${edge.type === 'default' ? 'edge-default' : ''}`);
      this.svg.appendChild(line);

      // Edge label
      if (edge.data.label && edge.data.label !== 'default') {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX.toString());
        text.setAttribute('y', (midY - 5).toString());
        text.setAttribute('class', 'edge-text');
        text.textContent = this.truncateText(edge.data.label, 15);
        this.svg.appendChild(text);
      }
    });
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length <= maxLength ? text : text.substring(0, maxLength - 3) + '...';
  }

  // Compatibility methods for the existing interface
  setLayoutAlgorithm(value: string) {
    console.log('Layout algorithm changed to:', value);
    // Could implement different layout algorithms in the future
  }

  setLayoutDirection(value: string) {
    console.log('Layout direction changed to:', value);
    // Could implement different directions in the future
  }

  setEdgeRouting(value: string) {
    console.log('Edge routing changed to:', value);
    // Could implement different edge routing in the future
  }

  setEdgeSpacing(value: string) {
    console.log('Edge spacing changed to:', value);
    // Could implement different spacing in the future
  }

  toggleAutoLayout() {
    console.log('Auto layout toggled');
    // Could implement auto layout in the future
  }

  manualLayout() {
    console.log('Manual layout triggered');
    // Could implement manual layout in the future
  }

  toggleWaypointEditMode() {
    console.log('Waypoint edit mode toggled');
    // Could implement waypoint editing in the future
  }

  get options() {
    return {
      layoutAlgorithm: 'layered',
      layoutDirection: 'TB',
      edgeRouting: 'polyline',
      edgeSpacing: 'medium',
      autoLayout: true,
    };
  }

  get state() {
    return {
      waypointEditMode: false,
    };
  }
}
