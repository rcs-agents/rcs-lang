# RCS Simulator

A React component library for simulating RCS (Rich Communication Services) conversations. The simulator supports both interactive mode (with a CSM agent) and static mode (displaying pre-recorded threads).

## Installation

```bash
bun add @rcs-lang/simulator
```

## Quick Start

### Static Mode - Display Messages

Use static mode to display a pre-recorded conversation thread:

```tsx
import { Simulator } from '@rcs-lang/simulator/react';
import type { Thread } from '@rcs-lang/simulator/react';

const messages: Thread = [
  {
    agentMessage: {
      messageId: '1',
      sendTime: '2024-01-15T10:00:00Z',
      contentMessage: {
        text: 'Welcome! How can I help you today?',
        suggestions: [
          { reply: { text: 'Get started', postbackData: 'start' } },
          { reply: { text: 'Learn more', postbackData: 'learn' } },
        ],
      },
    },
  },
  {
    userMessage: {
      messageId: '2',
      sendTime: '2024-01-15T10:00:30Z',
      senderPhoneNumber: '+1234567890',
      agentId: 'demo-agent',
      text: 'Get started',
    },
  },
];

function App() {
  return (
    <Simulator
      thread={messages}
      agentName="Demo Agent"
      agentIconUrl="/agent-icon.png"
    />
  );
}
```

### Interactive Mode - Live CSM Agent

Use interactive mode with a compiled CSM agent for live conversations:

```tsx
import { Simulator } from '@rcs-lang/simulator/react';
import type { Agent } from '@rcs-lang/csm';

function App({ compiledAgent }: { compiledAgent: Agent }) {
  return (
    <Simulator
      csm={compiledAgent}
      agentName="Coffee Bot"
      onUserInteraction={(input) => {
        console.log('User sent:', input.text);
        if (input.postbackData) {
          console.log('Postback:', input.postbackData);
        }
      }}
    />
  );
}
```

## Documentation

- [API Reference](./api-reference.md) - Complete API documentation
- [Architecture](./architecture.md) - Internal architecture and design decisions
- [Examples](./examples.md) - More usage examples

## Exports

The package provides the following exports from `@rcs-lang/simulator/react`:

### Components
- `Simulator` - Main simulator component
- `SimulatorControls` - Standalone control buttons (orientation, theme, platform)

### Hooks
- `useSimulator` - React hook for managing simulator state

### Types
- `SimulatorProps` - Props for the Simulator component
- `Thread`, `ThreadEntry` - Message thread types
- `UserInput` - User input structure
- `DisplaySettings` - Device display settings
- `AgentInfo` - Agent branding information

### Classes (Advanced)
- `SimulatorService` - Framework-agnostic state management
- `SimulatorEngine` - CSM execution engine
