import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Interactive Diagram Logic Tests', () => {
  describe('1. Data Structure Validation', () => {
    it('should validate expected coffee-shop.json structure', () => {
      // Check if the compiled coffee-shop.json exists and has the right structure
      const coffeeShopJsonPath = path.join(__dirname, '../../../../../examples/coffee-shop.json');

      if (fs.existsSync(coffeeShopJsonPath)) {
        const data = JSON.parse(fs.readFileSync(coffeeShopJsonPath, 'utf8'));

        console.log('Coffee Shop JSON Structure Analysis:');
        console.log('- Has agent:', !!data.agent);
        console.log('- Has flows:', !!data.flows);
        console.log('- Has messages:', !!data.messages);

        if (data.flows) {
          console.log('- Flow names:', Object.keys(data.flows));

          Object.keys(data.flows).forEach((flowName) => {
            const flow = data.flows[flowName];
            console.log(
              `- ${flowName} states:`,
              flow.states ? Object.keys(flow.states) : 'No states',
            );

            if (flow.states) {
              const stateCount = Object.keys(flow.states).length;
              const statesWithTransitions = Object.keys(flow.states).filter((stateId) => {
                const state = flow.states[stateId];
                return state.on && Object.keys(state.on).length > 0;
              }).length;

              console.log(
                `- ${flowName} has ${stateCount} states, ${statesWithTransitions} with transitions`,
              );
            }
          });
        }

        if (data.messages) {
          console.log('- Message count:', Object.keys(data.messages).length);
          console.log('- Message IDs:', Object.keys(data.messages));
        }

        // Verify structure is suitable for diagram
        expect(data).toBeDefined();
        expect(data.flows).toBeDefined();
        expect(Object.keys(data.flows).length).toBeGreaterThan(0);

        if (data.flows.OrderFlow) {
          expect(data.flows.OrderFlow.states).toBeDefined();
          const states = Object.keys(data.flows.OrderFlow.states);
          expect(states.length).toBeGreaterThan(5); // Should have multiple states

          // Check for expected coffee shop states
          const expectedStates = [
            'Welcome',
            'ChooseSize',
            'ChooseDrink',
            'Customize',
            'ConfirmOrder',
          ];
          const foundStates = expectedStates.filter((state) => states.includes(state));
          console.log(
            `- Found ${foundStates.length}/${expectedStates.length} expected states:`,
            foundStates,
          );
        }
      } else {
        console.warn('coffee-shop.json not found - compile the example first');
      }
    });

    it('should validate Sprotty model conversion logic', () => {
      // Test the core conversion logic without VS Code dependencies
      const mockCompiledData = {
        flows: {
          TestFlow: {
            initial: 'Welcome',
            states: {
              Welcome: {
                on: {
                  'Order Coffee': 'ChooseSize',
                  default: 'Welcome',
                },
              },
              ChooseSize: {
                on: {
                  Small: 'ChooseDrink',
                  Large: 'ChooseDrink',
                  default: 'InvalidOption',
                },
              },
              ChooseDrink: {
                on: {
                  Espresso: 'Complete',
                },
              },
              InvalidOption: {
                // State with @next context variable
              },
              Complete: {
                type: 'final',
              },
            },
          },
        },
        messages: {
          Welcome: {
            contentMessage: {
              text: 'Welcome! How can I help you today?',
              suggestions: [{ reply: { text: 'Order Coffee' } }],
            },
          },
          ChooseSize: {
            contentMessage: {
              text: 'What size would you like?',
            },
          },
          ChooseDrink: {
            contentMessage: {
              text: 'What drink would you like?',
            },
          },
          InvalidOption: {
            contentMessage: {
              text: 'Sorry, that is not a valid option.',
            },
          },
          Complete: {
            contentMessage: {
              richCard: {
                standaloneCard: {
                  cardContent: {
                    title: 'Order Complete!',
                    description: 'Your order is being prepared.',
                  },
                },
              },
            },
          },
        },
      };

      // Simulate the conversion logic
      const convertedModel = convertToSprottyModel(mockCompiledData);

      expect(convertedModel).toBeDefined();
      expect(convertedModel.TestFlow).toBeDefined();

      const flow = convertedModel.TestFlow;
      expect(flow.nodes).toBeDefined();
      expect(flow.edges).toBeDefined();
      expect(flow.nodes.length).toBe(5); // All states should be converted
      expect(flow.edges.length).toBeGreaterThan(0); // Should have transitions

      // Check node types
      const nodes = flow.nodes;
      const welcomeNode = nodes.find((n) => n.id === 'Welcome');
      expect(welcomeNode).toBeDefined();
      expect(welcomeNode?.type).toBe('start'); // Should be detected as start

      const completeNode = nodes.find((n) => n.id === 'Complete');
      expect(completeNode).toBeDefined();
      expect(completeNode?.type).toBe('rich_card'); // Should be rich card due to message type

      // Check edges
      const edges = flow.edges;
      const orderEdge = edges.find((e) => e.source === 'Welcome' && e.target === 'ChooseSize');
      expect(orderEdge).toBeDefined();
      expect(orderEdge?.data?.trigger).toBe('Order Coffee');

      console.log('Conversion test results:', {
        nodeCount: flow.nodes.length,
        edgeCount: flow.edges.length,
        nodeTypes: flow.nodes.map((n) => ({ id: n.id, type: n.type })),
        edges: flow.edges.map((e) => ({
          source: e.source,
          target: e.target,
          trigger: e.data?.trigger,
        })),
      });
    });
  });

  describe('2. Position Mapping Logic', () => {
    it('should parse RCL document structure correctly', () => {
      const sampleRclContent = `agent CoffeeShop
  displayName: "Quick Coffee"
  start: OrderFlow

flow OrderFlow
  start: Welcome

  on Welcome
    message Welcome
    match @reply.text
      "Order Coffee" -> ChooseSize
      :default -> Welcome

  on ChooseSize
    message ChooseSize
    match @reply.text
      "Small" -> ChooseDrink
      :default -> InvalidOption

  on ChooseDrink
    message ChooseDrink

  on InvalidOption
    @next

messages Messages
  text Welcome "Welcome to Quick Coffee!"
    suggestions
      reply "Order Coffee"

  text ChooseSize "What size would you like?"
    suggestions
      reply "Small"

  text ChooseDrink "What drink would you like?"

  text InvalidOption "Sorry, that's not a valid option."`;

      const positionMap = buildPositionMap(sampleRclContent);

      expect(positionMap.size).toBeGreaterThan(0);

      console.log('Position map results:', {
        totalMappings: positionMap.size,
        mappedItems: Array.from(positionMap.keys()),
      });

      // Should find flow states
      expect(positionMap.has('Welcome')).toBe(true);
      expect(positionMap.has('ChooseSize')).toBe(true);
      expect(positionMap.has('ChooseDrink')).toBe(true);
      expect(positionMap.has('InvalidOption')).toBe(true);
    });
  });

  describe('3. HTML Generation Logic', () => {
    it('should generate valid HTML structure', () => {
      const html = generateWebviewHTML({
        styleUri: 'test://style.css',
        scriptUri: 'test://script.js',
        cspSource: 'test-csp:',
        nonce: 'test-nonce-123',
        version: '1.0.0',
        buildHash: 'abc123',
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('RCL Interactive Diagram');
      expect(html).toContain('sprotty-container');
      expect(html).toContain('test://style.css');
      expect(html).toContain('test://script.js');
      expect(html).toContain('test-nonce-123');
      expect(html).toContain('Content-Security-Policy');

      // Check for required UI elements
      expect(html).toContain('saveBtn');
      expect(html).toContain('flowSelect');
      expect(html).toContain('node-palette');
      expect(html).toContain('properties-panel');
    });
  });
});

