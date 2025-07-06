// RCL Preview Webview JavaScript
(function() {
    'use strict';

    // Get VS Code API
    const vscode = acquireVsCodeApi();
    
    // State management
    let currentState = {
        messages: {},
        flows: {},
        agent: {},
        selectedFlow: null,
        compilationErrors: null,
        cursorFollowingEnabled: false
    };

    // DOM elements
    let elements = {};
    
    // Mermaid initialization
    let mermaidInitialized = false;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeElements();
        setupEventListeners();
        setupMessageHandlers();
        initializeMermaid();
        
        // Notify extension that webview is ready
        vscode.postMessage({ type: 'ready' });
    });

    function initializeElements() {
        elements = {
            // Toolbar
            refreshBtn: document.getElementById('refreshBtn'),
            flowSelect: document.getElementById('flowSelect'),
            allFlowsBtn: document.getElementById('allFlowsBtn'),
            cursorFollowBtn: document.getElementById('cursorFollowBtn'),
            exportJsonBtn: document.getElementById('exportJsonBtn'),
            exportJsBtn: document.getElementById('exportJsBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            
            // Tabs
            jsonTab: document.getElementById('jsonTab'),
            flowTab: document.getElementById('flowTab'),
            
            // Views
            jsonView: document.getElementById('jsonView'),
            flowView: document.getElementById('flowView'),
            errorView: document.getElementById('errorView'),
            
            // Containers
            jsonContainer: document.getElementById('jsonContainer'),
            flowContainer: document.getElementById('flowContainer'),
            flowDiagram: document.getElementById('flowDiagram'),
            errorList: document.getElementById('errorList')
        };
    }

    function initializeMermaid() {
        if (typeof mermaid !== 'undefined' && !mermaidInitialized) {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                themeVariables: {
                    primaryColor: '#569cd6',
                    primaryTextColor: '#cccccc',
                    primaryBorderColor: '#569cd6',
                    lineColor: '#6796b9',
                    secondaryColor: '#3a3d41',
                    tertiaryColor: '#2d2d30',
                    background: '#1e1e1e',
                    mainBkg: '#2d2d30',
                    secondBkg: '#3e3e42',
                    tertiaryBkg: '#404045'
                },
                fontFamily: 'var(--vscode-font-family)',
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true,
                    curve: 'basis'
                }
            });
            mermaidInitialized = true;
        }
    }

    function setupEventListeners() {
        // Toolbar buttons
        elements.refreshBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'refresh' });
        });

        elements.flowSelect.addEventListener('change', (e) => {
            const flowId = e.target.value;
            currentState.selectedFlow = flowId;
            vscode.postMessage({ 
                type: 'selectFlow', 
                data: { flowId } 
            });
        });

        elements.allFlowsBtn.addEventListener('click', () => {
            currentState.selectedFlow = null;
            elements.flowSelect.value = '';
            updateFlowView();
        });

        elements.cursorFollowBtn.addEventListener('click', () => {
            currentState.cursorFollowingEnabled = !currentState.cursorFollowingEnabled;
            updateCursorFollowButton();
            vscode.postMessage({ 
                type: 'toggleCursorFollowing', 
                data: { enabled: currentState.cursorFollowingEnabled } 
            });
        });

        elements.exportJsonBtn.addEventListener('click', () => {
            vscode.postMessage({ 
                type: 'export', 
                data: { format: 'json' } 
            });
        });

        elements.exportJsBtn.addEventListener('click', () => {
            vscode.postMessage({ 
                type: 'export', 
                data: { format: 'js' } 
            });
        });

        // Tab switching
        elements.jsonTab.addEventListener('click', () => switchTab('json'));
        elements.flowTab.addEventListener('click', () => switchTab('flow'));
    }

    function setupMessageHandlers() {
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'updateData':
                    handleDataUpdate(message.data);
                    break;
                case 'cursorMove':
                    handleCursorMove(message.data);
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        });
    }

    function handleDataUpdate(data) {
        currentState = { ...currentState, ...data };
        
        if (data.compilationErrors && data.compilationErrors.length > 0) {
            showErrors(data.compilationErrors);
        } else {
            hideErrors();
            updateFlowSelect();
            updateJsonView();
            updateFlowView();
        }
        
        // Initialize cursor follow button state
        updateCursorFollowButton();
    }

    function switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Update view containers
        document.querySelectorAll('.view-content').forEach(view => {
            view.classList.remove('active');
        });

        if (tabName === 'json') {
            elements.jsonTab.classList.add('active');
            elements.jsonView.classList.add('active');
        } else if (tabName === 'flow') {
            elements.flowTab.classList.add('active');
            elements.flowView.classList.add('active');
        }
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
        
        // Set selected flow if any
        if (currentState.selectedFlow && flowIds.includes(currentState.selectedFlow)) {
            elements.flowSelect.value = currentState.selectedFlow;
        }
        
        // Enable/disable flow-related buttons
        const hasFlows = flowIds.length > 0;
        elements.allFlowsBtn.disabled = !hasFlows;
        elements.flowSelect.disabled = !hasFlows;
    }

    function updateJsonView() {
        const jsonData = {
            agent: currentState.agent || {},
            messages: currentState.messages || {},
            flows: currentState.flows || {}
        };
        
        const jsonHtml = renderJsonTree(jsonData);
        elements.jsonContainer.innerHTML = `
            <div class="json-content">
                <div class="json-tree">
                    ${jsonHtml}
                </div>
            </div>
        `;
        
        // Add click handlers for expandable items
        setupJsonTreeHandlers();
    }

    function renderJsonTree(obj, depth = 0) {
        if (obj === null) {
            return '<span class="json-null">null</span>';
        }
        
        if (typeof obj === 'string') {
            return `<span class="json-string">"${escapeHtml(obj)}"</span>`;
        }
        
        if (typeof obj === 'number') {
            return `<span class="json-number">${obj}</span>`;
        }
        
        if (typeof obj === 'boolean') {
            return `<span class="json-boolean">${obj}</span>`;
        }
        
        if (Array.isArray(obj)) {
            if (obj.length === 0) {
                return '<span class="json-array">[]</span>';
            }
            
            const items = obj.map((item, index) => {
                return `
                    <div class="json-object" style="margin-left: ${(depth + 1) * 16}px;">
                        <span class="json-key">[${index}]</span>: ${renderJsonTree(item, depth + 1)}
                    </div>
                `;
            }).join('');
            
            return `
                <div class="json-expandable json-expanded" data-depth="${depth}">
                    <span class="json-toggle"></span>
                    <span class="json-array">[</span>
                    <div class="json-children">
                        ${items}
                    </div>
                    <span class="json-array" style="margin-left: ${depth * 16}px;">]</span>
                </div>
            `;
        }
        
        if (typeof obj === 'object') {
            const keys = Object.keys(obj);
            if (keys.length === 0) {
                return '<span class="json-object">{}</span>';
            }
            
            const items = keys.map(key => {
                return `
                    <div class="json-object" style="margin-left: ${(depth + 1) * 16}px;">
                        <span class="json-key">"${escapeHtml(key)}"</span>: ${renderJsonTree(obj[key], depth + 1)}
                    </div>
                `;
            }).join('');
            
            return `
                <div class="json-expandable json-expanded" data-depth="${depth}">
                    <span class="json-toggle"></span>
                    <span class="json-object">{</span>
                    <div class="json-children">
                        ${items}
                    </div>
                    <span class="json-object" style="margin-left: ${depth * 16}px;">}</span>
                </div>
            `;
        }
        
        return `<span class="json-unknown">${String(obj)}</span>`;
    }

    function setupJsonTreeHandlers() {
        document.querySelectorAll('.json-expandable').forEach(element => {
            element.addEventListener('click', function(e) {
                if (e.target.classList.contains('json-toggle') || e.target.classList.contains('json-expandable')) {
                    e.stopPropagation();
                    toggleJsonNode(this);
                }
            });
        });
    }

    function toggleJsonNode(element) {
        const isExpanded = element.classList.contains('json-expanded');
        const children = element.querySelector('.json-children');
        
        if (isExpanded) {
            element.classList.remove('json-expanded');
            element.classList.add('json-collapsed');
            if (children) children.style.display = 'none';
        } else {
            element.classList.remove('json-collapsed');
            element.classList.add('json-expanded');
            if (children) children.style.display = 'block';
        }
    }

    function updateFlowView() {
        if (!currentState.flows || Object.keys(currentState.flows).length === 0) {
            elements.flowDiagram.classList.add('hidden');
            elements.flowContainer.innerHTML = '<div class="placeholder">No flows found in the current RCL file.</div>';
            return;
        }
        
        if (currentState.selectedFlow) {
            const flow = currentState.flows[currentState.selectedFlow];
            if (flow) {
                renderFlowDiagram(currentState.selectedFlow, flow);
            } else {
                elements.flowDiagram.classList.add('hidden');
                elements.flowContainer.innerHTML = '<div class="placeholder">Selected flow not found.</div>';
            }
        } else {
            renderAllFlows();
        }
    }

    function renderFlowDiagram(flowId, flow) {
        if (!mermaidInitialized) {
            elements.flowDiagram.classList.add('hidden');
            elements.flowContainer.innerHTML = '<div class="placeholder">Mermaid.js not loaded yet...</div>';
            return;
        }

        const mermaidSyntax = convertFlowToMermaid(flowId, flow);
        
        // Clear previous diagram
        elements.flowDiagram.innerHTML = '';
        elements.flowDiagram.classList.remove('hidden');
        
        // Hide placeholder
        const placeholder = elements.flowContainer.querySelector('.placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        try {
            const diagramId = `diagram-${Date.now()}`;
            mermaid.render(diagramId, mermaidSyntax).then(({ svg }) => {
                elements.flowDiagram.innerHTML = svg;
                
                // Add flow details below diagram
                const detailsHtml = `
                    <div class="flow-details">
                        <h3>Flow: ${escapeHtml(flowId)}</h3>
                        <div class="flow-info">
                            <strong>States:</strong> ${Object.keys(flow.states || {}).length}<br>
                            <strong>Initial State:</strong> ${flow.initial || 'start'}
                        </div>
                        <details>
                            <summary>Flow Configuration (JSON)</summary>
                            <pre class="flow-config">${JSON.stringify(flow, null, 2)}</pre>
                        </details>
                    </div>
                `;
                elements.flowDiagram.insertAdjacentHTML('afterend', detailsHtml);
            }).catch(error => {
                console.error('Mermaid rendering error:', error);
                elements.flowDiagram.innerHTML = `
                    <div class="placeholder">Error rendering flow diagram: ${error.message}</div>
                `;
            });
        } catch (error) {
            console.error('Mermaid syntax error:', error);
            elements.flowDiagram.innerHTML = `
                <div class="placeholder">Error in flow syntax: ${error.message}</div>
            `;
        }
    }

    function renderAllFlows() {
        if (!mermaidInitialized) {
            elements.flowDiagram.classList.add('hidden');
            elements.flowContainer.innerHTML = '<div class="placeholder">Mermaid.js not loaded yet...</div>';
            return;
        }

        const flows = currentState.flows;
        const flowCount = Object.keys(flows).length;
        
        if (flowCount === 1) {
            // If only one flow, render it directly
            const flowId = Object.keys(flows)[0];
            renderFlowDiagram(flowId, flows[flowId]);
            return;
        }

        // Render multiple flows in a combined diagram
        const combinedMermaid = convertMultipleFlowsToMermaid(flows);
        
        // Clear previous diagram
        elements.flowDiagram.innerHTML = '';
        elements.flowDiagram.classList.remove('hidden');
        
        // Hide placeholder
        const placeholder = elements.flowContainer.querySelector('.placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        try {
            const diagramId = `combined-diagram-${Date.now()}`;
            mermaid.render(diagramId, combinedMermaid).then(({ svg }) => {
                elements.flowDiagram.innerHTML = svg;
                
                // Add summary below diagram
                const summaryHtml = `
                    <div class="flow-summary">
                        <h3>All Flows (${flowCount})</h3>
                        <div class="flow-list">
                            ${Object.keys(flows).map(flowId => {
                                const flow = flows[flowId];
                                return `<div class="flow-item" onclick="selectFlow('${flowId}')">
                                    <strong>${escapeHtml(flowId)}</strong>
                                    <br>
                                    <small>${Object.keys(flow.states || {}).length} states</small>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                `;
                elements.flowDiagram.insertAdjacentHTML('afterend', summaryHtml);
            }).catch(error => {
                console.error('Mermaid rendering error:', error);
                elements.flowDiagram.innerHTML = `
                    <div class="placeholder">Error rendering combined flow diagram: ${error.message}</div>
                `;
            });
        } catch (error) {
            console.error('Mermaid syntax error:', error);
            elements.flowDiagram.innerHTML = `
                <div class="placeholder">Error in combined flow syntax: ${error.message}</div>
            `;
        }
    }

    function convertFlowToMermaid(flowId, flow) {
        const states = flow.states || {};
        const initial = flow.initial || 'start';
        
        let mermaid = 'flowchart TD\n';
        
        // Add initial state marker
        mermaid += `    Start([Start]) --> ${initial}\n`;
        
        // Add states and transitions
        Object.keys(states).forEach(stateId => {
            const state = states[stateId];
            
            // Format state node
            let stateLabel = stateId;
            if (state.type === 'final') {
                mermaid += `    ${stateId}([${stateLabel}])\n`;
            } else {
                mermaid += `    ${stateId}[${stateLabel}]\n`;
            }
            
            // Add transitions
            if (state.on) {
                Object.keys(state.on).forEach(event => {
                    const target = state.on[event];
                    const eventLabel = event === 'NEXT' ? '' : event;
                    if (eventLabel) {
                        mermaid += `    ${stateId} -->|${eventLabel}| ${target}\n`;
                    } else {
                        mermaid += `    ${stateId} --> ${target}\n`;
                    }
                });
            }
        });
        
        // Add styling
        mermaid += '\n';
        mermaid += '    classDef startNode fill:#4CAF50,stroke:#45a049,color:#fff\n';
        mermaid += '    classDef finalNode fill:#f44336,stroke:#da190b,color:#fff\n';
        mermaid += '    classDef messageNode fill:#2196F3,stroke:#1976D2,color:#fff\n';
        mermaid += '    class Start startNode\n';
        
        // Apply classes to nodes
        Object.keys(states).forEach(stateId => {
            const state = states[stateId];
            if (state.type === 'final') {
                mermaid += `    class ${stateId} finalNode\n`;
            } else {
                mermaid += `    class ${stateId} messageNode\n`;
            }
        });
        
        return mermaid;
    }

    function convertMultipleFlowsToMermaid(flows) {
        let mermaid = 'flowchart TD\n';
        let nodeCounter = 0;
        
        // Create subgraphs for each flow
        Object.keys(flows).forEach(flowId => {
            const flow = flows[flowId];
            const states = flow.states || {};
            const initial = flow.initial || 'start';
            
            mermaid += `    subgraph ${flowId} ["${flowId}"]\n`;
            
            // Add states for this flow
            Object.keys(states).forEach(stateId => {
                const state = states[stateId];
                const nodeId = `${flowId}_${stateId}`;
                
                if (state.type === 'final') {
                    mermaid += `        ${nodeId}([${stateId}])\n`;
                } else {
                    mermaid += `        ${nodeId}[${stateId}]\n`;
                }
                
                // Add transitions within this flow
                if (state.on) {
                    Object.keys(state.on).forEach(event => {
                        const target = state.on[event];
                        const targetNodeId = `${flowId}_${target}`;
                        const eventLabel = event === 'NEXT' ? '' : event;
                        if (eventLabel) {
                            mermaid += `        ${nodeId} -->|${eventLabel}| ${targetNodeId}\n`;
                        } else {
                            mermaid += `        ${nodeId} --> ${targetNodeId}\n`;
                        }
                    });
                }
            });
            
            mermaid += '    end\n\n';
        });
        
        // Add styling
        mermaid += '    classDef finalNode fill:#f44336,stroke:#da190b,color:#fff\n';
        mermaid += '    classDef messageNode fill:#2196F3,stroke:#1976D2,color:#fff\n';
        
        return mermaid;
    }

    function handleCursorMove(data) {
        if (currentState.cursorFollowingEnabled && data.flowId) {
            currentState.selectedFlow = data.flowId;
            elements.flowSelect.value = data.flowId;
            updateFlowView();
            
            // Switch to flow tab if not already active
            if (!elements.flowTab.classList.contains('active')) {
                switchTab('flow');
            }
            
            // Highlight the current line info (optional feature)
            showCursorInfo(data);
        }
    }

    function updateCursorFollowButton() {
        if (currentState.cursorFollowingEnabled) {
            elements.cursorFollowBtn.classList.add('active');
            elements.cursorFollowBtn.style.backgroundColor = 'var(--vscode-button-background)';
            elements.cursorFollowBtn.title = 'Cursor Following: ON (click to disable)';
        } else {
            elements.cursorFollowBtn.classList.remove('active');
            elements.cursorFollowBtn.style.backgroundColor = '';
            elements.cursorFollowBtn.title = 'Follow Cursor (click to enable)';
        }
    }

    function showCursorInfo(data) {
        // Show a brief indicator of cursor position
        const infoDiv = document.createElement('div');
        infoDiv.className = 'cursor-info';
        infoDiv.innerHTML = `
            <small>Following cursor: Line ${data.line + 1}</small>
        `;
        infoDiv.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            opacity: 0.9;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(infoDiv);
        
        // Remove after 2 seconds
        setTimeout(() => {
            if (infoDiv.parentNode) {
                infoDiv.style.opacity = '0';
                setTimeout(() => {
                    if (infoDiv.parentNode) {
                        infoDiv.parentNode.removeChild(infoDiv);
                    }
                }, 300);
            }
        }, 2000);
    }

    function selectFlow(flowId) {
        currentState.selectedFlow = flowId;
        elements.flowSelect.value = flowId;
        vscode.postMessage({ 
            type: 'selectFlow', 
            data: { flowId } 
        });
        updateFlowView();
    }

    function showErrors(errors) {
        elements.errorView.classList.remove('hidden');
        elements.errorList.innerHTML = errors.map(error => 
            `<div class="error-item">${escapeHtml(error)}</div>`
        ).join('');
    }

    function hideErrors() {
        elements.errorView.classList.add('hidden');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Expose global functions for debugging
    window.rclPreview = {
        getCurrentState: () => currentState,
        switchTab: switchTab,
        refresh: () => vscode.postMessage({ type: 'refresh' })
    };
})();