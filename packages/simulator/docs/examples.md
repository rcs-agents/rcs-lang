# Examples

## Static Mode Examples

### Basic Text Conversation

Display a simple text-based conversation:

```tsx
import { Simulator } from '@rcs-lang/simulator/react';
import type { Thread } from '@rcs-lang/simulator/react';

const conversation: Thread = [
  {
    agentMessage: {
      messageId: '1',
      sendTime: new Date().toISOString(),
      contentMessage: {
        text: 'Hello! Welcome to our service.',
      },
    },
  },
  {
    userMessage: {
      messageId: '2',
      sendTime: new Date().toISOString(),
      senderPhoneNumber: '+1234567890',
      agentId: 'demo',
      text: 'Hi there!',
    },
  },
  {
    agentMessage: {
      messageId: '3',
      sendTime: new Date().toISOString(),
      contentMessage: {
        text: 'How can I help you today?',
      },
    },
  },
];

function TextConversation() {
  return (
    <Simulator
      thread={conversation}
      agentName="Support Bot"
    />
  );
}
```

### Conversation with Suggestions

Display messages with reply suggestions:

```tsx
const conversationWithSuggestions: Thread = [
  {
    agentMessage: {
      messageId: '1',
      sendTime: new Date().toISOString(),
      contentMessage: {
        text: 'What would you like to do?',
        suggestions: [
          { reply: { text: 'Check balance', postbackData: 'balance' } },
          { reply: { text: 'Make payment', postbackData: 'payment' } },
          { reply: { text: 'Get help', postbackData: 'help' } },
        ],
      },
    },
  },
];

function SuggestionsExample() {
  return (
    <Simulator
      thread={conversationWithSuggestions}
      agentName="Bank Bot"
      onUserInteraction={(input) => {
        console.log('User selected:', input.text);
        console.log('Postback data:', input.postbackData);
      }}
    />
  );
}
```

### Rich Card Message

Display a message with a rich card:

```tsx
const richCardThread: Thread = [
  {
    agentMessage: {
      messageId: '1',
      sendTime: new Date().toISOString(),
      contentMessage: {
        richCard: {
          standaloneCard: {
            cardContent: {
              title: 'Premium Package',
              description: 'Get access to all features with our premium plan.',
              media: {
                height: 'MEDIUM',
                contentInfo: {
                  fileUrl: 'https://example.com/premium.jpg',
                  altText: 'Premium package illustration',
                },
              },
              suggestions: [
                { reply: { text: 'Learn more', postbackData: 'learn_premium' } },
                { reply: { text: 'Subscribe', postbackData: 'subscribe' } },
              ],
            },
          },
        },
      },
    },
  },
];

function RichCardExample() {
  return (
    <Simulator
      thread={richCardThread}
      agentName="Sales Bot"
    />
  );
}
```

### Carousel of Cards

Display a carousel with multiple cards:

```tsx
const carouselThread: Thread = [
  {
    agentMessage: {
      messageId: '1',
      sendTime: new Date().toISOString(),
      contentMessage: {
        text: 'Check out our menu:',
      },
    },
  },
  {
    agentMessage: {
      messageId: '2',
      sendTime: new Date().toISOString(),
      contentMessage: {
        richCard: {
          carouselCard: {
            cardWidth: 'MEDIUM',
            cardContents: [
              {
                title: 'Espresso',
                description: 'Strong and bold',
                media: {
                  height: 'SHORT',
                  contentInfo: { fileUrl: 'https://example.com/espresso.jpg' },
                },
                suggestions: [
                  { reply: { text: 'Order', postbackData: 'order_espresso' } },
                ],
              },
              {
                title: 'Latte',
                description: 'Smooth and creamy',
                media: {
                  height: 'SHORT',
                  contentInfo: { fileUrl: 'https://example.com/latte.jpg' },
                },
                suggestions: [
                  { reply: { text: 'Order', postbackData: 'order_latte' } },
                ],
              },
              {
                title: 'Cappuccino',
                description: 'Perfect foam',
                media: {
                  height: 'SHORT',
                  contentInfo: { fileUrl: 'https://example.com/cappuccino.jpg' },
                },
                suggestions: [
                  { reply: { text: 'Order', postbackData: 'order_cappuccino' } },
                ],
              },
            ],
          },
        },
      },
    },
  },
];

function CarouselExample() {
  return (
    <Simulator
      thread={carouselThread}
      agentName="Coffee Shop"
    />
  );
}
```

---

## Display Settings Examples

### Dark Mode

```tsx
<Simulator
  thread={messages}
  agentName="Night Bot"
  initialDisplaySettings={{
    isDarkMode: true,
  }}
/>
```

### Landscape Mode

```tsx
<Simulator
  thread={messages}
  agentName="Wide Bot"
  initialDisplaySettings={{
    isPortrait: false,
  }}
/>
```

### iOS Device

```tsx
<Simulator
  thread={messages}
  agentName="iOS Bot"
  initialDisplaySettings={{
    isAndroid: false,
  }}
/>
```

