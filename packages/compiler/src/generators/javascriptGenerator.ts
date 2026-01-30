import type { ICompilationOutput } from '@rcs-lang/core';

export class JavaScriptGenerator {
  generate(output: ICompilationOutput, fileName: string): string {
    const lines: string[] = [];

    // Add header comment
    lines.push(`// Generated from ${fileName}`);
    lines.push('// Compatible with @rcs-lang/csm - Conversation State Machine library');
    lines.push('');

    // Export agent
    lines.push('export const agent = ' + JSON.stringify(output.bundle.agent, null, 2) + ';');
    lines.push('');

    // Export messages
    lines.push('export const messages = ' + JSON.stringify(output.bundle.messages, null, 2) + ';');
    lines.push('');

    // Export flows (CSM format)
    lines.push('// CSM-compliant flow definitions');
    lines.push('export const flows = ' + JSON.stringify(output.csm.machine.flows, null, 2) + ';');
    lines.push('');

    // Export machine definition
    lines.push('// Machine definition');
    lines.push('export const machine = ' + JSON.stringify(output.csm.machine, null, 2) + ';');
    lines.push('');

    // Export CSM Agent
    lines.push('// Full CSM Agent definition');
    lines.push('export const csm = ' + JSON.stringify(output.csm, null, 2) + ';');
    lines.push('');

    // Add convenience default export
    lines.push('// Convenience export');
    lines.push('export default {');
    lines.push('  agent,');
    lines.push('  messages,');
    lines.push('  flows,');
    lines.push('  csm');
    lines.push('};');
    lines.push('');

    // Add helper function to create CSM agent
    lines.push('// Helper to create ConversationalAgent with these flows');
    lines.push('export function createAgent(options) {');
    lines.push('  const { ConversationalAgent } = require("@rcs-lang/csm");');
    lines.push('  ');
    lines.push('  const agent = new ConversationalAgent({');
    lines.push('    id: agent.name,');
    lines.push('    ...options');
    lines.push('  });');
    lines.push('  ');
    lines.push('  // Add all flows');
    lines.push('  Object.values(flows).forEach(flow => {');
    lines.push('    agent.addFlow(flow);');
    lines.push('  });');
    lines.push('  ');
    lines.push('  return agent;');
    lines.push('}');
    lines.push('');

    return lines.join('\n');
  }
}
