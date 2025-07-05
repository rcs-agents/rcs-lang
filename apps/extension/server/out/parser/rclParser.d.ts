import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLASTNode } from '../types/astTypes';
import { RCLDocument } from '../types/rclTypes';
export declare class RCLParser {
    private parser;
    private documentCache;
    constructor();
    parseDocument(document: TextDocument): RCLDocument;
    private parseText;
    private mockParse;
    private convertToRCLNode;
    private extractImports;
    private extractSymbols;
    private traverseAST;
    private extractImportPath;
    private extractNodeName;
    private nodeTypeToSymbolKind;
    private nodeToRange;
    getNodeAt(document: RCLDocument, line: number, character: number): RCLASTNode | null;
    private findNodeAtPosition;
    clearCache(uri?: string): void;
}
