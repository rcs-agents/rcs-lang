const TreeSitter = require('web-tree-sitter');
const fs = require('fs');
const path = require('path');

async function testScannerMinimal() {
  try {
    // Initialize
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    // Load language
    const wasmPath = path.join(__dirname, 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Test just an import to see if newlines work there
    const tests = [
      { name: 'Just import', content: 'import foo/bar' },
      { name: 'Import with newline', content: 'import foo/bar\n' },
      { name: 'Two imports', content: 'import foo/bar\nimport baz/qux' },
    ];
    
    for (const test of tests) {
      console.log(`\n=== ${test.name} ===`);
      console.log('Content:', JSON.stringify(test.content));
      
      const tree = parser.parse(test.content);
      const root = tree.rootNode;
      
      console.log('Parse result:');
      printSimpleTree(root);
      
      // Check if we have any ERROR nodes
      const hasError = hasErrorNode(root);
      console.log('Has errors:', hasError);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function printSimpleTree(node, indent = '') {
  const text = node.childCount === 0 ? ` "${node.text}"` : '';
  console.log(`${indent}${node.type}${text}`);
  
  for (const child of node.children) {
    printSimpleTree(child, indent + '  ');
  }
}

function hasErrorNode(node) {
  if (node.type === 'ERROR') return true;
  for (const child of node.children) {
    if (hasErrorNode(child)) return true;
  }
  return false;
}

testScannerMinimal();