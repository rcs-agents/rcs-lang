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
let client;
function activate(context) {
    console.log('RCL Language Server extension is now active!');
    // Register the Show Agent Output command
    const showAgentOutputCommand = vscode_1.commands.registerCommand('rcl.showAgentOutput', async (uri) => {
        await showAgentOutput(uri);
    });
    context.subscriptions.push(showAgentOutputCommand);
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
function runRclCli(cliPath, inputPath, outputPath) {
    return new Promise((resolve) => {
        const command = `node "${cliPath}" "${inputPath}" -o "${outputPath}"`;
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