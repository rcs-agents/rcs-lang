import { type Diagnostic, type Result, err, ok } from '@rcl/core';
import type {
  IASTNode,
  IValidationContext,
  IValidationPipeline,
  IValidationResult,
  IValidator,
} from '@rcl/core';

/**
 * Implementation of validation pipeline
 */
export class ValidationPipeline implements IValidationPipeline {
  private validators: Map<string, IValidator> = new Map();
  private order: string[] = [];

  /**
   * Add a validator to the pipeline
   */
  addValidator(validator: IValidator): void {
    if (this.validators.has(validator.name)) {
      throw new Error(`Validator '${validator.name}' already exists in pipeline`);
    }

    this.validators.set(validator.name, validator);
    this.order.push(validator.name);
  }

  /**
   * Remove a validator from the pipeline
   */
  removeValidator(name: string): void {
    if (!this.validators.has(name)) {
      throw new Error(`Validator '${name}' not found in pipeline`);
    }

    this.validators.delete(name);
    this.order = this.order.filter((n) => n !== name);
  }

  /**
   * Validate an AST through the pipeline
   */
  async validate(ast: IASTNode, context?: IValidationContext): Promise<Result<IValidationResult>> {
    const diagnostics: Diagnostic[] = [];
    const metadata: Record<string, any> = {};

    try {
      // Run validators in order
      for (const validatorName of this.order) {
        const validator = this.validators.get(validatorName);
        if (!validator) continue;

        // Check if validator can handle this AST
        if (!validator.canValidate(ast)) {
          continue;
        }

        // Run validator
        const result = await validator.validate(ast, context);

        if (!result.success) {
          // Validator failed - add error diagnostic
          diagnostics.push({
            severity: 'error',
            message: `Validator '${validator.name}' failed: ${result.error.message}`,
            source: 'validation-pipeline',
          });

          // Continue with other validators or stop?
          // For now, continue to collect all issues
          continue;
        }

        // Collect diagnostics from validator
        diagnostics.push(...result.value.diagnostics);

        // Merge metadata
        if (result.value.metadata) {
          Object.assign(metadata, result.value.metadata);
        }

        // Stop if we have errors and strict mode is enabled
        if (
          context?.options?.strict &&
          result.value.diagnostics.some((d) => d.severity === 'error')
        ) {
          break;
        }
      }

      // Determine if validation passed
      const hasErrors = diagnostics.some((d) => d.severity === 'error');
      const hasWarnings = diagnostics.some((d) => d.severity === 'warning');

      const isValid = !hasErrors && (context?.options?.allowWarnings !== false || !hasWarnings);

      return ok({
        isValid,
        diagnostics,
        metadata,
      });
    } catch (error) {
      return err(new Error(`Validation pipeline failed: ${error}`));
    }
  }

  /**
   * Get all validators
   */
  getValidators(): IValidator[] {
    return this.order
      .map((name) => this.validators.get(name))
      .filter((v) => v !== undefined) as IValidator[];
  }

  /**
   * Clear all validators
   */
  clear(): void {
    this.validators.clear();
    this.order = [];
  }

  /**
   * Set the order of validators
   */
  setOrder(order: string[]): void {
    // Validate that all names exist
    for (const name of order) {
      if (!this.validators.has(name)) {
        throw new Error(`Validator '${name}' not found in pipeline`);
      }
    }

    // Validate that all validators are included
    if (order.length !== this.validators.size) {
      throw new Error('Order must include all validators');
    }

    this.order = order;
  }
}
