import { Diagnostic } from 'vscode-languageserver/node';
import { RCLParser, RCLDocument, RCLSettings } from '@rcl/parser';
import { SyntaxValidator } from '../syntaxValidator';
export declare class DiagnosticsProvider {
    private parser;
    private syntaxValidator;
    constructor(parser: RCLParser, syntaxValidator: SyntaxValidator);
    getDiagnostics(document: RCLDocument, settings: RCLSettings): Promise<Diagnostic[]>;
}
//# sourceMappingURL=diagnostics.d.ts.map