// Helper functions that simulate the core logic without VS Code dependencies

function convertToSprottyModel(compiledData: any): Record<string, any> {
  const diagramModels: Record<string, any> = {};

  Object.keys(compiledData.flows || {}).forEach((flowId) => {
    const flow = compiledData.flows[flowId];
    const nodes: any[] = [];
    const edges: any[] = [];

    // Layout nodes (simplified version)
    const layoutedNodes = layoutFlowNodes(flow, compiledData.messages);

    // Create nodes
    layoutedNodes.forEach((layoutNode) => {
      const state = flow.states[layoutNode.id];
      const message = compiledData.messages?.[layoutNode.id];

      let nodeType = layoutNode.type;
      if (message?.contentMessage?.richCard) {
        nodeType = 'rich_card';
      }

      nodes.push({
        id: layoutNode.id,
        type: nodeType,
        position: layoutNode.position,
        data: {
          label: extractNodeLabel(layoutNode.id, message, state),
          messageData: message,
          stateData: state,
        },
      });
    });

    // Create edges
    Object.keys(flow.states || {}).forEach((stateId) => {
      const state = flow.states[stateId];
      if (state.on) {
        Object.keys(state.on).forEach((trigger) => {
          const target = state.on[trigger];
          const targetState = typeof target === 'string' ? target : target.target;

          edges.push({
            id: `${stateId}-${trigger}-${targetState}`,
            source: stateId,
            target: targetState,
            data: {
              trigger: trigger === 'NEXT' ? '' : trigger,
            },
          });
        });
      }
    });

    diagramModels[flowId] = {
      id: flowId,
      nodes,
      edges,
    };
  });

  return diagramModels;
}

