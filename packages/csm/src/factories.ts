/**
 * @module factories
 * Factory functions for creating CSM entities.
 * Provides convenient ways to construct common patterns and configurations.
 */

import type { Result } from '@rcs-lang/core';
import { ok, err } from '@rcs-lang/core';
import type {
  Agent,
  Machine,
  Flow,
  State,
  Transition,
  TransitionTarget,
  StateTarget,
  FlowTarget,
  TerminalTarget,
  Condition,
  ContextOperation,
  FlowInvocation,
  EntityMeta,
  StateMeta,
  AgentId,
  MachineId,
  FlowId,
  StateId,
  CsmError,
  ValidationError,
  ConstructionError
} from './unified-types.js';
import {
  isAgent,
  isMachine,
  isFlow,
  isState,
  isTransition,
  isTransitionTarget,
  isCondition,
  isContextOperation
} from './type-guards.js';

// =============================================================================
// ID CREATION UTILITIES
// =============================================================================

/**
 * Creates a typed AgentId from a string.
 */
export function createAgentId(id: string): AgentId {
  return id as AgentId;
}

/**
 * Creates a typed MachineId from a string.
 */
export function createMachineId(id: string): MachineId {
  return id as MachineId;
}

/**
 * Creates a typed FlowId from a string.
 */
export function createFlowId(id: string): FlowId {
  return id as FlowId;
}

/**
 * Creates a typed StateId from a string.
 */
export function createStateId(id: string): StateId {
  return id as StateId;
}

// =============================================================================
// TARGET FACTORIES
// =============================================================================

/**
 * Creates a StateTarget.
 */
export function createStateTarget(stateId: StateId | string): StateTarget {
  return {
    type: 'state',
    stateId: typeof stateId === 'string' ? createStateId(stateId) : stateId
  };
}

/**
 * Creates a FlowTarget.
 */
export function createFlowTarget(flowId: FlowId | string): FlowTarget {
  return {
    type: 'flow',
    flowId: typeof flowId === 'string' ? createFlowId(flowId) : flowId
  };
}

/**
 * Creates a TerminalTarget.
 */
export function createTerminalTarget(
  reason?: 'success' | 'error' | 'cancel' | 'timeout',
  message?: string
): TerminalTarget {
  return {
    type: 'terminal',
    ...(reason && { reason }),
    ...(message && { message })
  };
}

// =============================================================================
// CONDITION FACTORIES
// =============================================================================

/**
 * Creates a CodeCondition.
 */
export function createCodeCondition(expression: string): Condition {
  return {
    type: 'code',
    expression
  };
}

/**
 * Creates a JsonLogicCondition.
 */
export function createJsonLogicCondition(rule: import('json-logic-js').RulesLogic): Condition {
  return {
    type: 'jsonlogic',
    rule
  };
}

/**
 * Creates a LegacyCondition (deprecated).
 * @deprecated Use createCodeCondition instead
 */
export function createLegacyCondition(expression: string): Condition {
  return {
    type: 'legacy',
    expression
  };
}

// =============================================================================
// CONTEXT OPERATION FACTORIES
// =============================================================================

/**
 * Creates a SetOperation.
 */
export function createSetOperation(variable: string, value: any): ContextOperation {
  return {
    type: 'set',
    variable,
    value
  };
}

/**
 * Creates an AppendOperation.
 */
export function createAppendOperation(target: string, value: any): ContextOperation {
  return {
    type: 'append',
    target,
    value
  };
}

/**
 * Creates a MergeOperation.
 */
export function createMergeOperation(target: string, value: Record<string, any>): ContextOperation {
  return {
    type: 'merge',
    target,
    value
  };
}

// =============================================================================
// TRANSITION FACTORIES
// =============================================================================

/**
 * Options for creating a transition.
 */
export interface TransitionOptions {
  readonly id?: string;
  readonly pattern?: string;
  readonly target?: TransitionTarget;
  readonly contextOperations?: readonly ContextOperation[];
  readonly condition?: Condition;
  readonly priority?: number;
  readonly flowInvocation?: FlowInvocation;
}

/**
 * Creates a Transition with validation.
 */
