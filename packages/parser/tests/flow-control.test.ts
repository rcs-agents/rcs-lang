import { describe, test, expect } from 'bun:test';
import { parseRcl } from '../src/index';
import type { FlowInvocation, FlowTermination, Section, SimpleTransition } from '@rcs-lang/ast';

describe('Flow Control Parsing', () => {
  test('should parse basic flow invocation', () => {
    const source = `
flow TestFlow
  on Welcome
    match @reply.text
      "Start Order" -> start CreateOrder
`;

    const result = parseRcl(source);
    expect(result.success).toBe(true);
    
    if (result.success) {
      const flow = result.ast.sections[0] as Section;
      const welcomeState = flow.body.find(s => s.type === 'Section' && s.identifier?.value === 'Welcome') as Section;
      const matchBlock = welcomeState.body.find(b => b.type === 'MatchBlock');
      
      expect(matchBlock).toBeDefined();
      if (matchBlock && matchBlock.type === 'MatchBlock') {
        const flowInvocationCase = matchBlock.cases[0];
        expect(flowInvocationCase.consequence.type).toBe('FlowInvocation');
        
        const flowInvocation = flowInvocationCase.consequence as FlowInvocation;
        expect(flowInvocation.flowName.value).toBe('CreateOrder');
        expect(flowInvocation.resultHandlers).toHaveLength(0); // Basic invocation has no handlers
        expect(flowInvocation.parameters).toBeUndefined(); // No parameters
      }
    }
  });

  test('should parse flow invocation with parameters', () => {
    const source = `
flow TestFlow
  on Welcome
    match @reply.text
      "Order Coffee" -> start OrderCoffee with size: "large", drink: "latte"
        on :end -> ProcessOrder
`;

    const result = parseRcl(source);
    expect(result.success).toBe(true);
    
    if (result.success) {
      const flow = result.ast.sections[0] as Section;
      const welcomeState = flow.body.find(s => s.type === 'Section' && s.identifier?.value === 'Welcome') as Section;
      const matchBlock = welcomeState.body.find(b => b.type === 'MatchBlock');
      
      if (matchBlock && matchBlock.type === 'MatchBlock') {
        const flowInvocation = matchBlock.cases[0].consequence as FlowInvocation;
        expect(flowInvocation.parameters).toHaveLength(2);
        expect(flowInvocation.parameters?.[0].key).toBe('size');
        expect(flowInvocation.parameters?.[1].key).toBe('drink');
      }
    }
  });

  test('should parse context operations', () => {
    const source = `
flow TestFlow
  on Welcome
    match @reply.text
      "Start Order" -> start CreateOrder
        on :end -> append result to @orders -> ConfirmOrders
        on :cancel -> set @cancelled to True -> Welcome
        on :error -> merge result into @errorLog -> ErrorHandler
`;

    const result = parseRcl(source);
    expect(result.success).toBe(true);
    
    if (result.success) {
      const flow = result.ast.sections[0] as Section;
      const welcomeState = flow.body.find(s => s.type === 'Section' && s.identifier?.value === 'Welcome') as Section;
      const matchBlock = welcomeState.body.find(b => b.type === 'MatchBlock');
      
      if (matchBlock && matchBlock.type === 'MatchBlock') {
        const flowInvocation = matchBlock.cases[0].consequence as FlowInvocation;
        
        const endHandler = flowInvocation.resultHandlers.find(h => h.result === 'end');
        expect(endHandler?.operations).toHaveLength(1);
        expect(endHandler?.operations?.[0].type).toBe('AppendOperation');
        
        const cancelHandler = flowInvocation.resultHandlers.find(h => h.result === 'cancel');
        expect(cancelHandler?.operations).toHaveLength(1);
        expect(cancelHandler?.operations?.[0].type).toBe('SetOperation');
        
        const errorHandler = flowInvocation.resultHandlers.find(h => h.result === 'error');
        expect(errorHandler?.operations).toHaveLength(1);
        expect(errorHandler?.operations?.[0].type).toBe('MergeOperation');
      }
    }
  });

  test('should parse flow termination', () => {
    const source = `
flow TestFlow
  on ProcessPayment
    -> :end
  on OrderError
    match @reply.text
      "Retry" -> Welcome
      "Cancel" -> :cancel
`;

    const result = parseRcl(source);
    expect(result.success).toBe(true);
    
    if (result.success) {
      const flow = result.ast.sections[0] as Section;
      
      // Test simple transition to flow termination
      const processPaymentState = flow.body.find(s => s.type === 'Section' && s.identifier?.value === 'ProcessPayment') as Section;
      const simpleTransition = processPaymentState.body.find(b => b.type === 'SimpleTransition') as SimpleTransition;
      expect(simpleTransition.target.type).toBe('FlowTermination');
      expect((simpleTransition.target as FlowTermination).result).toBe('end');
      
      // Test match case with flow termination
      const orderErrorState = flow.body.find(s => s.type === 'Section' && s.identifier?.value === 'OrderError') as Section;
      const matchBlock = orderErrorState.body.find(b => b.type === 'MatchBlock');
      if (matchBlock && matchBlock.type === 'MatchBlock') {
        const cancelCase = matchBlock.cases.find(c => 
          c.value.type === 'StringLiteral' && c.value.value === 'Cancel'
        );
        expect(cancelCase?.consequence.type).toBe('FlowTermination');
        expect((cancelCase?.consequence as FlowTermination).result).toBe('cancel');
      }
    }
  });

  test('should parse complete coffee shop flow control example', () => {
    const source = `
flow TopFlow
  start: Welcome

  on Welcome
    match @reply.text
      "Start Order" -> start CreateOrder
        on :end -> append result to @orders -> ConfirmAllOrders
        on :cancel -> Welcome
        on :error -> OrderError
      "View Menu" -> ShowMenu
      :default -> Welcome

  on ConfirmAllOrders
    match @reply.text
      "Confirm All Orders" -> ProcessPayment
      "Cancel All Orders" -> set @orders to [] -> Welcome

  on ProcessPayment
    -> :end
`;

    const result = parseRcl(source);
    expect(result.success).toBe(true);
    
    if (result.success) {
      const flow = result.ast.sections[0] as Section;
      expect(flow.sectionType).toBe('flow');
      expect(flow.identifier?.value).toBe('TopFlow');
      
      // Check that we have the start attribute
      const startAttribute = flow.body.find(b => b.type === 'Attribute' && b.key === 'start');
      expect(startAttribute).toBeDefined();
      
      // Check that we have all the expected states
      const states = flow.body.filter(b => b.type === 'Section');
      expect(states).toHaveLength(3); // Welcome, ConfirmAllOrders, ProcessPayment
      
      // Verify flow invocation structure
      const welcomeState = flow.body.find(s => s.type === 'Section' && s.identifier?.value === 'Welcome') as Section;
      const matchBlock = welcomeState.body.find(b => b.type === 'MatchBlock');
      
      if (matchBlock && matchBlock.type === 'MatchBlock') {
        const startOrderCase = matchBlock.cases.find(c => 
          c.value.type === 'StringLiteral' && c.value.value === 'Start Order'
        );
        expect(startOrderCase?.consequence.type).toBe('FlowInvocation');
        
        const flowInvocation = startOrderCase?.consequence as FlowInvocation;
        expect(flowInvocation.flowName.value).toBe('CreateOrder');
        expect(flowInvocation.resultHandlers).toHaveLength(3);
      }
    }
  });
});