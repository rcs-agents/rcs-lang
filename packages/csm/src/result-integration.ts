/**
 * @module result-integration
 * Integration utilities for working with the Result<T,E> pattern from core package.
 * Provides seamless error handling throughout the CSM hierarchy.
 */

import type { Result } from '@rcs-lang/core';
import { ok, err, map, andThen, isOk, isErr } from '@rcs-lang/core';
import type {
  Agent,
  Machine,
  Flow,
  State,
  Transition,
  AgentExecutionState,
  ProcessResult,
  CsmError,
  ValidationError,
  ExecutionError,
  ConstructionError,
  Context
} from './unified-types.js';

// =============================================================================
// RESULT CREATION UTILITIES
// =============================================================================

/**
 * Creates a successful Result for CSM operations.
 */
export function csmOk<T>(value: T): Result<T, never> {
  return ok(value);
}

/**
 * Creates a failed Result with a validation error.
 */
export function validationError(
  entityType: 'agent' | 'machine' | 'flow' | 'state' | 'transition',
  entityId: string,
  message: string,
  path?: readonly string[]
): Result<never, ValidationError> {
  return err({
    type: 'validation',
    entityType,
    entityId,
    message,
    path
  } as ValidationError);
}

/**
 * Creates a failed Result with a construction error.
 */
export function constructionError(
  message: string,
  cause?: Error
): Result<never, ConstructionError> {
  return err({
    type: 'construction',
    message,
    cause
  } as ConstructionError);
}

// =============================================================================
// RESULT COMBINATORS FOR CSM
// =============================================================================

/**
 * Combines multiple Result objects into a single Result containing an array.
 * If any Result is an error, returns the first error encountered.
 */
export function combineResults<T, E>(results: readonly Result<T, E>[]): Result<readonly T[], E> {
  const values: T[] = [];
  
  for (const result of results) {
    if (isErr(result)) {
      return result;
    }
    values.push(result.value);
  }
  
  return ok(values);
}

/**
 * Combines multiple Results where each can have different success types.
 * Returns a tuple of all successful values or the first error.
 */
export function combineHeterogeneous<T1, T2, E>(
  r1: Result<T1, E>,
  r2: Result<T2, E>
): Result<[T1, T2], E>;
export function combineHeterogeneous<T1, T2, T3, E>(
  r1: Result<T1, E>,
  r2: Result<T2, E>,
  r3: Result<T3, E>
): Result<[T1, T2, T3], E>;
export function combineHeterogeneous<T1, T2, T3, T4, E>(
  r1: Result<T1, E>,
  r2: Result<T2, E>,
  r3: Result<T3, E>,
  r4: Result<T4, E>
): Result<[T1, T2, T3, T4], E>;
export function combineHeterogeneous<E>(...results: Result<any, E>[]): Result<any[], E> {
  const values: any[] = [];
  
  for (const result of results) {
    if (isErr(result)) {
      return result;
    }
    values.push(result.value);
  }
  
  return ok(values);
}

/**
 * Maps a function over a Result, preserving the error type.
 * Useful for transforming successful values while maintaining CSM error context.
 */
export function mapCsm<T, U>(
  result: Result<T, CsmError>,
  fn: (value: T) => U
): Result<U, CsmError> {
  return map(result, fn);
}

/**
 * Chains CSM operations together, short-circuiting on the first error.
 */
export function andThenCsm<T, U>(
  result: Result<T, CsmError>,
  fn: (value: T) => Result<U, CsmError>
): Result<U, CsmError> {
  return andThen(result, fn);
}

// =============================================================================
// VALIDATION RESULT PATTERNS
// =============================================================================

/**
 * Validates a value and returns a Result based on a predicate.
 */
export function validateWith<T>(
  value: T,
  predicate: (value: T) => boolean,
  errorMessage: string,
  entityType: 'agent' | 'machine' | 'flow' | 'state' | 'transition',
  entityId: string
): Result<T, ValidationError> {
  if (predicate(value)) {
    return ok(value);
  }
  
  return validationError(entityType, entityId, errorMessage);
}

/**
 * Validates that a value is not null or undefined.
 */
export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string,
  entityType: 'agent' | 'machine' | 'flow' | 'state' | 'transition',
  entityId: string
): Result<T, ValidationError> {
  if (value != null) {
    return ok(value);
  }
  
  return validationError(entityType, entityId, `${fieldName} is required`);
}

/**
 * Validates that a string is not empty.
 */
export function validateNonEmptyString(
  value: string | null | undefined,
  fieldName: string,
  entityType: 'agent' | 'machine' | 'flow' | 'state' | 'transition',
  entityId: string
): Result<string, ValidationError> {
  if (typeof value === 'string' && value.length > 0) {
    return ok(value);
  }
  
  return validationError(entityType, entityId, `${fieldName} must be a non-empty string`);
}

/**
 * Validates that an array is not empty.
 */
