import { Definition, Position } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '@rcl/parser';
export declare class DefinitionProvider {
    private parser;
    constructor(parser: RCLParser);
    getDefinition(document: TextDocument, position: Position): Promise<Definition | null>;
}
//# sourceMappingURL=definition.d.ts.map