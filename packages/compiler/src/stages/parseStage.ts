import { type Result, err, ok } from '@rcl/core';
import type { ICompilationInput, ICompilationStage } from '@rcl/core';
import { ParserFactory } from '@rcl/parser';

/**
 * Parse stage - converts source text to AST
 */
export class ParseStage implements ICompilationStage {
  readonly name = 'parse';

  async process(input: ICompilationInput): Promise<Result<any>> {
    try {
      // Skip if AST already provided
      if (input.ast) {
        return ok({
          ...input,
          ast: input.ast,
          diagnostics: [],
        });
      }

      console.log('ParseStage: Creating parser...');

      // Create parser
      const parserResult = await ParserFactory.create();
      if (!parserResult.success) {
        return err(parserResult.error);
      }

      const parser = parserResult.value;

      console.log('ParseStage: Parsing source...');

      // Parse the source
      const parseResult = await parser.parse(input.source, input.uri);
      if (!parseResult.success) {
        return err(parseResult.error);
      }

      const { ast, diagnostics } = parseResult.value;

      // Check if parse was successful
      if (!ast) {
        return err(new Error('Parsing failed - no AST produced'));
      }

      return ok({
        ...input,
        ast,
        diagnostics,
      });
    } catch (error) {
      return err(new Error(`Parse stage failed: ${error}`));
    }
  }
}
