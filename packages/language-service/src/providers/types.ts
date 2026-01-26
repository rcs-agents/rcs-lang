/**
 * Shared interfaces for language service providers
 */

/**
 * Text document representation for LSP compatibility
 */
export interface TextDocument {
  uri: string;
  getText(): string;
  positionAt(offset: number): { line: number; character: number };
  offsetAt(position: { line: number; character: number }): number;
}

/**
 * Position in a document
 */
export interface Position {
  line: number;
  character: number;
}

/**
 * Range in a document
 */
export interface Range {
  start: Position;
  end: Position;
}

/**
 * Location with URI and range
 */
export interface Location {
  uri: string;
  range: Range;
}