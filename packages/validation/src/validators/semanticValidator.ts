import { Result, Diagnostic } from '@rcl/core-types';
import { IValidationResult, IValidationContext, IASTNode } from '@rcl/core-interfaces';
import { BaseValidator } from './base';

/**
 * Validates semantic rules for RCL
 */
export class SemanticValidator extends BaseValidator {
  constructor() {
    super('semantic-validator');
  }
  
  async validate(ast: IASTNode, context?: IValidationContext): Promise<Result<IValidationResult>> {
    const diagnostics: Diagnostic[] = [];
    
    // Check for agent definition
    const agentNode = ast.find(node => node.type === 'agent_definition');
    if (!agentNode) {
      diagnostics.push(this.createError(
        'No agent definition found in file',
        ast,
        'NO_AGENT'
      ));
      return this.createResult(diagnostics);
    }
    
    // Validate agent has required sections
    this.validateAgentSections(agentNode, diagnostics);
    
    // Validate flows
    const flows = ast.findAll(node => node.type === 'flow_section');
    this.validateFlows(flows, diagnostics);
    
    // Validate messages
    const messages = ast.find(node => node.type === 'messages_section');
    if (messages) {
      this.validateMessages(messages, diagnostics);
    }
    
    return this.createResult(diagnostics);
  }
  
  private validateAgentSections(agent: IASTNode, diagnostics: Diagnostic[]): void {
    // Check for at least one flow
    const flows = agent.findAll(node => node.type === 'flow_section');
    if (flows.length === 0) {
      diagnostics.push(this.createError(
        'Agent must have at least one flow',
        agent,
        'NO_FLOWS'
      ));
    }
    
    // Check for messages section
    const messages = agent.find(node => node.type === 'messages_section');
    if (!messages) {
      diagnostics.push(this.createError(
        'Agent must have a messages section',
        agent,
        'NO_MESSAGES'
      ));
    }
  }
  
  private validateFlows(flows: IASTNode[], diagnostics: Diagnostic[]): void {
    const flowNames = new Set<string>();
    
    for (const flow of flows) {
      // Get flow name
      const nameNode = flow.children?.find(child => child.type === 'identifier');
      const flowName = nameNode?.text;
      
      if (!flowName) {
        diagnostics.push(this.createError(
          'Flow missing name',
          flow,
          'FLOW_NO_NAME'
        ));
        continue;
      }
      
      // Check for duplicate flow names
      if (flowNames.has(flowName)) {
        diagnostics.push(this.createError(
          `Duplicate flow name: ${flowName}`,
          flow,
          'DUPLICATE_FLOW'
        ));
      }
      flowNames.add(flowName);
      
      // Validate flow has rules
      const rules = flow.findAll(node => node.type === 'flow_rule');
      if (rules.length === 0) {
        diagnostics.push(this.createWarning(
          `Flow '${flowName}' has no rules`,
          flow,
          'EMPTY_FLOW'
        ));
      }
    }
  }
  
  private validateMessages(messages: IASTNode, diagnostics: Diagnostic[]): void {
    // Check that Messages identifier is used
    const identifier = messages.children?.find(child => child.type === 'identifier');
    if (identifier?.text !== 'Messages') {
      diagnostics.push(this.createError(
        'Messages section must use identifier "Messages"',
        identifier || messages,
        'INVALID_MESSAGES_ID'
      ));
    }
    
    // Check for at least one message
    const messageDefinitions = messages.findAll(node => 
      node.type === 'message_definition' || node.type === 'property'
    );
    
    if (messageDefinitions.length === 0) {
      diagnostics.push(this.createWarning(
        'Messages section has no message definitions',
        messages,
        'NO_MESSAGES_DEFINED'
      ));
    }
  }
}