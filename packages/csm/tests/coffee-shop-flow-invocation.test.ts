import { describe, test, expect, beforeEach } from 'bun:test';
import { ConversationalAgent } from '../src/conversational-agent';
import type { MachineDefinitionJSON } from '../src/machine-definition';
import type { StateChangeEvent } from '../src/types';

describe('Coffee Shop Flow Invocation Integration', () => {
  let agent: ConversationalAgent;
  let coffeeShopMachine: MachineDefinitionJSON;
  let stateChanges: StateChangeEvent[] = [];

  beforeEach(async () => {
    // Load the actual coffee shop machine fixture
    const { default: rawMachine } = await import('./fixtures/coffee-shop-machine.json');
    
    // Use the multi-flow machine directly (no extraction needed)
    coffeeShopMachine = rawMachine as MachineDefinitionJSON;
    
    // Create agent with state change tracking
    stateChanges = [];
    agent = new ConversationalAgent({
      id: 'test-agent',
      onStateChange: async (event) => {
        stateChanges.push(event);
      }
    });

    // Add the multi-flow machine
    agent.addMachine(coffeeShopMachine);
  });

  test('should start in Welcome state', async () => {
    const currentState = agent.getCurrentState();
    expect(currentState.state).toBe('Welcome');
    expect(stateChanges).toHaveLength(1);
    expect(stateChanges[0].state).toBe('Welcome');
  });

  test('should handle basic menu navigation', async () => {
    // Test "View Menu" transition
    await agent.processInput('View Menu');
    const menuState = agent.getCurrentState();
    expect(menuState.state).toBe('state:ShowMenu');
    
    // Verify the ShowMenu state has correct transitions
    const multiFlowMachine = coffeeShopMachine as any;
    const showMenuState = multiFlowMachine.flows.TopFlow.states.ShowMenu;
    expect(showMenuState.transitions).toBeDefined();
    expect(showMenuState.transitions.length).toBeGreaterThan(0);
  });

  test('should handle store hours inquiry', async () => {
    // Test "Store Hours" transition
    await agent.processInput('Store Hours');
    const infoState = agent.getCurrentState();
    expect(infoState.state).toBe('state:StoreInfo');
    
    // Verify the StoreInfo state has correct transitions
    const multiFlowMachine = coffeeShopMachine as any;
    const storeInfoState = multiFlowMachine.flows.TopFlow.states.StoreInfo;
    expect(storeInfoState.transitions).toBeDefined();
    expect(storeInfoState.transitions.length).toBeGreaterThan(0);
  });

  test('should identify flow invocation transitions', async () => {
    // The fixture has flow invocations for "Start Order" transitions in TopFlow
    const multiFlowMachine = coffeeShopMachine as any;
    const welcomeState = multiFlowMachine.flows.TopFlow.states.Welcome;
    const flowInvocationTransition = welcomeState.transitions.find((t: any) => 
      t.flowInvocation !== undefined
    );
    
    expect(flowInvocationTransition).toBeDefined();
    expect(flowInvocationTransition?.flowInvocation?.flowId).toBe('CreateOrder');
    expect(flowInvocationTransition?.pattern).toBe('Start Order');
  });

  test('should have proper flow termination handlers', async () => {
    // Check that flow invocations have proper result handlers
    const multiFlowMachine = coffeeShopMachine as any;
    const welcomeState = multiFlowMachine.flows.TopFlow.states.Welcome;
    const flowInvocationTransition = welcomeState.transitions.find((t: any) => 
      t.flowInvocation !== undefined
    );
    
    expect(flowInvocationTransition?.flowInvocation?.onResult).toBeDefined();
    expect(flowInvocationTransition?.flowInvocation?.onResult.end).toBeDefined();
    expect(flowInvocationTransition?.flowInvocation?.onResult.cancel).toBeDefined();
    expect(flowInvocationTransition?.flowInvocation?.onResult.error).toBeDefined();
  });

  test('should handle default patterns correctly', async () => {
    // Test :default pattern handling
    await agent.processInput('Unknown Command');
    const currentState = agent.getCurrentState();
    expect(currentState.state).toBe('state:Welcome'); // Should stay in Welcome due to :default
  });

  test('should handle context operations in flow results', async () => {
    // Check that flow invocation results have proper context operations
    const multiFlowMachine = coffeeShopMachine as any;
    const welcomeState = multiFlowMachine.flows.TopFlow.states.Welcome;
    const flowInvocationTransition = welcomeState.transitions.find((t: any) => 
      t.flowInvocation !== undefined
    );
    
    const endHandler = flowInvocationTransition?.flowInvocation?.onResult.end;
    expect(endHandler?.operations).toBeDefined();
    expect(endHandler?.operations?.[0]?.append).toBeDefined();
    expect(endHandler?.operations?.[0]?.append?.to).toBe('orders');
  });

  test('should validate complete machine structure', async () => {
    // Ensure the multi-flow machine has all required properties
    const multiFlowMachine = coffeeShopMachine as any;
    expect(multiFlowMachine.id).toBeDefined();
    expect(multiFlowMachine.initialFlow).toBe('TopFlow');
    expect(multiFlowMachine.flows).toBeDefined();
    expect(Object.keys(multiFlowMachine.flows)).toContain('TopFlow');
    expect(Object.keys(multiFlowMachine.flows)).toContain('CreateOrder');
    expect(Object.keys(multiFlowMachine.flows)).toContain('OrderCoffee');
    
    const topFlow = multiFlowMachine.flows.TopFlow;
    expect(Object.keys(topFlow.states)).toContain('Welcome');
    expect(Object.keys(topFlow.states)).toContain('ShowMenu');
    expect(Object.keys(topFlow.states)).toContain('StoreInfo');
    expect(Object.keys(topFlow.states)).toContain('ConfirmAllOrders');
  });
});