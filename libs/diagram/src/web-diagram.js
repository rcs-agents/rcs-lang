// RCL Interactive Diagram - Web Implementation with ELK Layout
// Adapted from VSCode extension for standalone web use

import ELK from 'elkjs/lib/elk.bundled.js';

export class RCLWebDiagram {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = {
      enableZoom: true,
      enablePan: true,
      enableNodeDrag: true,
      enableEdgeReconnect: true,
      showPropertyPanel: true,
      autoLayout: true,
      layoutAlgorithm: 'layered',
      layoutDirection: 'DOWN',
      edgeRouting: 'ORTHOGONAL', // ORTHOGONAL, SPLINES, STRAIGHT
      edgeSpacing: 'auto', // auto, tight, loose
      ...options,
    };

    // State management
    this.state = {
      flows: {},
      activeFlow: null,
      messages: {},
      agent: {},
      selectedNodes: new Set(),
      selectedEdges: new Set(),
      selectedMessage: null,
      zoom: 1,
      pan: { x: 0, y: 0 },
      draggedNode: null,
      draggedConnection: null,
      connectionMode: false,
      isDragging: false,
      dragStartPos: null,
      // Connector editing state
      editingEdge: null,
      edgeWaypoints: new Map(), // edgeId -> waypoints array
      draggingWaypoint: null,
      waypointEditMode: false,
    };

    // Initialize ELK
    this.elk = new ELK();

    // Layout algorithms and their display names
    this.layoutAlgorithms = {
      layered: 'Hierarchical (Layered)',
      force: 'Force-Directed',
      stress: 'Stress-Based',
      mrtree: 'Tree Layout',
      radial: 'Radial',
      disco: 'Disconnected Components',
    };

    this.layoutDirections = {
      DOWN: 'Top to Bottom',
      UP: 'Bottom to Top',
      RIGHT: 'Left to Right',
      LEFT: 'Right to Left',
    };

    this.edgeRoutingOptions = {
      ORTHOGONAL: 'Orthogonal (90°)',
      SPLINES: 'Curved (Organic)',
      STRAIGHT: 'Straight Lines',
    };

    this.edgeSpacingOptions = {
      auto: 'Auto Spacing',
      tight: 'Tight Spacing',
      loose: 'Loose Spacing',
    };

    // DOM elements
    this.elements = {};
    this.svg = null;
    this.g = null; // Main group for transformations

