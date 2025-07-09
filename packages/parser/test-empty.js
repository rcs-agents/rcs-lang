const Parser = require('tree-sitter');
const RCL = require('./bindings/node');

const parser = new Parser();
parser.setLanguage(RCL);

// Test empty file
console.log('Empty file:');
let tree = parser.parse('');
console.log('Result:', tree.rootNode.toString());

// Test just identifier  
console.log('\nJust identifier:');
tree = parser.parse('TravelBot');
console.log('Result:', tree.rootNode.toString());

// Test import statement
console.log('\nImport statement:');
tree = parser.parse('import Shared/Utils as Utils\n');
console.log('Result:', tree.rootNode.toString());

// Very simple agent - test each component
console.log('\nVery simple agent components:');

// Just the keyword and name
tree = parser.parse('agent TravelBot\n');
console.log('agent TravelBot:', tree.rootNode.toString());

// Add end
tree = parser.parse('agent TravelBot\nend');
console.log('With end:', tree.rootNode.toString());

// Add minimal body
tree = parser.parse(`agent TravelBot
  displayName: "Test"
end`);
console.log('With displayName:', tree.rootNode.toString());