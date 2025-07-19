import {
  CompilationPipeline,
  ParseStage,
  RCLCompiler,
  TransformStage,
  ValidateStage,
} from '@rcs-lang/compiler';
import type { ASTNode } from '../ast-compatibility';
import type { AgentData, CompiledAgent, Diagnostic } from '../program/types';

// Temporary compatibility helpers for old tree-sitter style calls
function getNodeText(node: any, _source?: string): string {
  return node?.text || '';
}
function findNodeByType(root: any, type: string): any {
  if (!root) return null;
  if (root.type === type) return root;

  if (root.children) {
    for (const child of root.children) {
      const found = findNodeByType(child, type);
      if (found) return found;
    }
  }
  return null;
}

function findNodesByType(root: any, type: string): any[] {
  const nodes: any[] = [];
  if (!root) return nodes;

  function traverse(node: any) {
    if (node.type === type) {
      nodes.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(root);
  return nodes;
}

/**
 * Compiles an RCL AST into the output format
 */
export class Compiler {
  private diagnostics: Diagnostic[] = [];

  /**
   * Compile an AST into agent data
   */
  async compile(
    ast: ASTNode | any,
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

      const compiler = new RCLCompiler(pipeline);

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
          result.value.diagnostics.forEach((diag) => {
            this.addError(diag.message, fileName);
          });
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
        agent: output.agent,
        messages: output.messages || {},
        flows: output.flows || {},
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
   * Extract agent data from AST (LEGACY - no longer used)
   */
  private extractAgent(ast: ASTNode, sourceContent: string): AgentData {
    // This method is no longer used since we're using the modern compiler
    return {} as AgentData;
  }

  private extractMessages(ast: ASTNode, sourceContent: string): Record<string, any> {
    // Legacy method - no longer used
    return {};
  }

  private extractFlows(ast: ASTNode, sourceContent: string): Record<string, any> {
    // Legacy method - no longer used
    return {};
  }

  // All other legacy extraction methods removed since we use the modern compiler
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
