#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function testParser() {
  try {
    console.log('Testing parser initialization...');
    
    // Import the parser
    const { RCLParser } = require('./dist/utils/parserWrapper');
    
    // Create parser instance
    const parser = new RCLParser();
    
    // Read the RCL file
    const rclPath = path.join(__dirname, '../../examples/realistic.rcl');
    const content = fs.readFileSync(rclPath, 'utf-8');
    
    console.log('Parsing realistic.rcl...');
    
    // Parse the document
    const document = await parser.parseDocument(content, rclPath);
    
    console.log('Parse result:', {
      hasAST: !!document.ast,
      astType: document.ast?.type,
      children: document.ast?.children?.length || 0
    });
    
    // Print the AST structure
    if (document.ast) {
      console.log('\nAST Structure:');
      printAST(document.ast, 0);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function printAST(node, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${node.type} ${node.text ? `"${node.text.substring(0, 50)}..."` : ''}`);
  
  if (node.children && depth < 3) {
    node.children.forEach(child => printAST(child, depth + 1));
  }
}

testParser();