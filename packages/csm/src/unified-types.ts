/**
 * @module unified-types
 * Unified CSM type system - Single source of truth for all CSM types.
 * 
 * Design Principles:
 * 1. Each concept has exactly ONE type definition
 * 2. Clear separation between definition-time and runtime concerns
 * 3. Consistent naming without redundant suffixes
 * 4. Proper type hierarchy with branded IDs
 * 5. No duplication across the codebase
 * 6. Modern TypeScript features with strict readonly properties
 */

import type { Result } from '@rcs-lang/core';
import type { RulesLogic } from 'json-logic-js';

// =============================================================================
// CORE TYPES AND IDS
// =============================================================================

/**
 * Context object that accumulates data throughout the conversation.
 * Shared across all flows within an agent.
 */
export interface Context {
  [key: string]: any;
}

/**
 * Branded ID type for compile-time type safety.
 * Prevents mixing different ID types at compile time.
 * Note: For backward compatibility, IDs are still assignable from strings.
 */
export type BrandedId<T extends string> = string;

// Specific ID types for each entity (compatible with strings)
export type AgentId = string;
export type MachineId = string;
export type FlowId = string;
export type StateId = string;
export type TransitionId = string;

// =============================================================================
// METADATA
// =============================================================================

/**
 * Common metadata for all CSM entities.
 * Provides extensible metadata with strict base fields.
 */
export interface Metadata {
  /** Display name for the entity */
  readonly name?: string;
  
  /** Description of what this entity does */
  readonly description?: string;
  
  /** Version of the entity definition */
  readonly version?: string;
  
  /** Tags for categorization */
  readonly tags?: readonly string[];
  
  /** Message ID (for states that send messages) */
  readonly messageId?: string;
  
  /** Whether this state is transient (auto-transitions) */
  readonly transient?: boolean;
  
  /** Custom application-specific metadata */
  readonly custom?: Record<string, unknown>;
}

// =============================================================================
// CONDITIONS
// =============================================================================

/**
 * Base condition interface for discriminated unions.
 */
interface BaseCondition {
  readonly type: string;
}

/**
 * JavaScript code condition with explicit typing.
 * Recommended over string expressions for type safety.
 */
export interface CodeCondition extends BaseCondition {
  readonly type: 'code';
  readonly expression: string;
}

/**
 * JSON Logic condition for declarative, safe logic.
 * Recommended for complex conditions.
 */
export interface JsonLogicCondition extends BaseCondition {
  readonly type: 'jsonlogic';
  readonly rule: RulesLogic;
}

/**
 * Legacy condition type (deprecated but supported for backward compatibility).
 */
export interface LegacyCondition extends BaseCondition {
  readonly type: 'legacy';
  readonly expression: string;
}

/**
 * Union of all condition types.
 * String type is supported for backward compatibility but discouraged.
 */
export type Condition = string | LegacyCondition | CodeCondition | JsonLogicCondition;

// =============================================================================
// CONTEXT OPERATIONS
// =============================================================================

/**
 * Base operation interface for discriminated unions.
 */
interface BaseOperation {
  readonly type: string;
}

/**
 * Set a variable to a specific value.
 */
export interface SetOperation extends BaseOperation {
  readonly type: 'set';
  readonly variable: string;
  readonly value: any;
}

/**
 * Append a value to an array or string.
 */
export interface AppendOperation extends BaseOperation {
  readonly type: 'append';
  readonly target: string;
  readonly value: any;
}

/**
 * Merge an object into an existing object.
 */
export interface MergeOperation extends BaseOperation {
  readonly type: 'merge';
  readonly target: string;
  readonly value: Record<string, any>;
}

/**
 * Union of all context operations.
 */
export type ContextOperation = SetOperation | AppendOperation | MergeOperation;

// =============================================================================
// TRANSITION TARGETS
// =============================================================================

/**
 * Base target interface for discriminated unions.
 */
interface BaseTarget {
  readonly type: string;
}

/**
 * Target pointing to a state within the current flow.
 */
export interface StateTarget extends BaseTarget {
  readonly type: 'state';
  readonly stateId: string;
}

/**
 * Target pointing to a flow (enters its initial state).
 */
export interface FlowTarget extends BaseTarget {
  readonly type: 'flow';
  readonly flowId: string;
}

