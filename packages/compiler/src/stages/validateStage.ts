import { Result, ok, err } from '@rcl/core-types';
import { ICompilationStage, IASTNode } from '@rcl/core-interfaces';
import { createDefaultPipeline } from '@rcl/validation';

interface ValidateInput {
  ast: IASTNode;
  uri: string;
  source: string;
  diagnostics?: any[];
}

/**
 * Validation stage - validates the AST
 */
export class ValidateStage implements ICompilationStage {
  readonly name = 'validate';
  
  async process(input: ValidateInput): Promise<Result<any>> {
    try {
      if (!input.ast) {
        return err(new Error('No AST provided to validation stage'));
      }
      
      // Create validation pipeline
      const pipeline = createDefaultPipeline();
      
      // Run validation
      const validationResult = await pipeline.validate(input.ast, {
        uri: input.uri,
        sourceText: input.source
      });
      
      if (!validationResult.success) {
        return err(validationResult.error);
      }
      
      const { isValid, diagnostics } = validationResult.value;
      
      // Combine diagnostics
      const allDiagnostics = [
        ...(input.diagnostics || []),
        ...diagnostics
      ];
      
      // Fail if validation found errors
      if (!isValid) {
        return ok({
          ...input,
          diagnostics: allDiagnostics,
          validationFailed: true
        });
      }
      
      return ok({
        ...input,
        diagnostics: allDiagnostics,
        validated: true
      });
    } catch (error) {
      return err(new Error(`Validation stage failed: ${error}`));
    }
  }
}