const Parser = require('tree-sitter');
const { readFileSync } = require('fs');
const { join } = require('path');

// Load the native RCL language
const RCL = require('../build/Release/tree_sitter_rcl_binding');

const parser = new Parser();
parser.setLanguage(RCL);

const code = `agent Test
  displayName: "Test"`;

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