/**
 * Terminal target that ends the conversation.
 */
export interface TerminalTarget extends BaseTarget {
  readonly type: 'terminal';
  readonly reason?: 'success' | 'error' | 'cancel' | 'timeout';
  readonly message?: string;
}

/**
 * Union of all transition targets.
 * String type is supported for backward compatibility (interpreted as state ID).
 */
export type TransitionTarget = string | StateTarget | FlowTarget | TerminalTarget;

// =============================================================================
// FLOW INVOCATION
// =============================================================================

/**
 * Legacy operation format for backward compatibility.
 */
export interface LegacyOperation {
  set?: { variable: string; value: any };
  append?: { to: string; value: any };
  merge?: { into: string; value: any };
}

/**
 * Result handler for flow invocation outcomes.
 */
export interface FlowResultHandler {
  /** Context operations to perform for this outcome (supports both formats) */
  readonly operations?: readonly (ContextOperation | LegacyOperation)[];
  
  /** Target to transition to after handling */
  readonly target: TransitionTarget;
}

/**
 * Configuration for invoking another flow.
 */
export interface FlowInvocation {
  /** ID of the flow to invoke */
  readonly flowId: string;
  
  /** Parameters to pass to the invoked flow */
  readonly parameters?: Record<string, any>;
  
  /** Handlers for different flow outcomes */
  readonly onResult: {
    readonly end?: FlowResultHandler;
    readonly cancel?: FlowResultHandler;
    readonly error?: FlowResultHandler;
  };
}

// =============================================================================
// CORE ENTITY TYPES
// =============================================================================

/**
 * Transition definition - represents a possible state change.
 * Supports pattern matching, conditions, and flow invocation.
 */
export interface Transition {
  /** Optional unique identifier for this transition */
  readonly id?: string;
  
  /** Pattern to match against user input (undefined = automatic) */
  readonly pattern?: string;
  
  /** Target for this transition */
  readonly target: TransitionTarget;
  
  /** Context operations to apply when taking this transition */
  readonly operations?: readonly ContextOperation[];
  
  /** Context updates (legacy - use operations instead) */
  readonly context?: Record<string, any>;
  
  /** Condition that must be satisfied */
  readonly condition?: Condition;
  
  /** Priority for pattern matching (higher = checked first) */
  readonly priority?: number;
  
  /** Flow invocation (alternative to direct target) */
  readonly flowInvocation?: FlowInvocation;
  
  /** Optional metadata */
  readonly meta?: Metadata;
}

/**
 * State definition - represents a conversation state.
 */
export interface State {
  /** Unique identifier within the flow */
  readonly id: string;
  
  /** Possible transitions from this state */
  readonly transitions: readonly Transition[];
  
  /** State metadata including message ID and transient flag */
  readonly meta?: Metadata;
}

/**
 * Flow definition - a collection of related states.
 */
export interface Flow {
  /** Unique identifier within the machine */
  readonly id: string;
  
  /** Initial state when entering this flow */
  readonly initial: string;
  
  /** Map of states in this flow */
  readonly states: ReadonlyMap<string, State>;
  
  /** Flow metadata */
  readonly meta?: Metadata;
}

/**
 * Machine definition - executable unit containing flows.
 */
export interface Machine {
  /** Unique identifier within the agent */
  readonly id: string;
  
  /** Initial flow when starting this machine */
  readonly initialFlow: string;
  
  /** Map of flows in this machine */
  readonly flows: ReadonlyMap<string, Flow>;
  
  /** Machine metadata */
  readonly meta?: Metadata;
}

/**
 * Agent definition - top-level entity containing one machine.
 */
export interface Agent {
  /** Unique identifier for this agent */
  readonly id: string;
  
  /** The machine that defines this agent's behavior */
  readonly machine: Machine;
  
  /** Agent metadata */
  readonly meta?: Metadata;
}

// =============================================================================
// LEGACY DEFINITION TYPES (for backward compatibility)
// =============================================================================

/**
 * Legacy flow definition using plain objects.
 * @deprecated Use Flow from the main type hierarchy
 */
export interface FlowDefinition {
  /** Unique identifier for this flow */
  id: string;

  /** ID of the initial state when entering this flow */
  initial: string;

  /** Map of state IDs to their definitions */
  states: Record<string, StateDefinition>;

