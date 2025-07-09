const Parser = require('tree-sitter');
const RCL = require('./bindings/node');

const parser = new Parser();
parser.setLanguage(RCL);

// Test basic tokens
console.log('Testing basic tokens:');

const tests = [
  'agent',
  'TravelBot',
  'displayName',
  ':',
  '"Test"',
  'flow',
  'Main',
  'end',
  'messages',
  'Messages'
];

for (const test of tests) {
  const tree = parser.parse(test);
  console.log(`"${test}" -> ${tree.rootNode.toString()}`);
}