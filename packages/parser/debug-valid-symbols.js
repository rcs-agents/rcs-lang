const Parser = require('tree-sitter');
const RCL = require('./build/Release/tree_sitter_rcl_binding');

const parser = new Parser();
parser.setLanguage(RCL);

// Parse up to a specific point and see what's expected
const code = 'agent Test';
const tree = parser.parse(code);

console.log('Parse tree:', tree.rootNode.toString());

// Try to parse with partial input to see what's expected
const partial = 'agent Test\n';
const tree2 = parser.parse(partial);
console.log('\nWith newline:', tree2.rootNode.toString());

// Check if we're getting the right token types
const code3 = `agent Test
  displayName: "Test"`;
const tree3 = parser.parse(code3);

function walkTree(node, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${node.type} [${node.startPosition.row}:${node.startPosition.column}-${node.endPosition.row}:${node.endPosition.column}]`);
  if (node.childCount === 0 && node.type !== 'agent' && node.type !== 'identifier') {
    console.log(`${indent}  text: "${node.text.replace(/\n/g, '\\n')}"`);
  }
  for (let i = 0; i < node.childCount; i++) {
    walkTree(node.child(i), depth + 1);
  }
}

console.log('\nDetailed parse tree with positions:');
walkTree(tree3.rootNode);