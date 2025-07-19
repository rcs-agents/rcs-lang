// RCL Interactive Diagram - Enhanced Implementation
// Enhanced with proper SVG diagram, pan/zoom functionality, and improved interactions

(() => {
  // Get VS Code API
  const vscode = acquireVsCodeApi();

  // State management
  let currentState = {
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
  };

  // DOM elements
  let elements = {};
  let svg = null;
  let g = null; // Main group for transformations

  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Enhanced Interactive Diagram: DOMContentLoaded');

    initializeElements();
    setupEventListeners();
    setupMessageHandlers();
    initializeDiagram();

    // Notify extension that webview is ready
    vscode.postMessage({ type: 'ready' });
  });

  function initializeElements() {
    elements = {
      flowSelect: document.getElementById('flowSelect'),
      sprottyContainer: document.getElementById('sprotty-container'),
      propertiesContent: document.getElementById('propertiesContent'),
      connectBtn: document.getElementById('connectBtn'),
      deleteBtn: document.getElementById('deleteBtn'),
    };
  }

  function setupEventListeners() {
    elements.flowSelect?.addEventListener('change', (e) => {
      const flowId = e.target.value;
      if (flowId && flowId !== currentState.activeFlow) {
        setActiveFlow(flowId);
      }
    });

    elements.connectBtn?.addEventListener('click', () => {
      currentState.connectionMode = !currentState.connectionMode;
      elements.connectBtn.classList.toggle('active', currentState.connectionMode);
      svg?.classList.toggle('connection-mode', currentState.connectionMode);
    });

    elements.deleteBtn?.addEventListener('click', () => {
      deleteSelection();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelection();
      } else if (e.key === 'Escape') {
        currentState.connectionMode = false;
        elements.connectBtn?.classList.remove('active');
        svg?.classList.remove('connection-mode');
        finishConnection();
      }
    });
  }

  function setupMessageHandlers() {
    console.log('🔧 Enhanced Interactive Diagram: Setting up message handlers');

    window.addEventListener('message', (event) => {
      const message = event.data;

      console.log('📨 Enhanced Interactive Diagram: Received message:', {
        type: message.type,
        hasData: !!message.data,
        dataKeys: message.data ? Object.keys(message.data) : [],
      });

      switch (message.type) {
        case 'updateModel':
          handleModelUpdate(message.data);
          break;
        case 'setActiveFlow':
          setActiveFlow(message.data.flowId);
          break;
        case 'highlightNode':
          highlightNode(message.data.nodeId);
          break;
      }
    });
  }

  function initializeDiagram() {
    console.log('🎨 Enhanced Interactive Diagram: Initializing');

    // Remove loading message
    const loading = elements.sprottyContainer?.querySelector('.loading');
    if (loading) loading.remove();

    // Create SVG
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('style', 'background: var(--vscode-editor-background);');

    // Create defs for markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Arrow marker - smaller size
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
    polygon.setAttribute('fill', 'var(--vscode-editorWidget-border)');

    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Main transformation group
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'diagram-content');
    svg.appendChild(g);

    elements.sprottyContainer?.appendChild(svg);

    setupDiagramInteractions();

    console.log('✅ Enhanced Interactive Diagram: SVG created and appended');
  }

  function setupDiagramInteractions() {
    let isPanning = false;
    let startX = 0;
    let startY = 0;

    // Mouse down
    svg.addEventListener('mousedown', (e) => {
      // Check if clicking on empty space
      if (e.target === svg || e.target === g) {
        isPanning = true;
        startX = e.clientX - currentState.pan.x;
        startY = e.clientY - currentState.pan.y;
        svg.style.cursor = 'grabbing';

        // Clear selections
        currentState.selectedNodes.clear();
        currentState.selectedEdges.clear();
        updateSelection();
      }
    });

    // Mouse move
    svg.addEventListener('mousemove', (e) => {
      if (isPanning) {
        currentState.pan.x = e.clientX - startX;
        currentState.pan.y = e.clientY - startY;
        updateViewTransform();
      } else if (currentState.draggedNode) {
        handleNodeDrag(e);
      } else if (currentState.draggedConnection) {
        updateDraggedConnection(e);
      }
    });

    // Mouse up
    svg.addEventListener('mouseup', () => {
      isPanning = false;
      svg.style.cursor = currentState.connectionMode ? 'crosshair' : 'default';

      if (currentState.draggedNode) {
        currentState.draggedNode = null;
      }

      if (currentState.draggedConnection) {
        finishConnection();
      }
    });

    // Zoom functionality
    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      currentState.zoom = Math.max(0.1, Math.min(5, currentState.zoom * delta));
      updateViewTransform();
    });
  }

  function updateViewTransform() {
    g.setAttribute(
      'transform',
      `translate(${currentState.pan.x}, ${currentState.pan.y}) scale(${currentState.zoom})`,
    );
  }

  function handleNodeDrag(event) {
    if (!currentState.draggedNode) return;

    const rect = svg.getBoundingClientRect();
    const x = (event.clientX - rect.left - currentState.pan.x) / currentState.zoom;
    const y = (event.clientY - rect.top - currentState.pan.y) / currentState.zoom;

    // Update node position
    const node = currentState.draggedNode.node;
    node.position.x = x - currentState.draggedNode.offsetX;
    node.position.y = y - currentState.draggedNode.offsetY;

    // Update visual
    const nodeElement = currentState.draggedNode.element;
    nodeElement.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);

    // Update connected edges
    updateConnectedEdges(node.id);
  }

  function updateConnectedEdges(nodeId) {
    if (!currentState.activeFlow || !currentState.flows[currentState.activeFlow]) return;

    const flow = currentState.flows[currentState.activeFlow];
    const edges = flow.edges?.filter((e) => e.source === nodeId || e.target === nodeId) || [];

    for (const edge of edges) {
      const edgeElement = document.querySelector(`[data-edge-id="${edge.id}"]`);
      if (edgeElement) {
        const path = edgeElement.querySelector('path');
        const newPath = calculateEdgePath(edge, flow.nodes);
        path?.setAttribute('d', newPath);
      }
    }
  }

  function handleModelUpdate(data) {
    console.log('handleModelUpdate called with:', {
      flows: Object.keys(data.flows || {}),
      activeFlow: data.activeFlow,
      messages: Object.keys(data.messages || {}),
      agent: data.agent?.name,
    });

    currentState = { ...currentState, ...data };

    updateFlowSelect();

    if (currentState.activeFlow && currentState.flows[currentState.activeFlow]) {
      renderDiagram();
    }
  }

  function updateFlowSelect() {
    if (!elements.flowSelect) return;

    const flowIds = Object.keys(currentState.flows || {});

    // Clear existing options (except first)
    while (elements.flowSelect.children.length > 1) {
      elements.flowSelect.removeChild(elements.flowSelect.lastChild);
    }

    // Add flow options
    for (const flowId of flowIds) {
      const option = document.createElement('option');
      option.value = flowId;
      option.textContent = flowId;
      elements.flowSelect.appendChild(option);
    }

    // Set selected flow
    if (currentState.activeFlow && flowIds.includes(currentState.activeFlow)) {
      elements.flowSelect.value = currentState.activeFlow;
    } else if (flowIds.length > 0) {
      currentState.activeFlow = flowIds[0];
      elements.flowSelect.value = currentState.activeFlow;
    }
  }

  function renderDiagram() {
    console.log('renderDiagram called:', {
      activeFlow: currentState.activeFlow,
      flowExists: currentState.activeFlow && !!currentState.flows[currentState.activeFlow],
    });

    if (!currentState.activeFlow || !currentState.flows[currentState.activeFlow]) {
      return;
    }

    const flow = currentState.flows[currentState.activeFlow];

    console.log(
      `Rendering flow "${currentState.activeFlow}" with ${flow.nodes?.length || 0} nodes and ${flow.edges?.length || 0} edges`,
    );

    // Clear existing content
    g.innerHTML = '';

    // Create groups for layers
    const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgeGroup.setAttribute('class', 'edge-layer');
    g.appendChild(edgeGroup);

    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'node-layer');
    g.appendChild(nodeGroup);

    // Process nodes to find match constructs
    const processedNodes = processNodesForMatches(flow.nodes || [], flow);

    // Render edges first (so they appear behind nodes)
    if (flow.edges) {
      for (const edge of flow.edges) {
        const edgeElement = renderEdge(edge, processedNodes);
        if (edgeElement) {
          edgeGroup.appendChild(edgeElement);
        }
      }
    }

    // Render nodes
    if (processedNodes) {
      for (const node of processedNodes) {
        const nodeElement = renderNode(node);
        nodeGroup.appendChild(nodeElement);
        makeNodeDraggable(nodeElement, node);
      }
    }

    // Fit diagram to view
    fitDiagramToView();
  }

  function processNodesForMatches(nodes, flow) {
    const processedNodes = [];

    for (const node of nodes) {
      // Check if this node has a match construct
      const state = flow.states?.[node.id];
      if (state?.on && Object.keys(state.on).length > 1) {
        // This is a match node
        const matchNode = {
          ...node,
          type: 'match',
          matchOptions: Object.entries(state.on).map(([trigger, target]) => ({
            trigger,
            target: typeof target === 'string' ? target : target.target,
          })),
        };
        processedNodes.push(matchNode);
      } else {
        // Check if this is the initial state
        if (flow.initial === node.id && node.type !== 'start') {
          // Add a separate start node
          const startNode = {
            id: '__start__',
            type: 'start',
            position: {
              x: node.position.x - 150,
              y: node.position.y,
            },
            data: { label: 'Start' },
          };
          processedNodes.push(startNode);

          // Add edge from start to initial
          flow.edges = flow.edges || [];
          flow.edges.push({
            id: `__start__to__${node.id}`,
            source: '__start__',
            target: node.id,
            data: {},
          });
        }
        processedNodes.push(node);
      }
    }

    return processedNodes;
  }

  function renderNode(node) {
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'diagram-node');
    nodeGroup.setAttribute('data-node-id', node.id);
    nodeGroup.setAttribute('data-node-type', node.type);
    nodeGroup.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
    nodeGroup.style.cursor = 'move';

    let shape;
    let label;
    let width = 100;
    let height = 50;

    switch (node.type) {
      case 'start': {
        // Green circle for start node
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shape.setAttribute('cx', '15');
        shape.setAttribute('cy', '15');
        shape.setAttribute('r', '15');
        shape.setAttribute('fill', '#4ac776');
        shape.setAttribute('stroke', '#0f4c25');
        shape.setAttribute('stroke-width', '2');
        shape.setAttribute('class', 'drag-handle');
        width = 30;
        height = 30;
        break;
      }
      case 'match': {
        // Match construct as a container with sub-options
        const matchGroup = renderMatchNode(node);
        nodeGroup.appendChild(matchGroup);
        return nodeGroup;
      }
      case 'end': {
        // Red circle for end node
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shape.setAttribute('cx', '15');
        shape.setAttribute('cy', '15');
        shape.setAttribute('r', '15');
        shape.setAttribute('fill', '#ff4444');
        shape.setAttribute('stroke', '#cc0000');
        shape.setAttribute('stroke-width', '2');
        shape.setAttribute('class', 'drag-handle');
        width = 30;
        height = 30;
        break;
      }
      case 'rich_card': {
        // Star shape for rich card nodes
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const starPath = createStar(50, 25, 20, 10, 5);
        shape.setAttribute('d', starPath);
        shape.setAttribute('fill', '#ffd700');
        shape.setAttribute('stroke', '#b8860b');
        shape.setAttribute('stroke-width', '2');
        shape.setAttribute('class', 'drag-handle');
        break;
      }
      default: {
        // Rectangle for regular messages
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shape.setAttribute('x', '0');
        shape.setAttribute('y', '0');
        shape.setAttribute('width', width);
        shape.setAttribute('height', height);
        shape.setAttribute('rx', '5');
        shape.setAttribute('ry', '5');
        shape.setAttribute('fill', 'var(--vscode-button-background)');
        shape.setAttribute('stroke', 'var(--vscode-button-foreground)');
        shape.setAttribute('stroke-width', '2');
        shape.setAttribute('class', 'drag-handle');
        break;
      }
    }

    if (shape) {
      nodeGroup.appendChild(shape);
    }

    // Add label for non-start nodes
    if (node.type !== 'start') {
      label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', width / 2);
      label.setAttribute('y', height / 2);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', 'var(--vscode-editor-foreground)');
      label.setAttribute('font-size', '12');
      label.style.userSelect = 'none';
      label.style.pointerEvents = 'none';
      label.textContent = node.data?.label || node.id;
      nodeGroup.appendChild(label);
    }

    // Add connection ports
    if (node.type !== 'match') {
      const ports = createConnectionPorts(width, height);
      for (const port of ports) {
        nodeGroup.appendChild(port);
      }
    }

    // Store dimensions for edge calculations
    node.width = width;
    node.height = height;

    return nodeGroup;
  }

  function renderMatchNode(node) {
    const matchGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const options = node.matchOptions || [];
    const optionHeight = 25;
    const headerHeight = 30;
    const width = 150;
    const height = headerHeight + options.length * optionHeight + 10;

    // Container
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('rx', '8');
    rect.setAttribute('ry', '8');
    rect.setAttribute('fill', 'var(--vscode-sideBar-background)');
    rect.setAttribute('stroke', 'var(--vscode-focusBorder)');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('class', 'drag-handle');
    matchGroup.appendChild(rect);

    // Header
    const headerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    headerRect.setAttribute('x', '0');
    headerRect.setAttribute('y', '0');
    headerRect.setAttribute('width', width);
    headerRect.setAttribute('height', headerHeight);
    headerRect.setAttribute('rx', '8');
    headerRect.setAttribute('ry', '8');
    headerRect.setAttribute('fill', 'var(--vscode-button-background)');
    headerRect.setAttribute('class', 'drag-handle');
    matchGroup.appendChild(headerRect);

    // Header text
    const headerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    headerText.setAttribute('x', width / 2);
    headerText.setAttribute('y', headerHeight / 2);
    headerText.setAttribute('text-anchor', 'middle');
    headerText.setAttribute('dominant-baseline', 'middle');
    headerText.setAttribute('fill', 'var(--vscode-button-foreground)');
    headerText.setAttribute('font-size', '14');
    headerText.setAttribute('font-weight', 'bold');
    headerText.style.userSelect = 'none';
    headerText.style.pointerEvents = 'none';
    headerText.textContent = node.data?.label || 'Match';
    matchGroup.appendChild(headerText);

    // Options
    for (const [index, option] of options.entries()) {
      const y = headerHeight + index * optionHeight + 5;

      // Option rect
      const optionRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      optionRect.setAttribute('x', '5');
      optionRect.setAttribute('y', y);
      optionRect.setAttribute('width', width - 10);
      optionRect.setAttribute('height', optionHeight - 5);
      optionRect.setAttribute('rx', '3');
      optionRect.setAttribute('ry', '3');
      optionRect.setAttribute('fill', 'var(--vscode-input-background)');
      optionRect.setAttribute('class', 'match-option');
      optionRect.setAttribute('data-option-index', index);
      matchGroup.appendChild(optionRect);

      // Option text
      const optionText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      optionText.setAttribute('x', 10);
      optionText.setAttribute('y', y + optionHeight / 2 - 2.5);
      optionText.setAttribute('fill', 'var(--vscode-input-foreground)');
      optionText.setAttribute('font-size', '11');
      optionText.style.userSelect = 'none';
      optionText.style.pointerEvents = 'none';
      optionText.textContent = option.trigger;
      matchGroup.appendChild(optionText);
    }

    // Store dimensions
    node.width = width;
    node.height = height;

    return matchGroup;
  }

  function createConnectionPorts(width, height) {
    const ports = [];
    const positions = [
      { x: width / 2, y: 0, id: 'top' },
      { x: width, y: height / 2, id: 'right' },
      { x: width / 2, y: height, id: 'bottom' },
      { x: 0, y: height / 2, id: 'left' },
    ];

    for (const pos of positions) {
      const port = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      port.setAttribute('cx', pos.x);
      port.setAttribute('cy', pos.y);
      port.setAttribute('r', '4');
      port.setAttribute('fill', 'var(--vscode-editorWidget-border)');
      port.setAttribute('stroke', 'var(--vscode-focusBorder)');
      port.setAttribute('stroke-width', '1');
      port.setAttribute('class', 'connection-port');
      port.setAttribute('data-port', pos.id);
      port.style.opacity = '0';
      port.style.cursor = 'crosshair';
      port.style.transition = 'opacity 0.2s';

      ports.push(port);
    }

    return ports;
  }

  function renderEdge(edge, nodes) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) return null;

    const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgeGroup.setAttribute('class', 'diagram-edge');
    edgeGroup.setAttribute('data-edge-id', edge.id);

    // Create path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathData = calculateEdgePath(edge, nodes);
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'var(--vscode-editorWidget-border)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('marker-end', 'url(#arrow)');
    path.style.cursor = 'pointer';
    edgeGroup.appendChild(path);

    // Add label if exists
    if (edge.data?.trigger) {
      const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');

      // Calculate middle point
      const points = calculateEdgePoints(sourceNode, targetNode, edge);
      const midX = (points.x1 + points.x2) / 2;
      const midY = (points.y1 + points.y2) / 2;

      // Background for better readability
      labelBg.setAttribute('x', midX - 30);
      labelBg.setAttribute('y', midY - 10);
      labelBg.setAttribute('width', '60');
      labelBg.setAttribute('height', '20');
      labelBg.setAttribute('fill', 'var(--vscode-editor-background)');
      labelBg.setAttribute('opacity', '0.8');
      labelBg.setAttribute('rx', '3');
      edgeGroup.appendChild(labelBg);

      label.setAttribute('x', midX);
      label.setAttribute('y', midY);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', 'var(--vscode-descriptionForeground)');
      label.setAttribute('font-size', '11');
      label.style.userSelect = 'none';
      label.style.pointerEvents = 'none';
      label.textContent = edge.data.trigger;
      edgeGroup.appendChild(label);
    }

    return edgeGroup;
  }

  function calculateEdgePath(edge, nodes) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) return '';

    const points = calculateEdgePoints(sourceNode, targetNode, edge);

    // Create smooth curve
    const dx = points.x2 - points.x1;
    const cx1 = points.x1 + dx * 0.3;
    const cy1 = points.y1;
    const cx2 = points.x2 - dx * 0.3;
    const cy2 = points.y2;

    return `M ${points.x1} ${points.y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${points.x2} ${points.y2}`;
  }

  function calculateEdgePoints(source, target, edge) {
    // Get node centers
    const sx = source.position.x + (source.width || 100) / 2;
    const sy = source.position.y + (source.height || 50) / 2;
    const tx = target.position.x + (target.width || 100) / 2;
    const ty = target.position.y + (target.height || 50) / 2;

    // Calculate intersection points with node borders
    const sourcePoint = getIntersectionPoint(sx, sy, tx, ty, source);
    const targetPoint = getIntersectionPoint(tx, ty, sx, sy, target);

    return {
      x1: sourcePoint.x,
      y1: sourcePoint.y,
      x2: targetPoint.x,
      y2: targetPoint.y,
    };
  }

  function getIntersectionPoint(fromX, fromY, toX, toY, node) {
    const width = node.width || 100;
    const height = node.height || 50;
    const nodeX = node.position.x;
    const nodeY = node.position.y;

    // For circular nodes
    if (node.type === 'start') {
      const radius = 15;
      const cx = nodeX + radius;
      const cy = nodeY + radius;
      const angle = Math.atan2(toY - cy, toX - cx);
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    }

    // For rectangular nodes
    const centerX = nodeX + width / 2;
    const centerY = nodeY + height / 2;

    // Calculate angle from center to target
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Find intersection with rectangle border
    const cos = Math.abs(Math.cos(angle));
    const sin = Math.abs(Math.sin(angle));

    let intersectX;
    let intersectY;

    if (width * sin <= height * cos) {
      // Intersects with left or right edge
      intersectX = toX > fromX ? nodeX + width : nodeX;
      intersectY = centerY + (width / 2) * Math.tan(angle) * (toX > fromX ? 1 : -1);
    } else {
      // Intersects with top or bottom edge
      intersectX = centerX + (height / 2 / Math.tan(angle)) * (toY > fromY ? 1 : -1);
      intersectY = toY > fromY ? nodeY + height : nodeY;
    }

    return { x: intersectX, y: intersectY };
  }

  function createStar(cx, cy, outerRadius, innerRadius, points) {
    let path = '';
    const angle = Math.PI / points;

    for (let i = 0; i < 2 * points; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + radius * Math.cos(i * angle - Math.PI / 2);
      const y = cy + radius * Math.sin(i * angle - Math.PI / 2);
      path += (i === 0 ? 'M' : 'L') + x + ',' + y;
    }

    return path + 'Z';
  }

  function makeNodeDraggable(nodeElement, node) {
    const handle = nodeElement.querySelector('.drag-handle') || nodeElement;

    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation();

      if (currentState.connectionMode) {
        handleConnectionClick(node.id, e);
        return;
      }

      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left - currentState.pan.x) / currentState.zoom;
      const y = (e.clientY - rect.top - currentState.pan.y) / currentState.zoom;

      currentState.draggedNode = {
        node: node,
        element: nodeElement,
        offsetX: x - node.position.x,
        offsetY: y - node.position.y,
      };

      // Select the node
      selectNode(node.id);
    });

    // Make text non-selectable
    const texts = nodeElement.querySelectorAll('text');
    for (const text of texts) {
      text.style.userSelect = 'none';
      text.style.pointerEvents = 'none';
    }
  }

  function selectNode(nodeId) {
    currentState.selectedNodes.clear();
    currentState.selectedNodes.add(nodeId);
    updateSelection();
    showNodeProperties(nodeId);
  }

  function updateSelection() {
    // Update node selections
    for (const node of document.querySelectorAll('.diagram-node')) {
      const nodeId = node.getAttribute('data-node-id');
      node.classList.toggle('selected', currentState.selectedNodes.has(nodeId));
    }

    // Update edge selections
    for (const edge of document.querySelectorAll('.diagram-edge')) {
      const edgeId = edge.getAttribute('data-edge-id');
      edge.classList.toggle('selected', currentState.selectedEdges.has(edgeId));
    }
  }

  function showNodeProperties(nodeId) {
    const flow = currentState.flows[currentState.activeFlow];
    const node = flow?.nodes?.find((n) => n.id === nodeId);
    const message = currentState.messages[nodeId];

    if (!node || !elements.propertiesContent) return;

    currentState.selectedMessage = nodeId;

    let html = `<h4>${node.data?.label || nodeId}</h4>`;

    if (message?.contentMessage) {
      html += `
                <div class="form-group">
                    <label for="messageText">Message Text</label>
                    <textarea id="messageText" rows="3">${message.contentMessage.text || ''}</textarea>
                </div>
            `;

      if (message.contentMessage.suggestions?.length > 0) {
        html += `
                    <div class="form-group">
                        <label>Suggestions</label>
                        <div class="suggestions-list">
                `;

        for (const [i, sug] of message.contentMessage.suggestions.entries()) {
          const text = sug.reply?.text || sug.action?.text || '';
          html += `
                        <div class="suggestion-item">
                            <input type="text" value="${text}" data-suggestion-index="${i}">
                        </div>
                    `;
        }

        html += '</div></div>';
      }

      html += '<button onclick="saveMessageProperties()">Save Changes</button>';
    } else {
      html += '<p>No message data available</p>';
    }

    elements.propertiesContent.innerHTML = html;
  }

  function handleConnectionClick(nodeId, event) {
    if (!currentState.draggedConnection) {
      // Start new connection
      const port = event.target.closest('.connection-port');

      currentState.draggedConnection = {
        source: nodeId,
        sourcePort: port?.getAttribute('data-port'),
        tempLine: null,
      };

      // Create temporary line
      const tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tempLine.setAttribute('class', 'temp-connection');
      tempLine.setAttribute('stroke', 'var(--vscode-textLink-foreground)');
      tempLine.setAttribute('stroke-width', '2');
      tempLine.setAttribute('stroke-dasharray', '5,5');

      g.appendChild(tempLine);

      currentState.draggedConnection.tempLine = tempLine;
    } else if (currentState.draggedConnection.source !== nodeId) {
      // Complete connection
      vscode.postMessage({
        type: 'edgeCreated',
        data: {
          edge: {
            id: `${currentState.draggedConnection.source}-to-${nodeId}`,
            source: currentState.draggedConnection.source,
            target: nodeId,
            data: {},
          },
        },
      });

      finishConnection();
    }
  }

  function updateDraggedConnection(event) {
    if (!currentState.draggedConnection?.tempLine) return;

    const rect = svg.getBoundingClientRect();
    const x = (event.clientX - rect.left - currentState.pan.x) / currentState.zoom;
    const y = (event.clientY - rect.top - currentState.pan.y) / currentState.zoom;

    const sourceNode = document.querySelector(
      `[data-node-id="${currentState.draggedConnection.source}"]`,
    );
    if (sourceNode) {
      const transform = sourceNode.getAttribute('transform');
      const match = transform?.match(/translate\(([^,]+),([^)]+)\)/);
      if (match) {
        const sx = Number.parseFloat(match[1]) + 50;
        const sy = Number.parseFloat(match[2]) + 25;

        currentState.draggedConnection.tempLine.setAttribute('x1', sx);
        currentState.draggedConnection.tempLine.setAttribute('y1', sy);
        currentState.draggedConnection.tempLine.setAttribute('x2', x);
        currentState.draggedConnection.tempLine.setAttribute('y2', y);
      }
    }
  }

  function finishConnection() {
    if (currentState.draggedConnection?.tempLine) {
      currentState.draggedConnection.tempLine.remove();
    }
    currentState.draggedConnection = null;
  }

  function deleteSelection() {
    for (const nodeId of currentState.selectedNodes) {
      vscode.postMessage({
        type: 'nodeDeleted',
        data: { nodeId },
      });
    }

    for (const edgeId of currentState.selectedEdges) {
      vscode.postMessage({
        type: 'edgeDeleted',
        data: { edgeId },
      });
    }

    currentState.selectedNodes.clear();
    currentState.selectedEdges.clear();
  }

  function setActiveFlow(flowId) {
    currentState.activeFlow = flowId;
    if (elements.flowSelect) {
      elements.flowSelect.value = flowId;
    }
    renderDiagram();
  }

  function highlightNode(nodeId) {
    // Remove previous highlights
    for (const el of document.querySelectorAll('.highlighted')) {
      el.classList.remove('highlighted');
    }

    // Add highlight to node
    const node = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (node) {
      node.classList.add('highlighted');

      // Scroll into view if needed
      const bbox = node.getBBox();
      const transform = node.getAttribute('transform');
      const match = transform?.match(/translate\(([^,]+),([^)]+)\)/);
      if (match) {
        const x = Number.parseFloat(match[1]);
        const y = Number.parseFloat(match[2]);
        centerViewOn(x + bbox.width / 2, y + bbox.height / 2);
      }
    }
  }

  function centerViewOn(x, y) {
    const rect = svg.getBoundingClientRect();
    currentState.pan.x = rect.width / 2 - x * currentState.zoom;
    currentState.pan.y = rect.height / 2 - y * currentState.zoom;
    updateViewTransform();
  }

  function fitDiagramToView() {
    // Get bounding box of all content
    const bbox = g.getBBox();
    if (bbox.width === 0 || bbox.height === 0) return;

    const rect = svg.getBoundingClientRect();
    const padding = 50;

    // Calculate scale to fit
    const scaleX = (rect.width - 2 * padding) / bbox.width;
    const scaleY = (rect.height - 2 * padding) / bbox.height;
    currentState.zoom = Math.min(scaleX, scaleY, 1);

    // Center the content
    currentState.pan.x =
      (rect.width - bbox.width * currentState.zoom) / 2 - bbox.x * currentState.zoom;
    currentState.pan.y =
      (rect.height - bbox.height * currentState.zoom) / 2 - bbox.y * currentState.zoom;

    updateViewTransform();
  }

  // Global function for message property saving
  window.saveMessageProperties = () => {
    if (!currentState.selectedMessage) return;

    const messageText = document.getElementById('messageText')?.value;
    const message = currentState.messages[currentState.selectedMessage];

    if (message?.contentMessage && messageText !== undefined) {
      message.contentMessage.text = messageText;

      // Update suggestions
      const suggestionInputs = document.querySelectorAll('[data-suggestion-index]');
      for (const input of suggestionInputs) {
        const index = Number.parseInt(input.getAttribute('data-suggestion-index'));
        const suggestion = message.contentMessage.suggestions[index];
        if (suggestion) {
          if (suggestion.reply) {
            suggestion.reply.text = input.value;
          } else if (suggestion.action) {
            suggestion.action.text = input.value;
          }
        }
      }

      // Notify extension
      vscode.postMessage({
        type: 'nodeUpdated',
        data: {
          node: {
            id: currentState.selectedMessage,
            data: {
              label: messageText.substring(0, 30) + (messageText.length > 30 ? '...' : ''),
            },
          },
        },
      });

      // Update diagram
      renderDiagram();
    }
  };
})();
