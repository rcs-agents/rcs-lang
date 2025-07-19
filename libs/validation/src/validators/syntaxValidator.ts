import { walkAST } from '@rcs-lang/ast';
import type { Diagnostic, Result } from '@rcs-lang/core';
import type { IASTNode, IValidationContext, IValidationResult } from '@rcs-lang/core';
import { BaseValidator } from './base';

/**
 * Validates syntax errors in the AST
 */
export class SyntaxValidator extends BaseValidator {
  constructor() {
    super('syntax-validator');
  }

  async validate(ast: IASTNode, _context?: IValidationContext): Promise<Result<IValidationResult>> {
    const diagnostics: Diagnostic[] = [];

    // Walk the AST looking for ERROR nodes
    walkAST(ast, (node: any) => {
      if (node.type === 'ERROR') {
        diagnostics.push(this.createError('Syntax error in source code', node, 'SYNTAX_ERROR'));
      }

      // Check for missing nodes (null children where required)
      if (node.type === 'agent_definition') {
        // Handle ANTLR AST structure where displayName is a property
        const hasDisplayNameProperty = !!(node as any).displayName;

        // Also check for tree-sitter structure where it's a child node
        const hasDisplayNameChild = node.children?.some(
          (child: any) => child.type === 'displayName',
        );

        if (!hasDisplayNameProperty && !hasDisplayNameChild) {
          diagnostics.push(
            this.createError(
              'Agent definition missing required displayName',
              node,
              'MISSING_DISPLAY_NAME',
            ),
          );
        }
      }

      return true; // Continue walking
    });

    return this.createResult(diagnostics);
  }
}
