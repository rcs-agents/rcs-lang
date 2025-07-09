import { type Diagnostic, type Result, ok } from '@rcl/core';
import type { IASTNode, IValidationContext, IValidationResult, IValidator } from '@rcl/core';

/**
 * Base validator class with common functionality
 */
export abstract class BaseValidator implements IValidator {
  constructor(public readonly name: string) {}

  abstract validate(
    ast: IASTNode,
    context?: IValidationContext,
  ): Promise<Result<IValidationResult>>;

  /**
   * Default implementation - validate all ASTs
   */
  canValidate(_ast: IASTNode): boolean {
    return true;
  }

  /**
   * Helper to create a validation result
   */
  protected createResult(
    diagnostics: Diagnostic[],
    metadata?: Record<string, any>,
  ): Result<IValidationResult> {
    const hasErrors = diagnostics.some((d) => d.severity === 'error');

    return ok({
      isValid: !hasErrors,
      diagnostics,
      metadata,
    });
  }

  /**
   * Helper to create an error diagnostic
   */
  protected createError(message: string, node?: IASTNode, code?: string): Diagnostic {
    return {
      severity: 'error',
      message,
      code,
      source: this.name,
      range: (node as any)?.location?.range,
    };
  }

  /**
   * Helper to create a warning diagnostic
   */
  protected createWarning(message: string, node?: IASTNode, code?: string): Diagnostic {
    return {
      severity: 'warning',
      message,
      code,
      source: this.name,
      range: (node as any)?.location?.range,
    };
  }

  /**
   * Helper to create an info diagnostic
   */
  protected createInfo(message: string, node?: IASTNode, code?: string): Diagnostic {
    return {
      severity: 'info',
      message,
      code,
      source: this.name,
      range: (node as any)?.location?.range,
    };
  }
}
