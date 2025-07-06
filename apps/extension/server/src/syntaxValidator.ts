import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';
import { RCLDocument } from '@rcl/parser';

export class SyntaxValidator {
  validateDocument(document: RCLDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    
    // Basic syntax validation can be added here
    // For now, return empty array since the mock parser handles basic validation
    
    return diagnostics;
  }
}