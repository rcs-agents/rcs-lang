import { describe, expect, it } from 'vitest';
import { CompilerImpl } from '../src/compiler';

describe('CompilerImpl', () => {
  describe('compile', () => {
    it('should compile valid RCL AST', async () => {
      const compiler = new CompilerImpl();

      // Simple AST structure
      const ast = {
        type: 'source_file',
        children: [
          {
            type: 'agent_definition',
            name: 'TestAgent',
            displayName: 'Test Agent',
            children: [],
          },
        ],
      };

      const input = {
        source: 'test source',
        uri: 'test://file.rcl',
        ast,
      };

      const result = await compiler.compile(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeDefined();
        expect(result.value.success).toBe(true);
      }
    });

    it('should handle null AST', async () => {
      const compiler = new CompilerImpl();

      const input = {
        source: 'test source',
        uri: 'test://file.rcl',
        ast: null,
      };

      const result = await compiler.compile(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.success).toBe(false);
        expect(result.value.diagnostics.length).toBeGreaterThan(0);
      }
    });

    it('should report missing displayName', async () => {
      const compiler = new CompilerImpl();

      // AST without displayName
      const ast = {
        type: 'source_file',
        children: [
          {
            type: 'agent_definition',
            name: 'TestAgent',
            children: [],
          },
        ],
      };

      const input = {
        source: 'test source',
        uri: 'test://file.rcl',
        ast,
      };

      const result = await compiler.compile(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.success).toBe(false);
        const errors = result.value.diagnostics.filter((d) => d.severity === 'error');
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain('displayName');
      }
    });
  });

  describe('configuration', () => {
    it('should use default configuration', () => {
      const compiler = new CompilerImpl();
      const config = compiler.getConfiguration();

      expect(config).toBeDefined();
      expect(config.strict).toBe(true);
    });

    it('should accept custom configuration', () => {
      const customConfig = {
        strict: false,
        allowPartialCompilation: true,
      };

      const compiler = new CompilerImpl(customConfig);
      const config = compiler.getConfiguration();

      expect(config.strict).toBe(false);
      expect(config.allowPartialCompilation).toBe(true);
    });
  });
});
