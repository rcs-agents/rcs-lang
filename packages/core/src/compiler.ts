import type { Diagnostic } from './diagnostics.js';
import type { IASTNode } from './parser.js';
import type { Result } from './result.js';

/**
 * Compilation input
 */
export interface ICompilationInput {
  source: string;
  uri: string;
  ast?: IASTNode;
}

/**
 * Compilation output
 */
export interface ICompilationOutput {
  agent: any;
  messages: Record<string, any>;
  flows: Record<string, any>;
  csm?: {
    id: string;
    initialFlow: string;
    flows: Record<string, any>;
    meta?: {
      name?: string;
      description?: string;
      version?: string;
      tags?: string[];
      custom?: Record<string, any>;
    };
  };
}

/**
 * Compilation result
 */
export interface ICompilationResult {
  output?: ICompilationOutput;
  diagnostics: Diagnostic[];
  success: boolean;
}

/**
 * Compiler interface
 */
export interface ICompiler {
  /**
   * Compile RCL source to output format
   */
  compile(input: ICompilationInput): Promise<Result<ICompilationResult>>;

  /**
   * Get compiler capabilities
   */
  getCapabilities(): ICompilerCapabilities;
}

/**
 * Compiler capabilities
 */
export interface ICompilerCapabilities {
  outputFormats: string[];
  supportsSourceMaps: boolean;
  supportsIncremental: boolean;
  version: string;
}

/**
 * Compilation stage interface
 */
export interface ICompilationStage {
  name: string;
  process(input: any): Promise<Result<any>>;
}

/**
 * Compilation pipeline interface
 */
export interface ICompilationPipeline {
  /**
   * Add a stage to the pipeline
   */
  addStage(stage: ICompilationStage): void;

  /**
   * Remove a stage from the pipeline
   */
  removeStage(name: string): void;

  /**
   * Execute the pipeline
   */
  execute(input: ICompilationInput): Promise<Result<ICompilationResult>>;

  /**
   * Get all stages
   */
  getStages(): ICompilationStage[];
}
