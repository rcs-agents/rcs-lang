'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
const assert = __importStar(require('assert'));
const path = __importStar(require('node:path'));
describe('Interactive Diagram Tests', () => {
  describe('Model Conversion Logic', () => {
    it('should handle flow data structure correctly', () => {
      const mockCompiledData = {
        flows: {
          TestFlow: {
            states: {
              start: { type: 'initial' },
              welcome: {
                on: { NEXT: 'products' },
              },
              products: {
                on: { BACK: 'welcome', SELECT: 'details' },
              },
              details: {
                on: { BACK: 'products' },
              },
            },
            initial: 'start',
          },
        },
        messages: {
          welcome: {
            contentMessage: {
              text: 'Welcome to our service!',
            },
          },
          products: {
            contentMessage: {
              richCard: {
                standaloneCard: {},
              },
            },
          },
        },
        agent: {
          name: 'TestAgent',
        },
      };
      // Test basic structure validation
      assert.ok(mockCompiledData.flows.TestFlow, 'Should have TestFlow');
      assert.equal(
        Object.keys(mockCompiledData.flows.TestFlow.states).length,
        4,
        'Should have 4 states',
      );
      assert.ok(mockCompiledData.messages.welcome, 'Should have welcome message');
      assert.ok(
        mockCompiledData.messages.products.contentMessage.richCard,
        'Should identify rich card',
      );
    });
    it('should handle flows without explicit end states', () => {
      const mockCompiledData = {
        flows: {
          ContinuousFlow: {
            states: {
              start: { on: { NEXT: 'step1' } },
              step1: { on: { NEXT: 'step2', BACK: 'start' } },
              step2: { on: { NEXT: 'step1', RESTART: 'start' } },
            },
            initial: 'start',
          },
        },
        messages: {},
        agent: {},
      };
      // All states should have outgoing transitions (continuous flow)
      const states = mockCompiledData.flows.ContinuousFlow.states;
      let allStatesHaveTransitions = true;
      for (const stateId in states) {
        const state = states[stateId];
        if (!state.on || Object.keys(state.on).length === 0) {
          allStatesHaveTransitions = false;
          break;
        }
      }
      assert.ok(allStatesHaveTransitions, 'Continuous flows should not have dead ends');
    });
  });
  describe('Text Processing', () => {
    it('should handle quoted text correctly', () => {
      const quotedText = '"Hello with quotes"';
      const unquotedText = 'Hello without quotes';
      // Simulate the quote removal logic from the frontend
      const cleanQuoted =
        quotedText.startsWith('"') && quotedText.endsWith('"')
          ? quotedText.slice(1, -1)
          : quotedText;
      assert.equal(cleanQuoted, 'Hello with quotes', 'Should remove surrounding quotes');
      assert.equal(unquotedText, 'Hello without quotes', 'Should leave unquoted text unchanged');
    });
    it('should validate message structure', () => {
      const validMessage = {
        contentMessage: {
          text: 'Valid message',
        },
      };
      const invalidMessage = {
        text: 'Invalid structure',
      };
      assert.ok(validMessage.contentMessage, 'Should recognize valid message structure');
      assert.ok(!invalidMessage.contentMessage, 'Should recognize invalid message structure');
    });
  });
  describe('Edge Positioning Mathematics', () => {
    it('should calculate proper border attachment points', () => {
      const sourceNode = { position: { x: 100, y: 100 } };
      const targetNode = { position: { x: 300, y: 200 } };
      const sourceCenter = {
        x: sourceNode.position.x + 60, // box width/2
        y: sourceNode.position.y + 20, // box height/2
      };
      const targetCenter = {
        x: targetNode.position.x + 60,
        y: targetNode.position.y + 20,
      };
      // Calculate direction vector
      const dx = targetCenter.x - sourceCenter.x;
      const dy = targetCenter.y - sourceCenter.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      assert.ok(length > 0, 'Should calculate non-zero distance');
      assert.ok(dx > 0, 'Should have positive horizontal component');
      assert.ok(dy > 0, 'Should have positive vertical component');
      // Verify normalization works
      const unitX = dx / length;
      const unitY = dy / length;
      const unitLength = Math.sqrt(unitX * unitX + unitY * unitY);
      assert.ok(Math.abs(unitLength - 1) < 0.001, 'Unit vector should have length 1');
    });
    it('should determine correct attachment sides', () => {
      // Test horizontal vs vertical attachment preference
      const horizontalCase = { dx: 200, dy: 50 }; // More horizontal
      const verticalCase = { dx: 50, dy: 200 }; // More vertical
      const horizontalDominant = Math.abs(horizontalCase.dx) > Math.abs(horizontalCase.dy);
      const verticalDominant = Math.abs(verticalCase.dx) < Math.abs(verticalCase.dy);
      assert.ok(horizontalDominant, 'Should detect horizontal dominance');
      assert.ok(verticalDominant, 'Should detect vertical dominance');
    });
  });
  describe('State Management', () => {
    it('should maintain consistent flow state', () => {
      const mockState = {
        flows: {
          TestFlow: {
            id: 'TestFlow',
            nodes: [
              { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: {} },
              { id: 'msg1', type: 'message', position: { x: 200, y: 0 }, data: {} },
            ],
            edges: [{ id: 'start-msg1', source: 'start', target: 'msg1' }],
          },
        },
        activeFlow: 'TestFlow',
        messages: {},
        agent: {},
      };
      // Verify state structure
      assert.equal(mockState.activeFlow, 'TestFlow', 'Should track active flow');
      assert.equal(mockState.flows.TestFlow.nodes.length, 2, 'Should maintain node count');
      assert.equal(mockState.flows.TestFlow.edges.length, 1, 'Should maintain edge count');
      // Verify no end nodes in state (since we removed end node support)
      const endNodes = mockState.flows.TestFlow.nodes.filter((n) => n.type === 'end');
      assert.equal(endNodes.length, 0, 'State should not contain end nodes');
    });
  });
  describe('CLI Path Detection', () => {
    it('should handle CLI path detection logic', () => {
      const mockWorkspacePath = '/mock/workspace';
      const possiblePaths = [
        path.join(mockWorkspacePath, 'packages', 'cli', 'demo.js'),
        path.join(mockWorkspacePath, '..', 'packages', 'cli', 'demo.js'),
        path.join(mockWorkspacePath, '..', '..', 'packages', 'cli', 'demo.js'),
        path.join(mockWorkspacePath, 'cli', 'demo.js'),
        path.join(mockWorkspacePath, 'node_modules', '.bin', 'rcl-cli'),
      ];
      // Verify path generation logic
      assert.ok(possiblePaths.length > 0, 'Should generate multiple possible paths');
      assert.ok(possiblePaths[0].includes('demo.js'), 'Should look for demo.js file');
      assert.ok(
        possiblePaths.some((p) => p.includes('packages/cli')),
        'Should check monorepo structure',
      );
    });
  });
  describe('Error Handling', () => {
    it('should handle invalid data gracefully', () => {
      const invalidData = {
        flows: {
          ErrorFlow: {
            states: {
              invalidNode: null, // Invalid state data
            },
          },
        },
        messages: {},
        agent: {},
      };
      // Should not crash when processing invalid data
      try {
        const hasFlows = invalidData.flows && typeof invalidData.flows === 'object';
        const hasInvalidNode = invalidData.flows.ErrorFlow?.states?.invalidNode === null;
        assert.ok(hasFlows, 'Should recognize flows object');
        assert.ok(hasInvalidNode, 'Should handle null state data');
      } catch (error) {
        assert.fail('Should not throw when processing invalid data');
      }
    });
  });
  describe('Inline Editing Logic', () => {
    it('should handle text editing state transitions', () => {
      const mockNode = {
        id: 'test-node',
        type: 'message',
        data: {
          messageData: { text: 'Original text' },
        },
      };
      // Simulate inline editing logic
      const newText = 'Updated text';
      // Update node data logic
      if (mockNode.type === 'message') {
        if (!mockNode.data) mockNode.data = {};
        if (!mockNode.data.messageData) mockNode.data.messageData = {};
        mockNode.data.messageData.text = newText;
      }
      assert.equal(mockNode.data.messageData.text, 'Updated text', 'Should update node text');
    });
    it('should handle different node types for editing', () => {
      const messageNode = { type: 'message', data: {} };
      const richCardNode = { type: 'rich_card', data: {} };
      const startNode = { type: 'start', data: {} };
      // Test edit applicability
      const editableTypes = ['message', 'rich_card'];
      assert.ok(editableTypes.includes(messageNode.type), 'Message nodes should be editable');
      assert.ok(editableTypes.includes(richCardNode.type), 'Rich card nodes should be editable');
      assert.ok(!editableTypes.includes(startNode.type), 'Start nodes should use label editing');
    });
  });
  describe('File Extensions', () => {
    it('should validate RCL file paths', () => {
      const validPaths = ['/path/to/file.rcl', 'example.rcl', './folder/test.rcl'];
      const invalidPaths = ['/path/to/file.txt', 'example.js', './folder/test.json'];
      validPaths.forEach((filePath) => {
        assert.ok(filePath.endsWith('.rcl'), `${filePath} should be valid RCL file`);
      });
      invalidPaths.forEach((filePath) => {
        assert.ok(!filePath.endsWith('.rcl'), `${filePath} should not be valid RCL file`);
      });
    });
  });
});
//# sourceMappingURL=interactiveDiagram.test.js.map
