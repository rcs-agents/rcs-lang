const Parser = require('tree-sitter');
const RCL = require('./build/Release/tree_sitter_rcl_binding');

const parser = new Parser();
parser.setLanguage(RCL);

// Test the scanner with minimal agent definition
const tests = [
  {
    name: 'Agent with newline and indent',
    code: 'agent Test\n  x'
  },
  {
    name: 'Just agent',
    code: 'agent Test'
  },
  {
    name: 'Agent with body',
    code: 'agent Test\n  displayName: "Test"'
  }
];

for (const test of tests) {
  console.log(`\n=== ${test.name} ===`);
  console.log('Code:', JSON.stringify(test.code));
  
  const tree = parser.parse(test.code);
  console.log('S-expression:', tree.rootNode.toString());
  
  // Walk the tree and show all nodes
  function walk(node, depth = 0) {
    const indent = '  '.repeat(depth);
    const text = node.childCount === 0 ? ` [${JSON.stringify(node.text)}]` : '';
    console.log(`${indent}${node.type}${text}`);
    for (let i = 0; i < node.childCount; i++) {
      walk(node.child(i), depth + 1);
    }
  }
  
  console.log('\nDetailed tree:');
  walk(tree.rootNode);
}