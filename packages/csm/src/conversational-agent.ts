/**
 * @module conversational-agent
 * Main orchestrator for managing multiple conversation flows.
 */

import { FlowMachine, type TransitionResult } from './flow-machine';
import type { MachineDefinitionJSON } from './machine-definition';
import type {
  AgentOptions,
  Context,
  ErrorContext,
  FlowDefinition,
  ProcessResult,
  SerializedAgentState,
  StateChangeEvent,
  StateChangeTrigger,
  Transition,
} from './types';

/**
 * Main class for managing conversational state across multiple flows.
 * Coordinates flow machines and handles state persistence.
 */
export class ConversationalAgent {
  private options: AgentOptions;
  private machines = new Map<string, FlowMachine>();
  private activeMachineId = '';
  private context: Context;
  private initialized = false;

  /**
   * Creates a new conversational agent.
   *
   * @param options - Configuration options for the agent
   */
  constructor(options: AgentOptions) {
    this.options = options;
    this.context = options.initialContext || {};
  }

  /**
   * Gets the agent ID.
   */
  get id(): string {
    return this.options.id;
  }

  /**
   * Adds a flow to this agent.
   *
   * @param flow - Flow definition to add (supports both legacy and JSON formats)
   * @throws Error if flow with same ID already exists
   */
  addFlow(flow: FlowDefinition | MachineDefinitionJSON): void {
    if (this.machines.has(flow.id)) {
      throw new Error(`Flow with ID '${flow.id}' already exists`);
    }

    const machine = new FlowMachine(flow);
    this.machines.set(flow.id, machine);

    // Set as active machine if it's the first one
    if (!this.activeMachineId && !this.initialized) {
      this.activeMachineId = flow.id;
      this.initialized = true;

      // Emit initial state event
      this.emitStateChange('init');
    }
  }

  /**
   * Removes a flow from this agent.
   *
   * @param flowId - ID of the flow to remove
   * @throws Error if trying to remove the active flow
   */
  removeFlow(flowId: string): void {
    if (flowId === this.activeMachineId) {
      throw new Error('Cannot remove the currently active flow');
    }

    this.machines.delete(flowId);
  }

  /**
   * Processes user input and returns the result.
   *
   * @param input - User input to process
   * @returns Result of processing including new state
   */
  async processInput(input: string): Promise<ProcessResult> {
    try {
      const machine = this.getActiveMachine();
      const previousState = machine.state;
      const previousMachine = this.activeMachineId;

      // Attempt transition
      const result = machine.transition(input, this.context);

      // Handle the transition result
      switch (result.type) {
        case 'state':
          // Normal state transition within same machine
          await this.handleStateTransition(result, input, previousState);
          break;

        case 'machine':
          // Transition to different machine
          await this.handleMachineTransition(result, input, previousState, previousMachine);
          break;

        case 'none':
          // No transition occurred
          break;
      }

      // Check for transient state after transition
      await this.processTransientStates();

      return {
        state: this.getCurrentState().state,
        machine: this.activeMachineId,
        transitioned: result.type !== 'none',
        transition: result.transition,
        context: { ...this.context },
      };
    } catch (error) {
      this.handleError(error as Error, 'processInput', input);
      throw error;
    }
  }

  /**
   * Gets the current state information.
   */
  getCurrentState(): { machine: string; state: string } {
    const machine = this.getActiveMachine();
    return {
      machine: this.activeMachineId,
      state: machine.state,
    };
  }

  /**
   * Gets a copy of the current context.
   */
  getContext(): Context {
    return { ...this.context };
  }

  /**
   * Updates the context with new values.
   *
   * @param updates - Partial context to merge
   */
  updateContext(updates: Partial<Context>): void {
    this.context = { ...this.context, ...updates };
  }

