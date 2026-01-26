import { describe, test, expect, beforeEach } from 'bun:test';
import { validateMachineDefinition, type MachineDefinitionJSON } from '../src/machine-definition';

describe('Flow Control Extensions', () => {
  let validFlowControlMachine: MachineDefinitionJSON;

  beforeEach(() => {
    validFlowControlMachine = {
      id: 'TestFlow',
      initial: 'Welcome',
      states: {
        Welcome: {
          transitions: [
            {
              pattern: 'Start Order',
              flowInvocation: {
                flowId: 'CreateOrder',
                onResult: {
                  ok: {
                    operations: [
                      {
                        append: {
                          to: 'orders',
                          value: { var: 'result' }
                        }
                      }
                    ],
                    target: 'state:ConfirmAllOrders'
                  },
                  cancel: {
                    target: 'state:Welcome'
                  },
                  error: {
                    target: 'state:OrderError'
                  }
                }
              }
            },
            {
              pattern: 'Schedule Appointment',
              flowInvocation: {
                flowId: 'AppointmentFlow',
                onResult: {
                  ok: {
                    operations: [
                      {
                        set: {
                          variable: 'appointment',
                          value: { var: 'result' }
                        }
                      }
                    ],
                    target: 'state:ShowAppointment'
                  },
                  cancel: {
                    target: 'state:Welcome'
                  },
                  error: {
                    target: 'state:ErrorState'
                  }
                }
              }
            },
            {
              pattern: 'Merge Profile',
              flowInvocation: {
                flowId: 'ProfileFlow',
                onResult: {
                  ok: {
                    operations: [
                      {
                        merge: {
                          into: 'userProfile',
                          value: { var: 'result' }
                        }
                      }
                    ],
                    target: 'state:ProfileComplete'
                  },
                  cancel: {
                    target: 'state:Welcome'
                  },
                  error: {
                    target: 'state:ErrorState'
                  }
                }
              }
            }
          ],
          meta: {
            messageId: 'Welcome'
          }
        },
        ConfirmAllOrders: {
          transitions: [
            {
              pattern: 'Confirm',
              target: 'state:ProcessPayment'
            }
          ],
          meta: {
            messageId: 'ConfirmAllOrders'
          }
        },
        ShowAppointment: {
          transitions: [
            {
              pattern: 'Change',
              flowInvocation: {
                flowId: 'AppointmentFlow',
                onResult: {
                  ok: {
                    operations: [
                      {
                        set: {
                          variable: 'appointment',
                          value: { var: 'result' }
                        }
                      }
                    ],
                    target: 'state:ShowAppointment'
                  },
                  cancel: {
                    target: 'state:Welcome'
                  },
                  error: {
                    target: 'state:ErrorState'
                  }
                }
              }
            }
          ],
          meta: {
            messageId: 'ShowAppointment'
          }
        },
        ProcessPayment: {
          transitions: [
            {
              target: 'state:OrderComplete'
            }
          ],
          meta: {
            messageId: 'ProcessPayment',
            transient: true
          }
        },
        OrderComplete: {
          transitions: [
            {
              target: ':ok'
            }
          ],
          meta: {
            messageId: 'OrderComplete',
            transient: true
          }
        },
        OrderError: {
          transitions: [
            {
              pattern: 'Retry',
              target: 'state:Welcome'
            },
            {
              pattern: 'Cancel',
              target: ':cancel'
            }
          ],
          meta: {
            messageId: 'OrderError'
          }
        },
        ProfileComplete: {
          transitions: [
            {
              target: 'state:Welcome'
            }
          ],
          meta: {
            messageId: 'ProfileComplete',
            transient: true
          }
        },
        ErrorState: {
          transitions: [
            {
              target: ':error'
            }
          ],
          meta: {
            messageId: 'ErrorState',
            transient: true
          }
        }
      },
      meta: {
        name: 'Flow Control Test Machine',
        description: 'Test machine for flow control extensions',
        version: '1.0.0'
      }
    };
  });

  test('should validate machine with flow invocations', () => {
    expect(() => validateMachineDefinition(validFlowControlMachine)).not.toThrow();
    expect(validateMachineDefinition(validFlowControlMachine)).toBe(true);
  });

  test('should validate flow termination targets', () => {
    const machineWithTermination: MachineDefinitionJSON = {
      id: 'TerminationTest',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'Complete',
              target: ':ok'
            },
            {
              pattern: 'Cancel', 
              target: ':cancel'
            },
            {
              pattern: 'Error',
              target: ':error'
            }
          ],
          meta: {
            messageId: 'Start'
          }
        }
      },
      meta: {
        name: 'Termination Test',
        description: 'Test flow termination'
      }
    };

    expect(() => validateMachineDefinition(machineWithTermination)).not.toThrow();
    expect(validateMachineDefinition(machineWithTermination)).toBe(true);
  });

  test('should validate different aggregation strategies', () => {
    const strategies = ['append', 'set', 'merge'];
    
    strategies.forEach(strategy => {
      const machine: MachineDefinitionJSON = {
        id: `${strategy}Test`,
        initial: 'Start',
        states: {
          Start: {
            transitions: [
              {
                pattern: 'Test',
                flowInvocation: {
                  flowId: 'TestFlow',
                  onResult: {
                    ok: {
                      operations: [
                        strategy === 'append' ? {
                          append: {
                            to: 'testVar',
                            value: { var: 'result' }
                          }
                        } : strategy === 'set' ? {
                          set: {
                            variable: 'testVar',
                            value: { var: 'result' }
                          }
                        } : {
                          merge: {
                            into: 'testVar',
                            value: { var: 'result' }
                          }
                        }
                      ],
                      target: 'state:Success'
                    },
                    cancel: {
                      target: 'state:Cancel'
                    },
                    error: {
                      target: 'state:Error'
                    }
                  }
                }
              }
            ],
            meta: {
              messageId: 'Start'
            }
          },
          Success: {
            transitions: [
              {
                target: ':ok'
              }
            ],
            meta: {
              messageId: 'Success',
              transient: true
            }
          },
          Cancel: {
            transitions: [
              {
                target: ':cancel'
              }
            ],
            meta: {
              messageId: 'Cancel',
              transient: true
            }
          },
          Error: {
            transitions: [
              {
                target: ':error'
              }
            ],
            meta: {
              messageId: 'Error',
              transient: true
            }
          }
        },
        meta: {
          name: `${strategy} Strategy Test`
        }
      };

      expect(() => validateMachineDefinition(machine)).not.toThrow();
      expect(validateMachineDefinition(machine)).toBe(true);
    });
  });

  test('should validate context variable targets', () => {
    const contextVariableMachine: MachineDefinitionJSON = {
      id: 'ContextVariableTest',
      initial: 'Start',
      states: {
        Start: {
          transitions: [
            {
              pattern: 'Dynamic',
              target: '@nextState' // Context variable target
            }
          ],
          meta: {
            messageId: 'Start'
          }
        },
        Success: {
          transitions: [{ target: ':ok' }],
          meta: { messageId: 'Success', transient: true }
        },
        Failure: {
          transitions: [{ target: ':error' }],
          meta: { messageId: 'Failure', transient: true }
        }
      },
      meta: {
        name: 'Context Variable Test'
      }
    };

    expect(() => validateMachineDefinition(contextVariableMachine)).not.toThrow();
    expect(validateMachineDefinition(contextVariableMachine)).toBe(true);
  });
});

