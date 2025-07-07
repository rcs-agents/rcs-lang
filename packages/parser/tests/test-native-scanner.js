const Parser = require('tree-sitter');
const Rcl = require('../build/Release/tree_sitter_rcl_binding');
const fs = require('fs');

// Create parser and set language
const parser = new Parser();
parser.setLanguage(Rcl);

// Test content
const testContent = `agent Test
  displayName: "Test Agent"
  brandName: "Test"`;

console.log('Testing native parser with external scanner...\n');
console.log('Content:');
console.log(testContent);
console.log('\n' + '='.repeat(50) + '\n');

// Parse the content
const tree = parser.parse(testContent);

// Print the tree
console.log('Parse tree:');
console.log(tree.rootNode.toString());

// Function to walk the tree and show all nodes
function walkTree(node, indent = '') {
  const nodeType = node.type;
  const text = node.text ? ` "${node.text.replace(/\n/g, '\\n')}"` : '';
  console.log(`${indent}${nodeType}${text}`);
  
  for (let i = 0; i < node.childCount; i++) {
    walkTree(node.child(i), indent + '  ');
  }
}

console.log('\nDetailed tree:');
walkTree(tree.rootNode);

// Check for errors
const hasErrors = tree.rootNode.hasError();
console.log(`\nHas errors: ${hasErrors}`);

// Test just the scanner behavior with newlines
console.log('\n' + '='.repeat(50) + '\n');
console.log('Testing newline handling:');

const newlineTests = [
  'agent Test\n',
  'agent Test\n  displayName: "Test"',
  'agent Test\n  displayName: "Test"\n  brandName: "Brand"'
];

for (const test of newlineTests) {
  console.log(`\nTest: ${JSON.stringify(test)}`);
  const testTree = parser.parse(test);
  console.log(`Result: ${testTree.rootNode.toString()}`);
}