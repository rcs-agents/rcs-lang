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
const path = __importStar(require("node:path"));
const fs = __importStar(require("node:fs"));
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
const previewProvider_1 = require("./previewProvider");
const previewPanelProvider_1 = require("./previewPanelProvider");
const interactiveDiagramProvider_1 = require("./interactiveDiagramProvider");
const compilationService_1 = require("./compilationService");
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
    // Create preview provider
    const previewProvider = new previewProvider_1.RCLPreviewProvider(context, compilationService);
    const interactiveDiagramProvider = new interactiveDiagramProvider_1.InteractiveDiagramProvider(context);
    interactiveDiagramProvider.setCompilationService(compilationService);
    // Register webview view provider
    context.subscriptions.push(vscode_1.window.registerWebviewViewProvider(previewProvider_1.RCLPreviewProvider.viewType, previewProvider));
    // Register commands
    const showAgentOutputCommand = vscode_1.commands.registerCommand('rcl.showAgentOutput', async (uri) => {
        await showAgentOutput(uri);
    });
    context.subscriptions.push(showAgentOutputCommand);
    const showPreviewCommand = vscode_1.commands.registerCommand('rcl.showPreview', async (uri) => {
        await showPreview(uri, previewProvider);
    });
    context.subscriptions.push(showPreviewCommand);
    const showPreviewPanelCommand = vscode_1.commands.registerCommand('rcl.showPreviewPanel', async (uri) => {
        await showPreviewInPanel(context, uri);
    });
    context.subscriptions.push(showPreviewPanelCommand);
    const showJSONOutputCommand = vscode_1.commands.registerCommand('rcl.showJSONOutput', async (uri) => {
        await showJSONOutput(uri);
    });
    context.subscriptions.push(showJSONOutputCommand);
    const exportCompiledCommand = vscode_1.commands.registerCommand('rcl.exportCompiled', async (uri) => {
        await exportCompiled(uri);
    });
    context.subscriptions.push(exportCompiledCommand);
    const openInteractiveDiagramCommand = vscode_1.commands.registerCommand('rcl.openInteractiveDiagram', async (uri) => {
        await openInteractiveDiagram(uri, interactiveDiagramProvider);
    });
    context.subscriptions.push(openInteractiveDiagramCommand);
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
        vscode_1.window.showErrorMessage('Failed to start RCL Language Server: ' + error.message);
    });
}
function deactivate() {
    if (!client) {
        return undefined;
    }
    console.log('Deactivating RCL Language Server extension');
    return client.stop();
}
async function showPreview(uri, previewProvider) {
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
        if (previewProvider) {
            await previewProvider.showPreview(document);
        }
        // Focus on the Explorer view and reveal the preview
        await vscode_1.commands.executeCommand('workbench.view.explorer');
        // Try to reveal/focus the RCL Preview view
        try {
            await vscode_1.commands.executeCommand('rclPreview.focus');
        }
        catch {
            // Ignore if view cannot be focused
        }
        vscode_1.window.showInformationMessage('RCL Preview opened in Explorer sidebar');
    }
    catch (error) {
        vscode_1.window.showErrorMessage(`Failed to open preview: ${error instanceof Error ? error.message : String(error)}`);
    }
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
                const errors = result.diagnostics.filter(d => d.severity === 'error');
                vscode_1.window.showErrorMessage(`Failed to compile RCL file: ${errors[0]?.message || 'Unknown error'}`);
            }
        });
    }
    catch (error) {
        vscode_1.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
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
    // Ask user for format preference
    const format = await vscode_1.window.showQuickPick([
        { label: 'JavaScript (.js)', value: 'js' },
        { label: 'JSON (.json)', value: 'json' },
    ], { placeHolder: 'Select export format' });
    if (!format) {
        return; // User cancelled
    }
    try {
        await vscode_1.window.withProgress({
            location: { viewId: 'workbench.view.explorer' },
            title: `Exporting RCL to ${format.value.toUpperCase()}...`,
            cancellable: false,
        }, async () => {
            // Compile using language service
            const result = await compilationService.compileFile(targetUri);
            if (result.success && result.data) {
                const rclFilePath = targetUri.fsPath;
                const baseName = path.basename(rclFilePath, '.rcl');
                if (format.value === 'json') {
                    const outputPath = rclFilePath.replace('.rcl', '.json');
                    await fs.promises.writeFile(outputPath, JSON.stringify(result.data, null, 2), 'utf-8');
                    vscode_1.window.showInformationMessage(`JSON output exported successfully: ${path.basename(outputPath)}`);
                }
                else {
                    // JavaScript format - write both JS and JSON
                    const jsPath = rclFilePath.replace('.rcl', '.js');
                    const jsonPath = rclFilePath.replace('.rcl', '.json');
                    // Generate JavaScript content
                    const jsContent = generateJavaScript(result.data, baseName);
                    await fs.promises.writeFile(jsPath, jsContent, 'utf-8');
                    // Also write JSON file
                    await fs.promises.writeFile(jsonPath, JSON.stringify(result.data, null, 2), 'utf-8');
                    vscode_1.window.showInformationMessage(`JavaScript output exported successfully: ${path.basename(jsPath)}`);
                }
            }
            else {
                const errors = result.diagnostics.filter(d => d.severity === 'error');
                vscode_1.window.showErrorMessage(`Failed to compile RCL file: ${errors[0]?.message || 'Unknown error'}`);
            }
        });
    }
    catch (error) {
        vscode_1.window.showErrorMessage(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
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
                const errors = result.diagnostics.filter(d => d.severity === 'error');
                vscode_1.window.showErrorMessage(`Failed to compile RCL file: ${errors[0]?.message || 'Unknown error'}`);
            }
        });
    }
    catch (error) {
        vscode_1.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
function generateJavaScript(data, baseName) {
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
async function showPreviewInPanel(context, uri) {
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
        // Create or show webview panel
        const panel = vscode_1.window.createWebviewPanel('rclPreviewPanel', `RCL Preview - ${path.basename(targetUri.fsPath)}`, vscode_1.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [context.extensionUri],
            retainContextWhenHidden: true
        });
        // Create a preview provider instance for this panel
        const panelPreviewProvider = new previewPanelProvider_1.RCLPreviewPanelProvider(context, panel);
        await panelPreviewProvider.showPreview(document);
        vscode_1.window.showInformationMessage('RCL Preview opened in new panel');
    }
    catch (error) {
        vscode_1.window.showErrorMessage(`Failed to open preview panel: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=extension.js.map