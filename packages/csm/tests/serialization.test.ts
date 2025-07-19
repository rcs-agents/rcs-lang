import { vi } from './test-utils';
import { describe, expect, test } from 'bun:test';
import { ConversationalAgent, type MachineDefinitionJSON } from '../src';

describe('Serialization', () => {
  const createTestFlow = (): MachineDefinitionJSON => ({
    id: 'TestFlow',
    initial: 'Start',
    states: {
      Start: {
        transitions: [{ pattern: 'next', target: 'Middle', context: { step: 1 } }],
      },
      Middle: {
        transitions: [{ pattern: 'end', target: 'End', context: { step: 2 } }],
      },
      End: {
        transitions: [],
      },
    },
  });

  test('should generate URL-safe hash', () => {
    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
      initialContext: { userId: '123', sessionId: 'abc' },
    });

    agent.addFlow(createTestFlow());
    const hash = agent.toURLHash();

    // Check URL-safe characters
    expect(hash).toBeTruthy();
    expect(hash).not.toMatch(/[+/=]/); // No standard base64 chars
    expect(hash).toMatch(/^[A-Za-z0-9_-]+$/); // Only URL-safe chars
  });

  test('should restore complete state from hash', async () => {
    const onStateChange = vi.fn();
    const originalAgent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange,
      initialContext: { userId: '123', data: { nested: true } },
    });

    originalAgent.addFlow(createTestFlow());

    // Make some state changes
    await originalAgent.processInput('next');
    originalAgent.updateContext({ customField: 'value' });

    // Serialize
    const hash = originalAgent.toURLHash();

    // Restore
    const restoredAgent = ConversationalAgent.fromURLHash(hash, {
      id: 'TestBot',
      onStateChange,
    });

    restoredAgent.addFlow(createTestFlow());
    restoredAgent.setState('TestFlow', 'Middle');

    // Verify restoration
    expect(restoredAgent.getCurrentState()).toEqual({
      machine: 'TestFlow',
      state: 'Middle',
    });

    expect(restoredAgent.getContext()).toEqual({
      userId: '123',
      data: { nested: true },
      step: 1,
      customField: 'value',
    });
  });

  test('should handle hash with special characters in context', () => {
    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
      initialContext: {
        message: 'Hello, World! 你好世界 🌍',
        specialChars: '< > & " \' \\ / ? # % @',
        unicode: '™️ © ® € £ ¥',
      },
    });

    agent.addFlow(createTestFlow());
    const hash = agent.toURLHash();

    const restored = ConversationalAgent.fromURLHash(hash, {
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    expect(restored.getContext().message).toBe('Hello, World! 你好世界 🌍');
    expect(restored.getContext().specialChars).toBe('< > & " \' \\ / ? # % @');
    expect(restored.getContext().unicode).toBe('™️ © ® € £ ¥');
  });

  test('should maintain state across multiple serialization cycles', async () => {
    let agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    agent.addFlow(createTestFlow());

    // First cycle
    await agent.processInput('next');
    let hash = agent.toURLHash();

    agent = ConversationalAgent.fromURLHash(hash, {
      id: 'TestBot',
      onStateChange: vi.fn(),
    });
    agent.addFlow(createTestFlow());
    agent.setState('TestFlow', 'Middle');

    // Second cycle
    await agent.processInput('end');
    hash = agent.toURLHash();

    agent = ConversationalAgent.fromURLHash(hash, {
      id: 'TestBot',
      onStateChange: vi.fn(),
    });
    agent.addFlow(createTestFlow());
    agent.setState('TestFlow', 'End');

    expect(agent.getCurrentState().state).toBe('End');
    expect(agent.getContext()).toEqual({ step: 2 });
  });
});
