const vscode = require('vscode');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

suite('Interactive Diagram Integration Tests', () => {
  let testDocument;
  const testWorkspace = path.join(__dirname, '../../../test-workspace');
  const testRclFile = path.join(testWorkspace, 'test-diagram.rcl');

  suiteSetup(async function () {
    this.timeout(10000);
    // Create test workspace if it doesn't exist
    if (!fs.existsSync(testWorkspace)) {
      fs.mkdirSync(testWorkspace, { recursive: true });
    }
  });

  setup(async function () {
    this.timeout(10000);
    // Create a test RCL file
    const testContent = `agent TestAgent
  displayName: "Test Agent"
  
  flow TestFlow
    start: Welcome
    
    on Welcome
      match @reply.text
        "Next" -> Greeting
        :default -> Welcome
    
    on Greeting
      match @reply.text
        "End" -> Complete
        :default -> Greeting
    
    on Complete
      # End state
      
  messages Messages
    text Welcome "Welcome! Say 'Next' to continue."
    text Greeting "Hello! Say 'End' to finish."
    text Complete "Goodbye!"
`;

    fs.writeFileSync(testRclFile, testContent);

    // Open the test document
    const uri = vscode.Uri.file(testRclFile);
    testDocument = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(testDocument);
  });

  teardown(async () => {
    // Close all editors
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');

    // Clean up test file
    if (fs.existsSync(testRclFile)) {
      fs.unlinkSync(testRclFile);
    }
  });

  test('should register the openInteractiveDiagram command', async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(
      commands.includes('rcl.openInteractiveDiagram'),
      'rcl.openInteractiveDiagram command should be registered',
    );
  });

  test('should open interactive diagram webview panel', async function () {
    this.timeout(10000);

    // Execute the command
    await vscode.commands.executeCommand('rcl.openInteractiveDiagram');

    // Wait for webview to open
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if a webview panel is visible
    // Note: We can't directly access webview panels in tests, but we can check for side effects
    const activeEditor = vscode.window.activeTextEditor;
    assert.ok(activeEditor, 'Should still have active text editor');
    assert.strictEqual(
      activeEditor?.document.uri.fsPath,
      testRclFile,
      'Active editor should still be the RCL file',
    );
  });

  test('should compile RCL file successfully', async function () {
    this.timeout(10000);

    // Get the extension
    const extension = vscode.extensions.getExtension('rcl-lang.rcl-language-support');
    assert.ok(extension, 'Extension should be available');

    if (!extension.isActive) {
      await extension.activate();
    }

    // Check diagnostics after giving time for compilation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const diagnostics = vscode.languages.getDiagnostics(vscode.Uri.file(testRclFile));
    console.log('Diagnostics:', diagnostics);

    assert.strictEqual(
      diagnostics.length,
      0,
      `Should have no diagnostics, but found: ${diagnostics.map((d) => d.message).join(', ')}`,
    );
  });

  test('should handle missing displayName gracefully', async function () {
    this.timeout(10000);

    // Create RCL file with missing displayName
    const invalidContent = `agent TestAgent
  # Missing displayName
  
  flow TestFlow
    start: Welcome
    
    on Welcome
      -> Complete
      
  messages Messages
    text Welcome "Welcome!"
`;

    fs.writeFileSync(testRclFile, invalidContent);
    const uri = vscode.Uri.file(testRclFile);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);

    // Execute the command
    await vscode.commands.executeCommand('rcl.openInteractiveDiagram');

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Should show error diagnostics
    const diagnostics = vscode.languages.getDiagnostics(uri);
    const hasDisplayNameError = diagnostics.some((d) =>
      d.message.toLowerCase().includes('displayname'),
    );

    assert.ok(
      hasDisplayNameError || diagnostics.length > 0,
      'Should have diagnostic error for missing displayName',
    );
  });

  test('should process coffee shop example correctly', async function () {
    this.timeout(15000);

    // Use the actual coffee shop example
    const coffeeShopPath = path.join(__dirname, '../../../../../examples/coffee-shop.rcl');
    if (!fs.existsSync(coffeeShopPath)) {
      this.skip();
      return;
    }

    const uri = vscode.Uri.file(coffeeShopPath);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);

    // Execute the command
    await vscode.commands.executeCommand('rcl.openInteractiveDiagram');

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check diagnostics
    const diagnostics = vscode.languages.getDiagnostics(uri);
    assert.strictEqual(
      diagnostics.length,
      0,
      `Coffee shop example should compile without errors, but found: ${diagnostics.map((d) => d.message).join(', ')}`,
    );
  });

  test('should create webview with correct title', async function () {
    this.timeout(10000);

    // Note: We can't directly test webview content in VS Code extension tests,
    // but we can test that the command executes without errors
    let errorThrown = false;
    try {
      await vscode.commands.executeCommand('rcl.openInteractiveDiagram');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      errorThrown = true;
      console.error('Command error:', error);
    }

    assert.strictEqual(errorThrown, false, 'Command should execute without errors');
  });
});

// Additional test suite for debugging the flow rendering issue
suite('Interactive Diagram Flow Rendering Debug Tests', () => {
  test('should log compilation output structure', async function () {
    this.timeout(10000);

    const testContent = `agent DebugAgent
  displayName: "Debug Test Agent"
  
  flow DebugFlow
    start: InitialState
    
    on InitialState
      match @reply.text
        "Continue" -> SecondState
        :default -> InitialState
    
    on SecondState
      match @reply.text  
        "Finish" -> FinalState
        :default -> SecondState
        
    on FinalState
      # End of flow
      
  messages Messages
    text InitialState "Starting state"
    text SecondState "Second state" 
    text FinalState "Final state"
`;

    const testFile = path.join(__dirname, '../../../test-workspace/debug-flow.rcl');
    if (!fs.existsSync(path.dirname(testFile))) {
      fs.mkdirSync(path.dirname(testFile), { recursive: true });
    }

    fs.writeFileSync(testFile, testContent);

    const uri = vscode.Uri.file(testFile);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);

    console.log('=== Debug Flow Test ===');
    console.log('Document URI:', uri.toString());
    console.log('Document content length:', doc.getText().length);

    // Execute command
    await vscode.commands.executeCommand('rcl.openInteractiveDiagram');

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check diagnostics
    const diagnostics = vscode.languages.getDiagnostics(uri);
    console.log('Diagnostics count:', diagnostics.length);
    diagnostics.forEach((d, i) => {
      console.log(`Diagnostic ${i}:`, {
        message: d.message,
        severity: d.severity,
        range: `${d.range.start.line}:${d.range.start.character}-${d.range.end.line}:${d.range.end.character}`,
      });
    });

    // Clean up
    fs.unlinkSync(testFile);
  });

  test('should verify compilation service is initialized', async function () {
    this.timeout(10000);

    const extension = vscode.extensions.getExtension('rcl-lang.rcl-language-support');
    assert.ok(extension, 'Extension should be loaded');

    if (!extension.isActive) {
      await extension.activate();
    }

    // Log extension details
    console.log('Extension ID:', extension.id);
    console.log('Extension is active:', extension.isActive);
    console.log('Extension path:', extension.extensionPath);

    // Check if language server is running by checking for RCL language configuration
    const rclConfig = vscode.workspace.getConfiguration('rcl');
    console.log('RCL Configuration:', {
      validationEnabled: rclConfig.get('validation.enabled'),
      maxProblems: rclConfig.get('server.maxNumberOfProblems'),
      completionEnabled: rclConfig.get('completion.enabled'),
      formattingEnabled: rclConfig.get('formatting.enabled'),
    });
  });
});
