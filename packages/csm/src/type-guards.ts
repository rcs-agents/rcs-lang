/**
 * @module type-guards
 * Type guards for the new CSM hierarchy.
 * Provides runtime type checking with full type safety.
 */

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
  LegacyCondition,
  CodeCondition,
  JsonLogicCondition,
  ContextOperation,
  SetOperation,
  AppendOperation,
  MergeOperation,
  FlowInvocation,
  AgentExecutionState,
  ProcessResult,
  ValidationError,
  ConstructionError,
  CsmError,
  SerializableAgent,
  SerializableExecutionState,
  EntityMeta,
  StateMeta,
  Context
} from './unified-types.js';

// =============================================================================
// BASIC TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is a non-null object.
 */
function isObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object';
}

/**
 * Type guard to check if a value is a non-empty string.
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard to check if a value is a Map.
 */
function isMap(value: unknown): value is Map<any, any> {
  return value instanceof Map;
}

/**
 * Type guard to check if a value is a ReadonlyMap.
 */
function isReadonlyMap(value: unknown): value is ReadonlyMap<any, any> {
  return value instanceof Map;
}

// =============================================================================
// CONTEXT AND META TYPE GUARDS
// =============================================================================

/**
 * Type guard for Context objects.
 */
export function isContext(value: unknown): value is Context {
  return isObject(value);
}

/**
 * Type guard for EntityMeta objects.
 */
export function isEntityMeta(value: unknown): value is EntityMeta {
  if (!isObject(value)) return false;
  
  const meta = value as any;
  
  // All fields are optional, so we just need to check types if they exist
  if (meta.name !== undefined && typeof meta.name !== 'string') return false;
  if (meta.description !== undefined && typeof meta.description !== 'string') return false;
  if (meta.version !== undefined && typeof meta.version !== 'string') return false;
  if (meta.tags !== undefined && !Array.isArray(meta.tags)) return false;
  if (meta.custom !== undefined && !isObject(meta.custom)) return false;
  
  return true;
}

/**
 * Type guard for StateMeta objects.
 */
export function isStateMeta(value: unknown): value is StateMeta {
  if (!isEntityMeta(value)) return false;
  
  const meta = value as any;
  
  if (meta.messageId !== undefined && typeof meta.messageId !== 'string') return false;
  if (meta.transient !== undefined && typeof meta.transient !== 'boolean') return false;
  
  return true;
}

// =============================================================================
// TRANSITION TARGET TYPE GUARDS
// =============================================================================

/**
 * Type guard for StateTarget objects.
 */
export function isStateTarget(value: unknown): value is StateTarget {
  return isObject(value) && 
         value.type === 'state' && 
         isNonEmptyString(value.stateId);
}

/**
 * Type guard for FlowTarget objects.
 */
export function isFlowTarget(value: unknown): value is FlowTarget {
  return isObject(value) && 
         value.type === 'flow' && 
         isNonEmptyString(value.flowId);
}

/**
 * Type guard for TerminalTarget objects.
 */
export function isTerminalTarget(value: unknown): value is TerminalTarget {
  if (!isObject(value) || value.type !== 'terminal') return false;
  
  const terminal = value as any;
  
  if (terminal.reason !== undefined) {
    const validReasons = ['success', 'error', 'cancel', 'timeout'];
    if (!validReasons.includes(terminal.reason)) return false;
  }
  
  if (terminal.message !== undefined && typeof terminal.message !== 'string') return false;
  
  return true;
}

/**
 * Type guard for TransitionTarget union type.
 */
export function isTransitionTarget(value: unknown): value is TransitionTarget {
  return isStateTarget(value) || isFlowTarget(value) || isTerminalTarget(value);
}

// =============================================================================
// CONDITION TYPE GUARDS
// =============================================================================

/**
 * Type guard for LegacyCondition objects.
 */
export function isLegacyCondition(value: unknown): value is LegacyCondition {
  return isObject(value) && 
         value.type === 'legacy' && 
         typeof value.expression === 'string';
}

/**
 * Type guard for CodeCondition objects.
 */
export function isCodeCondition(value: unknown): value is CodeCondition {
  return isObject(value) && 
         value.type === 'code' && 
         typeof value.expression === 'string';
}

/**
 * Type guard for JsonLogicCondition objects.
 */
export function isJsonLogicCondition(value: unknown): value is JsonLogicCondition {
  return isObject(value) && 
         value.type === 'jsonlogic' && 
         isObject(value.rule);
}

/**
 * Type guard for Condition union type.
 */
export function isCondition(value: unknown): value is Condition {
  return isLegacyCondition(value) || isCodeCondition(value) || isJsonLogicCondition(value);
}

// =============================================================================
// CONTEXT OPERATION TYPE GUARDS
// =============================================================================

/**
 * Type guard for SetOperation objects.
 */
export function isSetOperation(value: unknown): value is SetOperation {
  return isObject(value) && 
         value.type === 'set' && 
         typeof value.variable === 'string' &&
         value.value !== undefined;
}

