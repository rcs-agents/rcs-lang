import type { RCLNode } from '../utils/parserWrapper';

export interface XStateConfig {
  id: string;
  initial: string;
  states: Record<string, XStateState>;
  context?: Record<string, unknown>;
}

export interface XStateState {
  on?: Record<string, string | XStateTransition>;
  entry?: string | string[];
  exit?: string | string[];
  always?: XStateTransition | XStateTransition[];
  meta?: Record<string, unknown>;
}

export interface XStateTransition {
  target: string;
  cond?: string;
  actions?: string | string[];
}

export class FlowCompiler {
  compileFlows(ast: RCLNode): Record<string, XStateConfig> {
    const flows: Record<string, XStateConfig> = {};

    this.traverseAST(ast, (node) => {
      if (node.type === 'flow_section') {
        const flowId = this.extractFlowId(node);
        const flowConfig = this.compileFlow(node);

        if (flowId && flowConfig) {
          flows[flowId] = flowConfig;
        }
      }
    });

    return flows;
  }

  private traverseAST(node: RCLNode, callback: (node: RCLNode) => void): void {
    callback(node);
    if (node.children) {
      for (const child of node.children) {
        this.traverseAST(child, callback);
      }
    }
  }

  private extractFlowId(node: RCLNode): string | null {
    // Flow section should have identifier as second child
    if (node.children && node.children.length >= 2) {
      const idNode = node.children[1];
      if (idNode.type === 'identifier') {
        return idNode.text || undefined;
      }
    }
    return null;
  }

  private compileFlow(node: RCLNode): XStateConfig | null {
    const flowId = this.extractFlowId(node);
    if (!flowId) return null;

    const transitions = this.extractTransitions(node);
    const states = this.generateStates(transitions);
    const initial = this.findInitialState(transitions);

    return {
      id: flowId,
      initial: initial || 'start',
      states,
      context: this.extractFlowContext(node),
    };
  }

  private extractTransitions(node: RCLNode): FlowTransition[] {
    const transitions: FlowTransition[] = [];

    this.traverseAST(node, (child) => {
      if (child.type === 'flow_rule') {
        const ruleTransitions = this.parseFlowRule(child);
        transitions.push(...ruleTransitions);
      }
    });

    return transitions;
  }

  private parseFlowRule(node: RCLNode): FlowTransition[] {
    const transitions: FlowTransition[] = [];
    const operands: string[] = [];
    const conditions: string[] = [];
    const actions: string[] = [];

    // Extract operands (states/actions)
    this.traverseAST(node, (child) => {
      if (child.type === 'flow_operand_or_expression') {
        const operand = this.extractOperand(child);
        if (operand) {
          operands.push(operand);
        }
      }

      if (child.type === 'when_clause') {
        const condition = this.extractCondition(child);
        if (condition) {
          conditions.push(condition);
        }
      }

      if (child.type === 'with_clause') {
        const action = this.extractWithClause(child);
        if (action) {
          actions.push(action);
        }
      }
    });

    // Create transitions between consecutive operands
    for (let i = 0; i < operands.length - 1; i++) {
      const from = operands[i];
      const to = operands[i + 1];

      transitions.push({
        from,
        to,
        conditions: conditions.length > 0 ? conditions : undefined,
        actions: actions.length > 0 ? actions : undefined,
      });
    }

    return transitions;
  }

  private extractOperand(node: RCLNode): string | null {
    // Handle different types of operands
    if (node.children && node.children.length > 0) {
      const firstChild = node.children[0];

      if (firstChild.type === 'identifier' || firstChild.type === 'atom') {
        return this.cleanValue(firstChild.text || '');
      }

      if (firstChild.type === 'string') {
        return this.cleanStringValue(firstChild.text || '');
      }

      // Handle "start" keyword
      if (firstChild.text === 'start' && node.children.length > 1) {
        const secondChild = node.children[1];
        if (secondChild.type === 'identifier') {
          return `start_${this.cleanValue(secondChild.text || '')}`;
        }
      }

      // Handle "text" actions
      if (firstChild.text === 'text') {
        return 'send_text_message';
      }
    }

    return null;
  }

  private extractCondition(node: RCLNode): string | null {
    // Extract JavaScript/TypeScript conditions
    for (const child of node.children || []) {
      if (child.type === 'embedded_code') {
        return this.extractEmbeddedCode(child);
      }
    }
    return null;
  }

