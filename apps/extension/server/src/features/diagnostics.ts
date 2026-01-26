import { Diagnostic } from 'vscode-languageserver/node';
import { RCLParser, RCLDocument, RCLSettings } from '@rcl/parser';
import { SyntaxValidator } from '../syntaxValidator';

export class DiagnosticsProvider {
  constructor(
    private parser: RCLParser,
    private syntaxValidator: SyntaxValidator,
  ) {}

  public async getDiagnostics(document: RCLDocument, settings: RCLSettings): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];

    // Syntax validation
    diagnostics.push(...this.syntaxValidator.validateDocument(document));

    // Additional semantic validation can be added here

    return diagnostics;
  }
}
