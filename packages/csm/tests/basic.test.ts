import { vi } from './test-utils';
import { describe, expect, test } from 'bun:test';
import { ConversationalAgent, type FlowDefinition } from '../src';

describe('ConversationalAgent', () => {
  const createTestFlow = (): FlowDefinition => ({
    id: 'TestFlow',
    initial: 'Start',
    states: {
      Start: {
        transitions: [
          { pattern: 'hello', target: 'Greeting' },
          { pattern: 'bye', target: 'End' },
        ],
      },
      Greeting: {
        transitions: [{ pattern: 'bye', target: 'End' }],
      },
      End: {
        transitions: [],
      },
    },
  });

  test('should create an agent and add a flow', () => {
    const onStateChange = vi.fn();
    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange,
    });

    agent.addFlow(createTestFlow());

    expect(agent.id).toBe('TestBot');
    expect(agent.getCurrentState()).toEqual({
      machine: 'TestFlow',
      state: 'Start',
    });
  });

  test('should process input and transition states', async () => {
    const onStateChange = vi.fn();
    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange,
    });

    agent.addFlow(createTestFlow());

    const result = await agent.processInput('hello');

    expect(result.state).toBe('Greeting');
    expect(result.transitioned).toBe(true);
    // Check that onStateChange was called with the expected arguments
    const lastCall = onStateChange.calls[onStateChange.calls.length - 1];
    expect(lastCall[0]).toMatchObject({
      state: 'Greeting',
      previousState: 'Start',
      trigger: 'input',
      input: 'hello',
    });
  });

  test('should handle context updates', async () => {
    const flow: FlowDefinition = {
      id: 'ContextFlow',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'set name',
              target: 'Named',
              context: { name: 'John' },
            },
          ],
        },
        Named: {
          transitions: [],
        },
      },
    };

    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    agent.addFlow(flow);
    await agent.processInput('set name');

    expect(agent.getContext()).toEqual({ name: 'John' });
  });

  test('should serialize and deserialize state', () => {
    const onStateChange = vi.fn();
    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange,
      initialContext: { userId: '123' },
    });

    agent.addFlow(createTestFlow());

    const hash = agent.toURLHash();
    expect(hash).toBeTruthy();
    expect(hash).not.toContain('+');
    expect(hash).not.toContain('/');
    expect(hash).not.toContain('=');

    // Restore from hash
    const restored = ConversationalAgent.fromURLHash(hash, {
      id: 'TestBot',
      onStateChange,
    });

    restored.addFlow(createTestFlow());
    restored.setState('TestFlow', 'Start');

    expect(restored.getCurrentState()).toEqual({
      machine: 'TestFlow',
      state: 'Start',
    });
    expect(restored.getContext()).toEqual({ userId: '123' });
  });

  test('should handle transient states', async () => {
    const flow: FlowDefinition = {
      id: 'TransientFlow',
      initial: 'Start',
      states: {
        Start: {
          transitions: [{ pattern: 'process', target: 'Processing' }],
        },
        Processing: {
          transitions: [
            { target: 'Complete' }, // No pattern = transient
          ],
        },
        Complete: {
          transitions: [],
        },
      },
    };

    const stateChanges: string[] = [];
    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: async (event) => {
        stateChanges.push(event.state);
      },
    });

    agent.addFlow(flow);
    await agent.processInput('process');

    expect(stateChanges).toEqual(['Start', 'Processing', 'Complete']);
    expect(agent.getCurrentState().state).toBe('Complete');
  });
});