/**
 * Type guard for AppendOperation objects.
 */
export function isAppendOperation(value: unknown): value is AppendOperation {
  return isObject(value) && 
         value.type === 'append' && 
         typeof value.target === 'string' &&
         value.value !== undefined;
}

/**
 * Type guard for MergeOperation objects.
 */
export function isMergeOperation(value: unknown): value is MergeOperation {
  return isObject(value) && 
         value.type === 'merge' && 
         typeof value.target === 'string' &&
         isObject(value.value);
}

/**
 * Type guard for ContextOperation union type.
 */
export function isContextOperation(value: unknown): value is ContextOperation {
  return isSetOperation(value) || isAppendOperation(value) || isMergeOperation(value);
}

// =============================================================================
// FLOW INVOCATION TYPE GUARDS
// =============================================================================

/**
 * Type guard for FlowInvocation objects.
 */
export function isFlowInvocation(value: unknown): value is FlowInvocation {
  if (!isObject(value)) return false;
  
  const invocation = value as any;
  
  if (!isNonEmptyString(invocation.flowId)) return false;
  if (invocation.parameters !== undefined && !isObject(invocation.parameters)) return false;
  if (!isObject(invocation.onResult)) return false;
  
  // Check that onResult has at least one handler
  const handlers = invocation.onResult;
  const hasValidHandler = (handler: any) => 
    isObject(handler) && 
    isTransitionTarget(handler.target) &&
    (handler.operations === undefined || Array.isArray(handler.operations));
  
  return (handlers.end && hasValidHandler(handlers.end)) ||
         (handlers.cancel && hasValidHandler(handlers.cancel)) ||
         (handlers.error && hasValidHandler(handlers.error));
}

// =============================================================================
// CORE ENTITY TYPE GUARDS
// =============================================================================

/**
 * Type guard for Transition objects.
 */
export function isTransition(value: unknown): value is Transition {
  if (!isObject(value)) return false;
  
  const transition = value as any;
  
  // Must have either target or flowInvocation
  const hasTarget = isTransitionTarget(transition.target);
  const hasFlowInvocation = isFlowInvocation(transition.flowInvocation);
  
  if (!hasTarget && !hasFlowInvocation) return false;
  
  // Check optional fields
  if (transition.id !== undefined && typeof transition.id !== 'string') return false;
  if (transition.pattern !== undefined && typeof transition.pattern !== 'string') return false;
  if (transition.contextOperations !== undefined && !Array.isArray(transition.contextOperations)) return false;
  if (transition.condition !== undefined && !isCondition(transition.condition)) return false;
  if (transition.priority !== undefined && typeof transition.priority !== 'number') return false;
  
  return true;
}

/**
 * Type guard for State objects.
 */
export function isState(value: unknown): value is State {
  if (!isObject(value)) return false;
  
  const state = value as any;
  
  if (!isNonEmptyString(state.id)) return false;
  if (!Array.isArray(state.transitions)) return false;
  if (!state.transitions.every(isTransition)) return false;
  if (state.meta !== undefined && !isStateMeta(state.meta)) return false;
  
  return true;
}

/**
 * Type guard for Flow objects.
 */
export function isFlow(value: unknown): value is Flow {
  if (!isObject(value)) return false;
  
  const flow = value as any;
  
  if (!isNonEmptyString(flow.id)) return false;
  if (!isNonEmptyString(flow.initial)) return false;
  if (!isReadonlyMap(flow.states)) return false;
  if (flow.meta !== undefined && !isEntityMeta(flow.meta)) return false;
  
  // Validate that all states in the map are valid State objects
  for (const [stateId, state] of flow.states) {
    if (!isNonEmptyString(stateId)) return false;
    if (!isState(state)) return false;
    if (state.id !== stateId) return false; // State ID must match map key
  }
  
  // Validate that initial state exists
  if (!flow.states.has(flow.initial)) return false;
  
  return true;
}

/**
 * Type guard for Machine objects.
 */
export function isMachine(value: unknown): value is Machine {
  if (!isObject(value)) return false;
  
  const machine = value as any;
  
  if (!isNonEmptyString(machine.id)) return false;
  if (!isNonEmptyString(machine.initialFlow)) return false;
  if (!isReadonlyMap(machine.flows)) return false;
  if (machine.meta !== undefined && !isEntityMeta(machine.meta)) return false;
  
  // Validate that all flows in the map are valid Flow objects
  for (const [flowId, flow] of machine.flows) {
    if (!isNonEmptyString(flowId)) return false;
    if (!isFlow(flow)) return false;
    if (flow.id !== flowId) return false; // Flow ID must match map key
  }
  
  // Validate that initial flow exists
  if (!machine.flows.has(machine.initialFlow)) return false;
  
  return true;
}

/**
 * Type guard for Agent objects.
 */
export function isAgent(value: unknown): value is Agent {
  if (!isObject(value)) return false;
  
  const agent = value as any;
  
  if (!isNonEmptyString(agent.id)) return false;
  if (!isMachine(agent.machine)) return false;
  if (agent.meta !== undefined && !isEntityMeta(agent.meta)) return false;
  
  return true;
}