  /** Optional metadata for the flow */
  meta?: {
    /** Display name for the flow */
    name?: string;

    /** Description of what this flow does */
    description?: string;

    /** Version of the flow definition */
    version?: string;

    /** Tags for categorizing flows */
    tags?: string[];

    /** Custom metadata for application-specific needs */
    custom?: Record<string, any>;
  };
}

/**
 * Legacy state definition using plain objects.
 * @deprecated Use State from the main type hierarchy
 */
export interface StateDefinition {
  /** List of possible transitions from this state */
  transitions: TransitionDefinition[];

  /** Optional metadata for the state */
  meta?: {
    /** ID of the message to send when entering this state */
    messageId?: string;

    /** Whether this is a transient state (auto-transitions) */
    transient?: boolean;

    /** Tags for categorizing states */
    tags?: string[];

    /** Custom metadata for application-specific needs */
    custom?: Record<string, any>;
  };
}

/**
 * Legacy transition definition using plain objects.
 * @deprecated Use Transition from the main type hierarchy
 */
export interface TransitionDefinition {
  /** Pattern to match against user input. If undefined, transition is automatic */
  pattern?: string;

  /** Target state ID or reference using type:ID format */
  target: string;

  /** Context updates to apply when taking this transition */
  context?: Record<string, any>;

  /** 
   * Optional condition for this transition. Supports multiple evaluation methods:
   * - Legacy JavaScript string: "context.verified === true" (deprecated)
   * - JavaScript code object: {type: "code", expression: "context.verified === true"}
   * - JSON Logic (recommended): {type: "jsonlogic", rule: {"==": [{"var": "verified"}, true]}}
   * Has access to context variables.
   */
  condition?: 
    | string // Legacy support
    | { type: "code"; expression: string }
    | { type: "jsonlogic"; rule: RulesLogic };

  /** Priority for pattern matching. Higher numbers are checked first */
  priority?: number;

  /** Flow invocation configuration */
  flowInvocation?: {
    /** ID of the flow to invoke */
    flowId: string;
    
    /** Parameters to pass to the invoked flow */
    parameters?: Record<string, any>;
    
    /** Result handlers for different flow outcomes */
    onResult: {
      end?: {
        operations?: Array<{
          set?: { variable: string; value: any };
          append?: { to: string; value: any };
          merge?: { into: string; value: any };
        }>;
        target: string;
      };
      cancel?: {
        operations?: Array<{
          set?: { variable: string; value: any };
          append?: { to: string; value: any };
          merge?: { into: string; value: any };
        }>;
        target: string;
      };
      error?: {
        operations?: Array<{
          set?: { variable: string; value: any };
          append?: { to: string; value: any };
          merge?: { into: string; value: any };
        }>;
        target: string;
      };
    };
  };
}

/**
 * Legacy machine definition using plain objects.
 * @deprecated Use Machine from the main type hierarchy
 */
export interface MachineDefinition {
  /** Unique identifier for this machine */
  id: string;

  /** ID of the initial flow when starting this machine */
  initialFlow: string;

  /** Map of flow IDs to their definitions */
  flows: Record<string, FlowDefinition>;

  /** Optional metadata for the machine */
  meta?: {
    /** Display name for the machine */
    name?: string;

    /** Description of what this machine does */
    description?: string;

    /** Version of the machine definition */
    version?: string;

    /** Tags for categorizing machines */
    tags?: string[];

    /** Custom metadata for application-specific needs */
    custom?: Record<string, any>;
  };
}

/**
 * Legacy agent definition using plain objects.
 * @deprecated Use Agent from the main type hierarchy
 */
export interface AgentDefinition {
  /** Unique identifier for this agent */
  id: string;

  /** The machine this agent executes */
  machine: MachineDefinition;

  /** Optional agent metadata */
  meta?: {
    /** Display name for the agent */
    name?: string;

    /** Description of the agent */
    description?: string;

    /** Version of the agent definition */
    version?: string;

    /** Custom metadata */
    custom?: Record<string, any>;
  };
}

// =============================================================================
// RUNTIME TYPES
// =============================================================================

/**
 * Execution stack frame for flow invocations.
 */
export interface ExecutionFrame {
  readonly flowId: string;
  readonly stateId: string;
  readonly returnHandler?: FlowResultHandler;
}

/**
 * Current execution state during runtime.
 */
