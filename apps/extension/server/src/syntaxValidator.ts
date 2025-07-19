import type { RCLDocument } from '@rcs-lang/parser';
import { type Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';

export class SyntaxValidator {
  validateDocument(_document: RCLDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    // Basic syntax validation can be added here
    // For now, return empty array since the mock parser handles basic validation

    return diagnostics;
  }
}