  /**
   * Serializes the agent state to a URL-safe hash.
   *
   * @returns Base64URL encoded state string
   */
  toURLHash(): string {
    try {
      const state: SerializedAgentState = {
        a: this.options.id,
        m: this.activeMachineId,
        s: this.getActiveMachine().state,
        c: this.context,
        v: 1, // Version for future compatibility
      };

      const json = JSON.stringify(state);

      // Optional compression would go here
      if (this.options.serialization?.compress) {
        // TODO: Implement compression
      }

      // Optional encryption would go here
      if (this.options.serialization?.encryption) {
        // TODO: Implement encryption
      }

      // Convert to base64url
      const base64 = Buffer.from(json).toString('base64');
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (error) {
      this.handleError(error as Error, 'serialize');
      throw error;
    }
  }

  /**
   * Creates an agent instance from a URL hash.
   *
   * @param hash - Base64URL encoded state string
   * @param options - Agent options (must include same flows)
   * @returns Restored agent instance
   */
  static fromURLHash(hash: string, options: AgentOptions): ConversationalAgent {
    try {
      // Convert from base64url
      const base64 = hash
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(hash.length + ((4 - (hash.length % 4)) % 4), '=');

      const json = Buffer.from(base64, 'base64').toString();
      const state: SerializedAgentState = JSON.parse(json);

      // Validate the structure
      if (!state.a || !state.m || !state.s || typeof state.c !== 'object') {
        throw new Error('Invalid state structure');
      }

      // Create agent with restored context
      const agent = new ConversationalAgent({
        ...options,
        id: state.a,
        initialContext: state.c,
      });

      // Restore machine states
      agent.activeMachineId = state.m;
      agent.initialized = true;

      // The flows need to be added by the caller after creation
      // This allows them to provide the same flow definitions

      // Emit restore event after flows are added
      setTimeout(() => {
        if (agent.machines.size > 0) {
          agent.emitStateChange('restore');
        }
      }, 0);

      return agent;
    } catch (error) {
      throw new Error(`Failed to deserialize agent state: ${error}`);
    }
  }

  /**
   * Sets the current state directly (for restoration).
   * Should be called after adding flows when restoring from hash.
   *
   * @param machineId - Machine to activate
   * @param stateId - State within that machine
   */
  setState(machineId: string, stateId: string): void {
    const machine = this.machines.get(machineId);
    if (!machine) {
      throw new Error(`Machine '${machineId}' not found`);
    }

    this.activeMachineId = machineId;
    machine.setState(stateId);
  }

  /**
   * Gets the currently active machine.
   */
  private getActiveMachine(): FlowMachine {
    const machine = this.machines.get(this.activeMachineId);
    if (!machine) {
      throw new Error(`Active machine '${this.activeMachineId}' not found`);
    }
    return machine;
  }

  /**
   * Handles a state transition within the same machine.
   */
  private async handleStateTransition(
    result: TransitionResult,
    input: string,
    previousState: string,
  ): Promise<void> {
    // Update context if transition has context updates
    if (result.contextUpdates) {
      this.updateContext(result.contextUpdates);
    }

    // Emit state change event
    await this.emitStateChange('input', input, previousState, undefined, result.transition);
  }

  /**
   * Handles a transition to a different machine.
   */
  private async handleMachineTransition(
    result: TransitionResult,
    input: string,
    previousState: string,
    previousMachine: string,
  ): Promise<void> {
    if (!result.machineId) return;

    const newMachine = this.machines.get(result.machineId);
    if (!newMachine) {
      throw new Error(`Target machine '${result.machineId}' not found`);
    }

    // Update context if transition has context updates
    if (result.contextUpdates) {
      this.updateContext(result.contextUpdates);
    }

    // Switch to new machine
    this.activeMachineId = result.machineId;

    // Emit state change event
    await this.emitStateChange('machine', input, previousState, previousMachine, result.transition);
  }

  /**
   * Processes any transient states automatically.
   */
  private async processTransientStates(): Promise<void> {
    let machine = this.getActiveMachine();

    while (machine.isTransient) {
      const transition = machine.getTransientTransition();
      if (!transition) break;

      const previousState = machine.state;
      const previousMachine = this.activeMachineId;

      // Apply the transient transition
      const result = machine.transition('', this.context);

      if (result.type === 'state') {
        // Update context if transition has context updates
        if (result.contextUpdates) {
          this.updateContext(result.contextUpdates);
        }
        // Emit transient state change
        await this.emitStateChange('transient', '', previousState, undefined, result.transition);
      } else if (result.type === 'machine') {
        // Update context and switch machine
        if (result.contextUpdates) {
          this.updateContext(result.contextUpdates);
        }
        this.activeMachineId = result.machineId!;
        await this.emitStateChange(
          'transient',
          '',
          previousState,
          previousMachine,
          result.transition,
        );
        machine = this.getActiveMachine(); // Update machine reference
      } else {
        break;
      }
    }
  }

  /**
   * Emits a state change event.
   */
  private async emitStateChange(
    trigger: StateChangeTrigger,
    input?: string,
    previousState?: string,
    previousMachine?: string,
    transition?: Transition,
  ): Promise<void> {
    const machine = this.getActiveMachine();
    const event: StateChangeEvent = {
      agent: this.options.id,
      machine: this.activeMachineId,
      state: machine.state,
      previousState,
      previousMachine,
      trigger,
      input,
      context: { ...this.context },
      timestamp: Date.now(),
      transition,
    };

    try {
      await this.options.onStateChange(event);
    } catch (error) {
      console.error('Error in state change handler:', error);
      this.handleError(error as Error, 'stateEntry');
    }
  }

  /**
   * Handles errors with optional error handler.
   */
  private handleError(error: Error, operation: ErrorContext['operation'], input?: string): void {
    if (this.options.onError) {
      const context: ErrorContext = {
        agent: this.options.id,
        machine: this.activeMachineId,
        state: this.machines.get(this.activeMachineId)?.state || 'unknown',
        operation,
        input,
        context: { ...this.context },
      };

      this.options.onError(error, context);
    }
  }
}