export interface ExecutionState {
  /** Agent being executed */
  readonly agent: Agent;
  
  /** Current position in the state machine */
  readonly position: {
    readonly machineId: string;
    readonly flowId: string;
    readonly stateId: string;
  };
  
  /** Current context data */
  readonly context: Context;
  
  /** Execution stack for flow invocations */
  readonly stack: readonly ExecutionFrame[];
  
  /** Timestamp of last update */
  readonly timestamp: number;
}

/**
 * Internal state of a flow machine (legacy compatibility).
 */
export interface MachineState {
  /** Current state ID */
  currentState: string;

  /** Machine-specific context (merged with agent context) */
  localContext: Context;
}

/**
 * Types of triggers that can cause state changes.
 */
export type StateChangeTrigger =
  | 'input'      // User input triggered the change
  | 'transient'  // Automatic transition
  | 'flow'       // Flow invocation or return
  | 'machine'    // Cross-machine transition (legacy)
  | 'restore'    // State restored from persistence
  | 'init';      // Initial state entry

/**
 * Result of processing input or transitions.
 */
export interface ProcessResult {
  /** Current state ID after processing */
  state: string;

  /** Current machine (flow) ID */
  machine: string;

  /** Whether a transition occurred */
  transitioned: boolean;

  /** The transition that was taken, if any */
  transition?: Transition;

  /** Updated context after processing */
  context: Context;
}

/**
 * Event emitted when state changes occur.
 */
export interface StateChangeEvent {
  /** Agent ID */
  agent: string;

  /** Current machine (flow) ID */
  machine: string;

  /** Current state ID */
  state: string;

  /** Previous state ID, if any */
  previousState?: string;

  /** Previous machine ID, if different */
  previousMachine?: string;

  /** What triggered this state change */
  trigger: StateChangeTrigger;

  /** User input that triggered the change, if applicable */
  input?: string;

  /** Current context */
  context: Context;

  /** Unix timestamp of the event */
  timestamp: number;

  /** The transition that was taken, if any */
  transition?: Transition;
}

// =============================================================================
// SCOPED CONTEXT AND FLOW EXECUTION
// =============================================================================

/**
 * Scoped context system for proper variable resolution and isolation.
 */
export interface ScopedContext {
  /** Conversation-level context - persists for entire agent relationship */
  conversation: Record<string, any>;
  
  /** Flow-scoped context - isolated per individual flow execution */
  flow: Record<string, any>;
  
  /** Parameter context - temporary variables for current state/transition */
  params: Record<string, any>;
}

/**
 * Possible flow termination states.
 */
export type FlowTermination = 'end' | 'cancel' | 'error';

/**
 * Error that can occur during flow execution.
 */
export interface FlowError {
  type: FlowTermination;
  message: string;
  context?: any;
}

/**
 * Result of a flow execution.
 * Uses neverthrow pattern for explicit success/error handling.
 */
export type FlowResult = Result<any, FlowError>;

/**
 * A frame in the flow execution stack.
 * Represents a pending flow invocation that needs to return.
 */
export interface FlowStackFrame {
  /** ID of the flow that made the invocation */
  flowId: string;
  
  /** State ID within the invoking flow */
  stateId: string;
  
  /** Index of the transition that invoked the flow */
  transitionIndex: number;
  
  /** Complete scoped context at the time of invocation */
  contextSnapshot: ScopedContext;
}

/**
 * Complete flow execution state.
 * This includes the current flow and the stack of pending returns.
 */
export interface FlowExecutionState {
  /** ID of the currently executing flow */
  currentFlow: string;
  
  /** Current state within the executing flow */
  currentState: string;
  
  /** Stack of pending flow returns */
  flowStack: FlowStackFrame[];
  
  /** Result waiting to be processed by parent flow */
  pendingResult?: FlowResult;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Base error interface for discriminated unions.
 */
interface BaseError {
  readonly type: string;
  readonly message: string;
}

/**
 * Validation error for CSM entities.
 */
export interface ValidationError extends BaseError {
  readonly type: 'validation';
  readonly entityType: 'agent' | 'machine' | 'flow' | 'state' | 'transition';
  readonly entityId: string;
  readonly path?: readonly string[];
}

/**
 * Runtime execution error.
 */
export interface ExecutionError extends BaseError {
  readonly type: 'execution';
  readonly operation: 'processInput' | 'transition' | 'stateEntry' | 'flowInvocation';
  readonly position: ExecutionState['position'];
  readonly cause?: Error;
}

/**
 * Construction error when building entities.
 */
export interface ConstructionError extends BaseError {
  readonly type: 'construction';
  readonly cause?: Error;
}

/**
 * Error context for error handling (legacy compatibility).
 */
export interface ErrorContext {
  /** Current agent state when error occurred */
  agent: string;
  machine: string;
  state: string;

