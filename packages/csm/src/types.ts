/**
 * @module types
 * Core type definitions for the Conversation State Machine library.
 */

/**
 * Context object that accumulates data throughout the conversation.
 * This is shared across all flows within an agent.
 */
export interface Context {
  [key: string]: any;
}

/**
 * Defines a transition from one state to another.
 */
export interface Transition {
  /** Pattern to match against user input. If undefined, transition is automatic (transient state). */
  pattern?: string;

  /** Target state ID or "machine:FlowId" for cross-flow transitions. */
  target: string;

  /** Context updates to apply when taking this transition. */
  context?: Record<string, any>;

  /** Optional JavaScript condition expression. Has access to context. */
  condition?: string;

  /** Priority for pattern matching. Higher numbers are checked first. Default: 0 */
  priority?: number;
}

/**
 * Metadata for a state.
 */
export interface StateMeta {
  /** ID of the message to send when entering this state. */
  messageId?: string;

  /** Whether this is a transient state (auto-transitions). */
  transient?: boolean;

  /** Tags for categorizing states. */
  tags?: string[];

  /** Custom metadata for application-specific needs. */
  custom?: Record<string, any>;
}

/**
 * Defines a single state within a flow.
 */
export interface StateDefinition {
  /** List of possible transitions from this state. */
  transitions: Transition[];

  /** Optional metadata for the state. */
  meta?: StateMeta;
}

/**
 * Complete definition of a conversation flow.
 * This is typically generated from an RCL flow definition.
 * @deprecated Use MachineDefinitionJSON from machine-definition module
 */
export interface FlowDefinition {
  /** Unique identifier for this flow. */
  id: string;

  /** ID of the initial state when entering this flow. */
  initial: string;

  /** Map of state IDs to their definitions. */
  states: Record<string, StateDefinition>;

  /** Optional metadata for the flow. */
  meta?: {
    /** Display name for the flow. */
    name?: string;

    /** Description of what this flow does. */
    description?: string;

    /** Version of the flow definition. */
    version?: string;

    /** Custom metadata. */
    custom?: Record<string, any>;
  };
}

/**
 * Result of processing user input.
 */
export interface ProcessResult {
  /** Current state ID after processing. */
  state: string;

  /** Current machine (flow) ID. */
  machine: string;

  /** Whether a transition occurred. */
  transitioned: boolean;

  /** The transition that was taken, if any. */
  transition?: Transition;

  /** Updated context after processing. */
  context: Context;
}

/**
 * Types of triggers that can cause state changes.
 */
export type StateChangeTrigger =
  | 'input' // User input triggered the change
  | 'transient' // Automatic transition from transient state
  | 'machine' // Cross-machine transition
  | 'restore' // State restored from serialization
  | 'init'; // Initial state entry

/**
 * Event emitted when state changes occur.
 */
export interface StateChangeEvent {
  /** Agent ID. */
  agent: string;

  /** Current machine (flow) ID. */
  machine: string;

  /** Current state ID. */
  state: string;

  /** Previous state ID, if any. */
  previousState?: string;

  /** Previous machine ID, if different. */
  previousMachine?: string;

  /** What triggered this state change. */
  trigger: StateChangeTrigger;

  /** User input that triggered the change, if applicable. */
  input?: string;

  /** Current context. */
  context: Context;

  /** Unix timestamp of the event. */
  timestamp: number;

  /** The transition that was taken, if any. */
  transition?: Transition;
}

/**
 * Error context for error handling.
 */
export interface ErrorContext {
  /** Current agent state when error occurred. */
  agent: string;
  machine: string;
  state: string;

  /** What was being attempted. */
  operation: 'processInput' | 'serialize' | 'deserialize' | 'transition' | 'stateEntry';

  /** Input that caused the error, if any. */
  input?: string;

  /** Current context. */
  context: Context;
}

/**
 * Serialization options.
 */
export interface SerializationOptions {
  /** Whether to compress the serialized data. Default: true */
  compress?: boolean;

  /** Optional encryption settings. */
  encryption?: {
    /** Encryption key. */
    key: string;

    /** Algorithm to use. Default: 'aes-256-gcm' */
    algorithm?: string;
  };
}

/**
 * Options for creating a ConversationalAgent.
 */
export interface AgentOptions {
  /** Unique identifier for this agent instance. */
  id: string;

  /**
   * Callback invoked on every state change.
   * This is where you send messages, log analytics, etc.
   */
  onStateChange: (event: StateChangeEvent) => Promise<void> | void;

  /** Optional serialization configuration. */
  serialization?: SerializationOptions;

  /** Optional error handler. */
  onError?: (error: Error, context: ErrorContext) => void;

  /** Initial context if creating new agent. */
  initialContext?: Context;
}

/**
 * Serialized agent state for persistence.
 */
export interface SerializedAgentState {
  /** Agent ID. */
  a: string;

  /** Current machine ID. */
  m: string;

  /** Current state ID. */
  s: string;

  /** Context data. */
  c: Context;

  /** Schema version for backward compatibility. */
  v: number;
}

/**
 * Internal state of a flow machine.
 */
export interface MachineState {
  /** Current state ID. */
  currentState: string;

  /** Machine-specific context (merged with agent context). */
  localContext: Context;
}
