import {
  type Diagnostic,
  type ICompilationInput,
  type ICompilationResult,
  type ICompilationStage,
  type ICompiler,
  type ICompilerCapabilities,
  type Result,
  err,
  ok,
} from '@rcs-lang/core';

export interface PipelineOptions {
  stopOnError?: boolean;
}

export class CompilationPipeline implements ICompiler {
  private stages: ICompilationStage[] = [];
  private options: PipelineOptions;

  constructor(options: PipelineOptions = {}) {
    this.options = {
      stopOnError: true,
      ...options,
    };
  }

  addStage(stage: ICompilationStage): void {
    this.stages.push(stage);
  }

  clearStages(): void {
    this.stages = [];
  }

  getStages(): ICompilationStage[] {
    return [...this.stages];
  }

  async execute(input: ICompilationInput): Promise<Result<ICompilationResult>> {
    const diagnostics: Diagnostic[] = [];
    let currentData = input.ast;

    for (const stage of this.stages) {
      const result = await stage.process(currentData);

      if (!result.success) {
        diagnostics.push({
          severity: 'error',
          message: `Stage ${stage.name} failed`,
          code: 'PIPELINE_ERROR',
          source: 'pipeline',
          range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
        });

        if (this.options.stopOnError) {
          return ok({ success: false, diagnostics });
        }
      } else {
        currentData = result.value;
      }
    }

    // Transform final data to ICompilationOutput format
    const output: any = currentData; // This should be the transformed output

    return ok({
      success: true,
      output,
      diagnostics,
    });
  }

  async compile(input: ICompilationInput): Promise<Result<ICompilationResult>> {
    return this.execute(input);
  }

  getCapabilities(): ICompilerCapabilities {
    return {
      outputFormats: ['json', 'js'],
      supportsSourceMaps: false,
      supportsIncremental: false,
      version: '1.0.0',
    };
  }
}
