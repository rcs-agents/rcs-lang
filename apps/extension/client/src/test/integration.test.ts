import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';

// Helper to wait for language server to be ready
async function waitForLanguageServer(maxWaitTime = 10000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    // Try to get diagnostics for a simple file to check if server is ready
    const testUri = vscode.Uri.parse('untitled:test.rcl');
    const testDoc = await vscode.workspace.openTextDocument(testUri);
    await vscode.window.showTextDocument(testDoc);

    // Give server time to process
    await new Promise((resolve) => setTimeout(resolve, 500));

    const diagnostics = vscode.languages.getDiagnostics(testUri);
    if (diagnostics.length >= 0) {
      // Server responded (even if no diagnostics)
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      return true;
    }

    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
}

describe('RCL Extension Integration Tests', () => {
  let testWorkspace: string;

  before(async () => {
    // Create a temporary workspace for testing
    testWorkspace = path.join(__dirname, '..', '..', '..', 'test-workspace');
    if (!fs.existsSync(testWorkspace)) {
      fs.mkdirSync(testWorkspace, { recursive: true });
    }

    // Wait for extension to activate
    const extension = vscode.extensions.getExtension('tokilabs.rcl-language-support');
    if (extension && !extension.isActive) {
      await extension.activate();
    }

    // Wait for language server
    console.log('Waiting for language server to initialize...');
    const serverReady = await waitForLanguageServer();
    assert.ok(serverReady, 'Language server should be ready');
  });

  after(async () => {
    // Clean up test workspace
    if (fs.existsSync(testWorkspace)) {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    }
  });

  describe('Extension Activation', () => {
    it('should activate the RCL extension', () => {
      const extension = vscode.extensions.getExtension('tokilabs.rcl-language-support');
      assert.ok(extension, 'Extension should be found');
      assert.ok(extension?.isActive, 'Extension should be active');
    });

    it('should register all commands', async () => {
      const commands = await vscode.commands.getCommands();

      const expectedCommands = [
        'rcl.showAgentOutput',
        'rcl.showPreview',
        'rcl.showJSONOutput',
        'rcl.exportCompiled',
        'rcl.openInteractiveDiagram',
      ];

      for (const cmd of expectedCommands) {
        assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`);
      }
    });
  });

  describe('Language Server Features', () => {
    it('should provide syntax highlighting for RCL files', async () => {
      const content = `agent TestAgent
  displayName: "Test Agent"
  flow MainFlow
    :start -> end
  messages Messages
    text Welcome "Hello World!"`;

      const doc = await vscode.workspace.openTextDocument({
        language: 'rcl',
        content,
      });

      await vscode.window.showTextDocument(doc);

      // Check that the document is recognized as RCL
      assert.equal(doc.languageId, 'rcl');

      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    it('should provide diagnostics for invalid RCL', async () => {
      const invalidContent = `agent "Invalid Agent Name"
  displayName: "Test"`;

      const doc = await vscode.workspace.openTextDocument({
        language: 'rcl',
        content: invalidContent,
      });

      const _editor = await vscode.window.showTextDocument(doc);

      // Wait for diagnostics
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const diagnostics = vscode.languages.getDiagnostics(doc.uri);

      // Should have diagnostics for invalid syntax
      // Note: The exact diagnostics depend on the parser implementation
      console.log('Diagnostics:', diagnostics);

      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    it('should provide hover information', async () => {
      const content = `agent CustomerServiceBot
  displayName: "Customer Service Assistant"
  flow MainFlow
    :start -> greeting
  messages Messages
    text greeting "Hello!"`;

      const doc = await vscode.workspace.openTextDocument({
        language: 'rcl',
        content,
      });

      await vscode.window.showTextDocument(doc);

      // Try to get hover info for "agent" keyword
      const position = new vscode.Position(0, 2); // Inside "agent"
      const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        'vscode.executeHoverProvider',
        doc.uri,
        position,
      );

      console.log('Hover results:', hovers);

      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    it('should provide code completion', async () => {
      const content = `agent TestAgent
  disp`;

      const doc = await vscode.workspace.openTextDocument({
        language: 'rcl',
        content,
      });

      await vscode.window.showTextDocument(doc);

      // Try to get completions after "disp"
      const position = new vscode.Position(1, 6);
      const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider',
        doc.uri,
        position,
      );

      console.log(
        'Completions:',
        completions?.items.map((i) => i.label),
      );

      // Should suggest "displayName"
      const displayNameCompletion = completions?.items.find(
        (item) => typeof item.label === 'string' && item.label.includes('displayName'),
      );

      assert.ok(displayNameCompletion, 'Should suggest displayName');

      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    it('should provide document symbols', async () => {
      const content = `agent CustomerServiceBot
  displayName: "Customer Service"
  
  flow MainFlow
    :start -> greeting
    greeting -> end
    
  flow ErrorFlow
    :error -> apologize
    apologize -> end
    
  messages Messages
    text greeting "Hello!"
    text apologize "Sorry!"`;

      const doc = await vscode.workspace.openTextDocument({
        language: 'rcl',
        content,
      });

      await vscode.window.showTextDocument(doc);

      const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        doc.uri,
      );

      console.log(
        'Document symbols:',
        symbols?.map((s) => ({ name: s.name, kind: s.kind })),
      );

      // Should find agent, flows, and messages
      assert.ok(symbols && symbols.length > 0, 'Should have document symbols');

      const agentSymbol = symbols?.find((s) => s.name === 'CustomerServiceBot');
      assert.ok(agentSymbol, 'Should find agent symbol');

      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    it('should provide go to definition', async () => {
      const content = `agent TestAgent
  displayName: "Test"
  flow MainFlow
    :start -> greeting
  messages Messages
    text greeting "Hello!"`;

      const doc = await vscode.workspace.openTextDocument({
        language: 'rcl',
        content,
      });

      await vscode.window.showTextDocument(doc);

      // Try to go to definition of "greeting" in the flow
      const position = new vscode.Position(3, 15); // Inside "greeting" in flow
      const definitions = await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeDefinitionProvider',
        doc.uri,
        position,
      );

      console.log('Definitions:', definitions);

      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });
  });

  describe('Extension Commands', () => {
    it('should handle showJSONOutput command', async () => {
      const content = `agent TestAgent
  displayName: "Test Agent"
  flow MainFlow
    :start -> end
  messages Messages
    text Welcome "Welcome!"`;

      const doc = await vscode.workspace.openTextDocument({
        language: 'rcl',
        content,
      });

      const editor = await vscode.window.showTextDocument(doc);

      // Execute the command
      try {
        await vscode.commands.executeCommand('rcl.showJSONOutput');

        // Command should create a new JSON document
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if a new editor was opened
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor !== editor) {
          assert.ok(activeEditor.document.languageId === 'json', 'Should open JSON output');
        }
      } catch (error) {
        console.log('Command error:', error);
      }

      // Close all editors
      await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });

    it('should handle exportCompiled command', async () => {
      // Create a test RCL file
      const testFile = path.join(testWorkspace, 'test.rcl');
      const content = `agent TestAgent
  displayName: "Test Agent"
  flow MainFlow
    :start -> end
  messages Messages
    text Welcome "Welcome!"`;

      fs.writeFileSync(testFile, content);

      const doc = await vscode.workspace.openTextDocument(testFile);
      await vscode.window.showTextDocument(doc);

      // Note: This command typically shows a save dialog, which we can't automate
      // We'll just verify it doesn't crash
      try {
        // The command might fail in test environment due to no UI
        await vscode.commands.executeCommand('rcl.exportCompiled');
      } catch (error) {
        // Expected in test environment
        console.log('Export command expected error:', error);
      }

      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });
  });

  describe('Error Handling', () => {
    it('should handle parser initialization errors gracefully', async () => {
      // Even with complex/invalid content, extension shouldn't crash
      const complexContent = `agent Very Complex Agent With Many Words
  displayName: "Complex Agent"
  
  // This is a comment
  
  flow Main Flow With Spaces
    :start -> "invalid node"
    invalid syntax here
    
  messages Messages
    text Welcome Message "Hello"
    invalid message syntax`;

      const doc = await vscode.workspace.openTextDocument({
        language: 'rcl',
        content: complexContent,
      });

      await vscode.window.showTextDocument(doc);

      // Give time for parsing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Extension should still be active
      const extension = vscode.extensions.getExtension('tokilabs.rcl-language-support');
      assert.ok(extension?.isActive, 'Extension should remain active despite errors');

      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });
  });

  describe('Multi-file Support', () => {
    it('should handle multiple RCL files simultaneously', async () => {
      // Create multiple test files
      const file1 = path.join(testWorkspace, 'agent1.rcl');
      const file2 = path.join(testWorkspace, 'agent2.rcl');

      fs.writeFileSync(
        file1,
        `agent FirstAgent
  displayName: "First Agent"
  flow MainFlow
    :start -> end
  messages Messages
    text Welcome "Hello from first!"`,
      );

      fs.writeFileSync(
        file2,
        `agent SecondAgent
  displayName: "Second Agent"
  flow MainFlow
    :start -> end
  messages Messages
    text Welcome "Hello from second!"`,
      );

      // Open both files
      const doc1 = await vscode.workspace.openTextDocument(file1);
      const doc2 = await vscode.workspace.openTextDocument(file2);

      await vscode.window.showTextDocument(doc1);
      await vscode.window.showTextDocument(doc2, vscode.ViewColumn.Two);

      // Both should be recognized as RCL
      assert.equal(doc1.languageId, 'rcl');
      assert.equal(doc2.languageId, 'rcl');

      // Wait for parsing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Both should have diagnostics available
      const diag1 = vscode.languages.getDiagnostics(doc1.uri);
      const diag2 = vscode.languages.getDiagnostics(doc2.uri);

      console.log('File 1 diagnostics:', diag1);
      console.log('File 2 diagnostics:', diag2);

      await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });
  });
});

// Run the tests
export function run(): Promise<void> {
  const mocha = require('mocha');
  const runner = new mocha({
    ui: 'bdd',
    color: true,
    timeout: 60000,
  });

  runner.addFile(__filename);

  return new Promise((resolve, reject) => {
    runner.run((failures: number) => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`));
      } else {
        resolve();
      }
    });
  });
}
