const TreeSitter = require('web-tree-sitter');
const fs = require('fs');
const path = require('path');

async function test() {
  // Initialize the Parser class
  if (TreeSitter.Parser.init) {
    await TreeSitter.Parser.init();
  }
  
  const parser = new TreeSitter.Parser();
  const wasmPath = path.join(__dirname, '..', 'tree-sitter-rcl.wasm');
  const language = await TreeSitter.Language.load(wasmPath);
  parser.setLanguage(language);
  
  // Check if external scanner is available
  console.log('Language name:', language.name);
  console.log('Field count:', language.fieldCount);
  console.log('Node type count:', language.nodeTypeCount);
  
  // Test very simple cases
  console.log('\n--- Test 1: Empty ---');
  const tree1 = parser.parse('');
  console.log('Tree:', tree1.rootNode.toString());
  
  console.log('\n--- Test 2: Just agent keyword ---');
  const tree2 = parser.parse('agent');
  console.log('Tree:', tree2.rootNode.toString());
  printTree(tree2.rootNode);
  
  console.log('\n--- Test 3: Agent with name ---');
  const tree3 = parser.parse('agent Test');
  console.log('Tree:', tree3.rootNode.toString());
  printTree(tree3.rootNode);
  
  console.log('\n--- Test 4: Agent with name and newline ---');
  const tree4 = parser.parse('agent Test\n');
  console.log('Tree:', tree4.rootNode.toString());
  printTree(tree4.rootNode);
  
  console.log('\n--- Test 5: Agent with indented content ---');
  const tree5 = parser.parse('agent Test\n  displayName: "Test"');
  console.log('Tree:', tree5.rootNode.toString());
  printTree(tree5.rootNode);
  
  // Also test that we can see what valid symbols are expected
  const cursorNode = tree2.rootNode.descendantForIndex(5); // After 'agent'
  if (cursorNode) {
    console.log('\n--- Valid symbols after "agent" ---');
    console.log('Cursor at:', cursorNode.type, cursorNode.text);
  }
  
  parser.delete();
}

function printTree(node, indent = '') {
  console.log(`${indent}${node.type} [${node.startIndex}-${node.endIndex}] "${node.text?.substring(0, 20) || ''}"${node.text?.length > 20 ? '...' : ''}`);
  for (let i = 0; i < node.childCount; i++) {
    printTree(node.child(i), indent + '  ');
  }
}

test().catch(console.error);