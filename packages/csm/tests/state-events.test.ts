import { vi } from './test-utils';
import { beforeEach, describe, expect, test } from 'bun:test';
import { ConversationalAgent, type MachineDefinitionJSON, type StateChangeEvent } from '../src';

describe('State Change Events', () => {
  let events: StateChangeEvent[];
  let onStateChange: any;

  beforeEach(() => {
    events = [];
    onStateChange = vi.fn(async (event: StateChangeEvent) => {
      events.push(event);
    });
  });

  const createTestFlow = (): MachineDefinitionJSON => ({
    id: 'EventFlow',
    initial: 'Start',
    states: {
      Start: {
        transitions: [{ pattern: 'process', target: 'Processing' }],
      },
      Processing: {
        transitions: [
          { target: 'Complete' }, // Transient
        ],
        meta: { transient: true },
      },
      Complete: {
        transitions: [{ pattern: 'restart', target: 'Start' }],
      },
    },
  });

  test('should emit init event when first flow is added', () => {
    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange,
    });

    agent.addFlow(createTestFlow());

    expect(onStateChange.calls.length).toBe(1);
    expect(events[0]).toMatchObject({
      agent: 'TestBot',
      machine: 'EventFlow',
      state: 'Start',
      trigger: 'init',
      context: {},
    });
    expect(events[0].timestamp).toBeDefined();
  });

  test('should emit input event on user input transition', async () => {
    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange,
      initialContext: { userId: '123' },
    });

    agent.addFlow(createTestFlow());
    events = []; // Clear init event

    await agent.processInput('process');

    // Should have input event and transient event
    expect(events).toHaveLength(2);

    // First event: input transition
    expect(events[0]).toMatchObject({
      agent: 'TestBot',
      machine: 'EventFlow',
      state: 'Processing',
      previousState: 'Start',
      trigger: 'input',
      input: 'process',
      context: { userId: '123' },
    });

    // Second event: transient transition
    expect(events[1]).toMatchObject({
      agent: 'TestBot',
      machine: 'EventFlow',
      state: 'Complete',
      previousState: 'Processing',
      trigger: 'transient',
      context: { userId: '123' },
    });
  });

  test('should include transition details in events', async () => {
    const flow: MachineDefinitionJSON = {
      id: 'DetailFlow',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'buy coffee',
              target: 'Order',
              context: { product: 'coffee', price: 5 },
              priority: 10,
            },
          ],
        },
        Order: {
          transitions: [],
        },
      },
    };

    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange,
    });

    agent.addFlow(flow);
    events = []; // Clear init event

    await agent.processInput('buy coffee');

    expect(events[0].transition).toMatchObject({
      pattern: 'buy coffee',
      target: 'Order',
      context: { product: 'coffee', price: 5 },
      priority: 10,
    });
  });

  test('should handle async state change callbacks', async () => {
    const asyncResults: string[] = [];
    const slowStateChange = vi.fn(async (event: StateChangeEvent) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      asyncResults.push(`${event.state}-processed`);
    });

    const agent = new ConversationalAgent({
      id: 'AsyncBot',
      onStateChange: slowStateChange,
    });

    agent.addFlow(createTestFlow());
    await agent.processInput('process');

    expect(slowStateChange.calls.length).toBe(3); // init, input, transient
    expect(asyncResults).toHaveLength(3);
    expect(asyncResults).toContain('Start-processed');
    expect(asyncResults).toContain('Processing-processed');
    expect(asyncResults).toContain('Complete-processed');
  });

  test('should handle errors in state change callback', async () => {
    const errorHandler = vi.fn();
    const failingStateChange = vi.fn(async (event: StateChangeEvent) => {
      if (event.state === 'Processing') {
        throw new Error('Processing failed');
      }
    });

    const agent = new ConversationalAgent({
      id: 'ErrorBot',
      onStateChange: failingStateChange,
      onError: errorHandler,
    });

    agent.addFlow(createTestFlow());

    // Should not throw, but should call error handler
    await expect(agent.processInput('process')).resolves.toBeDefined();

    // Check errorHandler was called with expected args
    expect(errorHandler.calls.length).toBeGreaterThan(0);
    const [error, context] = errorHandler.calls[0];
    expect(error.message).toBe('Processing failed');
    expect(context).toMatchObject({
      agent: 'ErrorBot',
      machine: 'EventFlow',
      state: 'Processing',
      operation: 'stateEntry',
    });
  });

  test('should emit restore event when created from hash', (done) => {
    const originalAgent = new ConversationalAgent({
      id: 'RestoreBot',
      onStateChange: vi.fn(),
    });

    originalAgent.addFlow(createTestFlow());
    const hash = originalAgent.toURLHash();

    const restoredAgent = ConversationalAgent.fromURLHash(hash, {
      id: 'RestoreBot',
      onStateChange: (event) => {
        if (event.trigger === 'restore') {
          expect(event).toMatchObject({
            agent: 'RestoreBot',
            machine: 'EventFlow',
            state: 'Start',
            trigger: 'restore',
          });
          done();
        }
      },
    });

    restoredAgent.addFlow(createTestFlow());
    restoredAgent.setState('EventFlow', 'Start');
  });

  test('should track state change timing', async () => {
    const timings: Array<{ state: string; timestamp: number }> = [];

    const agent = new ConversationalAgent({
      id: 'TimingBot',
      onStateChange: async (event) => {
        timings.push({ state: event.state, timestamp: event.timestamp });
      },
    });

    agent.addFlow(createTestFlow());
    const startTime = Date.now();

    await agent.processInput('process');

    // All timestamps should be recent and in order
    expect(timings).toHaveLength(3);
    
    // Check that all events have timestamps
    timings.forEach((timing) => {
      expect(timing.timestamp).toBeDefined();
      expect(typeof timing.timestamp).toBe('number');
      expect(timing.timestamp).toBeGreaterThan(0);
    });
    
    // Check that timestamps are monotonically increasing (with tolerance for CI timing)
    for (let i = 1; i < timings.length; i++) {
      // Allow for same timestamp due to timing precision
      expect(timings[i].timestamp).toBeGreaterThanOrEqual(timings[i - 1].timestamp);
    }
    
    // Check that all timestamps are reasonably recent (within last 5 seconds)
    const endTime = Date.now();
    timings.forEach((timing) => {
      expect(timing.timestamp).toBeGreaterThanOrEqual(startTime - 1); // Allow 1ms tolerance
      expect(timing.timestamp).toBeLessThanOrEqual(endTime + 1000); // Allow 1 second future tolerance for CI
    });
  });
});
