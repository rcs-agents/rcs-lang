/**
 * PROPOSAL: Sub-Flow Return Types with Aggregation Strategies
 * 
 * This implements support for:
 * 1. Sub-flows that collect data and return structured objects
 * 2. Different aggregation strategies (append, overwrite, merge)
 * 3. Scoped context that doesn't pollute parent flow
 * 4. Type-safe return value handling
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import type { MachineDefinitionJSON } from '../src/machine-definition.js';

// Extended transition interface supporting sub-flow calls
interface SubFlowTransition {
  target: string;
  
  // NEW: Sub-flow execution
  subFlow?: {
    /** ID of the sub-flow to execute */
    flowId: string;
    
    /** Variable name to store the return value */
    returnVar: string;
    
    /** How to handle the return value */
    aggregation: 'overwrite' | 'append' | 'merge';
    
    /** Optional initial parameters for the sub-flow */
    parameters?: Record<string, any>;
  };
  
  context?: Record<string, any>;
  condition?: string;
  priority?: number;
}

// Return type definitions for sub-flows
interface BeverageItem {
  size: string;
  drink: string;
  milk: string;
  price: number;
  extraCharge?: number;
}

interface Appointment {
  date: string;
  time: string;
  duration: number;
  type: string;
}

// Enhanced machine definition with return type
interface SubFlowMachineDefinition extends MachineDefinitionJSON {
  /** Return type configuration for this flow */
  returnType?: {
    /** TypeScript-like type name for documentation */
    type: string;
    
    /** Fields that should be included in the return object */
    fields: string[];
    
    /** Optional transformation logic for the return value */
    transform?: string; // JavaScript expression
  };
}

describe('Sub-Flow Return Types Proposal', () => {
  let beverageFlow: SubFlowMachineDefinition;
  let appointmentFlow: SubFlowMachineDefinition;
  let mainOrderFlow: SubFlowMachineDefinition;

  beforeEach(() => {
    // Sub-flow for collecting a single beverage
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
          extraCharge: context.extraCharge
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
            }
          ]
        },
        ChooseMilk: {
          transitions: [
            {
              pattern: 'Regular',
              target: '@return', // Special target to return from sub-flow
              context: { milk: 'regular' }
            },
            {
              pattern: 'Oat',
              target: '@return',
              context: { milk: 'oat', extraCharge: 0.60 }
            }
          ]
        }
      }
    };

    // Sub-flow for appointment booking (overwrite behavior)
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
              pattern: '#{availableDates[0]}',
              target: 'ChooseTime',
              context: { date: '#{availableDates[0]}' }
            }
          ]
        },
        ChooseTime: {
          transitions: [
            {
              pattern: '10:00 AM',
              target: '@return',
              context: { time: '10:00', duration: 60 }
            }
          ]
        }
      }
    };

    // Main flow that calls sub-flows
    mainOrderFlow = {
      id: 'MainOrderFlow',
      initial: 'Welcome',
      states: {
        Welcome: {
          transitions: [
            {
              pattern: 'Order Coffee',
              target: 'CollectBeverage'
            },
            {
              pattern: 'Book Appointment',
              target: 'CollectAppointment'
            },
            {
              pattern: 'Review Order',
              target: 'ShowOrder'
            }
          ]
        },
        CollectBeverage: {
          transitions: [
            {
              // This transition calls the beverage sub-flow
              target: 'ShowOrder',
              subFlow: {
                flowId: 'BeverageFlow',
                returnVar: 'orderItems',
                aggregation: 'append' // Add to array
              }
            } as SubFlowTransition
          ]
        },
        CollectAppointment: {
          transitions: [
            {
              target: 'ShowOrder',
              subFlow: {
                flowId: 'AppointmentFlow', 
                returnVar: 'appointment',
                aggregation: 'overwrite' // Replace existing value
              }
            } as SubFlowTransition
          ]
        },
        ShowOrder: {
          transitions: [
            {
              pattern: 'Add Another Item',
              target: 'CollectBeverage'
            },
            {
              pattern: 'Change Appointment',
              target: 'CollectAppointment'
            },
            {
              pattern: 'Confirm',
              target: 'OrderComplete'
            }
          ]
        },
        OrderComplete: {
          transitions: []
        }
      }
    };
  });

  test('should define beverage sub-flow with return type', () => {
    expect(beverageFlow.returnType?.type).toBe('BeverageItem');
    expect(beverageFlow.returnType?.fields).toContain('size');
    expect(beverageFlow.returnType?.fields).toContain('drink');
    expect(beverageFlow.returnType?.fields).toContain('price');
  });

  test('should support different aggregation strategies', () => {
    const appendTransition = mainOrderFlow.states.CollectBeverage.transitions[0] as SubFlowTransition;
    const overwriteTransition = mainOrderFlow.states.CollectAppointment.transitions[0] as SubFlowTransition;

    expect(appendTransition.subFlow?.aggregation).toBe('append');
    expect(overwriteTransition.subFlow?.aggregation).toBe('overwrite');
  });

  test('should handle multiple beverage orders with append strategy', () => {
    // Simulate multiple beverage collections
    const orderItems: BeverageItem[] = [];
    
    // First beverage
    const beverage1: BeverageItem = {
      size: 'large',
      drink: 'latte',
      milk: 'oat',
      price: 5.50,
      extraCharge: 0.60
    };
    
    // Append strategy - add to array
    orderItems.push(beverage1);
    
    // Second beverage
    const beverage2: BeverageItem = {
      size: 'medium',
      drink: 'americano', 
      milk: 'regular',
      price: 4.50
    };
    
    orderItems.push(beverage2);

    expect(orderItems).toHaveLength(2);
    expect(orderItems[0].drink).toBe('latte');
    expect(orderItems[1].drink).toBe('americano');
  });

  test('should handle appointment booking with overwrite strategy', () => {
    let appointment: Appointment | undefined;

    // First appointment selection
    appointment = {
      date: '2024-01-15',
      time: '10:00',
      duration: 60,
      type: 'consultation'
    };

    // User changes their mind - overwrite strategy
    appointment = {
      date: '2024-01-16', 
      time: '14:00',
      duration: 30,
      type: 'follow-up'
    };

    expect(appointment.date).toBe('2024-01-16');
    expect(appointment.time).toBe('14:00');
    expect(appointment.duration).toBe(30);
  });

  test('should support context isolation between sub-flows', () => {
    // Sub-flow context should not leak into parent
    const parentContext = { sessionId: '123', userType: 'premium' };
    const subFlowContext = { size: 'large', drink: 'latte', tempVar: 'should-not-leak' };
    
    // After sub-flow execution, only return value should be added to parent
    const finalContext = {
      ...parentContext,
      orderItems: [{ size: 'large', drink: 'latte', milk: 'regular', price: 5.50 }]
      // tempVar should NOT be here
    };

    expect(finalContext.sessionId).toBe('123');
    expect(finalContext.orderItems).toHaveLength(1);
    expect('tempVar' in finalContext).toBe(false);
  });
});

