import type { RCLParser } from '@rcs-lang/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { type DocumentSymbol, SymbolKind } from 'vscode-languageserver/node';

export class SymbolsProvider {
  constructor(private parser: RCLParser) { }

  public async getDocumentSymbols(document: TextDocument): Promise<DocumentSymbol[]> {
    const symbols: DocumentSymbol[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    // Simple symbol extraction
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('agent ')) {
        const name = line.substring(6).trim();
        symbols.push({
          name: name,
          detail: 'RCS Agent',
          kind: SymbolKind.Class,
          range: {
            start: { line: i, character: 0 },
            end: { line: i, character: line.length },
          },
          selectionRange: {
            start: { line: i, character: 6 },
            end: { line: i, character: 6 + name.length },
          },
        });
      }

      if (line.startsWith('flow ')) {
        const name = line.substring(5).trim();
        symbols.push({
          name: name,
          detail: 'Conversation Flow',
          kind: SymbolKind.Method,
          range: {
            start: { line: i, character: 0 },
            end: { line: i, character: line.length },
          },
          selectionRange: {
            start: { line: i, character: 5 },
            end: { line: i, character: 5 + name.length },
          },
        });
      }
    }

    return symbols;
  }
}
