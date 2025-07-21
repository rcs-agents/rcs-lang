/**
 * Wrapper for @rcs-lang/parser to handle optional tree-sitter dependency
 * This allows the CLI to work in environments where tree-sitter is not available
 */

export interface RCLNode {
  type: string;
  text?: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children: RCLNode[];
  parent: RCLNode | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    message: string;
    path?: string;
    value?: unknown;
  }>;
}

// Import parser with proper ES6 imports
import { RCLParser as RealRCLParser } from '@rcs-lang/parser';

// Check if parser is available
const parserAvailable = true;

// Create mock schema validator since ANTLR parser doesn't have one yet
const mockSchemaValidator = {
  validateAgentMessage: (_message: unknown): ValidationResult => {
    // Basic validation without full schema
    return {
      valid: true,
      errors: [],
    };
  },
  validateRichCard: (_card: unknown): ValidationResult => {
    return {
      valid: true,
      errors: [],
    };
  },
  validateMessageConstraints: (_message: unknown): ValidationResult => {
    // Mock validation for message constraints
    return {
      valid: true,
      errors: [],
    };
  },
  validateAgentConfig: (_config: unknown): ValidationResult => {
    // Mock validation for agent config
    return {
      valid: true,
      errors: [],
    };
  },
  validateSuggestions: (_suggestions: unknown[]): ValidationResult => {
    // Mock validation for suggestions
    return {
      valid: true,
      errors: [],
    };
  },
  validateContentMessage: (_content: unknown): ValidationResult => {
    // Mock validation for content message
    return {
      valid: true,
      errors: [],
    };
  },
};

// Export mock schema validator
export const schemaValidator = mockSchemaValidator;

export const RCLParser = parserAvailable
  ? RealRCLParser
  : class MockRCLParser {
    parseDocument(content: string, uri: string) {
      console.warn('Using mock parser - real parsing not available');
      return {
        uri,
        version: 1,
        content,
        ast: null,
        imports: [],
        symbols: [],
        diagnostics: [],
      };
    }
  };

// Mock ASTWalker since ANTLR parser doesn't have this interface yet
export const ASTWalker = {
  walkTree: () => {
    console.warn('Using mock ASTWalker - real walker not available');
  },
};