/**
 * PROPOSED RCL SYNTAX EXTENSIONS
 */

describe('RCL Syntax Extensions for Sub-Flows', () => {
  test('should support sub-flow declarations in RCL', () => {
    const rclSubFlowSyntax = `
      # Sub-flow definition with return type
      subflow BeverageFlow -> BeverageItem
        start: ChooseSize
        
        on ChooseSize
          match @reply.text
            "Small" -> ChooseDrink with size: "small", price: 3.50
            "Medium" -> ChooseDrink with size: "medium", price: 4.50
            
        on ChooseDrink  
          match @reply.text
            "Latte" -> ChooseMilk with drink: "latte"
            
        on ChooseMilk
          match @reply.text
            "Regular" -> return with milk: "regular"
            "Oat" -> return with milk: "oat", extraCharge: 0.60
      
      # Main flow calling sub-flows  
      flow MainFlow
        start: Welcome
        
        on Welcome
          match @reply.text
            "Order Coffee" -> call BeverageFlow append to orderItems then ShowOrder
            "Book Appointment" -> call AppointmentFlow overwrite appointment then ShowOrder
            
        on ShowOrder
          match @reply.text  
            "Add Another" -> call BeverageFlow append to orderItems then ShowOrder
            "Change Appointment" -> call AppointmentFlow overwrite appointment then ShowOrder
    `;

    // This shows how the syntax could look in RCL
    expect(rclSubFlowSyntax).toContain('subflow BeverageFlow -> BeverageItem');
    expect(rclSubFlowSyntax).toContain('call BeverageFlow append to orderItems');
    expect(rclSubFlowSyntax).toContain('call AppointmentFlow overwrite appointment');
  });
});

/**
 * PROPOSED IMPLEMENTATION EXTENSIONS
 */

interface SubFlowManager {
  /** Execute a sub-flow and return the result */
  executeSubFlow(
    flowId: string,
    parameters: Record<string, any>,
    returnFields: string[]
  ): Promise<any>;
  
  /** Apply aggregation strategy to context variable */
  applyAggregation(
    context: Record<string, any>,
    variable: string,
    value: any,
    strategy: 'append' | 'overwrite' | 'merge'
  ): void;
}

describe('Sub-Flow Manager Implementation', () => {
  test('should implement aggregation strategies', () => {
    const context = { orderItems: [] as BeverageItem[] };
    
    const manager: SubFlowManager = {
      async executeSubFlow(flowId, parameters, returnFields) {
        // Mock execution returning a beverage item
        return {
          size: 'large',
          drink: 'latte', 
          milk: 'oat',
          price: 6.10
        };
      },
      
      applyAggregation(ctx, variable, value, strategy) {
        switch (strategy) {
          case 'append':
            if (!Array.isArray(ctx[variable])) {
              ctx[variable] = [];
            }
            ctx[variable].push(value);
            break;
            
          case 'overwrite':
            ctx[variable] = value;
            break;
            
          case 'merge':
            if (typeof ctx[variable] === 'object' && typeof value === 'object') {
              ctx[variable] = { ...ctx[variable], ...value };
            } else {
              ctx[variable] = value;
            }
            break;
        }
      }
    };

    // Test append strategy
    const beverage1 = { size: 'large', drink: 'latte', milk: 'oat', price: 6.10 };
    manager.applyAggregation(context, 'orderItems', beverage1, 'append');
    
    const beverage2 = { size: 'medium', drink: 'americano', milk: 'regular', price: 4.50 };
    manager.applyAggregation(context, 'orderItems', beverage2, 'append');

    expect(context.orderItems).toHaveLength(2);
    expect(context.orderItems[0].drink).toBe('latte');
    expect(context.orderItems[1].drink).toBe('americano');
  });
});