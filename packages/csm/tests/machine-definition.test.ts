import { vi } from './test-utils';
import { describe, expect, test } from 'bun:test';
import { type MachineDefinitionJSON, validateMachineDefinition } from '../src';

describe('Machine Definition Validation', () => {
  test('should validate a correct machine definition', () => {
    const definition: MachineDefinitionJSON = {
      id: 'TestMachine',
      initial: 'Start',
      states: {
        Start: {
          transitions: [{ pattern: 'next', target: 'End' }],
        },
        End: {
          transitions: [],
        },
      },
    };

    expect(() => validateMachineDefinition(definition)).not.toThrow();
    expect(validateMachineDefinition(definition)).toBe(true);
  });

  test('should validate machine with metadata', () => {
    const definition: MachineDefinitionJSON = {
      id: 'TestMachine',
      initial: 'Start',
      states: {
        Start: {
          transitions: [{ target: 'Processing' }],
          meta: {
            messageId: 'welcome',
            transient: false,
            tags: ['entry', 'welcome'],
            custom: { timeout: 30 },
          },
        },
        Processing: {
          transitions: [{ target: 'End' }],
          meta: {
            transient: true,
          },
        },
        End: {
          transitions: [],
        },
      },
      meta: {
        name: 'Test Flow',
        description: 'A test flow for validation',
        version: '1.0.0',
        tags: ['test', 'example'],
      },
    };

    expect(() => validateMachineDefinition(definition)).not.toThrow();
  });

  test('should reject definition without id', () => {
    const definition = {
      initial: 'Start',
      states: {
        Start: { transitions: [] },
      },
    };

    expect(() => validateMachineDefinition(definition)).toThrow(
      'Machine definition must have an id string',
    );
  });

  test('should reject definition without initial state', () => {
    const definition = {
      id: 'TestMachine',
      states: {
        Start: { transitions: [] },
      },
    };

    expect(() => validateMachineDefinition(definition)).toThrow(
      'Machine definition must have an initial state',
    );
  });

  test('should reject definition without states', () => {
    const definition = {
      id: 'TestMachine',
      initial: 'Start',
    };

    expect(() => validateMachineDefinition(definition)).toThrow(
      'Machine definition must have states object',
    );
  });

  test('should reject when initial state does not exist', () => {
    const definition = {
      id: 'TestMachine',
      initial: 'NonExistent',
      states: {
        Start: { transitions: [] },
      },
    };

    expect(() => validateMachineDefinition(definition)).toThrow(
      "Initial state 'NonExistent' not found in states",
    );
  });

  test('should reject state without transitions array', () => {
    const definition = {
      id: 'TestMachine',
      initial: 'Start',
      states: {
        Start: { notTransitions: [] },
      },
    };

    expect(() => validateMachineDefinition(definition)).toThrow(
      "State 'Start' must have transitions array",
    );
  });

  test('should reject transition without target', () => {
    const definition = {
      id: 'TestMachine',
      initial: 'Start',
      states: {
        Start: {
          transitions: [{ pattern: 'test' }],
        },
      },
    };

    expect(() => validateMachineDefinition(definition)).toThrow(
      "Transition 0 in state 'Start' must have a target string",
    );
  });

  test('should accept complex transition definitions', () => {
    const definition: MachineDefinitionJSON = {
      id: 'ComplexMachine',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'order *',
              target: 'ProcessOrder',
              context: { action: 'order' },
              condition: 'context.isLoggedIn',
              priority: 10,
            },
            {
              pattern: ':default',
              target: 'Help',
            },
            {
              target: 'machine:AnotherFlow',
            },
          ],
        },
        ProcessOrder: {
          transitions: [],
        },
        Help: {
          transitions: [],
        },
      },
    };

    expect(() => validateMachineDefinition(definition)).not.toThrow();
  });

  test('should handle null and undefined inputs', () => {
    expect(() => validateMachineDefinition(null)).toThrow('Machine definition must be an object');

    expect(() => validateMachineDefinition(undefined)).toThrow(
      'Machine definition must be an object',
    );

    expect(() => validateMachineDefinition('not an object')).toThrow(
      'Machine definition must be an object',
    );
  });
});