  private extractWithClause(node: RCLNode): string | null {
    // Extract action parameters from with clause
    const params: Record<string, any> = {};

    this.traverseAST(node, (child) => {
      if (child.type === 'attribute_key' && child.parent) {
        const key = child.text || '';
        const value = this.extractAttributeValue(child.parent);
        if (value) {
          params[key] = value;
        }
      }
    });

    return Object.keys(params).length > 0 ? JSON.stringify(params) : null;
  }

  private extractAttributeValue(node: RCLNode): unknown {
    for (const child of node.children || []) {
      if (child.type === 'string') {
        return this.cleanStringValue(child.text || '');
      }
      if (child.type === 'number') {
        return Number.parseFloat(child.text || '0');
      }
      if (child.type === 'boolean_literal') {
        return ['True', 'Yes', 'On', 'Enabled', 'Active'].includes(child.text || '');
      }
      if (child.type === 'atom') {
        return this.cleanValue(child.text || '');
      }
    }
    return null;
  }

  private extractEmbeddedCode(node: RCLNode): string | null {
    // Extract JavaScript/TypeScript code from embedded code blocks
    if (node.children) {
      for (const child of node.children) {
        if (
          child.type === 'single_line_embedded_code' ||
          child.type === 'multi_line_embedded_code'
        ) {
          return this.cleanEmbeddedCode(child.text || '');
        }
      }
    }
    return node.text ? this.cleanEmbeddedCode(node.text) : null;
  }

  private cleanEmbeddedCode(code: string): string {
    // Remove $js>, $ts>, $>>> markers and clean up
    return code
      .replace(/\$((js|ts)?>?)\s*/, '')
      .replace(/\$((js|ts)?)>>>/g, '')
      .trim();
  }

  private generateStates(transitions: FlowTransition[]): Record<string, XStateState> {
    const states: Record<string, XStateState> = {};
    const stateNames = new Set<string>();

    // Collect all state names
    transitions.forEach((t) => {
      stateNames.add(t.from);
      stateNames.add(t.to);
    });

    // Generate state configurations
    stateNames.forEach((stateName) => {
      const stateTransitions = transitions.filter((t) => t.from === stateName);
      const state: XStateState = {};

      if (stateTransitions.length > 0) {
        state.on = {};

        stateTransitions.forEach((transition) => {
          const event = this.generateEventName(transition);

          if (transition.conditions && transition.conditions.length > 0) {
            state.on![event] = {
              target: transition.to,
              cond: transition.conditions[0], // Use first condition
              actions: transition.actions,
            };
          } else {
            state.on![event] = transition.actions
              ? {
                  target: transition.to,
                  actions: transition.actions,
                }
              : transition.to;
          }
        });
      }

      // Add entry/exit actions based on state name
      if (stateName.includes('send_') || stateName.includes('message')) {
        state.entry = [`send_message_${stateName}`];
      }

      states[stateName] = state;
    });

    return states;
  }

  private generateEventName(transition: FlowTransition): string {
    // Generate event names based on transition characteristics
    if (transition.conditions && transition.conditions.length > 0) {
      return 'CONDITIONAL_NEXT';
    }

    if (transition.actions && transition.actions.length > 0) {
      return 'ACTION_COMPLETE';
    }

    return 'NEXT';
  }

  private findInitialState(transitions: FlowTransition[]): string | null {
    // Find the state that is never a target (initial state)
    const targets = new Set(transitions.map((t) => t.to));
    const sources = new Set(transitions.map((t) => t.from));

    for (const source of sources) {
      if (!targets.has(source)) {
        return source;
      }
    }

    // Fallback to "start" if no clear initial state
    for (const source of sources) {
      if (source.includes('start')) {
        return source;
      }
    }

    return transitions.length > 0 ? transitions[0].from : null;
  }

  private extractFlowContext(node: RCLNode): Record<string, unknown> {
    const context: Record<string, unknown> = {};

    // Extract default values and configuration from the flow
    this.traverseAST(node, (child) => {
      if (child.type === 'with_clause') {
        const params = this.extractWithClause(child);
        if (params) {
          try {
            Object.assign(context, JSON.parse(params));
          } catch (_e) {
            // Ignore parsing errors
          }
        }
      }
    });

    return context;
  }

  private cleanValue(value: string): string {
    return value.replace(/^:/, '').trim();
  }

  private cleanStringValue(value: string): string {
    return value.replace(/^["']|["']$/g, '').trim();
  }
}

interface FlowTransition {
  from: string;
  to: string;
  conditions?: string[];
  actions?: string[];
}
