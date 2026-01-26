// Simple test to understand parser output
const TreeSitter = require('web-tree-sitter');
const fs = require('fs');
const path = require('path');

async function test() {
  try {
    // Initialize
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    // Load language
    const wasmPath = './tree-sitter-rcl.wasm';
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Test different content
    const tests = [
      'agent Test',
      'import foo/bar',
      'agent Test\n  displayName: "Test"',
      'agent Test\n\tdisplayName: "Test"',
      'agent Test\n    displayName: "Test"',
    ];
    
    for (const content of tests) {
      console.log('\n=== Testing ===');
      console.log('Content:', JSON.stringify(content));
      console.log('Content (raw):');
      console.log(content);
      
      const tree = parser.parse(content);
      const root = tree.rootNode;
      
      console.log('Root type:', root.type);
      console.log('Children count:', root.children.length);
      console.log('Children:', root.children.map(c => ({
        type: c.type,
        text: c.text.substring(0, 30),
        row: c.startPosition.row,
        col: c.startPosition.column
      })));
      
      // Check for errors
      function findErrors(node) {
        if (node.type === 'ERROR') {
          console.log('ERROR node at', node.startPosition, '-', node.endPosition);
          console.log('ERROR text:', node.text);
        }
        for (const child of node.children) {
          findErrors(child);
        }
      }
      findErrors(root);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

test();