import type {
  Attribute,
  BooleanLiteral,
  ContextOperation,
  Dictionary,
  DictionaryEntry,
  FlowInvocation,
  FlowTermination,
  Identifier,
  ImportStatement,
  List,
  MatchBlock,
  MatchCase,
  NumericLiteral,
  Parameter,
  ParameterList,
  PropertyAccess,
  RclFile,
  Section,
  SpreadDirective,
  StringLiteral,
  TargetReference,
  TypeTag,
  Value,
  Variable,
} from '@rcs-lang/ast';
import {
  isAtom,
  isAttribute,
  isBooleanLiteral,
  isContextualizedValue,
  isDictionary,
  isEmbeddedCode,
  isFlowInvocation,
  isFlowTermination,
  isIdentifier,
  isList,
  isMatchBlock,
  isNullLiteral,
  isNumericLiteral,
  isPropertyAccess,
  isSection,
  isStringLiteral,
  isTypeTag,
  isValue,
  isVariable,
} from '@rcs-lang/ast';
import { type IASTNode, type Result, err, ok } from '@rcs-lang/core';
import type { ICompilationOutput, ICompilationStage } from '@rcs-lang/core';

interface TransformInput {
  ast: IASTNode;
  diagnostics?: any[];
  validationFailed?: boolean;
  source?: string;
  uri?: string;
}

// CSM-compliant interfaces
interface CSMTransition {
  pattern?: string;
  target: string;
  context?: Record<string, any>;
  condition?: string;
  priority?: number;
  meta?: Record<string, any>;
}

interface CSMStateDefinition {
  transitions: CSMTransition[];
  meta?: {
    messageId?: string;
    transient?: boolean;
    tags?: string[];
    custom?: Record<string, any>;
  };
}

interface CSMMachineDefinition {
  id: string;
  initial: string;
  states: Record<string, CSMStateDefinition>;
  meta?: {
    name?: string;
    description?: string;
    version?: string;
    tags?: string[];
    custom?: Record<string, any>;
  };
}

/**
 * Transform stage - converts formal AST to output format
 */
export class TransformStage implements ICompilationStage {
  readonly name = 'transform';
  private defaults: Record<string, any> = {};

  async process(input: TransformInput): Promise<Result<any>> {
    try {
      if (!input.ast) {
        return err(new Error('No AST provided to transform stage'));
      }

      // Check if validation failed
      if (input.validationFailed) {
        // Still generate output for debugging, but mark as failed
        const rclFile = this.unwrapAST(input.ast);
        const output = rclFile
          ? this.transformRclFile(rclFile)
          : { agent: {}, messages: {}, flows: {} };

        return ok({
          ...input,
          ast: input.ast,
          output,
          success: false, // Mark as failed due to validation errors
          diagnostics: input.diagnostics || [],
        });
      }

      // Unwrap the AST to get the RclFile
      const rclFile = this.unwrapAST(input.ast);
      if (!rclFile) {
        return err(new Error('Invalid AST structure'));
      }

      // Transform AST to output structure
      const output = this.transformRclFile(rclFile);

      return ok({
        ...input,
        ast: input.ast,
        output,
        success: true,
        diagnostics: input.diagnostics || [],
      });
    } catch (error) {
      console.error('Transform stage error:', error);
      return err(new Error(`Transform stage failed: ${error}`));
    }
  }

  /**
   * Unwrap the IASTNode to get the underlying RclFile
   */
  private unwrapAST(ast: IASTNode): RclFile | null {
    // Check if it's already an RclFile
    if (ast && (ast as any).type === 'RclFile') {
      return ast as any as RclFile;
    }

    // The AST wrapper stores the original node
    const wrapper = ast as any;
    if (wrapper.node && wrapper.node.type === 'RclFile') {
      return wrapper.node as RclFile;
    }

    // Unknown AST type
    return null;
  }

  /**
   * Transform RclFile to compilation output
   */
  private transformRclFile(file: RclFile): ICompilationOutput {
    const flows: Record<string, CSMMachineDefinition> = {};
    let agentName = 'Agent';
    let initialFlow = '';
    
    const output: ICompilationOutput = {
      agent: {},
      messages: {},
      flows: {},
    };

    // First pass: collect flows and agent info
    for (const section of file.sections) {
      if (section.sectionType === 'agent' && section.identifier) {
        agentName = section.identifier.value;
      }
      if (section.sectionType === 'flow' && section.identifier) {
        if (!initialFlow) {
          initialFlow = section.identifier.value; // First flow becomes initial
        }
      }
    }

    // Process all sections
    for (const section of file.sections) {
      this.processSection(section, output);
    }

    // Collect flows from output.flows into a multi-flow machine
    if (Object.keys(output.flows).length > 0) {
      output.csm = {
        id: agentName,
        initialFlow: initialFlow,
        flows: output.flows,
        meta: {
          name: agentName,
        }
      };
    }

    // Apply defaults if we have them
    if (this.defaults) {
      this.applyDefaults(output);
    }

    return output;
  }

