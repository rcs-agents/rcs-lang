/**
 * @module flow-execution
 * Flow invocation and execution management with cross-request state preservation.
 */

import { Result, ok, err } from 'neverthrow';
import type { Context } from './types';

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

/**
 * Creates a successful flow result.
 */
export function createFlowSuccess(data: any): FlowResult {
  return ok(data);
}

/**
 * Creates a flow error result.
 */
export function createFlowError(type: FlowTermination, message: string, context?: any): FlowResult {
  return err({ type, message, context });
}

/**
 * Context operation types for flow result handlers.
 */
export interface ContextOperation {
  set?: { variable: string; value: any };
  append?: { to: string; value: any };
  merge?: { into: string; value: any };
}

/**
 * Applies context operations to a scoped context object.
 * Operations are applied to the conversation scope by default.
 * 
 * @param context - The scoped context to modify
 * @param operations - Array of operations to apply
 * @returns New scoped context with operations applied
 */
export function applyContextOperations(
  context: ScopedContext, 
  operations: ContextOperation[]
): ScopedContext {
  let newContext: ScopedContext = {
    conversation: { ...context.conversation },
    flow: { ...context.flow },
    params: { ...context.params }
  };
  
  for (const operation of operations) {
    if (operation.set) {
      // Set operations modify conversation scope by default
      newContext.conversation[operation.set.variable] = operation.set.value;
    } else if (operation.append) {
      // Append operations modify conversation scope by default
      const existing = newContext.conversation[operation.append.to];
      if (Array.isArray(existing)) {
        newContext.conversation[operation.append.to] = [...existing, operation.append.value];
      } else {
        // Initialize as array if it doesn't exist or isn't an array
        newContext.conversation[operation.append.to] = [operation.append.value];
      }
    } else if (operation.merge) {
      // Merge operations modify conversation scope by default
      const existing = newContext.conversation[operation.merge.into];
      if (typeof existing === 'object' && existing !== null && !Array.isArray(existing)) {
        newContext.conversation[operation.merge.into] = { ...existing, ...operation.merge.value };
      } else {
        // Initialize as object if it doesn't exist or isn't an object
        newContext.conversation[operation.merge.into] = { ...operation.merge.value };
      }
    }
  }
  
  return newContext;
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

/**
 * Serializes flow execution state for URL hash storage.
 */
export function serializeFlowExecutionState(state: FlowExecutionState): SerializableFlowExecutionState {
  return {
    cf: state.currentFlow,
    cs: state.currentState,
    fs: state.flowStack.map(frame => ({
      f: frame.flowId,
      s: frame.stateId,
      t: frame.transitionIndex,
      c: {
        conv: frame.contextSnapshot.conversation,
        flow: frame.contextSnapshot.flow,
        params: frame.contextSnapshot.params
      }
    })),
    pr: state.pendingResult ? {
      ok: state.pendingResult.isOk(),
      data: state.pendingResult.isOk() 
        ? state.pendingResult._unsafeUnwrap()
        : state.pendingResult._unsafeUnwrapErr()
    } : undefined
  };
}

/**
 * Deserializes flow execution state from URL hash storage.
 */
export function deserializeFlowExecutionState(serialized: SerializableFlowExecutionState): FlowExecutionState {
  return {
    currentFlow: serialized.cf,
    currentState: serialized.cs,
    flowStack: serialized.fs.map(frame => ({
      flowId: frame.f,
      stateId: frame.s,
      transitionIndex: frame.t,
      contextSnapshot: {
        conversation: frame.c.conv,
        flow: frame.c.flow,
        params: frame.c.params
      }
    })),
    pendingResult: serialized.pr ? (
      serialized.pr.ok 
        ? ok(serialized.pr.data)
        : err(serialized.pr.data)
    ) : undefined
  };
}