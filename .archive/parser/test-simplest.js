const Parser = require('tree-sitter');
const RCL = require('./bindings/node');

const parser = new Parser();
parser.setLanguage(RCL);

// Test the absolute simplest possible agent
const simplest = `agent Test
  displayName: "x"
  flow F
  end
  messages Messages
  end
end`;

console.log('Simplest possible agent:');
console.log(simplest);
const tree = parser.parse(simplest);
console.log('\nParse tree:', tree.rootNode.toString());

// Walk the tree to see what's happening
const walk = (node, depth = 0) => {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${node.type} [${node.startIndex}-${node.endIndex}]: "${node.text}"`);
  for (let i = 0; i < node.childCount; i++) {
    walk(node.child(i), depth + 1);
  }
};

console.log('\nTree structure:');
walk(tree.rootNode);