  /** What was being attempted */
  operation: 'processInput' | 'serialize' | 'deserialize' | 'transition' | 'stateEntry';

  /** Input that caused the error, if any */
  input?: string;

  /** Current context */
  context: Context;
}

/**
 * Union of all CSM errors.
 */
export type CsmError = ValidationError | ExecutionError | ConstructionError;

// =============================================================================
// SERIALIZATION TYPES
// =============================================================================

/**
 * Serializable representation using plain objects.
 * Used for persistence and network transfer.
 */
export interface SerializedAgent {
  readonly id: string;
  readonly machine: SerializedMachine;
  readonly meta?: Metadata;
}

export interface SerializedMachine {
  readonly id: string;
  readonly initialFlow: string;
  readonly flows: readonly SerializedFlow[];
  readonly meta?: Metadata;
}

export interface SerializedFlow {
  readonly id: string;
  readonly initial: string;
  readonly states: readonly SerializedState[];
  readonly meta?: Metadata;
}

export interface SerializedState {
  readonly id: string;
  readonly transitions: readonly SerializedTransition[];
  readonly meta?: Metadata;
}

export interface SerializedTransition {
  readonly id?: string;
  readonly pattern?: string;
  readonly target: string | { type: string; [key: string]: any };
  readonly operations?: readonly Record<string, any>[];
  readonly condition?: string | { type: string; [key: string]: any };
  readonly priority?: number;
  readonly flowInvocation?: Record<string, any>;
  readonly meta?: Metadata;
}

/**
 * Serialized execution state for persistence.
 */
export interface SerializedExecutionState {
  readonly agentId: string;
  readonly position: {
    readonly machineId: string;
    readonly flowId: string;
    readonly stateId: string;
  };
  readonly context: Context;
  readonly stack: readonly {
    readonly flowId: string;
    readonly stateId: string;
    readonly returnHandler?: Record<string, any>;
  }[];
  readonly timestamp: number;
  readonly version: number;
}

/**
 * Serialized agent state for persistence (legacy format).
 */
export interface SerializedAgentState {
  /** Agent ID */
  a: string;

  /** Current machine ID */
  m: string;

  /** Current state ID */
  s: string;

  /** Context data */
  c: Context;

  /** Flow execution state (for multi-flow machines with invocations) */
  f?: SerializableFlowExecutionState;

  /** Schema version for backward compatibility */
  v: number;
}

/**
 * Serializable representation of flow execution state for URL hash.
 */
export interface SerializableFlowExecutionState {
  /** Current flow ID */
  cf: string;
  
  /** Current state ID */
  cs: string;
  
  /** Serialized flow stack */
  fs: Array<{
    /** Flow ID */
    f: string;
    /** State ID */
    s: string;
    /** Transition index */
    t: number;
    /** Context snapshot */
    c: {
      /** Conversation context */
      conv: Record<string, any>;
      /** Flow context */
      flow: Record<string, any>;
      /** Parameter context */
      params: Record<string, any>;
    };
  }>;
  
  /** Pending result (if any) */
  pr?: {
    /** Is success */
    ok: boolean;
    /** Data (success) or error details */
    data: any;
  };
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

/**
 * Serialization options.
 */
export interface SerializationOptions {
  /** Whether to compress the serialized data. Default: true */
  compress?: boolean;

  /** Optional encryption settings */
  encryption?: {
    /** Encryption key */
    key: string;

    /** Algorithm to use. Default: 'aes-256-gcm' */
    algorithm?: string;
  };
}

/**
 * Options for creating a ConversationalAgent (legacy).
 */
export interface AgentOptions {
  /** Unique identifier for this agent instance */
  id: string;

  /**
   * Callback invoked on every state change.
   * This is where you send messages, log analytics, etc.
   */
  onStateChange: (event: StateChangeEvent) => Promise<void> | void;

