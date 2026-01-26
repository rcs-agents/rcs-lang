const TreeSitter = require('web-tree-sitter');
const fs = require('fs');
const path = require('path');

async function inspectWASM() {
  try {
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    const wasmPath = path.join(__dirname, '..', 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Try to get language info
    console.log('Language info:');
    console.log('- Version:', language.version);
    
    // Check field names
    console.log('\nField names:');
    const fieldCount = language.fieldCount;
    for (let i = 0; i < fieldCount; i++) {
      const fieldName = language.fieldNameForId(i);
      console.log(`  [${i}] ${fieldName}`);
    }
    
    // Check node types
    console.log('\nNode types (first 20):');
    const nodeTypeCount = language.nodeTypeCount;
    for (let i = 0; i < Math.min(20, nodeTypeCount); i++) {
      const nodeType = language.nodeTypeForId(i);
      const isNamed = language.nodeTypeIsNamed(i);
      console.log(`  [${i}] ${nodeType} ${isNamed ? '(named)' : '(anonymous)'}`);
    }
    
    // Look for external scanner info
    console.log('\nSearching for external token types:');
    for (let i = 0; i < nodeTypeCount; i++) {
      const nodeType = language.nodeTypeForId(i);
      if (nodeType && (nodeType.includes('newline') || nodeType.includes('indent') || 
          nodeType.includes('dedent') || nodeType.startsWith('_'))) {
        const isNamed = language.nodeTypeIsNamed(i);
        console.log(`  [${i}] ${nodeType} ${isNamed ? '(named)' : '(anonymous)'}`);
      }
    }
    
    // Test parsing with detailed info
    console.log('\n\nTesting parse with agent definition:');
    const code = 'agent Test\n  displayName: "Test"';
    const tree = parser.parse(code);
    
    // Function to show node details
    function showNodeDetails(node, indent = '') {
      const nodeId = node.typeId;
      const nodeType = node.type;
      const isNamed = node.isNamed;
      console.log(`${indent}[${nodeId}] ${nodeType} ${isNamed ? '(named)' : '(anonymous)'} "${node.text.replace(/\n/g, '\\n')}"`);
      
      for (const child of node.children) {
        showNodeDetails(child, indent + '  ');
      }
    }
    
    showNodeDetails(tree.rootNode);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

inspectWASM();