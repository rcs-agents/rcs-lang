import { findNodeByType, findNodesByType } from '@rcl/ast';
import type { Diagnostic, Result } from '@rcl/core';
import type { IASTNode, IValidationContext, IValidationResult } from '@rcl/core';
import { BaseValidator } from './base';

/**
 * Validates naming conventions in RCL
 */
export class NamingValidator extends BaseValidator {
  constructor() {
    super('naming-validator');
  }

  async validate(ast: IASTNode, _context?: IValidationContext): Promise<Result<IValidationResult>> {
    const diagnostics: Diagnostic[] = [];

    // Validate agent name
    const agentNode = findNodeByType(ast, 'agent_definition');
    if (agentNode) {
      const nameNode = agentNode.children?.find((child: any) => child.type === 'identifier');
      if (nameNode?.text) {
        this.validateAgentName(nameNode.text, nameNode, diagnostics);
      }
    }

    // Since RCL is now generic, we don't validate specific section types
    // This could be extended to validate section names based on context

    // Validate message names
    const messages = findNodesByType(ast, 'message_definition');
    for (const message of messages) {
      const nameNode = message.children?.find(
        (child: any) => child.type === 'identifier' || child.type === 'attribute_key',
      );
      if (nameNode?.text) {
        this.validateMessageName(nameNode.text, nameNode, diagnostics);
      }
    }

    return this.createResult(diagnostics);
  }

  private validateAgentName(name: string, node: IASTNode, diagnostics: Diagnostic[]): void {
    // Agent names should be PascalCase
    if (!this.isPascalCase(name)) {
      diagnostics.push(
        this.createWarning(
          `Agent name '${name}' should be in PascalCase (e.g., CoffeeShop)`,
          node,
          'AGENT_NAME_CASE',
        ),
      );
    }

    // Check for reserved names
    if (['Config', 'Defaults', 'Messages'].includes(name)) {
      diagnostics.push(
        this.createError(
          `'${name}' is a reserved name and cannot be used as an agent name`,
          node,
          'RESERVED_NAME',
        ),
      );
    }
  }

  private validateMessageName(name: string, node: IASTNode, diagnostics: Diagnostic[]): void {
    // Message names should be camelCase
    if (!this.isCamelCase(name) && !this.isSnakeCase(name)) {
      diagnostics.push(
        this.createInfo(
          `Message name '${name}' should preferably be in camelCase`,
          node,
          'MESSAGE_NAME_CASE',
        ),
      );
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
