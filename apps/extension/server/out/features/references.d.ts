import { Location, Position, ReferenceContext } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '@rcl/parser';
export declare class ReferencesProvider {
    private parser;
    constructor(parser: RCLParser);
    getReferences(document: TextDocument, position: Position, context: ReferenceContext): Promise<Location[]>;
}
//# sourceMappingURL=references.d.ts.map