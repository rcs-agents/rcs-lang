#!/usr/bin/env node

const Parser = require('tree-sitter');
const RCL = require('./bindings/node');
const fs = require('fs');

function parseRclToJson(filePath) {
  const parser = new Parser();
  parser.setLanguage(RCL);
  
  const sourceCode = fs.readFileSync(filePath, 'utf8');
  const tree = parser.parse(sourceCode);
  
  // Convert tree to JSON
  function nodeToJson(node) {
    const result = {
      type: node.type,
      startPosition: node.startPosition,
      endPosition: node.endPosition,
      text: node.text
    };
    
    if (node.children && node.children.length > 0) {
      result.children = node.children.map(child => nodeToJson(child));
    }
    
    return result;
  }
  
  return {
    tree: nodeToJson(tree.rootNode),
    hasError: tree.rootNode.hasError()
  };
}

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node parse-rcl.js <file.rcl>');
    process.exit(1);
  }
  
  try {
    const result = parseRclToJson(filePath);
    console.log(JSON.stringify(result, null, 2));
    
    if (result.hasError) {
      console.error('Parse errors detected!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error parsing file:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

module.exports = { parseRclToJson };