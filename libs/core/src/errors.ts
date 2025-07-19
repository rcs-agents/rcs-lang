/**
 * RCL Error System
 * 
 * This module defines a comprehensive error hierarchy for the RCL compiler/parser system.
 * All errors follow a consistent structure with categorization, specific codes, and user-friendly messages.
 */

import type { Diagnostic, DiagnosticSeverity, Position, Range } from './diagnostics.js';

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  /** Syntax errors from parsing */
  SYNTAX = 'SYNTAX',
  /** Semantic errors from validation */
  SEMANTIC = 'SEMANTIC',
  /** Reference resolution errors */
  REFERENCE = 'REFERENCE',
  /** Type-related errors */
  TYPE = 'TYPE',
  /** General validation errors */
  VALIDATION = 'VALIDATION',
  /** File system or I/O errors */
  IO = 'IO',
  /** Internal compiler errors */
  INTERNAL = 'INTERNAL'
}

/**
 * Specific error codes following a consistent naming pattern
 */
export enum ErrorCode {
  // Syntax errors (RCL001-099)
  MISSING_IDENTIFIER = 'RCL001',
  INVALID_INDENTATION = 'RCL002',
  UNEXPECTED_TOKEN = 'RCL003',
  MISSING_COLON = 'RCL004',
  INVALID_SECTION_TYPE = 'RCL005',
  MALFORMED_MATCH_STATEMENT = 'RCL006',
  
  // Semantic errors (RCL101-199)
  MISSING_REQUIRED_FIELD = 'RCL101',
  DUPLICATE_DEFINITION = 'RCL102',
  INVALID_AGENT_NAME = 'RCL103',
  MISSING_DISPLAY_NAME = 'RCL104',
  EMPTY_FLOW_SECTION = 'RCL105',
  MISSING_FLOW_START = 'RCL106',
  
  // Reference errors (RCL201-299)
  UNDEFINED_STATE_REFERENCE = 'RCL201',
  UNDEFINED_MESSAGE_REFERENCE = 'RCL202',
  UNDEFINED_FLOW_REFERENCE = 'RCL203',
  CIRCULAR_REFERENCE = 'RCL204',
  
  // Type errors (RCL301-399)
  INVALID_TYPE_TAG = 'RCL301',
  TYPE_MISMATCH = 'RCL302',
  INVALID_TYPE_TAG_VALUE = 'RCL303',
  
  // Validation errors (RCL401-499)
  INVALID_PROPERTY_NAME = 'RCL401',
  VALUE_OUT_OF_RANGE = 'RCL402',
  INVALID_MESSAGE_TYPE = 'RCL403',
  
  // I/O errors (RCL501-599)
  FILE_NOT_FOUND = 'RCL501',
  FILE_READ_ERROR = 'RCL502',
  
  // Internal errors (RCL901-999)
  INTERNAL_ERROR = 'RCL901',
  PARSER_INITIALIZATION_ERROR = 'RCL902'
}

/**
 * Quick fix suggestion for an error
 */
export interface QuickFix {
  label: string;
  replacement?: string;
  range?: Range;
}

/**
 * Unified error interface for RCL
 */
export interface RCLError {
  /** Specific error code */
  code: ErrorCode;
  /** Error category for classification */
  category: ErrorCategory;
  /** Human-readable error message */
  message: string;
  /** Severity level */
  severity: DiagnosticSeverity;
  /** Location in source code */
  range?: Range;
  /** File path if applicable */
  file?: string;
  /** Additional hint to help resolve the error */
  hint?: string;
  /** Suggested quick fixes */
  quickFixes?: QuickFix[];
  /** Additional context data */
  data?: Record<string, any>;
}

/**
 * Convert RCLError to LSP Diagnostic
 */
export function errorToDiagnostic(error: RCLError): Diagnostic {
  return {
    severity: error.severity,
    message: error.message,
    code: error.code,
    source: `rcl-${error.category.toLowerCase()}`,
    range: error.range,
    file: error.file
  };
}

/**
 * Error factory functions for common errors
 */
export class RCLErrorFactory {
  // Internal errors
  static internalError(message: string): RCLError {
    return {
      code: ErrorCode.INTERNAL_ERROR,
      category: ErrorCategory.INTERNAL,
      severity: 'error',
      message: `Internal error: ${message}`,
      hint: 'This is likely a bug in the compiler. Please report it.'
    };
  }

  // Validation errors
  static missingRequiredField(field: string): RCLError {
    return {
      code: ErrorCode.MISSING_REQUIRED_FIELD,
      category: ErrorCategory.VALIDATION,
      severity: 'error',
      message: `Missing required field: ${field}`,
      hint: `Add the required '${field}' to your RCL file`
    };
  }

  static duplicateDefinition(type: string, node?: any): RCLError {
    return {
      code: ErrorCode.DUPLICATE_DEFINITION,
      category: ErrorCategory.SEMANTIC,
      severity: 'error',
      message: `Duplicate ${type} definition`,
      hint: `Only one ${type} section is allowed per file`,
      range: node?.location?.range
    };
  }

