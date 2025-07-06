// RCL Interactive Diagram JavaScript
// This will be enhanced with Sprotty integration in the next iteration

(function() {
    'use strict';

    // Get VS Code API
    const vscode = acquireVsCodeApi();
    
    // State management
    let currentState = {
        flows: {},
        activeFlow: null,
        messages: {},
        agent: {},
        selectedNodes: [],
        selectedEdges: [],
        editMode: 'select' // 'select', 'add-node', 'connect'
    };

    // DOM elements
    let elements = {};

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeElements();
        setupEventListeners();
        setupMessageHandlers();
        setupDragAndDrop();
        
        // Initialize basic diagram (will be replaced with Sprotty)
        initializeBasicDiagram();
        
        // Notify extension that webview is ready
        vscode.postMessage({ type: 'ready' });
    });

    function initializeElements() {
        elements = {
            // Toolbar
            saveBtn: document.getElementById('saveBtn'),
            undoBtn: document.getElementById('undoBtn'),
            redoBtn: document.getElementById('redoBtn'),
            flowSelect: document.getElementById('flowSelect'),
            addNodeBtn: document.getElementById('addNodeBtn'),
            connectBtn: document.getElementById('connectBtn'),
            deleteBtn: document.getElementById('deleteBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            
            // Sidebar
            propertiesContent: document.getElementById('propertiesContent'),
            
            // Diagram
            sprottyContainer: document.getElementById('sprotty-container')
        };
    }

    function setupEventListeners() {
        // Toolbar buttons
        elements.saveBtn.addEventListener('click', () => {
            saveChanges();
        });

        elements.undoBtn.addEventListener('click', () => {
            // TODO: Implement undo
            console.log('Undo functionality to be implemented');
        });

        elements.redoBtn.addEventListener('click', () => {
            // TODO: Implement redo
            console.log('Redo functionality to be implemented');
        });

        elements.flowSelect.addEventListener('change', (e) => {
            const flowId = e.target.value;
            setActiveFlow(flowId);
        });

        elements.addNodeBtn.addEventListener('click', () => {
            toggleEditMode('add-node');
        });

        elements.connectBtn.addEventListener('click', () => {
            toggleEditMode('connect');
        });

        elements.deleteBtn.addEventListener('click', () => {
            deleteSelection();
        });

        elements.settingsBtn.addEventListener('click', () => {
            // TODO: Implement settings
            console.log('Settings functionality to be implemented');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                deleteSelection();
            } else if (e.key === 'Escape') {
                clearSelection();
                setEditMode('select');
            } else if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    saveChanges();
                } else if (e.key === 'z') {
                    e.preventDefault();
                    // TODO: Implement undo
                } else if (e.key === 'y') {
                    e.preventDefault();
                    // TODO: Implement redo
                }
            }
        });
    }

    function setupMessageHandlers() {
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'updateModel':
                    handleModelUpdate(message.data);
                    break;
                case 'setActiveFlow':
                    setActiveFlow(message.data.flowId);
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        });
    }

    function setupDragAndDrop() {
        const paletteItems = document.querySelectorAll('.palette-item');
        
        paletteItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const nodeType = item.dataset.type;
                e.dataTransfer.setData('application/json', JSON.stringify({ type: 'node', nodeType }));
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
            });
            
            // Make items draggable
            item.draggable = true;
        });

        // Set up drop zone
        elements.sprottyContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.sprottyContainer.classList.add('drop-zone');
        });

        elements.sprottyContainer.addEventListener('dragleave', (e) => {
            if (!elements.sprottyContainer.contains(e.relatedTarget)) {
                elements.sprottyContainer.classList.remove('drop-zone');
            }
        });

        elements.sprottyContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.sprottyContainer.classList.remove('drop-zone');
            
            try {
                const data = JSON.parse(e.dataTransfer.getData('application/json'));
                if (data.type === 'node') {
                    createNodeAtPosition(data.nodeType, e.offsetX, e.offsetY);
                }
            } catch (error) {
                console.error('Error handling drop:', error);
            }
        });
    }

    function initializeBasicDiagram() {
        // Basic SVG-based diagram implementation
        // This will be replaced with Sprotty in the next iteration
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.background = 'var(--vscode-background)';
        
        // Add arrow marker definition
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrow');
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('markerWidth', '6');
        marker.setAttribute('markerHeight', '6');
        marker.setAttribute('orient', 'auto');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        path.setAttribute('fill', '#666');
        
        marker.appendChild(path);
        defs.appendChild(marker);
        svg.appendChild(defs);
        
        // Clear container and add SVG
        elements.sprottyContainer.innerHTML = '';
        elements.sprottyContainer.appendChild(svg);
        
        currentState.svg = svg;
    }

    function handleModelUpdate(data) {
        currentState = { ...currentState, ...data };
        
        updateFlowSelect();
        renderDiagram();
        updatePropertiesPanel();
    }

    function updateFlowSelect() {
        const flowIds = Object.keys(currentState.flows || {});
        
        // Clear existing options (except first)
        while (elements.flowSelect.children.length > 1) {
            elements.flowSelect.removeChild(elements.flowSelect.lastChild);
        }
        
        // Add flow options
        flowIds.forEach(flowId => {
            const option = document.createElement('option');
            option.value = flowId;
            option.textContent = flowId;
            elements.flowSelect.appendChild(option);
        });
        
        // Set selected flow
        if (currentState.activeFlow && flowIds.includes(currentState.activeFlow)) {
            elements.flowSelect.value = currentState.activeFlow;
        } else if (flowIds.length > 0) {
            currentState.activeFlow = flowIds[0];
            elements.flowSelect.value = currentState.activeFlow;
        }
    }

    function renderDiagram() {
        if (!currentState.svg || !currentState.activeFlow || !currentState.flows[currentState.activeFlow]) {
            return;
        }

        const flow = currentState.flows[currentState.activeFlow];
        const svg = currentState.svg;
        
        // Clear existing content (except defs)
        const defs = svg.querySelector('defs');
        svg.innerHTML = '';
        if (defs) {
            svg.appendChild(defs);
        }

        // Render nodes
        flow.nodes.forEach(node => {
            renderNode(svg, node);
        });

        // Render edges
        flow.edges.forEach(edge => {
            renderEdge(svg, edge, flow.nodes);
        });
    }

    function renderNode(svg, node) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'diagram-node');
        g.setAttribute('data-node-id', node.id);
        g.setAttribute('transform', `translate(${node.position.x}, ${node.position.y})`);
        
        // Node shape based on type
        let shape;
        let width = 120;
        let height = 40;
        
        if (node.type === 'start' || node.type === 'end') {
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            shape.setAttribute('cx', width / 2);
            shape.setAttribute('cy', height / 2);
            shape.setAttribute('rx', width / 2);
            shape.setAttribute('ry', height / 2);
        } else {
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shape.setAttribute('width', width);
            shape.setAttribute('height', height);
            shape.setAttribute('rx', 8);
            shape.setAttribute('ry', 8);
        }
        
        // Apply styles based on node type
        let fillColor = '#2196F3';
        if (node.type === 'start') fillColor = '#4CAF50';
        else if (node.type === 'end') fillColor = '#f44336';
        else if (node.type === 'rich_card') fillColor = '#FF9800';
        
        shape.setAttribute('fill', fillColor);
        shape.setAttribute('stroke', '#333');
        shape.setAttribute('stroke-width', '2');
        shape.style.cursor = 'pointer';
        
        // Node label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', width / 2);
        text.setAttribute('y', height / 2);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-family', 'var(--vscode-font-family)');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', '500');
        text.style.pointerEvents = 'none';
        text.textContent = node.data?.label || node.id;
        
        g.appendChild(shape);
        g.appendChild(text);
        
        // Add event listeners
        g.addEventListener('click', (e) => {
            e.stopPropagation();
            selectNode(node.id);
        });
        
        g.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button
                startNodeDrag(node.id, e);
            }
        });
        
        g.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            editNodeProperties(node.id);
        });
        
        svg.appendChild(g);
    }

    function renderEdge(svg, edge, nodes) {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) {
            return;
        }
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'diagram-edge');
        line.setAttribute('data-edge-id', edge.id);
        line.setAttribute('x1', sourceNode.position.x + 60); // Center of source node
        line.setAttribute('y1', sourceNode.position.y + 20);
        line.setAttribute('x2', targetNode.position.x + 60); // Center of target node
        line.setAttribute('y2', targetNode.position.y + 20);
        line.setAttribute('stroke', '#666');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', 'url(#arrow)');
        line.style.cursor = 'pointer';
        
        line.addEventListener('click', (e) => {
            e.stopPropagation();
            selectEdge(edge.id);
        });
        
        svg.appendChild(line);
    }

    function createNodeAtPosition(nodeType, x, y) {
        if (!currentState.activeFlow) {
            return;
        }
        
        const nodeId = `${nodeType}_${Date.now()}`;
        const newNode = {
            id: nodeId,
            type: nodeType,
            position: { x: x - 60, y: y - 20 }, // Center the node on the cursor
            data: {
                label: nodeId,
                messageData: nodeType === 'message' ? { text: 'New message' } : null
            }
        };
        
        // Add node to current flow
        if (!currentState.flows[currentState.activeFlow]) {
            currentState.flows[currentState.activeFlow] = { id: currentState.activeFlow, nodes: [], edges: [] };
        }
        
        currentState.flows[currentState.activeFlow].nodes.push(newNode);
        
        // Notify extension
        vscode.postMessage({
            type: 'nodeCreated',
            data: { flowId: currentState.activeFlow, node: newNode }
        });
        
        renderDiagram();
    }

    function selectNode(nodeId) {
        currentState.selectedNodes = [nodeId];
        currentState.selectedEdges = [];
        
        // Update visual selection
        updateSelection();
        updatePropertiesPanel();
    }

    function selectEdge(edgeId) {
        currentState.selectedEdges = [edgeId];
        currentState.selectedNodes = [];
        
        // Update visual selection
        updateSelection();
        updatePropertiesPanel();
    }

    function updateSelection() {
        // Clear previous selection
        document.querySelectorAll('.diagram-node, .diagram-edge').forEach(element => {
            element.classList.remove('selected');
        });
        
        // Apply new selection
        currentState.selectedNodes.forEach(nodeId => {
            const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
            if (nodeElement) {
                nodeElement.classList.add('selected');
                nodeElement.querySelector('rect, ellipse').setAttribute('stroke', '#FFC107');
                nodeElement.querySelector('rect, ellipse').setAttribute('stroke-width', '3');
            }
        });
        
        currentState.selectedEdges.forEach(edgeId => {
            const edgeElement = document.querySelector(`[data-edge-id="${edgeId}"]`);
            if (edgeElement) {
                edgeElement.classList.add('selected');
                edgeElement.setAttribute('stroke', '#FFC107');
                edgeElement.setAttribute('stroke-width', '3');
            }
        });
    }

    function updatePropertiesPanel() {
        let content = '<p>Select a node to edit properties</p>';
        
        if (currentState.selectedNodes.length === 1) {
            const nodeId = currentState.selectedNodes[0];
            const flow = currentState.flows[currentState.activeFlow];
            const node = flow?.nodes.find(n => n.id === nodeId);
            
            if (node) {
                content = `
                    <div class="property-group">
                        <label class="property-label">Node ID:</label>
                        <input type="text" class="property-input" value="${node.id}" data-property="id">
                    </div>
                    <div class="property-group">
                        <label class="property-label">Type:</label>
                        <select class="property-input" data-property="type">
                            <option value="start" ${node.type === 'start' ? 'selected' : ''}>Start</option>
                            <option value="message" ${node.type === 'message' ? 'selected' : ''}>Message</option>
                            <option value="rich_card" ${node.type === 'rich_card' ? 'selected' : ''}>Rich Card</option>
                            <option value="end" ${node.type === 'end' ? 'selected' : ''}>End</option>
                        </select>
                    </div>
                `;
                
                if (node.type === 'message' || node.type === 'rich_card') {
                    content += `
                        <div class="property-group">
                            <label class="property-label">Message Text:</label>
                            <textarea class="property-input" rows="3" data-property="text">${node.data?.messageData?.text || ''}</textarea>
                        </div>
                    `;
                }
                
                content += `
                    <div class="property-group">
                        <button class="property-button" onclick="applyNodeProperties('${nodeId}')">Apply Changes</button>
                        <button class="property-button" onclick="deleteNode('${nodeId}')">Delete Node</button>
                    </div>
                `;
            }
        }
        
        elements.propertiesContent.innerHTML = content;
        
        // Add event listeners to property inputs
        elements.propertiesContent.querySelectorAll('.property-input').forEach(input => {
            input.addEventListener('change', () => {
                // Auto-apply changes on change
                if (currentState.selectedNodes.length === 1) {
                    window.applyNodeProperties(currentState.selectedNodes[0]);
                }
            });
        });
    }

    function setActiveFlow(flowId) {
        currentState.activeFlow = flowId;
        elements.flowSelect.value = flowId;
        clearSelection();
        renderDiagram();
        updatePropertiesPanel();
    }

    function toggleEditMode(mode) {
        if (currentState.editMode === mode) {
            currentState.editMode = 'select';
        } else {
            currentState.editMode = mode;
        }
        
        updateToolbarState();
    }

    function setEditMode(mode) {
        currentState.editMode = mode;
        updateToolbarState();
    }

    function updateToolbarState() {
        // Update toolbar button states
        elements.addNodeBtn.classList.toggle('active', currentState.editMode === 'add-node');
        elements.connectBtn.classList.toggle('active', currentState.editMode === 'connect');
        
        // Update cursor style
        elements.sprottyContainer.style.cursor = currentState.editMode === 'add-node' ? 'crosshair' : 'default';
    }

    function clearSelection() {
        currentState.selectedNodes = [];
        currentState.selectedEdges = [];
        updateSelection();
        updatePropertiesPanel();
    }

    function deleteSelection() {
        if (currentState.selectedNodes.length > 0 || currentState.selectedEdges.length > 0) {
            currentState.selectedNodes.forEach(nodeId => {
                deleteNode(nodeId);
            });
            
            currentState.selectedEdges.forEach(edgeId => {
                deleteEdge(edgeId);
            });
            
            clearSelection();
        }
    }

    function deleteNode(nodeId) {
        if (!currentState.activeFlow || !currentState.flows[currentState.activeFlow]) {
            return;
        }
        
        const flow = currentState.flows[currentState.activeFlow];
        
        // Remove node
        flow.nodes = flow.nodes.filter(node => node.id !== nodeId);
        
        // Remove connected edges
        flow.edges = flow.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);
        
        // Notify extension
        vscode.postMessage({
            type: 'nodeDeleted',
            data: { flowId: currentState.activeFlow, nodeId }
        });
        
        renderDiagram();
        clearSelection();
    }

    function deleteEdge(edgeId) {
        if (!currentState.activeFlow || !currentState.flows[currentState.activeFlow]) {
            return;
        }
        
        const flow = currentState.flows[currentState.activeFlow];
        flow.edges = flow.edges.filter(edge => edge.id !== edgeId);
        
        // Notify extension
        vscode.postMessage({
            type: 'edgeDeleted',
            data: { flowId: currentState.activeFlow, edgeId }
        });
        
        renderDiagram();
        clearSelection();
    }

    function saveChanges() {
        vscode.postMessage({
            type: 'modelChanged',
            data: {
                flows: currentState.flows,
                activeFlow: currentState.activeFlow
            }
        });
    }

    function editNodeProperties(nodeId) {
        selectNode(nodeId);
        // Properties panel is automatically updated in selectNode
    }

    function startNodeDrag(nodeId, event) {
        // Basic node dragging implementation
        const node = currentState.flows[currentState.activeFlow]?.nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        const startX = event.clientX - node.position.x;
        const startY = event.clientY - node.position.y;
        
        function onMouseMove(e) {
            node.position.x = e.clientX - startX;
            node.position.y = e.clientY - startY;
            renderDiagram();
        }
        
        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // Notify extension of position change
            vscode.postMessage({
                type: 'nodeUpdated',
                data: { flowId: currentState.activeFlow, node }
            });
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // Global functions for property panel
    window.applyNodeProperties = function(nodeId) {
        const flow = currentState.flows[currentState.activeFlow];
        const node = flow?.nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        // Get property values from inputs
        const inputs = elements.propertiesContent.querySelectorAll('.property-input');
        inputs.forEach(input => {
            const property = input.dataset.property;
            const value = input.value;
            
            if (property === 'id') {
                node.id = value;
            } else if (property === 'type') {
                node.type = value;
            } else if (property === 'text') {
                if (!node.data) node.data = {};
                if (!node.data.messageData) node.data.messageData = {};
                node.data.messageData.text = value;
            }
        });
        
        // Notify extension
        vscode.postMessage({
            type: 'nodeUpdated',
            data: { flowId: currentState.activeFlow, node }
        });
        
        renderDiagram();
    };

    window.deleteNode = deleteNode;

    // Expose global functions for debugging
    window.rclInteractiveDiagram = {
        getCurrentState: () => currentState,
        setActiveFlow: setActiveFlow,
        clearSelection: clearSelection,
        saveChanges: saveChanges
    };
})();