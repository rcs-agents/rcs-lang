/**
 * @module machine-definition
 * Standard machine definition format for CSM.
 * This is the interchange format between compilers and the runtime.
 */

/**
 * Single-flow machine definition in JSON-serializable format.
 */
export interface SingleFlowMachineDefinitionJSON {
  /** Unique identifier for this flow/machine */
  id: string;

  /** ID of the initial state when entering this flow */
  initial: string;

  /** Map of state IDs to their definitions */
  states: Record<string, StateDefinitionJSON>;

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
 * Multi-flow machine definition in JSON-serializable format.
 */
export interface MultiFlowMachineDefinitionJSON {
  /** Unique identifier for this machine */
  id: string;

  /** ID of the initial flow when starting this machine */
  initialFlow: string;

  /** Map of flow IDs to their definitions */
  flows: Record<string, SingleFlowMachineDefinitionJSON>;

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
 * Machine definition in JSON-serializable format.
 * Supports both single-flow and multi-flow machines.
 */
export type MachineDefinitionJSON = SingleFlowMachineDefinitionJSON | MultiFlowMachineDefinitionJSON;

/**
 * Type guard to check if a machine definition is multi-flow.
 */
export function isMultiFlowMachine(machine: MachineDefinitionJSON): machine is MultiFlowMachineDefinitionJSON {
  return 'flows' in machine;
}

/**
 * Type guard to check if a machine definition is single-flow.
 */
export function isSingleFlowMachine(machine: MachineDefinitionJSON): machine is SingleFlowMachineDefinitionJSON {
  return 'states' in machine;
}

/**
 * State definition in JSON format.
 */
export interface StateDefinitionJSON {
  /** List of possible transitions from this state */
  transitions: TransitionJSON[];

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
 * Transition definition in JSON format.
 */
export interface TransitionJSON {
  /** Pattern to match against user input. If undefined, transition is automatic */
  pattern?: string;

  /** Target state ID or reference using type:ID format */
  target: string;

  /** Context updates to apply when taking this transition */
  context?: Record<string, any>;

  /** Optional JavaScript condition expression */
  condition?: string;

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
 * Collection of machines for an agent.
 */
export interface AgentDefinitionJSON {
  /** Agent identifier */
  id: string;

  /** ID of the initial machine to start with */
  initial: string;

  /** Map of machine IDs to their definitions */
  machines: Record<string, MachineDefinitionJSON>;

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

/**
 * Validates a machine definition against the schema.
 * @param definition - The definition to validate
 * @returns True if valid
 * @throws Error with validation details if invalid
 */
export function validateMachineDefinition(
  definition: unknown,
): definition is MachineDefinitionJSON {
  // Basic runtime validation (full JSON schema validation could be added)
  if (!definition || typeof definition !== 'object') {
    throw new Error('Machine definition must be an object');
  }

  const def = definition as any;

  if (!def.id || typeof def.id !== 'string') {
    throw new Error('Machine definition must have an id string');
  }

  // Check if this is a multi-flow or single-flow machine
  if (def.flows) {
    // Multi-flow machine validation
    if (!def.initialFlow || typeof def.initialFlow !== 'string') {
      throw new Error('Multi-flow machine definition must have an initialFlow string');
    }

    if (typeof def.flows !== 'object') {
      throw new Error('Multi-flow machine definition must have flows object');
    }

    // Validate each flow
    for (const [flowId, flow] of Object.entries(def.flows)) {
      validateSingleFlow(flowId, flow);
    }

    // Check that initialFlow exists
    if (!def.flows[def.initialFlow]) {
      throw new Error(`Initial flow '${def.initialFlow}' not found in flows`);
    }
  } else {
    // Single-flow machine validation
    if (!def.initial || typeof def.initial !== 'string') {
      throw new Error('Single-flow machine definition must have an initial state');
    }

    if (!def.states || typeof def.states !== 'object') {
      throw new Error('Single-flow machine definition must have states object');
    }

    validateSingleFlow(def.id, def);
  }

  return true;
}

/**
 * Validates a single flow definition.
 */
function validateSingleFlow(flowId: string, flow: any): void {
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
