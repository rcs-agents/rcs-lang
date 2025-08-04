/**
 * @module subflow-manager
 * Implementation of sub-flow execution with return types and aggregation strategies.
 */

import { ConversationalAgent } from './conversational-agent.js';
import type {
  MachineDefinition,
  FlowDefinition,
  Context,
  StateChangeEvent,
  TransitionTarget,
} from './unified-types.js';

/**
 * Configuration for sub-flow execution.
 */
export interface SubFlowCall {
  /** ID of the sub-flow to execute */
  flowId: string;
  
  /** Variable name to store the return value */
  returnVar: string;
  
  /** How to handle the return value */
  aggregation: 'append' | 'overwrite' | 'merge';
  
  /** Optional initial parameters for the sub-flow */
  parameters?: Record<string, any>;
}

/**
 * Return type configuration for sub-flows.
 */
export interface SubFlowReturnType {
  /** TypeScript-like type name for documentation */
  type: string;
  
  /** Fields that should be included in the return object */
  fields: string[];
  
  /** Optional transformation logic for the return value */
  transform?: string; // JavaScript expression
}

/**
 * Enhanced machine definition supporting sub-flow returns.
 */
export interface SubFlowMachineDefinition extends FlowDefinition {
  /** Return type configuration for this flow */
  returnType?: SubFlowReturnType;
}

/**
 * Enhanced transition supporting sub-flow calls.
 */
export interface SubFlowTransition {
  pattern?: string;
  target: string;
  context?: Record<string, any>;
  condition?: string;
  priority?: number;
  
  /** Sub-flow execution configuration */
  subFlow?: SubFlowCall;
}

/**
 * Result of sub-flow execution.
 */
export interface SubFlowResult {
  /** Whether the sub-flow completed successfully */
  completed: boolean;
  
  /** Return value from the sub-flow */
  returnValue?: any;
  
  /** Error message if execution failed */
  error?: string;
  
  /** Final state of the sub-flow */
  finalState?: string;
}

/**
 * Manager for executing sub-flows and handling return values.
 */
export class SubFlowManager {
  private agent: ConversationalAgent;
  private subFlowDefinitions = new Map<string, SubFlowMachineDefinition>();

  constructor(agent: ConversationalAgent) {
    this.agent = agent;
  }

  /**
   * Registers a sub-flow definition.
   */
  registerSubFlow(definition: SubFlowMachineDefinition): void {
    this.subFlowDefinitions.set(definition.id, definition);
  }

  /**
   * Executes a sub-flow and returns the result.
   */
  async executeSubFlow(call: SubFlowCall): Promise<SubFlowResult> {
    const definition = this.subFlowDefinitions.get(call.flowId);
    if (!definition) {
      return {
        completed: false,
        error: `Sub-flow '${call.flowId}' not found`
      };
    }

    try {
      // Create a new agent instance for the sub-flow with isolated context
      const subFlowAgent = new ConversationalAgent({
        id: `${this.agent.id}-subflow-${call.flowId}`,
        onStateChange: () => {}, // Sub-flow state changes don't need external handling
        initialContext: call.parameters || {}
      });

      // Add the sub-flow definition
      subFlowAgent.addFlow(definition);

      // Execute the sub-flow (this would need to be implemented based on your execution model)
      // For now, we'll simulate execution and return a mock result
      const mockReturnValue = this.simulateSubFlowExecution(definition, call.parameters || {});

      return {
        completed: true,
        returnValue: mockReturnValue,
        finalState: 'completed'
      };
    } catch (error) {
      return {
        completed: false,
        error: `Sub-flow execution failed: ${error}`
      };
    }
  }

  /**
   * Applies aggregation strategy to update context variable.
   */
  applyAggregation(
    context: Context,
    variable: string,
    value: any,
    strategy: 'append' | 'overwrite' | 'merge'
  ): void {
    switch (strategy) {
      case 'append':
        if (!Array.isArray(context[variable])) {
          context[variable] = [];
        }
        (context[variable] as any[]).push(value);
        break;

      case 'overwrite':
        context[variable] = value;
        break;

      case 'merge':
        if (
          typeof context[variable] === 'object' &&
          context[variable] !== null &&
          typeof value === 'object' &&
          value !== null
        ) {
          context[variable] = { ...context[variable], ...value };
        } else {
          context[variable] = value;
        }
        break;

      default:
        throw new Error(`Unknown aggregation strategy: ${strategy}`);
    }
  }

