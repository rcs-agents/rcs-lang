import type { RCLDocument, RCLParser, RCLSettings } from '@rcl/parser';
import type { Diagnostic } from 'vscode-languageserver/node';
import type { SyntaxValidator } from '../syntaxValidator';

export class DiagnosticsProvider {
  constructor(
    private parser: RCLParser,
    private syntaxValidator: SyntaxValidator,
  ) {}

  public async getDiagnostics(
    document: RCLDocument,
    _settings: RCLSettings,
  ): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];

    // Syntax validation
    diagnostics.push(...this.syntaxValidator.validateDocument(document));

    // Additional semantic validation can be added here

    return diagnostics;
  }
}
