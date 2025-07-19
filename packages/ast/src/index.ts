/**
 * @rcs-lang/ast - Parser-independent AST type definitions for RCL
 *
 * This package provides the AST node types that follow the formal RCL specification.
 * The AST is designed to be generic and work with any parser implementation.
 */

// Export the formal AST types
export * from './ast';

// Export position tracking utilities
export * from './position';

// Export node type guards
export * from './guards';

// Export AST utilities
export * from './utils';

// Re-export commonly used types at top level
export type {
  RclFile,
  Section,
  Attribute,
  Value,
  ImportStatement,
  SpreadDirective,
  MatchBlock,
  MatchCase,
} from './ast';
