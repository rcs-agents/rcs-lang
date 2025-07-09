const Parser = require('tree-sitter');
const RCL = require('./bindings/node');

const parser = new Parser();
parser.setLanguage(RCL);

// Test different agent formats
console.log('Testing agent parsing...\n');

// Test 1: Agent with required newline
const test1 = `agent TravelBot
displayName: "Test"
flow Main
end
messages Messages
end
end`;

console.log('Test 1 - with newlines:');
console.log(test1);
let tree = parser.parse(test1);
console.log('Result:', tree.rootNode.toString());
console.log('');

// Test 2: Check what happens without the newline after agent name
const test2 = `agent TravelBot displayName: "Test"
flow Main
end
messages Messages
end
end`;

console.log('Test 2 - without newline after name:');
console.log(test2);
tree = parser.parse(test2);
console.log('Result:', tree.rootNode.toString());
console.log('');

// Test 3: Check agent definition pieces
console.log('Test 3 - checking individual pieces:');

// Just agent + name + newline
tree = parser.parse('agent TravelBot\n');
console.log('agent TravelBot\\n:', tree.rootNode.toString());

// Check if newline is required  
tree = parser.parse('agent TravelBot ');
console.log('agent TravelBot (space):', tree.rootNode.toString());