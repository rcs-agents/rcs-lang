/**
 * @module builders
 * Type-safe fluent builders for the new CSM hierarchy.
 * Provides an intuitive API for constructing complex CSM entities.
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
  Condition,
  ContextOperation,
  FlowInvocation,
  EntityMeta,
  StateMeta,
  AgentId,
  MachineId,
  FlowId,
  StateId,
  CsmError
} from './unified-types.js';
import {
  createAgent,
  createMachine,
  createFlow,
  createState,
  createTransition,
  createStateTarget,
  createFlowTarget,
  createTerminalTarget,
  createCodeCondition,
  createJsonLogicCondition,
  createSetOperation,
  createAppendOperation,
  createMergeOperation,
  createAgentId,
  createMachineId,
  createFlowId,
  createStateId
} from './factories.js';

// =============================================================================
// TRANSITION BUILDER
// =============================================================================

/**
 * Fluent builder for creating transitions.
 */
export class TransitionBuilder {
  private _id?: string;
  private _pattern?: string;
  private _target?: TransitionTarget;
  private _contextOperations: ContextOperation[] = [];
  private _condition?: Condition;
  private _priority?: number;
  private _flowInvocation?: FlowInvocation;

  /**
   * Sets the transition ID.
   */
  id(id: string): this {
    this._id = id;
    return this;
  }

  /**
   * Sets the input pattern to match.
   */
  onPattern(pattern: string): this {
    this._pattern = pattern;
    return this;
  }

  /**
   * Sets the target to a specific state.
   */
  toState(stateId: StateId | string): this {
    this._target = createStateTarget(stateId);
    return this;
  }

  /**
   * Sets the target to a specific flow.
   */
  toFlow(flowId: FlowId | string): this {
    this._target = createFlowTarget(flowId);
    return this;
  }

  /**
   * Sets the target to terminate the conversation.
   */
  toTerminal(reason?: 'success' | 'error' | 'cancel' | 'timeout', message?: string): this {
    this._target = createTerminalTarget(reason, message);
    return this;
  }

  /**
   * Adds a context operation to set a variable.
   */
  set(variable: string, value: any): this {
    this._contextOperations.push(createSetOperation(variable, value));
    return this;
  }

  /**
   * Adds a context operation to append to a variable.
   */
  append(target: string, value: any): this {
    this._contextOperations.push(createAppendOperation(target, value));
    return this;
  }

  /**
   * Adds a context operation to merge into a variable.
   */
  merge(target: string, value: Record<string, any>): this {
    this._contextOperations.push(createMergeOperation(target, value));
    return this;
  }

  /**
   * Sets a JavaScript code condition.
   */
  whenCode(expression: string): this {
    this._condition = createCodeCondition(expression);
    return this;
  }

  /**
   * Sets a JSON Logic condition.
   */
  whenJsonLogic(rule: import('json-logic-js').RulesLogic): this {
    this._condition = createJsonLogicCondition(rule);
    return this;
  }

  /**
   * Sets the priority for pattern matching.
   */
  priority(priority: number): this {
    this._priority = priority;
    return this;
  }

  /**
   * Sets flow invocation configuration.
   */
  invokeFlow(invocation: FlowInvocation): this {
    this._flowInvocation = invocation;
    return this;
  }

  /**
   * Builds the transition.
   */
  build(): Result<Transition, CsmError> {
    return createTransition({
      id: this._id,
      pattern: this._pattern,
      target: this._target,
      contextOperations: this._contextOperations.length > 0 ? this._contextOperations : undefined,
      condition: this._condition,
      priority: this._priority,
      flowInvocation: this._flowInvocation
    });
  }
}

// =============================================================================
// STATE BUILDER
// =============================================================================

/**
 * Fluent builder for creating states.
 */
export class StateBuilder {
  private _id: StateId;
  private _transitions: Transition[] = [];
  private _meta?: StateMeta;

  constructor(id: StateId | string) {
    this._id = typeof id === 'string' ? createStateId(id) : id;
  }

  /**
   * Adds a transition using a builder.
   */
  transition(configureFn: (builder: TransitionBuilder) => void): this {
    const builder = new TransitionBuilder();
    configureFn(builder);
    const result = builder.build();
    
    if (result.success) {
      this._transitions.push(result.value);
    } else {
      throw new Error(`Failed to build transition: ${result.error.message}`);
    }
    
    return this;
  }

  /**
   * Adds a simple pattern transition.
   */
  onInput(pattern: string): TransitionBuilder {
    const builder = new TransitionBuilder().onPattern(pattern);
    
    // Return a modified builder that adds the transition when built
    const originalBuild = builder.build.bind(builder);
    builder.build = () => {
      const result = originalBuild();
      if (result.success) {
        this._transitions.push(result.value);
      }
      return result;
    };
    
    return builder;
  }

