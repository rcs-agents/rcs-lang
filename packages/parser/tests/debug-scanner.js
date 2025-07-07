const TreeSitter = require('web-tree-sitter');
const fs = require('fs');
const path = require('path');

async function debugScanner() {
  try {
    // Initialize
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    // Load language
    const wasmPath = path.join(__dirname, '..', 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Simple test content
    const content = `agent Test
  displayName: "Test"`;
    
    console.log('Content to parse:');
    console.log(content);
    console.log('\nContent bytes:');
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const code = content.charCodeAt(i);
      console.log(`  [${i}] '${char === '\n' ? '\\n' : char}' (0x${code.toString(16).padStart(2, '0')})`);
    }
    
    // Get external tokens info
    console.log('\nExternal token names:');
    const externalTokens = language.externalTokens;
    if (externalTokens) {
      externalTokens.forEach((token, i) => {
        console.log(`  [${i}] ${token}`);
      });
    } else {
      console.log('  No external tokens info available');
    }
    
    // Parse and show tree
    const tree = parser.parse(content);
    const root = tree.rootNode;
    
    console.log('\nParse tree:');
    printDetailedTree(root);
    
    // Walk through all nodes
    console.log('\nAll nodes in order:');
    walkTree(root);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function printDetailedTree(node, indent = '') {
  const nodeInfo = `${node.type}`;
  const position = `(${node.startPosition.row},${node.startPosition.column})-(${node.endPosition.row},${node.endPosition.column})`;
  const text = node.text ? ` text="${node.text.replace(/\n/g, '\\n')}"` : '';
  const missing = node.isMissing ? ' [MISSING]' : '';
  const error = node.type === 'ERROR' ? ' [ERROR]' : '';
  
  console.log(`${indent}${nodeInfo} ${position}${text}${missing}${error}`);
  
  for (const child of node.children) {
    printDetailedTree(child, indent + '  ');
  }
}

function walkTree(node, path = '') {
  const position = `(${node.startPosition.row},${node.startPosition.column})`;
  const text = node.text ? ` "${node.text.replace(/\n/g, '\\n')}"` : '';
  
  console.log(`  ${path}${node.type} at ${position}${text}`);
  
  node.children.forEach((child, i) => {
    walkTree(child, path + '  ');
  });
}

debugScanner();