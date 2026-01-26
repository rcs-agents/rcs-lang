import type { ICompilationOutput } from '@rcl/core';

interface MermaidGeneratorOptions {
  title?: string;
  direction?: 'TD' | 'LR' | 'BT' | 'RL';
  theme?: string;
}

/**
 * Generates Mermaid diagram from RCL compilation output
 */
export class MermaidGenerator {
  private options: MermaidGeneratorOptions;
  private nodeIndex = 0;
  private invalidNodes: Map<string, string> = new Map();

  constructor(options: MermaidGeneratorOptions = {}) {
    this.options = {
      direction: 'TD',
      ...options,
    };
  }

  /**
   * Generate Mermaid diagram code
   */
  generate(output: ICompilationOutput): string {
    const lines: string[] = [];

    // Start flowchart
    lines.push(`flowchart ${this.options.direction}`);

    // Add title as comment
    if (this.options.title || output.agent.displayName) {
      lines.push(`    %% ${this.options.title || output.agent.displayName}`);
    }

    // Generate flow diagram
    for (const [flowName, flow] of Object.entries(output.flows)) {
      lines.push(`    %% Flow: ${flowName}`);

      // Start state
      if (flow.initial) {
        lines.push(`    Start([Start]) --> ${flow.initial}`);
      }

      // Process each state
      for (const [stateName, state] of Object.entries(flow.states)) {
        lines.push(...this.generateState(stateName, state));
      }
    }

    // Add style definitions
    lines.push('');
    lines.push(this.generateStyles());

    return lines.join('\n');
  }

  /**
   * Generate Mermaid code for a state
   */
  private generateState(stateName: string, state: any): string[] {
    const lines: string[] = [];

    lines.push(`    `);
    lines.push(`    %% ${stateName} state`);

    // Handle transitions
    if (state.on && Object.keys(state.on).length > 0) {
      // Check if all transitions have the same discriminant (match block)
      const transitions = Object.entries(state.on);
      const isMatchBlock = this.isMatchBlock(transitions);

      if (isMatchBlock) {
        // Generate match block
        lines.push(...this.generateMatchBlock(stateName, transitions, state.always));
      } else {
        // Generate individual transitions
        for (const [event, target] of transitions) {
          if (typeof target === 'string') {
            lines.push(`    ${stateName} -->|"${event}"| ${target}`);
          } else if (target && (target as any).target) {
            lines.push(`    ${stateName} -->|"${event}"| ${(target as any).target}`);
          }
        }
      }
    }

    // Handle always transition
    if (state.always && !this.isMatchBlock(Object.entries(state.on || {}))) {
      if (typeof state.always === 'string') {
        lines.push(`    ${stateName} -.->|always| ${state.always}`);
      }
    }

    // Handle direct transition (no match block, just a single target)
    if (!state.on && !state.always && (state as any).target) {
      lines.push(`    ${stateName} --> ${(state as any).target}`);
    }

    return lines;
  }

  /**
   * Generate match block visualization
   */
  private generateMatchBlock(
    stateName: string,
    transitions: [string, any][],
    defaultTarget?: any,
  ): string[] {
    const lines: string[] = [];
    const matchNodeName = `${stateName}_match`;
    const discriminant = this.extractDiscriminant(transitions) || '@reply.text';

    // Create match node with diamond shape
    lines.push(`    ${stateName} --> ${matchNodeName}{${stateName}<br/>match ${discriminant}}`);

    // Add transitions from match node
    for (const [event, target] of transitions) {
      const targetName = typeof target === 'string' ? target : target?.target;
      if (targetName) {
        // Extract the match value from the event
        const matchValue = event.replace(/^match_/, '');

        // Check if target is an InvalidOption state
        if (targetName === 'InvalidOption') {
          // Create unique invalid option node
          const invalidNodeId = `InvalidOption_${stateName}_${matchValue}`;
          const contextInfo = this.extractContextInfo(target);
          lines.push(
            `    ${matchNodeName} -->|"${matchValue}"| ${invalidNodeId}[InvalidOption<br/>${contextInfo}]`,
          );

          // InvalidOption returns to its next state
          if (contextInfo.includes('next:')) {
            const nextState = contextInfo.match(/next:\s*(\w+)/)?.[1];
            if (nextState) {
              lines.push(`    ${invalidNodeId} --> ${nextState}`);
            }
          }
        } else {
          lines.push(`    ${matchNodeName} -->|"${matchValue}"| ${targetName}`);
        }
      }
    }

    // Add default transition
    if (defaultTarget) {
      const targetName = typeof defaultTarget === 'string' ? defaultTarget : defaultTarget?.target;
      lines.push(`    ${matchNodeName} -.->|default| ${targetName}`);
    }

    return lines;
  }

  /**
   * Check if transitions form a match block pattern
   */
  private isMatchBlock(transitions: [string, any][]): boolean {
    // Match blocks typically have events like "match_value" or similar pattern
    return transitions.some(([event]) => event.startsWith('match_'));
  }

  /**
   * Extract discriminant from match transitions
   */
  private extractDiscriminant(transitions: [string, any][]): string | null {
    // Look for condition-based transitions
    for (const [, target] of transitions) {
      if (target && target.cond && target.cond.discriminant) {
        return target.cond.discriminant;
      }
    }
    return null;
  }

  /**
   * Extract context information for display
   */
  private extractContextInfo(target: any): string {
    if (target && target.context) {
      const parts: string[] = [];
      for (const [key, value] of Object.entries(target.context)) {
        parts.push(`${key}: ${value}`);
      }
      return parts.join('<br/>');
    }
    return '';
  }

  /**
   * Generate style definitions
   */
  private generateStyles(): string {
    return `    %% Style definitions
    classDef stateNode fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef matchNode fill:#b3e5fc,stroke:#0277bd,stroke-width:2px
    classDef invalidNode fill:#ffcdd2,stroke:#b71c1c,stroke-width:2px
    classDef startNode fill:#ffffff,stroke:#0277bd,stroke-width:2px
    
    %% Apply styles to nodes (add node names as needed)`;
  }
}

/**
 * Generate Mermaid diagram from compilation output
 */
export function generateMermaidDiagram(
  output: ICompilationOutput,
  options?: MermaidGeneratorOptions,
): string {
  const generator = new MermaidGenerator(options);
  return generator.generate(output);
}
