import {
  type Diagnostic,
  IASTNode,
  type IParseResult,
  type IParser,
  type IParserCapabilities,
  type ParserConfig,
  type ParserPlatform,
  type Result,
} from '@rcs-lang/core';
import {
  type ANTLRErrorListener,
  CharStream,
  CommonTokenStream,
  type RecognitionException,
  type Recognizer,
} from 'antlr4ng';
import { AntlrAdapter } from './adapter';
import { RclLexer } from './generated/RclLexer';
import { RclParser } from './generated/RclParser';
// import { wrapAST } from './ast-wrapper'; // No longer needed

/**
 * Custom error listener to collect syntax errors
 */
class ErrorListener implements ANTLRErrorListener {
  private diagnostics: Diagnostic[] = [];

  syntaxError(
    _recognizer: any,
    _offendingSymbol: any,
    line: number,
    charPositionInLine: number,
    msg: string,
    _e: RecognitionException | null,
  ): void {
    this.diagnostics.push({
      severity: 'error',
      message: msg,
      range: {
        start: { line: line - 1, character: charPositionInLine },
        end: { line: line - 1, character: charPositionInLine + 1 },
      },
      source: 'antlr-parser',
    });
  }

  reportAmbiguity(
    recognizer: any,
    dfa: any,
    startIndex: number,
    stopIndex: number,
    exact: boolean,
    ambigAlts: any,
    configs: any
  ): void {
    // Optional - can be left empty
  }

  reportAttemptingFullContext(
    recognizer: any,
    dfa: any,
    startIndex: number,
    stopIndex: number,
    conflictingAlts: any,
    configs: any
  ): void {
    // Optional - can be left empty
  }

  reportContextSensitivity(
    recognizer: any,
    dfa: any,
    startIndex: number,
    stopIndex: number,
    prediction: number,
    configs: any
  ): void {
    // Optional - can be left empty
  }

  getDiagnostics(): Diagnostic[] {
    return this.diagnostics;
  }

  clear(): void {
    this.diagnostics = [];
  }
}

/**
 * ANTLR-based parser implementation
 */
export class AntlrRclParser implements IParser {
  private initialized = false;
  private adapter = new AntlrAdapter();
  private errorListener = new ErrorListener();

  async initialize(_config?: ParserConfig): Promise<Result<void>> {
    // ANTLR doesn't need special initialization
    this.initialized = true;
    return { success: true, value: undefined };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async parse(text: string, _uri?: string): Promise<Result<IParseResult>> {
    if (!this.initialized) {
      return {
        success: false,
        error: new Error('Parser not initialized. Call initialize() first.'),
      };
    }

    const startTime = Date.now();

    try {
      // Clear previous errors
      this.errorListener.clear();

      // Create lexer and parser
      const inputStream = CharStream.fromString(text);
      const lexer = new RclLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      const parser = new RclParser(tokenStream);

      // Remove default error listeners and add our custom one
      lexer.removeErrorListeners();
      lexer.addErrorListener(this.errorListener);
      parser.removeErrorListeners();
      parser.addErrorListener(this.errorListener);

      // Parse the source
      const parseTree = parser.rcl_file();

      // Convert to formal AST format
      const astResult = this.adapter.convertToAST(parseTree, text);

      // Collect all diagnostics
      const syntaxErrors = this.errorListener.getDiagnostics();
      const adapterDiagnostics = this.adapter.extractDiagnostics(parseTree, text);
      const diagnostics = [...syntaxErrors, ...adapterDiagnostics];

      if (!astResult.success) {
        return {
          success: false,
          error: astResult.error,
        };
      }

      const parseTime = Date.now() - startTime;

      return {
        success: true,
        value: {
          ast: astResult.value,
          diagnostics,
          parseTime,
          parserType: 'antlr',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  parseSync(text: string, _uri?: string): Result<IParseResult> {
    if (!this.initialized) {
      return {
        success: false,
        error: new Error('Parser not initialized. Call initialize() first.'),
      };
    }

    const startTime = Date.now();

    try {
      // Clear previous errors
      this.errorListener.clear();

      // Create lexer and parser
      const inputStream = CharStream.fromString(text);
      const lexer = new RclLexer(inputStream);
      const tokenStream = new CommonTokenStream(lexer);
      const parser = new RclParser(tokenStream);

      // Remove default error listeners and add our custom one
      lexer.removeErrorListeners();
      lexer.addErrorListener(this.errorListener);
      parser.removeErrorListeners();
      parser.addErrorListener(this.errorListener);

      // Parse the source
      const parseTree = parser.rcl_file();

      // Convert to formal AST format
      const astResult = this.adapter.convertToAST(parseTree, text);

      // Collect all diagnostics
      const syntaxErrors = this.errorListener.getDiagnostics();
      const adapterDiagnostics = this.adapter.extractDiagnostics(parseTree, text);
      const diagnostics = [...syntaxErrors, ...adapterDiagnostics];

      if (!astResult.success) {
        return {
          success: false,
          error: astResult.error,
        };
      }

      const parseTime = Date.now() - startTime;

      return {
        success: true,
        value: {
          ast: astResult.value,
          diagnostics,
          parseTime,
          parserType: 'antlr',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  getCapabilities(): IParserCapabilities {
    return {
      supportsSync: true,
      supportsIncremental: false,
      supportsTreeSitter: false,
      platform: 'universal' as ParserPlatform,
      version: '1.0.0',
    };
  }

  dispose(): void {
    // ANTLR doesn't have resources to dispose
    this.initialized = false;
  }

  // Legacy compatibility methods
  clearCache(_uri?: string): void {
    // Stub for compatibility - ANTLR parser doesn't need caching
  }

  private extractSymbols(ast: any): any[] {
    if (!ast) return [];

    const symbols: any[] = [];

    // Extract symbols from new AST structure
    if (ast && ast.type === 'RclFile') {
      // Extract agent sections
      for (const section of ast.sections || []) {
        if (section.sectionType === 'agent' && section.identifier) {
          symbols.push({
            name: section.identifier,
            kind: 2, // Class
            range: section.location?.range,
          });
        } else if (section.sectionType === 'flow' && section.identifier) {
          symbols.push({
            name: section.identifier,
            kind: 6, // Method
            range: section.location?.range,
          });
        } else if (section.sectionType === 'messages' && section.identifier) {
          symbols.push({
            name: section.identifier,
            kind: 13, // Property
            range: section.location?.range,
          });
        }
      }
    }

    return symbols;
  }

  private extractImports(ast: any): any[] {
    if (!ast) return [];

    const imports: any[] = [];

    if (ast && ast.type === 'RclFile') {
      for (const importStmt of ast.imports || []) {
        imports.push({
          path: importStmt.importPath.join('/'),
          alias: importStmt.alias,
          range: importStmt.location?.range,
        });
      }
    }

    return imports;
  }

  async parseDocument(content: string, uri: string, version = 1): Promise<any> {
    const parseResult = await this.parse(content, uri);

    if (parseResult.success) {
      const ast = parseResult.value.ast;
      const symbols = this.extractSymbols(ast);
      const imports = this.extractImports(ast);

      return {
        uri,
        version,
        content,
        ast,
        imports,
        symbols,
        diagnostics: parseResult.value.diagnostics,
      };
    }
    return {
      uri,
      version,
      content,
      ast: null,
      imports: [],
      symbols: [],
      diagnostics: [
        {
          range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
          message: parseResult.error.message,
          severity: 1,
        },
      ],
    };
  }
}
