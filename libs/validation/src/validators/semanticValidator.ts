import { findNodeByType, findNodesByType } from '@rcl/ast';
import type { Diagnostic, Result } from '@rcl/core';
import type { IASTNode, IValidationContext, IValidationResult } from '@rcl/core';
import { BaseValidator } from './base';

/**
 * Validates semantic rules for RCL
 */
export class SemanticValidator extends BaseValidator {
  constructor() {
    super('semantic-validator');
  }

  async validate(ast: IASTNode, _context?: IValidationContext): Promise<Result<IValidationResult>> {
    const diagnostics: Diagnostic[] = [];

    // RCL is now a generic data language
    // Semantic validation should be performed by domain-specific validators
    // This base validator only checks structural integrity

    // For now, we'll just validate that the AST is well-formed
    if (!ast || ast.type !== 'RclFile') {
      diagnostics.push(this.createError('Invalid AST structure', ast, 'INVALID_AST'));
    }

    return this.createResult(diagnostics);
  }
}
