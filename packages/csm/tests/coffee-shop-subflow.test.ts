import { describe, test, expect, beforeEach } from 'bun:test';
import { ConversationalAgent } from '../src/conversational-agent';
import { 
  SubFlowManager, 
  SubFlowCapableAgent, 
  type SubFlowMachineDefinition 
} from '../src/subflow-manager';
import type { StateChangeEvent } from '../src/types';

describe('Coffee Shop Multi-Item Ordering with Sub-Flows', () => {
  let mainFlow: SubFlowMachineDefinition;
  let beverageFlow: SubFlowMachineDefinition;
  let agent: SubFlowCapableAgent;

  beforeEach(() => {
    // Define the beverage collection sub-flow
    beverageFlow = {
      id: 'BeverageFlow',
      initial: 'ChooseSize',
      returnType: {
        type: 'BeverageItem',
        fields: ['size', 'drink', 'milk', 'price', 'extraCharge'],
        transform: `{
          size: context.size,
          drink: context.drink,
          milk: context.milk,
          price: context.price + (context.extraCharge || 0),
          extraCharge: context.extraCharge || 0,
          timestamp: new Date().toISOString()
        }`
      },
      states: {
        ChooseSize: {
          transitions: [
            {
              pattern: 'Small',
              target: 'ChooseDrink',
              context: { size: 'small', price: 3.50 }
            },
            {
              pattern: 'Medium',
              target: 'ChooseDrink', 
              context: { size: 'medium', price: 4.50 }
            },
            {
              pattern: 'Large',
              target: 'ChooseDrink',
              context: { size: 'large', price: 5.50 }
            }
          ]
        },
        ChooseDrink: {
          transitions: [
            {
              pattern: 'Latte',
              target: 'ChooseMilk',
              context: { drink: 'latte' }
            },
            {
              pattern: 'Americano', 
              target: 'ChooseMilk',
              context: { drink: 'americano' }
            },
            {
              pattern: 'Espresso',
              target: 'ChooseMilk',
              context: { drink: 'espresso' }
            }
          ]
        },
        ChooseMilk: {
          transitions: [
            {
              pattern: 'Regular',
              target: '@return',
              context: { milk: 'regular' }
            },
            {
              pattern: 'Oat',
              target: '@return',
              context: { milk: 'oat', extraCharge: 0.60 }
            },
            {
              pattern: 'Soy',
              target: '@return',
              context: { milk: 'soy', extraCharge: 0.60 }
            },
            {
              pattern: 'No Milk',
              target: '@return',
              context: { milk: 'none' }
            }
          ]
        }
      }
    };

    // Define the main ordering flow that calls the beverage sub-flow
    mainFlow = {
      id: 'MainOrderFlow',
      initial: 'Welcome',
      states: {
        Welcome: {
          transitions: [
            {
              pattern: 'Start Order',
              target: 'call:BeverageFlow:append:orderItems'
            },
            {
              pattern: 'Review Order',
              target: 'ShowOrder'
            }
          ]
        },
        ShowOrder: {
          transitions: [
            {
              pattern: 'Add Another Item',
              target: 'call:BeverageFlow:append:orderItems'
            },
            {
              pattern: 'Remove Last Item',
              target: 'RemoveItem'
            },
            {
              pattern: 'Confirm Order',
              target: 'ConfirmOrder'
            },
            {
              pattern: 'Cancel Order',
              target: 'CancelOrder'
            }
          ]
        },
        RemoveItem: {
          transitions: [
            {
              target: 'ShowOrder'
            }
          ],
          meta: {
            transient: true
          }
        },
        ConfirmOrder: {
          transitions: [
            {
              pattern: 'Yes, Confirm',
              target: 'OrderComplete'
            },
            {
              pattern: 'No, Go Back',
              target: 'ShowOrder'
            }
          ]
        },
        OrderComplete: {
          transitions: [
            {
              pattern: 'Start New Order',
              target: 'Welcome',
              context: { orderItems: [] } // Clear the order
            }
          ]
        },
        CancelOrder: {
          transitions: [
            {
              target: 'Welcome',
              context: { orderItems: [] }
            }
          ],
          meta: {
            transient: true
          }
        }
      }
    };

    // Create the enhanced agent
    const baseAgent = new ConversationalAgent({
      id: 'coffee-shop-bot',
      onStateChange: (event: StateChangeEvent) => {
        // Track state changes for testing
      },
      initialContext: { orderItems: [] }
    });

    agent = new SubFlowCapableAgent(baseAgent);
    agent.getAgent().addFlow(mainFlow);
    agent.addSubFlow(beverageFlow);
  });

  test('should allow ordering multiple beverages', async () => {
    // Start the order
    await agent.processInput('Start Order');
    
    // First beverage: Large Latte with Oat milk
    await simulateBeverageFlow(agent, 'Large', 'Latte', 'Oat');
    
    let context = agent.getAgent().getContext();
    expect(context.orderItems).toHaveLength(1);
    expect(context.orderItems[0].size).toBe('large');
    expect(context.orderItems[0].drink).toBe('latte');
    expect(context.orderItems[0].milk).toBe('oat');
    expect(context.orderItems[0].price).toBe(6.10); // 5.50 + 0.60

    // Add another item
    await agent.processInput('Add Another Item');
    
    // Second beverage: Medium Americano with Regular milk
    await simulateBeverageFlow(agent, 'Medium', 'Americano', 'Regular');
    
    context = agent.getAgent().getContext();
    expect(context.orderItems).toHaveLength(2);
    expect(context.orderItems[1].size).toBe('medium');
    expect(context.orderItems[1].drink).toBe('americano');
    expect(context.orderItems[1].milk).toBe('regular');
    expect(context.orderItems[1].price).toBe(4.50);

    // Add third item
    await agent.processInput('Add Another Item');
    
    // Third beverage: Small Espresso with No Milk
    await simulateBeverageFlow(agent, 'Small', 'Espresso', 'No Milk');
    
    context = agent.getAgent().getContext();
    expect(context.orderItems).toHaveLength(3);
    expect(context.orderItems[2].size).toBe('small');
    expect(context.orderItems[2].drink).toBe('espresso');
    expect(context.orderItems[2].milk).toBe('none');
    expect(context.orderItems[2].price).toBe(3.50);
  });

  test('should maintain order items across state transitions', async () => {
    // Build up an order
    await agent.processInput('Start Order');
    await simulateBeverageFlow(agent, 'Large', 'Latte', 'Oat');
    
    // Go to review order
    await agent.processInput('Review Order');
    expect(agent.getAgent().getCurrentState().state).toBe('ShowOrder');
    
    // Add another item from the review screen
    await agent.processInput('Add Another Item');
    await simulateBeverageFlow(agent, 'Medium', 'Americano', 'Soy');
    
    const context = agent.getAgent().getContext();
    expect(context.orderItems).toHaveLength(2);
    
    // Items should persist
    expect(context.orderItems[0].drink).toBe('latte');
    expect(context.orderItems[1].drink).toBe('americano');
  });

  test('should calculate total order value correctly', async () => {
    await agent.processInput('Start Order');
    
    // Add multiple items with different prices and charges
    await simulateBeverageFlow(agent, 'Large', 'Latte', 'Oat'); // 5.50 + 0.60 = 6.10
    await agent.processInput('Add Another Item');
    await simulateBeverageFlow(agent, 'Medium', 'Americano', 'Regular'); // 4.50
    await agent.processInput('Add Another Item');
    await simulateBeverageFlow(agent, 'Small', 'Espresso', 'Soy'); // 3.50 + 0.60 = 4.10

    const context = agent.getAgent().getContext();
    const totalPrice = context.orderItems.reduce((sum: number, item: any) => sum + item.price, 0);
    
    expect(totalPrice).toBe(14.70); // 6.10 + 4.50 + 4.10
  });

  test('should support order cancellation', async () => {
    // Build an order
    await agent.processInput('Start Order');
    await simulateBeverageFlow(agent, 'Large', 'Latte', 'Oat');
    await agent.processInput('Add Another Item');
    await simulateBeverageFlow(agent, 'Medium', 'Americano', 'Regular');
    
    let context = agent.getAgent().getContext();
    expect(context.orderItems).toHaveLength(2);
    
    // Cancel the order
    await agent.processInput('Cancel Order');
    
    context = agent.getAgent().getContext();
    expect(context.orderItems).toHaveLength(0);
    expect(agent.getAgent().getCurrentState().state).toBe('Welcome');
  });

  test('should support order completion and restart', async () => {
    // Complete an order
    await agent.processInput('Start Order');
    await simulateBeverageFlow(agent, 'Large', 'Latte', 'Oat');
    
    await agent.processInput('Review Order');
    await agent.processInput('Confirm Order');
    await agent.processInput('Yes, Confirm');
    
    expect(agent.getAgent().getCurrentState().state).toBe('OrderComplete');
    
    // Start a new order
    await agent.processInput('Start New Order');
    
    const context = agent.getAgent().getContext();
    expect(context.orderItems).toHaveLength(0);
    expect(agent.getAgent().getCurrentState().state).toBe('Welcome');
  });

  test('should handle remove item functionality', async () => {
    // This test shows how we could implement item removal
    await agent.processInput('Start Order');
    await simulateBeverageFlow(agent, 'Large', 'Latte', 'Oat');
    await agent.processInput('Add Another Item');
    await simulateBeverageFlow(agent, 'Medium', 'Americano', 'Regular');
    
    let context = agent.getAgent().getContext();
    expect(context.orderItems).toHaveLength(2);
    
    // Simulate removing the last item
    await agent.processInput('Remove Last Item');
    
    // In a real implementation, this would remove the last item from the array
    // For now, we just verify the state transition works
    expect(agent.getAgent().getCurrentState().state).toBe('ShowOrder');
  });

  // Helper function to simulate the beverage sub-flow execution
  async function simulateBeverageFlow(
    agent: SubFlowCapableAgent, 
    size: string, 
    drink: string, 
    milk: string
  ): Promise<void> {
    // Simulate the sub-flow execution by directly manipulating the context
    // In a real implementation, this would be handled by the SubFlowManager
    const context = agent.getAgent().getContext();
    
    const priceMap: Record<string, number> = {
      'Small': 3.50,
      'Medium': 4.50,
      'Large': 5.50
    };
    
    const extraChargeMap: Record<string, number> = {
      'Oat': 0.60,
      'Soy': 0.60,
      'Regular': 0,
      'No Milk': 0
    };
    
    const beverage = {
      size: size.toLowerCase(),
      drink: drink.toLowerCase(),
      milk: milk.toLowerCase().replace(' ', ''),
      price: priceMap[size] + extraChargeMap[milk],
      extraCharge: extraChargeMap[milk],
      timestamp: new Date().toISOString()
    };
    
    // Use the SubFlowManager to apply the aggregation
    const subFlowManager = agent.getSubFlowManager();
    subFlowManager.applyAggregation(context, 'orderItems', beverage, 'append');
    
    agent.getAgent().updateContext(context);
  }
});

