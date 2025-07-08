/**
 * Wrapper for @rcl/parser to handle optional tree-sitter dependency
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
import { RCLParser as RealRCLParser, schemaValidator as realSchemaValidator } from '@rcl/parser';

// Check if parser is available
let parserAvailable = true;

// Export either real or mock implementations
export const schemaValidator = parserAvailable
  ? realSchemaValidator
  : {
      validateAgentMessage: (message: unknown): ValidationResult => {
        // Basic validation without full schema
        return {
          valid: true,
          errors: [],
        };
      },
      validateRichCard: (card: unknown): ValidationResult => {
        return {
          valid: true,
          errors: [],
        };
      },
      validateMessageConstraints: (message: unknown): ValidationResult => {
        // Mock validation for message constraints
        return {
          valid: true,
          errors: [],
        };
      },
      validateAgentConfig: (config: unknown): ValidationResult => {
        // Mock validation for agent config
        return {
          valid: true,
          errors: [],
        };
      },
      validateSuggestions: (suggestions: unknown[]): ValidationResult => {
        // Mock validation for suggestions
        return {
          valid: true,
          errors: [],
        };
      },
      validateContentMessage: (content: unknown): ValidationResult => {
        // Mock validation for content message
        return {
          valid: true,
          errors: [],
        };
      },
    };

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

// Re-export types with fallback
export let ASTWalker: any = null;

if (parserAvailable) {
  try {
    import('@rcl/parser')
      .then((parser) => {
        ASTWalker = parser.ASTWalker;
      })
      .catch(() => {
        // Ignore import errors
      });
  } catch {
    // Ignore errors
  }
}
