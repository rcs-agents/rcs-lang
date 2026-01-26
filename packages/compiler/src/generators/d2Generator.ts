import type { ICompilationOutput } from '@rcl/core';

interface D2GeneratorOptions {
  title?: string;
  theme?: string;
  includeStyles?: boolean;
  showErrorPaths?: boolean;
  separateInvalidOptions?: boolean;
}

/**
 * Generates D2 diagram from RCL compilation output
 */
export class D2Generator {
  private options: D2GeneratorOptions;
  private invalidOptionStates: Map<string, Set<string>> = new Map();
  private stateTypes: Map<string, 'match' | 'simple' | 'error'> = new Map();

  constructor(options: D2GeneratorOptions = {}) {
    this.options = {
      includeStyles: true,
      showErrorPaths: true,
      separateInvalidOptions: true,
      ...options,
    };
  }

  /**
   * Generate D2 diagram code
   */
  generate(output: ICompilationOutput): string {
    const lines: string[] = [];

    // Add title if provided
    if (this.options.title || output.agent.displayName) {
      lines.push(`title: ${this.options.title || output.agent.displayName}`);
      lines.push('');
    }

    // Generate flow diagram
    for (const [flowName, flow] of Object.entries(output.flows)) {
      lines.push(`# Flow: ${flowName}`);
      lines.push('');

      // Analyze flow structure first
      this.analyzeFlow(flow);

      // Start state
      if (flow.initial) {
        lines.push('start: {shape: circle}');
        lines.push(`start -> ${flow.initial}`);
        lines.push('');
      }

      // Process each state
      for (const [stateName, state] of Object.entries(flow.states)) {
        lines.push(...this.generateState(stateName, state, flow));
      }
    }

    // Add legend
    if (this.options.includeStyles) {
      lines.push(this.generateLegend());
    }

    return lines.join('\n');
  }

  /**
   * Analyze flow structure to identify patterns
   */
  private analyzeFlow(flow: any): void {
    // Reset state
    this.invalidOptionStates.clear();
    this.stateTypes.clear();

    // Identify state types and InvalidOption patterns
    for (const [stateName, state] of Object.entries(flow.states) as [string, any][]) {
      if (stateName === 'InvalidOption') {
        this.stateTypes.set(stateName, 'error');
      } else if (state.on && Object.keys(state.on).length > 0) {
        const transitions = Object.entries(state.on);
        if (this.isMatchBlock(transitions)) {
          this.stateTypes.set(stateName, 'match');

          // Track which states use InvalidOption
          for (const [, target] of transitions) {
            const targetName = typeof target === 'string' ? target : (target as any)?.target;
            if (targetName === 'InvalidOption' && (target as any)?.context?.next) {
              if (!this.invalidOptionStates.has(stateName)) {
                this.invalidOptionStates.set(stateName, new Set());
              }
              this.invalidOptionStates.get(stateName)!.add((target as any).context.next);
            }
          }
        } else {
          this.stateTypes.set(stateName, 'simple');
        }
      } else {
        this.stateTypes.set(stateName, 'simple');
      }
    }
  }

  /**
   * Generate D2 code for a state
   */
  private generateState(stateName: string, state: any, flow: any): string[] {
    const lines: string[] = [];

    // Skip the shared InvalidOption state if we're separating them
    if (stateName === 'InvalidOption' && this.options.separateInvalidOptions) {
      return [];
    }

    // Add state node
    lines.push(`# State: ${stateName}`);

    const stateType = this.stateTypes.get(stateName) || 'simple';
    const isMatchState = stateType === 'match';

    lines.push(`${stateName}: {`);

    // Use different shapes for different state types
    if (isMatchState) {
      lines.push('  shape: hexagon');
    } else if (stateType === 'error') {
      lines.push('  shape: rectangle');
    } else {
      lines.push('  shape: rectangle');
    }

    // Color coding
    if (stateType === 'error' || stateName.includes('Cancel') || stateName.includes('Invalid')) {
      lines.push('  style.fill: "#ffcdd2"');
    } else if (stateName.includes('Complete') || stateName.includes('Success')) {
      lines.push('  style.fill: "#c8e6c9"');
    } else {
      lines.push('  style.fill: "#e1f5fe"');
    }

    // Add entry/exit actions if present
    const actions: string[] = [];
    if (state.entry) {
      actions.push(`entry: ${this.formatAction(state.entry)}`);
    }
    if (state.exit) {
      actions.push(`exit: ${this.formatAction(state.exit)}`);
    }
    if (actions.length > 0) {
      lines.push(`  label: "${stateName}\\n${actions.join('\\n')}"`);
    }

    lines.push('}');
    lines.push('');

    // Handle transitions
    if (state.on && Object.keys(state.on).length > 0) {
      const transitions = Object.entries(state.on);

      if (isMatchState) {
        // Generate direct transitions with conditions on edges
        lines.push(...this.generateDirectMatchTransitions(stateName, transitions, state.always));
      } else {
        // Generate simple transitions
        for (const [event, target] of transitions) {
          if (typeof target === 'string') {
            lines.push(`${stateName} -> ${target}: "${event}"`);
          } else if (target && (target as any).target) {
            lines.push(`${stateName} -> ${(target as any).target}: "${event}"`);
          }
        }
      }
    }

    // Handle always transition
    if (state.always) {
      if (typeof state.always === 'string') {
        lines.push(`${stateName} -> ${state.always}: always {`);
        lines.push('  style.stroke-dash: 3');
        lines.push('}');
      }
    }

    lines.push('');
    return lines;
  }

