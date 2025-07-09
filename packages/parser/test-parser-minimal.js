const Parser = require('tree-sitter');
const RCL = require('./bindings/node');

const parser = new Parser();
parser.setLanguage(RCL);

// Try each part individually
console.log('\n--- Testing individual parts ---');

// Test agent declaration
const agentCode = 'agent TravelBot';
console.log('\nAgent declaration:', agentCode);
let tree = parser.parse(agentCode);
console.log('Result:', tree.rootNode.toString());

// Test agent with displayName
const agentDisplay = `agent TravelBot
  displayName: "Test"`;
console.log('\nAgent with displayName:', agentDisplay);
tree = parser.parse(agentDisplay);
console.log('Result:', tree.rootNode.toString());

// Test minimal agent
const minimalAgent = `agent TravelBot
  displayName: "Test"
  flow Main
  end
  messages Messages
  end
end`;
console.log('\nMinimal agent:', minimalAgent);
tree = parser.parse(minimalAgent);
console.log('Result:', tree.rootNode.toString());
console.log('Has errors:', tree.rootNode.hasError);

// Check for specific error
if (tree.rootNode.hasError) {
  const walk = (node, depth = 0) => {
    const indent = '  '.repeat(depth);
    if (node.type === 'ERROR') {
      console.log(`${indent}ERROR at ${node.startIndex}-${node.endIndex}: "${node.text}"`);
    }
    for (let i = 0; i < node.childCount; i++) {
      walk(node.child(i), depth + 1);
    }
  };
  walk(tree.rootNode);
}