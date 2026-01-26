/**
 * @module flow-machine
 * Individual flow state machine implementation.
 */

import type { MachineDefinitionJSON } from './machine-definition';
import type {
  Context,
  FlowDefinition,
  MachineState,
  ProcessResult,
  StateDefinition,
  Transition,
} from './types';

/**
 * Result of a transition attempt within a flow.
 */
export interface TransitionResult {
  type: 'state' | 'machine' | 'none';
  stateId?: string;
  machineId?: string;
  transition?: Transition;
  contextUpdates?: Record<string, any>;
}

/**
 * A lightweight state machine for a single conversation flow.
 * Each flow in an RCL document becomes one FlowMachine instance.
 */
export class FlowMachine {
  private definition: MachineDefinitionJSON;
  private currentState: string;
  private compiledPatterns: Map<string, RegExp> = new Map();

  /**
   * Creates a new flow machine instance.
   *
   * @param definition - The flow definition (typically from compiled RCL)
   * @param initialState - Optional initial state (defaults to flow's initial)
   */
  constructor(definition: FlowDefinition | MachineDefinitionJSON, initialState?: string) {
    // Support both old and new formats
    this.definition = definition as MachineDefinitionJSON;
    this.currentState = initialState || definition.initial;

    // Pre-compile regex patterns for performance
    this.compilePatterns();
  }

  /**
   * Gets the ID of this flow.
   */
  get id(): string {
    return this.definition.id;
  }

  /**
   * Gets the current state ID.
   */
  get state(): string {
    return this.currentState;
  }

  /**
   * Gets the current state definition.
   */
  get stateDefinition(): StateDefinition | undefined {
    return this.definition.states[this.currentState];
  }

  /**
   * Checks if the current state is transient (auto-transitions).
   */
  get isTransient(): boolean {
    const stateDef = this.stateDefinition;
    if (!stateDef) return false;

    // A state is transient if it has exactly one transition with no pattern
    return stateDef.transitions.length === 1 && !stateDef.transitions[0].pattern;
  }

  /**
   * Attempts to transition based on user input.
   *
   * @param input - User input to match against patterns
   * @param context - Current conversation context
   * @returns Result of the transition attempt
   */
  transition(input: string, context: Context): TransitionResult {
    const stateDef = this.stateDefinition;
    if (!stateDef) {
      return { type: 'none' };
    }

    // Sort transitions by priority
    const sortedTransitions = [...stateDef.transitions].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0),
    );

    // Try each transition
    for (const transition of sortedTransitions) {
      if (this.matchesTransition(transition, input, context)) {
        return this.createTransitionResult(transition, context);
      }
    }

    // Check for default transition
    const defaultTransition = stateDef.transitions.find(
      (t) => t.pattern === ':default' || !t.pattern,
    );

    if (defaultTransition) {
      return this.createTransitionResult(defaultTransition, context);
    }

    return { type: 'none' };
  }

  /**
   * Gets the transient transition if the current state is transient.
   *
   * @returns The transient transition or undefined
   */
  getTransientTransition(): Transition | undefined {
    if (!this.isTransient) return undefined;
    return this.stateDefinition?.transitions[0];
  }

  /**
   * Updates the current state.
   *
   * @param stateId - New state ID
   * @throws Error if state doesn't exist
   */
  setState(stateId: string): void {
    if (!this.definition.states[stateId]) {
      throw new Error(`State '${stateId}' does not exist in flow '${this.id}'`);
    }
    this.currentState = stateId;
  }

  /**
   * Gets the current machine state for serialization.
   */
  getMachineState(): MachineState {
    return {
      currentState: this.currentState,
      localContext: {}, // Local context not implemented yet
    };
  }

  /**
   * Restores machine state from serialization.
   */
  setMachineState(state: MachineState): void {
    this.currentState = state.currentState;
  }

  /**
   * Pre-compiles regex patterns for performance.
   */
  private compilePatterns(): void {
    for (const [stateId, stateDef] of Object.entries(this.definition.states)) {
      for (const transition of stateDef.transitions) {
        if (
          transition.pattern &&
          !transition.pattern.startsWith(':') &&
          transition.pattern.includes('*')
        ) {
          // Convert simple wildcards to regex
          const regexPattern = transition.pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
            .replace(/\*/g, '.*'); // Convert * to .*

          const key = `${stateId}:${transition.pattern}`;
          this.compiledPatterns.set(key, new RegExp(`^${regexPattern}$`, 'i'));
        }
      }
    }
  }

  /**
   * Checks if input matches a transition.
   */
  private matchesTransition(transition: Transition, input: string, context: Context): boolean {
    // No pattern = transient state (always matches)
    if (!transition.pattern) {
      return true;
    }

    // Special patterns
    if (transition.pattern === ':default') {
      return true;
    }

    // Check condition if present
    if (transition.condition && !this.evaluateCondition(transition.condition, context)) {
      return false;
    }

    // Resolve string interpolation in pattern (#{variable} -> ${variable})
    let resolvedPattern = transition.pattern;
    if (resolvedPattern.includes('#{')) {
      resolvedPattern = this.interpolatePattern(resolvedPattern, context);
    }

    // Exact match (case insensitive)
    if (resolvedPattern.toLowerCase() === input.toLowerCase()) {
      return true;
    }

    // Regex match if pattern was compiled
    const key = `${this.currentState}:${transition.pattern}`;
    const regex = this.compiledPatterns.get(key);
    if (regex) {
      return regex.test(input);
    }

    return false;
  }

  /**
   * Interpolates variables in pattern strings.
   * Converts #{variable} to ${variable} and evaluates as template literal.
   */
  private interpolatePattern(pattern: string, context: Context): string {
    try {
      // Convert #{variable} to ${context.variable} syntax
      const templateString = pattern.replace(/#{([^}]+)}/g, '${context.$1}');
      
      // Create a function that has access to context and evaluates the template
      const fn = new Function('context', `return \`${templateString}\``);
      return fn(context);
    } catch (error) {
      console.error(`Error interpolating pattern: ${pattern}`, error);
      return pattern; // Return original pattern if interpolation fails
    }
  }

  /**
   * Evaluates a JavaScript condition expression.
   *
   * @param condition - JS expression as string
   * @param context - Context object available to the expression
   * @returns Result of evaluation
   */
  private evaluateCondition(condition: string, context: Context): boolean {
    try {
      // Create a function that has access to context
      const fn = new Function('context', `return ${condition}`);
      return !!fn(context);
    } catch (error) {
      console.error(`Error evaluating condition: ${condition}`, error);
      return false;
    }
  }

  /**
   * Creates a transition result from a transition definition.
   */
  private createTransitionResult(transition: Transition, context?: Context): TransitionResult {
    let target = transition.target;

    // Resolve context variables in target (e.g., @next -> context.next)
    if (target.startsWith('@')) {
      const varName = target.substring(1);
      const resolvedTarget = context?.[varName];
      if (typeof resolvedTarget === 'string') {
        target = resolvedTarget;
      } else {
        throw new Error(`Context variable '${varName}' not found or not a string: ${resolvedTarget}`);
      }
    }

    // Check if this is a machine transition
    if (target.startsWith('machine:')) {
      const machineId = target.substring(8);
      return {
        type: 'machine',
        machineId,
        transition,
        contextUpdates: transition.context,
      };
    }

    // Regular state transition
    this.currentState = target;
    return {
      type: 'state',
      stateId: target,
      transition,
      contextUpdates: transition.context,
    };
  }
}
