const TreeSitter = require('web-tree-sitter');
const path = require('path');

async function testMinimalNewline() {
  try {
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    const wasmPath = path.join(__dirname, '..', 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Very minimal test - just try to get the newline token
    console.log('Testing if newline token works at all...\n');
    
    // According to the grammar, after 'agent Test' we should have an optional newline
    const testCases = [
      'agent Test',
      'agent Test\n',
      'agent Test\n  ',
      'agent Test\n  displayName: "Test"'
    ];
    
    for (const test of testCases) {
      console.log(`\nTest: ${JSON.stringify(test)}`);
      const tree = parser.parse(test);
      
      // Walk tree and look for any node that might be a newline
      function findNewlineNodes(node, path = '') {
        const nodeType = node.type;
        if (nodeType.includes('newline') || nodeType === '_newline' || 
            nodeType === 'NEWLINE' || node.text === '\n') {
          console.log(`  Found potential newline node: ${nodeType} at ${path}`);
        }
        
        for (let i = 0; i < node.childCount; i++) {
          findNewlineNodes(node.child(i), `${path}/${nodeType}[${i}]`);
        }
      }
      
      findNewlineNodes(tree.rootNode);
      
      // Also show the tree structure
      console.log('  Tree:', tree.rootNode.toString());
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testMinimalNewline();