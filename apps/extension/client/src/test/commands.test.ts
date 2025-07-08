import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

suite('Extension Commands Test Suite', () => {
  const testContent = `agent TestAgent
  displayName: "Test Agent"

flow MainFlow
  :start -> MsgHello
  MsgHello -> :end

messages Messages
  text MsgHello "Hello, World!"
`;

  let testUri: vscode.Uri;

  setup(async () => {
    // Create a test file
    const workspaceFolder = vscode.workspace.workspaceFolders![0];
    testUri = vscode.Uri.file(path.join(workspaceFolder.uri.fsPath, 'test-commands.rcl'));
    await vscode.workspace.fs.writeFile(testUri, Buffer.from(testContent));
  });

  teardown(async () => {
    // Clean up test files
    try {
      await vscode.workspace.fs.delete(testUri);
      // Clean up generated files
      const jsonUri = vscode.Uri.file(testUri.fsPath.replace('.rcl', '.json'));
      const jsUri = vscode.Uri.file(testUri.fsPath.replace('.rcl', '.js'));
      await vscode.workspace.fs.delete(jsonUri).then(() => {}, () => {});
      await vscode.workspace.fs.delete(jsUri).then(() => {}, () => {});
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  test('rcl.showJSONOutput command should generate JSON file', async () => {
    // Open the test file
    const document = await vscode.workspace.openTextDocument(testUri);
    await vscode.window.showTextDocument(document);

    // Execute the command
    await vscode.commands.executeCommand('rcl.showJSONOutput');

    // Wait a bit for file generation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if JSON file was created
    const jsonPath = testUri.fsPath.replace('.rcl', '.json');
    assert.ok(fs.existsSync(jsonPath), 'JSON file should be created');

    // Verify JSON content
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    assert.ok(jsonContent.agent, 'JSON should have agent data');
    assert.ok(jsonContent.messages, 'JSON should have messages data');
    assert.ok(jsonContent.flows, 'JSON should have flows data');
    assert.strictEqual(jsonContent.agent.displayName, 'Test Agent');
  });

  test('rcl.showAgentOutput command should generate JS and JSON files', async () => {
    // Open the test file
    const document = await vscode.workspace.openTextDocument(testUri);
    await vscode.window.showTextDocument(document);

    // Execute the command
    await vscode.commands.executeCommand('rcl.showAgentOutput');

    // Wait a bit for file generation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if files were created
    const jsPath = testUri.fsPath.replace('.rcl', '.js');
    const jsonPath = testUri.fsPath.replace('.rcl', '.json');
    
    assert.ok(fs.existsSync(jsPath), 'JS file should be created');
    assert.ok(fs.existsSync(jsonPath), 'JSON file should be created');

    // Verify JS content
    const jsContent = fs.readFileSync(jsPath, 'utf-8');
    assert.ok(jsContent.includes('import agentData from'), 'JS should import JSON');
    assert.ok(jsContent.includes('export const messages'), 'JS should export messages');
    assert.ok(jsContent.includes('export const flows'), 'JS should export flows');
    assert.ok(jsContent.includes('export const agent'), 'JS should export agent');
  });

  test('rcl.showPreview command should work without errors', async () => {
    // Open the test file
    const document = await vscode.workspace.openTextDocument(testUri);
    await vscode.window.showTextDocument(document);

    // Execute the command
    try {
      await vscode.commands.executeCommand('rcl.showPreview');
      // If no error is thrown, the command executed successfully
      assert.ok(true, 'Preview command should execute without errors');
    } catch (error) {
      assert.fail(`Preview command failed: ${error}`);
    }
  });

  test('rcl.showPreviewPanel command should open preview in panel', async () => {
    // Open the test file
    const document = await vscode.workspace.openTextDocument(testUri);
    await vscode.window.showTextDocument(document);

    // Execute the command
    try {
      await vscode.commands.executeCommand('rcl.showPreviewPanel');
      // If no error is thrown, the command executed successfully
      assert.ok(true, 'Preview panel command should execute without errors');
    } catch (error) {
      assert.fail(`Preview panel command failed: ${error}`);
    }
  });

  test('commands should handle invalid RCL files gracefully', async () => {
    const invalidContent = `agent
  displayName: "Invalid"

flow MainFlow
  :start -> MissingMessage

messages Messages
`;

    const invalidUri = vscode.Uri.file(path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, 'test-invalid.rcl'));
    await vscode.workspace.fs.writeFile(invalidUri, Buffer.from(invalidContent));

    try {
      const document = await vscode.workspace.openTextDocument(invalidUri);
      await vscode.window.showTextDocument(document);

      // Try to generate JSON - should fail gracefully
      await vscode.commands.executeCommand('rcl.showJSONOutput');

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 500));

      // JSON file should not be created
      const jsonPath = invalidUri.fsPath.replace('.rcl', '.json');
      assert.ok(!fs.existsSync(jsonPath), 'JSON file should not be created for invalid RCL');
    } finally {
      await vscode.workspace.fs.delete(invalidUri);
    }
  });
});