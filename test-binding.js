#!/usr/bin/env node

try {
  console.log('Loading tree-sitter...');
  const Parser = require('tree-sitter');
  console.log('Tree-sitter loaded successfully');
  
  console.log('Loading RCL binding...');
  const RCL = require('./bindings/node');
  console.log('RCL binding loaded:', typeof RCL);
  console.log('RCL binding properties:', Object.keys(RCL));
  
  console.log('Creating parser...');
  const parser = new Parser();
  console.log('Parser created');
  
  console.log('Setting language...');
  parser.setLanguage(RCL);
  console.log('Language set successfully');
  
  console.log('Testing simple parse...');
  const tree = parser.parse('agent Test\n  displayName: "Test Agent"');
  console.log('Parse result:', tree);
  
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}