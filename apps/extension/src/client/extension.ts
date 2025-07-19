import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  type ExtensionContext,
  ProgressLocation,
  StatusBarAlignment,
  type StatusBarItem,
  Uri,
  ViewColumn,
  commands,
  window,
  workspace,
} from 'vscode';
import {
  LanguageClient,
  type LanguageClientOptions,
  type ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';
import { CompilationService } from './compilationService';
import { DebugWebviewProvider } from './debugWebviewProvider';
import { InteractiveDiagramProvider } from './interactiveDiagramProvider';
import { getBuildHash, getExtensionVersion } from './utils';

let client: LanguageClient;
let statusBarItem: StatusBarItem;
let compilationService: CompilationService;

export function activate(context: ExtensionContext) {
  console.log('RCL Language Server extension is now active!');

  // Get build hash from environment or generate a default
  const buildHash = getBuildHash();
  const version = getExtensionVersion(context);

  // Create and show status bar item with version info
  statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
  statusBarItem.text = `RCL ${version} (${buildHash})`;
  statusBarItem.tooltip = 'RCL Language Support version';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Create compilation service
  compilationService = new CompilationService();
  context.subscriptions.push(compilationService);

  // Create providers
  const interactiveDiagramProvider = new InteractiveDiagramProvider(context);
  interactiveDiagramProvider.setCompilationService(compilationService);
  const debugWebviewProvider = new DebugWebviewProvider(context);

  // Setup cursor synchronization
  const cursorSyncDisposable = window.onDidChangeTextEditorSelection(async (e) => {
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
  const showAgentOutputCommand = commands.registerCommand(
    'rcl.showAgentOutput',
    async (uri?: Uri) => {
      await showAgentOutput(uri);
    },
  );
  context.subscriptions.push(showAgentOutputCommand);

  const showJSONOutputCommand = commands.registerCommand(
    'rcl.showJSONOutput',
    async (uri?: Uri) => {
      await showJSONOutput(uri);
    },
  );
  context.subscriptions.push(showJSONOutputCommand);

  // Show preview command
  const showPreviewCommand = commands.registerCommand('rcl.showPreview', async (uri?: Uri) => {
    await showPreview(uri);
  });
  context.subscriptions.push(showPreviewCommand);

  // Export compiled command
  const exportCompiledCommand = commands.registerCommand(
    'rcl.exportCompiled',
    async (uri?: Uri) => {
      await exportCompiled(uri);
    },
  );
  context.subscriptions.push(exportCompiledCommand);

  const openInteractiveDiagramCommand = commands.registerCommand(
    'rcl.openInteractiveDiagram',
    async (uri?: Uri) => {
      await openInteractiveDiagram(uri, interactiveDiagramProvider);
    },
  );
  context.subscriptions.push(openInteractiveDiagramCommand);

  // Debug webview commands
  const debugWebviewMinimalCommand = commands.registerCommand(
    'rcl.debugWebviewMinimal',
    async () => {
      await debugWebviewProvider.openDebugWebview('minimal');
    },
  );
  context.subscriptions.push(debugWebviewMinimalCommand);

  const debugWebviewResourcesCommand = commands.registerCommand(
    'rcl.debugWebviewResources',
    async () => {
      await debugWebviewProvider.openDebugWebview('resources');
    },
  );
  context.subscriptions.push(debugWebviewResourcesCommand);

  const debugWebviewSprottyCommand = commands.registerCommand(
    'rcl.debugWebviewSprotty',
    async () => {
      await debugWebviewProvider.openDebugWebview('sprotty');
    },
  );
  context.subscriptions.push(debugWebviewSprottyCommand);

  const debugWebviewFullCommand = commands.registerCommand('rcl.debugWebviewFull', async () => {
    await debugWebviewProvider.openDebugWebview('full');
  });
  context.subscriptions.push(debugWebviewFullCommand);

  // The server is implemented in node
  const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      // Debug options for the server
      options: {
        execArgv: ['--nolazy', '--inspect=6009'],
      },
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for RCL documents
    documentSelector: [
      { scheme: 'file', language: 'rcl' },
      { scheme: 'untitled', language: 'rcl' },
    ],
    synchronize: {
      // Notify the server about file changes to RCL files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/*.rcl'),
    },
    // Use the workspace configuration section 'rcl'
    initializationOptions: {
      settings: workspace.getConfiguration('rcl'),
    },
  };

  // Create the language client and start the client
  client = new LanguageClient(
    'rclLanguageServer',
    'RCL Language Server',
    serverOptions,
    clientOptions,
  );

  // Start the client. This will also launch the server
  client
    .start()
    .then(() => {
      console.log('RCL Language Server started successfully');
    })
    .catch((error) => {
      console.error('Failed to start RCL Language Server:', error);
      window.showErrorMessage(`Failed to start RCL Language Server: ${error.message}`);
    });
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  console.log('Deactivating RCL Language Server extension');
  return client.stop();
}

async function showJSONOutput(uri?: Uri): Promise<void> {
  let targetUri: Uri;

  if (uri) {
    targetUri = uri;
  } else {
    const activeEditor = window.activeTextEditor;
    if (!activeEditor) {
      window.showErrorMessage('No RCL file is currently open');
      return;
    }
    targetUri = activeEditor.document.uri;
  }

  if (!targetUri.fsPath.endsWith('.rcl')) {
    window.showErrorMessage('Please select an RCL file');
    return;
  }

  try {
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: 'Compiling RCL to JSON...',
        cancellable: false,
      },
      async () => {
        // Compile using language service
        const result = await compilationService.compileFile(targetUri);

        if (result.success && result.data) {
          const rclFilePath = targetUri.fsPath;
          const outputPath = rclFilePath.replace('.rcl', '.json');

          // Write JSON file
          await fs.promises.writeFile(outputPath, JSON.stringify(result.data, null, 2), 'utf-8');

          // Open the generated file
          const outputUri = Uri.file(outputPath);
          const document = await workspace.openTextDocument(outputUri);
          await window.showTextDocument(document, ViewColumn.Beside);

          window.showInformationMessage(
            `JSON output generated successfully: ${path.basename(outputPath)}`,
          );
        } else {
          const errors = result.diagnostics.filter((d) => d.severity === 'error');
          window.showErrorMessage(
            `Failed to compile RCL file: ${errors[0]?.message || 'Unknown error'}`,
          );
        }
      },
    );
  } catch (error) {
    window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function openInteractiveDiagram(uri?: Uri, diagramProvider?: any): Promise<void> {
  let targetUri: Uri;

  if (uri) {
    targetUri = uri;
  } else {
    const activeEditor = window.activeTextEditor;
    if (!activeEditor) {
      window.showErrorMessage('No RCL file is currently open');
      return;
    }
    targetUri = activeEditor.document.uri;
  }

  if (!targetUri.fsPath.endsWith('.rcl')) {
    window.showErrorMessage('Please select an RCL file');
    return;
  }

  try {
    const document = await workspace.openTextDocument(targetUri);
    if (diagramProvider) {
      await diagramProvider.openInteractiveDiagram(document);
    }

    window.showInformationMessage('Interactive diagram opened');
  } catch (error) {
    window.showErrorMessage(
      `Failed to open interactive diagram: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function showAgentOutput(uri?: Uri): Promise<void> {
  let targetUri: Uri;

  if (uri) {
    targetUri = uri;
  } else {
    const activeEditor = window.activeTextEditor;
    if (!activeEditor) {
      window.showErrorMessage('No RCL file is currently open');
      return;
    }
    targetUri = activeEditor.document.uri;
  }

  if (!targetUri.fsPath.endsWith('.rcl')) {
    window.showErrorMessage('Please select an RCL file');
    return;
  }

  try {
    // Show progress indicator
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: 'Compiling RCL agent...',
        cancellable: false,
      },
      async () => {
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
          const outputUri = Uri.file(outputPath);
          const document = await workspace.openTextDocument(outputUri);
          await window.showTextDocument(document, ViewColumn.Beside);

          window.showInformationMessage(
            `Agent output generated successfully: ${path.basename(outputPath)}`,
          );
        } else {
          const errors = result.diagnostics.filter((d) => d.severity === 'error');
          window.showErrorMessage(
            `Failed to compile RCL file: ${errors[0]?.message || 'Unknown error'}`,
          );
        }
      },
    );
  } catch (error) {
    window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function generateJavaScript(_data: any, baseName: string): string {
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

async function showPreview(uri?: Uri): Promise<void> {
  let targetUri: Uri;

  if (uri) {
    targetUri = uri;
  } else {
    const activeEditor = window.activeTextEditor;
    if (!activeEditor) {
      window.showErrorMessage('No RCL file is currently open');
      return;
    }
    targetUri = activeEditor.document.uri;
  }

  if (!targetUri.fsPath.endsWith('.rcl')) {
    window.showErrorMessage('Please select an RCL file');
    return;
  }

  try {
    const document = await workspace.openTextDocument(targetUri);
    const content = document.getText();

    // Create a simple preview panel
    const panel = window.createWebviewPanel(
      'rclPreview',
      `RCL Preview: ${path.basename(targetUri.fsPath)}`,
      ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    );

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

    window.showInformationMessage('RCL preview opened');
  } catch (error) {
    window.showErrorMessage(
      `Failed to show preview: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function exportCompiled(uri?: Uri): Promise<void> {
  let targetUri: Uri;

  if (uri) {
    targetUri = uri;
  } else {
    const activeEditor = window.activeTextEditor;
    if (!activeEditor) {
      window.showErrorMessage('No RCL file is currently open');
      return;
    }
    targetUri = activeEditor.document.uri;
  }

  if (!targetUri.fsPath.endsWith('.rcl')) {
    window.showErrorMessage('Please select an RCL file');
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

      window.showInformationMessage(`Compiled output exported to: ${outputPath}`);
    } else {
      const errors = result.diagnostics?.filter((d) => d.severity === 'error') || [];
      window.showErrorMessage(
        `Failed to compile RCL file: ${errors[0]?.message || 'Unknown error'}`,
      );
    }
  } catch (error) {
    window.showErrorMessage(
      `Failed to export compiled output: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
