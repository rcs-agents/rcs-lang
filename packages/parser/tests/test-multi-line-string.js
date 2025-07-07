// Test multi-line strings which also use the external scanner
const TreeSitter = require('web-tree-sitter');
const path = require('path');

async function testMultiLineString() {
  try {
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    const wasmPath = path.join(__dirname, '..', 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Multi-line strings use _newline, _indent, and _dedent
    console.log('Testing multi-line strings that use external scanner tokens:\n');
    
    const tests = [
      {
        name: 'Simple multi-line string',
        code: `agent Test
  description: |
    Line 1
    Line 2`
      },
      {
        name: 'Just the multi-line part',
        code: `|
  Line 1
  Line 2`
      }
    ];
    
    for (const test of tests) {
      console.log(`\n=== ${test.name} ===`);
      console.log('Code:', JSON.stringify(test.code));
      
      const tree = parser.parse(test.code);
      console.log('\nTree:', tree.rootNode.toString());
      
      // Check if multi_line_string node exists
      function findNode(node, type) {
        if (node.type === type) return node;
        for (let i = 0; i < node.childCount; i++) {
          const found = findNode(node.child(i), type);
          if (found) return found;
        }
        return null;
      }
      
      const multiLineNode = findNode(tree.rootNode, 'multi_line_string');
      if (multiLineNode) {
        console.log('Found multi_line_string node!');
      } else {
        console.log('No multi_line_string node found');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testMultiLineString();