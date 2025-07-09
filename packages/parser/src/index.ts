// Main exports for the RCL parser package
export { RCLParser } from './rclParser';
export { ASTWalker } from './astWalker';

// Type exports
export * from './astTypes';
export * from './rclTypes';

// Validation exports
export * from './validation';

// AST helper exports
export * from './ast';

// Legacy parse function - now uses the real parser
import { RCLParser } from './rclParser';

// Create a global parser instance
const parser = new RCLParser();

export async function parse(text: string): Promise<{ ast: any; errors?: any[] }> {
  try {
    const document = await parser.parseDocument(text, 'inline-document.rcl');
    
    // Check for ERROR nodes in the AST
    const errors: any[] = [];
    function checkForErrors(node: any) {
      if (!node) return;
      if (node.type === 'ERROR') {
        errors.push({
          message: 'Syntax error',
          line: node.startPosition?.row,
          column: node.startPosition?.column,
          type: 'ERROR'
        });
      }
      if (node.children) {
        node.children.forEach(checkForErrors);
      }
    }
    checkForErrors(document.ast);
    
    return { ast: document.ast, errors };
  } catch (error) {
    return { ast: null, errors: [{ message: error instanceof Error ? error.message : String(error) }] };
  }
}
