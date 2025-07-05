import { TextEdit, FormattingOptions } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '../parser/rclParser';
export declare class FormattingProvider {
    private parser;
    constructor(parser: RCLParser);
    formatDocument(document: TextDocument, options: FormattingOptions): Promise<TextEdit[]>;
}
