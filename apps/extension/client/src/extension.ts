import * as path from 'node:path';
import * as fs from 'node:fs';
import * as cp from 'node:child_process';
import { workspace, ExtensionContext, window, commands, Uri, ViewColumn, StatusBarAlignment, StatusBarItem } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';
import { RCLPreviewProvider } from './previewProvider';
import { RCLPreviewPanelProvider } from './previewPanelProvider';
import { InteractiveDiagramProvider } from './interactiveDiagramProvider';
import { CompilationService } from './compilationService';

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

  // Create preview provider
  const previewProvider = new RCLPreviewProvider(context, compilationService);
  const interactiveDiagramProvider = new InteractiveDiagramProvider(context);

  // Register webview view provider
  context.subscriptions.push(
    window.registerWebviewViewProvider(RCLPreviewProvider.viewType, previewProvider),
  );

  // Register commands
  const showAgentOutputCommand = commands.registerCommand(
    'rcl.showAgentOutput',
    async (uri?: Uri) => {
      await showAgentOutput(uri);
    },
  );
  context.subscriptions.push(showAgentOutputCommand);

  const showPreviewCommand = commands.registerCommand('rcl.showPreview', async (uri?: Uri) => {
    await showPreview(uri, previewProvider);
  });
  context.subscriptions.push(showPreviewCommand);

  const showPreviewPanelCommand = commands.registerCommand('rcl.showPreviewPanel', async (uri?: Uri) => {
    await showPreviewInPanel(context, uri);
  });
  context.subscriptions.push(showPreviewPanelCommand);

  const showJSONOutputCommand = commands.registerCommand(
    'rcl.showJSONOutput',
    async (uri?: Uri) => {
      await showJSONOutput(uri);
    },
  );
  context.subscriptions.push(showJSONOutputCommand);

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
      window.showErrorMessage('Failed to start RCL Language Server: ' + error.message);
    });
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  console.log('Deactivating RCL Language Server extension');
  return client.stop();
}

async function showPreview(uri?: Uri, previewProvider?: RCLPreviewProvider): Promise<void> {
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
    if (previewProvider) {
      await previewProvider.showPreview(document);
    }

    // Focus on the Explorer view and reveal the preview
    await commands.executeCommand('workbench.view.explorer');
    
    // Try to reveal/focus the RCL Preview view
    try {
      await commands.executeCommand('rclPreview.focus');
    } catch {
      // If the command doesn't exist, try to reveal the view
      try {
        await commands.executeCommand('workbench.view.extension.rclPreview');
      } catch {
        // Ignore if view cannot be focused
      }
    }

    window.showInformationMessage('RCL Preview opened in Explorer sidebar');
  } catch (error) {
    window.showErrorMessage(
      `Failed to open preview: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
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
        location: { viewId: 'workbench.view.explorer' },
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
          const errors = result.diagnostics.filter(d => d.severity === 'error');
          window.showErrorMessage(`Failed to compile RCL file: ${errors[0]?.message || 'Unknown error'}`);
        }
      },
    );
  } catch (error) {
    window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
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

  // Ask user for format preference
  const format = await window.showQuickPick(
    [
      { label: 'JavaScript (.js)', value: 'js' },
      { label: 'JSON (.json)', value: 'json' },
    ],
    { placeHolder: 'Select export format' },
  );

  if (!format) {
    return; // User cancelled
  }

  try {
    await window.withProgress(
      {
        location: { viewId: 'workbench.view.explorer' },
        title: `Exporting RCL to ${format.value.toUpperCase()}...`,
        cancellable: false,
      },
      async () => {
        // Compile using language service
        const result = await compilationService.compileFile(targetUri);

        if (result.success && result.data) {
          const rclFilePath = targetUri.fsPath;
          const baseName = path.basename(rclFilePath, '.rcl');
          
          if (format.value === 'json') {
            const outputPath = rclFilePath.replace('.rcl', '.json');
            await fs.promises.writeFile(outputPath, JSON.stringify(result.data, null, 2), 'utf-8');
            
            window.showInformationMessage(
              `JSON output exported successfully: ${path.basename(outputPath)}`,
            );
          } else {
            // JavaScript format - write both JS and JSON
            const jsPath = rclFilePath.replace('.rcl', '.js');
            const jsonPath = rclFilePath.replace('.rcl', '.json');
            
            // Generate JavaScript content
            const jsContent = generateJavaScript(result.data, baseName);
            await fs.promises.writeFile(jsPath, jsContent, 'utf-8');
            
            // Also write JSON file
            await fs.promises.writeFile(jsonPath, JSON.stringify(result.data, null, 2), 'utf-8');
            
            window.showInformationMessage(
              `JavaScript output exported successfully: ${path.basename(jsPath)}`,
            );
          }
        } else {
          const errors = result.diagnostics.filter(d => d.severity === 'error');
          window.showErrorMessage(`Failed to compile RCL file: ${errors[0]?.message || 'Unknown error'}`);
        }
      },
    );
  } catch (error) {
    window.showErrorMessage(
      `Export failed: ${error instanceof Error ? error.message : String(error)}`,
    );
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
        location: { viewId: 'workbench.view.explorer' },
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
          const errors = result.diagnostics.filter(d => d.severity === 'error');
          window.showErrorMessage(`Failed to compile RCL file: ${errors[0]?.message || 'Unknown error'}`);
        }
      },
    );
  } catch (error) {
    window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}


function generateJavaScript(data: any, baseName: string): string {
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

function getBuildHash(): string {
  try {
    // Try to get git commit hash
    const result = cp.execSync('git rev-parse --short=4 HEAD', { encoding: 'utf8' }).trim();
    return result;
  } catch {
    // Fallback to a timestamp-based hash if git is not available
    const timestamp = Date.now().toString(36);
    return timestamp.substring(timestamp.length - 4);
  }
}

function getExtensionVersion(context: ExtensionContext): string {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(context.extensionPath, 'package.json'), 'utf8')
    );
    return packageJson.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

async function showPreviewInPanel(context: ExtensionContext, uri?: Uri): Promise<void> {
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
    
    // Create or show webview panel
    const panel = window.createWebviewPanel(
      'rclPreviewPanel',
      `RCL Preview - ${path.basename(targetUri.fsPath)}`,
      ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [context.extensionUri],
        retainContextWhenHidden: true
      }
    );

    // Create a preview provider instance for this panel
    const panelPreviewProvider = new RCLPreviewPanelProvider(context, panel);
    await panelPreviewProvider.showPreview(document);

    window.showInformationMessage('RCL Preview opened in new panel');
  } catch (error) {
    window.showErrorMessage(
      `Failed to open preview panel: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
