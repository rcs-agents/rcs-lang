import { type Diagnostic, type Result, err, ok } from '@rcs-lang/core';
import type {
  ICompilationInput,
  ICompilationPipeline,
  ICompilationResult,
  ICompilationStage,
} from '@rcs-lang/core';

/**
 * Implementation of compilation pipeline
 */
export class CompilationPipeline implements ICompilationPipeline {
  private stages: Map<string, ICompilationStage> = new Map();
  private stageOrder: string[] = [];

  /**
   * Add a stage to the pipeline
   */
  addStage(stage: ICompilationStage): void {
    if (this.stages.has(stage.name)) {
      throw new Error(`Stage '${stage.name}' already exists in pipeline`);
    }

    this.stages.set(stage.name, stage);
    this.stageOrder.push(stage.name);
  }

  /**
   * Remove a stage from the pipeline
   */
  removeStage(name: string): void {
    if (!this.stages.has(name)) {
      throw new Error(`Stage '${name}' not found in pipeline`);
    }

    this.stages.delete(name);
    this.stageOrder = this.stageOrder.filter((n) => n !== name);
  }

  /**
   * Execute the pipeline
   */
  async execute(input: ICompilationInput): Promise<Result<ICompilationResult>> {
    const diagnostics: Diagnostic[] = [];
    let currentData: any = input;

    try {
      // Run stages in order
      for (const stageName of this.stageOrder) {
        const stage = this.stages.get(stageName);
        if (!stage) continue;

        // Run stage
        const result = await stage.process(currentData);

        if (!result.success) {
          // Stage failed
          diagnostics.push({
            severity: 'error',
            message: `Stage '${stage.name}' failed: ${result.error.message}`,
            source: 'compilation-pipeline',
          });

          return ok({
            success: false,
            diagnostics,
          });
        }

        // Update current data for next stage
        currentData = result.value;

        // Collect diagnostics if available
        if (currentData.diagnostics) {
          diagnostics.push(...currentData.diagnostics);
        }
      }

      // Check if we have the expected output structure
      if (!currentData.output) {
        return err(new Error('Pipeline did not produce expected output'));
      }

      // Check if the final stage marked success as false or if there are any error diagnostics
      const hasErrors = diagnostics.some((d) => d.severity === 'error');
      const success = currentData.success !== false && !hasErrors;

      return ok({
        output: currentData.output,
        diagnostics,
        success,
      });
    } catch (error) {
      return err(new Error(`Compilation pipeline failed: ${error}`));
    }
  }

  /**
   * Get all stages
   */
  getStages(): ICompilationStage[] {
    return this.stageOrder
      .map((name) => this.stages.get(name))
      .filter((s) => s !== undefined) as ICompilationStage[];
  }

  /**
   * Clear all stages
   */
  clear(): void {
    this.stages.clear();
    this.stageOrder = [];
  }

  /**
   * Set the order of stages
   */
  setStageOrder(order: string[]): void {
    // Validate that all names exist
    for (const name of order) {
      if (!this.stages.has(name)) {
        throw new Error(`Stage '${name}' not found in pipeline`);
      }
    }

    // Validate that all stages are included
    if (order.length !== this.stages.size) {
      throw new Error('Order must include all stages');
    }

    this.stageOrder = order;
  }
}
