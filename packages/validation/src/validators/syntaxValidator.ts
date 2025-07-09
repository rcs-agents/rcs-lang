import { Result, Diagnostic } from '@rcl/core-types';
import { IValidationResult, IValidationContext, IASTNode } from '@rcl/core-interfaces';
import { BaseValidator } from './base';

/**
 * Validates syntax errors in the AST
 */
export class SyntaxValidator extends BaseValidator {
  constructor() {
    super('syntax-validator');
  }
  
  async validate(ast: IASTNode, context?: IValidationContext): Promise<Result<IValidationResult>> {
    const diagnostics: Diagnostic[] = [];
    
    // Walk the AST looking for ERROR nodes
    ast.walk(node => {
      if (node.type === 'ERROR') {
        diagnostics.push(this.createError(
          'Syntax error in source code',
          node,
          'SYNTAX_ERROR'
        ));
      }
      
      // Check for missing nodes (null children where required)
      if (node.type === 'agent_definition') {
        const hasDisplayName = node.children?.some(
          child => child.type === 'displayName'
        );
        
        if (!hasDisplayName) {
          diagnostics.push(this.createError(
            'Agent definition missing required displayName',
            node,
            'MISSING_DISPLAY_NAME'
          ));
        }
      }
    });
    
    return this.createResult(diagnostics);
  }
}