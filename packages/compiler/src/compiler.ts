import { type Diagnostic, type Result, err, ok, rclErrorToLegacy, legacyErrorToRCLError } from '@rcs-lang/core';
import type {
  ICompilationInput,
  ICompilationResult,
  ICompiler,
  ICompilerCapabilities,
  IFileSystem,
} from '@rcs-lang/core';
import { FileSystemFactory } from '@rcs-lang/file-system';
import { D2Generator, JavaScriptGenerator, MermaidGenerator } from './generators/index.js';
import { CompilationPipeline } from './pipeline/compilationPipeline.js';
import { ParseStage, TransformStage, ValidateStage } from './stages/index.js';

export interface CompilerOptions {
  fileSystem?: IFileSystem;
  strict?: boolean;
}

export interface CompilerConfig {
  strict?: boolean;
  allowPartialCompilation?: boolean;
}

/**
 * Simple compiler implementation for tests
 */
export class CompilerImpl implements ICompiler {
  private config: CompilerConfig;

  constructor(config: CompilerConfig = {}) {
    this.config = {
      strict: true,
      allowPartialCompilation: false,
      ...config,
    };
  }

  async compile(input: ICompilationInput): Promise<Result<ICompilationResult>> {
    const diagnostics: Diagnostic[] = [];
    const ast = input.ast;
    if (!ast) {
      diagnostics.push({
        severity: 'error',
        message: 'No AST provided',
        code: 'COMP001',
        source: 'compiler',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      });
      return ok({ success: false, diagnostics });
    }

    // Check for agent definition
    const agentNode = this.findAgentNode(ast);
    if (!agentNode) {
      diagnostics.push({
        severity: 'error',
        message: 'No agent definition found',
        code: 'COMP002',
        source: 'compiler',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      });
      return ok({ success: false, diagnostics });
    }

    // Check for required displayName
    if (!agentNode.displayName) {
      diagnostics.push({
        severity: 'error',
        message: 'Agent must have displayName property',
        code: 'COMP003',
        source: 'compiler',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      });
      return ok({ success: false, diagnostics });
    }

    // Simple compilation result
    const output = {
      agent: {
        name: agentNode.name,
        displayName: agentNode.displayName,
      },
      messages: {},
      flows: {},
    };

    return ok({ success: true, output, diagnostics });
  }

  getCapabilities(): ICompilerCapabilities {
    return {
      outputFormats: ['json', 'js'],
      supportsSourceMaps: false,
      supportsIncremental: false,
      version: '1.0.0',
    };
  }

  getConfiguration(): CompilerConfig {
    return { ...this.config };
  }

  private findAgentNode(ast: any): any {
    if (!ast || !ast.children) return null;

    for (const child of ast.children) {
      if (child.type === 'agent_definition') {
        return child;
      }
    }

    return null;
  }
}

/**
 * RCL Compiler implementation
 */
export class RCLCompiler implements ICompiler {
  private pipeline: CompilationPipeline;
  private fileSystem: IFileSystem;
  private jsGenerator: JavaScriptGenerator;
  private d2Generator: D2Generator;
  private mermaidGenerator: MermaidGenerator;

  constructor(optionsOrPipeline?: CompilerOptions | CompilationPipeline) {
    // Support both constructor signatures for backward compatibility
    if (optionsOrPipeline instanceof CompilationPipeline) {
      this.pipeline = optionsOrPipeline;
      this.fileSystem = FileSystemFactory.getDefault();
    } else {
      const options = optionsOrPipeline || {};
      this.fileSystem = options.fileSystem || FileSystemFactory.getDefault();

      // Set up default pipeline
      this.pipeline = new CompilationPipeline();
      this.pipeline.addStage(new ParseStage());
      this.pipeline.addStage(new ValidateStage());
      this.pipeline.addStage(new TransformStage());
    }

    this.jsGenerator = new JavaScriptGenerator();
    this.d2Generator = new D2Generator();
    this.mermaidGenerator = new MermaidGenerator();
  }

  /**
   * Compile RCL source to output format
   */
  async compile(input: ICompilationInput): Promise<Result<ICompilationResult>>;
  async compile(source: string, uri: string): Promise<{ success: boolean; output?: { json: string; js: string }; errors?: any[] }>;
  async compile(
    inputOrSource: ICompilationInput | string, 
    uri?: string
  ): Promise<Result<ICompilationResult> | { success: boolean; output?: { json: string; js: string }; errors?: any[] }> {
    
    // Handle legacy two-parameter interface
    if (typeof inputOrSource === 'string' && typeof uri === 'string') {
      const result = await this.compileSource(inputOrSource, uri);
      return {
        success: result.success,
        output: result.output ? {
          json: JSON.stringify(result.output),
          js: this.jsGenerator.generate(result.output, uri.split('/').pop() || 'unknown.rcl')
        } : undefined,
        errors: result.errors
      };
    }
    
    // Handle new interface
    const input = inputOrSource as ICompilationInput;
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
   * Compile RCL source with simplified return format (for backward compatibility)
   */
  async compileSource(
    source: string,
    uri: string,
  ): Promise<ICompilationResult & { errors?: any[] }> {
    const result = await this.compile({ source, uri });

    if (!result.success) {
      return {
        success: false,
        errors: [{ 
          message: result.error.message,
          code: 'COMPILE_ERROR',
          line: 1,
          column: 1,
          severity: 'error'
        }],
        diagnostics: [],
      };
    }

    // Convert diagnostics to errors for backward compatibility
    const diagnostics = result.value.diagnostics?.filter((d) => d.severity === 'error') || [];
    const errors = diagnostics.map(d => ({
      message: d.message,
      code: d.code,
      line: d.range?.start.line ?? 1,
      column: d.range?.start.character ?? 1,
      severity: d.severity,
      range: d.range
    }));

    return {
      ...result.value,
      errors: errors.length > 0 ? errors : undefined,
    };
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
        uri: filePath,
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
      outputFormats: ['json', 'javascript', 'd2', 'mermaid'],
      supportsSourceMaps: false,
      supportsIncremental: false,
      version: '1.0.0',
    };
  }

  /**
   * Get the compilation pipeline
   */
  getPipeline(): CompilationPipeline {
    return this.pipeline;
  }

  /**
   * Compile to JavaScript
   */
  async compileToJavaScript(input: ICompilationInput): Promise<Result<string>> {
    const result = await this.compile(input);

    if (!result.success) {
      return err(result.error);
    }

    if (!result.value.success || !result.value.output) {
      return err(new Error('Compilation failed'));
    }

    const fileName = input.uri ? input.uri.split('/').pop() || 'unknown.rcl' : 'unknown.rcl';
    const jsCode = this.jsGenerator.generate(result.value.output, fileName);

    return ok(jsCode);
  }
}
