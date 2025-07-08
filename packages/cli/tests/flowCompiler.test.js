const { FlowCompiler } = require('../src/legacy/compilers/flowCompiler');

describe('FlowCompiler', () => {
  let compiler;

  beforeEach(() => {
    compiler = new FlowCompiler();
  });

  const createMockNode = (type, text, children) => ({
    type,
    text,
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: text?.length || 0 },
    children: children || [],
    parent: null
  });

  const createFlowRule = (operands) => 
    createMockNode('flow_rule', undefined, operands.map(operand => 
      createMockNode('flow_operand_or_expression', undefined, [
        createMockNode(typeof operand === 'string' && operand.startsWith('"') ? 'string' : 'identifier', operand)
      ])
    ));

  describe('Basic Flow Compilation', () => {
    it('should extract flow ID from flow section', () => {
      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'TestFlow')
      ]);

      const flows = compiler.compileFlows(flowNode);

      expect(flows.TestFlow).toBeDefined();
      expect(flows.TestFlow.id).toBe('TestFlow');
    });

    it('should compile simple linear flow', () => {
      const flowRule = createFlowRule([':start', 'StateA', 'StateB']);
      
      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'LinearFlow'),
        flowRule
      ]);

      const flows = compiler.compileFlows(flowNode);

      expect(flows.LinearFlow).toBeDefined();
      expect(flows.LinearFlow.initial).toBe('start');
      expect(flows.LinearFlow.states).toHaveProperty('start');
      expect(flows.LinearFlow.states).toHaveProperty('StateA');
      expect(flows.LinearFlow.states).toHaveProperty('StateB');
    });

    it('should compile flow with conditional transitions', () => {
      const flowRule = createMockNode('flow_rule', undefined, [
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'StateA')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('string', '"trigger_event"')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'StateB')
        ])
      ]);

      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'ConditionalFlow'),
        flowRule
      ]);

      const flows = compiler.compileFlows(flowNode);

      expect(flows.ConditionalFlow.states.StateA).toBeDefined();
      expect(flows.ConditionalFlow.states.StateA.on).toBeDefined();
      expect(flows.ConditionalFlow.states.StateB).toBeDefined();
    });
  });

  describe('Complex Flow Patterns', () => {
    it('should compile branching flow with multiple transitions', () => {
      // StateA -> "event1" -> StateB
      const rule1 = createMockNode('flow_rule', undefined, [
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'StateA')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('string', '"event1"')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'StateB')
        ])
      ]);

      // StateA -> "event2" -> StateC  
      const rule2 = createMockNode('flow_rule', undefined, [
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'StateA')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('string', '"event2"')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'StateC')
        ])
      ]);

      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'BranchingFlow'),
        rule1,
        rule2
      ]);

      const flows = compiler.compileFlows(flowNode);

      expect(flows.BranchingFlow.states.StateA.on).toBeDefined();
      // Should have multiple transitions from StateA
      expect(Object.keys(flows.BranchingFlow.states.StateA.on).length).toBeGreaterThan(0);
    });

    it('should compile flow with :start state', () => {
      const flowRule = createMockNode('flow_rule', undefined, [
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', ':start')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'WelcomeState')
        ])
      ]);

      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'StartFlow'),
        flowRule
      ]);

      const flows = compiler.compileFlows(flowNode);

      expect(flows.StartFlow.initial).toBe('start');
      expect(flows.StartFlow.states).toHaveProperty('start');
    });

    it('should handle multiple start states in complex flows', () => {
      // :start -> MsgA
      const rule1 = createMockNode('flow_rule', undefined, [
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', ':start')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'MsgA')
        ])
      ]);

      // :start -> MsgB (another starting point)
      const rule2 = createMockNode('flow_rule', undefined, [
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', ':start')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'MsgB')
        ])
      ]);

      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'MultiStartFlow'),
        rule1,
        rule2
      ]);

      const flows = compiler.compileFlows(flowNode);

      expect(flows.MultiStartFlow.states.start).toBeDefined();
      expect(flows.MultiStartFlow.states.start.on).toBeDefined();
    });
  });

  describe('Real-world Flow Examples', () => {
    it('should compile MainFlow pattern from realistic.rcl', () => {
      // :start -> MsgWelcome
      const startRule = createMockNode('flow_rule', undefined, [
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', ':start')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'MsgWelcome')
        ])
      ]);

      // MsgWelcome -> "circular_world" -> MsgCircularWorld
      const circularRule = createMockNode('flow_rule', undefined, [
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'MsgWelcome')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('string', '"circular_world"')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'MsgCircularWorld')
        ])
      ]);

      // MsgWelcome -> "digital_journey" -> MsgDigitalJourney
      const digitalRule = createMockNode('flow_rule', undefined, [
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'MsgWelcome')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('string', '"digital_journey"')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'MsgDigitalJourney')
        ])
      ]);

      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'MainFlow'),
        startRule,
        circularRule,
        digitalRule
      ]);

      const flows = compiler.compileFlows(flowNode);

      expect(flows.MainFlow).toBeDefined();
      expect(flows.MainFlow.initial).toBe('start');
      
      // Check that start state transitions to MsgWelcome
      expect(flows.MainFlow.states.start).toBeDefined();
      expect(flows.MainFlow.states.start.on).toBeDefined();
      
      // Check that MsgWelcome has multiple transitions
      expect(flows.MainFlow.states.MsgWelcome).toBeDefined();
      expect(flows.MainFlow.states.MsgWelcome.on).toBeDefined();
      
      // Should have states for all messages
      expect(flows.MainFlow.states).toHaveProperty('MsgCircularWorld');
      expect(flows.MainFlow.states).toHaveProperty('MsgDigitalJourney');
    });

    it('should compile CircularWorldFlow pattern', () => {
      // :start -> MsgCircularWorld
      const startRule = createMockNode('flow_rule', undefined, [
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', ':start')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'MsgCircularWorld')
        ])
      ]);

      // MsgCircularWorld -> "what_we_aim" -> MsgCircularWorldAim
      const aimRule = createMockNode('flow_rule', undefined, [
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'MsgCircularWorld')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('string', '"what_we_aim"')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'MsgCircularWorldAim')
        ])
      ]);

      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'CircularWorldFlow'),
        startRule,
        aimRule
      ]);

      const flows = compiler.compileFlows(flowNode);

      expect(flows.CircularWorldFlow).toBeDefined();
      expect(flows.CircularWorldFlow.states.MsgCircularWorld.on).toBeDefined();
      expect(flows.CircularWorldFlow.states).toHaveProperty('MsgCircularWorldAim');
    });
  });

  describe('XState Configuration Generation', () => {
    it('should generate valid XState configuration structure', () => {
      const flowRule = createFlowRule([':start', 'StateA', 'StateB']);
      
      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'XStateFlow'),
        flowRule
      ]);

      const flows = compiler.compileFlows(flowNode);
      const config = flows.XStateFlow;

      // Check required XState properties
      expect(config).toHaveProperty('id');
      expect(config).toHaveProperty('initial');
      expect(config).toHaveProperty('states');
      expect(config).toHaveProperty('context');

      // Validate structure
      expect(typeof config.id).toBe('string');
      expect(typeof config.initial).toBe('string');
      expect(typeof config.states).toBe('object');
      expect(typeof config.context).toBe('object');

      // Check that states have valid XState structure
      Object.values(config.states).forEach(state => {
        expect(state).toBeInstanceOf(Object);
        if (state.on) {
          expect(typeof state.on).toBe('object');
        }
        if (state.entry) {
          expect(Array.isArray(state.entry) || typeof state.entry === 'string').toBe(true);
        }
      });
    });

    it('should identify correct initial state', () => {
      const flowRule = createFlowRule([':start', 'FirstState', 'SecondState']);
      
      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'InitialFlow'),
        flowRule
      ]);

      const flows = compiler.compileFlows(flowNode);

      expect(flows.InitialFlow.initial).toBe('start');
      expect(flows.InitialFlow.states).toHaveProperty('start');
    });

    it('should generate appropriate event names', () => {
      const flowRule = createMockNode('flow_rule', undefined, [
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'StateA')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('string', '"user_input"')
        ]),
        createMockNode('flow_operand_or_expression', undefined, [
          createMockNode('identifier', 'StateB')
        ])
      ]);

      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'EventFlow'),
        flowRule
      ]);

      const flows = compiler.compileFlows(flowNode);

      expect(flows.EventFlow.states.StateA.on).toBeDefined();
      expect(Object.keys(flows.EventFlow.states.StateA.on).length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty flow definitions gracefully', () => {
      const emptyFlowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'EmptyFlow')
      ]);

      const flows = compiler.compileFlows(emptyFlowNode);

      expect(flows.EmptyFlow).toBeDefined();
      expect(flows.EmptyFlow.id).toBe('EmptyFlow');
      expect(flows.EmptyFlow.initial).toBe('start'); // Default fallback
    });

    it('should handle malformed flow rules gracefully', () => {
      const malformedRule = createMockNode('flow_rule', undefined, [
        // Missing operands
      ]);

      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'MalformedFlow'),
        malformedRule
      ]);

      expect(() => {
        const flows = compiler.compileFlows(flowNode);
        expect(flows.MalformedFlow).toBeDefined();
      }).not.toThrow();
    });

    it('should handle flows without explicit start state', () => {
      const flowRule = createFlowRule(['StateA', 'StateB', 'StateC']);
      
      const flowNode = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'NoStartFlow'),
        flowRule
      ]);

      const flows = compiler.compileFlows(flowNode);

      expect(flows.NoStartFlow.initial).toBe('StateA'); // First state becomes initial
    });

    it('should handle AST without any flows', () => {
      const emptyAST = createMockNode('source_file', undefined, [
        createMockNode('agent_definition', undefined, [])
      ]);

      const flows = compiler.compileFlows(emptyAST);

      expect(flows).toEqual({});
    });
  });

  describe('Multiple Flows Compilation', () => {
    it('should compile multiple flows from single AST', () => {
      const flow1Rule = createFlowRule([':start', 'StateA']);
      const flow1Node = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'Flow1'),
        flow1Rule
      ]);

      const flow2Rule = createFlowRule([':start', 'StateX']);
      const flow2Node = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'Flow2'),
        flow2Rule
      ]);

      const rootAST = createMockNode('source_file', undefined, [
        flow1Node,
        flow2Node
      ]);

      const flows = compiler.compileFlows(rootAST);

      expect(flows).toHaveProperty('Flow1');
      expect(flows).toHaveProperty('Flow2');
      expect(flows.Flow1.id).toBe('Flow1');
      expect(flows.Flow2.id).toBe('Flow2');
    });
  });
});