import { RCLCompiler } from '@rcl/compiler';
import { describe, expect, it } from 'vitest';

describe('Parser Error Handling', () => {
  const compiler = new RCLCompiler();

  describe('Syntax Error Detection', () => {
    it('should detect missing agent name', async () => {
      const invalidRcl = `
agent
  displayName: "Test Agent"
`;

      const result = await compiler.compile(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);
      expect(
        result.errors.some(
          (e) =>
            e.message.toLowerCase().includes('agent') ||
            e.message.toLowerCase().includes('identifier'),
        ),
      ).toBe(true);
    });

    it('should detect invalid type tags', async () => {
      const invalidRcl = `
agent TestAgent
  displayName: "Test"
  config
    logoUri: <invalid tag without proper format>
`;

      const result = await compiler.compile(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);
      expect(
        result.errors.some(
          (e) => e.message.toLowerCase().includes('type') || e.message.includes('TT_TYPE_NAME'),
        ),
      ).toBe(true);
    });

    it('should detect missing flow sections', async () => {
      const invalidRcl = `
agent TestAgent
  displayName: "Test Agent"
  # Missing flow section - should be caught by semantic validation
`;

      const result = await compiler.compile(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);
    });

    it('should detect malformed match statements', async () => {
      const invalidRcl = `
agent TestAgent
  displayName: "Test"
  
  flow TestFlow
    start: Start
    
    on Start
      # Invalid match syntax
      "hello" -> NextState
      # Missing match keyword
`;

      const result = await compiler.compile(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);
    });

    it('should detect indentation errors', async () => {
      const invalidRcl = `
agent TestAgent
displayName: "Test"  # Wrong indentation
  
  flow TestFlow
    start: Start
    
    on Start
      match @reply.text
        "hello" -> Start
`;

      const result = await compiler.compile(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);
    });
  });

  describe('Error Position Information', () => {
    it('should provide line and column information for errors', async () => {
      const invalidRcl = `
agent TestAgent
  displayName: "Test"
  
  # Error on line 6
  invalid syntax here
`;

      const result = await compiler.compile(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);

      // Should have position information
      result.errors.forEach((error) => {
        expect(error.line).toBeGreaterThan(0);
        expect(error.column).toBeGreaterThan(0);
      });
    });

    it('should provide error codes for different types of errors', async () => {
      const invalidRcl = `
agent TestAgent
  displayName: "Test"
  unknown_section
    invalid: content
`;

      const result = await compiler.compile(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);

      // Should have error codes
      result.errors.forEach((error) => {
        expect(error.code).toBeDefined();
        expect(typeof error.code).toBe('string');
        expect(error.code.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Parser Recovery', () => {
    it('should continue parsing after syntax errors to find all issues', async () => {
      const multipleErrorsRcl = `
agent TestAgent
  displayName: "Test"
  
  invalid_section
    error: here
  
  another_invalid_section
    more: errors
  
  flow TestFlow
    invalid flow syntax
`;

      const result = await compiler.compile(multipleErrorsRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);

      // Should find multiple distinct errors
      const uniqueLines = new Set(result.errors.map((e) => e.line));
      expect(uniqueLines.size).toBeGreaterThan(1);
    });
  });

  describe('Error Message Quality', () => {
    it('should provide actionable error messages', async () => {
      const invalidRcl = `
agent TestAgent
  displayName: "Test"
  
  flow TestFlow
    # Missing start attribute
    on State1
      match @reply.text
        "test" -> State1
`;

      const result = await compiler.compile(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);

      // Error messages should be helpful
      result.errors.forEach((error) => {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(10);
        expect(error.message).not.toMatch(/undefined|null|object Object/);
      });
    });

    it('should not contain technical parser internals in user-facing messages', async () => {
      const invalidRcl = 'invalid rcl content';

      const result = await compiler.compile(invalidRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength.greaterThan(0);

      // Should not expose internal parser details
      result.errors.forEach((error) => {
        expect(error.message).not.toMatch(/token|lexer|parser|ANTLR/i);
        expect(error.message).not.toMatch(/ctx|node|tree/i);
        expect(error.message).not.toMatch(/\$\{.*\}/); // Template literals
      });
    });
  });
});