// =============================================================================
// RUNTIME STATE TYPE GUARDS
// =============================================================================

/**
 * Type guard for AgentExecutionState objects.
 */
export function isAgentExecutionState(value: unknown): value is AgentExecutionState {
  if (!isObject(value)) return false;
  
  const state = value as any;
  
  if (!isAgent(state.agent)) return false;
  if (!isNonEmptyString(state.currentMachine)) return false;
  if (!isNonEmptyString(state.currentFlow)) return false;
  if (!isNonEmptyString(state.currentState)) return false;
  if (!isContext(state.context)) return false;
  
  // Validate execution stack if present
  if (state.executionStack !== undefined) {
    if (!Array.isArray(state.executionStack)) return false;
    
    for (const frame of state.executionStack) {
      if (!isObject(frame)) return false;
      if (!isNonEmptyString(frame.flow)) return false;
      if (!isNonEmptyString(frame.state)) return false;
      // returnHandler is optional and complex to validate here
    }
  }
  
  return true;
}

/**
 * Type guard for ProcessResult objects.
 */
export function isProcessResult(value: unknown): value is ProcessResult {
  if (!isObject(value)) return false;
  
  const result = value as any;
  
  if (!isAgentExecutionState(result.executionState)) return false;
  if (typeof result.transitioned !== 'boolean') return false;
  if (result.transition !== undefined && !isTransition(result.transition)) return false;
  
  const validTriggers = ['input', 'transient', 'flow', 'restore', 'init'];
  if (!validTriggers.includes(result.trigger)) return false;
  
  if (typeof result.timestamp !== 'number') return false;
  
  return true;
}

// =============================================================================
// ERROR TYPE GUARDS
// =============================================================================

/**
 * Type guard for ValidationError objects.
 */
export function isValidationError(value: unknown): value is ValidationError {
  if (!isObject(value)) return false;
  
  const error = value as any;
  
  if (error.type !== 'validation') return false;
  
  const validEntityTypes = ['agent', 'machine', 'flow', 'state', 'transition'];
  if (!validEntityTypes.includes(error.entityType)) return false;
  
  if (typeof error.entityId !== 'string') return false;
  if (typeof error.message !== 'string') return false;
  if (error.path !== undefined && !Array.isArray(error.path)) return false;
  
  return true;
}

/**
 * Type guard for ConstructionError objects.
 */
export function isConstructionError(value: unknown): value is ConstructionError {
  if (!isObject(value)) return false;
  
  const error = value as any;
  
  if (error.type !== 'construction') return false;
  if (typeof error.message !== 'string') return false;
  if (error.cause !== undefined && !(error.cause instanceof Error)) return false;
  
  return true;
}

/**
 * Type guard for CsmError union type.
 */
export function isCsmError(value: unknown): value is CsmError {
  return isValidationError(value) || isConstructionError(value);
}

// =============================================================================
// SERIALIZATION TYPE GUARDS
// =============================================================================

/**
 * Type guard for SerializableAgent objects.
 * Note: This provides basic validation - full validation would require recursive checking.
 */
export function isSerializableAgent(value: unknown): value is SerializableAgent {
  if (!isObject(value)) return false;
  
  const agent = value as any;
  
  if (typeof agent.id !== 'string') return false;
  if (!isObject(agent.machine)) return false;
  if (typeof agent.machine.id !== 'string') return false;
  if (typeof agent.machine.initialFlow !== 'string') return false;
  if (!Array.isArray(agent.machine.flows)) return false;
  
  return true;
}

/**
 * Type guard for SerializableExecutionState objects.
 */
export function isSerializableExecutionState(value: unknown): value is SerializableExecutionState {
  if (!isObject(value)) return false;
  
  const state = value as any;
  
  if (typeof state.agent !== 'string') return false;
  if (typeof state.currentMachine !== 'string') return false;
  if (typeof state.currentFlow !== 'string') return false;
  if (typeof state.currentState !== 'string') return false;
  if (!isContext(state.context)) return false;
  if (typeof state.version !== 'number') return false;
  
  if (state.executionStack !== undefined && !Array.isArray(state.executionStack)) return false;
  
  return true;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Safely casts a value to the specified type if the type guard passes.
 * Returns undefined if the type guard fails.
 */
export function safeCast<T>(value: unknown, guard: (v: unknown) => v is T): T | undefined {
  return guard(value) ? value : undefined;
}

/**
 * Validates an array of values against a type guard.
 * Returns true only if all values pass the guard.
 */
export function validateArray<T>(values: unknown[], guard: (v: unknown) => v is T): values is T[] {
  return values.every(guard);
}

/**
 * Type predicate that checks if a value is one of several types.
 * Useful for union type validation.
 */
export function isOneOf<T extends readonly unknown[]>(
  value: unknown,
  ...guards: { [K in keyof T]: (v: unknown) => v is T[K] }
): value is T[number] {
  return guards.some(guard => guard(value));
}