  /**
   * Adds an automatic transition (no pattern).
   */
  auto(): TransitionBuilder {
    const builder = new TransitionBuilder();
    
    // Return a modified builder that adds the transition when built
    const originalBuild = builder.build.bind(builder);
    builder.build = () => {
      const result = originalBuild();
      if (result.success) {
        this._transitions.push(result.value);
      }
      return result;
    };
    
    return builder;
  }

  /**
   * Sets the message ID for this state.
   */
  message(messageId: string): this {
    this._meta = { ...this._meta, messageId };
    return this;
  }

  /**
   * Marks this state as transient.
   */
  transient(isTransient: boolean = true): this {
    this._meta = { ...this._meta, transient: isTransient };
    return this;
  }

  /**
   * Adds tags to this state.
   */
  tags(...tags: string[]): this {
    this._meta = { ...this._meta, tags };
    return this;
  }

  /**
   * Sets custom metadata.
   */
  custom(custom: Record<string, any>): this {
    this._meta = { ...this._meta, custom };
    return this;
  }

  /**
   * Builds the state.
   */
  build(): Result<State, CsmError> {
    return createState({
      id: this._id,
      transitions: this._transitions,
      meta: this._meta
    });
  }
}

// =============================================================================
// FLOW BUILDER
// =============================================================================

/**
 * Fluent builder for creating flows.
 */
export class FlowBuilder {
  private _id: FlowId;
  private _initial?: StateId;
  private _states: State[] = [];
  private _meta?: EntityMeta;

  constructor(id: FlowId | string) {
    this._id = typeof id === 'string' ? createFlowId(id) : id;
  }

  /**
   * Adds a state using a builder.
   */
  state(id: StateId | string, configureFn: (builder: StateBuilder) => void): this {
    const builder = new StateBuilder(id);
    configureFn(builder);
    const result = builder.build();
    
    if (result.success) {
      this._states.push(result.value);
      
      // Set as initial state if it's the first one
      if (!this._initial) {
        this._initial = result.value.id;
      }
    } else {
      throw new Error(`Failed to build state: ${result.error.message}`);
    }
    
    return this;
  }

  /**
   * Sets the initial state.
   */
  initialState(stateId: StateId | string): this {
    this._initial = typeof stateId === 'string' ? createStateId(stateId) : stateId;
    return this;
  }

  /**
   * Sets the flow name.
   */
  name(name: string): this {
    this._meta = { ...this._meta, name };
    return this;
  }

  /**
   * Sets the flow description.
   */
  description(description: string): this {
    this._meta = { ...this._meta, description };
    return this;
  }

  /**
   * Sets the flow version.
   */
  version(version: string): this {
    this._meta = { ...this._meta, version };
    return this;
  }

  /**
   * Adds tags to this flow.
   */
  tags(...tags: string[]): this {
    this._meta = { ...this._meta, tags };
    return this;
  }

  /**
   * Sets custom metadata.
   */
  custom(custom: Record<string, any>): this {
    this._meta = { ...this._meta, custom };
    return this;
  }

  /**
   * Builds the flow.
   */
  build(): Result<Flow, CsmError> {
    if (!this._initial) {
      return err({
        type: 'construction',
        message: 'Flow must have an initial state'
      });
    }

    return createFlow({
      id: this._id,
      initial: this._initial,
      states: this._states,
      meta: this._meta
    });
  }
}

// =============================================================================
// MACHINE BUILDER
// =============================================================================

/**
 * Fluent builder for creating machines.
 */
export class MachineBuilder {
  private _id: MachineId;
  private _initialFlow?: FlowId;
  private _flows: Flow[] = [];
  private _meta?: EntityMeta;

  constructor(id: MachineId | string) {
    this._id = typeof id === 'string' ? createMachineId(id) : id;
  }

  /**
   * Adds a flow using a builder.
   */
  flow(id: FlowId | string, configureFn: (builder: FlowBuilder) => void): this {
    const builder = new FlowBuilder(id);
    configureFn(builder);
    const result = builder.build();
    
    if (result.success) {
      this._flows.push(result.value);
      
      // Set as initial flow if it's the first one
      if (!this._initialFlow) {
        this._initialFlow = result.value.id;
      }
    } else {
      throw new Error(`Failed to build flow: ${result.error.message}`);
    }
    
    return this;
  }

  /**
   * Sets the initial flow.
   */
  initialFlow(flowId: FlowId | string): this {
    this._initialFlow = typeof flowId === 'string' ? createFlowId(flowId) : flowId;
    return this;
  }

  /**
   * Sets the machine name.
   */
  name(name: string): this {
    this._meta = { ...this._meta, name };
    return this;
  }

  /**
   * Sets the machine description.
   */
  description(description: string): this {
    this._meta = { ...this._meta, description };
    return this;
  }

  /**
   * Sets the machine version.
   */
  version(version: string): this {
    this._meta = { ...this._meta, version };
    return this;
  }

