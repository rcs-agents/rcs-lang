import { Result, Diagnostic } from '@rcl/core-types';
import { IValidationResult, IValidationContext, IASTNode } from '@rcl/core-interfaces';
import { BaseValidator } from './base';

/**
 * Validates naming conventions in RCL
 */
export class NamingValidator extends BaseValidator {
  constructor() {
    super('naming-validator');
  }
  
  async validate(ast: IASTNode, context?: IValidationContext): Promise<Result<IValidationResult>> {
    const diagnostics: Diagnostic[] = [];
    
    // Validate agent name
    const agentNode = ast.find(node => node.type === 'agent_definition');
    if (agentNode) {
      const nameNode = agentNode.children?.find(child => child.type === 'identifier');
      if (nameNode?.text) {
        this.validateAgentName(nameNode.text, nameNode, diagnostics);
      }
    }
    
    // Validate flow names
    const flows = ast.findAll(node => node.type === 'flow_section');
    for (const flow of flows) {
      const nameNode = flow.children?.find(child => child.type === 'identifier');
      if (nameNode?.text) {
        this.validateFlowName(nameNode.text, nameNode, diagnostics);
      }
    }
    
    // Validate message names
    const messages = ast.findAll(node => node.type === 'property' || node.type === 'message_definition');
    for (const message of messages) {
      const nameNode = message.children?.find(child => child.type === 'identifier' || child.type === 'attribute_key');
      if (nameNode?.text) {
        this.validateMessageName(nameNode.text, nameNode, diagnostics);
      }
    }
    
    return this.createResult(diagnostics);
  }
  
  private validateAgentName(name: string, node: IASTNode, diagnostics: Diagnostic[]): void {
    // Agent names should be PascalCase
    if (!this.isPascalCase(name)) {
      diagnostics.push(this.createWarning(
        `Agent name '${name}' should be in PascalCase (e.g., CoffeeShop)`,
        node,
        'AGENT_NAME_CASE'
      ));
    }
    
    // Check for reserved names
    if (['Config', 'Defaults', 'Messages'].includes(name)) {
      diagnostics.push(this.createError(
        `'${name}' is a reserved name and cannot be used as an agent name`,
        node,
        'RESERVED_NAME'
      ));
    }
  }
  
  private validateFlowName(name: string, node: IASTNode, diagnostics: Diagnostic[]): void {
    // Flow names should be PascalCase or camelCase
    if (!this.isPascalCase(name) && !this.isCamelCase(name)) {
      diagnostics.push(this.createWarning(
        `Flow name '${name}' should be in PascalCase or camelCase`,
        node,
        'FLOW_NAME_CASE'
      ));
    }
  }
  
  private validateMessageName(name: string, node: IASTNode, diagnostics: Diagnostic[]): void {
    // Message names should be camelCase
    if (!this.isCamelCase(name) && !this.isSnakeCase(name)) {
      diagnostics.push(this.createInfo(
        `Message name '${name}' should preferably be in camelCase`,
        node,
        'MESSAGE_NAME_CASE'
      ));
    }
  }
  
  private isPascalCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }
  
  private isCamelCase(str: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }
  
  private isSnakeCase(str: string): boolean {
    return /^[a-z][a-z0-9_]*$/.test(str);
  }
}