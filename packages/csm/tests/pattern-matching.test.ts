import { vi } from './test-utils';
import { describe, expect, test } from 'bun:test';
import { ConversationalAgent, type MachineDefinitionJSON } from '../src';

describe('Pattern Matching', () => {
  test('should match exact patterns (case insensitive)', async () => {
    const flow: MachineDefinitionJSON = {
      id: 'TestFlow',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            { pattern: 'Hello', target: 'Greeting' },
            { pattern: 'GOODBYE', target: 'Farewell' },
          ],
        },
        Greeting: { transitions: [] },
        Farewell: { transitions: [] },
      },
    };

    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    agent.addFlow(flow);

    // Test case insensitive matching
    let result = await agent.processInput('hello');
    expect(result.state).toBe('Greeting');

    agent.setState('TestFlow', 'Start');
    result = await agent.processInput('HELLO');
    expect(result.state).toBe('Greeting');

    agent.setState('TestFlow', 'Start');
    result = await agent.processInput('HeLLo');
    expect(result.state).toBe('Greeting');

    agent.setState('TestFlow', 'Start');
    result = await agent.processInput('goodbye');
    expect(result.state).toBe('Farewell');
  });

  test('should support wildcard patterns', async () => {
    const flow: MachineDefinitionJSON = {
      id: 'WildcardFlow',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            { pattern: 'order *', target: 'ProcessOrder' },
            { pattern: '* support', target: 'Support' },
            { pattern: 'cancel order *', target: 'CancelOrder' },
          ],
        },
        ProcessOrder: { transitions: [] },
        Support: { transitions: [] },
        CancelOrder: { transitions: [] },
      },
    };

    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    agent.addFlow(flow);

    // Test prefix wildcard
    let result = await agent.processInput('order coffee');
    expect(result.state).toBe('ProcessOrder');

    agent.setState('WildcardFlow', 'Start');
    result = await agent.processInput('order pizza with extra cheese');
    expect(result.state).toBe('ProcessOrder');

    // Test suffix wildcard
    agent.setState('WildcardFlow', 'Start');
    result = await agent.processInput('technical support');
    expect(result.state).toBe('Support');

    agent.setState('WildcardFlow', 'Start');
    result = await agent.processInput('I need support');
    expect(result.state).toBe('Support');

    // Test multiple wildcards (more specific pattern)
    agent.setState('WildcardFlow', 'Start');
    result = await agent.processInput('cancel order 12345');
    expect(result.state).toBe('CancelOrder');
  });

  test('should handle default transitions', async () => {
    const flow: MachineDefinitionJSON = {
      id: 'DefaultFlow',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            { pattern: 'yes', target: 'Confirmed' },
            { pattern: 'no', target: 'Cancelled' },
            { pattern: ':default', target: 'Confused' },
          ],
        },
        Confirmed: { transitions: [] },
        Cancelled: { transitions: [] },
        Confused: { transitions: [] },
      },
    };

    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    agent.addFlow(flow);

    // Test specific patterns
    let result = await agent.processInput('yes');
    expect(result.state).toBe('Confirmed');

    agent.setState('DefaultFlow', 'Start');
    result = await agent.processInput('no');
    expect(result.state).toBe('Cancelled');

    // Test default fallback
    agent.setState('DefaultFlow', 'Start');
    result = await agent.processInput('maybe');
    expect(result.state).toBe('Confused');

    agent.setState('DefaultFlow', 'Start');
    result = await agent.processInput('random text');
    expect(result.state).toBe('Confused');
  });

  test('should respect transition priority', async () => {
    const flow: MachineDefinitionJSON = {
      id: 'PriorityFlow',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            { pattern: 'help', target: 'GeneralHelp', priority: 0 },
            { pattern: 'help *', target: 'SpecificHelp', priority: 10 },
            { pattern: 'help with order', target: 'OrderHelp', priority: 20 },
            { pattern: '*', target: 'Fallback', priority: -10 },
          ],
        },
        GeneralHelp: { transitions: [] },
        SpecificHelp: { transitions: [] },
        OrderHelp: { transitions: [] },
        Fallback: { transitions: [] },
      },
    };

    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    agent.addFlow(flow);

    // Most specific pattern with highest priority wins
    let result = await agent.processInput('help with order');
    expect(result.state).toBe('OrderHelp');

    // Next highest priority
    agent.setState('PriorityFlow', 'Start');
    result = await agent.processInput('help with payment');
    expect(result.state).toBe('SpecificHelp');

    // Exact match with lower priority
    agent.setState('PriorityFlow', 'Start');
    result = await agent.processInput('help');
    expect(result.state).toBe('GeneralHelp');

    // Lowest priority catch-all
    agent.setState('PriorityFlow', 'Start');
    result = await agent.processInput('something else');
    expect(result.state).toBe('Fallback');
  });

  test('should support conditional transitions', async () => {
    const flow: MachineDefinitionJSON = {
      id: 'ConditionalFlow',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'buy',
              target: 'Purchase',
              condition: 'context.age >= 18',
            },
            {
              pattern: 'buy',
              target: 'Denied',
            },
          ],
        },
        Purchase: { transitions: [] },
        Denied: { transitions: [] },
      },
    };

    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    agent.addFlow(flow);

    // Test with condition failing
    let result = await agent.processInput('buy');
    expect(result.state).toBe('Denied');

    // Test with condition passing
    agent.setState('ConditionalFlow', 'Start');
    agent.updateContext({ age: 21 });
    result = await agent.processInput('buy');
    expect(result.state).toBe('Purchase');

    // Test with condition failing again
    agent.setState('ConditionalFlow', 'Start');
    agent.updateContext({ age: 16 });
    result = await agent.processInput('buy');
    expect(result.state).toBe('Denied');
  });

  test('should handle no matching transitions', async () => {
    const flow: MachineDefinitionJSON = {
      id: 'NoMatchFlow',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            { pattern: 'yes', target: 'Yes' },
            { pattern: 'no', target: 'No' },
            // No default transition
          ],
        },
        Yes: { transitions: [] },
        No: { transitions: [] },
      },
    };

    const agent = new ConversationalAgent({
      id: 'TestBot',
      onStateChange: vi.fn(),
    });

    agent.addFlow(flow);

    const result = await agent.processInput('maybe');
    expect(result.transitioned).toBe(false);
    expect(result.state).toBe('Start'); // Should stay in same state
  });
});
