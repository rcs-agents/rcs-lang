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
        compilationErrors: null
    };

    // DOM elements
    let elements = {};

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeElements();
        setupEventListeners();
        setupMessageHandlers();
        
        // Notify extension that webview is ready
        vscode.postMessage({ type: 'ready' });
    });

    function initializeElements() {
        elements = {
            // Toolbar
            refreshBtn: document.getElementById('refreshBtn'),
            flowSelect: document.getElementById('flowSelect'),
            allFlowsBtn: document.getElementById('allFlowsBtn'),
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
            errorList: document.getElementById('errorList')
        };
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
            elements.flowContainer.innerHTML = '<div class="placeholder">No flows found in the current RCL file.</div>';
            return;
        }
        
        if (currentState.selectedFlow) {
            const flow = currentState.flows[currentState.selectedFlow];
            if (flow) {
                elements.flowContainer.innerHTML = `
                    <div class="flow-details">
                        <h3>Flow: ${escapeHtml(currentState.selectedFlow)}</h3>
                        <div class="placeholder">Flow diagram visualization will be implemented with Mermaid.js</div>
                        <pre class="flow-config">${JSON.stringify(flow, null, 2)}</pre>
                    </div>
                `;
            } else {
                elements.flowContainer.innerHTML = '<div class="placeholder">Selected flow not found.</div>';
            }
        } else {
            const flowCount = Object.keys(currentState.flows).length;
            elements.flowContainer.innerHTML = `
                <div class="flow-summary">
                    <h3>All Flows (${flowCount})</h3>
                    <div class="placeholder">Combined flow diagram will show all flows in a single view</div>
                    <div class="flow-list">
                        ${Object.keys(currentState.flows).map(flowId => 
                            `<div class="flow-item">
                                <strong>${escapeHtml(flowId)}</strong>
                                <br>
                                <small>${Object.keys(currentState.flows[flowId].states || {}).length} states</small>
                            </div>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
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