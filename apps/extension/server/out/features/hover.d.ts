import { Hover, Position } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '../parser/rclParser';
export declare class HoverProvider {
    private parser;
    constructor(parser: RCLParser);
    getHover(document: TextDocument, position: Position): Promise<Hover | null>;
}
