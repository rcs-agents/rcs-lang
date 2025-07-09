/**
 * Severity levels for diagnostics
 */
export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint';

/**
 * Source range for diagnostics
 */
export interface Range {
  start: Position;
  end: Position;
}

/**
 * Position in a document
 */
export interface Position {
  line: number;
  column: number;
}

/**
 * Base diagnostic interface
 */
export interface Diagnostic {
  severity: DiagnosticSeverity;
  message: string;
  code?: string;
  source?: string;
  range?: Range;
  file?: string;
  relatedInformation?: DiagnosticRelatedInformation[];
}

/**
 * Related information for a diagnostic
 */
export interface DiagnosticRelatedInformation {
  location: Location;
  message: string;
}

/**
 * Location in a file
 */
export interface Location {
  uri: string;
  range: Range;
}

/**
 * Collection of diagnostics
 */
export interface DiagnosticCollection {
  diagnostics: Diagnostic[];
  hasErrors(): boolean;
  hasWarnings(): boolean;
  getErrors(): Diagnostic[];
  getWarnings(): Diagnostic[];
}

/**
 * Implementation of DiagnosticCollection
 */
export class DiagnosticCollectionImpl implements DiagnosticCollection {
  constructor(public diagnostics: Diagnostic[] = []) {}

  hasErrors(): boolean {
    return this.diagnostics.some(d => d.severity === 'error');
  }

  hasWarnings(): boolean {
    return this.diagnostics.some(d => d.severity === 'warning');
  }

  getErrors(): Diagnostic[] {
    return this.diagnostics.filter(d => d.severity === 'error');
  }

  getWarnings(): Diagnostic[] {
    return this.diagnostics.filter(d => d.severity === 'warning');
  }

  add(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
  }

  addAll(diagnostics: Diagnostic[]): void {
    this.diagnostics.push(...diagnostics);
  }

  clear(): void {
    this.diagnostics = [];
  }
}