export function createTransition(options: TransitionOptions): Result<Transition, CsmError> {
  try {
    // Validate that we have either target or flowInvocation
    if (!options.target && !options.flowInvocation) {
      return err({
        type: 'construction',
        message: 'Transition must have either a target or flowInvocation'
      } as ConstructionError);
    }

    // Validate target if provided
    if (options.target && !isTransitionTarget(options.target)) {
      return err({
        type: 'validation',
        entityType: 'transition',
        entityId: options.id || 'unknown',
        message: 'Invalid transition target'
      } as ValidationError);
    }

    // Validate condition if provided
    if (options.condition && !isCondition(options.condition)) {
      return err({
        type: 'validation',
        entityType: 'transition',
        entityId: options.id || 'unknown',
        message: 'Invalid condition'
      } as ValidationError);
    }

    // Validate context operations if provided
    if (options.contextOperations && !options.contextOperations.every(isContextOperation)) {
      return err({
        type: 'validation',
        entityType: 'transition',
        entityId: options.id || 'unknown',
        message: 'Invalid context operations'
      } as ValidationError);
    }

    const transition: Transition = {
      ...(options.id && { id: options.id }),
      ...(options.pattern && { pattern: options.pattern }),
      target: options.target!,
      ...(options.contextOperations && { contextOperations: options.contextOperations }),
      ...(options.condition && { condition: options.condition }),
      ...(options.priority !== undefined && { priority: options.priority }),
      ...(options.flowInvocation && { flowInvocation: options.flowInvocation })
    };

    return ok(transition);
  } catch (error) {
    return err({
      type: 'construction',
      message: `Failed to create transition: ${error instanceof Error ? error.message : 'unknown error'}`,
      cause: error instanceof Error ? error : undefined
    } as ConstructionError);
  }
}

/**
 * Creates a simple pattern-based transition.
 */
export function createPatternTransition(
  pattern: string,
  target: TransitionTarget,
  contextOperations?: readonly ContextOperation[]
): Result<Transition, CsmError> {
  return createTransition({
    pattern,
    target,
    contextOperations
  });
}

/**
 * Creates an automatic (transient) transition.
 */
export function createAutoTransition(
  target: TransitionTarget,
  condition?: Condition,
  contextOperations?: readonly ContextOperation[]
): Result<Transition, CsmError> {
  return createTransition({
    target,
    condition,
    contextOperations
  });
}

// =============================================================================
// STATE FACTORIES
// =============================================================================

/**
 * Options for creating a state.
 */
export interface StateOptions {
  readonly id: StateId | string;
  readonly transitions: readonly Transition[];
  readonly meta?: StateMeta;
}

/**
 * Creates a State with validation.
 */
export function createState(options: StateOptions): Result<State, CsmError> {
  try {
    const stateId = typeof options.id === 'string' ? createStateId(options.id) : options.id;

    // Validate transitions
    if (!Array.isArray(options.transitions) || options.transitions.length === 0) {
      return err({
        type: 'validation',
        entityType: 'state',
        entityId: stateId,
        message: 'State must have at least one transition'
      } as ValidationError);
    }

    if (!options.transitions.every(isTransition)) {
      return err({
        type: 'validation',
        entityType: 'state',
        entityId: stateId,
        message: 'All transitions must be valid'
      } as ValidationError);
    }

    const state: State = {
      id: stateId,
      transitions: options.transitions,
      ...(options.meta && { meta: options.meta })
    };

    return ok(state);
  } catch (error) {
    return err({
      type: 'construction',
      message: `Failed to create state: ${error instanceof Error ? error.message : 'unknown error'}`,
      cause: error instanceof Error ? error : undefined
    } as ConstructionError);
  }
}

/**
 * Creates a simple state with pattern transitions.
 */
export function createSimpleState(
  id: StateId | string,
  transitions: Array<{ pattern: string; target: TransitionTarget; operations?: readonly ContextOperation[] }>,
  meta?: StateMeta
): Result<State, CsmError> {
  try {
    const transitionResults = transitions.map(t => 
      createPatternTransition(t.pattern, t.target, t.operations)
    );

    // Check if any transitions failed
    for (const result of transitionResults) {
      if (!result.success) {
        return result;
      }
    }

    const validTransitions = transitionResults.map(r => r.success ? r.value : null).filter(Boolean) as Transition[];

    return createState({
      id,
      transitions: validTransitions,
      meta
    });
  } catch (error) {
    return err({
      type: 'construction',
      message: `Failed to create simple state: ${error instanceof Error ? error.message : 'unknown error'}`,
      cause: error instanceof Error ? error : undefined
    } as ConstructionError);
  }
}

