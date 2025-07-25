/**
 * Type guards for AST nodes
 */

import type {
  Atom,
  Attribute,
  BooleanLiteral,
  ContextualizedValue,
  Dictionary,
  DictionaryEntry,
  EmbeddedCode,
  Identifier,
  ImportStatement,
  List,
  MatchBlock,
  MatchCase,
  MultiLineCode,
  MultiLineString,
  NullLiteral,
  NumericLiteral,
  Parameter,
  PrimitiveValue,
  PropertyAccess,
  RclFile,
  Section,
  SingleLineCode,
  SpreadDirective,
  StringLiteral,
  TypeTag,
  Value,
  Variable,
} from './ast.js';

// Type guard helper
function hasType<T extends { type: string }>(obj: any, type: string): obj is T {
  return obj && typeof obj === 'object' && obj.type === type;
}

// Root node
export function isRclFile(node: any): node is RclFile {
  return hasType(node, 'RclFile');
}

// Top-level constructs
export function isImportStatement(node: any): node is ImportStatement {
  return hasType(node, 'ImportStatement');
}

export function isSection(node: any): node is Section {
  return hasType(node, 'Section');
}

// Section body elements
export function isAttribute(node: any): node is Attribute {
  return hasType(node, 'Attribute');
}

export function isSpreadDirective(node: any): node is SpreadDirective {
  return hasType(node, 'SpreadDirective');
}

export function isMatchBlock(node: any): node is MatchBlock {
  return hasType(node, 'MatchBlock');
}

export function isMatchCase(node: any): node is MatchCase {
  return hasType(node, 'MatchCase');
}

// Values
export function isContextualizedValue(node: any): node is ContextualizedValue {
  return hasType(node, 'ContextualizedValue');
}

export function isParameter(node: any): node is Parameter {
  return hasType(node, 'Parameter');
}

// Literals
export function isStringLiteral(node: any): node is StringLiteral {
  return hasType(node, 'StringLiteral');
}

export function isMultiLineString(node: any): node is MultiLineString {
  return hasType(node, 'MultiLineString');
}

export function isNumericLiteral(node: any): node is NumericLiteral {
  return hasType(node, 'NumericLiteral');
}

export function isBooleanLiteral(node: any): node is BooleanLiteral {
  return hasType(node, 'BooleanLiteral');
}

export function isNullLiteral(node: any): node is NullLiteral {
  return hasType(node, 'NullLiteral');
}

export function isAtom(node: any): node is Atom {
  return hasType(node, 'Atom');
}

// Variables and access
export function isVariable(node: any): node is Variable {
  return hasType(node, 'Variable');
}

export function isPropertyAccess(node: any): node is PropertyAccess {
  return hasType(node, 'PropertyAccess');
}

// Collections
export function isList(node: any): node is List {
  return hasType(node, 'List');
}

export function isDictionary(node: any): node is Dictionary {
  return hasType(node, 'Dictionary');
}

export function isDictionaryEntry(node: any): node is DictionaryEntry {
  return hasType(node, 'DictionaryEntry');
}

// Type tags
export function isTypeTag(node: any): node is TypeTag {
  return hasType(node, 'TypeTag');
}

// Embedded code
export function isSingleLineCode(node: any): node is SingleLineCode {
  return hasType(node, 'SingleLineCode');
}

export function isMultiLineCode(node: any): node is MultiLineCode {
  return hasType(node, 'MultiLineCode');
}

export function isEmbeddedCode(node: any): node is EmbeddedCode {
  return isSingleLineCode(node) || isMultiLineCode(node);
}

// Higher-level guards
export function isPrimitiveValue(node: any): node is PrimitiveValue {
  return (
    isStringLiteral(node) ||
    isMultiLineString(node) ||
    isNumericLiteral(node) ||
    isBooleanLiteral(node) ||
    isNullLiteral(node) ||
    isAtom(node) ||
    isTypeTag(node)
  );
}

export function isValue(node: any): node is Value {
  return (
    isPrimitiveValue(node) ||
    isIdentifier(node) ||
    isVariable(node) ||
    isPropertyAccess(node) ||
    isList(node) ||
    isDictionary(node) ||
    isEmbeddedCode(node) ||
    isContextualizedValue(node)
  );
}

// Utility guard for checking if a value is an identifier
export function isIdentifier(value: Value): value is Identifier {
  return hasType(value, 'Identifier');
}
