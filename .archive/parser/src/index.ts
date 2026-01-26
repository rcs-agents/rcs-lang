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

// Legacy parse function - now uses the ANTLR parser
import { RCLParser } from './rclParser';

// Create a global parser instance
const parser = new RCLParser();

export async function parse(text: string): Promise<{ ast: any; errors?: any[] }> {
  try {
    const document = await parser.parseDocument(text, 'inline-document.rcl');
    
    // The ANTLR parser already returns the AST in the correct format
    const ast = document.ast;
    
    // Convert diagnostics to legacy error format for backward compatibility
    const errors = document.diagnostics.map(d => ({
      message: d.message,
      line: d.range?.start.line,
      column: d.range?.start.character,
      type: 'ERROR'
    }));
    
    return { ast, errors: errors.length > 0 ? errors : undefined };
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
