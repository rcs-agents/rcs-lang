import * as path from 'path';
import { workspace, ExtensionContext, window } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  console.log('RCL Language Server extension is now active!');

  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join('server', 'out', 'server.js')
  );

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      // Debug options for the server
      options: {
        execArgv: ['--nolazy', '--inspect=6009']
      }
    }
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for RCL documents
    documentSelector: [
      { scheme: 'file', language: 'rcl' },
      { scheme: 'untitled', language: 'rcl' }
    ],
    synchronize: {
      // Notify the server about file changes to RCL files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/*.rcl')
    },
    // Use the workspace configuration section 'rcl'
    initializationOptions: {
      settings: workspace.getConfiguration('rcl')
    }
  };

  // Create the language client and start the client
  client = new LanguageClient(
    'rclLanguageServer',
    'RCL Language Server',
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start().then(() => {
    console.log('RCL Language Server started successfully');
  }).catch((error) => {
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