  /**
   * Extract target reference (for flow result handlers)
   */
  private extractTargetReference(target: TargetReference): string {
    if (isIdentifier(target)) {
      return `state:${target.value}`;
    }
    if (isVariable(target)) {
      return target.name;
    }
    if (isPropertyAccess(target)) {
      return `${target.object.name}.${target.properties.join('.')}`;
    }
    if (isFlowTermination(target)) {
      return `:${target.result}`;
    }
    return 'state:Unknown';
  }

  /**
   * Process context operation for flow result handlers
   */
  private processContextOperation(operation: ContextOperation): any {
    switch (operation.type) {
      case 'AppendOperation':
        return {
          append: {
            to: this.extractVariableName(operation.target),
            value: { var: 'result' }
          }
        };
      case 'SetOperation':
        return {
          set: {
            variable: this.extractVariableName(operation.target),
            value: { var: 'result' }
          }
        };
      case 'MergeOperation':
        return {
          merge: {
            into: this.extractVariableName(operation.target),
            value: { var: 'result' }
          }
        };
      default:
        return {};
    }
  }

  /**
   * Extract variable name from variable or property access
   */
  private extractVariableName(target: Variable | PropertyAccess): string {
    if (isVariable(target)) {
      return target.name.replace('@', ''); // Remove @ prefix for CSM
    }
    if (isPropertyAccess(target)) {
      return target.object.name.replace('@', '') + '.' + target.properties.join('.');
    }
    return 'unknown';
  }

  /**
   * Process a section node
   */
  private processSection(section: Section, output: ICompilationOutput): void {
    switch (section.sectionType) {
      case 'agent':
        this.processAgentSection(section, output);
        break;
      case 'flow':
        this.processFlowSection(section, output);
        break;
      case 'messages':
        this.processMessagesSection(section, output);
        break;
      case 'defaults':
        this.processDefaultsSection(section);
        break;
      case 'config':
      case 'configuration':
        this.processConfigSection(section, output);
        break;
    }
  }

  /**
   * Process agent section
   */
  private processAgentSection(section: Section, output: ICompilationOutput): void {
    if (section.identifier) {
      output.agent.name = section.identifier.value;
    }

    // Process attributes and nested sections
    for (const element of section.body) {
      if (isAttribute(element)) {
        const value = this.extractValue(element.value);
        switch (element.key) {
          case 'displayName':
            output.agent.displayName = value;
            break;
          case 'description':
            output.agent.description = value;
            break;
          case 'phoneNumber':
            output.agent.phoneNumber = value;
            break;
          case 'email':
            output.agent.email = value;
            break;
          case 'website':
            output.agent.website = value;
            break;
          case 'address':
            output.agent.address = value;
            break;
          case 'openingHours':
            output.agent.openingHours = value;
            break;
          case 'brandColor':
            output.agent.brandColor = value;
            break;
          case 'start':
            output.agent.start = value;
            break;
        }
      } else if (isSection(element)) {
        // Process nested sections
        this.processSection(element, output);
      }
    }
  }

  /**
   * Process flow section
   */
  private processFlowSection(section: Section, output: ICompilationOutput): void {
    if (!section.identifier) return;

    const flowName = section.identifier.value;

    const csmFlow: CSMMachineDefinition = {
      id: flowName,
      initial: '',
      states: {},
      meta: {
        name: flowName,
      },
    };

    // Process flow elements
    for (const element of section.body) {
      if (isAttribute(element)) {
        if (element.key === 'start') {
          const initial = this.extractValue(element.value) as string;
          csmFlow.initial = initial;
        }
      } else if (isSection(element) && element.sectionType === 'on') {
        this.processStateSectionCSM(element, csmFlow);
      }
    }

    // Store CSM-compliant flow
    output.flows[flowName] = csmFlow;
  }

  /**
   * Process messages section
   */
  private processMessagesSection(section: Section, output: ICompilationOutput): void {
    // Messages are typically defined as sub-sections
    for (const element of section.body) {
      if (isSection(element)) {
        const messageType = element.sectionType;
        const messageName = element.identifier?.value;

        if (messageName) {
          const message: any = {
            type: messageType,
          };

          // Process message attributes
          for (const msgElement of element.body) {
            if (isAttribute(msgElement)) {
              message[msgElement.key] = this.extractValue(msgElement.value);
            }
          }

          output.messages[messageName] = message;
        }
      }
    }
  }

