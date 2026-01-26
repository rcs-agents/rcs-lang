import { ValidationPipeline } from './pipeline';
import { RequiredFieldsValidator } from './validators/requiredFieldsValidator';
import { SyntaxValidator } from './validators/syntaxValidator';
// import { SemanticValidator } from './validators/semanticValidator';
// import { NamingValidator } from './validators/namingValidator';

/**
 * Create a default validation pipeline with all standard validators
 */
export function createDefaultPipeline(): ValidationPipeline {
  const pipeline = new ValidationPipeline();

  // Order matters - syntax first, then semantic, then naming
  pipeline.addValidator(new SyntaxValidator());
  pipeline.addValidator(new RequiredFieldsValidator());
  // Temporarily disabled until AST types are updated for generic RCL
  // pipeline.addValidator(new SemanticValidator());
  // pipeline.addValidator(new NamingValidator());

  return pipeline;
}

/**
 * Create a strict validation pipeline that fails fast on errors
 */
export function createStrictPipeline(): ValidationPipeline {
  const pipeline = new ValidationPipeline();

  // Same validators but will be used with strict context
  pipeline.addValidator(new SyntaxValidator());
  pipeline.addValidator(new RequiredFieldsValidator());
  // Temporarily disabled until AST types are updated for generic RCL
  // pipeline.addValidator(new SemanticValidator());
  // pipeline.addValidator(new NamingValidator());

  return pipeline;
}

/**
 * Create a relaxed validation pipeline that only checks critical issues
 */
export function createRelaxedPipeline(): ValidationPipeline {
  const pipeline = new ValidationPipeline();

  // Only syntax and semantic - skip naming conventions
  pipeline.addValidator(new SyntaxValidator());
  pipeline.addValidator(new RequiredFieldsValidator());
  // Temporarily disabled until AST types are updated for generic RCL
  // pipeline.addValidator(new SemanticValidator());

  return pipeline;
}