// =============================================================================
// FLOW FACTORIES
// =============================================================================

/**
 * Options for creating a flow.
 */
export interface FlowOptions {
  readonly id: FlowId | string;
  readonly initial: StateId | string;
  readonly states: readonly State[];
  readonly meta?: EntityMeta;
}

/**
 * Creates a Flow with validation.
 */
export function createFlow(options: FlowOptions): Result<Flow, CsmError> {
  try {
    const flowId = typeof options.id === 'string' ? createFlowId(options.id) : options.id;
    const initialId = typeof options.initial === 'string' ? createStateId(options.initial) : options.initial;

    // Validate states
    if (!Array.isArray(options.states) || options.states.length === 0) {
      return err({
        type: 'validation',
        entityType: 'flow',
        entityId: flowId,
        message: 'Flow must have at least one state'
      } as ValidationError);
    }

    if (!options.states.every(isState)) {
      return err({
        type: 'validation',
        entityType: 'flow',
        entityId: flowId,
        message: 'All states must be valid'
      } as ValidationError);
    }

    // Create states map
    const statesMap = new Map<StateId, State>();
    for (const state of options.states) {
      if (statesMap.has(state.id)) {
        return err({
          type: 'validation',
          entityType: 'flow',
          entityId: flowId,
          message: `Duplicate state ID: ${state.id}`
        } as ValidationError);
      }
      statesMap.set(state.id, state);
    }

    // Validate that initial state exists
    if (!statesMap.has(initialId)) {
      return err({
        type: 'validation',
        entityType: 'flow',
        entityId: flowId,
        message: `Initial state '${initialId}' not found in states`
      } as ValidationError);
    }

    const flow: Flow = {
      id: flowId,
      initial: initialId,
      states: statesMap,
      ...(options.meta && { meta: options.meta })
    };

    return ok(flow);
  } catch (error) {
    return err({
      type: 'construction',
      message: `Failed to create flow: ${error instanceof Error ? error.message : 'unknown error'}`,
      cause: error instanceof Error ? error : undefined
    } as ConstructionError);
  }
}

// =============================================================================
// MACHINE FACTORIES
// =============================================================================

/**
 * Options for creating a machine.
 */
export interface MachineOptions {
  readonly id: MachineId | string;
  readonly initialFlow: FlowId | string;
  readonly flows: readonly Flow[];
  readonly meta?: EntityMeta;
}

/**
 * Creates a Machine with validation.
 */
export function createMachine(options: MachineOptions): Result<Machine, CsmError> {
  try {
    const machineId = typeof options.id === 'string' ? createMachineId(options.id) : options.id;
    const initialFlowId = typeof options.initialFlow === 'string' ? createFlowId(options.initialFlow) : options.initialFlow;

    // Validate flows
    if (!Array.isArray(options.flows) || options.flows.length === 0) {
      return err({
        type: 'validation',
        entityType: 'machine',
        entityId: machineId,
        message: 'Machine must have at least one flow'
      } as ValidationError);
    }

    if (!options.flows.every(isFlow)) {
      return err({
        type: 'validation',
        entityType: 'machine',
        entityId: machineId,
        message: 'All flows must be valid'
      } as ValidationError);
    }

    // Create flows map
    const flowsMap = new Map<FlowId, Flow>();
    for (const flow of options.flows) {
      if (flowsMap.has(flow.id)) {
        return err({
          type: 'validation',
          entityType: 'machine',
          entityId: machineId,
          message: `Duplicate flow ID: ${flow.id}`
        } as ValidationError);
      }
      flowsMap.set(flow.id, flow);
    }

    // Validate that initial flow exists
    if (!flowsMap.has(initialFlowId)) {
      return err({
        type: 'validation',
        entityType: 'machine',
        entityId: machineId,
        message: `Initial flow '${initialFlowId}' not found in flows`
      } as ValidationError);
    }

    const machine: Machine = {
      id: machineId,
      initialFlow: initialFlowId,
      flows: flowsMap,
      ...(options.meta && { meta: options.meta })
    };

    return ok(machine);
  } catch (error) {
    return err({
      type: 'construction',
      message: `Failed to create machine: ${error instanceof Error ? error.message : 'unknown error'}`,
      cause: error instanceof Error ? error : undefined
    } as ConstructionError);
  }
}

