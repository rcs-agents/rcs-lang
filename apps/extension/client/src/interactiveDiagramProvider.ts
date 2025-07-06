import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';

interface RCLNode {
  id: string;
  type: 'start' | 'message' | 'end' | 'rich_card';
  position: { x: number; y: number };
  data: any;
}

interface RCLEdge {
  id: string;
  source: string;
  target: string;
  data?: any;
}

interface RCLFlowModel {
  id: string;
  nodes: RCLNode[];
  edges: RCLEdge[];
}

interface InteractiveDiagramState {
  flows: Record<string, RCLFlowModel>;
  activeFlow?: string;
  messages: Record<string, any>;
  agent: any;
}

interface ExtensionToWebviewMessage {
  type: 'updateModel' | 'setActiveFlow' | 'modelChanged';
  data: any;
}

interface WebviewToExtensionMessage {
  type: 'ready' | 'nodeCreated' | 'nodeDeleted' | 'nodeUpdated' | 'edgeCreated' | 'edgeDeleted' | 'modelChanged';
  data: any;
}

export class InteractiveDiagramProvider {
  private static readonly viewType = 'rclInteractiveDiagram';
  private _panel?: vscode.WebviewPanel;
  private _extensionUri: vscode.Uri;
  private _currentDocument?: vscode.TextDocument;
  private _state: InteractiveDiagramState = {
    flows: {},
    messages: {},
    agent: {}
  };

  constructor(private readonly _extensionContext: vscode.ExtensionContext) {
    this._extensionUri = _extensionContext.extensionUri;
  }

  public async openInteractiveDiagram(document?: vscode.TextDocument) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (this._panel) {
      this._panel.reveal(column);
      if (document) {
        this._currentDocument = document;
        await this._loadModelFromDocument();
      }
      return;
    }

