// Test to verify the scanner issue and potential fix
const TreeSitter = require('web-tree-sitter');
const path = require('path');

async function testScannerFix() {
  try {
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    const wasmPath = path.join(__dirname, '..', 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // The issue: After "agent Test", the parser expects either:
    // 1. End of file (works)
    // 2. A newline followed by agent_body (doesn't work)
    
    console.log('Understanding the parse failure:\n');
    
    // This works - no body
    const works = 'agent Test';
    console.log('Input that works:', JSON.stringify(works));
    let tree = parser.parse(works);
    console.log('Result:', tree.rootNode.toString());
    console.log('Has error:', tree.rootNode.hasError);
    
    // This should work but doesn't - newline after agent
    const broken1 = 'agent Test\n';
    console.log('\nInput that should work:', JSON.stringify(broken1));
    tree = parser.parse(broken1);
    console.log('Result:', tree.rootNode.toString());
    console.log('Has error:', tree.rootNode.hasError);
    
    // Let's see what happens if we try to parse just the indented part
    console.log('\n\nTesting if indent tokens work at all:');
    
    // Try parsing something that should definitely need indent
    const indentTest = `agent Test
  displayName: "Test"`;
    console.log('Full agent with body:', JSON.stringify(indentTest));
    tree = parser.parse(indentTest);
    console.log('Result:', tree.rootNode.toString());
    
    // Walk the tree and show all nodes
    console.log('\nDetailed tree walk:');
    function walkTree(node, depth = 0) {
      const indent = '  '.repeat(depth);
      const pos = `(${node.startPosition.row}:${node.startPosition.column}-${node.endPosition.row}:${node.endPosition.column})`;
      console.log(`${indent}${node.type} ${pos} "${node.text.replace(/\n/g, '\\n')}"`);
      for (let i = 0; i < node.childCount; i++) {
        walkTree(node.child(i), depth + 1);
      }
    }
    walkTree(tree.rootNode);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testScannerFix();