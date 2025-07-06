import { DocumentSymbol } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '@rcl/parser';
export declare class SymbolsProvider {
    private parser;
    constructor(parser: RCLParser);
    getDocumentSymbols(document: TextDocument): Promise<DocumentSymbol[]>;
}
//# sourceMappingURL=symbols.d.ts.map