  /**
   * Process defaults section
   */
  private processDefaultsSection(section: Section): void {
    for (const element of section.body) {
      if (isAttribute(element)) {
        this.defaults[element.key] = this.extractValue(element.value);
      }
    }
  }

  /**
   * Process configuration section
   */
  private processConfigSection(section: Section, output: ICompilationOutput): void {
    // Configuration maps to agent properties
    for (const element of section.body) {
      if (isAttribute(element)) {
        output.agent[element.key] = this.extractValue(element.value);
      }
    }
  }

  /**
   * Extract value from AST value node
   */
  private extractValue(value: Value): any {
    if (typeof value === 'string') {
      return value;
    }

    if (isStringLiteral(value)) {
      return value.value;
    }
    if (isNumericLiteral(value)) {
      return value.value;
    }
    if (isBooleanLiteral(value)) {
      return value.value;
    }
    if (isNullLiteral(value)) {
      return null;
    }
    if (isAtom(value)) {
      return value.value;
    }
    if (isIdentifier(value)) {
      return value.value;
    }
    if (isVariable(value)) {
      return value.name;
    }
    if (isContextualizedValue(value)) {
      // Extract the base value and optionally handle context parameters
      const baseValue = this.extractValue(value.value);
      if (value.context && value.context.length > 0) {
        // Return an object with value and context
        return {
          value: baseValue,
          context: value.context.map((param) => ({
            key: param.key,
            value: this.extractValue(param.value),
          })),
        };
      }
      return baseValue;
    }
    if (isTypeTag(value)) {
      // Return the value with type information
      const result: any = {
        type: value.tagName,
        value: value.value,
      };
      if (value.qualifier !== undefined) {
        result.qualifier = value.qualifier;
      }
      return result;
    }
    if (isList(value)) {
      return value.items.map((item) => this.extractValue(item));
    }
    if (isDictionary(value)) {
      const obj: Record<string, any> = {};
      for (const entry of value.entries) {
        const key = typeof entry.key === 'string' ? entry.key : entry.key.value;
        obj[key] = this.extractValue(entry.value);
      }
      return obj;
    }
    if (isEmbeddedCode(value)) {
      // Return code as string for now
      return value.code;
    }
    if (isFlowTermination(value)) {
      // Return flow termination as colon-prefixed string
      return `:${value.result}`;
    }

    return value;
  }

  /**
   * Process state section for CSM format
   */
  private processStateSectionCSM(section: Section, flow: CSMMachineDefinition): void {
    if (!section.identifier) return;

    const stateName = section.identifier.value;
    const state: CSMStateDefinition = {
      transitions: [],
      meta: {
        messageId: stateName,
      },
    };

    // Process state elements
    for (const element of section.body) {
      if (isAttribute(element)) {
        // Handle simple transition syntax
        const key = element.key;
        const value = this.extractValue(element.value);

        // For now, treat attributes as simple transitions
        state.transitions.push({
          pattern: key,
          target: value as string,
        });
      } else if (isMatchBlock(element)) {
        // Process match block for transitions
        this.processMatchBlockCSM(element, state);
      } else if (isValue(element)) {
        // Handle standalone values (e.g., transient state)
        const value = this.extractValue(element);
        if (typeof value === 'string') {
          // This is a transient state
          state.transitions.push({
            target: value,
          });
          state.meta!.transient = true;
        }
      }
    }

    flow.states[stateName] = state;
  }

  /**
   * Process match block for CSM format
   */
  private processMatchBlockCSM(matchBlock: MatchBlock, state: CSMStateDefinition): void {
    // Extract the discriminant variable
    const discriminant = this.extractValue(matchBlock.discriminant);

    // Create transitions for each case
    matchBlock.cases.forEach((matchCase, index) => {
      const caseValue =
        matchCase.value === 'default' ? ':default' : this.extractValue(matchCase.value);
      const consequence = matchCase.consequence;

      if (caseValue === ':default') {
        // Default case - add a transition without pattern
        const transitionData = this.processConsequence(consequence);
        
        const defaultTransition: any = {
          pattern: ':default',
          priority: -1, // Default has lowest priority
        };

        if (transitionData.flowInvocation) {
          defaultTransition.flowInvocation = transitionData.flowInvocation;
        } else if (transitionData.target) {
          defaultTransition.target = transitionData.target;
        }

        if (transitionData.context) {
          defaultTransition.context = transitionData.context;
        }

        state.transitions.push(defaultTransition);
      } else {
        // Normal case
        const transitionData = this.processConsequence(consequence);

        const normalTransition: any = {
          pattern: caseValue as string,
          priority: matchBlock.cases.length - index, // Higher index = lower priority
        };

        if (transitionData.flowInvocation) {
          normalTransition.flowInvocation = transitionData.flowInvocation;
        } else if (transitionData.target) {
          normalTransition.target = transitionData.target;
        }

        if (transitionData.context) {
          normalTransition.context = transitionData.context;
        }

        state.transitions.push(normalTransition);
      }
    });
  }

