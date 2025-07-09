import type { RCLParser } from '@rcl/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { type FoldingRange } from 'vscode-languageserver/node';
export declare class FoldingProvider {
    private parser;
    constructor(parser: RCLParser);
    getFoldingRanges(document: TextDocument): Promise<FoldingRange[]>;
}
//# sourceMappingURL=folding.d.ts.map