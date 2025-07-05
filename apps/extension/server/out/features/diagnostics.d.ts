import { Diagnostic } from 'vscode-languageserver/node';
import { RCLParser } from '../parser/rclParser';
import { SyntaxValidator } from '../parser/syntaxValidation';
import { RCLDocument, RCLSettings } from '../types/rclTypes';
export declare class DiagnosticsProvider {
    private parser;
    private syntaxValidator;
    constructor(parser: RCLParser, syntaxValidator: SyntaxValidator);
    getDiagnostics(document: RCLDocument, settings: RCLSettings): Promise<Diagnostic[]>;
}
