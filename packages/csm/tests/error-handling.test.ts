import { describe, expect, it, vi } from 'vitest';
import { ConversationalAgent, type MachineDefinitionJSON } from '../src';

describe('Error Handling', () => {
  const createTestFlow = (): MachineDefinitionJSON => ({
    id: 'TestFlow',
    initial: 'Start',
    states: {
      Start: {
        transitions: [{ pattern: 'next', target: 'End' }],
      },
      End: {
        transitions: [],
      },
    },
  });

  it('should handle adding duplicate flows', () => {
    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    agent.addFlow(createTestFlow());

    expect(() => agent.addFlow(createTestFlow())).toThrow("Flow with ID 'TestFlow' already exists");
  });

  it('should handle removing active flow', () => {
    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    agent.addFlow(createTestFlow());

    expect(() => agent.removeFlow('TestFlow')).toThrow('Cannot remove the currently active flow');
  });

  it('should handle invalid state transitions', () => {
    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    agent.addFlow(createTestFlow());

    expect(() => agent.setState('TestFlow', 'NonExistent')).toThrow(
      "State 'NonExistent' does not exist in flow 'TestFlow'",
    );
  });

  it('should handle invalid machine transitions', async () => {
    const flow: MachineDefinitionJSON = {
      id: 'MainFlow',
      initial: 'Start',
      states: {
        Start: {
          transitions: [{ pattern: 'switch', target: 'machine:NonExistentFlow' }],
        },
      },
    };

    const errorHandler = vi.fn();
    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
      onError: errorHandler,
    });

    agent.addFlow(flow);

    await expect(agent.processInput('switch')).rejects.toThrow(
      "Target machine 'NonExistentFlow' not found",
    );
  });

  it('should handle errors in condition evaluation', async () => {
    const flow: MachineDefinitionJSON = {
      id: 'ConditionFlow',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'test',
              target: 'End',
              condition: 'context.nonExistent.property', // Will throw
            },
            {
              pattern: 'test',
              target: 'Fallback',
            },
          ],
        },
        End: { transitions: [] },
        Fallback: { transitions: [] },
      },
    };

    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    agent.addFlow(flow);

    // Should catch error and try next transition
    const result = await agent.processInput('test');
    expect(result.state).toBe('Fallback');
  });

  it('should call error handler for various operations', async () => {
    const errors: Array<{ error: Error; context: any }> = [];
    const errorHandler = vi.fn((error, context) => {
      errors.push({ error, context });
    });

    // Test serialization error
    const agent1 = new ConversationalAgent({
      id: 'ErrorBot',
      onStateChange: vi.fn(),
      onError: errorHandler,
    });

    // Force serialization error by adding circular reference
    const circular: any = { self: null };
    circular.self = circular;
    agent1.updateContext({ circular });

    expect(() => agent1.toURLHash()).toThrow();

    // Test state change handler error
    const throwingHandler = vi.fn(async () => {
      throw new Error('State change failed');
    });

    const agent2 = new ConversationalAgent({
      id: 'ErrorBot2',
      onStateChange: throwingHandler,
      onError: errorHandler,
    });

    agent2.addFlow(createTestFlow());

    // Error handler should be called
    expect(errorHandler).toHaveBeenCalled();
  });

  it('should handle deserialization errors', () => {
    // Invalid base64
    expect(() =>
      ConversationalAgent.fromURLHash('invalid!@#$', {
        id: 'TestBot',
        onStateChange: vi.fn(),
      }),
    ).toThrow('Failed to deserialize agent state');

    // Invalid JSON
    const invalidJson = Buffer.from('not json').toString('base64').replace(/=/g, '');
    expect(() =>
      ConversationalAgent.fromURLHash(invalidJson, {
        id: 'TestBot',
        onStateChange: vi.fn(),
      }),
    ).toThrow('Failed to deserialize agent state');

    // Valid JSON but wrong structure
    const wrongStructure = Buffer.from('{"wrong": "structure"}')
      .toString('base64')
      .replace(/=/g, '');
    expect(() =>
      ConversationalAgent.fromURLHash(wrongStructure, {
        id: 'TestBot',
        onStateChange: vi.fn(),
      }),
    ).toThrow('Invalid state structure');
  });

  it('should provide detailed error context', async () => {
    let capturedContext: any;
    const errorHandler = vi.fn((error, context) => {
      capturedContext = context;
    });

    let callCount = 0;
    const agent = new ConversationalAgent({
      id: 'ContextBot',
      onStateChange: async (event) => {
        // Skip init event, throw on the actual state change
        if (++callCount > 1) {
          throw new Error('Test error');
        }
      },
      onError: errorHandler,
      initialContext: { userId: '123' },
    });

    agent.addFlow(createTestFlow());
    await agent.processInput('next');

    expect(errorHandler).toHaveBeenCalled();
    expect(capturedContext).toBeDefined();
    expect(capturedContext.agent).toBe('ContextBot');
    expect(capturedContext.machine).toBe('TestFlow');
    expect(capturedContext.state).toBe('End');
    expect(capturedContext.operation).toBe('stateEntry');
    expect(capturedContext.context.userId).toBe('123');
  });

  it('should continue operation after handled errors', async () => {
    let errorCount = 0;
    const agent = new ConversationalAgent({
      id: 'RecoveryBot',
      onStateChange: async (event) => {
        if (event.state === 'End' && errorCount === 0) {
          errorCount++;
          throw new Error('First time fails');
        }
      },
      onError: vi.fn(),
    });

    agent.addFlow(createTestFlow());

    // First transition should complete despite error
    const result1 = await agent.processInput('next');
    expect(result1.state).toBe('End');

    // Subsequent operations should work
    agent.setState('TestFlow', 'Start');
    const result2 = await agent.processInput('next');
    expect(result2.state).toBe('End');
  });
});
