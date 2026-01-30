# Architecture

This document describes the internal architecture of the RCS Simulator package.

## Overview

The simulator follows a layered architecture with clean separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│  Simulator (React component)                        │
│  - Thin UI coordinator                              │
│  - Renders: SimulatorControls + Device              │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  useSimulator(props) → SimulatorApi                 │
│  - Creates SimulatorService                         │
│  - Uses useSyncExternalStore for React binding      │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  SimulatorService (framework-agnostic)              │
│  - Observable: subscribe(fn) → unsubscribe          │
│  - Owns: thread, displaySettings, engine            │
│  - Zero framework dependencies                      │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  SimulatorEngine (CSM execution)                    │
│  - Manages CSM agent lifecycle                      │
│  - Processes user input through CSM                 │
│  - Generates agent responses                        │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  Device (purely presentational)                     │
│  - Props in → renders UI                            │
│  - Emits: onSendMessage callback                    │
└─────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Framework-Agnostic Core

The `SimulatorService` and `SimulatorEngine` classes have zero React dependencies. This enables:
- Future ports to Solid, Lit, or other frameworks
- Use in non-React environments (Node.js, testing)
- Clean separation between state management and rendering

### 2. Observable Pattern

`SimulatorService` implements a simple observable pattern compatible with React's `useSyncExternalStore`:

```typescript
class SimulatorService {
  private listeners = new Set<() => void>();

  subscribe(onStoreChange: () => void): () => void {
    this.listeners.add(onStoreChange);
    return () => this.listeners.delete(onStoreChange);
  }

  getSnapshot(): SimulatorServiceState {
    return this.state;
  }
}
```

This pattern was chosen over alternatives like:
- **EventEmitter**: Removed to reduce dependencies and simplify the API
- **RxJS/Observables**: Would add significant bundle size
- **Redux/Zustand**: Overkill for this use case

### 3. Callback-Based Engine

`SimulatorEngine` uses callbacks instead of events:

```typescript
const engine = new SimulatorEngine(config, {
  onThreadChange: (thread) => { /* ... */ },
  onStateChange: (state) => { /* ... */ },
  onError: (error) => { /* ... */ },
});
```

Benefits:
- Type-safe callbacks (no string event names)
- No need for cleanup/removeListener logic
- Simpler mental model

### 4. Mode Detection

The `Simulator` component automatically determines its mode:

```typescript
const mode: SimulatorMode = options.csm ? 'interactive' : 'static';
```

| Props | Mode | Behavior |
|-------|------|----------|
| `csm` only | Interactive | Engine processes, thread auto-updates |
| `thread` only | Static | Display only, `onUserInteraction` fires |
| Both | Interactive | `thread` as initial, CSM takes over |

### 5. Immutable State Updates

State updates always create new object references:

```typescript
private updateState(partial: Partial<SimulatorServiceState>): void {
  this.state = { ...this.state, ...partial };
  this.notifyListeners();
}
```

This ensures React's `useSyncExternalStore` properly detects changes.

## File Structure

```
src/
├── core/
│   ├── types.ts              # Shared type definitions
│   ├── simulator-engine.ts   # CSM execution engine
│   └── simulator-service.ts  # Framework-agnostic state manager
│
├── react/
│   ├── index.ts              # Public exports
│   ├── use-simulator.ts      # React hook
│   └── components/
│       ├── simulator.tsx         # Main component
│       ├── simulator-controls.tsx # Control buttons
│       └── device/               # Device frame components
│           ├── device.tsx
│           ├── header.tsx
│           ├── chat.tsx
│           └── bottom-bar.tsx
│
└── lit/                      # Lit Web Components (separate build)
    └── ...
```

## State Flow

### Interactive Mode

```
User types message
        │
        ▼
Device.onSendMessage(payload)
        │
        ▼
Simulator.handleSendMessage(payload)
        │
        ▼
api.sendMessage({ text, postbackData })
        │
        ▼
SimulatorService.sendMessage()
        │
        ▼
SimulatorEngine.sendMessage()
        │
        ├──► CSM processes input
        │
        ▼
Engine.onThreadChange(newThread)
        │
        ▼
SimulatorService.updateState({ thread })
        │
        ▼
React re-renders via useSyncExternalStore
```

### Static Mode

```
User types message
        │
        ▼
Device.onSendMessage(payload)
        │
        ▼
Simulator.handleSendMessage(payload)
        │
        ▼
api.sendMessage({ text, postbackData })
        │
        ▼
onUserInteraction callback fires
        │
        ▼
(Consumer handles the input externally)
```

## Bundle Considerations

The package is split into multiple entry points:

- `@rcs-lang/simulator` - Core types and engine only
- `@rcs-lang/simulator/react` - React components and hooks
- `@rcs-lang/simulator/lit` - Lit Web Components
- `@rcs-lang/simulator/solid` - SolidJS components (planned)

This allows consumers to only import what they need.
