import { CompletionItem, Position } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '@rcl/parser';
export declare class CompletionProvider {
    private parser;
    constructor(parser: RCLParser);
    getCompletions(document: TextDocument, position: Position): Promise<CompletionItem[]>;
    resolveCompletion(item: CompletionItem): CompletionItem;
}
//# sourceMappingURL=completion.d.ts.map