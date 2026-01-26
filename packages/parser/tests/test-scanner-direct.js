const TreeSitter = require('web-tree-sitter');
const fs = require('fs');
const path = require('path');

async function testScanner() {
  try {
    // Initialize
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    // Load language
    const wasmPath = path.join(__dirname, 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Test content with clear indentation
    const testCases = [
      {
        name: 'Simple agent with indented content',
        content: 'agent Test\n  displayName: "Test"'
      },
      {
        name: 'Agent with flow',
        content: 'agent Test\n  displayName: "Test"\n  flow Main\n    :start -> :end'
      },
      {
        name: 'Just import',
        content: 'import foo/bar'
      },
      {
        name: 'Import and agent',
        content: 'import foo/bar\n\nagent Test\n  displayName: "Test"'
      }
    ];
    
    for (const test of testCases) {
      console.log(`\n=== ${test.name} ===`);
      console.log('Content:');
      console.log(test.content.split('\n').map((line, i) => `${i}: "${line}"`).join('\n'));
      
      const tree = parser.parse(test.content);
      const root = tree.rootNode;
      
      console.log('\nParse tree:');
      printTree(root);
      
      // Check for errors
      const errors = findErrors(root);
      if (errors.length > 0) {
        console.log('\nERRORS found:');
        errors.forEach(err => {
          console.log(`  - ${err.type} at (${err.startPosition.row},${err.startPosition.column}): "${err.text}"`);
        });
      }
      
      // Show all tokens
      console.log('\nTokens:');
      showTokens(root);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function printTree(node, indent = '') {
  const nodeInfo = `${node.type}`;
  const position = `(${node.startPosition.row},${node.startPosition.column})-(${node.endPosition.row},${node.endPosition.column})`;
  const text = node.text ? ` "${node.text.replace(/\n/g, '\\n')}"` : '';
  
  console.log(`${indent}${nodeInfo} ${position}${text}`);
  
  for (const child of node.children) {
    printTree(child, indent + '  ');
  }
}

function findErrors(node, errors = []) {
  if (node.type === 'ERROR' || node.isMissing) {
    errors.push(node);
  }
  for (const child of node.children) {
    findErrors(child, errors);
  }
  return errors;
}

function showTokens(node, tokens = []) {
  // Leaf nodes are tokens
  if (node.childCount === 0) {
    tokens.push({
      type: node.type,
      text: node.text,
      start: node.startPosition,
      end: node.endPosition
    });
  }
  
  for (const child of node.children) {
    showTokens(child, tokens);
  }
  
  if (tokens.length > 0 && node === node.tree.rootNode) {
    tokens.forEach(token => {
      console.log(`  ${token.type} at (${token.start.row},${token.start.column}): "${token.text}"`);
    });
  }
  
  return tokens;
}

testScanner();