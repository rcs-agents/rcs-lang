import type { RCLParser } from '@rcl/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { type DocumentSymbol } from 'vscode-languageserver/node';
export declare class SymbolsProvider {
    private parser;
    constructor(parser: RCLParser);
    getDocumentSymbols(document: TextDocument): Promise<DocumentSymbol[]>;
}
//# sourceMappingURL=symbols.d.ts.map