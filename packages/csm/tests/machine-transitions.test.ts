import { vi } from './test-utils';
import { describe, expect, test } from 'bun:test';
import { ConversationalAgent, type MachineDefinitionJSON } from '../src';

describe('Machine-to-Machine Transitions', () => {
  const createMainFlow = (): MachineDefinitionJSON => ({
    id: 'MainFlow',
    initial: 'Menu',
    states: {
      Menu: {
        transitions: [
          { pattern: 'support', target: 'machine:SupportFlow' },
          { pattern: 'order', target: 'machine:OrderFlow' },
          { pattern: 'exit', target: 'Goodbye' },
        ],
      },
      Goodbye: {
        transitions: [],
      },
    },
  });

  const createSupportFlow = (): MachineDefinitionJSON => ({
    id: 'SupportFlow',
    initial: 'AskIssue',
    states: {
      AskIssue: {
        transitions: [
          { pattern: 'technical', target: 'TechnicalSupport' },
          { pattern: 'billing', target: 'BillingSupport' },
          { pattern: 'back', target: 'machine:MainFlow' },
        ],
      },
      TechnicalSupport: {
        transitions: [{ pattern: 'resolved', target: 'machine:MainFlow' }],
      },
      BillingSupport: {
        transitions: [{ pattern: 'resolved', target: 'machine:MainFlow' }],
      },
    },
  });

  const createOrderFlow = (): MachineDefinitionJSON => ({
    id: 'OrderFlow',
    initial: 'SelectProduct',
    states: {
      SelectProduct: {
        transitions: [
          { pattern: 'coffee', target: 'Checkout', context: { product: 'coffee', price: 5 } },
          { pattern: 'tea', target: 'Checkout', context: { product: 'tea', price: 3 } },
          { pattern: 'cancel', target: 'machine:MainFlow' },
        ],
      },
      Checkout: {
        transitions: [
          { pattern: 'pay', target: 'Complete' },
          { pattern: 'cancel', target: 'machine:MainFlow' },
        ],
      },
      Complete: {
        transitions: [
          { target: 'machine:MainFlow' }, // Auto-return to main
        ],
      },
    },
  });

  test('should transition between machines', async () => {
    const stateChanges: Array<{ machine: string; state: string }> = [];

    const agent = new ConversationalAgent({
      id: 'MultiFlowBot',
      onStateChange: async (event) => {
        stateChanges.push({ machine: event.machine, state: event.state });
      },
    });

    agent.addFlow(createMainFlow());
    agent.addFlow(createSupportFlow());
    agent.addFlow(createOrderFlow());

    // Start in main menu
    expect(agent.getCurrentState()).toEqual({
      machine: 'MainFlow',
      state: 'Menu',
    });

    // Go to support
    await agent.processInput('support');
    expect(agent.getCurrentState()).toEqual({
      machine: 'SupportFlow',
      state: 'AskIssue',
    });

    // Choose technical support
    await agent.processInput('technical');
    expect(agent.getCurrentState()).toEqual({
      machine: 'SupportFlow',
      state: 'TechnicalSupport',
    });

    // Resolve and return to main
    await agent.processInput('resolved');
    expect(agent.getCurrentState()).toEqual({
      machine: 'MainFlow',
      state: 'Menu',
    });
  });

  test('should preserve context across machine transitions', async () => {
    const agent = new ConversationalAgent({
      id: 'ContextBot',
      onStateChange: vi.fn(),
      initialContext: { userId: '123', sessionStart: Date.now() },
    });

    agent.addFlow(createMainFlow());
    agent.addFlow(createOrderFlow());

    // Go to order flow
    await agent.processInput('order');

    // Select coffee
    await agent.processInput('coffee');

    // Context should include both initial and transition context
    const context = agent.getContext();
    expect(context.userId).toBe('123');
    expect(context.sessionStart).toBeDefined();
    expect(context.product).toBe('coffee');
    expect(context.price).toBe(5);
  });

  test('should handle transient state with machine transition', async () => {
    const stateSequence: string[] = [];

    const agent = new ConversationalAgent({
      id: 'TransientBot',
      onStateChange: async (event) => {
        stateSequence.push(`${event.machine}:${event.state}`);
      },
    });

    agent.addFlow(createMainFlow());
    agent.addFlow(createOrderFlow());

    // Go to order, select coffee, pay
    await agent.processInput('order');
    await agent.processInput('coffee');
    await agent.processInput('pay');

    // Should automatically transition back to main menu
    expect(stateSequence).toContain('OrderFlow:Complete');
    expect(stateSequence[stateSequence.length - 1]).toBe('MainFlow:Menu');

    expect(agent.getCurrentState()).toEqual({
      machine: 'MainFlow',
      state: 'Menu',
    });
  });

  test('should serialize and restore across machine boundaries', async () => {
    const agent1 = new ConversationalAgent({
      id: 'SerializeBot',
      onStateChange: vi.fn(),
    });

    agent1.addFlow(createMainFlow());
    agent1.addFlow(createSupportFlow());

    // Navigate to support flow
    await agent1.processInput('support');
    await agent1.processInput('billing');
    agent1.updateContext({ ticketId: 'SUPP-123' });

    // Serialize
    const hash = agent1.toURLHash();

    // Restore in new agent
    const agent2 = ConversationalAgent.fromURLHash(hash, {
      id: 'SerializeBot',
      onStateChange: vi.fn(),
    });

    agent2.addFlow(createMainFlow());
    agent2.addFlow(createSupportFlow());
    agent2.setState('SupportFlow', 'BillingSupport');

    expect(agent2.getCurrentState()).toEqual({
      machine: 'SupportFlow',
      state: 'BillingSupport',
    });
    expect(agent2.getContext().ticketId).toBe('SUPP-123');
  });

  test('should emit correct events for machine transitions', async () => {
    const events: any[] = [];

    const agent = new ConversationalAgent({
      id: 'EventBot',
      onStateChange: async (event) => {
        events.push({
          trigger: event.trigger,
          machine: event.machine,
          state: event.state,
          previousMachine: event.previousMachine,
          previousState: event.previousState,
        });
      },
    });

    agent.addFlow(createMainFlow());
    agent.addFlow(createSupportFlow());

    await agent.processInput('support');

    // Find the machine transition event
    const machineTransition = events.find((e) => e.trigger === 'machine');
    expect(machineTransition).toBeDefined();
    expect(machineTransition.previousMachine).toBe('MainFlow');
    expect(machineTransition.previousState).toBe('Menu');
    expect(machineTransition.machine).toBe('SupportFlow');
    expect(machineTransition.state).toBe('AskIssue');
  });
});
