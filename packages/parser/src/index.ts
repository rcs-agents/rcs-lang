// Main exports for the RCL parser package
export { RCLParser } from './rclParser';
export { ASTWalker } from './astWalker';

// Type exports
export * from './astTypes';
export * from './rclTypes';
export { IParser, ParseResult, ParserOptions } from './types';

// Validation exports
export * from './validation';

// AST helper exports
export * from './ast';

// Parse result helpers
export * from './parseResult';

// Parser factory
export * from './factory';

// Legacy parse function - now uses the real parser with proper error handling
import { RCLParser } from './rclParser';
import { DiagnosticCollectionImpl } from '@rcl/core-types';
import { checkForErrorNodes, convertTreeSitterNode } from './parseResult';

// Create a global parser instance
const parser = new RCLParser();

export async function parse(text: string): Promise<{ ast: any; errors?: any[] }> {
  try {
    const document = await parser.parseDocument(text, 'inline-document.rcl');
    
    // Convert tree-sitter node to our AST format
    const ast = document.ast ? convertTreeSitterNode(document.ast) : null;
    
    // Check for ERROR nodes in the AST
    const diagnostics = new DiagnosticCollectionImpl();
    if (ast) {
      checkForErrorNodes(ast, diagnostics);
    }
    
    // Convert diagnostics to legacy error format for backward compatibility
    const errors = diagnostics.diagnostics.map(d => ({
      message: d.message,
      line: d.range?.start.line,
      column: d.range?.start.column,
      type: d.code || 'ERROR'
    }));
    
    return { ast, errors };
  } catch (error) {
    return { 
      ast: null, 
      errors: [{ 
        message: error instanceof Error ? error.message : String(error),
        type: 'FATAL'
      }] 
    };
  }
}