  /** Optional serialization configuration */
  serialization?: SerializationOptions;

  /** Optional error handler */
  onError?: (error: Error, context: ErrorContext) => void;

  /** Initial context if creating new agent */
  initialContext?: Context;
}

/**
 * Options for creating runtime agents.
 */
export interface AgentConfig {
  /** Unique identifier for this agent instance */
  readonly id: string;
  
  /** Agent definition */
  readonly definition: Agent;
  
  /** Callback for state changes */
  readonly onStateChange: (event: StateChangeEvent) => Promise<void> | void;
  
  /** Error handler */
  readonly onError?: (error: CsmError) => void;
  
  /** Initial context if creating new */
  readonly initialContext?: Context;
  
  /** Serialization options */
  readonly serialization?: {
    readonly compress?: boolean;
    readonly encryption?: {
      readonly key: string;
      readonly algorithm?: string;
    };
  };
}

// =============================================================================
// SUBFLOW TYPES
// =============================================================================

/**
 * Configuration for sub-flow execution.
 */
export interface SubFlowCall {
  /** ID of the sub-flow to execute */
  flowId: string;
  
  /** Variable name to store the return value */
  returnVar: string;
  
  /** How to handle the return value */
  aggregation: 'append' | 'overwrite' | 'merge';
  
  /** Optional initial parameters for the sub-flow */
  parameters?: Record<string, any>;
}

/**
 * Return type configuration for sub-flows.
 */
export interface SubFlowReturnType {
  /** Name of the variable to return */
  variable: string;
  
  /** Optional transformation to apply */
  transform?: 'uppercase' | 'lowercase' | 'trim' | 'json';
  
  /** Default value if variable is not set */
  defaultValue?: any;
}

/**
 * Machine definition extended with sub-flow capabilities.
 */
export interface SubFlowMachineDefinition extends MachineDefinition {
  /** Configuration for flows that can be called as sub-flows */
  subFlows?: Record<string, {
    /** Return type configuration */
    returns?: SubFlowReturnType;
    
    /** Whether this flow can be reused */
    reusable?: boolean;
  }>;
}

/**
 * Transition extended with sub-flow invocation.
 */
export interface SubFlowTransition extends TransitionDefinition {
  /** Sub-flow call configuration */
  subFlow?: SubFlowCall;
}

/**
 * Result of sub-flow execution.
 */
export interface SubFlowResult {
  /** The return value from the sub-flow */
  value: any;
  
  /** Final context from the sub-flow */
  context: Context;
  
  /** How the sub-flow terminated */
  termination: 'success' | 'error' | 'cancel';
  
  /** Optional error message */
  error?: string;
}

// =============================================================================
// RESULT TYPE ALIASES
// =============================================================================

// Common Result types used throughout CSM
export type CsmResult<T> = Result<T, CsmError>;
export type ValidationResult<T> = Result<T, ValidationError>;
export type ExecutionResult<T> = Result<T, ExecutionError>;
export type ConstructionResult<T> = Result<T, ConstructionError>;

// =============================================================================
// TYPE ALIASES FOR BACKWARD COMPATIBILITY
// =============================================================================

// Maintain some legacy aliases to minimize breaking changes
export type EntityMeta = Metadata;
export type StateMeta = Metadata;
export type AgentExecutionState = ExecutionState;
export type SerializableAgent = SerializedAgent;
export type SerializableExecutionState = SerializedExecutionState;
export type HierarchyAgent = Agent; 
export type HierarchyMachine = Machine;
export type HierarchyFlow = Flow;
export type HierarchyState = State;
export type HierarchyTransition = Transition;
export type HierarchyProcessResult = ProcessResult;
export type HierarchyStateChangeTrigger = StateChangeTrigger;
export type HierarchyStateMeta = Metadata;
export type LegacyContext = Context;
export type LegacyFlowDefinition = FlowDefinition;
export type LegacyStateDefinition = StateDefinition;
export type LegacyTransition = Transition;
export type LegacyProcessResult = ProcessResult;
export type LegacyStateChangeEvent = StateChangeEvent;
export type LegacyStateChangeTrigger = StateChangeTrigger;
export type LegacyStateMeta = Metadata;
export type LegacyAgentOptions = AgentOptions;