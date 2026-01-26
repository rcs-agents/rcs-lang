import type { RclConfig } from '../config/types';

/**
 * Represents a diagnostic message (error, warning, etc.)
 */
export interface Diagnostic {
  /**
   * The diagnostic message
   */
  message: string;

  /**
   * Severity level
   */
  severity: 'error' | 'warning' | 'info' | 'hint';

  /**
   * File path where the diagnostic occurred
   */
  file?: string;

  /**
   * Line number (1-based)
   */
  line?: number;

  /**
   * Column number (1-based)
   */
  column?: number;

  /**
   * Diagnostic code for categorization
   */
  code?: string;
}

/**
 * Result of a compilation
 */
export interface CompilationResult {
  /**
   * Whether compilation succeeded
   */
  success: boolean;

  /**
   * Diagnostics produced during compilation
   */
  diagnostics: Diagnostic[];

  /**
   * Compiled output data
   */
  data?: CompiledAgent;
}

/**
 * Compiled agent data structure
 */
export interface CompiledAgent {
  /**
   * Agent configuration and metadata
   */
  agent: AgentData;

  /**
   * Message definitions
   */
  messages: Record<string, any>;

  /**
   * Flow definitions
   */
  flows: Record<string, any>;
}

/**
 * Agent metadata and configuration
 */
export interface AgentData {
  /**
   * Agent name (identifier)
   */
  name: string;

  /**
   * Display name for UI
   */
  displayName?: string;

  /**
   * Brand name
   */
  brandName?: string;

  /**
   * Agent configuration
   */
  config?: any;

  /**
   * Default settings
   */
  defaults?: any;
}

/**
 * Result of emit operation
 */
export interface EmitResult {
  /**
   * Whether emit succeeded
   */
  success: boolean;

  /**
   * Files that were emitted
   */
  emittedFiles: string[];

  /**
   * Diagnostics produced during emit
   */
  diagnostics: Diagnostic[];
}

/**
 * Source file representation
 */
export interface SourceFile {
  /**
   * File path
   */
  path: string;

  /**
   * File content
   */
  content: string;

  /**
   * Parsed AST (if available)
   */
  ast?: any;

  /**
   * Parse errors
   */
  parseErrors?: Diagnostic[];
}

/**
 * RCL Program interface - manages compilation of RCL files
 */
export interface RclProgram {
  /**
   * Get the configuration
   */
  getConfiguration(): RclConfig;

  /**
   * Compile a single file
   */
  compileFile(filePath: string): Promise<CompilationResult>;

  /**
   * Get all diagnostics
   */
  getDiagnostics(): Diagnostic[];

  /**
   * Get semantic diagnostics (type checking, validation)
   */
  getSemanticDiagnostics(): Diagnostic[];

  /**
   * Get syntactic diagnostics (parse errors)
   */
  getSyntacticDiagnostics(): Diagnostic[];

  /**
   * Emit compiled files
   */
  emit(): Promise<EmitResult>;

  /**
   * Get source files in the program
   */
  getSourceFiles(): SourceFile[];
}
