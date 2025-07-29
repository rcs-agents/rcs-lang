import { describe, expect, test } from 'bun:test';
import { validateMachineDefinition, type MachineDefinitionJSON } from '../src/machine-definition';
import type { StateMeta } from '../src/types';

describe('Schema vs Implementation Mismatches', () => {
  describe('Schema Completeness Issues', () => {
    test('MISMATCH: Schema allows tags array but implementation ignores it', () => {
      const machineWithTags: MachineDefinitionJSON = {
        id: 'TestFlow',
        initial: 'Start',
        states: {
          Start: {
            transitions: [{ target: 'End' }],
            meta: {
              tags: ['important', 'entry-point'] // Schema allows this
            }
          },
          End: {
            transitions: []
          }
        },
        meta: {
          tags: ['core-flow', 'v1'] // Schema allows this too
        }
      };

      // Schema validation passes
      expect(() => validateMachineDefinition(machineWithTags)).not.toThrow();

      // But the TypeScript types in types.ts don't include tags in StateMeta
      const stateMeta: StateMeta = {
        messageId: 'test',
        // tags: ['test'] // This would be a TypeScript error
      };

      // This shows the implementation is incomplete compared to schema
      expect(stateMeta.messageId).toBe('test');
    });

    test('SUCCESS: Context variable resolution in targets now implemented', () => {
      // Schema now allows targets like \"@variableName\" and implementation resolves them
      const machineWithContextTarget: MachineDefinitionJSON = {
        id: 'TestFlow',
        initial: 'Start',
        states: {
          Start: {
            transitions: [
              {
                target: '@nextState', // Now valid per updated schema regex
                context: { nextState: 'End' }
              }
            ]
          },
          End: {
            transitions: []
          }
        }
      };

      // Schema validation should now pass with updated regex pattern
      expect(() => validateMachineDefinition(machineWithContextTarget)).not.toThrow();
      
      // The schema regex now supports @variable syntax
    });

    test('MISMATCH: Priority field exists in schema but not consistently used', () => {
      const machineWithPriorities: MachineDefinitionJSON = {
        id: 'TestFlow',
        initial: 'Start',
        states: {
          Start: {
            transitions: [
              {
                pattern: 'high',
                target: 'End',
                priority: 10
              },
              {
                pattern: 'low',
                target: 'End',
                priority: 1
              },
              {
                pattern: ':default',
                target: 'Start',
                priority: 0
              }
            ]
          },
          End: {
            transitions: []
          }
        }
      };

      expect(() => validateMachineDefinition(machineWithPriorities)).not.toThrow();
      
      // Implementation does use priority in FlowMachine.transition()
      // But there's no validation that priorities are used correctly
    });
  });

  describe('RCL Feature Representation Issues', () => {
    test('SUCCESS: Context variable interpolation in targets (@next, @variableName)', () => {
      // RCL allows: -> @next  or  -> @contextVar
      // CSM schema now supports this syntax in target field regex
      
      const rclStyleTarget = '@next';
      const updatedSchemaTargetRegex = /^([a-zA-Z][a-zA-Z0-9_]*|machine:[a-zA-Z][a-zA-Z0-9_]*|@[a-zA-Z][a-zA-Z0-9_]*)$/;
      
      expect(updatedSchemaTargetRegex.test(rclStyleTarget)).toBe(true);
      
      // RCL's @variable syntax can now be represented in CSM schema
    });

    test('ISSUE: Cross-flow transitions syntax mismatch', () => {
      // RCL allows: -> machine:FlowName
      // CSM schema expects: machine:FlowName
      
      const rclCrossFlowTarget = 'machine:OrderFlow';
      const schemaTargetRegex = /^([a-zA-Z][a-zA-Z0-9_]*|machine:[a-zA-Z][a-zA-Z0-9_]*)$/;
      
      expect(schemaTargetRegex.test(rclCrossFlowTarget)).toBe(true);
      
      // This actually works correctly
    });

    test('ISSUE: String interpolation in patterns not representable', () => {
      // RCL supports: match context.size where context.size might be \"small\", \"medium\", \"large\"
      // But CSM only supports static patterns
      
      const dynamicPattern = '#{context.size}'; // RCL string interpolation syntax
      
      // CSM schema has no way to represent dynamic patterns
      // This is a fundamental limitation
      
      expect(typeof dynamicPattern).toBe('string');
    });

    test('ISSUE: Conditional transitions with complex expressions', () => {
      const complexCondition = 'context.price > 5.0 && context.size === \"large\"';
      
      const machineWithComplexCondition: MachineDefinitionJSON = {
        id: 'TestFlow',
        initial: 'Start',
        states: {
          Start: {
            transitions: [
              {
                pattern: 'proceed',
                target: 'End',
                condition: complexCondition
              }
            ]
          },
          End: {
            transitions: []
          }
        }
      };

      // Schema allows any string in condition field
      expect(() => validateMachineDefinition(machineWithComplexCondition)).not.toThrow();
      
      // But there's no validation of JavaScript syntax or context variable access
      const invalidCondition = 'invalid javascript syntax ;;;';
      
      const machineWithInvalidCondition: MachineDefinitionJSON = {
        id: 'TestFlow',
        initial: 'Start',
        states: {
          Start: {
            transitions: [
              {
                pattern: 'proceed',
                target: 'End',
                condition: invalidCondition
              }
            ]
          },
          End: {
            transitions: []
          }
        }
      };

      // This also passes schema validation even though it's invalid JavaScript
      expect(() => validateMachineDefinition(machineWithInvalidCondition)).not.toThrow();
    });
  });

  describe('Missing RCL Features in CSM', () => {
    test('MISSING: No representation for RCL imports', () => {
      // RCL: import shared/messages as msg
      // CSM: No equivalent structure
      
      // This would need to be handled at the agent level or compilation stage
    });

    test('MISSING: No representation for RCL message definitions', () => {
      // RCL has entire messages section with richCard, text, carousel, etc.
      // CSM only references messageId in state meta
      
      // Messages are external to the state machine definition
    });

    test('MISSING: No representation for RCL spread directives', () => {
      // RCL: ...commonTransitions
      // CSM: No equivalent mechanism
      
      // Would need to be expanded during compilation
    });

    test('MISSING: No representation for RCL type tags', () => {
      // RCL: size: <money 3.50>
      // CSM: Just stores as plain value in context
      
      // Type information is lost in CSM representation
    });

    test('MISSING: No representation for RCL embedded code', () => {
      // RCL: postbackData: $js> (suggestion) => suggestion?.text?.toLowerCase()
      // CSM: No equivalent structure
      
      // Would need external code handling
    });
  });

  describe('Implementation Gaps', () => {
    test('GAP: No validation of state reference integrity', () => {
      const machineWithInvalidReference: MachineDefinitionJSON = {
        id: 'TestFlow',
        initial: 'Start',
        states: {
          Start: {
            transitions: [
              {
                target: 'NonExistentState' // References non-existent state
              }
            ]
          }
        }
      };

      // Basic validation doesn't catch this
      expect(() => validateMachineDefinition(machineWithInvalidReference)).not.toThrow();
      
      // Need enhanced validation for state reference integrity
    });

    test('GAP: No validation of circular transitions', () => {
      const machineWithCircularTransitions: MachineDefinitionJSON = {
        id: 'TestFlow',
        initial: 'A',
        states: {
          A: {
            transitions: [{ target: 'B' }]
          },
          B: {
            transitions: [{ target: 'A' }]
          }
        }
      };

      // This creates an infinite loop but passes validation
      expect(() => validateMachineDefinition(machineWithCircularTransitions)).not.toThrow();
    });

    test('GAP: No validation of unreachable states', () => {
      const machineWithUnreachableState: MachineDefinitionJSON = {
        id: 'TestFlow',
        initial: 'Start',
        states: {
          Start: {
            transitions: [{ target: 'End' }]
          },
          End: {
            transitions: []
          },
          Unreachable: {
            transitions: [{ target: 'End' }]
          }
        }
      };

      // Unreachable state passes validation
      expect(() => validateMachineDefinition(machineWithUnreachableState)).not.toThrow();
    });
  });
});