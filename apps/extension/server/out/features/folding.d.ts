import { FoldingRange } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '../parser/rclParser';
export declare class FoldingProvider {
    private parser;
    constructor(parser: RCLParser);
    getFoldingRanges(document: TextDocument): Promise<FoldingRange[]>;
}
