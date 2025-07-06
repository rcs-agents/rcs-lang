/**
 * Represents a resolved import in an RCL file
 */
export interface ResolvedImport {
  /** The absolute path to the imported file */
  resolvedPath: string;
  /** The alias used for the import (if any) */
  alias?: string;
  /** The symbols exported by the imported file */
  exports: ExportedSymbol[];
  /** Whether the import was successfully resolved */
  exists: boolean;
}

/**
 * Represents a symbol exported by an RCL file
 */
export interface ExportedSymbol {
  /** The name of the symbol */
  name: string;
  /** The type of the symbol */
  type: SymbolType;
  /** The range where the symbol is defined */
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  /** Documentation for the symbol */
  documentation?: string;
}

/**
 * Types of symbols that can be exported
 */
export enum SymbolType {
  Agent = 'agent',
  Flow = 'flow',
  Message = 'message',
  Property = 'property',
  Function = 'function'
}

/**
 * Represents an import statement in RCL
 */
export interface ImportStatement {
  /** The import path as written in the source */
  path: string;
  /** The alias (if using 'as' keyword) */
  alias?: string;
  /** The range of the import statement */
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}

/**
 * Configuration for import resolution
 */
export interface ImportResolverConfig {
  /** Project root directory */
  projectRoot: string;
  /** File extensions to consider when resolving imports */
  extensions: string[];
  /** Whether to perform case-insensitive path resolution */
  caseInsensitive: boolean;
}