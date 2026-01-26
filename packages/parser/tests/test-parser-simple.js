const TreeSitter = require('web-tree-sitter');
const { readFileSync } = require('fs');
const { join } = require('path');


async function testParser() {
  try {
    await TreeSitter.init();
    const parser = new TreeSitter();
    
    // Load the WASM file
    const wasmPath = join(__dirname, '..', 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Test with a simple RCL
    const code = `agent TestAgent
  displayName: "Test Agent"`;
    
    console.log('Parsing:', code);
    const tree = parser.parse(code);
    console.log('Tree:', tree.rootNode.toString());
    
    // Print all nodes
    function printNode(node, indent = '') {
      console.log(`${indent}${node.type} [${node.startIndex}-${node.endIndex}]`);
      for (let i = 0; i < node.childCount; i++) {
        printNode(node.child(i), indent + '  ');
      }
    }
    
    printNode(tree.rootNode);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testParser();