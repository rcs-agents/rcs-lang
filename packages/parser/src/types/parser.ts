import { Result, Diagnostic, Range } from '@rcl/core-types';

/**
 * AST node types
 */
export interface ASTNode {
  type: string;
  text?: string;
  children?: ASTNode[];
  startPosition?: { row: number; column: number };
  endPosition?: { row: number; column: number };
  range?: Range;
}

/**
 * Parse result with proper error handling
 */
export interface ParseResult {
  ast: ASTNode | null;
  diagnostics: Diagnostic[];
}

/**
 * Parser options
 */
export interface ParserOptions {
  uri?: string;
  throwOnError?: boolean;
}

/**
 * Parser interface
 */
export interface IParser {
  /**
   * Parse RCL text and return AST with diagnostics
   */
  parse(text: string, options?: ParserOptions): Promise<Result<ParseResult>>;
  
  /**
   * Check if parser is initialized
   */
  isInitialized(): boolean;
  
  /**
   * Initialize the parser
   */
  initialize(): Promise<Result<void>>;
}