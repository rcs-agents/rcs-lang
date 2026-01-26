import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, map, ok, unwrap } from '../src/result';

describe('Result Type', () => {
  it('should create successful results', () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(42);
    }
  });

  it('should create error results', () => {
    const error = new Error('Test error');
    const result = err(error);
    expect(isOk(result)).toBe(false);
    expect(isErr(result)).toBe(true);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(error);
    }
  });

  it('should map successful results', () => {
    const result = ok(10);
    const mapped = map(result, (x) => x * 2);
    expect(isOk(mapped)).toBe(true);
    if (mapped.success) {
      expect(mapped.value).toBe(20);
    }
  });

  it('should unwrap successful results', () => {
    const result = ok('test');
    expect(unwrap(result)).toBe('test');
  });

  it('should throw when unwrapping errors', () => {
    const error = new Error('Test error');
    const result = err(error);
    expect(() => unwrap(result)).toThrow(error);
  });
});