/**
 * Creates a single-flow machine (common pattern).
 * This is a convenience factory for the most common use case.
 */
export function createSingleFlowMachine(
  machineId: MachineId | string,
  flow: Flow,
  meta?: EntityMeta
): Result<Machine, CsmError> {
  return createMachine({
    id: machineId,
    initialFlow: flow.id,
    flows: [flow],
    meta
  });
}

// =============================================================================
// AGENT FACTORIES
// =============================================================================

/**
 * Options for creating an agent.
 */
export interface AgentOptions {
  readonly id: AgentId | string;
  readonly machine: Machine;
  readonly meta?: EntityMeta;
}

/**
 * Creates an Agent with validation.
 */
export function createAgent(options: AgentOptions): Result<Agent, CsmError> {
  try {
    const agentId = typeof options.id === 'string' ? createAgentId(options.id) : options.id;

    // Validate machine
    if (!isMachine(options.machine)) {
      return err({
        type: 'validation',
        entityType: 'agent',
        entityId: agentId,
        message: 'Agent must have a valid machine'
      } as ValidationError);
    }

    const agent: Agent = {
      id: agentId,
      machine: options.machine,
      ...(options.meta && { meta: options.meta })
    };

    return ok(agent);
  } catch (error) {
    return err({
      type: 'construction',
      message: `Failed to create agent: ${error instanceof Error ? error.message : 'unknown error'}`,
      cause: error instanceof Error ? error : undefined
    } as ConstructionError);
  }
}

/**
 * Creates a simple agent with a single-flow machine.
 * This is the most common pattern for basic conversational agents.
 */
export function createSimpleAgent(
  agentId: AgentId | string,
  machineId: MachineId | string,
  flow: Flow,
  meta?: EntityMeta
): Result<Agent, CsmError> {
  const machineResult = createSingleFlowMachine(machineId, flow, meta);
  if (!machineResult.success) {
    return machineResult;
  }

  return createAgent({
    id: agentId,
    machine: machineResult.value,
    meta
  });
}

// =============================================================================
// CONVENIENCE BUILDERS
// =============================================================================

/**
 * Quick builder for common linear flow patterns.
 * Creates a flow where states transition in sequence.
 */
export function createLinearFlow(
  flowId: FlowId | string,
  stateConfigs: Array<{
    id: StateId | string;
    pattern: string;
    messageId?: string;
    contextOperations?: readonly ContextOperation[];
  }>,
  terminalReason: 'success' | 'error' | 'cancel' = 'success',
  meta?: EntityMeta
): Result<Flow, CsmError> {
  try {
    const states: State[] = [];
    
    for (let i = 0; i < stateConfigs.length; i++) {
      const config = stateConfigs[i];
      const isLast = i === stateConfigs.length - 1;
      
      // Determine target
      const target: TransitionTarget = isLast 
        ? createTerminalTarget(terminalReason)
        : createStateTarget(
            typeof stateConfigs[i + 1].id === 'string' 
              ? createStateId(stateConfigs[i + 1].id) 
              : stateConfigs[i + 1].id
          );

      // Create transition
      const transitionResult = createPatternTransition(
        config.pattern,
        target,
        config.contextOperations
      );
      
      if (!transitionResult.success) {
        return transitionResult;
      }

      // Create state
      const stateResult = createState({
        id: config.id,
        transitions: [transitionResult.value],
        meta: config.messageId ? { messageId: config.messageId } : undefined
      });

      if (!stateResult.success) {
        return stateResult;
      }

      states.push(stateResult.value);
    }

    return createFlow({
      id: flowId,
      initial: states[0].id,
      states,
      meta
    });
  } catch (error) {
    return err({
      type: 'construction',
      message: `Failed to create linear flow: ${error instanceof Error ? error.message : 'unknown error'}`,
      cause: error instanceof Error ? error : undefined
    } as ConstructionError);
  }
}