### Combined Settings

```tsx
<Simulator
  thread={messages}
  agentName="Custom Bot"
  initialDisplaySettings={{
    isDarkMode: true,
    isPortrait: false,
    isAndroid: false,
  }}
/>
```

### Hide Controls

```tsx
<Simulator
  thread={messages}
  agentName="Embedded Bot"
  showControls={false}
/>
```

---

## Hook Usage Examples

### Custom Layout with useSimulator

```tsx
import { useSimulator, SimulatorControls } from '@rcs-lang/simulator/react';
import { Device } from '@rcs-lang/simulator/react'; // Note: Device is internal

function CustomLayout({ csm }) {
  const api = useSimulator({ csm, agentName: 'Custom Bot' });

  return (
    <div className="custom-simulator">
      <header>
        <h1>{api.agent.brandName}</h1>
        <span>Mode: {api.mode}</span>
        <span>Messages: {api.thread.length}</span>
      </header>

      <aside>
        <button onClick={api.toggleTheme}>
          {api.displaySettings.isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        <button onClick={api.toggleOrientation}>
          {api.displaySettings.isPortrait ? '📱 Portrait' : '📱 Landscape'}
        </button>
        <button onClick={api.togglePlatform}>
          {api.displaySettings.isAndroid ? '🤖 Android' : '🍎 iOS'}
        </button>
      </aside>

      <main>
        {/* Render your own UI using api.thread */}
        {api.thread.map((entry, i) => (
          <div key={i}>
            {entry.agentMessage && (
              <div className="agent-msg">
                {entry.agentMessage.contentMessage.text}
              </div>
            )}
            {entry.userMessage && (
              <div className="user-msg">
                {entry.userMessage.text}
              </div>
            )}
          </div>
        ))}
      </main>

      <footer>
        <input
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              api.sendMessage({ text: e.currentTarget.value });
              e.currentTarget.value = '';
            }
          }}
        />
      </footer>
    </div>
  );
}
```

### Programmatic Message Sending

```tsx
function AutomatedDemo({ csm }) {
  const api = useSimulator({ csm, agentName: 'Demo Bot' });

  const runDemo = async () => {
    await delay(1000);
    api.sendMessage({ text: 'Hello' });

    await delay(2000);
    api.sendMessage({ text: 'I want to order coffee' });

    await delay(2000);
    api.sendMessage({ text: 'Large latte please', postbackData: 'order_large_latte' });
  };

  return (
    <div>
      <button onClick={runDemo}>Run Demo</button>
      <Simulator csm={csm} agentName="Demo Bot" />
    </div>
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## Interactive Mode with CSM

```tsx
import { Simulator } from '@rcs-lang/simulator/react';
import { compile } from '@rcs-lang/compiler';

function InteractiveExample({ rclSource }: { rclSource: string }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const result = compile(rclSource);
    if (result.success) {
      setAgent(result.agent);
      setError(null);
    } else {
      setAgent(null);
      setError(result.errors.join('\n'));
    }
  }, [rclSource]);

  if (error) {
    return <pre className="error">{error}</pre>;
  }

  if (!agent) {
    return <div>Compiling...</div>;
  }

  return (
    <Simulator
      csm={agent}
      agentName={agent.meta?.name || 'My Agent'}
      onUserInteraction={(input) => {
        console.log('User interaction:', input);
      }}
    />
  );
}
```

---

## Building a Thread Dynamically

```tsx
import { useState } from 'react';
import { Simulator } from '@rcs-lang/simulator/react';
import type { Thread, ThreadEntry } from '@rcs-lang/simulator/react';

function DynamicThreadExample() {
  const [thread, setThread] = useState<Thread>([]);

  const addAgentMessage = (text: string) => {
    const entry: ThreadEntry = {
      agentMessage: {
        messageId: Date.now().toString(),
        sendTime: new Date().toISOString(),
        contentMessage: { text },
      },
    };
    setThread(prev => [...prev, entry]);
  };

  const addUserMessage = (text: string) => {
    const entry: ThreadEntry = {
      userMessage: {
        messageId: Date.now().toString(),
        sendTime: new Date().toISOString(),
        senderPhoneNumber: '+1234567890',
        agentId: 'demo',
        text,
      },
    };
    setThread(prev => [...prev, entry]);
  };

  return (
    <div>
      <div className="controls">
        <button onClick={() => addAgentMessage('Hello from agent!')}>
          Add Agent Message
        </button>
        <button onClick={() => addUserMessage('Hello from user!')}>
          Add User Message
        </button>
        <button onClick={() => setThread([])}>
          Clear
        </button>
      </div>

      <Simulator
        thread={thread}
        agentName="Dynamic Demo"
        onUserInteraction={(input) => {
          // Echo user input as agent message
          setTimeout(() => {
            addAgentMessage(`You said: ${input.text}`);
          }, 500);
        }}
      />
    </div>
  );
}
```