  /**
   * Process different types of consequences (flow control, values, etc.)
   */
  private processConsequence(consequence: any): { target?: string; context?: Record<string, any>; meta?: Record<string, any>; flowInvocation?: any } {
    // Handle flow invocation
    if (isFlowInvocation(consequence)) {
      const flowInvocation: any = {
        flowId: consequence.flowName.value,
        parameters: {},
        onResult: {}
      };

      // Process parameters if present
      if (consequence.parameters) {
        const params: Record<string, any> = {};
        for (const param of consequence.parameters) {
          if (param.key) {
            params[param.key] = this.extractValue(param.value);
          }
        }
        flowInvocation.parameters = params;
      }

      // Process result handlers
      if (consequence.resultHandlers && consequence.resultHandlers.length > 0) {
        for (const handler of consequence.resultHandlers) {
          const resultType = handler.result; // 'end', 'cancel', 'error'
          const resultHandler: any = {
            target: this.extractTargetReference(handler.target)
          };

          // Process operations if present
          if (handler.operations && handler.operations.length > 0) {
            resultHandler.operations = handler.operations.map((op: any) => {
              return this.processContextOperation(op);
            });
          }

          flowInvocation.onResult[resultType] = resultHandler;
        }
      } else {
        // Default result handlers if none specified
        flowInvocation.onResult = {
          end: { target: "state:Welcome" },
          cancel: { target: "state:Welcome" },
          error: { target: "state:ErrorHandler" }
        };
      }

      return {
        flowInvocation,
        meta: {
          type: 'flow_invocation',
          flowName: consequence.flowName.value,
        }
      };
    }

    // Handle flow termination
    if (isFlowTermination(consequence)) {
      return {
        target: `:${consequence.result}`,
        meta: {
          type: 'flow_termination',
          result: consequence.result,
        }
      };
    }

    // Handle identifiers, variables, property access
    if (isIdentifier(consequence)) {
      return { target: consequence.value };
    }
    if (isVariable(consequence)) {
      return { target: consequence.name };
    }
    if (isPropertyAccess(consequence)) {
      return { target: `${consequence.object.name}.${consequence.properties.join('.')}` };
    }

    // Handle contextualized values (legacy)
    if (isContextualizedValue(consequence)) {
      const target = this.extractValue(consequence.value);
      const contextUpdates = this.extractContextUpdates(consequence);
      return {
        target: target as string,
        context: contextUpdates,
      };
    }

    // Handle simple values (including FlowTermination which is now part of Value)
    const target = this.extractValue(consequence);
    return {
      target: target as string,
    };
  }

  /**
   * Extract parameter list into a simple object
   */
  private extractParameterList(paramList: ParameterList): Record<string, any> {
    const params: Record<string, any> = {};
    for (const param of paramList) {
      if (param.key) {
        params[param.key] = this.extractValue(param.value);
      }
    }
    return params;
  }


  /**
   * Extract context operation (append, set, merge, etc.)
   */
  private extractContextOperation(operation: ContextOperation): any {
    // For now, return a simplified representation
    // This would need to be expanded based on the actual ContextOperation types
    return {
      type: operation.type,
      // Add specific fields based on operation type
      ...(operation as any),
    };
  }

  /**
   * Extract context updates from a contextualized value
   */
  private extractContextUpdates(value: any): Record<string, any> | undefined {
    if (isContextualizedValue(value) && value.context) {
      const context: Record<string, any> = {};
      for (const param of value.context) {
        if (param.key) {
          context[param.key] = this.extractValue(param.value);
        }
      }
      return Object.keys(context).length > 0 ? context : undefined;
    }
    return undefined;
  }

  /**
   * Apply defaults to output
   */
  private applyDefaults(output: ICompilationOutput): void {
    // Apply defaults to agent
    for (const [key, value] of Object.entries(this.defaults)) {
      if (!(key in output.agent)) {
        output.agent[key] = value;
      }
    }
  }
}
