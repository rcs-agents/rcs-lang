import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test, beforeEach } from 'bun:test';
import { ConversationalAgent } from '../src/conversational-agent';
import { validateMachineDefinition, type MachineDefinitionJSON } from '../src/machine-definition';
import type { StateChangeEvent } from '../src/types';

describe('Cross-Request Execution and State Restoration', () => {
  let coffeeShopMachine: MachineDefinitionJSON;
  let stateChangeEvents: StateChangeEvent[] = [];

  beforeEach(() => {
    // Load coffee shop machine definition
    const fixturePath = resolve(__dirname, 'fixtures/coffee-shop-machine.json');
    coffeeShopMachine = JSON.parse(readFileSync(fixturePath, 'utf-8'));
    
    // Reset state tracking
    stateChangeEvents = [];
  });

  function createAgent(id: string = 'test-agent'): ConversationalAgent {
    return new ConversationalAgent({
      id,
      onStateChange: (event: StateChangeEvent) => {
        stateChangeEvents.push(event);
      },
      initialContext: {},
    });
  }

  describe('Machine Definition Validation', () => {
    test('should validate coffee shop machine against schema', () => {
      expect(() => validateMachineDefinition(coffeeShopMachine)).not.toThrow();
    });

    test('should have required properties', () => {
      expect(coffeeShopMachine.id).toBe('OrderFlow');
      expect(coffeeShopMachine.initial).toBe('Welcome');
      expect(Object.keys(coffeeShopMachine.states)).toContain('Welcome');
      expect(Object.keys(coffeeShopMachine.states)).toContain('ChooseSize');
    });
  });

  describe('Basic Flow Execution', () => {
    test('should start in Welcome state', () => {
      const agent = createAgent();
      agent.addFlow(coffeeShopMachine);

      const state = agent.getCurrentState();
      expect(state.machine).toBe('OrderFlow');
      expect(state.state).toBe('Welcome');
    });

    test('should transition through ordering flow', async () => {
      const agent = createAgent();
      agent.addFlow(coffeeShopMachine);

      // User says "Order Coffee"
      let result = await agent.processInput('Order Coffee');
      expect(result.state).toBe('ChooseSize');
      expect(result.transitioned).toBe(true);

      // User chooses "Medium"
      result = await agent.processInput('Medium');
      expect(result.state).toBe('ChooseDrink');
      expect(result.context.size).toBe('medium');
      expect(result.context.price).toBe(4.50);

      // User chooses "Latte"
      result = await agent.processInput('Latte');
      expect(result.state).toBe('Customize');
      expect(result.context.drink).toBe('latte');

      // User chooses "Oat"
      result = await agent.processInput('Oat');
      expect(result.state).toBe('ConfirmOrder');
      expect(result.context.milk).toBe('oat');
      expect(result.context.extraCharge).toBe(0.60);
    });

    test('should handle invalid options and return to correct state', async () => {
      const agent = createAgent();
      agent.addFlow(coffeeShopMachine);

      // Go to ChooseSize
      await agent.processInput('Order Coffee');
      
      // Give invalid input - should trigger :default transition to InvalidOption
      // InvalidOption is transient and immediately transitions to @next (ChooseSize)
      const result = await agent.processInput('XLarge');
      
      // Should end up back at ChooseSize via InvalidOption -> @next resolution
      expect(result.state).toBe('ChooseSize');
      expect(result.context.property).toBe('size');
      expect(result.context.next).toBe('ChooseSize');
    });
  });

  describe('State Serialization and Restoration', () => {
    test('should serialize agent state to URL hash', () => {
      const agent = createAgent('coffee-123');
      agent.addFlow(coffeeShopMachine);

      const hash = agent.toURLHash();
      expect(hash).toBeTruthy();
      expect(hash).not.toContain('+');
      expect(hash).not.toContain('/');
      expect(hash).not.toContain('=');
    });

    test('should restore agent state from URL hash', async () => {
      // Create first agent and progress through flow
      const agent1 = createAgent('coffee-123');
      agent1.addFlow(coffeeShopMachine);

      await agent1.processInput('Order Coffee');
      await agent1.processInput('Large');
      await agent1.processInput('Cappuccino');

      const hash = agent1.toURLHash();
      const context1 = agent1.getContext();

      // Create second agent from hash
      const agent2 = ConversationalAgent.fromURLHash(hash, {
        id: 'coffee-123',
        onStateChange: (event: StateChangeEvent) => {
          stateChangeEvents.push(event);
        },
      });

      agent2.addFlow(coffeeShopMachine);
      agent2.setState('OrderFlow', 'Customize');

      const state2 = agent2.getCurrentState();
      const context2 = agent2.getContext();

      expect(state2.machine).toBe('OrderFlow');
      expect(state2.state).toBe('Customize');
      expect(context2.size).toBe(context1.size);
      expect(context2.price).toBe(context1.price);
      expect(context2.drink).toBe(context1.drink);
    });

    test('should maintain context across requests', async () => {
      const agent1 = createAgent('session-456');
      agent1.addFlow(coffeeShopMachine);

      // Build up context through multiple inputs
      await agent1.processInput('Order Coffee');
      await agent1.processInput('Small');
      await agent1.processInput('Espresso');

      const hash = agent1.toURLHash();

      // Simulate new request with restored state
      const agent2 = ConversationalAgent.fromURLHash(hash, {
        id: 'session-456',
        onStateChange: () => {},
      });
      agent2.addFlow(coffeeShopMachine);
      agent2.setState('OrderFlow', 'Customize');

      // Continue conversation
      const result = await agent2.processInput('Soy');
      
      expect(result.state).toBe('ConfirmOrder');
      expect(result.context.size).toBe('small');
      expect(result.context.drink).toBe('espresso');
      expect(result.context.milk).toBe('soy');
      expect(result.context.extraCharge).toBe(0.60);
    });
  });

  describe('Transient State Processing', () => {
    test('should automatically process transient states', async () => {
      const agent = createAgent();
      agent.addFlow(coffeeShopMachine);

      // Complete full order flow
      await agent.processInput('Order Coffee');
      await agent.processInput('Medium');
      await agent.processInput('Latte');
      await agent.processInput('Regular');
      await agent.processInput('Confirm');

      // Should automatically go through ProcessPayment -> OrderComplete -> ThankYou -> ShowMenu -> Welcome
      const state = agent.getCurrentState();
      expect(state.state).toBe('Welcome');
      
      // Check that all transient transitions were recorded
      const transientEvents = stateChangeEvents.filter(e => e.trigger === 'transient');
      expect(transientEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Context Variable Handling', () => {
    test('should accumulate context correctly', async () => {
      const agent = createAgent();
      agent.addFlow(coffeeShopMachine);

      await agent.processInput('Order Coffee');
      
      let context = agent.getContext();
      expect(Object.keys(context).length).toBe(0);

      await agent.processInput('Large');
      context = agent.getContext();
      expect(context.size).toBe('large');
      expect(context.price).toBe(5.50);

      await agent.processInput('Americano');
      context = agent.getContext();
      expect(context.size).toBe('large'); // Should persist
      expect(context.drink).toBe('americano');

      await agent.processInput('Soy');
      context = agent.getContext();
      expect(context.size).toBe('large'); // Should persist
      expect(context.drink).toBe('americano'); // Should persist
      expect(context.milk).toBe('soy');
      expect(context.extraCharge).toBe(0.60);
    });
  });

  describe('Pattern Matching', () => {
    test('should match exact patterns case-insensitively', async () => {
      const agent = createAgent();
      agent.addFlow(coffeeShopMachine);

      await agent.processInput('order coffee'); // lowercase
      expect(agent.getCurrentState().state).toBe('ChooseSize');

      await agent.processInput('MEDIUM'); // uppercase
      expect(agent.getCurrentState().state).toBe('ChooseDrink');
    });

    test('should use :default pattern for unmatched input', async () => {
      const agent = createAgent();
      agent.addFlow(coffeeShopMachine);

      // At Welcome, invalid input should default back to Welcome
      await agent.processInput('random text');
      expect(agent.getCurrentState().state).toBe('Welcome');
    });
  });

  describe('Known Issues and Limitations', () => {
    test('SUCCESS: @next context variable resolution now works', async () => {
      const agent = createAgent();
      agent.addFlow(coffeeShopMachine);

      await agent.processInput('Order Coffee');
      await agent.processInput('Invalid Size');

      // Should automatically resolve @next and end up back at ChooseSize
      expect(agent.getCurrentState().state).toBe('ChooseSize');
      
      // Context should contain the variables set by the :default transition
      const context = agent.getContext();
      expect(context.property).toBe('size');
      expect(context.next).toBe('ChooseSize');
    });

    test('SUCCESS: Context variable interpolation in targets now supported', () => {
      // Create a valid machine with @variable syntax
      const validMachine: MachineDefinitionJSON = {
        id: 'TestFlow',
        initial: 'Start',
        states: {
          Start: {
            transitions: [
              {
                target: '@nextState'
              }
            ]
          },
          End: {
            transitions: []
          }
        }
      };

      // This should validate with our updated schema
      expect(() => validateMachineDefinition(validMachine)).not.toThrow();
    });

    test('ISSUE: No support for conditions with context access', async () => {
      // While the schema supports condition expressions, there's no comprehensive testing
      // of complex context-dependent conditions
      
      const machineWithCondition: MachineDefinitionJSON = {
        id: 'TestFlow',
        initial: 'Start',
        states: {
          Start: {
            transitions: [
              {
                pattern: 'test',
                target: 'End',
                condition: 'context.size === \"large\"'
              }
            ]
          },
          End: {
            transitions: []
          }
        }
      };

      const agent = createAgent();
      agent.addFlow(machineWithCondition);
      agent.updateContext({ size: 'small' });

      await agent.processInput('test');
      // Should not transition due to condition
      expect(agent.getCurrentState().state).toBe('Start');

      agent.updateContext({ size: 'large' });
      await agent.processInput('test');
      // Should transition now
      expect(agent.getCurrentState().state).toBe('End');
    });
  });
});