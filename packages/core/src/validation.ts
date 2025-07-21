import type { Diagnostic } from './diagnostics.js';
import type { IASTNode } from './parser.js';
import type { Result } from './result.js';

/**
 * Validation result
 */
export interface IValidationResult {
  isValid: boolean;
  diagnostics: Diagnostic[];
  metadata?: Record<string, any>;
}

/**
 * Validator interface
 */
export interface IValidator {
  /**
   * Validator name
   */
  name: string;

  /**
   * Validate an AST
   */
  validate(ast: IASTNode, context?: IValidationContext): Promise<Result<IValidationResult>>;

  /**
   * Check if this validator can handle the given AST
   */
  canValidate(ast: IASTNode): boolean;
}

/**
 * Validation context
 */
export interface IValidationContext {
  uri?: string;
  sourceText?: string;
  symbols?: Map<string, ISymbolInfo>;
  options?: IValidationOptions;
}

/**
 * Validation options
 */
export interface IValidationOptions {
  strict?: boolean;
  allowWarnings?: boolean;
  customRules?: IValidationRule[];
}

/**
 * Symbol information for validation
 */
export interface ISymbolInfo {
  name: string;
  type: string;
  location: IASTNode;
  references: IASTNode[];
}

/**
 * Validation rule interface
 */
export interface IValidationRule {
  name: string;
  severity: 'error' | 'warning' | 'info';
  check(node: IASTNode, context: IValidationContext): Diagnostic | null;
}

/**
 * Validation pipeline interface
 */
export interface IValidationPipeline {
  /**
   * Add a validator to the pipeline
   */
  addValidator(validator: IValidator): void;

  /**
   * Remove a validator from the pipeline
   */
  removeValidator(name: string): void;

  /**
   * Validate an AST through the pipeline
   */
  validate(ast: IASTNode, context?: IValidationContext): Promise<Result<IValidationResult>>;

  /**
   * Get all validators
   */
  getValidators(): IValidator[];
}
