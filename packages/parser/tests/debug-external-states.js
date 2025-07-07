const TreeSitter = require('web-tree-sitter');
const fs = require('fs');
const path = require('path');

async function debugExternalStates() {
  try {
    // Initialize
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    // Load language
    const wasmPath = path.join(__dirname, 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Try to get info about the language
    console.log('Language node types count:', language.nodeTypeCount);
    
    // Try different minimal contents
    const tests = [
      'agent',
      'agent Test',
      'agent Test\n',
      'agent Test\n  ',
      'agent Test\n  displayName',
    ];
    
    for (const content of tests) {
      console.log(`\n=== Testing: ${JSON.stringify(content)} ===`);
      
      const tree = parser.parse(content);
      const root = tree.rootNode;
      
      // Show the parse state
      console.log(`Root: ${root.type}`);
      console.log(`Children: ${root.children.map(c => c.type).join(', ')}`);
      console.log(`Has error: ${tree.rootNode.type === 'ERROR' || tree.rootNode.children.some(c => c.type === 'ERROR')}`);
      
      // Show all nodes
      function showAllNodes(node, prefix = '') {
        console.log(`${prefix}${node.type} [${node.startPosition.row},${node.startPosition.column}] "${node.text?.replace(/\n/g, '\\n')}"`);
        node.children.forEach(child => showAllNodes(child, prefix + '  '));
      }
      
      showAllNodes(root);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugExternalStates();