// Test indentation handling
const TreeSitter = require('web-tree-sitter');
const fs = require('fs');

async function test() {
  try {
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    const wasmPath = './tree-sitter-rcl.wasm';
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Create a minimal grammar test file
    const grammar = `
module.exports = grammar({
  name: "test_indent",
  
  externals: $ => [
    $._indent,
    $._dedent,
  ],
  
  extras: $ => [
    /[ \\t]/,
    /\\r?\\n/,
  ],
  
  rules: {
    source_file: $ => repeat($.block),
    
    block: $ => seq(
      'block',
      $.identifier,
      $._indent,
      repeat($.statement),
      $._dedent
    ),
    
    statement: $ => seq('stmt', $.identifier),
    
    identifier: $ => /[A-Za-z]+/
  }
});`;
    
    // Write minimal grammar
    fs.writeFileSync('test-indent-grammar.js', grammar);
    
    // Test content
    const content = `block Test
  stmt One
  stmt Two`;
    
    console.log('Testing content:');
    console.log(content);
    console.log('---');
    
    const tree = parser.parse(content);
    const root = tree.rootNode;
    
    function printTree(node, indent = '') {
      console.log(indent + node.type + (node.type === 'ERROR' ? ' ***ERROR***' : ''));
      for (const child of node.children) {
        printTree(child, indent + '  ');
      }
    }
    
    printTree(root);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

test();