    // Create and show a new webview panel
    this._panel = vscode.window.createWebviewPanel(
      InteractiveDiagramProvider.viewType,
      'RCL Interactive Diagram',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [this._extensionUri]
      }
    );

    // Set the webview's initial html content
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this._dispose(), null, this._extensionContext.subscriptions);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message: WebviewToExtensionMessage) => {
        this._handleWebviewMessage(message);
      },
      null,
      this._extensionContext.subscriptions
    );

    // Load the document if provided
    if (document) {
      this._currentDocument = document;
      await this._loadModelFromDocument();
    }
  }

  private async _loadModelFromDocument() {
    if (!this._currentDocument) {
      return;
    }

    try {
      // Compile the RCL document to extract flow information
      const compiledData = await this._compileRCLDocument(this._currentDocument);
      
      if (compiledData.success && compiledData.data) {
        // Convert compiled data to visual diagram model
        const diagramModels = this._convertToSprottyModel(compiledData.data);
        
        this._state = {
          flows: diagramModels,
          messages: compiledData.data.messages || {},
          agent: compiledData.data.agent || {},
          activeFlow: Object.keys(diagramModels)[0] // Set first flow as active
        };

        this._updateWebview();
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to load diagram model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private _convertToSprottyModel(compiledData: any): Record<string, RCLFlowModel> {
    const diagramModels: Record<string, RCLFlowModel> = {};
    
    // Convert each flow to a Sprotty-compatible model
    Object.keys(compiledData.flows || {}).forEach(flowId => {
      const flow = compiledData.flows[flowId];
      const nodes: RCLNode[] = [];
      const edges: RCLEdge[] = [];
      
      // Auto-layout positions (simple grid layout for now)
      let x = 100;
      let y = 100;
      const xSpacing = 200;
      const ySpacing = 100;

      // Add nodes for each state
      Object.keys(flow.states || {}).forEach((stateId, index) => {
        const state = flow.states[stateId];
        
        // Determine node type
        let nodeType: RCLNode['type'] = 'message';
        if (stateId === 'start' || stateId === flow.initial) {
          nodeType = 'start';
        } else if (state.type === 'final' || stateId === 'end') {
          nodeType = 'end';
        } else if (compiledData.messages && compiledData.messages[stateId]) {
          // Check if it's a rich card message
          const message = compiledData.messages[stateId];
          if (message.contentMessage?.richCard) {
            nodeType = 'rich_card';
          }
        }

        nodes.push({
          id: stateId,
          type: nodeType,
          position: { 
            x: x + (index % 3) * xSpacing, 
            y: y + Math.floor(index / 3) * ySpacing 
          },
          data: {
            label: stateId,
            messageData: compiledData.messages?.[stateId],
            stateData: state
          }
        });
      });

      // Add edges for transitions
      Object.keys(flow.states || {}).forEach(stateId => {
        const state = flow.states[stateId];
        if (state.on) {
          Object.keys(state.on).forEach(trigger => {
            const targetState = state.on[trigger];
            edges.push({
              id: `${stateId}-${targetState}`,
              source: stateId,
              target: targetState,
              data: {
                trigger: trigger === 'NEXT' ? '' : trigger
              }
            });
          });
        }
      });

      diagramModels[flowId] = {
        id: flowId,
        nodes,
        edges
      };
    });

    return diagramModels;
  }

  private async _compileRCLDocument(document: vscode.TextDocument): Promise<{
    success: boolean;
    data?: any;
    errors?: string[];
  }> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
      return { success: false, errors: ['File must be within a workspace folder'] };
    }

    const cliPath = this._findRclCli(workspaceFolder.uri.fsPath);
    if (!cliPath) {
      return { success: false, errors: ['RCL CLI tool not found'] };
    }

    try {
      // Create temporary file for compilation
      const tempPath = path.join(require('os').tmpdir(), `rcl-interactive-${Date.now()}.rcl`);
      const tempOutputPath = tempPath.replace('.rcl', '.json');
      
      await fs.promises.writeFile(tempPath, document.getText(), 'utf-8');
      
      const result = await this._runRclCli(cliPath, tempPath, tempOutputPath, 'json');
      
      if (result.success) {
        const compiledContent = await fs.promises.readFile(tempOutputPath, 'utf-8');
        const compiledData = JSON.parse(compiledContent);
        
        // Clean up temp files
        fs.promises.unlink(tempPath).catch(() => {});
        fs.promises.unlink(tempOutputPath).catch(() => {});
        
        return { success: true, data: compiledData };
      } else {
        return { success: false, errors: [result.error || 'Compilation failed'] };
      }
    } catch (error) {
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : String(error)] 
      };
    }
  }

  private _findRclCli(workspacePath: string): string | null {
    const possiblePaths = [
      path.join(workspacePath, 'packages', 'cli', 'demo.js'),
      path.join(workspacePath, '..', 'packages', 'cli', 'demo.js'),
      path.join(workspacePath, '..', '..', 'packages', 'cli', 'demo.js'),
      path.join(workspacePath, 'cli', 'demo.js'),
      path.join(workspacePath, 'node_modules', '.bin', 'rcl-cli'),
      path.join(workspacePath, 'node_modules', 'rcl-cli', 'cli', 'demo.js'),
      path.join(workspacePath, '..', 'cli', 'demo.js'),
      path.join(workspacePath, '..', '..', 'cli', 'demo.js'),
    ];

    for (const cliPath of possiblePaths) {
      if (fs.existsSync(cliPath)) {
        return cliPath;
      }
    }

    return null;
  }

  private _runRclCli(cliPath: string, inputPath: string, outputPath: string, format: string = 'json'): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const command = `node "${cliPath}" "${inputPath}" -o "${outputPath}" --format ${format}`;
      
      cp.exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else if (stderr) {
          resolve({ success: false, error: stderr });
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  private _handleWebviewMessage(message: WebviewToExtensionMessage) {
    switch (message.type) {
      case 'ready':
        this._updateWebview();
        break;
        
      case 'nodeCreated':
        this._handleNodeCreated(message.data);
        break;
        
      case 'nodeDeleted':
        this._handleNodeDeleted(message.data);
        break;
        
      case 'nodeUpdated':
        this._handleNodeUpdated(message.data);
        break;
        
      case 'edgeCreated':
        this._handleEdgeCreated(message.data);
        break;
        
      case 'edgeDeleted':
        this._handleEdgeDeleted(message.data);
        break;
        
      case 'modelChanged':
        this._handleModelChanged(message.data);
        break;
    }
  }

  private _handleNodeCreated(data: any) {
    if (!this._state.activeFlow || !this._state.flows[this._state.activeFlow]) {
      return;
    }

    const flow = this._state.flows[this._state.activeFlow];
    flow.nodes.push(data.node);
    
    this._generateCodeFromModel();
  }

  private _handleNodeDeleted(data: any) {
    if (!this._state.activeFlow || !this._state.flows[this._state.activeFlow]) {
      return;
    }

    const flow = this._state.flows[this._state.activeFlow];
    flow.nodes = flow.nodes.filter(node => node.id !== data.nodeId);
    flow.edges = flow.edges.filter(edge => edge.source !== data.nodeId && edge.target !== data.nodeId);
    
    this._generateCodeFromModel();
  }

  private _handleNodeUpdated(data: any) {
    if (!this._state.activeFlow || !this._state.flows[this._state.activeFlow]) {
      return;
    }

    const flow = this._state.flows[this._state.activeFlow];
    const nodeIndex = flow.nodes.findIndex(node => node.id === data.node.id);
    if (nodeIndex !== -1) {
      flow.nodes[nodeIndex] = { ...flow.nodes[nodeIndex], ...data.node };
    }
    
    this._generateCodeFromModel();
  }

  private _handleEdgeCreated(data: any) {
    if (!this._state.activeFlow || !this._state.flows[this._state.activeFlow]) {
      return;
    }

    const flow = this._state.flows[this._state.activeFlow];
    flow.edges.push(data.edge);
    
    this._generateCodeFromModel();
  }

  private _handleEdgeDeleted(data: any) {
    if (!this._state.activeFlow || !this._state.flows[this._state.activeFlow]) {
      return;
    }

    const flow = this._state.flows[this._state.activeFlow];
    flow.edges = flow.edges.filter(edge => edge.id !== data.edgeId);
    
    this._generateCodeFromModel();
  }

  private _handleModelChanged(data: any) {
    // Handle complete model updates
    if (data.flows) {
      this._state.flows = data.flows;
    }
    if (data.activeFlow) {
      this._state.activeFlow = data.activeFlow;
    }
    
    this._generateCodeFromModel();
  }

  private async _generateCodeFromModel() {
    if (!this._currentDocument) {
      return;
    }

    try {
      // Convert diagram model back to RCL code
      const rclCode = this._convertModelToRCL();
      
      // Update the document
      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        this._currentDocument.positionAt(0),
        this._currentDocument.positionAt(this._currentDocument.getText().length)
      );
      
      edit.replace(this._currentDocument.uri, fullRange, rclCode);
      await vscode.workspace.applyEdit(edit);
      
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to generate code: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private _convertModelToRCL(): string {
    let rclCode = '';
    
    // Generate agent section
    if (this._state.agent) {
      rclCode += `agent ${this._state.agent.name || 'GeneratedAgent'}\n`;
      if (this._state.agent.displayName) {
        rclCode += `display-name: "${this._state.agent.displayName}"\n`;
      }
      if (this._state.agent.brandName) {
        rclCode += `brand-name: "${this._state.agent.brandName}"\n`;
      }
      rclCode += '\n';
    }
    
    // Generate messages section
    if (Object.keys(this._state.messages).length > 0) {
      rclCode += 'messages\n';
      Object.keys(this._state.messages).forEach(messageId => {
        const message = this._state.messages[messageId];
        if (message.contentMessage?.text) {
          rclCode += `${messageId}: "${message.contentMessage.text}"\n`;
        }
      });
      rclCode += '\n';
    }
    
    // Generate flow sections
    Object.keys(this._state.flows).forEach(flowId => {
      const flow = this._state.flows[flowId];
      rclCode += `flow ${flowId}\n`;
      
      // Generate transitions from edges
      flow.edges.forEach(edge => {
        rclCode += `  ${edge.source} -> ${edge.target}\n`;
      });
      
      rclCode += '\n';
    });
    
    return rclCode;
  }

  private _updateWebview() {
    if (this._panel) {
      const message: ExtensionToWebviewMessage = {
        type: 'updateModel',
        data: this._state
      };
      this._panel.webview.postMessage(message);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get URIs for resources
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'client', 'resources', 'interactive-diagram.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'client', 'resources', 'interactive-diagram.js'));

    // Use a nonce to whitelist specific scripts for security
    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval'; font-src ${webview.cspSource};">
        <link href="${styleUri}" rel="stylesheet">
        <title>RCL Interactive Diagram</title>
    </head>
    <body>
        <div id="root">
            <div class="toolbar">
                <div class="toolbar-left">
                    <button id="saveBtn" class="toolbar-btn" title="Save Changes">💾</button>
                    <button id="undoBtn" class="toolbar-btn" title="Undo">↶</button>
                    <button id="redoBtn" class="toolbar-btn" title="Redo">↷</button>
                </div>
                <div class="toolbar-center">
                    <select id="flowSelect" class="flow-select">
                        <option value="">Select Flow...</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button id="addNodeBtn" class="toolbar-btn" title="Add Node">➕</button>
                    <button id="connectBtn" class="toolbar-btn" title="Connect Nodes">🔗</button>
                    <button id="deleteBtn" class="toolbar-btn" title="Delete Selection">🗑️</button>
                    <button id="settingsBtn" class="toolbar-btn" title="Settings">⚙️</button>
                </div>
            </div>
            
            <div class="content">
                <div class="sidebar">
                    <div class="node-palette">
                        <h3>Node Palette</h3>
                        <div class="palette-item" data-type="start">🟢 Start</div>
                        <div class="palette-item" data-type="message">📝 Message</div>
                        <div class="palette-item" data-type="rich_card">⭐ Rich Card</div>
                        <div class="palette-item" data-type="end">🔴 End</div>
                    </div>
                    
                    <div class="properties-panel">
                        <h3>Properties</h3>
                        <div id="propertiesContent">
                            <p>Select a node to edit properties</p>
                        </div>
                    </div>
                </div>
                
                <div class="diagram-container">
                    <div id="sprotty-container" class="sprotty-container">
                        <div class="loading">Loading interactive diagram...</div>
                    </div>
                </div>
            </div>
        </div>
        
        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }

  private _dispose() {
    this._panel = undefined;
  }

  public dispose() {
    this._dispose();
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}