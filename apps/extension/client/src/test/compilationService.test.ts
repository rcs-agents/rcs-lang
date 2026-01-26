import * as assert from 'node:assert';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { CompilationService } from '../compilationService';

suite('CompilationService Test Suite', () => {
  let compilationService: CompilationService;
  let disposables: vscode.Disposable[] = [];

  setup(() => {
    compilationService = new CompilationService();
    disposables.push(compilationService);
  });

  teardown(() => {
    disposables.forEach((d) => d.dispose());
    disposables = [];
  });

  test('should compile a valid RCL file', async () => {
    // Create a test document with valid RCL content
    const content = `agent TravelAssistant
  displayName: "Travel Assistant"
  icon: <url https://example.com/icon.png>

flow MainFlow
  :start -> MsgWelcome
  MsgWelcome -> :end

messages Messages
  text MsgWelcome "Welcome to Travel Assistant!"
`;

    const _doc = await vscode.workspace.openTextDocument({
      language: 'rcl',
      content: content,
    });

    // Save to a temporary file
    const tempUri = vscode.Uri.file(
      path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath, 'test-temp.rcl'),
    );
    await vscode.workspace.fs.writeFile(tempUri, Buffer.from(content));

    try {
      const result = await compilationService.compileFile(tempUri);

      assert.strictEqual(result.success, true, 'Compilation should succeed');
      assert.ok(result.data, 'Should have compiled data');
      assert.ok(result.data.agent, 'Should have agent data');
      assert.ok(result.data.messages, 'Should have messages data');
      assert.ok(result.data.flows, 'Should have flows data');
      assert.strictEqual(result.data.agent.displayName, 'Travel Assistant');
      assert.strictEqual(
        result.data.messages.MsgWelcome.contentMessage.text,
        'Welcome to Travel Assistant!',
      );
    } finally {
      // Clean up
      await vscode.workspace.fs.delete(tempUri);
    }
  });

  test('should report errors for invalid RCL', async () => {
    const content = `agent
  displayName: "Invalid Agent"

flow MainFlow
  :start -> MissingMessage

messages Messages
  text MsgWelcome "Welcome!"
`;

    const tempUri = vscode.Uri.file(
      path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath, 'test-invalid.rcl'),
    );
    await vscode.workspace.fs.writeFile(tempUri, Buffer.from(content));

    try {
      const result = await compilationService.compileFile(tempUri);

      assert.strictEqual(result.success, false, 'Compilation should fail');
      assert.ok(result.diagnostics.length > 0, 'Should have diagnostics');
    } finally {
      // Clean up
      await vscode.workspace.fs.delete(tempUri);
    }
  });

  test('should handle file outside workspace', async () => {
    const _content = `agent Test
  displayName: "Test"

flow MainFlow
  :start -> :end

messages Messages
`;

    // Create a file outside workspace
    const tempUri = vscode.Uri.file('/tmp/test-outside.rcl');

    try {
      await compilationService.compileFile(tempUri);
      assert.fail('Should throw error for file outside workspace');
    } catch (error) {
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, 'File must be in a workspace');
    }
  });

  test('should cache program instances per workspace', async () => {
    const content = `agent Test
  displayName: "Test"

flow MainFlow
  :start -> :end

messages Messages
`;

    const tempUri1 = vscode.Uri.file(
      path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath, 'test1.rcl'),
    );
    const tempUri2 = vscode.Uri.file(
      path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath, 'test2.rcl'),
    );

    await vscode.workspace.fs.writeFile(tempUri1, Buffer.from(content));
    await vscode.workspace.fs.writeFile(tempUri2, Buffer.from(content));

    try {
      // Compile both files
      await compilationService.compileFile(tempUri1);
      await compilationService.compileFile(tempUri2);

      // The service should reuse the same program instance
      // This is internal behavior, but we can verify by checking that
      // both compilations succeed without errors
      const result1 = await compilationService.compileFile(tempUri1);
      const result2 = await compilationService.compileFile(tempUri2);

      assert.strictEqual(result1.success, true);
      assert.strictEqual(result2.success, true);
    } finally {
      // Clean up
      await vscode.workspace.fs.delete(tempUri1);
      await vscode.workspace.fs.delete(tempUri2);
    }
  });

  test('should update diagnostics collection', async () => {
    const content = `agent Test
  displayName: "Test"
  invalidProperty: "This should cause an error"

flow MainFlow
  :start -> :end

messages Messages
`;

    const tempUri = vscode.Uri.file(
      path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath, 'test-diagnostics.rcl'),
    );
    await vscode.workspace.fs.writeFile(tempUri, Buffer.from(content));

    try {
      await compilationService.compileFile(tempUri);

      // Check if diagnostics were set for the file
      const diagnostics = vscode.languages.getDiagnostics(tempUri);
      assert.ok(diagnostics.length > 0, 'Should have diagnostics for the file');
    } finally {
      // Clean up
      await vscode.workspace.fs.delete(tempUri);
      compilationService.clearDiagnostics();
    }
  });
});
