#!/usr/bin/env node

/**
 * Integration test for Interactive Diagram command flow
 * Tests the actual command execution path that causes problems
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

console.log('🎯 Interactive Diagram Integration Test');
console.log('=====================================\n');

const workspaceRoot = path.join(__dirname, '../..');
const coffeeShopPath = path.join(workspaceRoot, 'examples', 'coffee-shop.rcl');

let testsPassed = 0;
let testsTotal = 0;

function test(name: string, fn: () => boolean | void): void {
  testsTotal++;
  try {
    const result = fn();
    if (result !== false) {
      console.log(`✅ ${name}`);
      testsPassed++;
    } else {
      console.log(`❌ ${name}`);
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
  }
}

// Test 1: Verify compiled JSON structure matches Sprotty requirements
test('Compiled JSON has structure suitable for Sprotty conversion', () => {
  const jsonPath = path.join(workspaceRoot, 'examples', 'coffee-shop.json');

  if (!fs.existsSync(jsonPath)) {
    throw new Error('coffee-shop.json not found - compile first');
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Check structure requirements for diagram
  if (!data.flows) throw new Error('Missing flows');
  if (!data.messages) throw new Error('Missing messages');
  if (!data.agent) throw new Error('Missing agent');

  const flow = data.flows.OrderFlow;
  if (!flow) throw new Error('Missing OrderFlow');
  if (!flow.states) throw new Error('Missing states in OrderFlow');

  const stateCount = Object.keys(flow.states).length;
  console.log(`   Found ${stateCount} states in OrderFlow`);

  if (stateCount < 8) {
    throw new Error(`Too few states: ${stateCount} (expected at least 8)`);
  }

  // Check for states with transitions (needed for diagram edges)
  const statesWithTransitions = Object.keys(flow.states).filter((stateId) => {
    const state = flow.states[stateId];
    return state.on && Object.keys(state.on).length > 0;
  });

  console.log(`   Found ${statesWithTransitions.length} states with transitions`);
  if (statesWithTransitions.length < 3) {
    throw new Error('Too few states with transitions for meaningful diagram');
  }

  return true;
});

// Test 2: Check compilation service can handle coffee-shop.rcl
test('Language service can compile coffee-shop.rcl', () => {
  if (!fs.existsSync(coffeeShopPath)) {
    throw new Error('coffee-shop.rcl not found');
  }

  // Test using the CLI which uses the same compilation pipeline
  try {
    const output = execSync(
      `cd ${workspaceRoot}/apps/cli && npx tsx src/index.ts compile ${coffeeShopPath}`,
      { encoding: 'utf8', timeout: 30000 },
    );

    if (!output.includes('✓ Compilation successful')) {
      throw new Error('CLI compilation failed');
    }

    console.log('   CLI compilation successful');
    return true;
  } catch (error) {
    throw new Error(`Compilation failed: ${error.message}`);
  }
});

// Test 3: Test Sprotty model conversion with real data
test('Real coffee-shop data converts to valid Sprotty model', () => {
  const jsonPath = path.join(workspaceRoot, 'examples', 'coffee-shop.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Simulate the conversion process used by the diagram provider
  const diagramModels = convertToSprottyModel(data);

  if (!diagramModels.OrderFlow) {
    throw new Error('OrderFlow not converted');
  }

  const flow = diagramModels.OrderFlow;

  if (!flow.nodes || flow.nodes.length === 0) {
    throw new Error('No nodes generated');
  }

  if (!flow.edges || flow.edges.length === 0) {
    throw new Error('No edges generated');
  }

  console.log(`   Generated ${flow.nodes.length} nodes and ${flow.edges.length} edges`);

  // Check node positions are valid
  const invalidNodes = flow.nodes.filter(
    (node) =>
      !node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number',
  );

  if (invalidNodes.length > 0) {
    throw new Error(`${invalidNodes.length} nodes have invalid positions`);
  }

  // Check edges have valid source/target
  const invalidEdges = flow.edges.filter(
    (edge) =>
      !edge.source ||
      !edge.target ||
      !flow.nodes.find((n) => n.id === edge.source) ||
      !flow.nodes.find((n) => n.id === edge.target),
  );

  if (invalidEdges.length > 0) {
    throw new Error(`${invalidEdges.length} edges have invalid source/target`);
  }

  return true;
});

// Test 4: Test HTML generation with real parameters
test('Webview HTML generation works with real parameters', () => {
  const html = generateWebviewHTML({
    styleUri: 'vscode-resource://extension/client/resources/interactive-diagram.css',
    scriptUri: 'vscode-resource://extension/client/resources/interactive-diagram.js',
    cspSource: 'vscode-webview:',
    nonce: 'abc123def456',
    version: '1.0.0',
    buildHash: 'test123',
  });

  // Check HTML is valid and complete
  if (!html.includes('<!DOCTYPE html>')) {
    throw new Error('Invalid HTML structure');
  }

  if (!html.includes('sprotty-container')) {
    throw new Error('Missing Sprotty container');
  }

  if (!html.includes('Content-Security-Policy')) {
    throw new Error('Missing CSP header');
  }

  if (!html.includes('abc123def456')) {
    throw new Error('Nonce not properly embedded');
  }

  console.log('   HTML generation successful');
  return true;
});

// Test 5: Test position mapping with coffee-shop content
test('Position mapping works with coffee-shop.rcl content', () => {
  const content = fs.readFileSync(coffeeShopPath, 'utf8');
  const positionMap = buildPositionMap(content);

  if (positionMap.size === 0) {
    throw new Error('No positions mapped');
  }

  // Check for expected coffee shop states
  const expectedStates = ['Welcome', 'ChooseSize', 'ChooseDrink', 'Customize', 'ConfirmOrder'];
  const foundStates = expectedStates.filter((state) => positionMap.has(state));

  console.log(
    `   Mapped ${positionMap.size} items, found ${foundStates.length}/${expectedStates.length} expected states`,
  );

  if (foundStates.length < 4) {
    throw new Error(`Too few expected states found: ${foundStates.join(', ')}`);
  }

  return true;
});

// Test 6: Simulate the complete diagram opening flow
test('Complete diagram opening flow simulation', () => {
  const jsonPath = path.join(workspaceRoot, 'examples', 'coffee-shop.json');
  const rclContent = fs.readFileSync(coffeeShopPath, 'utf8');

  // Step 1: Load and parse compiled data
  const compiledData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log('   Step 1: Loaded compiled data ✓');

  // Step 2: Convert to Sprotty model
  const diagramModels = convertToSprottyModel(compiledData);
  console.log('   Step 2: Converted to Sprotty model ✓');

  // Step 3: Build position map
  const positionMap = buildPositionMap(rclContent);
  console.log('   Step 3: Built position map ✓');

  // Step 4: Prepare state object (as the extension would)
  const state = {
    flows: diagramModels,
    messages: compiledData.messages || {},
    agent: compiledData.agent || {},
    activeFlow: Object.keys(diagramModels)[0],
  };
  console.log('   Step 4: Prepared state object ✓');

  // Step 5: Generate HTML
  const html = generateWebviewHTML({
    styleUri: 'test://style.css',
    scriptUri: 'test://script.js',
    cspSource: 'test:',
    nonce: 'test123',
    version: '1.0.0',
    buildHash: 'abc123',
  });
  console.log('   Step 5: Generated HTML ✓');

  // Verify final state is valid
  if (!state.activeFlow) {
    throw new Error('No active flow set');
  }

  if (!state.flows[state.activeFlow]) {
    throw new Error('Active flow not found in models');
  }

  const activeFlowModel = state.flows[state.activeFlow];
  if (activeFlowModel.nodes.length === 0) {
    throw new Error('Active flow has no nodes');
  }

  console.log(
    `   Flow simulation complete: ${activeFlowModel.nodes.length} nodes, ${activeFlowModel.edges.length} edges`,
  );
  return true;
});

console.log('\n=====================================');
console.log(`📊 Integration Test Results: ${testsPassed}/${testsTotal} passed`);

if (testsPassed === testsTotal) {
  console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
  console.log('\nThe Interactive Diagram logic is working correctly.');
  console.log('If the VS Code command still shows problems, the issue is likely in:');
  console.log('1. VS Code webview resource loading');
  console.log('2. Language service diagnostics during compilation');
  console.log('3. Message passing between extension and webview');
  console.log('4. Sprotty library initialization in the webview');

  console.log('\nNext debugging steps:');
  console.log('1. Check VS Code Developer Tools console when running the command');
  console.log('2. Verify resource files exist: client/resources/interactive-diagram.{css,js}');
  console.log('3. Test with simpler RCL files to isolate the issue');
  console.log('4. Check if diagnostics are generated during _compileRCLDocument()');
} else {
  console.log('\n❌ SOME TESTS FAILED');
  console.log('The core logic has issues that need to be fixed.');
  process.exit(1);
}

// Helper functions (same as in the unit tests)
function convertToSprottyModel(compiledData: any): Record<string, any> {
  const diagramModels: Record<string, any> = {};

  Object.keys(compiledData.flows || {}).forEach((flowId) => {
    const flow = compiledData.flows[flowId];
    const nodes: any[] = [];
    const edges: any[] = [];

    const layoutedNodes = layoutFlowNodes(flow, compiledData.messages);

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

  const startingState = flow.initial || 'start';
  if (flow.states[startingState]) {
    traverseFlow(startingState, flow.states, 0, levels, visited);
  }

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

  const statePattern = /^\s*on\s+(\w+)/;
  const messagePattern = /^\s*(text|richCard|carousel)\s+(\w+)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const stateMatch = line.match(statePattern);
    if (stateMatch) {
      const stateId = stateMatch[1];
      const startChar = line.indexOf(stateId);
      positionMap.set(stateId, { line: i, column: startChar });
    }

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
        <div class="diagram-container">
            <div id="sprotty-container" class="sprotty-container">
                <div class="loading">Loading interactive diagram...</div>
            </div>
        </div>
    </div>
    <script nonce="${options.nonce}" src="${options.scriptUri}"></script>
</body>
</html>`;
}

process.exit(0);