    // Event callbacks
    this.onNodeSelected = null;
    this.onEdgeSelected = null;
    this.onModelChanged = null;
  }

  initialize() {
    console.log('🚀 RCL Web Diagram: Initializing');

    this.setupContainer();
    this.setupEventListeners();
    this.initializeDiagram();

    console.log('✅ RCL Web Diagram: Initialized successfully');
  }

  setupContainer() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container element ${this.containerId} not found`);
    }

    // Clear and setup container
    container.innerHTML = '';
    container.className = 'rcl-diagram-container';
    container.style.cssText = `
            width: 100%;
            height: 100%;
            position: relative;
            background: #1e1e1e;
            overflow: hidden;
        `;

    // Create main diagram area
    const diagramArea = document.createElement('div');
    diagramArea.id = 'diagram-area';
    diagramArea.style.cssText = `
            width: 100%;
            height: 100%;
            position: relative;
        `;

    // Create property panel if enabled
    if (this.options.showPropertyPanel) {
      const propertyPanel = document.createElement('div');
      propertyPanel.id = 'property-panel';
      propertyPanel.className = 'diagram-property-panel';
      propertyPanel.style.cssText = `
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

      const panelHeader = document.createElement('div');
      panelHeader.style.cssText = `
                padding: 16px;
                border-bottom: 1px solid #444;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

      const panelTitle = document.createElement('h3');
      panelTitle.textContent = 'Properties';
      panelTitle.style.cssText = `
                margin: 0;
                color: #d4d4d4;
                font-size: 14px;
            `;

      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.style.cssText = `
                background: none;
                border: none;
                color: #d4d4d4;
                font-size: 20px;
                cursor: pointer;
                padding: 4px 8px;
            `;
      closeBtn.onclick = () => this.hidePropertyPanel();

      const panelContent = document.createElement('div');
      panelContent.id = 'property-content';
      panelContent.style.padding = '16px';

      panelHeader.appendChild(panelTitle);
      panelHeader.appendChild(closeBtn);
      propertyPanel.appendChild(panelHeader);
      propertyPanel.appendChild(panelContent);
      container.appendChild(propertyPanel);

      this.elements.propertyPanel = propertyPanel;
      this.elements.propertyContent = panelContent;
    }

    container.appendChild(diagramArea);
    this.elements.container = container;
    this.elements.diagramArea = diagramArea;
  }

  setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        this.deleteSelection();
      } else if (e.key === 'Escape') {
        this.state.connectionMode = false;
        this.state.waypointEditMode = false;
        this.state.editingEdge = null;
        this.svg?.classList.remove('connection-mode');
        this.svg?.classList.remove('waypoint-edit-mode');
        this.finishConnection();
        this.renderDiagram(); // Refresh to hide waypoint handles
      } else if (e.key === 'w' || e.key === 'W') {
        // Toggle waypoint editing mode
        this.toggleWaypointEditMode();
      }
    });
  }

  initializeDiagram() {
    console.log('🎨 Interactive Diagram: Initializing SVG');

    // Create SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.setAttribute('style', 'background: #1e1e1e;');

    // Create defs for markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Arrow marker
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'strokeWidth');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', '#666');

    marker.appendChild(polygon);
    defs.appendChild(marker);
    this.svg.appendChild(defs);

    // Main transformation group
    this.g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.g.setAttribute('class', 'diagram-content');
    this.svg.appendChild(this.g);

    this.elements.diagramArea.appendChild(this.svg);

    this.setupSvgInteractions();

    console.log('✅ Interactive Diagram: SVG created');
  }

  setupSvgInteractions() {
    let isPanning = false;
    let startX = 0;
    let startY = 0;

    // Mouse down
    this.svg.addEventListener('mousedown', (e) => {
      if (e.target === this.svg || e.target === this.g) {
        isPanning = true;
        startX = e.clientX - this.state.pan.x;
        startY = e.clientY - this.state.pan.y;
        this.svg.style.cursor = 'grabbing';

        // Clear selections and close properties panel
        this.state.selectedNodes.clear();
        this.state.selectedEdges.clear();
        this.updateSelections();
        this.hidePropertyPanel();
      }
    });

    // Mouse move
    this.svg.addEventListener('mousemove', (e) => {
      if (isPanning) {
        this.state.pan.x = e.clientX - startX;
        this.state.pan.y = e.clientY - startY;
        this.updateViewTransform();
      }
    });

    // Mouse up
    this.svg.addEventListener('mouseup', () => {
      isPanning = false;
      this.svg.style.cursor = this.state.connectionMode ? 'crosshair' : 'default';
    });

    // Zoom
    this.svg.addEventListener('wheel', (e) => {
      if (!this.options.enableZoom) return;

      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.setZoomAtPoint(this.state.zoom * delta, e.clientX, e.clientY);
    });
  }

  async updateModel(data) {
    console.log('📊 RCL Web Diagram: Updating model', data);

    if (data.flows) {
      this.state.flows = data.flows;
    }

    if (data.activeFlow) {
      this.state.activeFlow = data.activeFlow;
    }

    if (data.messages) {
      this.state.messages = data.messages;
    }

    if (data.agent) {
      this.state.agent = data.agent;
    }

    // Apply automatic layout if enabled
    if (this.options.autoLayout && this.state.flows[this.state.activeFlow]) {
      await this.applyAutoLayout();
    }

    this.renderDiagram();
  }

  async applyAutoLayout() {
    const flow = this.state.flows[this.state.activeFlow];
    if (!flow || !flow.nodes || !flow.edges) return;

    try {
      // Calculate spacing values based on edge spacing setting
      const spacingConfig = this.getSpacingConfig();

      // Convert to ELK format
      const elkGraph = {
        id: 'root',
        layoutOptions: {
          'elk.algorithm': this.options.layoutAlgorithm,
          'elk.direction': this.options.layoutDirection,
          'elk.edgeRouting': this.options.edgeRouting,

          // Node spacing
          'elk.spacing.nodeNode': spacingConfig.nodeNode,
          'elk.spacing.edgeNode': spacingConfig.edgeNode,

          // Edge spacing and separation
          'elk.spacing.edgeEdge': spacingConfig.edgeEdge,
          'elk.layered.spacing.edgeNodeBetweenLayers': spacingConfig.edgeNodeBetweenLayers,
          'elk.layered.spacing.nodeNodeBetweenLayers': spacingConfig.nodeNodeBetweenLayers,
          'elk.layered.edgeLabels.sideSelection': 'ALWAYS_DOWN',
          'elk.layered.edgeLabels.placement': 'CENTER',

          // Edge routing specific options
          'elk.layered.unnecessaryBendpoints': 'false',
          'elk.layered.edgeRouting.polylineSlanting': 'true',
          'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',

          // Force-directed specific
          'elk.force.model': 'FRUCHTERMAN_REINGOLD',
          'elk.force.iterations': '300',
          'elk.force.repulsivePower': '1',

          // Stress-based specific
          'elk.stress.dimension': '2D',
          'elk.stress.epsilon': '0.0001',

          // General quality settings
          'elk.separateConnectedComponents': 'false',
          'elk.interactiveLayout': 'false',
        },
        children: flow.nodes.map((node) => ({
          id: node.id,
          width: 140,
          height: 60,
          layoutOptions: {
            'elk.padding': '[top=10,left=10,bottom=10,right=10]',
          },
        })),
        edges: flow.edges.map((edge) => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
          layoutOptions: {
            'elk.edgeLabels.inline': 'true',
            'elk.layered.priority.direction': '0',
          },
        })),
      };

      console.log('🎯 Running ELK layout with algorithm:', this.options.layoutAlgorithm);
      const layoutedGraph = await this.elk.layout(elkGraph);

      // Apply positions back to nodes
      layoutedGraph.children.forEach((elkNode) => {
        const node = flow.nodes.find((n) => n.id === elkNode.id);
        if (node && elkNode.x !== undefined && elkNode.y !== undefined) {
          node.position = { x: elkNode.x, y: elkNode.y };
        }
      });

      console.log('✅ ELK layout applied successfully');
    } catch (error) {
      console.error('❌ ELK layout failed:', error);
    }
  }

  getSpacingConfig() {
    const base = {
      auto: {
        nodeNode: '80',
        edgeEdge: '15',
        edgeNode: '25',
        edgeNodeBetweenLayers: '35',
        nodeNodeBetweenLayers: '100',
      },
      tight: {
        nodeNode: '60',
        edgeEdge: '8',
        edgeNode: '15',
        edgeNodeBetweenLayers: '20',
        nodeNodeBetweenLayers: '80',
      },
      loose: {
        nodeNode: '120',
        edgeEdge: '25',
        edgeNode: '35',
        edgeNodeBetweenLayers: '50',
        nodeNodeBetweenLayers: '140',
      },
    };

    return base[this.options.edgeSpacing] || base.auto;
  }

  renderDiagram() {
    if (!this.g || !this.state.activeFlow || !this.state.flows[this.state.activeFlow]) {
      return;
    }

    // Clear existing content
    this.g.innerHTML = '';

    const flow = this.state.flows[this.state.activeFlow];

    console.log('🎨 Rendering flow:', {
      flowId: this.state.activeFlow,
      nodeCount: flow.nodes?.length || 0,
      edgeCount: flow.edges?.length || 0,
    });

    // Render edges first (behind nodes)
    if (flow.edges) {
      flow.edges.forEach((edge) => this.renderEdge(edge));
    }

    // Render nodes
    if (flow.nodes) {
      flow.nodes.forEach((node) => this.renderNode(node));
    }

    this.updateViewTransform();
  }

  renderNode(node) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'diagram-node');
    g.setAttribute('data-node-id', node.id);

    // Ensure position exists with defaults
    const position = node.position || { x: 0, y: 0 };
    g.setAttribute('transform', `translate(${position.x}, ${position.y})`);

    // Node shape
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', '140');
    rect.setAttribute('height', '60');
    rect.setAttribute('rx', '8');

    // Node styling based on type
    let fill = '#007acc';
    let stroke = '#005a9e';

    if (node.type === 'start') {
      fill = '#4ac776';
      stroke = '#0f4c25';
    } else if (node.type === 'end') {
      fill = '#f85c5c';
      stroke = '#c42e2e';
    } else if (node.type === 'rich_card') {
      fill = '#ff9500';
      stroke = '#cc7700';
    }

    rect.setAttribute('fill', fill);
    rect.setAttribute('stroke', stroke);
    rect.setAttribute('stroke-width', '2');

    // Node label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '70');
    text.setAttribute('y', '35');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.textContent = node.data?.label || node.id;

    g.appendChild(rect);
    g.appendChild(text);

    // Click handler
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectNode(node.id);
    });

    // Hover effects
    g.addEventListener('mouseenter', () => {
      rect.setAttribute('opacity', '0.8');
    });

    g.addEventListener('mouseleave', () => {
      rect.setAttribute('opacity', '1');
    });

    // Dragging functionality
    if (this.options.enableNodeDrag) {
      let isDragging = false;
      const dragStart = { x: 0, y: 0 };
      const nodeStart = { x: 0, y: 0 };

      g.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isDragging = true;
        this.state.isDragging = true;

        const rect = this.svg.getBoundingClientRect();
        dragStart.x = e.clientX - rect.left;
        dragStart.y = e.clientY - rect.top;
        nodeStart.x = node.position.x;
        nodeStart.y = node.position.y;

        this.svg.style.cursor = 'grabbing';
        g.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
      });

      const handleMouseMove = (e) => {
        if (!isDragging) return;

        const rect = this.svg.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        // Apply zoom and pan transformations
        const deltaX = (currentX - dragStart.x) / this.state.zoom;
        const deltaY = (currentY - dragStart.y) / this.state.zoom;

        node.position.x = nodeStart.x + deltaX;
        node.position.y = nodeStart.y + deltaY;

        // Update node position
        g.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);

        // Update connected edges
        this.updateConnectedEdges(node.id);
      };

      const handleMouseUp = () => {
        if (isDragging) {
          isDragging = false;
          this.state.isDragging = false;
          this.svg.style.cursor = 'default';
          g.style.filter = 'none';

          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        }
      };

      g.addEventListener('mousedown', () => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      });
    }

    this.g.appendChild(g);
  }

  renderEdge(edge) {
    const sourceNode = this.findNodeElement(edge.source);
    const targetNode = this.findNodeElement(edge.target);

    if (!sourceNode || !targetNode) return;

    // Ensure positions exist
    const sourcePos = sourceNode.position || { x: 0, y: 0 };
    const targetPos = targetNode.position || { x: 100, y: 100 };

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'diagram-edge');
    g.setAttribute('data-edge-id', edge.id);

    // Calculate connection points on borders
    const sourceBox = { x: sourcePos.x, y: sourcePos.y, width: 140, height: 60 };
    const targetBox = { x: targetPos.x, y: targetPos.y, width: 140, height: 60 };

    const connection = this.calculateBorderConnection(sourceBox, targetBox);

    // Get custom waypoints for this edge
    const waypoints = this.state.edgeWaypoints.get(edge.id) || [];

    // Create path based on routing type and waypoints
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let pathData;

    if (waypoints.length > 0) {
      // Use custom waypoint path
      pathData = this.createWaypointPath(connection.source, connection.target, waypoints);
    } else {
      // Use automatic routing
      switch (this.options.edgeRouting) {
        case 'ORTHOGONAL':
          pathData = this.createOrthogonalPath(connection.source, connection.target);
          break;
        case 'STRAIGHT':
          pathData = this.createStraightPath(connection.source, connection.target);
          break;
        case 'SPLINES':
        default:
          pathData = this.createOrganicPath(connection.source, connection.target);
          break;
      }
    }

    path.setAttribute('d', pathData);
    path.setAttribute('stroke', '#666');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#arrow)');
    path.setAttribute('class', 'edge-path');

    // Make edge clickable for waypoint editing
    path.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.state.waypointEditMode) {
        this.addWaypointToEdge(edge.id, e);
      } else {
        this.selectEdge(edge.id);
      }
    });

    // Add hover effect
    path.addEventListener('mouseenter', () => {
      if (this.state.waypointEditMode) {
        path.setAttribute('stroke', '#007acc');
        path.setAttribute('stroke-width', '3');
      }
    });

    path.addEventListener('mouseleave', () => {
      if (!this.state.selectedEdges.has(edge.id)) {
        path.setAttribute('stroke', '#666');
        path.setAttribute('stroke-width', '2');
      }
    });

    g.appendChild(path);

    // Render waypoint handles if in edit mode
    if (this.state.waypointEditMode && waypoints.length > 0) {
      waypoints.forEach((waypoint, index) => {
        const handle = this.createWaypointHandle(edge.id, index, waypoint);
        g.appendChild(handle);
      });
    }

    // Edge label
    if (edge.data?.label) {
      const midPoint = this.getPathMidpoint(connection.source, connection.target);

      const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const labelWidth = Math.max(40, edge.data.label.length * 8);
      labelBg.setAttribute('x', midPoint.x - labelWidth / 2);
      labelBg.setAttribute('y', midPoint.y - 8);
      labelBg.setAttribute('width', labelWidth);
      labelBg.setAttribute('height', '16');
      labelBg.setAttribute('fill', '#1e1e1e');
      labelBg.setAttribute('stroke', '#666');
      labelBg.setAttribute('rx', '3');

      const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelText.setAttribute('x', midPoint.x);
      labelText.setAttribute('y', midPoint.y);
      labelText.setAttribute('text-anchor', 'middle');
      labelText.setAttribute('dominant-baseline', 'central');
      labelText.setAttribute('fill', '#d4d4d4');
      labelText.setAttribute('font-size', '10');
      labelText.setAttribute('font-family', 'Arial, sans-serif');
      labelText.textContent = edge.data.label;

      g.appendChild(labelBg);
      g.appendChild(labelText);
    }

    this.g.appendChild(g);
  }

  calculateBorderConnection(sourceBox, targetBox) {
    const sourceCenterX = sourceBox.x + sourceBox.width / 2;
    const sourceCenterY = sourceBox.y + sourceBox.height / 2;
    const targetCenterX = targetBox.x + targetBox.width / 2;
    const targetCenterY = targetBox.y + targetBox.height / 2;

    const dx = targetCenterX - sourceCenterX;
    const dy = targetCenterY - sourceCenterY;

    // Calculate intersection with source box border
    let sourcePoint;
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal connection
      if (dx > 0) {
        sourcePoint = { x: sourceBox.x + sourceBox.width, y: sourceCenterY };
      } else {
        sourcePoint = { x: sourceBox.x, y: sourceCenterY };
      }
    } else {
      // Vertical connection
      if (dy > 0) {
        sourcePoint = { x: sourceCenterX, y: sourceBox.y + sourceBox.height };
      } else {
        sourcePoint = { x: sourceCenterX, y: sourceBox.y };
      }
    }

    // Calculate intersection with target box border
    let targetPoint;
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal connection
      if (dx > 0) {
        targetPoint = { x: targetBox.x, y: targetCenterY };
      } else {
        targetPoint = { x: targetBox.x + targetBox.width, y: targetCenterY };
      }
    } else {
      // Vertical connection
      if (dy > 0) {
        targetPoint = { x: targetCenterX, y: targetBox.y };
      } else {
        targetPoint = { x: targetCenterX, y: targetBox.y + targetBox.height };
      }
    }

    return { source: sourcePoint, target: targetPoint };
  }

  createOrganicPath(source, target) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Control points for smooth curve
    const controlDistance = Math.min(distance * 0.4, 100);

    let cp1, cp2;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal flow
      cp1 = { x: source.x + controlDistance, y: source.y };
      cp2 = { x: target.x - controlDistance, y: target.y };
    } else {
      // Vertical flow
      cp1 = { x: source.x, y: source.y + controlDistance };
      cp2 = { x: target.x, y: target.y - controlDistance };
    }

    return `M ${source.x} ${source.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${target.x} ${target.y}`;
  }

  createOrthogonalPath(source, target) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;

    // Create 90-degree angles
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal then vertical
      const midX = source.x + dx * 0.6;
      return `M ${source.x} ${source.y} L ${midX} ${source.y} L ${midX} ${target.y} L ${target.x} ${target.y}`;
    } else {
      // Vertical then horizontal
      const midY = source.y + dy * 0.6;
      return `M ${source.x} ${source.y} L ${source.x} ${midY} L ${target.x} ${midY} L ${target.x} ${target.y}`;
    }
  }

  createStraightPath(source, target) {
    return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
  }

  createWaypointPath(source, target, waypoints) {
    let path = `M ${source.x} ${source.y}`;

    // Connect through all waypoints
    waypoints.forEach((waypoint) => {
      path += ` L ${waypoint.x} ${waypoint.y}`;
    });

    // Connect to target
    path += ` L ${target.x} ${target.y}`;

    return path;
  }

  createWaypointHandle(edgeId, waypointIndex, waypoint) {
    const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    handle.setAttribute('cx', waypoint.x);
    handle.setAttribute('cy', waypoint.y);
    handle.setAttribute('r', '6');
    handle.setAttribute('fill', '#007acc');
    handle.setAttribute('stroke', '#ffffff');
    handle.setAttribute('stroke-width', '2');
    handle.setAttribute('class', 'waypoint-handle');
    handle.setAttribute('data-edge-id', edgeId);
    handle.setAttribute('data-waypoint-index', waypointIndex);
    handle.style.cursor = 'grab';

    // Handle dragging
    let isDragging = false;
    const dragStart = { x: 0, y: 0 };

    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDragging = true;
      this.state.draggingWaypoint = { edgeId, index: waypointIndex };

      const rect = this.svg.getBoundingClientRect();
      dragStart.x = e.clientX - rect.left;
      dragStart.y = e.clientY - rect.top;

      handle.style.cursor = 'grabbing';
      handle.setAttribute('fill', '#0056b3');
    });

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const rect = this.svg.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - this.state.pan.x) / this.state.zoom;
      const currentY = (e.clientY - rect.top - this.state.pan.y) / this.state.zoom;

      // Update waypoint position
      const waypoints = this.state.edgeWaypoints.get(edgeId) || [];
      if (waypoints[waypointIndex]) {
        waypoints[waypointIndex].x = currentX;
        waypoints[waypointIndex].y = currentY;
        this.state.edgeWaypoints.set(edgeId, waypoints);

        // Re-render the edge
        this.updateConnectedEdges(edgeId.split('-')[1]); // Extract source node from edge ID
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        this.state.draggingWaypoint = null;
        handle.style.cursor = 'grab';
        handle.setAttribute('fill', '#007acc');

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };

    handle.addEventListener('mousedown', () => {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });

    // Double-click to remove waypoint
    handle.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this.removeWaypoint(edgeId, waypointIndex);
    });

    return handle;
  }

  getPathMidpoint(source, target) {
    return {
      x: (source.x + target.x) / 2,
      y: (source.y + target.y) / 2,
    };
  }

  updateConnectedEdges(nodeId) {
    const flow = this.state.flows[this.state.activeFlow];
    if (!flow) return;

    // Find and update all edges connected to this node
    flow.edges.forEach((edge) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        const edgeElement = this.g.querySelector(`[data-edge-id="${edge.id}"]`);
        if (edgeElement) {
          // Remove old edge and re-render
          edgeElement.remove();
          this.renderEdge(edge);
        }
      }
    });
  }

  findNodeElement(nodeId) {
    if (!this.state.activeFlow || !this.state.flows[this.state.activeFlow]) return null;
    return this.state.flows[this.state.activeFlow].nodes?.find((n) => n.id === nodeId);
  }

  selectNode(nodeId) {
    this.state.selectedNodes.clear();
    this.state.selectedNodes.add(nodeId);
    this.updateSelections();

    if (this.onNodeSelected) {
      this.onNodeSelected(nodeId);
    }

    this.showNodeProperties(nodeId);
  }

  showNodeProperties(nodeId) {
    if (!this.elements.propertyContent) return;

    const node = this.findNodeElement(nodeId);
    if (!node) return;

    // Create property form
    const form = document.createElement('div');
    form.innerHTML = `
            <div class="property-field">
                <label>Label:</label>
                <input type="text" id="node-label" value="${node.data?.label || node.id}" />
            </div>
            <div class="property-field">
                <label>Type:</label>
                <select id="node-type">
                    <option value="message" ${node.type === 'message' ? 'selected' : ''}>Message</option>
                    <option value="rich_card" ${node.type === 'rich_card' ? 'selected' : ''}>Rich Card</option>
                    <option value="start" ${node.type === 'start' ? 'selected' : ''}>Start</option>
                    <option value="end" ${node.type === 'end' ? 'selected' : ''}>End</option>
                </select>
            </div>
        `;

    // Add styles
    form.querySelectorAll('.property-field').forEach((field) => {
      field.style.cssText = 'margin-bottom: 12px;';
    });

    form.querySelectorAll('label').forEach((label) => {
      label.style.cssText = `
                display: block;
                margin-bottom: 4px;
                font-size: 12px;
                color: #cccccc;
            `;
    });

    form.querySelectorAll('input, select').forEach((input) => {
      input.style.cssText = `
                width: 100%;
                padding: 6px 8px;
                border: 1px solid #444;
                border-radius: 3px;
                background: #1e1e1e;
                color: #d4d4d4;
                font-size: 12px;
            `;
    });

    this.elements.propertyContent.innerHTML = '';
    this.elements.propertyContent.appendChild(form);
    this.showPropertyPanel();
  }

  showPropertyPanel() {
    if (this.elements.propertyPanel) {
      this.elements.propertyPanel.style.transform = 'translateX(0)';
    }
  }

  hidePropertyPanel() {
    if (this.elements.propertyPanel) {
      this.elements.propertyPanel.style.transform = 'translateX(100%)';
    }
  }

  updateSelections() {
    // Update visual selection state
    const allNodes = this.g.querySelectorAll('.diagram-node');
    allNodes.forEach((node) => {
      const nodeId = node.getAttribute('data-node-id');
      if (this.state.selectedNodes.has(nodeId)) {
        node.querySelector('rect').setAttribute('stroke-width', '3');
        node.style.filter = 'drop-shadow(0 0 8px #007acc)';
      } else {
        node.querySelector('rect').setAttribute('stroke-width', '2');
        node.style.filter = 'none';
      }
    });
  }

  updateViewTransform() {
    if (this.g) {
      this.g.setAttribute(
        'transform',
        `translate(${this.state.pan.x}, ${this.state.pan.y}) scale(${this.state.zoom})`,
      );
    }
  }

  setZoom(newZoom) {
    this.state.zoom = Math.max(0.1, Math.min(3.0, newZoom));
    this.updateViewTransform();
  }

  setZoomAtPoint(newZoom, mouseX, mouseY) {
    const oldZoom = this.state.zoom;
    const boundedZoom = Math.max(0.1, Math.min(3.0, newZoom));

    if (boundedZoom === oldZoom) return; // No zoom change

    // Get the SVG container bounds
    const rect = this.svg.getBoundingClientRect();

    // Convert mouse position to SVG coordinates (before zoom)
    const svgX = (mouseX - rect.left - this.state.pan.x) / oldZoom;
    const svgY = (mouseY - rect.top - this.state.pan.y) / oldZoom;

    // Update zoom
    this.state.zoom = boundedZoom;

    // Calculate new pan to keep the mouse point stationary
    this.state.pan.x = mouseX - rect.left - svgX * boundedZoom;
    this.state.pan.y = mouseY - rect.top - svgY * boundedZoom;

    this.updateViewTransform();
  }

  deleteSelection() {
    // Implementation for deleting selected nodes/edges
    if (this.state.selectedNodes.size > 0) {
      console.log('Deleting nodes:', [...this.state.selectedNodes]);
      // TODO: Implement deletion
    }
  }

  finishConnection() {
    // Implementation for finishing edge connections
    this.state.draggedConnection = null;
  }

  zoomToFit() {
    // Implementation for zoom to fit
    this.setZoom(1);
    this.state.pan = { x: 0, y: 0 };
    this.updateViewTransform();
  }

  // Layout control methods
  setLayoutAlgorithm(algorithm) {
    if (this.layoutAlgorithms[algorithm]) {
      this.options.layoutAlgorithm = algorithm;
      console.log('🎯 Layout algorithm changed to:', algorithm);
      if (this.options.autoLayout) {
        this.applyAutoLayout().then(() => this.renderDiagram());
      }
    }
  }

  setLayoutDirection(direction) {
    if (this.layoutDirections[direction]) {
      this.options.layoutDirection = direction;
      console.log('🧭 Layout direction changed to:', direction);
      if (this.options.autoLayout) {
        this.applyAutoLayout().then(() => this.renderDiagram());
      }
    }
  }

  setEdgeRouting(routing) {
    if (this.edgeRoutingOptions[routing]) {
      this.options.edgeRouting = routing;
      console.log('🔗 Edge routing changed to:', routing);
      if (this.options.autoLayout) {
        this.applyAutoLayout().then(() => this.renderDiagram());
      } else {
        // Just re-render edges with new routing
        this.renderDiagram();
      }
    }
  }

  setEdgeSpacing(spacing) {
    if (this.edgeSpacingOptions[spacing]) {
      this.options.edgeSpacing = spacing;
      console.log('📏 Edge spacing changed to:', spacing);
      if (this.options.autoLayout) {
        this.applyAutoLayout().then(() => this.renderDiagram());
      }
    }
  }

  toggleAutoLayout() {
    this.options.autoLayout = !this.options.autoLayout;
    console.log('🔄 Auto layout:', this.options.autoLayout ? 'enabled' : 'disabled');
    if (this.options.autoLayout) {
      this.applyAutoLayout().then(() => this.renderDiagram());
    }
  }

  manualLayout() {
    this.options.autoLayout = false;
    console.log('✋ Switched to manual layout');
    // Reset to grid layout
    const flow = this.state.flows[this.state.activeFlow];
    if (flow && flow.nodes) {
      const spacing = 200;
      flow.nodes.forEach((node, i) => {
        node.position = {
          x: 50 + (i % 4) * spacing,
          y: 50 + Math.floor(i / 4) * spacing,
        };
      });
      this.renderDiagram();
    }
  }

  // Waypoint editing methods
  addWaypointToEdge(edgeId, event) {
    const rect = this.svg.getBoundingClientRect();
    const x = (event.clientX - rect.left - this.state.pan.x) / this.state.zoom;
    const y = (event.clientY - rect.top - this.state.pan.y) / this.state.zoom;

    const waypoints = this.state.edgeWaypoints.get(edgeId) || [];
    waypoints.push({ x, y });
    this.state.edgeWaypoints.set(edgeId, waypoints);

    // Re-render the edge
    const [sourceId, targetId] = edgeId.split('-');
    this.updateConnectedEdges(sourceId);

    console.log('🎯 Added waypoint to edge:', edgeId, 'at', { x, y });
  }

  removeWaypoint(edgeId, waypointIndex) {
    const waypoints = this.state.edgeWaypoints.get(edgeId) || [];
    if (waypointIndex >= 0 && waypointIndex < waypoints.length) {
      waypoints.splice(waypointIndex, 1);
      if (waypoints.length === 0) {
        this.state.edgeWaypoints.delete(edgeId);
      } else {
        this.state.edgeWaypoints.set(edgeId, waypoints);
      }

      // Re-render the edge
      const [sourceId, targetId] = edgeId.split('-');
      this.updateConnectedEdges(sourceId);

      console.log('🗑️ Removed waypoint from edge:', edgeId, 'at index:', waypointIndex);
    }
  }

  toggleWaypointEditMode() {
    this.state.waypointEditMode = !this.state.waypointEditMode;
    console.log('✏️ Waypoint edit mode:', this.state.waypointEditMode ? 'ON' : 'OFF');

    // Update UI to show edit mode
    const edges = this.g.querySelectorAll('.edge-path');
    edges.forEach((edge) => {
      if (this.state.waypointEditMode) {
        edge.style.cursor = 'crosshair';
        edge.style.strokeWidth = '4';
      } else {
        edge.style.cursor = 'default';
        edge.style.strokeWidth = '2';
      }
    });

    // Show/hide waypoint handles
    const waypoints = this.g.querySelectorAll('.waypoint-handle');
    waypoints.forEach((waypoint) => {
      waypoint.style.display = this.state.waypointEditMode ? 'block' : 'none';
    });

    // Update any UI elements that show edit mode
    if (this.onModelChanged) {
      this.onModelChanged({
        waypointEditMode: this.state.waypointEditMode,
      });
    }
  }

  selectEdge(edgeId) {
    this.state.selectedEdges.clear();
    this.state.selectedEdges.add(edgeId);
    this.state.editingEdge = edgeId;

    console.log('🎯 Selected edge:', edgeId);

    // Highlight the selected edge
    const edgeElement = this.g.querySelector(`[data-edge-id="${edgeId}"]`);
    if (edgeElement) {
      const path = edgeElement.querySelector('.edge-path');
      if (path) {
        path.style.stroke = '#ff6b6b';
        path.style.strokeWidth = '3';
      }
    }

    // Clear other selections
    this.state.selectedNodes.clear();
    this.hidePropertyPanel();

    if (this.onEdgeSelected) {
      this.onEdgeSelected(edgeId);
    }
  }

  dispose() {
    // Cleanup
    this.elements = {};
    this.svg = null;
    this.g = null;
    if (this.elk) {
      this.elk = null;
    }
  }
}
