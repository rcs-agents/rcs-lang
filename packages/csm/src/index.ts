/**
 * @module @rcs-lang/csm
 *
 * Conversation State Machine - A lightweight state machine library for RCS conversational agents.
 *
 * @example
 * ```typescript
 * import { agent, flow, state, transition } from '@rcs-lang/csm';
 *
 * // Create an agent using the new fluent API
 * const result = agent('coffee-shop')
 *   .name('Coffee Shop Assistant')
 *   .machine('main-machine', machine =>
 *     machine.flow('order-flow', flow =>
 *       flow
 *         .state('welcome', state =>
 *           state
 *             .message('welcome-msg')
 *             .onInput('start order').toState('collect-order').build()
 *         )
 *         .state('collect-order', state =>
 *           state
 *             .message('collect-order-msg')
 *             .onInput('coffee').set('drink', 'coffee').toTerminal('success').build()
 *         )
 *     )
 *   )
 *   .build();
 *
 * if (result.success) {
 *   const coffeeAgent = result.value;
 *   console.log(`Created agent: ${coffeeAgent.id}`);
 * }
 * ```
 *
 * @packageDocumentation
 */

// =============================================================================
// CORE EXPORTS
// =============================================================================

// Core classes
export { ConversationalAgent } from './conversational-agent.js';
export { FlowMachine, type TransitionResult } from './flow-machine.js';

// Machine definition format (validation and helpers)
export {
  validateMachineDefinition,
  validateAgentDefinition,
  createSingleFlowMachine,
  type MachineDefinitionJSON,
  type LegacySingleFlowMachine,
} from './machine-definition.js';

// Sub-flow support
export { 
  SubFlowManager, 
  SubFlowCapableAgent,
} from './subflow-manager.js';

// =============================================================================
// UNIFIED TYPE SYSTEM (Single Source of Truth)
// =============================================================================

// Export ALL types from unified-types.ts
export type * from './unified-types.js';

// =============================================================================
// TYPE GUARDS
// =============================================================================

export {
  // Basic guards
  isContext,
  isEntityMeta,
  isStateMeta,
  
  // Target guards
  isStateTarget,
  isFlowTarget,
  isTerminalTarget,
  isTransitionTarget,
  
  // Condition guards
  isLegacyCondition,
  isCodeCondition,
  isJsonLogicCondition,
  isCondition,
  
  // Operation guards
  isSetOperation,
  isAppendOperation,
  isMergeOperation,
  isContextOperation,
  
  // Flow invocation guards
  isFlowInvocation,
  
  // Entity guards
  isTransition,
  isState,
  isFlow,
  isMachine,
  isAgent,
  
  // Runtime guards
  isAgentExecutionState,
  isProcessResult,
  
  // Error guards
  isValidationError,
  isConstructionError,
  isCsmError,
  
  // Serialization guards
  isSerializableAgent,
  isSerializableExecutionState,
  
  // Utility functions
  safeCast,
  validateArray,
  isOneOf,
} from './type-guards.js';

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export {
  // ID creators
  createAgentId,
  createMachineId,
  createFlowId,
  createStateId,
  
  // Target factories
  createStateTarget,
  createFlowTarget,
  createTerminalTarget,
  
  // Condition factories
  createCodeCondition,
  createJsonLogicCondition,
  createLegacyCondition,
  
  // Operation factories
  createSetOperation,
  createAppendOperation,
  createMergeOperation,
  
  // Entity factories
  createTransition,
  createPatternTransition,
  createAutoTransition,
  createState,
  createSimpleState,
  createFlow,
  createMachine,
  createAgent,
  createSimpleAgent,
  
  // Convenience builders
  createLinearFlow,
  
  // Factory option types
  type TransitionOptions,
  type StateOptions,
  type FlowOptions,
  type MachineOptions,
  type AgentOptions as FactoryAgentOptions,
} from './factories.js';

// =============================================================================
// FLUENT BUILDERS
// =============================================================================

export {
  // Builder classes
  TransitionBuilder,
  StateBuilder,
  FlowBuilder,
  MachineBuilder,
  AgentBuilder,
  
  // Builder functions
  transition,
  state,
  flow,
  machine,
  agent,
  
  // Specialized builders
  linearFlow,
  simpleAgent,
} from './builders.js';

// =============================================================================
// RESULT INTEGRATION
// =============================================================================

export {
  // Result creators
  csmOk,
  validationError,
  constructionError,
  
  // Result combinators
  combineResults,
  combineHeterogeneous,
  mapCsm,
  andThenCsm,
  
  // Validation utilities
  validateWith,
  validateRequired,
  validateNonEmptyString,
  validateNonEmptyArray,
  
  // Execution utilities
  createProcessResult,
  executionError,
  
  // Error handling
  tryCatch,
  tryAsync,
  unwrapOrThrow,
  logCsmError,
  
  // Pattern matching
  matchResult,
  matchCsmError,
  
  // Batch operations
  processBatch,
  processUntilError,
} from './result-integration.js';

// =============================================================================
// FLOW EXECUTION UTILITIES
// =============================================================================

export {
  type ScopedContext,
  type FlowTermination,
  type FlowError,
  type FlowResult,
  type FlowStackFrame,
  type FlowExecutionState,
  type ContextOperation as FlowContextOperation,
  type SerializableFlowExecutionState,
  createFlowSuccess,
  createFlowError,
  applyContextOperations,
  serializeFlowExecutionState,
  deserializeFlowExecutionState,
} from './flow-execution.js';

// =============================================================================
// VERSION AND METADATA
// =============================================================================

// Version for compatibility checking
export const VERSION = '0.2.0';

// Path to JSON schema (for tooling)
export const MACHINE_DEFINITION_SCHEMA_PATH = '../schema/machine-definition.schema.json';