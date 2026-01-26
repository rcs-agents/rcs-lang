import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';

interface PreviewState {
  messages: Record<string, any>;
  flows: Record<string, any>;
  agent: any;
  selectedFlow?: string;
  compilationErrors?: string[];
  lastCompiled?: number;
}

interface ExtensionMessage {
  type: 'updateData' | 'cursorMove' | 'compile' | 'export' | 'cursorFollowingToggle';
  data: any;
}

interface WebviewMessage {
  type: 'ready' | 'selectFlow' | 'export' | 'error' | 'refresh' | 'toggleCursorFollowing';
  data: any;
}

export class RCLPreviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'rclPreview';
  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;
  private _currentDocument?: vscode.TextDocument;
  private _fileWatcher?: vscode.FileSystemWatcher;
  private _debounceTimer?: NodeJS.Timeout;
  private _cursorFollowingEnabled: boolean = false;
  private _state: PreviewState = {
    messages: {},
    flows: {},
    agent: {},
  };

  constructor(private readonly _extensionContext: vscode.ExtensionContext) {
    this._extensionUri = _extensionContext.extensionUri;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage((message: WebviewMessage) => {
      switch (message.type) {
        case 'ready':
          this._updateWebview();
          break;
        case 'selectFlow':
          this._state.selectedFlow = message.data.flowId;
          this._updateWebview();
          break;
        case 'refresh':
          this._compileCurrentDocument();
          break;
        case 'export':
          this._exportCompiled(message.data);
          break;
        case 'toggleCursorFollowing':
          this._cursorFollowingEnabled = message.data.enabled;
          if (this._cursorFollowingEnabled) {
            this._handleCursorMove();
          }
          break;
      }
    });

    // Set up file watching for active document
    this._setupFileWatching();
  }

  public async showPreview(document?: vscode.TextDocument) {
    if (document && document.languageId === 'rcl') {
      this._currentDocument = document;
      await this._compileCurrentDocument();
    }
  }

  private _setupFileWatching() {
    // Watch for active editor changes
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && editor.document.languageId === 'rcl') {
        this._currentDocument = editor.document;
        this._compileCurrentDocument();
        if (this._cursorFollowingEnabled) {
          this._handleCursorMove();
        }
      }
    });

    // Watch for cursor changes
    vscode.window.onDidChangeTextEditorSelection((event) => {
      if (this._cursorFollowingEnabled && event.textEditor.document === this._currentDocument) {
        this._handleCursorMove();
      }
    });

    // Watch for document changes with debouncing
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document === this._currentDocument) {
        this._debouncedCompile();
      }
    });

    // Set up file system watcher for saved changes
    this._fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.rcl');
    this._fileWatcher.onDidChange((uri) => {
      if (this._currentDocument && uri.fsPath === this._currentDocument.uri.fsPath) {
        this._compileCurrentDocument();
      }
    });
  }

  private _debouncedCompile() {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this._compileCurrentDocument();
    }, 300);
  }

  private async _compileCurrentDocument() {
    if (!this._currentDocument) {
      return;
    }

    try {
      const result = await this._compileRCLDocument(this._currentDocument);
      if (result.success && result.data) {
        this._state = {
          ...result.data,
          lastCompiled: Date.now(),
          compilationErrors: undefined,
        };
      } else {
        this._state.compilationErrors = result.errors || ['Unknown compilation error'];
      }
      this._updateWebview();
    } catch (error) {
      this._state.compilationErrors = [error instanceof Error ? error.message : String(error)];
      this._updateWebview();
    }
  }

  private async _compileRCLDocument(document: vscode.TextDocument): Promise<{
    success: boolean;
    data?: PreviewState;
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
      const tempPath = path.join(require('os').tmpdir(), `rcl-preview-${Date.now()}.rcl`);
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
        errors: [error instanceof Error ? error.message : String(error)],
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

  private _runRclCli(
    cliPath: string,
    inputPath: string,
    outputPath: string,
    format: string = 'json',
  ): Promise<{ success: boolean; error?: string }> {
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

  private _updateWebview() {
    if (this._view) {
      const message: ExtensionMessage = {
        type: 'updateData',
        data: this._state,
      };
      this._view.webview.postMessage(message);
    }
  }

  private _handleCursorMove() {
    if (!this._currentDocument || !vscode.window.activeTextEditor) {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    const position = editor.selection.active;
    const currentLine = position.line;
    const lineText = this._currentDocument.lineAt(currentLine).text;

    // Try to detect flow context from cursor position
    const flowId = this._detectFlowAtCursor(currentLine);

    if (flowId && flowId !== this._state.selectedFlow) {
      this._state.selectedFlow = flowId;
      const message: ExtensionMessage = {
        type: 'cursorMove',
        data: { flowId, line: currentLine, text: lineText },
      };
      if (this._view) {
        this._view.webview.postMessage(message);
      }
    }
  }

  private _detectFlowAtCursor(currentLine: number): string | null {
    if (!this._currentDocument) {
      return null;
    }

    const text = this._currentDocument.getText();
    const lines = text.split('\n');

    // Look backwards from cursor to find the most recent flow definition
    let currentFlowId: string | null = null;

    for (let i = currentLine; i >= 0; i--) {
      const line = lines[i].trim();

      // Check for flow definition
      const flowMatch = line.match(/^flow\s+([A-Za-z][A-Za-z0-9_]*)/);
      if (flowMatch) {
        currentFlowId = flowMatch[1];
        break;
      }

      // If we hit another section (agent, messages), stop looking
      if (line.startsWith('agent ') || line === 'messages') {
        break;
      }
    }

    // Verify this flow exists in our compiled flows
    if (currentFlowId && this._state.flows && this._state.flows[currentFlowId]) {
      return currentFlowId;
    }

    return null;
  }

  private async _exportCompiled(options: { format: string; path?: string }) {
    if (!this._currentDocument) {
      vscode.window.showErrorMessage('No RCL document is currently active');
      return;
    }

    try {
      const defaultPath = this._currentDocument.uri.fsPath.replace(
        '.rcl',
        options.format === 'js' ? '.js' : '.json',
      );

      const outputPath = options.path || defaultPath;

      const workspaceFolder = vscode.workspace.getWorkspaceFolder(this._currentDocument.uri);
      if (!workspaceFolder) {
        throw new Error('File must be within a workspace folder');
      }

      const cliPath = this._findRclCli(workspaceFolder.uri.fsPath);
      if (!cliPath) {
        throw new Error('RCL CLI tool not found');
      }

      const result = await this._runRclCli(
        cliPath,
        this._currentDocument.uri.fsPath,
        outputPath,
        options.format,
      );

      if (result.success) {
        vscode.window.showInformationMessage(
          `Exported compiled output to ${path.basename(outputPath)}`,
        );
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Export failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get URIs for resources
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'client', 'resources', 'preview.css'),
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'client', 'resources', 'preview.js'),
    );
    const mermaidUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'client', 'resources', 'mermaid.min.js'),
    );

    // Use a nonce to whitelist specific scripts for security
    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval'; font-src ${webview.cspSource};">
        <link href="${styleUri}" rel="stylesheet">
        <title>RCL Preview</title>
    </head>
    <body>
        <div id="root">
            <div class="toolbar">
                <div class="toolbar-left">
                    <button id="refreshBtn" class="toolbar-btn" title="Refresh">🔄</button>
                    <select id="flowSelect" class="flow-select">
                        <option value="">Select Flow...</option>
                    </select>
                    <button id="allFlowsBtn" class="toolbar-btn" title="Show All Flows">All Flows</button>
                    <button id="cursorFollowBtn" class="toolbar-btn" title="Follow Cursor">📍</button>
                </div>
                <div class="toolbar-right">
                    <button id="exportJsonBtn" class="toolbar-btn" title="Export JSON">📤 JSON</button>
                    <button id="exportJsBtn" class="toolbar-btn" title="Export JS">📤 JS</button>
                    <button id="settingsBtn" class="toolbar-btn" title="Settings">⚙️</button>
                </div>
            </div>
            
            <div class="content">
                <div class="view-container">
                    <div class="view-tabs">
                        <button id="jsonTab" class="tab-btn active">JSON Output</button>
                        <button id="flowTab" class="tab-btn">Flow Diagram</button>
                    </div>
                    
                    <div id="jsonView" class="view-content active">
                        <div id="jsonContainer" class="json-container">
                            <div class="loading">Loading...</div>
                        </div>
                    </div>
                    
                    <div id="flowView" class="view-content">
                        <div id="flowContainer" class="flow-container">
                            <div id="flowDiagram" class="flow-diagram"></div>
                            <div class="placeholder">Select a flow to view diagram...</div>
                        </div>
                    </div>
                    
                    <div id="errorView" class="error-view hidden">
                        <div class="error-content">
                            <h3>Compilation Errors</h3>
                            <div id="errorList" class="error-list"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script nonce="${nonce}" src="${mermaidUri}"></script>
        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }

  public dispose() {
    this._fileWatcher?.dispose();
    clearTimeout(this._debounceTimer);
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
