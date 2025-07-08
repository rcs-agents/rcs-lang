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
import { InteractiveDiagramProvider } from './interactiveDiagramProvider';

let client: LanguageClient;
let statusBarItem: StatusBarItem;

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

  // Create preview provider
  const previewProvider = new RCLPreviewProvider(context);
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

    // The webview view should automatically appear when the provider is activated

    window.showInformationMessage('RCL Preview opened');
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

  const workspaceFolder = workspace.getWorkspaceFolder(targetUri);
  if (!workspaceFolder) {
    window.showErrorMessage('File must be within a workspace folder');
    return;
  }

  try {
    const cliPath = findRclCli(workspaceFolder.uri.fsPath);
    if (!cliPath) {
      window.showErrorMessage('RCL CLI tool not found. Please ensure the RCL CLI is installed.');
      return;
    }

    await window.withProgress(
      {
        location: { viewId: 'workbench.view.explorer' },
        title: 'Compiling RCL to JSON...',
        cancellable: false,
      },
      async () => {
        const rclFilePath = targetUri.fsPath;
        const outputPath = rclFilePath.replace('.rcl', '.json');

        const result = await runRclCli(cliPath, rclFilePath, outputPath, 'json');

        if (result.success) {
          const outputUri = Uri.file(outputPath);
          const document = await workspace.openTextDocument(outputUri);
          await window.showTextDocument(document, ViewColumn.Beside);

          window.showInformationMessage(
            `JSON output generated successfully: ${path.basename(outputPath)}`,
          );
        } else {
          window.showErrorMessage(`Failed to compile RCL file: ${result.error}`);
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

  const workspaceFolder = workspace.getWorkspaceFolder(targetUri);
  if (!workspaceFolder) {
    window.showErrorMessage('File must be within a workspace folder');
    return;
  }

  try {
    const cliPath = findRclCli(workspaceFolder.uri.fsPath);
    if (!cliPath) {
      window.showErrorMessage('RCL CLI tool not found. Please ensure the RCL CLI is installed.');
      return;
    }

    const rclFilePath = targetUri.fsPath;
    const extension = format.value === 'js' ? '.js' : '.json';
    const outputPath = rclFilePath.replace('.rcl', extension);

    const result = await runRclCli(cliPath, rclFilePath, outputPath, format.value);

    if (result.success) {
      window.showInformationMessage(
        `Compiled output exported successfully: ${path.basename(outputPath)}`,
      );
    } else {
      window.showErrorMessage(`Failed to export compiled output: ${result.error}`);
    }
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

  const workspaceFolder = workspace.getWorkspaceFolder(targetUri);
  if (!workspaceFolder) {
    window.showErrorMessage('File must be within a workspace folder');
    return;
  }

  try {
    // Find the CLI demo tool
    const cliPath = findRclCli(workspaceFolder.uri.fsPath);
    if (!cliPath) {
      window.showErrorMessage('RCL CLI tool not found. Please ensure the RCL CLI is installed.');
      return;
    }

    // Show progress indicator
    await window.withProgress(
      {
        location: { viewId: 'workbench.view.explorer' },
        title: 'Compiling RCL agent...',
        cancellable: false,
      },
      async () => {
        const rclFilePath = targetUri.fsPath;
        const outputPath = rclFilePath.replace('.rcl', '.js');

        // Run the CLI tool
        const result = await runRclCli(cliPath, rclFilePath, outputPath);

        if (result.success) {
          // Open the generated file
          const outputUri = Uri.file(outputPath);
          const document = await workspace.openTextDocument(outputUri);
          await window.showTextDocument(document, ViewColumn.Beside);

          window.showInformationMessage(
            `Agent output generated successfully: ${path.basename(outputPath)}`,
          );
        } else {
          window.showErrorMessage(`Failed to compile RCL file: ${result.error}`);
        }
      },
    );
  } catch (error) {
    window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function findRclCli(workspacePath: string): string | null {
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

function runRclCli(
  cliPath: string,
  inputPath: string,
  outputPath: string,
  format: string = 'js',
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const command = `node "${cliPath}" "${inputPath}" -o "${outputPath}" --format ${format}`;

    cp.exec(command, (error, _stdout, stderr) => {
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
