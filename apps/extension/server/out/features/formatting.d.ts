import type { RCLParser } from '@rcl/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { FormattingOptions, TextEdit } from 'vscode-languageserver/node';
export declare class FormattingProvider {
    private parser;
    constructor(parser: RCLParser);
    formatDocument(document: TextDocument, options: FormattingOptions): Promise<TextEdit[]>;
}
//# sourceMappingURL=formatting.d.ts.map