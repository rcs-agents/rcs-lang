#!/usr/bin/env node

const Parser = require('tree-sitter');
const RCL = require('./bindings/node');
const fs = require('fs');

const parser = new Parser();
parser.setLanguage(RCL);

const sourceCode = fs.readFileSync('examples/simple.rcl', 'utf8');
console.log('Source code:');
console.log(sourceCode);
console.log('\n======================\n');

const tree = parser.parse(sourceCode);
console.log('Parse tree:');
console.log(tree.rootNode.toString());
console.log('\n======================\n');

console.log('Has errors:', tree.rootNode.hasError());
console.log('Node type:', tree.rootNode.type);
console.log('Children count:', tree.rootNode.children ? tree.rootNode.children.length : 'no children');