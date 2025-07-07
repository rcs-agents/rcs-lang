const Parser = require('tree-sitter');
const RCL = require('./build/Release/tree_sitter_rcl_binding');
const fs = require('fs');

const parser = new Parser();
parser.setLanguage(RCL);

// Read the scanner source to understand the token types
console.log('Scanner token types from enum:');
console.log('NEWLINE = 0');
console.log('INDENT = 1');
console.log('DEDENT = 2');
console.log('');

// Test different inputs to see when external scanner is called
const tests = [
  'agent Test\n  x',
  'agent Test\nx',
  'agent Test\n\n  x',
  'agent Test\n    x',
  'agent Test\r\n  x',
];

for (const input of tests) {
  console.log('\nInput:', JSON.stringify(input));
  const tree = parser.parse(input);
  console.log('Result:', tree.rootNode.toString());
  
  // Check for errors
  if (tree.rootNode.hasError) {
    const cursor = tree.walk();
    function findErrors(cursor) {
      if (cursor.nodeType === 'ERROR') {
        console.log('ERROR at', cursor.startPosition, '-', cursor.endPosition);
      }
      if (cursor.gotoFirstChild()) {
        do {
          findErrors(cursor);
        } while (cursor.gotoNextSibling());
        cursor.gotoParent();
      }
    }
    findErrors(cursor);
  }
}