import type { RCLParser } from '@rcl/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { SemanticTokens, SemanticTokensLegend } from 'vscode-languageserver/node';
export declare class SemanticTokensProvider {
    private parser;
    private legend;
    constructor(parser: RCLParser);
    getLegend(): SemanticTokensLegend;
    getSemanticTokens(_document: TextDocument): Promise<SemanticTokens>;
}
//# sourceMappingURL=semanticTokens.d.ts.map