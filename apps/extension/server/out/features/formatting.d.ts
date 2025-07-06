import { TextEdit, FormattingOptions } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '@rcl/parser';
export declare class FormattingProvider {
    private parser;
    constructor(parser: RCLParser);
    formatDocument(document: TextDocument, options: FormattingOptions): Promise<TextEdit[]>;
}
//# sourceMappingURL=formatting.d.ts.map