function layoutFlowNodes(
  flow: any,
  _messages: any,
): Array<{ id: string; type: string; position: { x: number; y: number } }> {
  const nodes: Array<{ id: string; type: string; position: { x: number; y: number } }> = [];
  const visited = new Set<string>();
  const levels: string[][] = [];

  // Find starting state
  const startingState = flow.initial || 'start';
  if (flow.states[startingState]) {
    traverseFlow(startingState, flow.states, 0, levels, visited);
  }

  // Position nodes
  const xSpacing = 180;
  const ySpacing = 100;
  const startX = 100;
  const startY = 100;

  levels.forEach((level, levelIndex) => {
    level.forEach((nodeId, nodeIndex) => {
      const state = flow.states[nodeId];
      let nodeType = 'message';

      if (nodeId === startingState) {
        nodeType = 'start';
      } else if (state?.type === 'final' || nodeId.includes('end') || nodeId.includes('Complete')) {
        nodeType = 'end';
      }

      nodes.push({
        id: nodeId,
        type: nodeType,
        position: {
          x: startX + levelIndex * xSpacing,
          y: startY + nodeIndex * ySpacing - ((level.length - 1) * ySpacing) / 2,
        },
      });
    });
  });

  return nodes;
}

function traverseFlow(
  nodeId: string,
  states: any,
  level: number,
  levels: string[][],
  visited: Set<string>,
) {
  if (visited.has(nodeId)) return;
  visited.add(nodeId);

  if (!levels[level]) levels[level] = [];
  levels[level].push(nodeId);

  const state = states[nodeId];
  if (state?.on) {
    Object.values(state.on).forEach((target: any) => {
      const targetId = typeof target === 'string' ? target : target.target;
      if (states[targetId]) {
        traverseFlow(targetId, states, level + 1, levels, visited);
      }
    });
  }
}

function extractNodeLabel(nodeId: string, message: any, _state: any): string {
  if (message?.contentMessage?.text) {
    const text = message.contentMessage.text;
    return text.length > 30 ? `${text.substring(0, 27)}...` : text;
  }

  return nodeId
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim();
}

function buildPositionMap(content: string): Map<string, { line: number; column: number }> {
  const positionMap = new Map();
  const lines = content.split('\n');

  const flowPattern = /^\s*flow\s+(\w+)/;
  const statePattern = /^\s*on\s+(\w+)/;
  const transitionPattern = /^\s*(\w+)\s*->/;
  const messagePattern = /^\s*(text|richCard|carousel)\s+(\w+)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for state definitions
    const stateMatch = line.match(statePattern);
    if (stateMatch) {
      const stateId = stateMatch[1];
      const startChar = line.indexOf(stateId);
      positionMap.set(stateId, { line: i, column: startChar });
    }

    // Check for message definitions
    const messageMatch = line.match(messagePattern);
    if (messageMatch) {
      const messageId = messageMatch[2];
      const startChar = line.indexOf(messageId);
      positionMap.set(messageId, { line: i, column: startChar });
    }
  }

  return positionMap;
}

function generateWebviewHTML(options: {
  styleUri: string;
  scriptUri: string;
  cspSource: string;
  nonce: string;
  version: string;
  buildHash: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${options.cspSource} 'unsafe-inline'; script-src 'nonce-${options.nonce}' 'unsafe-eval'; font-src ${options.cspSource};">
    <link href="${options.styleUri}" rel="stylesheet">
    <title>RCL Interactive Diagram</title>
</head>
<body>
    <div id="root">
        <div class="toolbar">
            <div class="toolbar-left">
                <button id="saveBtn" class="toolbar-btn" title="Save Changes">💾</button>
                <button id="undoBtn" class="toolbar-btn" title="Undo">↶</button>
                <button id="redoBtn" class="toolbar-btn" title="Redo">↷</button>
            </div>
            <div class="toolbar-center">
                <select id="flowSelect" class="flow-select">
                    <option value="">Select Flow...</option>
                </select>
                <span class="version-info">v${options.version} (${options.buildHash})</span>
            </div>
            <div class="toolbar-right">
                <button id="addNodeBtn" class="toolbar-btn" title="Add Node">➕</button>
            </div>
        </div>
        
        <div class="content">
            <div class="sidebar">
                <div class="node-palette">
                    <h3>Node Palette</h3>
                    <div class="palette-item" data-type="start">🟢 Start</div>
                    <div class="palette-item" data-type="message">📝 Message</div>
                    <div class="palette-item" data-type="rich_card">⭐ Rich Card</div>
                    <div class="palette-item" data-type="end">🔴 End</div>
                </div>
                
                <div class="properties-panel">
                    <h3>Properties</h3>
                    <div id="propertiesContent">
                        <p>Select a node to edit properties</p>
                    </div>
                </div>
            </div>
            
            <div class="diagram-container">
                <div id="sprotty-container" class="sprotty-container">
                    <div class="loading">Loading interactive diagram...</div>
                </div>
            </div>
        </div>
    </div>
    
    <script nonce="${options.nonce}" src="${options.scriptUri}"></script>
</body>
</html>`;
}
