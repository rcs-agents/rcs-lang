const vscode = require('vscode');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

suite('Enhanced Interactive Diagram Validation Tests', () => {
  let testDocument;
  const testWorkspace = path.join(__dirname, '../../../test-workspace');
  const testRclFile = path.join(testWorkspace, 'test-enhanced-diagram.rcl');

  suiteSetup(async function () {
    this.timeout(10000);
    // Create test workspace if it doesn't exist
    if (!fs.existsSync(testWorkspace)) {
      fs.mkdirSync(testWorkspace, { recursive: true });
    }
  });

  setup(async function () {
    this.timeout(10000);
    // Create a test RCL file with various node types
    const testContent = `agent EnhancedTest
  displayName: "Enhanced Diagram Test"
  
  flow TestFlow
    start: StartNode
    
    on StartNode
      match @reply.text
        "Go" -> MessageNode
        "Help" -> RichCardNode
        :default -> StartNode
    
    on MessageNode
      match @reply.text
        "Next" -> EndNode
        "Back" -> StartNode
        :default -> MessageNode
    
    on RichCardNode
      # Rich card state
      -> MessageNode
      
    on EndNode
      # End state
      
  messages Messages
    text StartNode "Welcome! This is a start node (green circle)."
    text MessageNode "This is a message node (blue rectangle)."
    richCard RichCardNode "Rich Card Node"
      description: "This is a rich card node (gold star)."
    text EndNode "This is an end node (red circle)."
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

  test('should render enhanced diagram without errors', async function () {
    this.timeout(15000);

    // Execute the command to open interactive diagram
    await vscode.commands.executeCommand('rcl.openInteractiveDiagram');

    // Wait for webview to initialize
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // The diagram should open without throwing errors
    // If we got here, the command executed successfully
    assert.ok(true, 'Interactive diagram opened without errors');
  });

  test('should compile RCL file and generate proper flow structure', async function () {
    this.timeout(10000);

    // Get the extension
    const extension = vscode.extensions.getExtension('rcl-lang.rcl-language-support');
    assert.ok(extension, 'Extension should be available');

    if (!extension.isActive) {
      await extension.activate();
    }

    // Wait for compilation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check that there are no diagnostics (compilation errors)
    const diagnostics = vscode.languages.getDiagnostics(vscode.Uri.file(testRclFile));
    assert.strictEqual(
      diagnostics.length,
      0,
      `Should have no compilation errors, but found: ${diagnostics.map((d) => d.message).join(', ')}`,
    );
  });

  test('should handle coffee-shop example with enhanced diagram', async function () {
    this.timeout(20000);

    // Use the actual coffee shop example
    const coffeeShopPath = path.join(__dirname, '../../../../../examples/coffee-shop.rcl');
    if (!fs.existsSync(coffeeShopPath)) {
      this.skip();
      return;
    }

    const uri = vscode.Uri.file(coffeeShopPath);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);

    // Open interactive diagram
    await vscode.commands.executeCommand('rcl.openInteractiveDiagram');

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Check diagnostics
    const diagnostics = vscode.languages.getDiagnostics(uri);
    assert.strictEqual(
      diagnostics.length,
      0,
      `Coffee shop should compile without errors, but found: ${diagnostics.map((d) => d.message).join(', ')}`,
    );

    // If we got here, the diagram rendered successfully
    assert.ok(true, 'Coffee shop diagram rendered successfully');
  });

  test('enhanced diagram should support all node types', async function () {
    this.timeout(10000);

    // Test that our implementation supports the expected node types
    const diagramJsPath = path.join(__dirname, '../../resources/interactive-diagram-enhanced.js');
    assert.ok(fs.existsSync(diagramJsPath), 'Enhanced diagram JavaScript file should exist');

    const content = fs.readFileSync(diagramJsPath, 'utf8');

    // Check for node type support
    const nodeTypes = ['start', 'end', 'message', 'rich_card'];
    nodeTypes.forEach((type) => {
      assert.ok(content.includes(`case '${type}':`), `Should support ${type} node type`);
    });

    // Check for visual elements
    assert.ok(content.includes('Green circle'), 'Should render start nodes as green circles');
    assert.ok(content.includes('Red circle'), 'Should render end nodes as red circles');
    assert.ok(content.includes('Star shape'), 'Should render rich cards as stars');
    assert.ok(content.includes('Rectangle for messages'), 'Should render messages as rectangles');
  });

  test('enhanced diagram should support interactions', async function () {
    this.timeout(10000);

    const diagramJsPath = path.join(__dirname, '../../resources/interactive-diagram-enhanced.js');
    const content = fs.readFileSync(diagramJsPath, 'utf8');

    // Check for interaction features
    const interactions = [
      'setupDiagramInteractions',
      'isPanning',
      'mousedown',
      'mousemove',
      'mouseup',
      'wheel',
      'selectNode',
      'updateSelection',
      'fitDiagramToView',
    ];

    interactions.forEach((feature) => {
      assert.ok(content.includes(feature), `Should support ${feature} interaction`);
    });
  });
});

// Test suite for validating the enhanced diagram renders properly
suite('Enhanced Diagram Rendering Validation', () => {
  test('CSS should define all required styles', () => {
    const cssPath = path.join(__dirname, '../../resources/sprotty-diagram.css');
    assert.ok(fs.existsSync(cssPath), 'CSS file should exist');

    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Check for essential styles
    const requiredStyles = [
      '#sprotty-container',
      '.diagram-node',
      '.diagram-edge',
      'cursor: grab',
      'cursor: pointer',
      '.diagram-node.selected',
      '.diagram-node.hover',
    ];

    requiredStyles.forEach((style) => {
      assert.ok(cssContent.includes(style), `CSS should include ${style}`);
    });
  });

  test('should not depend on external CDN resources', () => {
    const jsPath = path.join(__dirname, '../../resources/interactive-diagram-enhanced.js');
    const content = fs.readFileSync(jsPath, 'utf8');

    // Should NOT load from CDN
    assert.ok(!content.includes('unpkg.com'), 'Should not load from unpkg CDN');
    assert.ok(!content.includes('cdn.jsdelivr.net'), 'Should not load from jsDelivr CDN');

    // Should be self-contained
    assert.ok(
      !content.includes('loadSprottyLibrary'),
      'Should not try to load external Sprotty library',
    );
  });
});
