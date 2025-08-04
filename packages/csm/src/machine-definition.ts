/**
 * @module machine-definition
 * Validation functions for machine definitions.
 * All type definitions have been moved to unified-types.ts
 */

import type {
  MachineDefinition,
  AgentDefinition,
  FlowDefinition,
  StateDefinition,
  TransitionDefinition,
} from './unified-types.js';

/**
 * Type alias for backward compatibility.
 * Can represent either the new machine format (with flows) or legacy single-flow format.
 */
export type MachineDefinitionJSON = MachineDefinition | LegacySingleFlowMachine;

/**
 * Legacy single-flow machine format for backward compatibility.
 */
export interface LegacySingleFlowMachine {
  id: string;
  initial: string;
  states: Record<string, StateDefinition>;
  meta?: {
    name?: string;
    description?: string;
    version?: string;
    tags?: string[];
    custom?: Record<string, any>;
  };
}


/**
 * Helper function to create a machine from a single flow.
 * This is a convenience function for simple use cases.
 * 
 * @param flow - The flow definition
 * @returns A machine containing the single flow
 */
export function createSingleFlowMachine(flow: FlowDefinition): MachineDefinition {
  return {
    id: flow.id,
    initialFlow: flow.id,
    flows: {
      [flow.id]: flow
    },
    meta: flow.meta
  };
}

/**
 * Validates a machine definition against the schema.
 * Supports both new format (with flows) and legacy single-flow format (for backward compatibility).
 * @param definition - The definition to validate
 * @returns True if valid
 * @throws Error with validation details if invalid
 */
export function validateMachineDefinition(
  definition: unknown,
): definition is MachineDefinition {
  // Basic runtime validation (full JSON schema validation could be added)
  if (!definition || typeof definition !== 'object') {
    throw new Error('Machine definition must be an object');
  }

  const def = definition as any;

  if (!def.id || typeof def.id !== 'string') {
    throw new Error('Machine definition must have an id string');
  }

  // Check if this is the new format (with flows) or legacy single-flow format
  const hasFlows = def.flows && typeof def.flows === 'object';
  const hasStates = def.states && typeof def.states === 'object';
  const hasInitial = def.initial && typeof def.initial === 'string';
  const hasInitialFlow = def.initialFlow && typeof def.initialFlow === 'string';

  if (hasFlows && hasInitialFlow && !hasStates && !hasInitial) {
    // New format validation: machines have flows
    if (Object.keys(def.flows).length === 0) {
      throw new Error('Machine definition must have at least one flow');
    }

    // Validate each flow
    for (const [flowId, flow] of Object.entries(def.flows)) {
      validateFlow(flowId, flow);
    }

    // Check that initialFlow exists
    if (!def.flows[def.initialFlow]) {
      throw new Error(`Initial flow '${def.initialFlow}' not found in flows`);
    }
  } else if ((hasStates || hasInitial) && !hasFlows) {
    // Legacy format validation: single flow with states directly on machine
    if (!hasInitial) {
      throw new Error('Single-flow machine definition must have an initial state');
    }

    if (!hasStates) {
      throw new Error('Single-flow machine definition must have states object');
    }

    // Validate as a single flow (use machine id as flow id)
    validateFlow(def.id, {
      id: def.id,
      initial: def.initial,
      states: def.states,
      meta: def.meta
    });
  } else {
    // Invalid format - unclear what format this is supposed to be
    if (!hasFlows && !hasStates && !hasInitial) {
      throw new Error('Machine definition must have either flows (new format) or initial/states (legacy format)');
    } else {
      // Mixed format - has some properties from both formats
      throw new Error('Machine definition cannot mix new format (flows) and legacy format (initial/states) properties');
    }
  }

  return true;
}

/**
 * Validates an agent definition.
 * @param definition - The definition to validate
 * @returns True if valid
 * @throws Error with validation details if invalid
 */
export function validateAgentDefinition(
  definition: unknown,
): definition is AgentDefinition {
  if (!definition || typeof definition !== 'object') {
    throw new Error('Agent definition must be an object');
  }

  const def = definition as any;

  if (!def.id || typeof def.id !== 'string') {
    throw new Error('Agent definition must have an id string');
  }

  if (!def.machine || typeof def.machine !== 'object') {
    throw new Error('Agent definition must have a machine object');
  }

  // Validate the machine
  validateMachineDefinition(def.machine);

  return true;
}

/**
 * Validates a flow definition.
 */
function validateFlow(flowId: string, flow: any): void {
  if (!flow.states || typeof flow.states !== 'object') {
    throw new Error(`Flow '${flowId}' must have states object`);
  }

  if (!flow.initial || typeof flow.initial !== 'string') {
    throw new Error(`Flow '${flowId}' must have an initial state`);
  }

  // Check that initial state exists
  if (!flow.states[flow.initial]) {
    throw new Error(`Initial state '${flow.initial}' not found in flow '${flowId}' states`);
  }

  // Validate each state
  for (const [stateId, state] of Object.entries(flow.states)) {
    if (!state || typeof state !== 'object') {
      throw new Error(`State '${stateId}' must be an object`);
    }

    const stateDef = state as any;
    if (!Array.isArray(stateDef.transitions)) {
      throw new Error(`State '${stateId}' must have transitions array`);
    }

    // Validate each transition
    for (let i = 0; i < stateDef.transitions.length; i++) {
      const transition = stateDef.transitions[i];
      if (!transition || typeof transition !== 'object') {
        throw new Error(`Transition ${i} in state '${stateId}' must be an object`);
      }

      // Check that transition has either target or flowInvocation
      if (!transition.target && !transition.flowInvocation) {
        throw new Error(`Transition ${i} in state '${stateId}' must have either a target string or flowInvocation`);
      }
      
      if (transition.target && typeof transition.target !== 'string') {
        throw new Error(`Transition ${i} in state '${stateId}' target must be a string`);
      }
    }
  }
}
