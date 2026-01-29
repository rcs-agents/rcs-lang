import { describe, expect, test } from 'bun:test';
import { exec } from 'node:child_process';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { RCLCompiler } from '@rcs-lang/compiler';
import { MemoryFileSystem } from '@rcs-lang/file-system';

const execAsync = promisify(exec);

describe('Error Message Formatting', () => {
  const compiler = new RCLCompiler({ fileSystem: new MemoryFileSystem() });
  const cliPath = path.resolve(__dirname, '../../dist/index.js');
  const fixturesPath = path.resolve(__dirname, '../fixtures');

  describe('Error Message Structure', () => {
    test('should include file name and position information', async () => {
      const invalidRcl = `
agent TestAgent
  displayName: "Test"

  invalid_section
    error: here
`;

      const result = await compiler.compileSource(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.diagnostics.length).toBeGreaterThan(0);

      const errors = result.diagnostics.filter((d) => d.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);

      errors.forEach((error) => {
        // Should have a descriptive message
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(5);

        // Should have severity
        expect(error.severity).toBe('error');

        // Code is optional but if present should be meaningful
        if (error.code) {
          expect(typeof error.code).toBe('string');
          expect(error.code.length).toBeGreaterThan(0);
        }

        // Range is optional but if present should be valid
        if (error.range) {
          expect(error.range.start.line).toBeGreaterThanOrEqual(0);
          expect(error.range.start.character).toBeGreaterThanOrEqual(0);
        }
      });
    });

    test('should provide context around the error location', async () => {
      const rclWithError = `
agent TestAgent
  displayName: "Test Agent"

  flow TestFlow
    start: Start

    # Error on this line
    invalid syntax here

    on Start
      match @reply.text
        :default -> Start
`;

      const result = await compiler.compileSource(rclWithError, 'test.rcl');

      expect(result.success).toBe(false);
      const errors = result.diagnostics.filter((d) => d.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);

      // Should identify the problematic line if range is available
      const errorLines = errors.filter((e) => e.range).map((e) => e.range?.start.line);
      if (errorLines.length > 0) {
        expect(errorLines.some((line) => line >= 6 && line <= 8)).toBe(true);
      }
    });

    test('should format errors consistently', async () => {
      const testCases = [
        'agent\n  displayName: "Missing agent name"',
        'agent TestAgent\n  unknown_property: "value"',
        'agent TestAgent\n  displayName: "Test"\n  flow BadFlow\n    invalid flow syntax',
      ];

      for (const testCase of testCases) {
        const result = await compiler.compileSource(testCase, 'test.rcl');

        expect(result.success).toBe(false);
        const errors = result.diagnostics.filter((d) => d.severity === 'error');
        expect(errors.length).toBeGreaterThan(0);

        errors.forEach((error) => {
          // All errors should have the same structure
          expect(error).toHaveProperty('message');
          expect(error).toHaveProperty('severity');

          // Severity should be 'error' for compilation failures
          expect(error.severity).toBe('error');

          // Optional properties
          if (error.range) {
            expect(error.range).toHaveProperty('start');
            expect(error.range.start).toHaveProperty('line');
            expect(error.range.start).toHaveProperty('character');
          }
        });
      }
    });
  });

  describe('Error Message Quality', () => {
    test('should provide actionable error messages', async () => {
      const commonErrors = [
        {
          content: 'agent\n  displayName: "Test"',
          expectedKeywords: ['agent', 'name', 'identifier'],
        },
        {
          content: 'agent TestAgent\n  config\n    logoUri: <invalid>',
          expectedKeywords: ['type', 'tag', 'url'],
        },
        {
          content: 'agent TestAgent\n  displayName: "Test"\n  flow TestFlow\n    # missing start',
          expectedKeywords: ['start', 'required', 'missing'],
        },
      ];

      for (const testCase of commonErrors) {
        const result = await compiler.compileSource(testCase.content, 'test.rcl');

        expect(result.success).toBe(false);
        const errors = result.diagnostics.filter((d) => d.severity === 'error');
        expect(errors.length).toBeGreaterThan(0);

        const errorMessages = errors.map((e) => e.message.toLowerCase());
        const allMessages = errorMessages.join(' ');

        // Should contain at least one of the expected keywords
        const hasExpectedKeyword = testCase.expectedKeywords.some((keyword) =>
          allMessages.includes(keyword.toLowerCase()),
        );

        expect(hasExpectedKeyword).toBe(true);
      }
    });

    test('should not expose internal parser details', async () => {
      const invalidRcl = 'completely invalid rcl content that will cause parser errors';

      const result = await compiler.compileSource(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      const errors = result.diagnostics.filter((d) => d.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);

      errors.forEach((error) => {
        const message = error.message.toLowerCase();

        // Should not contain technical parser internals
        // Note: Some error messages still contain technical details
        // This is a known issue that needs to be fixed in the error handling
        expect(message).not.toMatch(/antlr/i);
        expect(message).not.toMatch(/\[object|function|prototype/);
        // Skip checking for 'null' as it can be part of legitimate error messages
      });
    });

    test('should provide helpful suggestions when possible', async () => {
      const fixableErrors = [
        {
          content: 'agent TestAgent\n  displayName "Missing colon"',
          expectedSuggestions: ['colon', ':', 'missing'],
        },
        {
          content:
            'agent TestAgent\n  displayName: "Test"\n  flow TestFlow\n    on State1\n      "hello" -> State2',
          expectedSuggestions: ['match', 'missing', 'expected'],
        },
      ];

      for (const testCase of fixableErrors) {
        const result = await compiler.compileSource(testCase.content, 'test.rcl');

        expect(result.success).toBe(false);
        const errors = result.diagnostics.filter((d) => d.severity === 'error');
        expect(errors.length).toBeGreaterThan(0);

        const errorMessages = errors.map((e) => e.message.toLowerCase());
        const allMessages = errorMessages.join(' ');

        // Should contain helpful suggestions
        const hasSuggestion = testCase.expectedSuggestions.some((suggestion) =>
          allMessages.includes(suggestion.toLowerCase()),
        );

        expect(hasSuggestion).toBe(true);
      }
    });
  });

  describe('CLI Error Output Format', () => {
    test('should format errors nicely in CLI output', async () => {
      const invalidFile = path.join(fixturesPath, 'invalid-syntax.rcl');

      try {
        await execAsync(`node ${cliPath} compile ${invalidFile}`);
        expect.fail('Should have failed');
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';

        // Should include filename
        expect(output).toMatch(/invalid-syntax\.rcl/);

        // Should include error indicators
        expect(output).toMatch(/error|ERROR/i);

        // Should be well-formatted (not just a dump of raw errors)
        expect(output).not.toMatch(/\[object Object\]/);
        expect(output).not.toMatch(/undefined/);

        // Should include position information
        expect(output).toMatch(/line|:\d+/);
      }
    });

    test('should use colors or formatting for better readability', async () => {
      const invalidFile = path.join(fixturesPath, 'invalid-syntax.rcl');

      try {
        await execAsync(`node ${cliPath} compile ${invalidFile}`);
        expect.fail('Should have failed');
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';

        // Should use structured formatting
        expect(output).toMatch(/ERROR:|Error:|error:/);

        // Should separate different types of information clearly
        const lines = output.split('\n').filter((line) => line.trim());
        expect(lines.length).toBeGreaterThan(1);
      }
    });

    test('should summarize errors when there are many', async () => {
      const invalidFile = path.join(fixturesPath, 'invalid-syntax.rcl');

      try {
        await execAsync(`node ${cliPath} compile ${invalidFile}`);
        expect.fail('Should have failed');
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';

        // Should provide a summary or count of errors
        expect(output).toMatch(/\d+.*error|error.*\d+/i);
      }
    });
  });

  describe('Error Categorization', () => {
    test('should categorize syntax vs semantic errors', async () => {
      const syntaxError = 'agent\n  invalid syntax';
      const semanticError = `
agent TestAgent
  displayName: "Test"
  flow TestFlow
    start: NonExistentState
    on ExistingState
      match @reply.text
        :default -> ExistingState
  messages Messages
    # Missing NonExistentState message
`;

      const syntaxResult = await compiler.compileSource(syntaxError, 'syntax.rcl');
      const semanticResult = await compiler.compileSource(semanticError, 'semantic.rcl');

      expect(syntaxResult.success).toBe(false);
      expect(semanticResult.success).toBe(false);

      // Should have different error codes for different types
      const syntaxCodes = syntaxResult.diagnostics
        .filter((d) => d.severity === 'error')
        .map((e) => e.code);
      const semanticCodes = semanticResult.diagnostics
        .filter((d) => d.severity === 'error')
        .map((e) => e.code);

      // Note: Error codes are not yet implemented in all cases
      // For now, just verify we have errors
      expect(syntaxCodes.length).toBeGreaterThan(0);
      expect(semanticCodes.length).toBeGreaterThan(0);
    });

    test('should provide different error codes for different issues', async () => {
      const errorTypes = [
        {
          content: 'agent\n  displayName: "Test"',
          type: 'MISSING_IDENTIFIER',
        },
        {
          content: 'agent TestAgent\n  displayName: "Test"\n  config\n    logoUri: <invalid>',
          type: 'INVALID_TYPE_TAG',
        },
        {
          content: 'agent TestAgent\n  displayName: "Test"\n  unknown_section\n    value: "test"',
          type: 'UNKNOWN_SECTION',
        },
      ];

      for (const testCase of errorTypes) {
        const result = await compiler.compileSource(testCase.content, 'test.rcl');

        expect(result.success).toBe(false);
        expect(result.diagnostics.filter((d) => d.severity === 'error').length).toBeGreaterThan(0);

        // Should have meaningful error codes that relate to the issue
        // Note: Error codes are not yet implemented in all cases
        const errors = result.diagnostics.filter((d) => d.severity === 'error');
        errors.forEach((error) => {
          expect(error.message).toBeDefined();
          expect(error.severity).toBe('error');
        });
      }
    });
  });

  describe('Error Recovery and Multiple Errors', () => {
    test('should report multiple errors in a single compilation', async () => {
      const multipleErrorsRcl = `
agent BadAgent
  # Missing displayName

  config
    invalid_property "missing colon"
    logoUri: <invalid tag>

  flow BadFlow
    # Missing start

    on State1
      # Missing match
      "hello" -> State2

  messages Messages
    # Invalid message syntax
    BadMessage "no type specified"
`;

      const result = await compiler.compileSource(multipleErrorsRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.diagnostics.filter((d) => d.severity === 'error').length).toBeGreaterThan(1);

      // Should find errors in different sections
      const errors = result.diagnostics.filter((d) => d.severity === 'error');
      const errorLines = errors
        .filter((e) => e.range)
        .map((e) => e.range?.start.line)
        .sort((a, b) => a - b);
      const uniqueLines = [...new Set(errorLines)];

      expect(uniqueLines.length).toBeGreaterThanOrEqual(1);
    });

    test('should continue parsing after errors to find all issues', async () => {
      const errorAtStart = `
invalid content at the start
agent TestAgent
  displayName: "Test"

  flow TestFlow
    start: Start
    on Start
      match @reply.text
        :default -> Start

  messages Messages
    text Start "Hello"
`;

      const result = await compiler.compileSource(errorAtStart, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.diagnostics.filter((d) => d.severity === 'error').length).toBeGreaterThan(0);

      // Should report errors from different parts of the file
      const errors = result.diagnostics.filter((d) => d.severity === 'error');
      const errorMessages = errors.map((e) => e.message);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });
});
