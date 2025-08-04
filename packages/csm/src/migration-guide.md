# CSM Type System Migration Guide

## Overview

This guide helps migrate from the duplicated type system to the new unified type system in `unified-types.ts`.

## Type Mapping

### Core Types

| Old Type(s) | New Type | Changes |
|------------|----------|---------|
| `Flow` (hierarchy), `FlowDefinition` (machine-def), `LegacyFlowDefinition` (types) | `Flow` | Single unified type with `ReadonlyMap` for states |
| `State` (hierarchy), `StateDefinition` (machine-def), `LegacyStateDefinition` (types) | `State` | Single type with required `id` field |
| `Transition` (hierarchy), `TransitionDefinition` (machine-def), `LegacyTransition` (types) | `Transition` | Unified with optional `id` and consistent `operations` field |
| `EntityMeta`, `StateMeta`, various meta objects | `Metadata` | Single extensible metadata type |
| `Context` (duplicated in multiple files) | `Context` | Single definition |

### ID Types

| Old | New | Changes |
|-----|-----|---------|
| `EntityId<T>` | `BrandedId<T>` | Clearer naming |
| Various string IDs | Specific branded types | Type safety enforced |

### Runtime Types

| Old | New | Changes |
|-----|-----|---------|
| `AgentExecutionState` | `ExecutionState` | Simplified with `position` object |
| `ProcessResult` (multiple versions) | `ProcessResult` | Unified with `ExecutionState` |
| `StateChangeEvent` (multiple versions) | `StateChangeEvent` | Cleaner structure with current/previous |

### Operations & Targets

| Old | New | Changes |
|-----|-----|---------|
| `ContextOperation` types | Same | Moved to unified location |
| `TransitionTarget` types | Same + string support | Added string for backward compatibility |
| Inline operation objects | Typed operations | Proper discriminated unions |

## Migration Steps

### 1. Update Imports

```typescript
// Before - multiple imports from different files
import { Flow, State } from './hierarchy-types.js';
import { FlowDefinition, StateDefinition } from './machine-definition.js';
import { Context, Transition } from './types.js';

// After - single import
import { Flow, State, Context, Transition } from './unified-types.js';
```

### 2. Update Type References

```typescript
// Before
const flow: FlowDefinition = {
  id: 'main',
  initial: 'start',
  states: { /* Record */ }
};

// After
const flow: Flow = {
  id: 'main' as FlowId,
  initial: 'start' as StateId,
  states: new Map([ /* Map entries */ ])
};
```

### 3. Update Metadata

```typescript
// Before - different meta types
const stateMeta: StateMeta = {
  messageId: 'welcome',
  transient: false,
  custom: { /* ... */ }
};

// After - unified Metadata
const metadata: Metadata = {
  messageId: 'welcome',
  transient: false,
  custom: { /* ... */ }
};
```

### 4. Update Context Operations

```typescript
// Before - inline objects
const transition = {
  target: 'next',
  context: { someVar: 'value' }
};

// After - typed operations
const transition: Transition = {
  target: { type: 'state', stateId: 'next' as StateId },
  operations: [
    { type: 'set', variable: 'someVar', value: 'value' }
  ]
};
```

### 5. Update Execution State

```typescript
// Before
const state: AgentExecutionState = {
  agent: agentObj,
  currentMachine: 'main',
  currentFlow: 'flow1',
  currentState: 'state1',
  context: {},
  executionStack: []
};

// After
const state: ExecutionState = {
  agent: agentObj,
  position: {
    machineId: 'main' as MachineId,
    flowId: 'flow1' as FlowId,
    stateId: 'state1' as StateId
  },
  context: {},
  stack: [],
  timestamp: Date.now()
};
```

## Benefits of Migration

1. **Single Source of Truth**: Each concept has exactly one type definition
2. **Better Type Safety**: Branded IDs prevent mixing different ID types
3. **Cleaner API**: Consistent naming without redundant suffixes
4. **Easier Maintenance**: All types in one file
5. **Better Documentation**: Clear type hierarchy and relationships
6. **Backward Compatibility**: String support where needed for gradual migration

## Gradual Migration Strategy

1. **Phase 1**: Add unified-types.ts without removing old types
2. **Phase 2**: Update internal implementations to use new types
3. **Phase 3**: Deprecate old types with warnings
4. **Phase 4**: Update public API to use new types
5. **Phase 5**: Remove old type definitions

## Type Guards Update

Update type guards to work with new types:

```typescript
// Update guards to check for new type structure
export function isFlow(value: unknown): value is Flow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'initial' in value &&
    'states' in value &&
    value.states instanceof Map
  );
}
```

## Breaking Changes

1. **States use Map instead of Record**: Better for runtime operations
2. **Required IDs**: All entities now have required ID fields
3. **Unified Metadata**: Single metadata type instead of multiple
4. **Typed Operations**: Context updates use explicit operation types
5. **Position Object**: Execution state uses nested position object

## Compatibility Layer

For gradual migration, create adapters:

```typescript
// Convert old format to new
export function fromLegacyFlow(legacy: LegacyFlowDefinition): Flow {
  return {
    id: legacy.id as FlowId,
    initial: legacy.initial as StateId,
    states: new Map(
      Object.entries(legacy.states).map(([id, state]) => [
        id as StateId,
        { id: id as StateId, ...state }
      ])
    ),
    meta: legacy.meta
  };
}

// Convert new format to old (for backward compatibility)
export function toLegacyFlow(flow: Flow): LegacyFlowDefinition {
  return {
    id: flow.id,
    initial: flow.initial,
    states: Object.fromEntries(
      Array.from(flow.states.entries()).map(([id, state]) => {
        const { id: _, ...stateWithoutId } = state;
        return [id, stateWithoutId];
      })
    ),
    meta: flow.meta
  };
}
```