const TreeSitter = require('web-tree-sitter');
const path = require('path');

async function debugExpectedTokens() {
  try {
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    const wasmPath = path.join(__dirname, '..', 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Test different positions to see what tokens are expected
    const tests = [
      { name: 'After "agent Test"', content: 'agent Test', position: 10 },
      { name: 'Start of line after agent', content: 'agent Test\n', position: 11 },
      { name: 'After newline with spaces', content: 'agent Test\n  ', position: 13 },
    ];
    
    for (const test of tests) {
      console.log(`\n=== ${test.name} ===`);
      console.log(`Content: ${JSON.stringify(test.content)}`);
      console.log(`Position: ${test.position}`);
      
      // Parse up to position
      const tree = parser.parse(test.content);
      
      // Show the tree
      console.log('\nTree:');
      printSimpleTree(tree.rootNode);
      
      // Check what's at the error position
      const errorNode = findErrorNode(tree.rootNode);
      if (errorNode) {
        console.log('\nError node:', errorNode.type);
        console.log('Error text:', JSON.stringify(errorNode.text));
        console.log('Error position:', `(${errorNode.startPosition.row},${errorNode.startPosition.column})`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function printSimpleTree(node, indent = '') {
  const text = node.childCount === 0 ? ` "${node.text.replace(/\n/g, '\\n')}"` : '';
  console.log(`${indent}${node.type}${text}`);
  
  for (const child of node.children) {
    printSimpleTree(child, indent + '  ');
  }
}

function findErrorNode(node) {
  if (node.type === 'ERROR') return node;
  for (const child of node.children) {
    const error = findErrorNode(child);
    if (error) return error;
  }
  return null;
}

debugExpectedTokens();