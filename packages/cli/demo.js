#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

function parseRCLDemo(content) {
  const lines = content.split('\n');
  const result = {
    messages: {},
    flows: {},
    agent: { name: 'UnknownAgent' },
  };

  let currentSection = '';
  let currentFlow = null;
  let inAgentBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check if we're leaving the agent block (new top-level section)
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      if (trimmed.startsWith('flow ') || trimmed === 'messages') {
        inAgentBlock = false;
      }
    }

    // Agent definition
    if (trimmed.startsWith('agent ')) {
      const agentName = trimmed.replace('agent ', '');
      result.agent.name = agentName;
      currentSection = 'agent';
      inAgentBlock = true;
      continue;
    }

    // Parse agent properties when inside agent block
    if (inAgentBlock) {
      // Display name (both formats: displayName: and display-name:)
      if (trimmed.startsWith('displayName:') || trimmed.startsWith('display-name:')) {
        const value = trimmed
          .replace(/display-?Name:/i, '')
          .trim()
          .replace(/['"]/g, '');
        result.agent.displayName = value;
        continue;
      }

      // Brand name (both formats: brandName: and brand-name:)
      if (trimmed.startsWith('brandName:') || trimmed.startsWith('brand-name:')) {
        const value = trimmed
          .replace(/brand-?Name:/i, '')
          .trim()
          .replace(/['"]/g, '');
        result.agent.brandName = value;
        continue;
      }

      // Skip nested agent config sections for now (agentConfig, agentDefaults)
      if (trimmed.startsWith('agentConfig ') || trimmed.startsWith('agentDefaults ')) {
        continue;
      }
    }

    // Flow section
    if (trimmed.startsWith('flow ')) {
      const flowName = trimmed.replace('flow ', '');
      currentSection = 'flow';
      currentFlow = {
        id: flowName,
        initial: 'start',
        states: {
          start: { on: {} },
          end: { type: 'final' },
        },
      };
      result.flows[flowName] = currentFlow;
      continue;
    }

    // Messages section
    if (trimmed === 'messages') {
      currentSection = 'messages';
      continue;
    }

    // Parse flow transitions
    if (currentSection === 'flow' && trimmed.includes('->')) {
      const [from, to] = trimmed.split('->').map((s) => s.trim());
      if (currentFlow) {
        if (!currentFlow.states[from]) {
          currentFlow.states[from] = { on: {} };
        }
        currentFlow.states[from].on.NEXT = to;

        if (!currentFlow.states[to]) {
          currentFlow.states[to] = { on: {} };
        }
      }
    }

    // Parse messages
    if (currentSection === 'messages' && trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':');
      const id = trimmed.substring(0, colonIndex).trim();
      const text = trimmed
        .substring(colonIndex + 1)
        .trim()
        .replace(/['"]/g, '');

      result.messages[id] = {
        contentMessage: {
          text: text,
        },
        messageTrafficType: 'TRANSACTION',
      };
    }

    // Parse text shortcuts
    if (trimmed.startsWith('text ')) {
      const parts = trimmed.split(' ');
      if (parts.length >= 3) {
        const id = parts[1];
        const text = parts.slice(2).join(' ').replace(/['"]/g, '');
        result.messages[id] = {
          contentMessage: {
            text: text,
          },
          messageTrafficType: 'TRANSACTION',
        };
      }
    }

    // Parse richCard messages
    if (trimmed.startsWith('richCard ')) {
      const match = trimmed.match(/richCard\s+(\w+)\s+"([^"]+)"/);
      if (match) {
        const [, id, title] = match;
        result.messages[id] = {
          contentMessage: {
            richCard: {
              standaloneCard: {
                cardContent: {
                  title: title,
                  description: '',
                },
              },
            },
          },
          messageTrafficType: 'TRANSACTION',
        };
      }
    }

    // Parse carousel messages
    if (trimmed.startsWith('carousel ')) {
      const match = trimmed.match(/carousel\s+(\w+)\s+"([^"]+)"/);
      if (match) {
        const [, id, _title] = match;
        result.messages[id] = {
          contentMessage: {
            richCard: {
              carouselCard: {
                cardWidth: 'MEDIUM',
                cardContents: [],
              },
            },
          },
          messageTrafficType: 'TRANSACTION',
        };
      }
    }

    // Parse file messages
    if (trimmed.startsWith('file ')) {
      const match = trimmed.match(/file\s+(\w+)\s+<url\s+([^>]+)>\s+"([^"]+)"/);
      if (match) {
        const [, id, url, caption] = match;
        result.messages[id] = {
          contentMessage: {
            uploadedRbmFile: {
              fileName: caption,
              fileUri: url,
              thumbnailUri: url,
            },
          },
          messageTrafficType: 'TRANSACTION',
        };
      }
    }

    // Parse transactional messages
    if (trimmed.startsWith('transactional ')) {
      const parts = trimmed.split(' ');
      if (parts.length >= 3) {
        const _messageType = parts[0];
        const id = parts[1];
        const text = parts.slice(2).join(' ').replace(/['"]/g, '');
        result.messages[id] = {
          contentMessage: {
            text: text,
          },
          messageTrafficType: 'TRANSACTION',
        };
      }
    }
  }

  return result;
}

function generateJavaScript(output) {
  return `// Generated by RCL CLI Demo
// This file contains the compiled output from your RCL agent definition

/**
 * Messages dictionary - Maps message IDs to normalized AgentMessage objects
 * Each message follows the schema defined in @schemas/agent-message.schema.json
 */
export const messages = ${JSON.stringify(output.messages, null, 2)};

/**
 * Flow configurations - XState machine definitions for each flow
 * Each flow can be used to create XState machines for conversation logic
 */
export const flows = ${JSON.stringify(output.flows, null, 2)};

/**
 * Agent configuration - Contains agent properties, config, and defaults
 * Includes display name, branding, contact info, and default settings
 */
export const agent = ${JSON.stringify(output.agent, null, 2)};

/**
 * Utility functions for working with the compiled agent
 */

/**
 * Get a message by ID
 * @param {string} messageId - The message ID
 * @returns {object|null} - The normalized message object or null if not found
 */
export function getMessage(messageId) {
  return messages[messageId] || null;
}

/**
 * Get a flow configuration by ID
 * @param {string} flowId - The flow ID
 * @returns {object|null} - The XState configuration or null if not found
 */
export function getFlow(flowId) {
  return flows[flowId] || null;
}

/**
 * Create XState machine from flow configuration
 * @param {string} flowId - The flow ID
 * @param {object} options - Additional XState machine options
 * @returns {object|null} - XState machine configuration
 */
export function createMachine(flowId, options = {}) {
  const flowConfig = getFlow(flowId);
  if (!flowConfig) {
    return null;
  }

  return {
    ...flowConfig,
    ...options
  };
}

// Default export containing all exports
export default {
  messages,
  flows,
  agent,
  getMessage,
  getFlow,
  createMachine
};
`;
}

function generateJSON(output, pretty = true) {
  return pretty ? JSON.stringify(output, null, 2) : JSON.stringify(output);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('RCL CLI Demo - Compile RCL files to JavaScript/JSON');
    console.log('');
    console.log('Usage:');
    console.log('  node demo.js <input.rcl> [options]');
    console.log('');
    console.log('Options:');
    console.log('  -o, --output <file>    Output file path');
    console.log('  -f, --format <format>  Output format: js (default) or json');
    console.log('  --pretty               Pretty print JSON output');
    console.log('');
    console.log('Examples:');
    console.log('  node demo.js agent.rcl');
    console.log('  node demo.js agent.rcl -o compiled.js');
    console.log('  node demo.js agent.rcl -f json --pretty');
    process.exit(1);
  }

  const inputPath = args[0];
  let outputPath = null;
  let format = 'js';
  let pretty = true;

  // Parse arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-o' || arg === '--output') {
      outputPath = args[++i];
    } else if (arg === '-f' || arg === '--format') {
      format = args[++i];
    } else if (arg === '--pretty') {
      pretty = true;
    }
  }

  // Default output path
  if (!outputPath) {
    const parsed = path.parse(inputPath);
    const extension = format === 'js' ? '.js' : '.json';
    outputPath = path.join(parsed.dir, parsed.name + extension);
  }

  try {
    const content = fs.readFileSync(inputPath, 'utf-8');
    const parsed = parseRCLDemo(content);

    let output;
    if (format === 'js') {
      output = generateJavaScript(parsed);
    } else {
      output = generateJSON(parsed, pretty);
    }

    fs.writeFileSync(outputPath, output);

    console.log('✓ Successfully compiled RCL file');
    console.log(`  Input:  ${inputPath}`);
    console.log(`  Output: ${outputPath}`);
    console.log(`  Format: ${format.toUpperCase()}`);
    console.log(`  Agent:  ${parsed.agent.name}`);
    console.log(`  Messages: ${Object.keys(parsed.messages).length}`);
    console.log(`  Message IDs: ${Object.keys(parsed.messages).join(', ')}`);
    console.log(`  Flows: ${Object.keys(parsed.flows).length}`);
  } catch (error) {
    console.error('✗ Compilation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
