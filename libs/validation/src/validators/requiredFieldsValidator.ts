import * as AST from '@rcl/ast';
import type { Diagnostic, Result } from '@rcl/core';
import type { IASTNode, IValidationContext, IValidationResult } from '@rcl/core';
import { BaseValidator } from './base';

/**
 * Validates required fields in RCL structures
 */
export class RequiredFieldsValidator extends BaseValidator {
  constructor() {
    super('required-fields-validator');
  }

  async validate(ast: IASTNode, context?: IValidationContext): Promise<Result<IValidationResult>> {
    const diagnostics: Diagnostic[] = [];

    // Get the RclFile
    let rclFile: AST.RclFile;
    if (ast && (ast as any).type === 'RclFile') {
      rclFile = ast as any as AST.RclFile;
    } else if ((ast as any).node && (ast as any).node.type === 'RclFile') {
      rclFile = (ast as any).node as AST.RclFile;
    } else {
      diagnostics.push(this.createError('Invalid AST structure', ast, 'INVALID_AST'));
      return this.createResult(diagnostics);
    }

    // Check agent sections
    const agentSections = rclFile.sections.filter((s) => s.sectionType === 'agent');

    if (agentSections.length === 0) {
      diagnostics.push(this.createError('No agent definition found', rclFile, 'MISSING_AGENT'));
    } else {
      for (const agentSection of agentSections) {
        // Check for required displayName
        const hasDisplayName = agentSection.body.some(
          (item) => AST.isAttribute(item) && item.key === 'displayName',
        );

        if (!hasDisplayName) {
          diagnostics.push(
            this.createError(
              'Agent must have displayName property',
              agentSection,
              'MISSING_DISPLAYNAME',
            ),
          );
        }
      }
    }

    // Check flow sections (can be at top level or inside agent sections)
    const topLevelFlows = rclFile.sections.filter((s) => s.sectionType === 'flow');
    const agentFlows: AST.Section[] = [];

    // Look for flows inside agent sections
    for (const agentSection of agentSections) {
      const flows = agentSection.body.filter(
        (item) => AST.isSection(item) && item.sectionType === 'flow',
      ) as AST.Section[];
      agentFlows.push(...flows);
    }

    const allFlowSections = [...topLevelFlows, ...agentFlows];

    if (allFlowSections.length === 0) {
      diagnostics.push(this.createError('At least one flow is required', rclFile, 'MISSING_FLOW'));
    } else {
      for (const flowSection of allFlowSections) {
        // Check for required start attribute
        const hasStart = flowSection.body.some(
          (item) => AST.isAttribute(item) && item.key === 'start',
        );

        if (!hasStart) {
          diagnostics.push(
            this.createError('Flow must have start attribute', flowSection, 'MISSING_START'),
          );
        }

        // Check for at least one state
        const hasStates = flowSection.body.some(
          (item) => AST.isSection(item) && item.sectionType === 'on',
        );

        if (!hasStates) {
          diagnostics.push(
            this.createError('Flow must have at least one state', flowSection, 'MISSING_STATES'),
          );
        }
      }
    }

    // Check messages sections (can be at top level or inside agent sections)
    const topLevelMessages = rclFile.sections.filter((s) => s.sectionType === 'messages');
    const agentMessages: AST.Section[] = [];

    // Look for messages inside agent sections
    for (const agentSection of agentSections) {
      const messages = agentSection.body.filter(
        (item) => AST.isSection(item) && item.sectionType === 'messages',
      ) as AST.Section[];
      agentMessages.push(...messages);
    }

    const allMessagesSections = [...topLevelMessages, ...agentMessages];

    if (allMessagesSections.length === 0) {
      diagnostics.push(
        this.createError('At least one messages section is required', rclFile, 'MISSING_MESSAGES'),
      );
    } else {
      for (const messagesSection of allMessagesSections) {
        // Check if messages section is empty
        const hasMessages = messagesSection.body.some(
          (item) =>
            AST.isSection(item) && ['text', 'card', 'carousel', 'file'].includes(item.sectionType),
        );

        if (!hasMessages) {
          diagnostics.push(
            this.createError('Messages section cannot be empty', messagesSection, 'EMPTY_MESSAGES'),
          );
        }
      }
    }

    return this.createResult(diagnostics);
  }

  protected createError(message: string, node: any, code: string): Diagnostic {
    const location = node?.location;
    const range = location?.range || {
      start: { line: 0, character: 0 },
      end: { line: 0, character: 0 },
    };

    return {
      severity: 'error' as const,
      message,
      code,
      source: this.name,
      range,
    };
  }
}
