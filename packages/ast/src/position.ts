/**
 * Position tracking for AST nodes
 */

/**
 * Position in source text
 */
export interface Position {
  line: number;
  character: number;
}

/**
 * Range in source text
 */
export interface Range {
  start: Position;
  end: Position;
}

/**
 * Source location information that can be attached to AST nodes
 */
export interface SourceLocation {
  range: Range;
  source?: string; // Source file path
}

/**
 * Base interface for nodes that track position
 */
export interface WithLocation {
  location?: SourceLocation;
}
