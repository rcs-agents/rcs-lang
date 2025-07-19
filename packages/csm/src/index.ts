/**
 * @module @rcs-lang/csm
 *
 * Conversation State Machine - A lightweight state machine library for RCS conversational agents.
 *
 * @example
 * ```typescript
 * import { ConversationalAgent, FlowDefinition } from '@rcs-lang/csm';
 *
 * // Define your flow
 * const flow: FlowDefinition = {
 *   id: 'MainFlow',
 *   initial: 'Welcome',
 *   states: {
 *     Welcome: {
 *       transitions: [
 *         { pattern: 'Start', target: 'FirstStep' }
 *       ]
 *     }
 *   }
 * };
 *
 * // Create agent
 * const agent = new ConversationalAgent({
 *   id: 'MyBot',
 *   onStateChange: async (event) => {
 *     console.log(`State changed to: ${event.state}`);
 *   }
 * });
 *
 * // Add flow and process input
 * agent.addFlow(flow);
 * await agent.processInput('Start');
 * ```
 *
 * @packageDocumentation
 */

// Core classes
export { ConversationalAgent } from './conversational-agent';
export { FlowMachine, type TransitionResult } from './flow-machine';

// Machine definition format
export {
  validateMachineDefinition,
  type MachineDefinitionJSON,
  type StateDefinitionJSON,
  type TransitionJSON,
  type AgentDefinitionJSON,
} from './machine-definition';

// Types
export type {
  // Core types
  Context,
  FlowDefinition,
  StateDefinition,
  Transition,
  ProcessResult,
  // Event types
  StateChangeEvent,
  StateChangeTrigger,
  ErrorContext,
  // Configuration types
  AgentOptions,
  SerializationOptions,
  // Metadata types
  StateMeta,
  // Internal types
  SerializedAgentState,
  MachineState,
} from './types';

// Version for compatibility checking
export const VERSION = '0.1.0';

// Path to JSON schema (for tooling)
export const MACHINE_DEFINITION_SCHEMA_PATH = '../schema/machine-definition.schema.json';
