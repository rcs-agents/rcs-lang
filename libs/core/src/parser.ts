import { Position, Range, type RclFile } from '@rcl/ast';
import type { Diagnostic } from './diagnostics';
import type { Result } from './result';

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
 * Parse result interface
 */
export interface IParseResult {
  ast: RclFile | null;
  diagnostics: Diagnostic[];
  parseTime: number;
  parserType: string;
}

// Re-export AST types for convenience
export { RclFile as IASTNode, Position as IPosition, Range as IRange } from '@rcl/ast';

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
