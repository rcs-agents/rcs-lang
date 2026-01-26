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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const cp = __importStar(require("child_process"));
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
const previewProvider_1 = require("./previewProvider");
const interactiveDiagramProvider_1 = require("./interactiveDiagramProvider");
let client;
function activate(context) {
    console.log('RCL Language Server extension is now active!');
    // Create preview provider
    const previewProvider = new previewProvider_1.RCLPreviewProvider(context);
    const interactiveDiagramProvider = new interactiveDiagramProvider_1.InteractiveDiagramProvider(context);
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
                execArgv: ['--nolazy', '--inspect=6009']
            }
        }
    };
    // Options to control the language client
    const clientOptions = {
        // Register the server for RCL documents
        documentSelector: [
            { scheme: 'file', language: 'rcl' },
            { scheme: 'untitled', language: 'rcl' }
        ],
        synchronize: {
            // Notify the server about file changes to RCL files contained in the workspace
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/*.rcl')
        },
        // Use the workspace configuration section 'rcl'
        initializationOptions: {
            settings: vscode_1.workspace.getConfiguration('rcl')
        }
    };
    // Create the language client and start the client
    client = new node_1.LanguageClient('rclLanguageServer', 'RCL Language Server', serverOptions, clientOptions);
    // Start the client. This will also launch the server
    client.start().then(() => {
        console.log('RCL Language Server started successfully');
    }).catch((error) => {
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
        // The webview view should automatically appear when the provider is activated
        vscode_1.window.showInformationMessage('RCL Preview opened');
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
    const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(targetUri);
    if (!workspaceFolder) {
        vscode_1.window.showErrorMessage('File must be within a workspace folder');
        return;
    }
    try {
        const cliPath = findRclCli(workspaceFolder.uri.fsPath);
        if (!cliPath) {
            vscode_1.window.showErrorMessage('RCL CLI tool not found. Please ensure the RCL CLI is installed.');
            return;
        }
        await vscode_1.window.withProgress({
            location: { viewId: 'workbench.view.explorer' },
            title: 'Compiling RCL to JSON...',
            cancellable: false
        }, async () => {
            const rclFilePath = targetUri.fsPath;
            const outputPath = rclFilePath.replace('.rcl', '.json');
            const result = await runRclCli(cliPath, rclFilePath, outputPath, 'json');
            if (result.success) {
                const outputUri = vscode_1.Uri.file(outputPath);
                const document = await vscode_1.workspace.openTextDocument(outputUri);
                await vscode_1.window.showTextDocument(document, vscode_1.ViewColumn.Beside);
                vscode_1.window.showInformationMessage(`JSON output generated successfully: ${path.basename(outputPath)}`);
            }
            else {
                vscode_1.window.showErrorMessage(`Failed to compile RCL file: ${result.error}`);
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
        { label: 'JSON (.json)', value: 'json' }
    ], { placeHolder: 'Select export format' });
    if (!format) {
        return; // User cancelled
    }
    const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(targetUri);
    if (!workspaceFolder) {
        vscode_1.window.showErrorMessage('File must be within a workspace folder');
        return;
    }
    try {
        const cliPath = findRclCli(workspaceFolder.uri.fsPath);
        if (!cliPath) {
            vscode_1.window.showErrorMessage('RCL CLI tool not found. Please ensure the RCL CLI is installed.');
            return;
        }
        const rclFilePath = targetUri.fsPath;
        const extension = format.value === 'js' ? '.js' : '.json';
        const outputPath = rclFilePath.replace('.rcl', extension);
        const result = await runRclCli(cliPath, rclFilePath, outputPath, format.value);
        if (result.success) {
            vscode_1.window.showInformationMessage(`Compiled output exported successfully: ${path.basename(outputPath)}`);
        }
        else {
            vscode_1.window.showErrorMessage(`Failed to export compiled output: ${result.error}`);
        }
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
    const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(targetUri);
    if (!workspaceFolder) {
        vscode_1.window.showErrorMessage('File must be within a workspace folder');
        return;
    }
    try {
        // Find the CLI demo tool
        const cliPath = findRclCli(workspaceFolder.uri.fsPath);
        if (!cliPath) {
            vscode_1.window.showErrorMessage('RCL CLI tool not found. Please ensure the RCL CLI is installed.');
            return;
        }
        // Show progress indicator
        await vscode_1.window.withProgress({
            location: { viewId: 'workbench.view.explorer' },
            title: 'Compiling RCL agent...',
            cancellable: false
        }, async () => {
            const rclFilePath = targetUri.fsPath;
            const outputPath = rclFilePath.replace('.rcl', '.js');
            // Run the CLI tool
            const result = await runRclCli(cliPath, rclFilePath, outputPath);
            if (result.success) {
                // Open the generated file
                const outputUri = vscode_1.Uri.file(outputPath);
                const document = await vscode_1.workspace.openTextDocument(outputUri);
                await vscode_1.window.showTextDocument(document, vscode_1.ViewColumn.Beside);
                vscode_1.window.showInformationMessage(`Agent output generated successfully: ${path.basename(outputPath)}`);
            }
            else {
                vscode_1.window.showErrorMessage(`Failed to compile RCL file: ${result.error}`);
            }
        });
    }
    catch (error) {
        vscode_1.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
function findRclCli(workspacePath) {
    // Look for the CLI tool in common locations
    const possiblePaths = [
        // New monorepo structure
        path.join(workspacePath, 'packages', 'cli', 'demo.js'),
        path.join(workspacePath, '..', 'packages', 'cli', 'demo.js'),
        path.join(workspacePath, '..', '..', 'packages', 'cli', 'demo.js'),
        // Legacy paths for backwards compatibility
        path.join(workspacePath, 'cli', 'demo.js'),
        path.join(workspacePath, 'node_modules', '.bin', 'rcl-cli'),
        path.join(workspacePath, 'node_modules', 'rcl-cli', 'cli', 'demo.js'),
        // Look in parent directories for mono-repo setups
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
function runRclCli(cliPath, inputPath, outputPath, format = 'js') {
    return new Promise((resolve) => {
        const command = `node "${cliPath}" "${inputPath}" -o "${outputPath}" --format ${format}`;
        cp.exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, error: error.message });
            }
            else if (stderr) {
                resolve({ success: false, error: stderr });
            }
            else {
                resolve({ success: true });
            }
        });
    });
}
//# sourceMappingURL=extension.js.map