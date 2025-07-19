import type { ICompilationStage, ICompiler } from '@rcs-lang/core';
import { err, ok } from '@rcs-lang/core';
import { describe, expect, it } from 'vitest';
import { CompilationPipeline } from '../src/pipeline';

describe('CompilationPipeline', () => {
  // Mock stage that transforms data
  class MockTransformStage implements ICompilationStage {
    name = 'mock-transform';

    async process(input: any): Promise<any> {
      return {
        success: true,
        value: {
          ...input,
          transformed: true,
        },
      };
    }
  }

  // Mock stage that adds diagnostics
  class MockValidationStage implements ICompilationStage {
    name = 'mock-validation';

    constructor(private shouldFail = false) { }

    async process(input: any): Promise<any> {
      if (this.shouldFail) {
        return {
          success: false,
          error: new Error('Validation failed'),
        };
      }
      return {
        success: true,
        value: input,
      };
    }
  }

  describe('stage management', () => {
    it('should add and execute stages in order', async () => {
      const pipeline = new CompilationPipeline();
      const executionOrder: string[] = [];

      // Create stages that record execution
      class RecordingStage implements ICompilationStage {
        constructor(public name: string) { }

        async process(input: any): Promise<any> {
          executionOrder.push(this.name);
          return { success: true, value: input };
        }
      }

      pipeline.addStage(new RecordingStage('stage1'));
      pipeline.addStage(new RecordingStage('stage2'));
      pipeline.addStage(new RecordingStage('stage3'));

      const input = {
        source: 'test source',
        uri: 'test://file.rcl',
        ast: { type: 'test' },
      };

      await pipeline.execute(input);

      expect(executionOrder).toEqual(['stage1', 'stage2', 'stage3']);
    });

    it('should clear stages', () => {
      const pipeline = new CompilationPipeline();

      pipeline.addStage(new MockTransformStage());
      pipeline.addStage(new MockValidationStage());

      const stagesBefore = pipeline.getStages();
      expect(stagesBefore).toHaveLength(2);

      pipeline.clearStages();

      const stagesAfter = pipeline.getStages();
      expect(stagesAfter).toHaveLength(0);
    });
  });

  describe('execution', () => {
    it('should pass context through stages', async () => {
      const pipeline = new CompilationPipeline();
      pipeline.addStage(new MockTransformStage());

      const input = {
        source: 'test source',
        uri: 'test://file.rcl',
        ast: { type: 'test', initial: true },
      };

      const result = await pipeline.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.output.initial).toBe(true);
        expect(result.value.output.transformed).toBe(true);
      }
    });

    it('should stop on error when configured', async () => {
      const pipeline = new CompilationPipeline({ stopOnError: true });

      pipeline.addStage(new MockValidationStage(true)); // Will fail
      pipeline.addStage(new MockTransformStage()); // Should not execute

      const input = {
        source: 'test source',
        uri: 'test://file.rcl',
        ast: { type: 'test' },
      };

      const result = await pipeline.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.success).toBe(false);
        expect(result.value.diagnostics.length).toBeGreaterThan(0);
      }
    });

    it('should continue on error when configured', async () => {
      const pipeline = new CompilationPipeline({ stopOnError: false });

      pipeline.addStage(new MockValidationStage(true)); // Will fail
      pipeline.addStage(new MockTransformStage()); // Should still execute

      const input = {
        source: 'test source',
        uri: 'test://file.rcl',
        ast: { type: 'test' },
      };

      const result = await pipeline.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.diagnostics.length).toBeGreaterThan(0);
        expect(result.value.output.transformed).toBe(true); // Transform stage did run
      }
    });
  });

  describe('compiler integration', () => {
    it('should work as a compiler', async () => {
      const pipeline = new CompilationPipeline();
      pipeline.addStage(new MockTransformStage());

      // Use as ICompiler
      const compiler: ICompiler = pipeline;

      const input = {
        source: 'test source',
        uri: 'test://file.rcl',
        ast: { type: 'test' },
      };

      const result = await compiler.compile(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.output.transformed).toBe(true);
      }
    });
  });
});
