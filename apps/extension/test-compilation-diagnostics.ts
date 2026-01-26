#!/usr/bin/env node

/**
 * Test to identify why diagnostics appear during Interactive Diagram compilation
 * This focuses on the exact compilation step that occurs when opening diagrams
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Compilation Diagnostics Investigation');
console.log('=======================================\n');

const workspaceRoot = path.join(__dirname, '../..');
const coffeeShopPath = path.join(workspaceRoot, 'examples', 'coffee-shop.rcl');

// Test 1: Direct language service compilation
console.log('1. Testing Language Service Compilation');
console.log('--------------------------------------');

try {
  // Import the actual language service that the extension uses
  const { RclProgram } = require('@rcl/language-service');

  console.log('   Creating RclProgram instance...');
  const program = new RclProgram(workspaceRoot);

  console.log('   Compiling coffee-shop.rcl...');
  const result = program.compileFile(coffeeShopPath);

  console.log('   Compilation result:');
  console.log(`   - Success: ${result.success}`);
  console.log(`   - Has data: ${!!result.data}`);
  console.log(`   - Diagnostics count: ${result.diagnostics?.length || 0}`);

  if (result.diagnostics && result.diagnostics.length > 0) {
    console.log('\n   🚨 DIAGNOSTICS FOUND:');
    result.diagnostics.forEach((diag, index) => {
      console.log(`   ${index + 1}. [${diag.severity}] ${diag.message}`);
      if (diag.code) console.log(`      Code: ${diag.code}`);
      if (diag.line) console.log(`      Line: ${diag.line}, Column: ${diag.column}`);
    });

    // Check if these are the same diagnostics you see in VS Code
    console.log('\n   📋 VS Code Diagnostic Format:');
    result.diagnostics.forEach((diag) => {
      console.log(`   {`);
      console.log(`     "message": "${diag.message}",`);
      console.log(
        `     "severity": ${diag.severity === 'error' ? 8 : diag.severity === 'warning' ? 4 : 1},`,
      );
      console.log(`     "code": "${diag.code || 'NO_CODE'}",`);
      console.log(`     "startLineNumber": ${diag.line || 1},`);
      console.log(`     "startColumn": ${diag.column || 1}`);
      console.log(`   },`);
    });
  } else {
    console.log('   ✅ No diagnostics found');
  }

  if (result.success && result.data) {
    console.log('\n   📊 Compiled Data Structure:');
    console.log(`   - Agent: ${result.data.agent?.displayName || 'Unknown'}`);
    console.log(`   - Flows: ${Object.keys(result.data.flows || {}).join(', ')}`);
    console.log(`   - Messages: ${Object.keys(result.data.messages || {}).length} messages`);

    if (result.data.flows?.OrderFlow) {
      const flow = result.data.flows.OrderFlow;
      console.log(`   - OrderFlow states: ${Object.keys(flow.states || {}).length}`);
    }
  }
} catch (error) {
  console.log(`   ❌ Language service compilation failed: ${error.message}`);
  console.log(`   This suggests the issue is in the @rcl/language-service package`);
}

// Test 2: Compare with CLI compilation (which works)
console.log('\n2. Comparing with CLI Compilation');
console.log('--------------------------------');

try {
  const { execSync } = require('child_process');
  const cliOutput = execSync(
    `cd ${workspaceRoot}/apps/cli && npx tsx src/index.ts compile ${coffeeShopPath}`,
    { encoding: 'utf8', timeout: 30000 },
  );

  console.log('   CLI compilation output:');
  console.log(`   ${cliOutput.replace(/\n/g, '\n   ')}`);

  // Check if JSON was generated
  const jsonPath = path.join(workspaceRoot, 'examples', 'coffee-shop.json');
  if (fs.existsSync(jsonPath)) {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(
      `   ✅ CLI generated valid JSON with ${Object.keys(jsonData.flows || {}).length} flows`,
    );
  }
} catch (error) {
  console.log(`   ❌ CLI compilation failed: ${error.message}`);
}

// Test 3: Check if the issue is specific to the compilation service wrapper
console.log('\n3. Testing CompilationService Wrapper');
console.log('------------------------------------');

try {
  // Simulate what the CompilationService does
  const { RclProgram } = require('@rcl/language-service');

  // Create program for workspace (as CompilationService does)
  const workspaceFolder = workspaceRoot;
  const program = new RclProgram(workspaceFolder);

  console.log('   Testing with workspace folder:', workspaceFolder);

  // Compile the file exactly as CompilationService does
  const result = program.compileFile(coffeeShopPath);

  console.log('   CompilationService simulation:');
  console.log(`   - Success: ${result.success}`);
  console.log(`   - Diagnostics: ${result.diagnostics?.length || 0}`);

  if (result.diagnostics && result.diagnostics.length > 0) {
    console.log('\n   🔍 These are the exact diagnostics that appear in VS Code:');
    result.diagnostics.forEach((diag) => {
      console.log(`   - ${diag.message} (${diag.code || 'NO_CODE'})`);
    });
  }
} catch (error) {
  console.log(`   ❌ CompilationService simulation failed: ${error.message}`);
}

// Test 4: Check the coffee-shop.rcl content for potential issues
console.log('\n4. Analyzing coffee-shop.rcl Content');
console.log('----------------------------------');

try {
  const content = fs.readFileSync(coffeeShopPath, 'utf8');

  console.log('   File analysis:');
  console.log(`   - File size: ${content.length} characters`);
  console.log(`   - Lines: ${content.split('\n').length}`);

  // Check for potential issues
  const issues = [];

  if (content.includes('agent Coffee Shop')) {
    issues.push('Agent name has spaces (should be CoffeeShop)');
  }

  if (content.includes('flow Order Flow')) {
    issues.push('Flow name has spaces (should be OrderFlow)');
  }

  if (content.includes('@reply .text')) {
    issues.push('Space in context variable (@reply .text should be @reply.text)');
  }

  if (content.includes('"')) {
    const stringCount = (content.match(/"/g) || []).length;
    if (stringCount % 2 !== 0) {
      issues.push('Unmatched quotes in file');
    }
  }

  // Check for missing required sections
  if (!content.includes('agent ')) {
    issues.push('Missing agent section');
  }

  if (!content.includes('flow ')) {
    issues.push('Missing flow section');
  }

  if (!content.includes('messages Messages')) {
    issues.push('Missing messages section');
  }

  if (issues.length > 0) {
    console.log('   🚨 Potential syntax issues found:');
    issues.forEach((issue) => console.log(`   - ${issue}`));
  } else {
    console.log('   ✅ No obvious syntax issues found');
  }

  // Check line 19 specifically (where your original errors were)
  const lines = content.split('\n');
  if (lines.length >= 19) {
    console.log(`   Line 19 content: "${lines[18]}"`);
  }
} catch (error) {
  console.log(`   ❌ Content analysis failed: ${error.message}`);
}

console.log('\n=======================================');
console.log('🎯 Investigation Summary');
console.log('');
console.log('This test helps identify:');
console.log('1. Whether @rcl/language-service generates diagnostics for coffee-shop.rcl');
console.log('2. If the issue is in the CompilationService wrapper');
console.log('3. If there are syntax issues not caught by the CLI');
console.log('4. The exact diagnostics that will appear in VS Code');
console.log('');
console.log('If diagnostics appear above, those are what VS Code shows.');
console.log('If no diagnostics appear, the issue is elsewhere in the diagram flow.');

process.exit(0);