export function validateNonEmptyArray<T>(
  value: readonly T[] | null | undefined,
  fieldName: string,
  entityType: 'agent' | 'machine' | 'flow' | 'state' | 'transition',
  entityId: string
): Result<readonly T[], ValidationError> {
  if (Array.isArray(value) && value.length > 0) {
    return ok(value);
  }
  
  return validationError(entityType, entityId, `${fieldName} must be a non-empty array`);
}

// =============================================================================
// EXECUTION RESULT HELPERS
// =============================================================================

/**
 * Creates a successful process result.
 */
export function createProcessResult(
  executionState: AgentExecutionState,
  transitioned: boolean,
  transition?: Transition,
  trigger: any = 'input'
): Result<ProcessResult, never> {
  // Map ExecutionState to the legacy ProcessResult format
  const currentStateId = executionState.position.stateId;
  const currentMachineId = executionState.position.flowId;

  return ok({
    state: currentStateId,
    machine: currentMachineId,
    transitioned,
    transition,
    context: executionState.context
  });
}

/**
 * Creates an error result for execution failures.
 */
export function executionError(
  message: string,
  cause?: Error
): Result<never, ConstructionError> {
  return err({
    type: 'construction',
    message: `Execution failed: ${message}`,
    cause
  } as ConstructionError);
}

// =============================================================================
// ERROR HANDLING UTILITIES
// =============================================================================

/**
 * Converts a thrown error into a ConstructionError Result.
 */
export function tryCatch<T>(fn: () => T): Result<T, ConstructionError> {
  try {
    return ok(fn());
  } catch (error) {
    return constructionError(
      `Operation failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Converts an async operation into a Result.
 */
export async function tryAsync<T>(fn: () => Promise<T>): Promise<Result<T, ConstructionError>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (error) {
    return constructionError(
      `Async operation failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Unwraps a Result or throws the error with additional context.
 */
export function unwrapOrThrow<T>(result: Result<T, CsmError>, context?: string): T {
  if (isOk(result)) {
    return result.value;
  }
  
  const contextPrefix = context ? `${context}: ` : '';
  const error = result.error;
  
  if (error.type === 'validation') {
    throw new Error(`${contextPrefix}Validation error in ${error.entityType} '${error.entityId}': ${error.message}`);
  } else {
    throw new Error(`${contextPrefix}Construction error: ${error.message}`);
  }
}

/**
 * Logs CSM errors with appropriate detail level.
 */
export function logCsmError(error: CsmError, context?: string): void {
  const contextPrefix = context ? `[${context}] ` : '';
  
  if (error.type === 'validation') {
    console.error(`${contextPrefix}Validation Error: ${error.entityType} '${error.entityId}' - ${error.message}${error.path ? ` (path: ${error.path.join('.')})` : ''}`);
  } else {
    console.error(`${contextPrefix}Construction Error: ${error.message}${error.cause ? ` (cause: ${error.cause.message})` : ''}`);
  }
}

// =============================================================================
// RESULT PATTERN MATCHING
// =============================================================================

/**
 * Pattern matching for Result types with type-safe handlers.
 */
export function matchResult<T, E, R>(
  result: Result<T, E>,
  handlers: {
    ok: (value: T) => R;
    err: (error: E) => R;
  }
): R {
  if (isOk(result)) {
    return handlers.ok(result.value);
  } else {
    return handlers.err(result.error);
  }
}

/**
 * Pattern matching specifically for CSM errors.
 */
export function matchCsmError<R>(
  error: CsmError,
  handlers: {
    validation: (error: ValidationError) => R;
    execution: (error: ExecutionError) => R;
    construction: (error: ConstructionError) => R;
  }
): R {
  if (error.type === 'validation') {
    return handlers.validation(error);
  } else if (error.type === 'execution') {
    return handlers.execution(error);
  } else {
    return handlers.construction(error);
  }
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

/**
 * Processes an array of items with a function that returns Results.
 * Collects all successful results and all errors separately.
 */
export function processBatch<T, U, E>(
  items: readonly T[],
  processor: (item: T) => Result<U, E>
): {
  successes: readonly U[];
  errors: readonly E[];
} {
  const successes: U[] = [];
  const errors: E[] = [];
  
  for (const item of items) {
    const result = processor(item);
    if (isOk(result)) {
      successes.push(result.value);
    } else {
      errors.push(result.error);
    }
  }
  
  return { successes, errors };
}

/**
 * Processes items until the first error or until all are successful.
 * Returns early on first error (fail-fast behavior).
 */
export function processUntilError<T, U, E>(
  items: readonly T[],
  processor: (item: T) => Result<U, E>
): Result<readonly U[], E> {
  const results: U[] = [];
  
  for (const item of items) {
    const result = processor(item);
    if (isErr(result)) {
      return result;
    }
    results.push(result.value);
  }
  
  return ok(results);
}