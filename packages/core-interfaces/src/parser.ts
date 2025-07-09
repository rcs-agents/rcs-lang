import { Result, Diagnostic } from '@rcl/core-types';

/**
 * Platform type for parser implementation
 */
export type ParserPlatform = 'node' | 'browser' | 'universal';

/**
 * Parser configuration options
 */
export interface ParserConfig {
  platform?: ParserPlatform;
  wasmPath?: string;
  nativePath?: string;
  debug?: boolean;
}

/**
 * AST node interface - platform agnostic
 */
export interface IASTNode {
  type: string;
  text?: string;
  children?: IASTNode[];
  range: IRange;
  
  // Methods for traversal
  walk(visitor: (node: IASTNode) => void): void;
  find(predicate: (node: IASTNode) => boolean): IASTNode | null;
  findAll(predicate: (node: IASTNode) => boolean): IASTNode[];
}

/**
 * Range in source text
 */
export interface IRange {
  start: IPosition;
  end: IPosition;
}

/**
 * Position in source text
 */
export interface IPosition {
  line: number;
  column: number;
  offset?: number;
}

/**
 * Parse result interface
 */
export interface IParseResult {
  ast: IASTNode | null;
  diagnostics: Diagnostic[];
  parseTime: number;
}

/**
 * Parser interface - all parsers must implement this
 */
export interface IParser {
  /**
   * Parse RCL source text
   */
  parse(text: string, uri?: string): Promise<Result<IParseResult>>;
  
  /**
   * Parse synchronously (if supported)
   */
  parseSync?(text: string, uri?: string): Result<IParseResult>;
  
  /**
   * Get parser capabilities
   */
  getCapabilities(): IParserCapabilities;
  
  /**
   * Initialize the parser
   */
  initialize(config?: ParserConfig): Promise<Result<void>>;
  
  /**
   * Check if parser is initialized
   */
  isInitialized(): boolean;
  
  /**
   * Dispose of parser resources
   */
  dispose(): void;
}

/**
 * Parser capabilities
 */
export interface IParserCapabilities {
  supportsSync: boolean;
  supportsIncremental: boolean;
  supportsTreeSitter: boolean;
  platform: ParserPlatform;
  version: string;
}

/**
 * Parser factory interface
 */
export interface IParserFactory {
  /**
   * Create a parser for the given configuration
   */
  create(config: ParserConfig): Promise<Result<IParser>>;
  
  /**
   * Get available parser implementations
   */
  getAvailableParsers(): ParserPlatform[];
}