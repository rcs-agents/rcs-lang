import type { ParserConfig } from '@rcs-lang/core';
import { CharStream, CommonTokenStream } from 'antlr4ng';
import { RclLexer } from './generated/RclLexer';
import { RclParser } from './generated/RclParser';

// Legacy function for backward compatibility with old interface
export async function parse(source: string): Promise<{ ast: any; errors?: any[] }> {
  const parser = new AntlrRclParser();
  await parser.initialize();

  const result = await parser.parse(source);

  if (result.success) {
    return {
      ast: result.value.ast,
      errors:
        result.value.diagnostics.length > 0
          ? result.value.diagnostics.map((d) => ({
            message: d.message,
            line: d.range?.start.line,
            column: d.range?.start.character,
            type: 'ERROR',
          }))
          : undefined,
    };
  }
  return {
    ast: null,
    errors: [
      {
        message: result.error.message,
        type: 'FATAL',
      },
    ],
  };
}

// Legacy function for tree-sitter compatibility
export function parseRcl(source: string) {
  const inputStream = CharStream.fromString(source);
  const lexer = new RclLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new RclParser(tokenStream);

  const tree = parser.rcl_file();
  return tree;
}

// Export the main parser class
export { AntlrRclParser } from './parser';
export { AntlrRclParser as RCLParser } from './parser'; // Alias for compatibility

// Import for factory
import { AntlrRclParser } from './parser';

// Export parser adapter
export { AntlrAdapter } from './adapter';

// Export generated classes
export { RclLexer, RclParser };

// Export types from core
export type { IParser, IParseResult, IParserCapabilities, ParserConfig } from '@rcs-lang/core';

// Legacy types for compatibility
export interface RCLDocument {
  uri: string;
  version: number;
  content: string;
  ast: any;
  imports: any[];
  symbols: any[];
  diagnostics: any[];
}

export interface RCLSettings {
  [key: string]: any;
}

// Export factory
export class ParserFactory {
  static async create(config?: ParserConfig) {
    const parser = new AntlrRclParser();
    const result = await parser.initialize(config);

    if (!result.success) {
      return result;
    }

    return {
      success: true as const,
      value: parser,
    };
  }
}
