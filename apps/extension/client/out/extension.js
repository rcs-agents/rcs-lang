"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
const compilationService_1 = require("./compilationService");
const debugWebviewProvider_1 = require("./debugWebviewProvider");
const interactiveDiagramProvider_1 = require("./interactiveDiagramProvider");
const utils_1 = require("./utils");
let client;
let statusBarItem;
let compilationService;
function activate(context) {
    console.log('RCL Language Server extension is now active!');
    // Get build hash from environment or generate a default
    const buildHash = (0, utils_1.getBuildHash)();
    const version = (0, utils_1.getExtensionVersion)(context);
    // Create and show status bar item with version info
    statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 100);
    statusBarItem.text = `RCL ${version} (${buildHash})`;
    statusBarItem.tooltip = 'RCL Language Support version';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Create compilation service
    compilationService = new compilationService_1.CompilationService();
    context.subscriptions.push(compilationService);
    // Create providers
    const interactiveDiagramProvider = new interactiveDiagramProvider_1.InteractiveDiagramProvider(context);
    interactiveDiagramProvider.setCompilationService(compilationService);
    const debugWebviewProvider = new debugWebviewProvider_1.DebugWebviewProvider(context);
    // Setup cursor synchronization
    const cursorSyncDisposable = vscode_1.window.onDidChangeTextEditorSelection(async (e) => {
        // Only sync for RCL files
        if (e.textEditor.document.languageId !== 'rcl') {
            return;
        }
        // Check if diagram is open
        if (interactiveDiagramProvider.isOpen()) {
            const position = e.selections[0].active;
            await interactiveDiagramProvider.syncCursorPosition(e.textEditor.document, position);
        }
    });
    context.subscriptions.push(cursorSyncDisposable);
    // Register commands
    const showAgentOutputCommand = vscode_1.commands.registerCommand('rcl.showAgentOutput', async (uri) => {
        await showAgentOutput(uri);
    });
    context.subscriptions.push(showAgentOutputCommand);
    const showJSONOutputCommand = vscode_1.commands.registerCommand('rcl.showJSONOutput', async (uri) => {
        await showJSONOutput(uri);
    });
    context.subscriptions.push(showJSONOutputCommand);
    // Show preview command
    const showPreviewCommand = vscode_1.commands.registerCommand('rcl.showPreview', async (uri) => {
        await showPreview(uri);
    });
    context.subscriptions.push(showPreviewCommand);
    // Export compiled command
    const exportCompiledCommand = vscode_1.commands.registerCommand('rcl.exportCompiled', async (uri) => {
        await exportCompiled(uri);
    });
    context.subscriptions.push(exportCompiledCommand);
    const openInteractiveDiagramCommand = vscode_1.commands.registerCommand('rcl.openInteractiveDiagram', async (uri) => {
        await openInteractiveDiagram(uri, interactiveDiagramProvider);
    });
    context.subscriptions.push(openInteractiveDiagramCommand);
    // Debug webview commands
    const debugWebviewMinimalCommand = vscode_1.commands.registerCommand('rcl.debugWebviewMinimal', async () => {
        await debugWebviewProvider.openDebugWebview('minimal');
    });
    context.subscriptions.push(debugWebviewMinimalCommand);
    const debugWebviewResourcesCommand = vscode_1.commands.registerCommand('rcl.debugWebviewResources', async () => {
        await debugWebviewProvider.openDebugWebview('resources');
    });
    context.subscriptions.push(debugWebviewResourcesCommand);
    const debugWebviewSprottyCommand = vscode_1.commands.registerCommand('rcl.debugWebviewSprotty', async () => {
        await debugWebviewProvider.openDebugWebview('sprotty');
    });
    context.subscriptions.push(debugWebviewSprottyCommand);
    const debugWebviewFullCommand = vscode_1.commands.registerCommand('rcl.debugWebviewFull', async () => {
        await debugWebviewProvider.openDebugWebview('full');
    });
    context.subscriptions.push(debugWebviewFullCommand);
    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            // Debug options for the server
            options: {
                execArgv: ['--nolazy', '--inspect=6009'],
            },
        },
    };
    // Options to control the language client
    const clientOptions = {
        // Register the server for RCL documents
        documentSelector: [
            { scheme: 'file', language: 'rcl' },
            { scheme: 'untitled', language: 'rcl' },
        ],
        synchronize: {
            // Notify the server about file changes to RCL files contained in the workspace
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/*.rcl'),
        },
        // Use the workspace configuration section 'rcl'
        initializationOptions: {
            settings: vscode_1.workspace.getConfiguration('rcl'),
        },
    };
    // Create the language client and start the client
    client = new node_1.LanguageClient('rclLanguageServer', 'RCL Language Server', serverOptions, clientOptions);
    // Start the client. This will also launch the server
    client
        .start()
        .then(() => {
        console.log('RCL Language Server started successfully');
    })
        .catch((error) => {
        console.error('Failed to start RCL Language Server:', error);
        vscode_1.window.showErrorMessage(`Failed to start RCL Language Server: ${error.message}`);
    });
}
function deactivate() {
    if (!client) {
        return undefined;
    }
    console.log('Deactivating RCL Language Server extension');
    return client.stop();
}
async function showJSONOutput(uri) {
    let targetUri;
    if (uri) {
        targetUri = uri;
    }
    else {
        const activeEditor = vscode_1.window.activeTextEditor;
        if (!activeEditor) {
            vscode_1.window.showErrorMessage('No RCL file is currently open');
            return;
        }
        targetUri = activeEditor.document.uri;
    }
    if (!targetUri.fsPath.endsWith('.rcl')) {
        vscode_1.window.showErrorMessage('Please select an RCL file');
        return;
    }
    try {
        await vscode_1.window.withProgress({
            location: { viewId: 'workbench.view.explorer' },
            title: 'Compiling RCL to JSON...',
            cancellable: false,
        }, async () => {
            // Compile using language service
            const result = await compilationService.compileFile(targetUri);
            if (result.success && result.data) {
                const rclFilePath = targetUri.fsPath;
                const outputPath = rclFilePath.replace('.rcl', '.json');
                // Write JSON file
                await fs.promises.writeFile(outputPath, JSON.stringify(result.data, null, 2), 'utf-8');
                // Open the generated file
                const outputUri = vscode_1.Uri.file(outputPath);
                const document = await vscode_1.workspace.openTextDocument(outputUri);
                await vscode_1.window.showTextDocument(document, vscode_1.ViewColumn.Beside);
                vscode_1.window.showInformationMessage(`JSON output generated successfully: ${path.basename(outputPath)}`);
            }
            else {
                const errors = result.diagnostics.filter((d) => d.severity === 'error');
                vscode_1.window.showErrorMessage(`Failed to compile RCL file: ${errors[0]?.message || 'Unknown error'}`);
            }
        });
    }
    catch (error) {
        vscode_1.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function openInteractiveDiagram(uri, diagramProvider) {
    let targetUri;
    if (uri) {
        targetUri = uri;
    }
    else {
        const activeEditor = vscode_1.window.activeTextEditor;
        if (!activeEditor) {
            vscode_1.window.showErrorMessage('No RCL file is currently open');
            return;
        }
        targetUri = activeEditor.document.uri;
    }
    if (!targetUri.fsPath.endsWith('.rcl')) {
        vscode_1.window.showErrorMessage('Please select an RCL file');
        return;
    }
    try {
        const document = await vscode_1.workspace.openTextDocument(targetUri);
        if (diagramProvider) {
            await diagramProvider.openInteractiveDiagram(document);
        }
        vscode_1.window.showInformationMessage('Interactive diagram opened');
    }
    catch (error) {
        vscode_1.window.showErrorMessage(`Failed to open interactive diagram: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function showAgentOutput(uri) {
    let targetUri;
    if (uri) {
        targetUri = uri;
    }
    else {
        const activeEditor = vscode_1.window.activeTextEditor;
        if (!activeEditor) {
            vscode_1.window.showErrorMessage('No RCL file is currently open');
            return;
        }
        targetUri = activeEditor.document.uri;
    }
    if (!targetUri.fsPath.endsWith('.rcl')) {
        vscode_1.window.showErrorMessage('Please select an RCL file');
        return;
    }
    try {
        // Show progress indicator
        await vscode_1.window.withProgress({
            location: { viewId: 'workbench.view.explorer' },
            title: 'Compiling RCL agent...',
            cancellable: false,
        }, async () => {
            // Compile using language service
            const result = await compilationService.compileFile(targetUri);
            if (result.success && result.data) {
                const rclFilePath = targetUri.fsPath;
                const outputPath = rclFilePath.replace('.rcl', '.js');
                const baseName = path.basename(outputPath, '.js');
                // Generate JavaScript content
                const jsContent = generateJavaScript(result.data, baseName);
                await fs.promises.writeFile(outputPath, jsContent, 'utf-8');
                // Also write JSON file
                const jsonPath = outputPath.replace('.js', '.json');
                await fs.promises.writeFile(jsonPath, JSON.stringify(result.data, null, 2), 'utf-8');
                // Open the generated file
                const outputUri = vscode_1.Uri.file(outputPath);
                const document = await vscode_1.workspace.openTextDocument(outputUri);
                await vscode_1.window.showTextDocument(document, vscode_1.ViewColumn.Beside);
                vscode_1.window.showInformationMessage(`Agent output generated successfully: ${path.basename(outputPath)}`);
            }
            else {
                const errors = result.diagnostics.filter((d) => d.severity === 'error');
                vscode_1.window.showErrorMessage(`Failed to compile RCL file: ${errors[0]?.message || 'Unknown error'}`);
            }
        });
    }
    catch (error) {
        vscode_1.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
function generateJavaScript(_data, baseName) {
    return `// Generated by RCL Extension
// This file contains the compiled output from your RCL agent definition

import agentData from './${baseName}.json' assert { type: 'json' };

/**
 * Messages dictionary - Maps message IDs to normalized AgentMessage objects
 */
export const messages = agentData.messages;

/**
 * Flow configurations - XState machine definitions for each flow
 */
export const flows = agentData.flows;

/**
 * Agent configuration
 */
export const agent = agentData.agent;

/**
 * Get a message by ID
 */
export function getMessage(messageId) {
  return messages[messageId] || null;
}

/**
 * Get a flow configuration by ID
 */
export function getFlow(flowId) {
  return flows[flowId] || null;
}

export default {
  messages,
  flows,
  agent,
  getMessage,
  getFlow
};
`;
}
async function showPreview(uri) {
    let targetUri;
    if (uri) {
        targetUri = uri;
    }
    else {
        const activeEditor = vscode_1.window.activeTextEditor;
        if (!activeEditor) {
            vscode_1.window.showErrorMessage('No RCL file is currently open');
            return;
        }
        targetUri = activeEditor.document.uri;
    }
    if (!targetUri.fsPath.endsWith('.rcl')) {
        vscode_1.window.showErrorMessage('Please select an RCL file');
        return;
    }
    try {
        const document = await vscode_1.workspace.openTextDocument(targetUri);
        const content = document.getText();
        // Create a simple preview panel
        const panel = vscode_1.window.createWebviewPanel('rclPreview', `RCL Preview: ${path.basename(targetUri.fsPath)}`, vscode_1.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        panel.webview.html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>RCL Preview</title>
          <style>
            body { font-family: monospace; padding: 16px; }
            pre { background: #f5f5f5; padding: 12px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h2>RCL Preview</h2>
          <pre>${content}</pre>
        </body>
      </html>
    `;
        vscode_1.window.showInformationMessage('RCL preview opened');
    }
    catch (error) {
        vscode_1.window.showErrorMessage(`Failed to show preview: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function exportCompiled(uri) {
    let targetUri;
    if (uri) {
        targetUri = uri;
    }
    else {
        const activeEditor = vscode_1.window.activeTextEditor;
        if (!activeEditor) {
            vscode_1.window.showErrorMessage('No RCL file is currently open');
            return;
        }
        targetUri = activeEditor.document.uri;
    }
    if (!targetUri.fsPath.endsWith('.rcl')) {
        vscode_1.window.showErrorMessage('Please select an RCL file');
        return;
    }
    try {
        // Use compilation service to compile the file
        const result = await compilationService.compileFile(targetUri);
        if (result.success && result.data) {
            // Generate output filename
            const outputPath = targetUri.fsPath.replace('.rcl', '.json');
            // Write compiled output to file
            fs.writeFileSync(outputPath, JSON.stringify(result.data, null, 2));
            vscode_1.window.showInformationMessage(`Compiled output exported to: ${outputPath}`);
        }
        else {
            const errors = result.diagnostics?.filter((d) => d.severity === 'error') || [];
            vscode_1.window.showErrorMessage(`Failed to compile RCL file: ${errors[0]?.message || 'Unknown error'}`);
        }
    }
    catch (error) {
        vscode_1.window.showErrorMessage(`Failed to export compiled output: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=extension.js.map