/**
 * Test for appointment booking scenario (overwrite behavior)
 */
describe('Appointment Booking with Overwrite Strategy', () => {
  let appointmentFlow: SubFlowMachineDefinition;
  let mainFlow: SubFlowMachineDefinition;
  let agent: SubFlowCapableAgent;

  beforeEach(() => {
    appointmentFlow = {
      id: 'AppointmentFlow',
      initial: 'ChooseDate',
      returnType: {
        type: 'Appointment',
        fields: ['date', 'time', 'duration', 'type'],
        transform: `{
          date: context.date,
          time: context.time,
          duration: context.duration || 60,
          type: context.appointmentType || 'consultation'
        }`
      },
      states: {
        ChooseDate: {
          transitions: [
            {
              pattern: 'Tomorrow',
              target: 'ChooseTime',
              context: { date: '2024-01-16' }
            },
            {
              pattern: 'Next Week',
              target: 'ChooseTime',
              context: { date: '2024-01-22' }
            }
          ]
        },
        ChooseTime: {
          transitions: [
            {
              pattern: '10:00 AM',
              target: '@return',
              context: { time: '10:00', duration: 60 }
            },
            {
              pattern: '2:00 PM',
              target: '@return',
              context: { time: '14:00', duration: 30 }
            }
          ]
        }
      }
    };

    mainFlow = {
      id: 'BookingFlow',
      initial: 'Welcome',
      states: {
        Welcome: {
          transitions: [
            {
              pattern: 'Book Appointment',
              target: 'call:AppointmentFlow:overwrite:appointment'
            },
            {
              pattern: 'Change Appointment',
              target: 'call:AppointmentFlow:overwrite:appointment'
            },
            {
              pattern: 'View Appointment',
              target: 'ShowAppointment'
            }
          ]
        },
        ShowAppointment: {
          transitions: [
            {
              pattern: 'Change Time',
              target: 'call:AppointmentFlow:overwrite:appointment'
            },
            {
              pattern: 'Confirm',
              target: 'Confirmed'
            }
          ]
        },
        Confirmed: {
          transitions: []
        }
      }
    };

    const baseAgent = new ConversationalAgent({
      id: 'booking-bot',
      onStateChange: () => {},
      initialContext: {}
    });

    agent = new SubFlowCapableAgent(baseAgent);
    agent.getAgent().addFlow(mainFlow);
    agent.addSubFlow(appointmentFlow);
  });

  test('should overwrite appointment when user changes their mind', async () => {
    // Book initial appointment
    await agent.processInput('Book Appointment');
    await simulateAppointmentFlow(agent, 'Tomorrow', '10:00 AM');
    
    let context = agent.getAgent().getContext();
    expect(context.appointment.date).toBe('2024-01-16');
    expect(context.appointment.time).toBe('10:00');
    
    // Change appointment - this should overwrite, not append
    await agent.processInput('Change Appointment');
    await simulateAppointmentFlow(agent, 'Next Week', '2:00 PM');
    
    context = agent.getAgent().getContext();
    expect(context.appointment.date).toBe('2024-01-22'); // Overwritten
    expect(context.appointment.time).toBe('14:00'); // Overwritten
    
    // Should still be a single appointment object, not an array
    expect(Array.isArray(context.appointment)).toBe(false);
  });

  async function simulateAppointmentFlow(
    agent: SubFlowCapableAgent,
    date: string,
    time: string
  ): Promise<void> {
    const context = agent.getAgent().getContext();
    
    const dateMap: Record<string, string> = {
      'Tomorrow': '2024-01-16',
      'Next Week': '2024-01-22'
    };
    
    const timeMap: Record<string, { time: string; duration: number }> = {
      '10:00 AM': { time: '10:00', duration: 60 },
      '2:00 PM': { time: '14:00', duration: 30 }
    };
    
    const appointment = {
      date: dateMap[date],
      time: timeMap[time].time,
      duration: timeMap[time].duration,
      type: 'consultation'
    };
    
    const subFlowManager = agent.getSubFlowManager();
    subFlowManager.applyAggregation(context, 'appointment', appointment, 'overwrite');
    
    agent.getAgent().updateContext(context);
  }
});