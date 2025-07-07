const TreeSitter = require('web-tree-sitter');
const fs = require('fs');
const path = require('path');

async function testAgentOnly() {
  try {
    // Initialize
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    // Load language
    const wasmPath = path.join(__dirname, 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Minimal agent with all required parts
    const content = `agent Test
  displayName: "Test"
  flow Main
    :start -> :end
  messages Messages
    agentMessage M
      text "Hi"`;
    
    console.log('Parsing content:');
    console.log(content);
    console.log('\n');
    
    const tree = parser.parse(content);
    const root = tree.rootNode;
    
    console.log('Parse tree:');
    printTree(root);
    
    // Check specific nodes
    if (root.type === 'source_file' && root.children.length > 0) {
      const firstChild = root.children[0];
      console.log('\nFirst child type:', firstChild.type);
      
      if (firstChild.type === 'agent_definition') {
        console.log('Success! Agent definition parsed correctly.');
        console.log('Agent name:', firstChild.childForFieldName('name')?.text);
        console.log('Has body:', !!firstChild.childForFieldName('body'));
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function printTree(node, indent = '') {
  const text = node.childCount === 0 && node.text ? ` "${node.text}"` : '';
  const error = node.type === 'ERROR' ? ' [ERROR]' : '';
  console.log(`${indent}${node.type}${text}${error}`);
  
  for (const child of node.children) {
    printTree(child, indent + '  ');
  }
}

testAgentOnly();