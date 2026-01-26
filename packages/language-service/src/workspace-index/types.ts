import type { ExportedSymbol } from '../import-resolver/types';

/**
 * Represents a symbol location in the workspace
 */
export interface SymbolLocation {
  /** The URI of the file containing the symbol */
  uri: string;
  /** The symbol information */
  symbol: ExportedSymbol;
}

/**
 * Represents symbol information with metadata
 */
export interface SymbolInfo {
  /** The symbol details */
  symbol: ExportedSymbol;
  /** The file URI where the symbol is defined */
  uri: string;
  /** Files that reference this symbol */
  references: string[];
  /** Last modification time */
  lastModified: number;
}

/**
 * Represents a parsed RCL document
 */
export interface RCLDocument {
  /** The URI of the document */
  uri: string;
  /** The content of the document */
  content: string;
  /** The parsed AST */
  ast: any;
  /** Symbols defined in this document */
  symbols: ExportedSymbol[];
  /** Import statements in this document */
  imports: string[];
  /** Version/timestamp of the document */
  version: number;
}

/**
 * File change event types
 */
export enum FileChangeType {
  Created = 'created',
  Modified = 'modified',
  Deleted = 'deleted',
}

/**
 * Represents a file change event
 */
export interface FileChangeEvent {
  /** The URI of the changed file */
  uri: string;
  /** The type of change */
  type: FileChangeType;
  /** Timestamp of the change */
  timestamp: number;
}

/**
 * Workspace index configuration
 */
export interface WorkspaceIndexConfig {
  /** Root directory of the workspace */
  workspaceRoot: string;
  /** File patterns to include */
  include: string[];
  /** File patterns to exclude */
  exclude: string[];
  /** Whether to watch for file changes */
  watchFiles: boolean;
  /** Debounce delay for file change events (ms) */
  debounceDelay: number;
}
