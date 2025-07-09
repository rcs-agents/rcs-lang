import type { RCLParser } from '@rcl/parser';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { type Hover, type Position } from 'vscode-languageserver/node';
export declare class HoverProvider {
    private parser;
    constructor(parser: RCLParser);
    getHover(document: TextDocument, position: Position): Promise<Hover | null>;
}
//# sourceMappingURL=hover.d.ts.map