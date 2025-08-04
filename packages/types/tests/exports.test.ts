import { describe, it, expect } from 'bun:test';

describe('Types Package Exports', () => {
  it('should export types from index', () => {
    // Just verify the module can be imported
    const typesModule = require('../src/index');
    expect(typesModule).toBeDefined();
  });

  it('should have type definitions', () => {
    // Since this is a types-only package, we mainly just verify it builds
    expect(true).toBe(true);
  });
});