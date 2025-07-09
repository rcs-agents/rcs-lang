/**
 * @module machine-definition
 * Standard machine definition format for CSM.
 * This is the interchange format between compilers and the runtime.
 */

/**
 * Machine definition in JSON-serializable format.
 * This matches the JSON schema exactly.
 */
export interface MachineDefinitionJSON {
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

  /** Target state ID or 'machine:FlowId' for cross-flow transitions */
  target: string;

  /** Context updates to apply when taking this transition */
  context?: Record<string, any>;

  /** Optional JavaScript condition expression */
  condition?: string;

  /** Priority for pattern matching. Higher numbers are checked first */
  priority?: number;
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

  if (!def.initial || typeof def.initial !== 'string') {
    throw new Error('Machine definition must have an initial state');
  }

  if (!def.states || typeof def.states !== 'object') {
    throw new Error('Machine definition must have states object');
  }

  // Validate each state
  for (const [stateId, state] of Object.entries(def.states)) {
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

      if (!transition.target || typeof transition.target !== 'string') {
        throw new Error(`Transition ${i} in state '${stateId}' must have a target string`);
      }
    }
  }

  // Check that initial state exists
  if (!def.states[def.initial]) {
    throw new Error(`Initial state '${def.initial}' not found in states`);
  }

  return true;
}
