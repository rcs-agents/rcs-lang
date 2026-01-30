import type * as AST from '@rcs-lang/ast';
import {
  CompilationPipeline,
  ParseStage,
  RCLCompiler,
  TransformStage,
  ValidateStage,
} from '@rcs-lang/compiler';
import { MemoryFileSystem } from '@rcs-lang/file-system';
import type { AgentData, CompiledAgent, Diagnostic } from '../program/types.js';

/**
 * Compiles an RCL AST into the output format
 */
export class Compiler {
  private diagnostics: Diagnostic[] = [];

  /**
   * Compile an AST into agent data
   */
  async compile(
    _ast: AST.RclFile | any,
    sourceContent: string,
    fileName?: string,
  ): Promise<CompiledAgent | null> {
    this.diagnostics = [];

    try {
      // Use the modern compiler pipeline instead of manual AST parsing
      const pipeline = new CompilationPipeline();
      pipeline.addStage(new ParseStage());
      pipeline.addStage(new ValidateStage());
      pipeline.addStage(new TransformStage());

      const memoryFs = new MemoryFileSystem();
      const compiler = new RCLCompiler({ fileSystem: memoryFs, pipeline });

      // Compile from source content directly
      const result = await compiler.compile({
        source: sourceContent,
        uri: fileName || 'unknown',
      });

      if (!result.success) {
        this.addError(`Compilation failed: ${result.error}`, fileName);
        return null;
      }

      if (!result.value.success) {
        // Add validation diagnostics
        if (result.value.diagnostics) {
          for (const diag of result.value.diagnostics) {
            this.addError(diag.message, fileName);
          }
        }
        return null;
      }

      const output = result.value.output;
      if (!output) {
        this.addError('No output generated', fileName);
        return null;
      }

      // Convert to the format expected by language service
      return {
        agent: {
          name: output.bundle.agent.displayName || "Unnamed Agent"
        },
        messages: output.bundle.messages || {},
        flows: output.csm || {},
      };
    } catch (error) {
      this.addError(
        `Compilation failed: ${error instanceof Error ? error.message : String(error)}`,
        fileName,
      );
      return null;
    }
  }

  /**
   * Get diagnostics from last compilation
   */
  getDiagnostics(): Diagnostic[] {
    return this.diagnostics;
  }

  /**
   * Add an error diagnostic
   */

  private addError(message: string, file?: string): void {
    this.diagnostics.push({
      message,
      severity: 'error',
      file,
    });
  }
}
