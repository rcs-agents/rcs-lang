const TreeSitter = require('web-tree-sitter');
const fs = require('fs');
const path = require('path');

async function testComplete() {
  try {
    // Initialize
    await TreeSitter.Parser.init();
    const parser = new TreeSitter.Parser();
    
    // Load language
    const wasmPath = path.join(__dirname, 'tree-sitter-rcl.wasm');
    const language = await TreeSitter.Language.load(wasmPath);
    parser.setLanguage(language);
    
    // Complete valid RCL content
    const content = `agent Test
  displayName: "Test Agent"
  flow Main
    :start -> :end
  messages Messages
    agentMessage Welcome
      text "Hello!"`;
    
    console.log('Content to parse:');
    console.log(content);
    console.log('\nContent lines:');
    content.split('\n').forEach((line, i) => {
      console.log(`  ${i}: "${line}"`);
    });
    
    const tree = parser.parse(content);
    const root = tree.rootNode;
    
    console.log('\nParse tree:');
    printDetailedTree(root);
    
    // Check for errors
    const errors = findErrors(root);
    if (errors.length > 0) {
      console.log('\nERRORS found:');
      errors.forEach(err => {
        console.log(`  - ${err.type} at (${err.startPosition.row},${err.startPosition.column}): "${err.text.substring(0, 50)}..."`);
      });
    } else {
      console.log('\nNo errors! Parse successful!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function printDetailedTree(node, indent = '') {
  const nodeInfo = `${node.type}`;
  const position = `(${node.startPosition.row},${node.startPosition.column})-(${node.endPosition.row},${node.endPosition.column})`;
  const text = node.childCount === 0 && node.text ? ` text="${node.text.replace(/\n/g, '\\n')}"` : '';
  const missing = node.isMissing ? ' [MISSING]' : '';
  const error = node.type === 'ERROR' ? ' [ERROR]' : '';
  
  console.log(`${indent}${nodeInfo} ${position}${text}${missing}${error}`);
  
  for (const child of node.children) {
    printDetailedTree(child, indent + '  ');
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

testComplete();