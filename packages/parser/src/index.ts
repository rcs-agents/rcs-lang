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

// Legacy parse function for backward compatibility
import { MockParser } from './mockParser';

// Create a global mock parser instance for synchronous parsing
const mockParser = new MockParser();

export function parse(text: string): any {
  // For CLI tests, use the mock parser which is synchronous
  return mockParser.parse(text);
}
