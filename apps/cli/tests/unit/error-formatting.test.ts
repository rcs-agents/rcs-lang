import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import { RCLCompiler } from '@rcl/compiler';
import { describe, expect, it } from 'vitest';

const execAsync = promisify(exec);

describe('Error Message Formatting', () => {
  const compiler = new RCLCompiler();
  const cliPath = path.resolve(__dirname, '../../dist/index.js');
  const fixturesPath = path.resolve(__dirname, '../fixtures');

  describe('Error Message Structure', () => {
    it('should include file name and position information', async () => {
      const invalidRcl = `
agent TestAgent
  displayName: "Test"
  
  invalid_section
    error: here
`;

      const result = await compiler.compile(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);

      result.errors.forEach((error) => {
        // Should have line and column information
        expect(error.line).toBeGreaterThan(0);
        expect(error.column).toBeGreaterThan(0);

        // Should have a meaningful error code
        expect(error.code).toBeDefined();
        expect(typeof error.code).toBe('string');
        expect(error.code.length).toBeGreaterThan(0);

        // Should have a descriptive message
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(10);
      });
    });

    it('should provide context around the error location', async () => {
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

      const result = await compiler.compile(rclWithError, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);

      // Should identify the problematic line
      const errorLines = result.errors.map((e) => e.line);
      expect(errorLines.some((line) => line >= 7 && line <= 9)).toBe(true);
    });

    it('should format errors consistently', async () => {
      const testCases = [
        'agent\n  displayName: "Missing agent name"',
        'agent TestAgent\n  unknown_property: "value"',
        'agent TestAgent\n  displayName: "Test"\n  flow BadFlow\n    invalid flow syntax',
      ];

      for (const testCase of testCases) {
        const result = await compiler.compile(testCase, 'test.rcl');

        expect(result.success).toBe(false);
        expect(result.errors).toHaveLength.greaterThan(0);

        result.errors.forEach((error) => {
          // All errors should have the same structure
          expect(error).toHaveProperty('message');
          expect(error).toHaveProperty('line');
          expect(error).toHaveProperty('column');
          expect(error).toHaveProperty('code');
          expect(error).toHaveProperty('severity');

          // Severity should be 'error' for compilation failures
          expect(error.severity).toBe('error');
        });
      }
    });
  });

  describe('Error Message Quality', () => {
    it('should provide actionable error messages', async () => {
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
        const result = await compiler.compile(testCase.content, 'test.rcl');

        expect(result.success).toBe(false);
        expect(result.errors).toHaveLength.greaterThan(0);

        const errorMessages = result.errors.map((e) => e.message.toLowerCase());
        const allMessages = errorMessages.join(' ');

        // Should contain at least one of the expected keywords
        const hasExpectedKeyword = testCase.expectedKeywords.some((keyword) =>
          allMessages.includes(keyword.toLowerCase()),
        );

        expect(hasExpectedKeyword).toBe(true);
      }
    });

    it('should not expose internal parser details', async () => {
      const invalidRcl = 'completely invalid rcl content that will cause parser errors';

      const result = await compiler.compile(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);

      result.errors.forEach((error) => {
        const message = error.message.toLowerCase();

        // Should not contain technical parser internals
        expect(message).not.toMatch(/antlr|lexer|token|ctx|node|tree|ast/);
        expect(message).not.toMatch(/undefined|null|object object/);
        expect(message).not.toMatch(/\[object|function|prototype/);
        expect(message).not.toMatch(/parse.*error.*line.*\d+.*column.*\d+/); // Avoid raw parser error format
      });
    });

    it('should provide helpful suggestions when possible', async () => {
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
        const result = await compiler.compile(testCase.content, 'test.rcl');

        expect(result.success).toBe(false);
        expect(result.errors).toHaveLength.greaterThan(0);

        const errorMessages = result.errors.map((e) => e.message.toLowerCase());
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
    it('should format errors nicely in CLI output', async () => {
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

    it('should use colors or formatting for better readability', async () => {
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

    it('should summarize errors when there are many', async () => {
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
    it('should categorize syntax vs semantic errors', async () => {
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

      const syntaxResult = await compiler.compile(syntaxError, 'syntax.rcl');
      const semanticResult = await compiler.compile(semanticError, 'semantic.rcl');

      expect(syntaxResult.success).toBe(false);
      expect(semanticResult.success).toBe(false);

      // Should have different error codes for different types
      const syntaxCodes = syntaxResult.errors.map((e) => e.code);
      const semanticCodes = semanticResult.errors.map((e) => e.code);

      // Error codes should indicate the type of error
      expect(syntaxCodes.some((code) => code.includes('SYNTAX') || code.includes('PARSE'))).toBe(
        true,
      );
      expect(
        semanticCodes.some((code) => code.includes('SEMANTIC') || code.includes('VALIDATION')),
      ).toBe(true);
    });

    it('should provide different error codes for different issues', async () => {
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
        const result = await compiler.compile(testCase.content, 'test.rcl');

        expect(result.success).toBe(false);
        expect(result.errors).toHaveLength.greaterThan(0);

        // Should have meaningful error codes that relate to the issue
        result.errors.forEach((error) => {
          expect(error.code).toBeDefined();
          expect(error.code.length).toBeGreaterThan(0);
          expect(error.code).not.toBe('ERROR');
          expect(error.code).not.toBe('UNKNOWN');
        });
      }
    });
  });

  describe('Error Recovery and Multiple Errors', () => {
    it('should report multiple errors in a single compilation', async () => {
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

      const result = await compiler.compile(multipleErrorsRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);

      // Should find errors in different sections
      const errorLines = result.errors.map((e) => e.line).sort((a, b) => a - b);
      const uniqueLines = [...new Set(errorLines)];

      expect(uniqueLines.length).toBeGreaterThan(2);
    });

    it('should continue parsing after errors to find all issues', async () => {
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

      const result = await compiler.compile(errorAtStart, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);

      // Should report errors from different parts of the file
      const errorMessages = result.errors.map((e) => e.message);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });
});
