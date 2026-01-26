#!/usr/bin/env node

/**
 * Test to verify Interactive Diagram compilation is fixed
 * This simulates the exact flow that happens when "Open Interactive Diagram" is executed
 */

import * as fs from 'fs';
import * as path from 'path';

async function testInteractiveDiagramFix() {
  console.log('🔍 Testing Interactive Diagram Compilation Fix');
  console.log('===============================================\n');

  const workspaceRoot = path.join(__dirname, '../..');
  const coffeeShopPath = path.join(workspaceRoot, 'examples', 'coffee-shop.rcl');

  console.log('File paths:');
  console.log(`- Workspace: ${workspaceRoot}`);
  console.log(`- Coffee Shop: ${coffeeShopPath}`);
  console.log(`- File exists: ${fs.existsSync(coffeeShopPath)}\n`);

  // Step 1: Test CompilationService (exact same class used by Interactive Diagram)
  console.log('1. Testing CompilationService (Interactive Diagram dependency)');
  console.log('-------------------------------------------------------------');

  try {
    // Import CompilationService exactly as InteractiveDiagramProvider does
    const { CompilationService } = require('./client/out/compilationService');

    console.log('   Creating CompilationService instance...');
    const compilationService = new CompilationService();

    console.log('   Compiling coffee-shop.rcl with CompilationService...');

    // Create a mock VS Code URI (since we can't import vscode in this context)
    const mockUri = { fsPath: coffeeShopPath };
    const result = await compilationService.compileFile(mockUri);

    console.log('   CompilationService result:');
    console.log(`   - Success: ${result.success}`);
    console.log(`   - Success type: ${typeof result.success}`);
    console.log(`   - Has data: ${!!result.data}`);
    console.log(`   - Data type: ${typeof result.data}`);
    console.log(`   - Diagnostics: ${result.diagnostics?.length || 0}`);

    if (result.diagnostics && result.diagnostics.length > 0) {
      console.log('   🚨 DIAGNOSTICS FOUND (these would appear in VS Code):');
      result.diagnostics.forEach((diag, index) => {
        console.log(`   ${index + 1}. [${diag.severity}] ${diag.message}`);
        if (diag.code) console.log(`      Code: ${diag.code}`);
        if (diag.line) console.log(`      Line: ${diag.line}, Column: ${diag.column}`);
      });
    } else {
      console.log('   ✅ No diagnostics found - Interactive Diagram should work!');
    }

    if (result.success && result.data) {
      console.log('\n   📊 Successfully compiled data structure:');
      console.log(`   - Agent: ${result.data.agent?.displayName || 'Unknown'}`);
      console.log(`   - Flows: ${Object.keys(result.data.flows || {}).join(', ')}`);
      console.log(`   - Messages: ${Object.keys(result.data.messages || {}).length} messages`);

      if (result.data.flows?.OrderFlow) {
        const flow = result.data.flows.OrderFlow;
        console.log(`   - OrderFlow states: ${Object.keys(flow.states || {}).length}`);
        console.log(`   - Initial state: ${flow.initial}`);
      }

      console.log('\n   🎯 This data can be converted to Sprotty diagram format!');
    } else {
      console.log('\n   ❌ Compilation failed - Interactive Diagram would show errors');
    }
  } catch (error) {
    console.log(`   ❌ CompilationService failed: ${(error as Error).message}`);
    console.log(`   This would cause Interactive Diagram to fail`);
  }

  // Step 2: Test Sprotty model conversion (simulate what InteractiveDiagramProvider does)
  console.log('\n2. Testing Sprotty Model Conversion');
  console.log('-----------------------------------');

  try {
    const { CompilationService } = require('./client/out/compilationService');
    const compilationService = new CompilationService();
    const mockUri = { fsPath: coffeeShopPath };
    const result = await compilationService.compileFile(mockUri);

    if (result.success && result.data) {
      console.log('   Converting compiled data to Sprotty model...');

      // Simulate the _convertToSprottyModel logic from InteractiveDiagramProvider
      const sprottyModel = {
        type: 'graph',
        id: 'flow-diagram',
        children: [],
      };

      // Add nodes for each state
      if (result.data.flows?.OrderFlow?.states) {
        const states = Object.keys(result.data.flows.OrderFlow.states);
        console.log(`   Creating ${states.length} nodes for states...`);

        states.forEach((stateName, index) => {
          sprottyModel.children.push({
            type: 'node',
            id: `state-${stateName}`,
            position: { x: 100 + (index % 3) * 200, y: 100 + Math.floor(index / 3) * 150 },
            size: { width: 120, height: 60 },
            text: stateName,
          });
        });

        console.log(
          `   ✅ Successfully created Sprotty model with ${sprottyModel.children.length} nodes`,
        );
        console.log('   🎯 This model can be rendered as an interactive diagram!');
      } else {
        console.log('   ❌ No flow states found to convert');
      }
    } else {
      console.log('   ❌ Cannot convert - compilation failed');
    }
  } catch (error) {
    console.log(`   ❌ Sprotty conversion failed: ${(error as Error).message}`);
  }

  // Step 3: Final verification
  console.log('\n3. Final Verification');
  console.log('---------------------');

  try {
    const { CompilationService } = require('./client/out/compilationService');
    const compilationService = new CompilationService();
    const mockUri = { fsPath: coffeeShopPath };
    const result = await compilationService.compileFile(mockUri);

    const isFixed =
      result.success === true && !!result.data && (result.diagnostics?.length || 0) === 0;

    if (isFixed) {
      console.log('   🎉 INTERACTIVE DIAGRAM FIX CONFIRMED!');
      console.log('   =====================================');
      console.log('   ✅ CompilationService returns success: true');
      console.log('   ✅ CompilationService returns valid data');
      console.log('   ✅ CompilationService returns 0 diagnostics');
      console.log('   ✅ Data can be converted to Sprotty diagram format');
      console.log('   ✅ VS Code "Open Interactive Diagram" should now work!');
    } else {
      console.log('   ❌ Interactive Diagram is still broken:');
      console.log(`   - Success: ${result.success}`);
      console.log(`   - Has data: ${!!result.data}`);
      console.log(`   - Diagnostics: ${result.diagnostics?.length || 0}`);
    }
  } catch (error) {
    console.log(`   ❌ Final verification failed: ${(error as Error).message}`);
  }

  console.log('\n===============================================');
  console.log('🎯 Interactive Diagram Test Summary');
  console.log('');
  console.log('This test verifies the exact flow that occurs when:');
  console.log('1. User runs "Open Interactive Diagram" command');
  console.log('2. InteractiveDiagramProvider calls CompilationService.compileFile()');
  console.log('3. CompilationService uses RclProgram to compile the RCL file');
  console.log('4. Result is converted to Sprotty diagram format');
  console.log('');
  console.log('If all steps pass, the Interactive Diagram should work in VS Code!');
}

testInteractiveDiagramFix()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Interactive Diagram test failed:', error);
    process.exit(1);
  });
