import type { RCLDocument, RCLParser, RCLSettings } from '@rcl/parser';
import type { Diagnostic } from 'vscode-languageserver/node';
import type { SyntaxValidator } from '../syntaxValidator';
export declare class DiagnosticsProvider {
    private parser;
    private syntaxValidator;
    constructor(parser: RCLParser, syntaxValidator: SyntaxValidator);
    getDiagnostics(document: RCLDocument, _settings: RCLSettings): Promise<Diagnostic[]>;
}
//# sourceMappingURL=diagnostics.d.ts.map