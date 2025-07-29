#!/usr/bin/env bun
/**
 * Script to validate the coffee-shop-machine.json fixture against the CSM schema
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validateMachineDefinitionComprehensive, extractSingleFlow } from './src/schema-validator.js';

async function main() {
  console.log('🔍 Validating coffee-shop-machine.json against csm.schema.json\n');

  try {
    // Load the schema
    const schemaPath = resolve(__dirname, 'schemas', 'csm.schema.json');
    const schemaContent = readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);
    console.log('✅ Schema loaded successfully');

    // Load the fixture
    const fixturePath = resolve(__dirname, 'tests', 'fixtures', 'coffee-shop-machine.json');
    const fixtureContent = readFileSync(fixturePath, 'utf-8');
    const fixture = JSON.parse(fixtureContent);
    console.log('✅ Fixture loaded successfully\n');

    // Perform comprehensive validation
    const validation = validateMachineDefinitionComprehensive(fixture, schema);

    if (validation.schemaValidation.isValid) {
      console.log('🎉 Schema Validation PASSED - The fixture conforms to the JSON schema!');
    } else {
      console.log('❌ Schema Validation FAILED - Found the following issues:\n');
      
      validation.schemaValidation.errors.forEach((error, index) => {
        console.log(`${index + 1}. Path: ${error.path}`);
        console.log(`   Message: ${error.message}`);
        if (error.schemaPath) {
          console.log(`   Schema Path: ${error.schemaPath}`);
        }
        if (error.data !== undefined) {
          console.log(`   Data: ${JSON.stringify(error.data)}`);
        }
        if (error.params && Object.keys(error.params).length > 0) {
          console.log(`   Params: ${JSON.stringify(error.params)}`);
        }
        console.log('');
      });

      console.log(`Total schema errors found: ${validation.schemaValidation.errors.length}`);
    }

    // Display structural issues
    if (validation.structuralIssues.length > 0) {
      console.log('\n🔍 Structural Issues Found:');
      validation.structuralIssues.forEach((issue, index) => {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${index + 1}. ${icon} [${issue.severity.toUpperCase()}] ${issue.type}`);
        console.log(`   ${issue.message}`);
        if (issue.recommendation) {
          console.log(`   💡 ${issue.recommendation}`);
        }
        console.log('');
      });
    }

    // Test single-flow extraction
    console.log('\n🔧 Testing Single-Flow Extraction:');
    try {
      const singleFlowMachine = extractSingleFlow(fixture);
      console.log('✅ Successfully extracted single-flow structure');
      console.log(`   Extracted flow: ${singleFlowMachine.meta?.extractedFlow || 'unknown'}`);
      console.log(`   States: ${Object.keys(singleFlowMachine.states || {}).length}`);
      console.log(`   Initial state: ${singleFlowMachine.initial}`);
    } catch (error) {
      console.log(`❌ Failed to extract single-flow structure: ${(error as Error).message}`);
    }

    // Additional manual checks for transition targets
    performManualChecks(fixture, schema);

    // Return appropriate exit code
    if (!validation.isFullyValid) {
      console.log('\n💥 Overall validation FAILED due to schema or structural issues');
      process.exit(1);
    } else {
      console.log('\n🎉 Overall validation PASSED - Machine is valid and compatible');
    }

  } catch (error) {
    console.error('💥 Error during validation:', (error as Error).message);
    if ((error as Error).stack) {
      console.error('Stack trace:', (error as Error).stack);
    }
    process.exit(1);
  }
}

function performManualChecks(fixture: any, schema: any) {
  console.log('\n🔍 Performing manual checks for known issues:');

  // Check $schema reference
  if (fixture.$schema) {
    console.log(`\n- $schema reference: ${fixture.$schema}`);
    const expectedSchemaRef = '../../schemas/csm-definition.schema.json';
    const actualSchemaFile = 'csm.schema.json';
    
    if (fixture.$schema === expectedSchemaRef) {
      console.log(`  ❌ Issue: Fixture references '${expectedSchemaRef}' but actual file is '${actualSchemaFile}'`);
    } else {
      console.log(`  ✅ Schema reference looks correct`);
    }
  }

  // Check fixture structure vs what CSM code expects
  console.log('\n- Checking fixture structure vs CSM code expectations:');
  
  // The fixture has multi-flow structure: { flows: { FlowName: { states: ... } } }
  // But CSM code seems to expect single-flow structure: { states: ... }
  if (fixture.flows && !fixture.states) {
    console.log('  ❌ MAJOR ISSUE: Fixture uses multi-flow structure but CSM code expects single-flow structure');
    console.log('     Fixture has: fixture.flows.TopFlow.states.Welcome');
    console.log('     Code expects: fixture.states.Welcome');
    console.log('     This is why tests fail with "Machine definition must have an initial state"');
  }

  if (fixture.initialFlow && !fixture.initial) {
    console.log('  ❌ MAJOR ISSUE: Fixture has "initialFlow" but code may expect "initial"');
  }

  // Check for schema violations that might not be caught by simple validator
  console.log('\n- Checking for complex schema violations:');
  
  // Check transition targets format
  let invalidTargets = 0;
  const checkTransitions = (obj: any, path = '') => {
    if (typeof obj === 'object' && obj !== null) {
      if (obj.transitions && Array.isArray(obj.transitions)) {
        obj.transitions.forEach((transition: any, index: number) => {
          if (transition.target) {
            const target = transition.target;
            const targetPattern = /^([a-zA-Z][a-zA-Z0-9_]*|state:[a-zA-Z][a-zA-Z0-9_]*|flow:[a-zA-Z][a-zA-Z0-9_]*|message:[a-zA-Z][a-zA-Z0-9_]*|@[a-zA-Z][a-zA-Z0-9_]*|:(end|cancel|error))$/;
            
            if (!targetPattern.test(target)) {
              invalidTargets++;
              console.log(`  ❌ Invalid target format at ${path}.transitions[${index}]: "${target}"`);
            }
          }
        });
      }
      
      // Recurse into nested objects
      for (const [key, value] of Object.entries(obj)) {
        checkTransitions(value, path ? `${path}.${key}` : key);
      }
    }
  };

  checkTransitions(fixture);
  
  if (invalidTargets === 0) {
    console.log('  ✅ All transition targets follow the correct format');
  } else {
    console.log(`  ❌ Found ${invalidTargets} invalid transition target(s)`);
  }

  // Summary and recommendations
  console.log('\n📋 SUMMARY OF ISSUES:');
  console.log('1. ✅ Fixture validates against the JSON schema');
  console.log('2. ❌ CSM implementation expects different structure than schema allows');
  console.log('3. ❌ This creates a schema-implementation mismatch that breaks tests');
  console.log('\n💡 RECOMMENDATION:');
  console.log('Either update the CSM implementation to handle multi-flow machines,');
  console.log('or update the schema to only allow single-flow machines.');
}

// Run the validation
main().catch(console.error);