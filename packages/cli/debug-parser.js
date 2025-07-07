#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function debugParser() {
  try {
    console.log('=== Testing RCL Parser ===\n');
    
    // Import the parser wrapper
    const { RCLParser } = require('./dist/utils/parserWrapper');
    
    // Import extractors
    const { MessageNormalizer } = require('./dist/normalizers/messageNormalizer');
    const { AgentExtractor } = require('./dist/extractors/agentExtractor');
    const { FlowCompiler } = require('./dist/compilers/flowCompiler');
    
    // Create parser instance
    const parser = new RCLParser();
    
    // Read the RCL file
    const rclPath = path.join(__dirname, 'test-simple.rcl');
    const content = fs.readFileSync(rclPath, 'utf-8');
    
    console.log('Input RCL content:');
    console.log('-------------------');
    console.log(content);
    console.log('-------------------\n');
    
    // Parse the document
    const document = await parser.parseDocument(content, rclPath);
    
    console.log('Parse result:', {
      hasAST: !!document.ast,
      astType: document.ast?.type,
      children: document.ast?.children?.length || 0
    });
    
    if (!document.ast) {
      console.log('ERROR: No AST generated!');
      return;
    }
    
    // Print the AST structure
    console.log('\nAST Structure:');
    printAST(document.ast, 0);
    
    // Extract components
    console.log('\n=== Extracting Components ===\n');
    
    const agentExtractor = new AgentExtractor();
    const agent = agentExtractor.extractAgentConfig(document.ast);
    console.log('Agent config:', JSON.stringify(agent, null, 2));
    
    const messageNormalizer = new MessageNormalizer();
    const messages = messageNormalizer.extractAndNormalize(document.ast);
    console.log('\nMessages:', JSON.stringify(messages, null, 2));
    
    const flowCompiler = new FlowCompiler();
    const flows = flowCompiler.compileFlows(document.ast);
    console.log('\nFlows:', JSON.stringify(flows, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
    console.error(error.stack);
  }
}

function printAST(node, depth = 0) {
  const indent = '  '.repeat(depth);
  let nodeInfo = `${indent}${node.type}`;
  
  if (node.text && node.text.length < 50) {
    nodeInfo += ` "${node.text}"`;
  }
  
  console.log(nodeInfo);
  
  if (node.children && depth < 5) {
    node.children.forEach(child => printAST(child, depth + 1));
  } else if (node.children && node.children.length > 0) {
    console.log(`${indent}  ... (${node.children.length} more children)`);
  }
}

debugParser();