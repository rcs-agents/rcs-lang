const TreeSitter = require('web-tree-sitter');
const path = require('path');

async function testBasicScanner() {
  try {
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    const wasmPath = path.join(__dirname, '..', 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Test cases that should trigger the external scanner
    const tests = [
      { 
        name: 'Agent with body expecting newline', 
        content: 'agent Test\n  displayName: "Test"'
      },
      { 
        name: 'Just newline after agent', 
        content: 'agent Test\n'
      },
      { 
        name: 'Multi-line string test', 
        content: 'agent Test\n  description: |\n    Line 1\n    Line 2'
      },
    ];
    
    for (const test of tests) {
      console.log(`\n=== ${test.name} ===`);
      console.log('Content:', JSON.stringify(test.content));
      
      const tree = parser.parse(test.content);
      const root = tree.rootNode;
      
      console.log('\nTree structure:');
      printTree(root);
      
      // Look for external tokens
      console.log('\nLooking for external tokens:');
      findExternalTokens(root);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function printTree(node, indent = '') {
  const text = node.childCount === 0 ? ` "${node.text.replace(/\n/g, '\\n')}"` : '';
  console.log(`${indent}${node.type}${text}`);
  
  for (const child of node.children) {
    printTree(child, indent + '  ');
  }
}

function findExternalTokens(node) {
  // Check if this node might be an external token
  if (node.type === '_newline' || node.type === '_indent' || node.type === '_dedent' ||
      node.type === 'NEWLINE' || node.type === 'INDENT' || node.type === 'DEDENT') {
    console.log(`  Found external token: ${node.type} at (${node.startPosition.row},${node.startPosition.column})`);
  }
  
  for (const child of node.children) {
    findExternalTokens(child);
  }
}

testBasicScanner();