import { describe, test, expect } from 'bun:test';

/**
 * PROPOSAL: Nested Context Handling for CSM
 * 
 * Problem: RCL supports nested scoping and variable shadowing, but CSM uses flat context.
 * 
 * Solution: Implement a scoped context system that maintains:
 * 1. Global conversation context (persists across machines/flows)
 * 2. Machine-local context (scoped to individual flow)  
 * 3. State-local context (temporary, for single state)
 * 4. Variable resolution with proper shadowing (state -> machine -> global)
 */

interface ScopedContext {
  /** Conversation-level context - persists for entire agent relationship */
  conversation: Record<string, any>;
  
  /** Flow-scoped context - isolated per individual flow execution */
  flow: Record<string, any>;
  
  /** Parameter context - temporary variables for current state/transition */
  params: Record<string, any>;
}

class ContextManager {
  private scoped: ScopedContext;

  constructor(initialGlobal: Record<string, any> = {}) {
    this.scoped = {
      global: { ...initialGlobal },
      machine: {},
      state: {}
    };
  }

  /**
   * Resolves a variable with proper scoping (state -> machine -> global)
   */
  get(key: string): any {
    if (key in this.scoped.state) return this.scoped.state[key];
    if (key in this.scoped.machine) return this.scoped.machine[key];
    if (key in this.scoped.global) return this.scoped.global[key];
    return undefined;
  }

  /**
   * Sets a variable in the appropriate scope
   */
  set(key: string, value: any, scope: 'global' | 'machine' | 'state' = 'global'): void {
    this.scoped[scope][key] = value;
  }

  /**
   * Updates multiple variables from transition context
   */
  update(updates: Record<string, any>, scope: 'global' | 'machine' | 'state' = 'global'): void {
    Object.assign(this.scoped[scope], updates);
  }

  /**
   * Clears state-scoped variables (called on state exit)
   */
  clearStateScope(): void {
    this.scoped.state = {};
  }

  /**
   * Clears machine-scoped variables (called on machine exit)
   */
  clearMachineScope(): void {
    this.scoped.machine = {};
  }

  /**
   * Gets flattened context for backward compatibility
   */
  getFlattened(): Record<string, any> {
    return {
      ...this.scoped.global,
      ...this.scoped.machine,
      ...this.scoped.state
    };
  }

  /**
   * Serializes only the persistent context (global + machine)
   */
  serialize(): { global: Record<string, any>; machine: Record<string, any> } {
    return {
      global: { ...this.scoped.global },
      machine: { ...this.scoped.machine }
    };
  }

  /**
   * Restores context from serialized state
   */
  static deserialize(data: { global: Record<string, any>; machine: Record<string, any> }): ContextManager {
    const manager = new ContextManager(data.global);
    manager.scoped.machine = { ...data.machine };
    return manager;
  }
}

describe('Nested Context Handling Proposal', () => {
  test('should resolve variables with proper scoping precedence', () => {
    const ctx = new ContextManager({ globalVar: 'global' });
    
    ctx.set('sharedVar', 'global', 'global');
    ctx.set('sharedVar', 'machine', 'machine');
    ctx.set('sharedVar', 'state', 'state');
    
    // State scope should take precedence
    expect(ctx.get('sharedVar')).toBe('state');
    expect(ctx.get('globalVar')).toBe('global');
  });

  test('should handle variable shadowing correctly', () => {
    const ctx = new ContextManager({ size: 'default' });
    
    // Machine scope shadows global
    ctx.set('size', 'large', 'machine');
    expect(ctx.get('size')).toBe('large');
    
    // State scope shadows machine
    ctx.set('size', 'extra-large', 'state');
    expect(ctx.get('size')).toBe('extra-large');
    
    // Clear state scope, should fall back to machine
    ctx.clearStateScope();
    expect(ctx.get('size')).toBe('large');
    
    // Clear machine scope, should fall back to global
    ctx.clearMachineScope();
    expect(ctx.get('size')).toBe('default');
  });

  test('should maintain persistence boundaries correctly', () => {
    const ctx = new ContextManager();
    
    ctx.set('persistent', 'value', 'global');
    ctx.set('machineLocal', 'value', 'machine');
    ctx.set('temporary', 'value', 'state');
    
    const serialized = ctx.serialize();
    
    // Only global and machine should be serialized
    expect(serialized.global.persistent).toBe('value');
    expect(serialized.machine.machineLocal).toBe('value');
    expect(serialized.global.temporary).toBeUndefined();
    expect(serialized.machine.temporary).toBeUndefined();
    
    // Restore from serialization
    const restored = ContextManager.deserialize(serialized);
    expect(restored.get('persistent')).toBe('value');
    expect(restored.get('machineLocal')).toBe('value');
    expect(restored.get('temporary')).toBeUndefined();
  });

  test('should support RCL-style nested access patterns', () => {
    const ctx = new ContextManager();
    
    // Simulate RCL nested objects
    ctx.set('user', { profile: { name: 'John', preferences: { theme: 'dark' } } }, 'global');
    ctx.set('order', { items: [{ name: 'coffee', size: 'large' }] }, 'machine');
    
    // Flatten for template evaluation
    const flattened = ctx.getFlattened();
    
    // Should be able to access nested properties
    expect(flattened.user.profile.name).toBe('John');
    expect(flattened.order.items[0].size).toBe('large');
  });

  test('should integrate with existing CSM transition context updates', () => {
    const ctx = new ContextManager({ sessionId: '123' });
    
    // Simulate transition context updates
    const transitionUpdates = {
      size: 'medium',
      drink: 'latte',
      price: 4.50
    };
    
    // Updates should go to appropriate scope based on transition type
    ctx.update(transitionUpdates, 'machine'); // Order-specific data
    
    expect(ctx.get('sessionId')).toBe('123'); // Global persists
    expect(ctx.get('size')).toBe('medium'); // Machine scope
    expect(ctx.get('drink')).toBe('latte');
    
    // Temporary state data
    ctx.set('validationError', 'Invalid selection', 'state');
    expect(ctx.get('validationError')).toBe('Invalid selection');
    
    // State exit clears temporary data
    ctx.clearStateScope();
    expect(ctx.get('validationError')).toBeUndefined();
    expect(ctx.get('size')).toBe('medium'); // Machine data persists
  });
});

/**
 * INTEGRATION PROPOSAL
 * 
 * 1. Store ContextManager inside ConversationalAgent (outside CSM)
 * 2. Pass flattened context to FlowMachine.transition()
 * 3. Use scoped updates based on transition metadata:
 *    - Global: User profile, session data, cross-flow variables
 *    - Machine: Flow-specific order state, temporary calculations
 *    - State: Validation errors, temporary UI state
 * 
 * 4. Serialization only includes global + machine scopes
 * 5. Variable resolution follows RCL scoping rules
 */