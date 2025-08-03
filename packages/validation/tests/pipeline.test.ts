import { describe, expect, test } from 'bun:test';
import { ValidationPipeline } from '../src/pipeline.js';
import { SemanticValidator } from '../src/validators/semanticValidator.js';
import { SyntaxValidator } from '../src/validators/syntaxValidator.js';

describe('Validation Pipeline', () => {
  test('should add and execute validators', async () => {
    const pipeline = new ValidationPipeline();
    pipeline.addValidator(new SyntaxValidator());
    pipeline.addValidator(new SemanticValidator());

    const validators = pipeline.getValidators();
    expect(validators).toHaveLength(2);
    expect(validators[0].name).toBe('syntax-validator');
    expect(validators[1].name).toBe('semantic-validator');
  });

  test('should reject duplicate validators', () => {
    const pipeline = new ValidationPipeline();
    const validator = new SyntaxValidator();

    pipeline.addValidator(validator);
    expect(() => pipeline.addValidator(validator)).toThrow('already exists');
  });

  test('should validate AST with no errors', async () => {
    const pipeline = new ValidationPipeline();
    pipeline.addValidator(new SyntaxValidator());

    const mockAST = {
      type: 'source_file',
      range: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      walk: (_visitor: any) => {},
      find: (_predicate: any) => null,
      findAll: (_predicate: any) => [],
    };

    const result = await pipeline.validate(mockAST);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.isValid).toBe(true);
      expect(result.value.diagnostics).toHaveLength(0);
    }
  });
});
