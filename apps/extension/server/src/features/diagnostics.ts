import { Diagnostic } from 'vscode-languageserver/node';
import { RCLParser } from '../parser/rclParser';
import { SyntaxValidator } from '../parser/syntaxValidation';
import { RCLDocument, RCLSettings } from '../types/rclTypes';

export class DiagnosticsProvider {
  constructor(
    private parser: RCLParser,
    private syntaxValidator: SyntaxValidator
  ) {}

  public async getDiagnostics(document: RCLDocument, settings: RCLSettings): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    
    // Syntax validation
    diagnostics.push(...this.syntaxValidator.validateDocument(document));
    
    // Additional semantic validation can be added here
    
    return diagnostics;
  }
}