describe('Flow Control Integration', () => {
  test('should validate complete coffee shop example', async () => {
    const { default: coffeeShopMachine } = await import('./fixtures/coffee-shop-machine.json');
    const { extractSingleFlow } = await import('../src/schema-validator');
    
    // Extract single-flow structure for CSM compatibility
    const singleFlowMachine = extractSingleFlow(coffeeShopMachine);
    
    expect(() => validateMachineDefinition(singleFlowMachine as MachineDefinitionJSON)).not.toThrow();
    expect(validateMachineDefinition(singleFlowMachine as MachineDefinitionJSON)).toBe(true);
  });

  test('should validate flow invocation patterns in coffee shop', async () => {
    const { default: coffeeShopMachine } = await import('./fixtures/coffee-shop-machine.json');
    const { extractSingleFlow } = await import('../src/schema-validator');
    
    // Extract single-flow structure for CSM compatibility
    const machine = extractSingleFlow(coffeeShopMachine) as MachineDefinitionJSON;
    
    // Find a flow invocation transition
    const welcomeState = machine.states.Welcome;
    const flowInvocationTransition = welcomeState.transitions.find(t => 
      t.flowInvocation !== undefined
    );
    
    expect(flowInvocationTransition).toBeDefined();
    expect(flowInvocationTransition!.flowInvocation!.flowId).toBe('CreateOrder');
    expect(flowInvocationTransition!.flowInvocation!.onResult.end!.target).toBe('state:ConfirmAllOrders');
    expect(flowInvocationTransition!.flowInvocation!.onResult.cancel!.target).toBe('state:Welcome');
    expect(flowInvocationTransition!.flowInvocation!.onResult.error!.target).toBe('state:OrderError');
  });
});