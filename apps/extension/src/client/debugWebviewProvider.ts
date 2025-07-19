import * as path from 'node:path';
import * as vscode from 'vscode';

/**
 * Debug Webview Provider to test basic webview functionality
 * This helps isolate issues with the Interactive Diagram
 */
export class DebugWebviewProvider {
  private static readonly viewType = 'rclDebugWebview';
  private _panel?: vscode.WebviewPanel;
  private _extensionUri: vscode.Uri;

  constructor(private readonly _extensionContext: vscode.ExtensionContext) {
    this._extensionUri = _extensionContext.extensionUri;
  }

  public async openDebugWebview(
    testType: 'minimal' | 'resources' | 'sprotty' | 'full' = 'minimal',
  ) {
    const column = vscode.window.activeTextEditor?.viewColumn;

    // Create webview panel
    this._panel = vscode.window.createWebviewPanel(
      DebugWebviewProvider.viewType,
      `RCL Debug: ${testType}`,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [this._extensionUri],
      },
    );

    // Set HTML content based on test type
    this._panel.webview.html = this._getHtmlForTest(this._panel.webview, testType);

    // Handle messages from webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        this._handleWebviewMessage(message);
      },
      null,
      this._extensionContext.subscriptions,
    );

    // Listen for disposal
    this._panel.onDidDispose(() => this._dispose(), null, this._extensionContext.subscriptions);

    vscode.window.showInformationMessage(`Debug webview opened: ${testType}`);
  }

  private _handleWebviewMessage(message: any) {
    console.log('Debug webview message:', message);

    switch (message.type) {
      case 'log':
        console.log('[Webview Log]:', message.data);
        vscode.window.showInformationMessage(`Webview: ${message.data}`);
        break;

      case 'error':
        console.error('[Webview Error]:', message.data);
        vscode.window.showErrorMessage(`Webview Error: ${message.data}`);
        break;

      case 'ready':
        console.log('[Webview Ready]');
        vscode.window.showInformationMessage('Webview is ready!');
        break;

      case 'test-complete':
        console.log('[Test Complete]:', message.data);
        vscode.window.showInformationMessage(`Test completed: ${message.data.status}`);
        break;
    }
  }

  private _getHtmlForTest(webview: vscode.Webview, testType: string): string {
    const nonce = getNonce();

    switch (testType) {
      case 'minimal':
        return this._getMinimalHtml(webview, nonce);
      case 'resources':
        return this._getResourcesTestHtml(webview, nonce);
      case 'sprotty':
        return this._getSprottyTestHtml(webview, nonce);
      case 'full':
        return this._getFullTestHtml(webview, nonce);
      default:
        return this._getMinimalHtml(webview, nonce);
    }
  }

  private _getMinimalHtml(webview: vscode.Webview, nonce: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
    <title>Minimal Webview Test</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .test-result { 
            margin: 10px 0; 
            padding: 10px; 
            border-radius: 4px; 
        }
        .success { background: #0f4c25; color: #4ac776; }
        .error { background: #4c1a1a; color: #f85c5c; }
        button { 
            margin: 5px; 
            padding: 10px 15px; 
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>🔍 Minimal Webview Test</h1>
    <p>Testing basic webview functionality...</p>
    
    <div id="results"></div>
    
    <button onclick="runBasicTests()">Run Basic Tests</button>
    <button onclick="testMessagePassing()">Test Message Passing</button>
    <button onclick="testVSCodeAPI()">Test VS Code API</button>
    
    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        
        function log(message, isError = false) {
            console.log(message);
            vscode.postMessage({
                type: isError ? 'error' : 'log',
                data: message
            });
            
            const results = document.getElementById('results');
            const div = document.createElement('div');
            div.className = 'test-result ' + (isError ? 'error' : 'success');
            div.textContent = message;
            results.appendChild(div);
        }
        
        function runBasicTests() {
            log('🟢 Basic JavaScript execution works');
            log('🟢 DOM manipulation works');
            log('🟢 VS Code API accessible: ' + (typeof vscode !== 'undefined'));
            log('🟢 CSS variables work: ' + getComputedStyle(document.body).getPropertyValue('--vscode-editor-background'));
        }
        
        function testMessagePassing() {
            log('📤 Testing message passing to extension...');
            vscode.postMessage({
                type: 'test-complete',
                data: { status: 'Message passing works!' }
            });
        }
        
        function testVSCodeAPI() {
            try {
                vscode.setState({ test: true });
                const state = vscode.getState();
                log('🟢 VS Code state API works: ' + JSON.stringify(state));
            } catch (error) {
                log('❌ VS Code state API failed: ' + error.message, true);
            }
        }
        
        // Auto-run basic tests
        window.addEventListener('load', () => {
            log('🟢 Webview loaded successfully');
            vscode.postMessage({ type: 'ready' });
            runBasicTests();
        });
        
        // Error handling
        window.addEventListener('error', (event) => {
            log('❌ JavaScript error: ' + event.error.message, true);
        });
    </script>
</body>
</html>`;
  }

  private _getResourcesTestHtml(webview: vscode.Webview, nonce: string): string {
    // Get URIs for actual resources
    const styleUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(this._extensionUri.fsPath, 'client', 'resources', 'interactive-diagram.css')),
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(this._extensionUri.fsPath, 'client', 'resources', 'interactive-diagram.js')),
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval'; font-src ${webview.cspSource};">
    <title>Resources Test</title>
    <link href="${styleUri}" rel="stylesheet">
    <style>
        body { padding: 20px; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .success { background: #0f4c25; color: #4ac776; }
        .error { background: #4c1a1a; color: #f85c5c; }
    </style>
</head>
<body>
    <h1>🔍 Resources Loading Test</h1>
    <div id="results"></div>
    
    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        
        function log(message, isError = false) {
            const results = document.getElementById('results');
            const div = document.createElement('div');
            div.className = 'test-result ' + (isError ? 'error' : 'success');
            div.textContent = message;
            results.appendChild(div);
            
            vscode.postMessage({
                type: isError ? 'error' : 'log',
                data: message
            });
        }
        
        // Test CSS loading
        window.addEventListener('load', () => {
            // Check if CSS loaded
            const style = getComputedStyle(document.body);
            if (style.fontFamily) {
                log('🟢 CSS loaded successfully');
            } else {
                log('❌ CSS failed to load', true);
            }
            
            // Try to load the script
            log('📤 Attempting to load interactive-diagram.js...');
            const script = document.createElement('script');
            script.src = '${scriptUri}';
            script.onload = () => log('🟢 JavaScript resource loaded');
            script.onerror = (e) => log('❌ JavaScript resource failed: ' + e.message, true);
            document.head.appendChild(script);
        });
    </script>
</body>
</html>`;
  }

  private _getSprottyTestHtml(webview: vscode.Webview, nonce: string): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(
        this._extensionUri.fsPath,
        'client',
        'resources',
        'interactive-diagram-improved.js',
      )),
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(this._extensionUri.fsPath, 'client', 'resources', 'interactive-diagram.css')),
    );
    const sprottyStyleUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(this._extensionUri.fsPath, 'client', 'resources', 'sprotty-diagram.css')),
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval'; font-src ${webview.cspSource};">
    <title>Diagram Test</title>
    <link href="${styleUri}" rel="stylesheet">
    <link href="${sprottyStyleUri}" rel="stylesheet">
    <style>
        body { padding: 20px; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); }
        #sprotty-container { width: 100%; height: 400px; border: 1px solid #444; margin: 20px 0; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .success { background: #0f4c25; color: #4ac776; }
        .error { background: #4c1a1a; color: #f85c5c; }
    </style>
</head>
<body>
    <h1>🔍 Enhanced Diagram Test</h1>
    <div id="results"></div>
    
    <!-- Mimic the structure from the actual interactive diagram -->
    <div id="root">
        <div class="toolbar">
            <div class="toolbar-center">
                <select id="flowSelect" class="flow-select">
                    <option value="">Select Flow...</option>
                </select>
            </div>
        </div>
        <div class="content">
            <div class="diagram-container">
                <div id="sprotty-container" class="sprotty-container">
                    <div class="loading">Loading interactive diagram...</div>
                </div>
            </div>
        </div>
    </div>
    
    <script nonce="${nonce}">
        // Create a pre-script log function before loading interactive-diagram.js
        const results = document.getElementById('results');
        
        function preLog(message, isError = false) {
            const div = document.createElement('div');
            div.className = 'test-result ' + (isError ? 'error' : 'success');
            div.textContent = message;
            results.appendChild(div);
        }
        
        preLog('🟢 Starting Sprotty test...');
        preLog('📤 Loading interactive-diagram.js...');
    </script>
    
    <!-- Load the actual interactive diagram script -->
    <script nonce="${nonce}" src="${scriptUri}"></script>
    
    <script nonce="${nonce}">
        // Test script after loading interactive-diagram.js
        setTimeout(() => {
            // Check what's available in the global scope
            preLog('🔍 Checking diagram initialization...');
            
            // Wait a bit more for the diagram to initialize
            setTimeout(() => {
                const container = document.getElementById('sprotty-container');
                if (container) {
                    const hasLoading = container.querySelector('.loading');
                    const hasSvg = container.querySelector('svg');
                    
                    if (hasLoading) {
                        preLog('⏳ Still showing loading message');
                    }
                    if (hasSvg) {
                        preLog('🟢 SVG element created!');
                        
                        // Check for diagram elements
                        const nodes = container.querySelectorAll('.diagram-node');
                        const edges = container.querySelectorAll('.diagram-edge');
                        preLog('📊 Found ' + nodes.length + ' nodes and ' + edges.length + ' edges');
                    }
                    
                    if (!hasLoading && !hasSvg) {
                        preLog('❌ Container is empty - no loading message or SVG', true);
                    }
                } else {
                    preLog('❌ Container not found!', true);
                }
            }, 1000);
            
            // Send test data to see if it renders
            preLog('📤 Sending test flow data...');
            window.postMessage({
                type: 'updateModel',
                data: {
                    flows: {
                        TestFlow: {
                            id: 'TestFlow',
                            nodes: [
                                { id: 'Start', type: 'start', position: { x: 100, y: 100 }, data: { label: 'Start' } },
                                { id: 'End', type: 'end', position: { x: 300, y: 100 }, data: { label: 'End' } }
                            ],
                            edges: [
                                { id: 'Start-End', source: 'Start', target: 'End', data: {} }
                            ]
                        }
                    },
                    activeFlow: 'TestFlow',
                    messages: {},
                    agent: { name: 'TestAgent', displayName: 'Test Agent' }
                }
            }, '*');
            
            // Check result after a delay
            setTimeout(() => {
                const svgCheck = container.querySelector('svg');
                if (svgCheck) {
                    preLog('🟢 SVG diagram rendered successfully!');
                    preLog('SVG dimensions: ' + svgCheck.getAttribute('width') + ' x ' + svgCheck.getAttribute('height'));
                } else {
                    preLog('❌ No SVG element found after sending data', true);
                }
            }, 1000);
            
        }, 2000);
    </script>
</body>
</html>`;
  }

  private _getFullTestHtml(webview: vscode.Webview, nonce: string): string {
    // This would test with actual coffee-shop data
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Full Interactive Diagram Test</title>
</head>
<body>
    <h1>🔍 Full Test</h1>
    <p>This would test the complete Interactive Diagram with real coffee-shop data.</p>
    
    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        vscode.postMessage({ type: 'ready' });
    </script>
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
