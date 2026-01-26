import type { RCLParser } from '@rcl/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { Location, Position, ReferenceContext } from 'vscode-languageserver/node';
export declare class ReferencesProvider {
    private parser;
    constructor(parser: RCLParser);
    getReferences(_document: TextDocument, _position: Position, _context: ReferenceContext): Promise<Location[]>;
}
//# sourceMappingURL=references.d.ts.map