  static emptyFlowSection(flowName: string): RCLError {
    return {
      code: ErrorCode.EMPTY_FLOW_SECTION,
      category: ErrorCategory.SEMANTIC,
      severity: 'error',
      message: `Flow '${flowName}' has no states defined`,
      hint: 'Add at least one state to your flow using "on StateName" syntax'
    };
  }
  // Syntax errors
  static missingIdentifier(position: Position, context: string): RCLError {
    return {
      code: ErrorCode.MISSING_IDENTIFIER,
      category: ErrorCategory.SYNTAX,
      severity: 'error',
      message: `Missing identifier after '${context}'`,
      hint: `Add a name after '${context}'. For example: '${context} MyName'`,
      range: { start: position, end: position }
    };
  }

  static invalidIndentation(line: number, expected: number, actual: number): RCLError {
    return {
      code: ErrorCode.INVALID_INDENTATION,
      category: ErrorCategory.SYNTAX,
      severity: 'error',
      message: `Invalid indentation at line ${line + 1}. Expected ${expected} spaces, found ${actual}`,
      hint: 'RCL uses 2-space indentation. Make sure to align content properly under its parent.',
      range: {
        start: { line, character: 0 },
        end: { line, character: actual }
      }
    };
  }

  static unexpectedToken(token: string, position: Position, expected?: string): RCLError {
    const message = expected 
      ? `Unexpected token '${token}'. Expected ${expected}`
      : `Unexpected token '${token}'`;
    
    return {
      code: ErrorCode.UNEXPECTED_TOKEN,
      category: ErrorCategory.SYNTAX,
      severity: 'error',
      message,
      range: {
        start: position,
        end: { line: position.line, character: position.character + token.length }
      }
    };
  }

  static missingColon(line: number, afterProperty: string): RCLError {
    return {
      code: ErrorCode.MISSING_COLON,
      category: ErrorCategory.SYNTAX,
      severity: 'error',
      message: `Missing ':' after property '${afterProperty}'`,
      hint: `Add a colon after '${afterProperty}'. For example: '${afterProperty}: value'`,
      range: {
        start: { line, character: afterProperty.length },
        end: { line, character: afterProperty.length }
      }
    };
  }

  // Semantic errors
  static missingDisplayName(agentName: string): RCLError {
    return {
      code: ErrorCode.MISSING_DISPLAY_NAME,
      category: ErrorCategory.SEMANTIC,
      severity: 'error',
      message: `Agent '${agentName}' must have a displayName property`,
      hint: 'Add a displayName property to your agent definition',
      quickFixes: [{
        label: 'Add displayName',
        replacement: '  displayName: "Your Agent Name"'
      }]
    };
  }

  static missingFlowStart(flowName: string): RCLError {
    return {
      code: ErrorCode.MISSING_FLOW_START,
      category: ErrorCategory.SEMANTIC,
      severity: 'error',
      message: `Flow '${flowName}' must have a 'start' property`,
      hint: 'Specify which state the flow should start in',
      quickFixes: [{
        label: 'Add start state',
        replacement: '    start: InitialState'
      }]
    };
  }

  static undefinedStateReference(stateName: string, flowName: string, position?: Position): RCLError {
    return {
      code: ErrorCode.UNDEFINED_STATE_REFERENCE,
      category: ErrorCategory.REFERENCE,
      severity: 'error',
      message: `Reference to undefined state '${stateName}' in flow '${flowName}'`,
      hint: `Make sure to define an 'on ${stateName}' section in your flow`,
      range: position ? {
        start: position,
        end: { line: position.line, character: position.character + stateName.length }
      } : undefined
    };
  }

  // Type errors
  static invalidTypeTag(tagName: string, position?: Position): RCLError {
    return {
      code: ErrorCode.INVALID_TYPE_TAG,
      category: ErrorCategory.TYPE,
      severity: 'error',
      message: `Invalid type tag '${tagName}'. Type tags must be valid identifiers`,
      hint: 'Type tags should be simple identifiers like: <url>, <email>, <color>',
      range: position ? {
        start: position,
        end: { line: position.line, character: position.character + tagName.length }
      } : undefined
    };
  }

  static invalidTypeTagValue(tagType: string, value: string): RCLError {
    return {
      code: ErrorCode.INVALID_TYPE_TAG_VALUE,
      category: ErrorCategory.TYPE,
      severity: 'error',
      message: `Invalid value '${value}' for type tag <${tagType}>`,
      hint: `Type tag values should not be quoted. Use: <${tagType} ${value}> instead of <${tagType} "${value}">`
    };
  }
}

/**
 * Convert legacy error format to RCLError
 */
export function legacyErrorToRCLError(error: any): RCLError {
  // Try to determine category from message or code
  let category = ErrorCategory.VALIDATION;
  let code = ErrorCode.INTERNAL_ERROR;
  
  if (error.code) {
    if (error.code.includes('SYNTAX')) category = ErrorCategory.SYNTAX;
    else if (error.code.includes('SEMANTIC')) category = ErrorCategory.SEMANTIC;
    else if (error.code.includes('TYPE')) category = ErrorCategory.TYPE;
  }
  
  return {
    code,
    category,
    severity: error.severity || 'error',
    message: error.message || 'Unknown error',
    range: error.range || (error.line && error.column ? {
      start: { line: error.line - 1, character: error.column - 1 },
      end: { line: error.line - 1, character: error.column }
    } : undefined),
    file: error.file
  };
}

/**
 * Convert RCLError to legacy error format for backward compatibility
 */
export function rclErrorToLegacy(error: RCLError): any {
  return {
    message: error.message,
    code: error.code,
    severity: error.severity,
    line: error.range ? error.range.start.line + 1 : 1,
    column: error.range ? error.range.start.character + 1 : 1,
    range: error.range
  };
}