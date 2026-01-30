import type { ISymbol } from '@rcs-lang/core';
import type { RCLParser } from '@rcs-lang/parser';
import { RclSymbolExtractor } from '@rcs-lang/parser/symbol-extractor';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { DocumentSymbol, SymbolKind } from 'vscode-languageserver/node';

export class SymbolsProvider {
  private symbolExtractor: RclSymbolExtractor;

  constructor(private parser: RCLParser) {
    this.symbolExtractor = new RclSymbolExtractor({
      includeAttributes: true,
      includeMatchClauses: true,
    });
  }

  public async getDocumentSymbols(document: TextDocument): Promise<DocumentSymbol[]> {
    try {
      // Parse the document to get the AST
      const parseResult = await this.parser.parse(document.getText(), document.uri);

      if (!parseResult.success || !parseResult.value.ast) {
        // Fallback to empty symbols if parsing fails
        return [];
      }

      // Extract symbols from the AST
      const symbols = this.symbolExtractor.extractSymbols(parseResult.value.ast);

      // Convert ISymbol to DocumentSymbol (they have compatible structure)
      return this.convertSymbols(symbols);
    } catch (error) {
      console.error('Error extracting symbols:', error);
      return [];
    }
  }

  /**
   * Convert ISymbol array to DocumentSymbol array
   * The interfaces are mostly compatible, but we need to handle any differences
   */
  private convertSymbols(symbols: ISymbol[]): DocumentSymbol[] {
    return symbols.map((symbol) => this.convertSymbol(symbol));
  }

  private convertSymbol(symbol: ISymbol): DocumentSymbol {
    const docSymbol: DocumentSymbol = {
      name: symbol.name,
      kind: symbol.kind as SymbolKind, // Both use the same numeric values
      range: symbol.range,
      selectionRange: symbol.selectionRange,
      detail: undefined, // DocumentSymbol supports detail, ISymbol doesn't
      children: symbol.children ? this.convertSymbols(symbol.children) : undefined,
    };

    return docSymbol;
  }
}
