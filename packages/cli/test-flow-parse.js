const fs = require('fs');
const parser = require('@rcl/parser');

// Read the test file
const content = fs.readFileSync('test-flow-parsing.rcl', 'utf8');

// Parse the content
console.log('Parsing content...');
const tree = parser.parse(content);
console.log('Tree:', tree);
console.log('Root node:', tree?.rootNode);

// Function to print tree with indentation
function printTree(node, indent = '') {
  const nodeText = node.text ? ` "${node.text}"` : '';
  console.log(`${indent}${node.type}${nodeText}`);
  
  if (node.children) {
    node.children.forEach(child => {
      printTree(child, indent + '  ');
    });
  }
}

console.log('=== Parsing test-flow-parsing.rcl ===\n');

// Find flow section
function findFlowSection(node) {
  if (node.type === 'flow_section') {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const result = findFlowSection(child);
      if (result) return result;
    }
  }
  return null;
}

if (!tree || !tree.rootNode) {
  console.error('Failed to parse the file!');
  process.exit(1);
}

const flowSection = findFlowSection(tree.rootNode);
if (flowSection) {
  console.log('Flow Section:');
  printTree(flowSection);
  
  // Look for identifiers in flow rules
  console.log('\n=== Checking for lowercase identifiers in flow rules ===');
  function checkIdentifiers(node, path = '') {
    if (node.type === 'identifier') {
      const text = node.text || '';
      if (text && text[0] === text[0].toLowerCase() && text[0].match(/[a-z]/)) {
        console.log(`❌ ERROR: Found lowercase identifier "${text}" at ${path}`);
      } else {
        console.log(`✓ Valid identifier "${text}" at ${path}`);
      }
    }
    
    if (node.children) {
      node.children.forEach((child, i) => {
        checkIdentifiers(child, `${path}/${node.type}[${i}]`);
      });
    }
  }
  
  checkIdentifiers(flowSection);
}

// Also check messages section
console.log('\n=== Checking messages section ===');
function findMessagesSection(node) {
  if (node.type === 'messages_section') {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const result = findMessagesSection(child);
      if (result) return result;
    }
  }
  return null;
}

const messagesSection = findMessagesSection(tree.rootNode);
if (messagesSection) {
  function checkMessageIdentifiers(node, path = '') {
    if (node.type === 'identifier') {
      const text = node.text || '';
      if (text && text[0] === text[0].toLowerCase() && text[0].match(/[a-z]/)) {
        console.log(`❌ ERROR: Found lowercase identifier "${text}" in messages at ${path}`);
      } else {
        console.log(`✓ Valid identifier "${text}" in messages at ${path}`);
      }
    }
    
    if (node.children) {
      node.children.forEach((child, i) => {
        checkMessageIdentifiers(child, `${path}/${node.type}[${i}]`);
      });
    }
  }
  
  checkMessageIdentifiers(messagesSection);
}