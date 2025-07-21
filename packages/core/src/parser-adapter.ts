import type { RclFile } from '@rcs-lang/ast';
import type { Diagnostic } from './diagnostics.js';
import type { Result } from './result.js';

/**
 * Parser adapter interface - converts parser-specific trees to common AST
 */
export interface IParserAdapter<T = any> {
  /**
   * Convert parser-specific parse tree to common AST format
   */
  convertToAST(parseTree: T, source: string): Result<RclFile>;

  /**
   * Extract diagnostics from parser-specific error format
   */
  extractDiagnostics(parseTree: T, source: string): Diagnostic[];

  /**
   * Get parser name/type
   */
  getParserType(): string;

  /**
   * Check if the parse tree has errors
   */
  hasErrors(parseTree: T): boolean;
}

// IParseResult is defined in parser.ts
