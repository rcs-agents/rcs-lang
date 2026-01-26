import { describe, test, expect } from 'bun:test';
import { FlowMachine } from '../src/flow-machine';
import type { MachineDefinitionJSON } from '../src/machine-definition';

describe('JSON Logic Conditions Implementation', () => {
  test('should support legacy string conditions (with deprecation warning)', () => {
    const definition: MachineDefinitionJSON = {
      id: 'TestMachine',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'test',
              target: 'End',
              condition: 'context.verified === true' // Legacy string format
            }
          ]
        },
        End: {
          transitions: []
        }
      }
    };

    const machine = new FlowMachine(definition);
    
    // Should work with verified context
    const result1 = machine.transition('test', { verified: true });
    expect(result1.type).toBe('state');
    expect(result1.stateId).toBe('End');

    // Should not transition with unverified context
    machine.setState('Start'); // Reset
    const result2 = machine.transition('test', { verified: false });
    expect(result2.type).toBe('none');
  });

  test('should support explicit code conditions', () => {
    const definition: MachineDefinitionJSON = {
      id: 'TestMachine',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'order',
              target: 'Processing',
              condition: {
                type: 'code',
                expression: 'context.user && context.user.age >= 18'
              }
            }
          ]
        },
        Processing: {
          transitions: []
        }
      }
    };

    const machine = new FlowMachine(definition);
    
    // Should work with valid user
    const result1 = machine.transition('order', { user: { age: 25 } });
    expect(result1.type).toBe('state');
    expect(result1.stateId).toBe('Processing');

    // Should not work with underage user
    machine.setState('Start'); // Reset
    const result2 = machine.transition('order', { user: { age: 16 } });
    expect(result2.type).toBe('none');

    // Should not work without user
    machine.setState('Start'); // Reset
    const result3 = machine.transition('order', {});
    expect(result3.type).toBe('none');
  });

  test('should support JSON Logic conditions', () => {
    const definition: MachineDefinitionJSON = {
      id: 'TestMachine',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'premium',
              target: 'PremiumService',
              condition: {
                type: 'jsonlogic',
                rule: {
                  'and': [
                    { '==': [{ 'var': 'membership' }, 'premium'] },
                    { '>': [{ 'var': 'points' }, 100] }
                  ]
                }
              }
            }
          ]
        },
        PremiumService: {
          transitions: []
        }
      }
    };

    const machine = new FlowMachine(definition);
    
    // Should work with premium membership and enough points
    const result1 = machine.transition('premium', { membership: 'premium', points: 150 });
    expect(result1.type).toBe('state');
    expect(result1.stateId).toBe('PremiumService');

    // Should not work with basic membership
    machine.setState('Start'); // Reset
    const result2 = machine.transition('premium', { membership: 'basic', points: 150 });
    expect(result2.type).toBe('none');

    // Should not work with insufficient points
    machine.setState('Start'); // Reset
    const result3 = machine.transition('premium', { membership: 'premium', points: 50 });
    expect(result3.type).toBe('none');
  });

  test('should support JSON Logic with nested object access', () => {
    const definition: MachineDefinitionJSON = {
      id: 'TestMachine',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'access',
              target: 'Granted',
              condition: {
                type: 'jsonlogic',
                rule: {
                  '==': [{ 'var': 'user.profile.type' }, 'admin']
                }
              }
            }
          ]
        },
        Granted: {
          transitions: []
        }
      }
    };

    const machine = new FlowMachine(definition);
    
    // Should work with admin user
    const result1 = machine.transition('access', { 
      user: { profile: { type: 'admin' } } 
    });
    expect(result1.type).toBe('state');
    expect(result1.stateId).toBe('Granted');

    // Should not work with regular user
    machine.setState('Start'); // Reset
    const result2 = machine.transition('access', { 
      user: { profile: { type: 'user' } } 
    });
    expect(result2.type).toBe('none');
  });

  test('should support JSON Logic with array operations', () => {
    const definition: MachineDefinitionJSON = {
      id: 'TestMachine',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'check',
              target: 'Valid',
              condition: {
                type: 'jsonlogic',
                rule: {
                  'in': [{ 'var': 'selectedSize' }, { 'var': 'availableSizes' }]
                }
              }
            }
          ]
        },
        Valid: {
          transitions: []
        }
      }
    };

    const machine = new FlowMachine(definition);
    
    // Should work with valid size selection
    const result1 = machine.transition('check', {
      selectedSize: 'medium',
      availableSizes: ['small', 'medium', 'large']
    });
    expect(result1.type).toBe('state');
    expect(result1.stateId).toBe('Valid');

    // Should not work with invalid size selection
    machine.setState('Start'); // Reset
    const result2 = machine.transition('check', {
      selectedSize: 'extra-large',
      availableSizes: ['small', 'medium', 'large']
    });
    expect(result2.type).toBe('none');
  });

  test('should handle JSON Logic evaluation errors gracefully', () => {
    const definition: MachineDefinitionJSON = {
      id: 'TestMachine',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'test',
              target: 'End',
              condition: {
                type: 'jsonlogic',
                rule: {
                  '==': [{ 'var': 'nonexistent.deeply.nested' }, true]
                }
              }
            }
          ]
        },
        End: {
          transitions: []
        }
      }
    };

    const machine = new FlowMachine(definition);
    
    // Should handle missing properties gracefully
    const result = machine.transition('test', {});
    expect(result.type).toBe('none');
  });

  test('should handle unknown condition type gracefully', () => {
    const definition: MachineDefinitionJSON = {
      id: 'TestMachine',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'test',
              target: 'End',
              condition: {
                type: 'unknown' as any,
                expression: 'true'
              }
            }
          ]
        },
        End: {
          transitions: []
        }
      }
    };

    const machine = new FlowMachine(definition);
    
    // Should return false for unknown condition types
    const result = machine.transition('test', {});
    expect(result.type).toBe('none');
  });
});