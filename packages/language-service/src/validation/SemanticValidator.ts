// TODO: Replace with actual validation utilities
// import { schemaValidator, ValidationResult, ValidationError } from '@rcs-lang/validation';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  message: string;
  line?: number;
  column?: number;
}

export interface SemanticValidationError {
  line: number;
  column: number;
  length: number;
  message: string;
  severity: 'error' | 'warning' | 'information';
  code?: string;
  source: string;
}

export interface SemanticValidationResult {
  errors: SemanticValidationError[];
  warnings: SemanticValidationError[];
  information: SemanticValidationError[];
}

/**
 * Semantic validator for RCL files that integrates schema validation
 * with language-specific semantic analysis
 */
export class SemanticValidator {
  private messageNormalizer: any;
  private agentExtractor: any;
  private flowCompiler: any;

  constructor() {
    // Import normalizers dynamically to avoid circular dependencies
    this.loadDependencies();
  }

  private async loadDependencies() {
    try {
      // These would normally be injected or imported
      // For now, we'll implement basic semantic validation without CLI dependencies
    } catch (error) {
      console.warn('Could not load CLI dependencies for semantic validation:', error);
    }
  }

  /**
   * Validate an RCL document's semantics including schema compliance
   */
  validateDocument(content: string, _uri: string): SemanticValidationResult {
    const result: SemanticValidationResult = {
      errors: [],
      warnings: [],
      information: [],
    };

    try {
      // Parse the document structure
      const parsedStructure = this.parseRCLStructure(content);

      // Validate agent configuration if present
      if (parsedStructure.agent) {
        const agentValidation = this.validateAgentSection(parsedStructure.agent, content);
        this.mergeValidationResults(result, agentValidation);
      }

      // Validate messages section
      if (parsedStructure.messages) {
        const messagesValidation = this.validateMessagesSection(parsedStructure.messages, content);
        this.mergeValidationResults(result, messagesValidation);
      }

      // Validate flows section
      if (parsedStructure.flows) {
        const flowsValidation = this.validateFlowsSection(parsedStructure.flows, content);
        this.mergeValidationResults(result, flowsValidation);
      }

      // Validate cross-references
      const crossRefValidation = this.validateCrossReferences(parsedStructure, content);
      this.mergeValidationResults(result, crossRefValidation);
    } catch (error) {
      result.errors.push({
        line: 0,
        column: 0,
        length: 0,
        message: `Semantic validation failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'error',
        code: 'semantic.parse_error',
        source: 'rcl-semantic',
      });
    }

    return result;
  }

  private parseRCLStructure(content: string) {
    const lines = content.split('\n');
    const structure: any = {
      agent: null,
      messages: [],
      flows: [],
    };

    let currentSection = '';
    let currentFlow = null;
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) continue;

      // Agent section
      if (trimmed.startsWith('agent ')) {
        const agentName = trimmed.replace('agent ', '').trim();
        structure.agent = {
          name: agentName,
          line: lineNumber,
          column: line.indexOf('agent '),
          displayName: null,
          brandName: null,
        };
        currentSection = 'agent';
        continue;
      }

      // Agent properties
      if (currentSection === 'agent') {
        if (trimmed.startsWith('display-name:')) {
          const displayName = trimmed.replace('display-name:', '').trim().replace(/['"]/g, '');
          if (structure.agent) {
            structure.agent.displayName = displayName;
            structure.agent.displayNameLine = lineNumber;
          }
        } else if (trimmed.startsWith('brand-name:')) {
          const brandName = trimmed.replace('brand-name:', '').trim().replace(/['"]/g, '');
          if (structure.agent) {
            structure.agent.brandName = brandName;
            structure.agent.brandNameLine = lineNumber;
          }
        }
      }

      // Messages section
      if (trimmed === 'messages') {
        currentSection = 'messages';
        continue;
      }

      // Parse messages
      if (currentSection === 'messages') {
        if (trimmed.includes(':')) {
          const colonIndex = trimmed.indexOf(':');
          const id = trimmed.substring(0, colonIndex).trim();
          const text = trimmed
            .substring(colonIndex + 1)
            .trim()
            .replace(/['"]/g, '');

          structure.messages.push({
            id,
            text,
            line: lineNumber,
            column: line.indexOf(id),
          });
        } else if (trimmed.startsWith('text ') || trimmed.startsWith('transactional ')) {
          const parts = trimmed.split(' ');
          if (parts.length >= 3) {
            const type = parts[0];
            const id = parts[1];
            const text = parts.slice(2).join(' ').replace(/['"]/g, '');

            structure.messages.push({
              id,
              text,
              type,
              line: lineNumber,
              column: line.indexOf(id),
            });
          }
        }
      }

      // Flow section
      if (trimmed.startsWith('flow ')) {
        const flowName = trimmed.replace('flow ', '').trim();
        currentFlow = {
          id: flowName,
          line: lineNumber,
          column: line.indexOf('flow '),
          states: [] as any[],
          transitions: [] as any[],
        };
        structure.flows.push(currentFlow);
        currentSection = 'flow';
        continue;
      }

      // Parse flow transitions
      if (currentSection === 'flow' && trimmed.includes('->')) {
        const [from, to] = trimmed.split('->').map((s) => s.trim());
        if (currentFlow) {
          currentFlow.transitions.push({
            from,
            to,
            line: lineNumber,
            column: line.indexOf('->'),
          });
        }
      }
    }

    return structure;
  }

  private validateAgentSection(agent: any, _content: string): SemanticValidationResult {
    const result: SemanticValidationResult = {
      errors: [],
      warnings: [],
      information: [],
    };

    // Validate agent name format
    if (!/^[A-Z][A-Za-z0-9_]*$/.test(agent.name)) {
      result.errors.push({
        line: agent.line - 1,
        column: agent.column,
        length: agent.name.length,
        message:
          'Agent name must start with uppercase letter and contain only alphanumeric characters and underscores',
        severity: 'error',
        code: 'semantic.invalid_agent_name',
        source: 'rcl-semantic',
      });
    }

    // Check for required display name
    if (!agent.displayName) {
      result.warnings.push({
        line: agent.line - 1,
        column: 0,
        length: 0,
        message: 'Agent should have a display-name for better user experience',
        severity: 'warning',
        code: 'semantic.missing_display_name',
        source: 'rcl-semantic',
      });
    }

    // Validate display name constraints
    if (agent.displayName && agent.displayName.length > 50) {
      result.errors.push({
        line: agent.displayNameLine - 1,
        column: 0,
        length: agent.displayName.length,
        message: 'Display name should not exceed 50 characters',
        severity: 'error',
        code: 'semantic.display_name_too_long',
        source: 'rcl-semantic',
      });
    }

    return result;
  }

  private validateMessagesSection(messages: any[], _content: string): SemanticValidationResult {
    const result: SemanticValidationResult = {
      errors: [],
      warnings: [],
      information: [],
    };

    const messageIds = new Set<string>();

    for (const message of messages) {
      // Check for duplicate message IDs
      if (messageIds.has(message.id)) {
        result.errors.push({
          line: message.line - 1,
          column: message.column,
          length: message.id.length,
          message: `Duplicate message ID: ${message.id}`,
          severity: 'error',
          code: 'semantic.duplicate_message_id',
          source: 'rcl-semantic',
        });
      } else {
        messageIds.add(message.id);
      }

      // Validate message ID format
      if (!/^[A-Z][A-Za-z0-9_]*$/.test(message.id)) {
        result.errors.push({
          line: message.line - 1,
          column: message.column,
          length: message.id.length,
          message:
            'Message ID must start with uppercase letter and contain only alphanumeric characters and underscores',
          severity: 'error',
          code: 'semantic.invalid_message_id',
          source: 'rcl-semantic',
        });
      }

      // Validate message text constraints using schema validator
      const _normalizedMessage = {
        contentMessage: { text: message.text },
        messageTrafficType: message.type === 'transactional' ? 'TRANSACTION' : 'TRANSACTION',
      };

      // TODO: Implement actual schema validation
      const validation = { valid: true, errors: [] as any[] }; // stub
      if (!validation.valid) {
        validation.errors.forEach((error: any) => {
          result.errors.push({
            line: message.line - 1,
            column: message.column,
            length: message.text.length,
            message: error.message,
            severity: 'error',
            code: `schema.${error.field.replace(/\./g, '_')}`,
            source: 'rcl-schema',
          });
        });
      }

      // Check for empty messages
      if (!message.text || message.text.trim().length === 0) {
        result.errors.push({
          line: message.line - 1,
          column: message.column,
          length: message.id.length,
          message: 'Message text cannot be empty',
          severity: 'error',
          code: 'semantic.empty_message_text',
          source: 'rcl-semantic',
        });
      }
    }

    return result;
  }

  private validateFlowsSection(flows: any[], _content: string): SemanticValidationResult {
    const result: SemanticValidationResult = {
      errors: [],
      warnings: [],
      information: [],
    };

    const flowIds = new Set<string>();

    for (const flow of flows) {
      // Check for duplicate flow IDs
      if (flowIds.has(flow.id)) {
        result.errors.push({
          line: flow.line - 1,
          column: flow.column,
          length: flow.id.length,
          message: `Duplicate flow ID: ${flow.id}`,
          severity: 'error',
          code: 'semantic.duplicate_flow_id',
          source: 'rcl-semantic',
        });
      } else {
        flowIds.add(flow.id);
      }

      // Validate flow ID format
      if (!/^[A-Z][A-Za-z0-9_]*$/.test(flow.id)) {
        result.errors.push({
          line: flow.line - 1,
          column: flow.column,
          length: flow.id.length,
          message:
            'Flow ID must start with uppercase letter and contain only alphanumeric characters and underscores',
          severity: 'error',
          code: 'semantic.invalid_flow_id',
          source: 'rcl-semantic',
        });
      }

      // Check for empty flows
      if (flow.transitions.length === 0) {
        result.warnings.push({
          line: flow.line - 1,
          column: flow.column,
          length: flow.id.length,
          message: 'Flow has no transitions defined',
          severity: 'warning',
          code: 'semantic.empty_flow',
          source: 'rcl-semantic',
        });
      }

      // Validate flow transitions
      this.validateFlowTransitions(flow, result);
    }

    return result;
  }

  private validateFlowTransitions(flow: any, result: SemanticValidationResult) {
    const states = new Set<string>();

    for (const transition of flow.transitions) {
      states.add(transition.from);
      states.add(transition.to);

      // Check for self-loops (might be intentional, so warning)
      if (transition.from === transition.to) {
        result.warnings.push({
          line: transition.line - 1,
          column: transition.column,
          length: transition.from.length + transition.to.length + 2,
          message: `Flow transition creates a self-loop: ${transition.from} -> ${transition.to}`,
          severity: 'warning',
          code: 'semantic.flow_self_loop',
          source: 'rcl-semantic',
        });
      }
    }

    // Check for unreachable states (states that are never transitioned to from start)
    const reachableStates = new Set<string>();
    if (states.has('start')) {
      this.findReachableStates('start', flow.transitions, reachableStates);
    }

    states.forEach((state) => {
      if (state !== 'start' && !reachableStates.has(state)) {
        const transition = flow.transitions.find((t: any) => t.from === state || t.to === state);
        if (transition) {
          result.warnings.push({
            line: transition.line - 1,
            column: transition.column,
            length: state.length,
            message: `State '${state}' may be unreachable from start`,
            severity: 'warning',
            code: 'semantic.unreachable_state',
            source: 'rcl-semantic',
          });
        }
      }
    });
  }

  private findReachableStates(current: string, transitions: any[], reachable: Set<string>) {
    if (reachable.has(current)) return;

    reachable.add(current);

    transitions
      .filter((t) => t.from === current)
      .forEach((t) => this.findReachableStates(t.to, transitions, reachable));
  }

  private validateCrossReferences(structure: any, _content: string): SemanticValidationResult {
    const result: SemanticValidationResult = {
      errors: [],
      warnings: [],
      information: [],
    };

    // Collect all message IDs
    const messageIds = new Set(structure.messages.map((m: any) => m.id));

    // Check if flow states reference existing messages
    for (const flow of structure.flows) {
      for (const transition of flow.transitions) {
        [transition.from, transition.to].forEach((state) => {
          if (state !== 'start' && state !== 'end' && !messageIds.has(state)) {
            result.warnings.push({
              line: transition.line - 1,
              column: transition.column,
              length: state.length,
              message: `Flow state '${state}' does not reference an existing message`,
              severity: 'warning',
              code: 'semantic.undefined_message_reference',
              source: 'rcl-semantic',
            });
          }
        });
      }
    }

    // Check for unused messages
    const usedMessages = new Set<string>();
    for (const flow of structure.flows) {
      for (const transition of flow.transitions) {
        [transition.from, transition.to].forEach((state) => {
          if (messageIds.has(state)) {
            usedMessages.add(state);
          }
        });
      }
    }

    structure.messages.forEach((message: any) => {
      if (!usedMessages.has(message.id)) {
        result.information.push({
          line: message.line - 1,
          column: message.column,
          length: message.id.length,
          message: `Message '${message.id}' is defined but not used in any flow`,
          severity: 'information',
          code: 'semantic.unused_message',
          source: 'rcl-semantic',
        });
      }
    });

    return result;
  }

  private mergeValidationResults(
    target: SemanticValidationResult,
    source: SemanticValidationResult,
  ) {
    target.errors.push(...source.errors);
    target.warnings.push(...source.warnings);
    target.information.push(...source.information);
  }
}
