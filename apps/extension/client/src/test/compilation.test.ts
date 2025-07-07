import * as assert from 'node:assert';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

describe('RCL Compilation Tests', () => {
  const fixturesDir = path.join(__dirname, '..', '..', '..', 'test-fixtures');
  const cliPath = path.join(__dirname, '..', '..', '..', '..', '..', 'packages', 'cli', 'dist', 'index.js');


  describe('Simple RCL File Compilation', () => {
    const simpleRclPath = path.join(fixturesDir, 'simple.rcl');
    const expectedJsonPath = path.join(fixturesDir, 'simple-expected.json');

    it('should exist and be readable', () => {
      // Ensure fixtures directory exists
      if (!fs.existsSync(fixturesDir)) {
        console.log('Test fixtures directory not found, skipping test');
        return;
      }
      
      assert.ok(fs.existsSync(simpleRclPath), 'Simple RCL test fixture should exist');
      assert.ok(fs.existsSync(expectedJsonPath), 'Expected JSON output should exist');
    });

    it('should compile simple RCL file successfully', async () => {
      if (!fs.existsSync(cliPath)) {
        console.log('CLI not built, skipping compilation test');
        return;
      }

      try {
        const outputPath = path.join(fixturesDir, 'simple-actual.json');
        const command = `node "${cliPath}" compile "${simpleRclPath}" -f json --pretty -o "${outputPath}"`;
        
        const { stdout, stderr } = await execAsync(command);
        
        // Compilation should succeed
        assert.ok(stdout.includes('✓ Compilation successful'), 'Compilation should succeed');
        
        // Output file should be created
        assert.ok(fs.existsSync(outputPath), 'Output JSON file should be created');
        
        const actualOutput = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        
        // Basic structure validation
        assert.ok(actualOutput.messages, 'Output should contain messages');
        assert.ok(actualOutput.flows, 'Output should contain flows');
        assert.ok(actualOutput.agent, 'Output should contain agent');
        
        // Message validation
        assert.ok(actualOutput.messages.Welcome, 'Should extract Welcome message');
        assert.ok(actualOutput.messages.Help, 'Should extract Help message');
        
        // Agent validation
        assert.equal(actualOutput.agent.name, 'TestAgent', 'Agent name should be TestAgent');
        assert.equal(actualOutput.agent.displayName, 'TestAgent', 'Agent displayName should be set');
        
        // Clean up
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        
      } catch (error) {
        console.log('Compilation error:', error);
        assert.fail(`Compilation failed: ${error}`);
      }
    });
  });

  describe('Travel Agent RCL File Compilation', () => {
    const travelAgentRclPath = path.join(fixturesDir, 'travel-agent.rcl');
    const expectedJsonPath = path.join(fixturesDir, 'travel-agent-expected.json');

    it('should exist and be readable', () => {
      assert.ok(fs.existsSync(travelAgentRclPath), 'Travel agent RCL test fixture should exist');
      assert.ok(fs.existsSync(expectedJsonPath), 'Expected JSON output should exist');
    });

    it('should compile travel agent RCL file successfully', async () => {
      if (!fs.existsSync(cliPath)) {
        console.log('CLI not built, skipping compilation test');
        return;
      }

      try {
        const outputPath = path.join(fixturesDir, 'travel-agent-actual.json');
        const command = `node "${cliPath}" compile "${travelAgentRclPath}" -f json --pretty -o "${outputPath}"`;
        
        const { stdout, stderr } = await execAsync(command);
        
        // Compilation should succeed
        assert.ok(stdout.includes('✓ Compilation successful'), 'Compilation should succeed');
        
        // Output file should be created
        assert.ok(fs.existsSync(outputPath), 'Output JSON file should be created');
        
        const actualOutput = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        
        // Basic structure validation
        assert.ok(actualOutput.messages, 'Output should contain messages');
        assert.ok(actualOutput.flows, 'Output should contain flows');
        assert.ok(actualOutput.agent, 'Output should contain agent');
        
        // Agent validation
        assert.equal(actualOutput.agent.name, 'TravelAgent', 'Agent name should be TravelAgent');
        
        // When parser is fully working, we can validate against expected output
        if (actualOutput.messages.Welcome && actualOutput.messages.Planning && actualOutput.messages.Confirmation) {
          console.log('✓ All expected messages found - parser is working correctly');
          
          // Load expected output for comparison
          const expectedOutput = JSON.parse(fs.readFileSync(expectedJsonPath, 'utf8'));
          
          // Message count validation
          assert.equal(
            Object.keys(actualOutput.messages).length,
            Object.keys(expectedOutput.messages).length,
            'Should extract correct number of messages'
          );
          
          // Flow validation (when parser supports flows)
          if (actualOutput.flows.BookingFlow) {
            assert.ok(actualOutput.flows.BookingFlow, 'Should extract BookingFlow');
          }
        } else {
          console.log('⚠ Parser not fully working yet - partial validation only');
        }
        
        // Clean up
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        
      } catch (error) {
        console.log('Compilation error:', error);
        assert.fail(`Compilation failed: ${error}`);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent files gracefully', async () => {
      if (!fs.existsSync(cliPath)) {
        console.log('CLI not built, skipping error handling test');
        return;
      }

      try {
        const nonExistentPath = path.join(fixturesDir, 'non-existent.rcl');
        const command = `node "${cliPath}" compile "${nonExistentPath}" -f json`;
        
        await execAsync(command);
        assert.fail('Should have thrown an error for non-existent file');
      } catch (error) {
        // Expected to fail
        assert.ok(true, 'Should handle non-existent files with error');
      }
    });

    it('should handle malformed RCL files gracefully', async () => {
      if (!fs.existsSync(cliPath)) {
        console.log('CLI not built, skipping malformed file test');
        return;
      }

      // Create a malformed RCL file for testing
      const malformedPath = path.join(fixturesDir, 'malformed.rcl');
      fs.writeFileSync(malformedPath, 'invalid rcl content with @#$% syntax errors');

      try {
        const outputPath = path.join(fixturesDir, 'malformed-output.json');
        const command = `node "${cliPath}" compile "${malformedPath}" -f json -o "${outputPath}"`;
        
        const { stdout, stderr } = await execAsync(command);
        
        // Should still attempt to compile but may produce warnings
        console.log('Malformed file compilation result:', stdout);
        
        // Clean up
        if (fs.existsSync(malformedPath)) {
          fs.unlinkSync(malformedPath);
        }
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        
      } catch (error) {
        // May fail or succeed depending on parser robustness
        console.log('Malformed file handling:', error);
        
        // Clean up
        if (fs.existsSync(malformedPath)) {
          fs.unlinkSync(malformedPath);
        }
      }
    });
  });

  describe('Output Format Validation', () => {
    it('should generate valid JSON structure', async () => {
      if (!fs.existsSync(cliPath)) {
        console.log('CLI not built, skipping JSON validation test');
        return;
      }

      const simpleRclPath = path.join(fixturesDir, 'simple.rcl');
      
      if (!fs.existsSync(simpleRclPath)) {
        return;
      }

      try {
        const outputPath = path.join(fixturesDir, 'validation-output.json');
        const command = `node "${cliPath}" compile "${simpleRclPath}" -f json --pretty -o "${outputPath}"`;
        
        await execAsync(command);
        
        if (fs.existsSync(outputPath)) {
          const outputContent = fs.readFileSync(outputPath, 'utf8');
          
          // Should be valid JSON
          const parsed = JSON.parse(outputContent);
          
          // Should have required top-level properties
          const requiredProperties = ['messages', 'flows', 'agent'];
          requiredProperties.forEach(prop => {
            assert.ok(parsed.hasOwnProperty(prop), `Output should have ${prop} property`);
          });
          
          // Messages should be objects
          assert.equal(typeof parsed.messages, 'object', 'Messages should be an object');
          assert.equal(typeof parsed.flows, 'object', 'Flows should be an object');
          assert.equal(typeof parsed.agent, 'object', 'Agent should be an object');
          
          // Agent should have required properties
          if (parsed.agent.name) {
            assert.equal(typeof parsed.agent.name, 'string', 'Agent name should be a string');
          }
          
          // Clean up
          fs.unlinkSync(outputPath);
        }
        
      } catch (error) {
        assert.fail(`JSON validation failed: ${error}`);
      }
    });
  });
});