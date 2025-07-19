# CSM API Reference

## Overview

The `@rcs-lang/csm` package provides a lightweight conversation state machine for RCS agents. This is the core runtime that executes RCL-compiled conversation flows.

## Core Classes

### ConversationalAgent

Main class for running conversation flows.

```typescript
class ConversationalAgent {
  constructor(options: AgentOptions)
  
  // Flow management
  addFlow(flow: FlowDefinition): void
  removeFlow(flowId: string): void
  getFlow(flowId: string): FlowDefinition | null
  
  // State management
  getCurrentState(): AgentState
  setState(state: Partial<AgentState>): void
  
  // Message processing
  processInput(input: UserInput): Promise<AgentResponse>
  
  // Event handling
  onStateChange(handler: StateChangeHandler): void
  onError(handler: ErrorHandler): void
  
  // Serialization
  serialize(): string
  static deserialize(data: string): ConversationalAgent
}
```

### FlowMachine

Executes individual conversation flows.

```typescript
class FlowMachine {
  constructor(flow: FlowDefinition, context?: Context)
  
  // State transitions
  transition(event: Event): Promise<TransitionResult>
  getCurrentState(): string
  
  // Context management
  getContext(): Context
  updateContext(updates: Partial<Context>): void
  
  // Flow control
  start(): Promise<void>
  stop(): void
  reset(): void
}
```

## Key Interfaces

### FlowDefinition

```typescript
interface FlowDefinition {
  id: string
  name: string
  start: string
  states: Record<string, StateDefinition>
  context?: Context
}
```

### StateDefinition

```typescript
interface StateDefinition {
  id: string
  type?: StateType
  transitions: Transition[]
  actions?: Action[]
  metadata?: StateMetadata
}
```

### Transition

```typescript
interface Transition {
  event: string
  target: string
  condition?: string
  context?: Record<string, any>
}
```

## Usage Examples

### Basic Agent Setup

```typescript
import { ConversationalAgent } from '@rcs-lang/csm';

const agent = new ConversationalAgent({
  id: 'coffee-bot',
  name: 'Coffee Shop Assistant'
});

// Add flow from RCL compilation
agent.addFlow(compiledFlow);

// Process user input
const response = await agent.processInput({
  type: 'text',
  text: 'I want coffee'
});
```

### Event Handling

```typescript
agent.onStateChange(async (event) => {
  console.log(`State changed: ${event.from} -> ${event.to}`);
  
  // Send message to user
  if (event.message) {
    await sendMessage(event.message);
  }
});

agent.onError((error) => {
  console.error('Agent error:', error);
});
```

See the main README for more detailed examples.