  /**
   * Generate direct match transitions with conditions on edges
   */
  private generateDirectMatchTransitions(
    stateName: string,
    transitions: [string, any][],
    defaultTarget?: any,
  ): string[] {
    const lines: string[] = [];
    const discriminant = this.extractDiscriminant(transitions) || '@reply.text';

    // Group transitions by type
    const regularTransitions: [string, any][] = [];
    const errorTransitions: [string, any][] = [];

    for (const [event, target] of transitions) {
      const targetName = typeof target === 'string' ? target : target?.target;
      if (targetName === 'InvalidOption') {
        errorTransitions.push([event, target]);
      } else {
        regularTransitions.push([event, target]);
      }
    }

    // Generate regular transitions
    for (const [event, target] of regularTransitions) {
      const targetName = typeof target === 'string' ? target : target?.target;
      if (targetName) {
        const matchValue = event.replace(/^match_/, '');

        // Add context information if present
        let label = matchValue;
        if (target && target.context) {
          const contextParts: string[] = [];
          for (const [key, value] of Object.entries(target.context)) {
            if (key !== 'next') {
              // Skip 'next' as it's for InvalidOption
              contextParts.push(`${key}: ${value}`);
            }
          }
          if (contextParts.length > 0) {
            label = `${matchValue}\\n(${contextParts.join(', ')})`;
          }
        }

        lines.push(`${stateName} -> ${targetName}: "${label}" {`);
        lines.push('  style.stroke-width: 2');
        lines.push('}');
      }
    }

    // Handle error transitions with local InvalidOption nodes
    if (this.options.separateInvalidOptions && errorTransitions.length > 0) {
      // Create a local invalid option node
      const invalidNodeName = `${stateName}_Invalid`;

      lines.push('');
      lines.push(`${invalidNodeName}: {`);
      lines.push('  shape: rectangle');
      lines.push(`  near: ${stateName}`);
      lines.push('  style.fill: "#ffcdd2"');

      // Extract context info for label
      const contexts = new Set<string>();
      for (const [, target] of errorTransitions) {
        if (target && target.context && target.context.property) {
          contexts.add(target.context.property);
        }
      }

      if (contexts.size > 0) {
        lines.push(`  label: "Invalid ${Array.from(contexts).join('/')}"`);
      } else {
        lines.push(`  label: "Invalid Option"`);
      }

      lines.push('}');
      lines.push('');

      // Connect error cases to local invalid node
      for (const [event] of errorTransitions) {
        const matchValue = event.replace(/^match_/, '');
        lines.push(`${stateName} -> ${invalidNodeName}: "${matchValue}" {`);
        lines.push('  style.stroke-dash: 3');
        lines.push('  style.stroke: "#ff5252"');
        lines.push('}');
      }

      // Invalid node returns to the state
      lines.push(`${invalidNodeName} -> ${stateName}: "retry" {`);
      lines.push('  style.stroke-dash: 3');
      lines.push('  style.stroke: "#ff5252"');
      lines.push('}');
    } else {
      // Use shared InvalidOption pattern
      for (const [event, target] of errorTransitions) {
        const targetName = typeof target === 'string' ? target : target?.target;
        if (targetName) {
          const matchValue = event.replace(/^match_/, '');
          lines.push(`${stateName} -> ${targetName}: "${matchValue}" {`);
          lines.push('  style.stroke-dash: 3');
          lines.push('  style.stroke: "#ff5252"');
          lines.push('}');
        }
      }
    }

    // Add default transition
    if (defaultTarget) {
      lines.push('');
      const targetName = typeof defaultTarget === 'string' ? defaultTarget : defaultTarget?.target;

      // Check if default goes to self or to InvalidOption
      if (targetName === stateName) {
        // Self-loop
        lines.push(`${stateName} -> ${stateName}: "other" {`);
        lines.push('  style.stroke-dash: 3');
        lines.push('  style.stroke: "#757575"');
        lines.push('}');
      } else if (this.options.separateInvalidOptions && targetName === 'InvalidOption') {
        // Local invalid option
        const invalidNodeName = `${stateName}_Invalid`;
        lines.push(`${stateName} -> ${invalidNodeName}: "other" {`);
        lines.push('  style.stroke-dash: 3');
        lines.push('  style.stroke: "#ff5252"');
        lines.push('}');
      } else {
        // Regular default
        lines.push(`${stateName} -> ${targetName}: "default" {`);
        lines.push('  style.stroke-dash: 3');
        lines.push('}');
      }
    }

    lines.push('');
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
      if (target && typeof target === 'object' && 'cond' in target && target.cond?.discriminant) {
        return target.cond.discriminant;
      }
    }
    return null;
  }

  /**
   * Format action for display
   */
  private formatAction(action: any): string {
    if (typeof action === 'string') {
      return action;
    }
    if (action && action.type) {
      return action.type;
    }
    return JSON.stringify(action);
  }

  /**
   * Generate legend
   */
  private generateLegend(): string {
    return `
# Legend
legend: {
  shape: rectangle
  style.fill: "#f5f5f5"
  label: |md
    # Legend
    - **Circle**: Start state
    - **Rectangle**: Simple state
    - **Hexagon**: State with match conditions
    - **Red**: Error/Invalid states
    - **Green**: Success states
    - **Solid arrow**: Valid transition
    - **Dashed red arrow**: Error path
    - **Dashed gray arrow**: Default/other
  |
}`;
  }
}

/**
 * Generate D2 diagram from compilation output
 */
export function generateD2Diagram(
  output: ICompilationOutput,
  options?: D2GeneratorOptions,
): string {
  const generator = new D2Generator(options);
  return generator.generate(output);
}
