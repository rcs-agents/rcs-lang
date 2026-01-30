# API Reference

## Components

### `<Simulator />`

The main simulator component that displays an RCS conversation in a phone device frame.

```tsx
import { Simulator } from '@rcs-lang/simulator/react';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `csm` | `Agent` | - | CSM agent definition for interactive mode |
| `thread` | `Thread` | `[]` | Static thread data for display-only mode |
| `agentName` | `string` | `'Agent'` | Agent display name |
| `agentIconUrl` | `string` | `'/rbx-logo.svg'` | Agent icon URL |
| `isVisible` | `boolean` | `true` | Whether the simulator is visible |
| `showControls` | `boolean` | `true` | Whether to show control buttons |
| `initialDisplaySettings` | `Partial<DisplaySettings>` | - | Initial display settings |
| `onUserInteraction` | `(input: UserInput) => void` | - | Callback when user sends a message |

#### Mode Detection

The simulator automatically determines its mode based on props:

| Props Provided | Mode | Behavior |
|----------------|------|----------|
| `csm` only | Interactive | CSM engine processes messages, thread auto-updates |
| `thread` only | Static | Display only, `onUserInteraction` fires on user input |
| Both `csm` and `thread` | Interactive | `thread` used as initial state, CSM takes over |

#### Example

```tsx
// Interactive mode
<Simulator
  csm={compiledCsmAgent}
  agentName="Coffee Bot"
  onUserInteraction={(input) => console.log(input)}
/>

// Static mode
<Simulator
  thread={conversationHistory}
  agentName="Demo Agent"
/>

// Custom initial display settings
<Simulator
  thread={messages}
  agentName="Demo"
  initialDisplaySettings={{
    isDarkMode: true,
    isPortrait: false,
    isAndroid: false,
  }}
/>
```

---

### `<SimulatorControls />`

Standalone control buttons for orientation, theme, and platform toggles. Use this when building custom layouts.

```tsx
import { SimulatorControls } from '@rcs-lang/simulator/react';
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `displaySettings` | `DisplaySettings` | Current display settings |
| `onToggleOrientation` | `() => void` | Called when orientation button is clicked |
| `onToggleTheme` | `() => void` | Called when theme button is clicked |
| `onTogglePlatform` | `() => void` | Called when platform button is clicked |

---

## Hooks

### `useSimulator(props)`

React hook for managing simulator state. Returns a `SimulatorApi` object with state and actions.

```tsx
import { useSimulator } from '@rcs-lang/simulator/react';
```

#### Props

```typescript
interface UseSimulatorProps {
  csm?: Agent;                              // CSM agent for interactive mode
  thread?: Thread;                          // Initial/static thread
  agentName?: string;                       // Agent display name
  agentIconUrl?: string;                    // Agent icon URL
  initialDisplaySettings?: Partial<DisplaySettings>;
  onUserInteraction?: (input: UserInput) => void;
}
```

#### Returns: `SimulatorApi`

```typescript
interface SimulatorApi {
  // State
  thread: Thread;
  displaySettings: DisplaySettings;
  agent: AgentInfo;
  mode: 'interactive' | 'static';
  isReady: boolean;
  error?: Error;

  // Actions
  sendMessage: (input: UserInput) => void;
  setDisplaySettings: (settings: Partial<DisplaySettings>) => void;
  toggleOrientation: () => void;
  toggleTheme: () => void;
  togglePlatform: () => void;
  setThread: (thread: Thread) => void;
  setAgentInfo: (agent: Partial<AgentInfo>) => void;
  loadAgent: (csm: Agent, options?: { agentName?: string }) => Promise<{ success: boolean; errors: string[] }>;

  // Service access
  service: SimulatorService;
}
```

#### Example

```tsx
function CustomSimulator({ csm }: { csm: Agent }) {
  const api = useSimulator({ csm, agentName: 'My Bot' });

  return (
    <div>
      <p>Mode: {api.mode}</p>
      <p>Ready: {api.isReady ? 'Yes' : 'No'}</p>
      <p>Messages: {api.thread.length}</p>

      <button onClick={api.toggleTheme}>
        {api.displaySettings.isDarkMode ? 'Light' : 'Dark'} Mode
      </button>

      <button onClick={() => api.sendMessage({ text: 'Hello!' })}>
        Send Hello
      </button>
    </div>
  );
}
```

---

## Types

### `Thread`

An array of thread entries representing a conversation.

```typescript
type Thread = ThreadEntry[];
```

### `ThreadEntry`

A single entry in a conversation thread. Can be an agent message, user message, or agent event.

```typescript
type ThreadEntry =
  | { agentMessage: AgentMessage; userMessage?: never }
  | { userMessage: UserMessage; agentMessage?: never }
  | { agentEvent: any; agentMessage?: never; userMessage?: never };
```

### `AgentMessage`

A message sent by the agent.

```typescript
interface AgentMessage {
  messageId: string;
  sendTime: string;
  contentMessage: AgentContentMessage;
  name?: string;
}
```

The `contentMessage` follows the RCS `AgentContentMessage` schema and can include:
- `text` - Plain text message
- `richCard` - Standalone or carousel rich cards
- `suggestions` - Reply and action suggestions

### `UserMessage`

A message sent by the user.

```typescript
interface UserMessage {
  senderPhoneNumber: string;
  messageId: string;
  sendTime: string;
  agentId: string;
  text?: string;
  suggestionResponse?: SuggestionResponse;
}
```

### `UserInput`

User input captured from the simulator.

```typescript
interface UserInput {
  text: string;
  postbackData?: string;
}
```

### `DisplaySettings`

Device display configuration.

```typescript
interface DisplaySettings {
  isPortrait: boolean;   // Portrait or landscape orientation
  isDarkMode: boolean;   // Dark or light theme
  isAndroid: boolean;    // Android or iOS device frame
}
```

### `AgentInfo`

Agent branding information.

```typescript
interface AgentInfo {
  brandName: string;
  iconUrl: string;
}
```

### `SimulatorMode`

The operating mode of the simulator.

```typescript
type SimulatorMode = 'interactive' | 'static';
```

---

## Classes (Advanced)

### `SimulatorService`

Framework-agnostic service for managing simulator state. Compatible with React's `useSyncExternalStore`.

```typescript
import { SimulatorService } from '@rcs-lang/simulator/react';

const service = new SimulatorService({
  thread: initialMessages,
  agentName: 'Demo',
});

// Subscribe to state changes
const unsubscribe = service.subscribe(() => {
  console.log('State changed:', service.getSnapshot());
});

// Perform actions
service.toggleTheme();
service.sendMessage({ text: 'Hello' });

// Cleanup
unsubscribe();
```

### `SimulatorEngine`

Core engine for CSM execution. Manages conversation state and transitions.

```typescript
import { SimulatorEngine } from '@rcs-lang/simulator/react';

const engine = new SimulatorEngine(
  { debugMode: true },
  {
    onThreadChange: (thread) => console.log('Thread updated:', thread),
    onError: (error) => console.error('Engine error:', error),
  }
);

await engine.loadAgent(csmAgent, { agentName: 'My Bot' });
await engine.sendMessage({ text: 'Hello' });
```