  /**
   * Transforms sub-flow context into return value based on return type definition.
   */
  createReturnValue(
    definition: SubFlowMachineDefinition,
    context: Context
  ): any {
    const returnType = definition.returnType;
    if (!returnType) {
      return context; // Return entire context if no return type defined
    }

    // Extract specified fields
    const returnValue: Record<string, any> = {};
    for (const field of returnType.fields) {
      if (field in context) {
        returnValue[field] = context[field];
      }
    }

    // Apply transformation if specified
    if (returnType.transform) {
      try {
        const transformFn = new Function('context', `return ${returnType.transform}`);
        return transformFn(context);
      } catch (error) {
        console.error(`Error in return value transformation: ${error}`);
        return returnValue; // Fall back to field extraction
      }
    }

    return returnValue;
  }

  /**
   * Converts TransitionTarget to string safely.
   */
  private targetToString(target: TransitionTarget): string {
    if (typeof target === 'string') {
      return target;
    }
    
    if (target.type === 'state') {
      return target.stateId;
    }
    
    if (target.type === 'flow') {
      return `flow:${target.flowId}`;
    }
    
    if (target.type === 'terminal') {
      return `:${target.reason || 'end'}`;
    }
    
    return 'unknown';
  }

  /**
   * Checks if a target is a sub-flow call.
   */
  isSubFlowCall(target: TransitionTarget): boolean {
    const targetString = this.targetToString(target);
    return targetString.startsWith('call:');
  }

  /**
   * Parses sub-flow call from target string.
   */
  parseSubFlowCall(target: TransitionTarget): SubFlowCall | null {
    const targetString = this.targetToString(target);
    // Example format: "call:BeverageFlow:append:orderItems"
    const parts = targetString.split(':');
    if (parts.length !== 4 || parts[0] !== 'call') {
      return null;
    }

    const [, flowId, aggregation, returnVar] = parts;
    
    if (!['append', 'overwrite', 'merge'].includes(aggregation)) {
      return null;
    }

    return {
      flowId,
      returnVar,
      aggregation: aggregation as 'append' | 'overwrite' | 'merge'
    };
  }

  /**
   * Simulates sub-flow execution for testing purposes.
   * In real implementation, this would execute the actual sub-flow.
   */
  private simulateSubFlowExecution(
    definition: SubFlowMachineDefinition,
    parameters: Context
  ): any {
    // Mock execution based on flow type
    if (definition.id === 'BeverageFlow') {
      return {
        size: parameters.size || 'medium',
        drink: parameters.drink || 'latte',
        milk: parameters.milk || 'regular',
        price: parameters.price || 4.50,
        extraCharge: parameters.extraCharge || 0
      };
    }

    if (definition.id === 'AppointmentFlow') {
      return {
        date: parameters.date || '2024-01-15',
        time: parameters.time || '10:00',
        duration: parameters.duration || 60,
        type: parameters.type || 'consultation'
      };
    }

    // Default: return the parameters as-is
    return parameters;
  }
}

/**
 * Enhanced agent that supports sub-flow execution.
 */
export class SubFlowCapableAgent {
  private agent: ConversationalAgent;
  private subFlowManager: SubFlowManager;

  constructor(agent: ConversationalAgent) {
    this.agent = agent;
    this.subFlowManager = new SubFlowManager(agent);
  }

  /**
   * Adds a sub-flow definition.
   */
  addSubFlow(definition: SubFlowMachineDefinition): void {
    this.subFlowManager.registerSubFlow(definition);
  }

  /**
   * Processes input with sub-flow support.
   */
  async processInput(input: string): Promise<any> {
    // First, try normal processing
    const result = await this.agent.processInput(input);

    // Check if the transition target is a sub-flow call
    if (result.transition && this.subFlowManager.isSubFlowCall(result.transition.target)) {
      const subFlowCall = this.subFlowManager.parseSubFlowCall(result.transition.target);
      if (subFlowCall) {
        // Execute the sub-flow
        const subFlowResult = await this.subFlowManager.executeSubFlow(subFlowCall);
        
        if (subFlowResult.completed && subFlowResult.returnValue) {
          // Apply the return value to context using aggregation strategy
          const context = this.agent.getContext();
          this.subFlowManager.applyAggregation(
            context,
            subFlowCall.returnVar,
            subFlowResult.returnValue,
            subFlowCall.aggregation
          );
          
          // Update agent context
          this.agent.updateContext(context);
        }
      }
    }

    return result;
  }

  /**
   * Gets the underlying agent.
   */
  getAgent(): ConversationalAgent {
    return this.agent;
  }

  /**
   * Gets the sub-flow manager.
   */
  getSubFlowManager(): SubFlowManager {
    return this.subFlowManager;
  }
}