  /**
   * Adds tags to this machine.
   */
  tags(...tags: string[]): this {
    this._meta = { ...this._meta, tags };
    return this;
  }

  /**
   * Sets custom metadata.
   */
  custom(custom: Record<string, any>): this {
    this._meta = { ...this._meta, custom };
    return this;
  }

  /**
   * Builds the machine.
   */
  build(): Result<Machine, CsmError> {
    if (!this._initialFlow) {
      return err({
        type: 'construction',
        message: 'Machine must have an initial flow'
      });
    }

    return createMachine({
      id: this._id,
      initialFlow: this._initialFlow,
      flows: this._flows,
      meta: this._meta
    });
  }
}

// =============================================================================
// AGENT BUILDER
// =============================================================================

/**
 * Fluent builder for creating agents.
 */
export class AgentBuilder {
  private _id: AgentId;
  private _machine?: Machine;
  private _meta?: EntityMeta;

  constructor(id: AgentId | string) {
    this._id = typeof id === 'string' ? createAgentId(id) : id;
  }

  /**
   * Sets the machine using a builder.
   */
  machine(id: MachineId | string, configureFn: (builder: MachineBuilder) => void): this {
    const builder = new MachineBuilder(id);
    configureFn(builder);
    const result = builder.build();
    
    if (result.success) {
      this._machine = result.value;
    } else {
      throw new Error(`Failed to build machine: ${result.error.message}`);
    }
    
    return this;
  }

  /**
   * Sets an existing machine.
   */
  withMachine(machine: Machine): this {
    this._machine = machine;
    return this;
  }

  /**
   * Sets the agent name.
   */
  name(name: string): this {
    this._meta = { ...this._meta, name };
    return this;
  }

  /**
   * Sets the agent description.
   */
  description(description: string): this {
    this._meta = { ...this._meta, description };
    return this;
  }

  /**
   * Sets the agent version.
   */
  version(version: string): this {
    this._meta = { ...this._meta, version };
    return this;
  }

  /**
   * Adds tags to this agent.
   */
  tags(...tags: string[]): this {
    this._meta = { ...this._meta, tags };
    return this;
  }

  /**
   * Sets custom metadata.
   */
  custom(custom: Record<string, any>): this {
    this._meta = { ...this._meta, custom };
    return this;
  }

  /**
   * Builds the agent.
   */
  build(): Result<Agent, CsmError> {
    if (!this._machine) {
      return err({
        type: 'construction',
        message: 'Agent must have a machine'
      });
    }

    return createAgent({
      id: this._id,
      machine: this._machine,
      meta: this._meta
    });
  }
}

// =============================================================================
// TOP-LEVEL BUILDER FUNCTIONS
// =============================================================================

/**
 * Creates a new transition builder.
 */
export function transition(): TransitionBuilder {
  return new TransitionBuilder();
}

/**
 * Creates a new state builder.
 */
export function state(id: StateId | string): StateBuilder {
  return new StateBuilder(id);
}

/**
 * Creates a new flow builder.
 */
export function flow(id: FlowId | string): FlowBuilder {
  return new FlowBuilder(id);
}

/**
 * Creates a new machine builder.
 */
export function machine(id: MachineId | string): MachineBuilder {
  return new MachineBuilder(id);
}

/**
 * Creates a new agent builder.
 */
export function agent(id: AgentId | string): AgentBuilder {
  return new AgentBuilder(id);
}

// =============================================================================
// SPECIALIZED BUILDERS
// =============================================================================

/**
 * Creates a simple linear flow with chained states.
 * Each state transitions to the next one in sequence.
 */
export function linearFlow(
  id: FlowId | string,
  stateConfigs: Array<{
    id: StateId | string;
    pattern: string;
    messageId?: string;
  }>,
  terminalReason: 'success' | 'error' | 'cancel' = 'success'
): FlowBuilder {
  const builder = new FlowBuilder(id);
  
  stateConfigs.forEach((config, index) => {
    const isLast = index === stateConfigs.length - 1;
    
    builder.state(config.id, stateBuilder => {
      if (config.messageId) {
        stateBuilder.message(config.messageId);
      }
      
      const transitionBuilder = stateBuilder.onInput(config.pattern);
      
      if (isLast) {
        transitionBuilder.toTerminal(terminalReason).build();
      } else {
        const nextConfig = stateConfigs[index + 1];
        transitionBuilder.toState(nextConfig.id).build();
      }
    });
  });
  
  return builder;
}

/**
 * Creates a simple agent with a single-flow machine.
 * This is the most common pattern for basic conversational agents.
 */
export function simpleAgent(
  agentId: AgentId | string,
  machineId: MachineId | string,
  flowId: FlowId | string,
  configureFn: (builder: FlowBuilder) => void
): AgentBuilder {
  return new AgentBuilder(agentId).machine(machineId, machineBuilder => {
    machineBuilder.flow(flowId, configureFn);
  });
}