import * as path from 'node:path';
import { type CompilationResult, type Diagnostic, RclProgram } from '@rcl/language-service';
import * as vscode from 'vscode';

/**
 * Service for compiling RCL files using the language service
 */
export class CompilationService {
  private programs: Map<string, RclProgram> = new Map();
  private diagnosticsCollection: vscode.DiagnosticCollection;

  constructor() {
    this.diagnosticsCollection = vscode.languages.createDiagnosticCollection('rcl');
  }

  /**
   * Compile an RCL file
   */
  async compileFile(uri: vscode.Uri): Promise<CompilationResult> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) {
      throw new Error('File must be in a workspace');
    }

    // Get or create program for this workspace
    let program = this.programs.get(workspaceFolder.uri.fsPath);
    if (!program) {
      program = new RclProgram(workspaceFolder.uri.fsPath);
      this.programs.set(workspaceFolder.uri.fsPath, program);
    }

    // Compile the file
    const result = await program.compileFile(uri.fsPath);

    // Update diagnostics
    this.updateDiagnostics(uri, result.diagnostics);

    return result;
  }

  /**
   * Update diagnostics for a file
   */
  private updateDiagnostics(uri: vscode.Uri, diagnostics: Diagnostic[]) {
    const vscDiagnostics: vscode.Diagnostic[] = diagnostics.map((diag) => {
      const severity = this.getSeverity(diag.severity);
      const range = new vscode.Range(
        (diag.line || 1) - 1,
        (diag.column || 1) - 1,
        (diag.line || 1) - 1,
        (diag.column || 1) - 1 + 10, // Approximate length
      );

      const diagnostic = new vscode.Diagnostic(range, diag.message, severity);
      if (diag.code) {
        diagnostic.code = diag.code;
      }

      return diagnostic;
    });

    this.diagnosticsCollection.set(uri, vscDiagnostics);
  }

  /**
   * Convert severity to VS Code diagnostic severity
   */
  private getSeverity(severity: 'error' | 'warning' | 'info' | 'hint'): vscode.DiagnosticSeverity {
    switch (severity) {
      case 'error':
        return vscode.DiagnosticSeverity.Error;
      case 'warning':
        return vscode.DiagnosticSeverity.Warning;
      case 'info':
        return vscode.DiagnosticSeverity.Information;
      case 'hint':
        return vscode.DiagnosticSeverity.Hint;
    }
  }

  /**
   * Clear all diagnostics
   */
  clearDiagnostics() {
    this.diagnosticsCollection.clear();
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.diagnosticsCollection.dispose();
    this.programs.clear();
  }
}
