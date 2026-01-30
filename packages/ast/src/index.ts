/**
 * @rcs-lang/ast - Parser-independent AST type definitions for RCL
 *
 * This package provides the AST node types that follow the formal RCL specification.
 * The AST is designed to be generic and work with any parser implementation.
 */

// Export the formal AST types
export * from './ast.js';

// Export position tracking utilities
export * from './position.js';

// Export node type guards
export * from './guards.js';

// Export AST utilities
export * from './utils.js';

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
  FlowInvocation,
  FlowResultHandler,
  FlowResult,
  ContextOperation,
  ContextOperationSequence,
  FlowTermination,
  SimpleTransition,
  StateReference,
  TargetReference,
  Condition,
  JavaScriptCondition,
  JsonLogicCondition,
} from './ast.js';
