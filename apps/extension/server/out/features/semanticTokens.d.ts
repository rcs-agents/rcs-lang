import { SemanticTokens, SemanticTokensLegend } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '@rcl/parser';
export declare class SemanticTokensProvider {
    private parser;
    private legend;
    constructor(parser: RCLParser);
    getLegend(): SemanticTokensLegend;
    getSemanticTokens(document: TextDocument): Promise<SemanticTokens>;
}
//# sourceMappingURL=semanticTokens.d.ts.map