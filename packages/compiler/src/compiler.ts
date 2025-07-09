import { Result, ok, err } from '@rcl/core-types';
import { 
  ICompiler, 
  ICompilationInput, 
  ICompilationResult,
  ICompilerCapabilities,
  IFileSystem
} from '@rcl/core-interfaces';
import { CompilationPipeline } from './pipeline/compilationPipeline';
import { ParseStage, ValidateStage, TransformStage } from './stages';
import { FileSystemFactory } from '@rcl/file-system';

export interface CompilerOptions {
  fileSystem?: IFileSystem;
  strict?: boolean;
}

/**
 * RCL Compiler implementation
 */
export class RCLCompiler implements ICompiler {
  private pipeline: CompilationPipeline;
  private fileSystem: IFileSystem;
  
  constructor(options: CompilerOptions = {}) {
    this.fileSystem = options.fileSystem || FileSystemFactory.getDefault();
    
    // Set up default pipeline
    this.pipeline = new CompilationPipeline();
    this.pipeline.addStage(new ParseStage());
    this.pipeline.addStage(new ValidateStage());
    this.pipeline.addStage(new TransformStage());
  }
  
  /**
   * Compile RCL source to output format
   */
  async compile(input: ICompilationInput): Promise<Result<ICompilationResult>> {
    try {
      // Execute pipeline
      const result = await this.pipeline.execute(input);
      
      if (!result.success) {
        return err(result.error);
      }
      
      return ok(result.value);
    } catch (error) {
      return err(new Error(`Compilation failed: ${error}`));
    }
  }
  
  /**
   * Compile a file
   */
  async compileFile(filePath: string): Promise<Result<ICompilationResult>> {
    try {
      // Read file
      const readResult = await this.fileSystem.readFile(filePath);
      if (!readResult.success) {
        return err(readResult.error);
      }
      
      // Compile
      return this.compile({
        source: readResult.value,
        uri: filePath
      });
    } catch (error) {
      return err(new Error(`Failed to compile file ${filePath}: ${error}`));
    }
  }
  
  /**
   * Get compiler capabilities
   */
  getCapabilities(): ICompilerCapabilities {
    return {
      outputFormats: ['json', 'javascript'],
      supportsSourceMaps: false,
      supportsIncremental: false,
      version: '1.0.0'
    };
  }
  
  /**
   * Get the compilation pipeline
   */
  getPipeline(): CompilationPipeline {
    return this.pipeline;
  }
}