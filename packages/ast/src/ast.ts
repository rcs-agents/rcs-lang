/**
 * @fileoverview
 * This file contains the formal Abstract Syntax Tree (AST) type definitions for the
 * Rich Communication Language (RCL). The structure of these types is derived
 * directly from the RCL formal specification.
 *
 * Each interface corresponds to a rule in the syntactic specification, ensuring
 * that the parsed AST is a faithful representation of the source code's structure.
 */

import type { WithLocation } from './position.js';

// #region Core Interfaces

/**
 * The root node of an RCL file.
 * @spec RclFile ::= (ImportStatement)* (Section)*
 */
export interface RclFile extends WithLocation {
  type: 'RclFile';
  imports: ImportStatement[];
  sections: Section[];
}

/**
 * An import statement.
 * @spec ImportStatement ::= 'import' ImportPath ('as' IDENTIFIER)?
 */
export interface ImportStatement extends WithLocation {
  type: 'ImportStatement';
  /** @spec ImportPath ::= IDENTIFIER ('/' IDENTIFIER)* */
  importPath: string[];
  alias?: Identifier;
}

// #endregion

// #region Section Constructs

/**
 * A generic section, which is the primary building block of an RCL file.
 * @spec Section ::= SECTION_TYPE IDENTIFIER? ParameterList? (INDENT (SpreadDirective | Attribute | Section | MatchBlock | Value)* DEDENT)?
 */
export interface Section extends WithLocation {
  type: 'Section';
  sectionType: string;
  identifier?: Identifier;
  parameters?: ParameterList;
  body: (SpreadDirective | Attribute | Section | MatchBlock | Value)[];
}

/**
 * An attribute, which is a key-value pair within a section.
 * @spec Attribute ::= ATTRIBUTE_KEY ':' Value
 */
export interface Attribute extends WithLocation {
  type: 'Attribute';
  key: string;
  value: Value;
}

/**
 * A spread directive to include attributes from another section.
 * @spec SpreadDirective ::= SPREAD IDENTIFIER
 */
export interface SpreadDirective extends WithLocation {
  type: 'SpreadDirective';
  reference: Identifier;
}

/**
 * A match block for conditional value selection.
 * @spec MatchBlock ::= 'match' Value INDENT (MatchCase)+ DEDENT
 */
export interface MatchBlock extends WithLocation {
  type: 'MatchBlock';
  discriminant: Value;
  cases: MatchCase[];
}

/**
 * A case within a match block.
 * @spec MatchCase ::= (STRING | NUMBER | ATOM) '->' ContextualizedValue | ':default' '->' ContextualizedValue
 */
export interface MatchCase extends WithLocation {
  type: 'MatchCase';
  value: StringLiteral | NumericLiteral | Atom | 'default';
  consequence: ContextualizedValue;
}

// #endregion

// #region Value Constructs

/**
 * A union of all possible value types in RCL.
 * @spec Value ::= PrimitiveValue | IDENTIFIER | VARIABLE | PROPERTY_ACCESS | List | Dictionary | EmbeddedCode | ContextualizedValue
 */
export type Value =
  | PrimitiveValue
  | Identifier
  | Variable
  | PropertyAccess
  | List
  | Dictionary
  | EmbeddedCode
  | ContextualizedValue;

/**
 * A union of primitive value types.
 * @spec PrimitiveValue ::= STRING | MultiLineString | NUMBER | BooleanLiteral | NullLiteral | ATOM | TypeTag
 */
export type PrimitiveValue =
  | StringLiteral
  | MultiLineString
  | NumericLiteral
  | BooleanLiteral
  | NullLiteral
  | Atom
  | TypeTag;

/**
 * A value that can be contextualized with parameters.
 * @spec ContextualizedValue ::= Value ('with' ParameterList)?
 */
export interface ContextualizedValue extends WithLocation {
  type: 'ContextualizedValue';
  value: Value;
  context?: ParameterList;
}

/**
 * A list of parameters.
 * @spec ParameterList ::= Parameter (',' Parameter)*
 */
export type ParameterList = Parameter[];

/**
 * A single parameter, which can be positional or named.
 * @spec Parameter ::= ATTRIBUTE_KEY ':' Value | Value
 */
export interface Parameter extends WithLocation {
  type: 'Parameter';
  key?: string;
  value: Value;
}

// #endregion

// #region Literals and Identifiers

/** A double-quoted string literal. May contain interpolations. */
export interface StringLiteral extends WithLocation {
  type: 'StringLiteral';
  value: string;
}

/**
 * A multi-line string with chomping controls or in triple-quoted mode.
 * @spec MultiLineString ::= (PIPE_STYLE) | (TRIPLE_QUOTE_STYLE)
 */
export interface MultiLineString extends WithLocation {
  type: 'MultiLineString';
  mode: 'clean' | 'trim' | 'preserve' | 'preserve_all' | 'quoted';
  value: string;
}

/** A numeric literal. */
export interface NumericLiteral extends WithLocation {
  type: 'NumericLiteral';
  value: number;
}

/** A boolean literal. */
export interface BooleanLiteral extends WithLocation {
  type: 'BooleanLiteral';
  value: boolean;
}

/** A null literal. */
export interface NullLiteral extends WithLocation {
  type: 'NullLiteral';
  value: null;
}

/** An atom literal. */
export interface Atom extends WithLocation {
  type: 'Atom';
  value: string; // e.g., ':symbol'
}

/** An identifier (name reference). */
export interface Identifier extends WithLocation {
  type: 'Identifier';
  value: string; // e.g., 'Welcome', 'Config'
}

/** A variable reference. */
export interface Variable extends WithLocation {
  type: 'Variable';
  name: string; // e.g., '@variable'
}

/** A property access on a variable. */
export interface PropertyAccess extends WithLocation {
  type: 'PropertyAccess';
  object: Variable;
  properties: string[]; // e.g., 'property1', 'property2'
}

// #endregion

// #region Collections

/**
 * A list of values.
 * @spec List ::= ParenthesesList | InlineList | BlockList
 */
export interface List extends WithLocation {
  type: 'List';
  items: Value[];
}

/**
 * A dictionary of key-value pairs.
 * @spec Dictionary ::= BraceDictionary | BlockDictionary
 */
export interface Dictionary extends WithLocation {
  type: 'Dictionary';
  entries: DictionaryEntry[];
}

/**
 * An entry in a dictionary.
 * @spec DictEntry ::= (ATTRIBUTE_KEY | STRING) ':' Value
 */
export interface DictionaryEntry extends WithLocation {
  type: 'DictionaryEntry';
  key: string | StringLiteral;
  value: Value;
}

// #endregion

// #region Advanced Values

/**
 * A type tag for semantic data types.
 * @spec TypeTag ::= '<' TYPE_TAG_NAME (STRING | NUMBER | IDENTIFIER | ISO_DURATION) ('|' STRING)? '>'
 */
export interface TypeTag extends WithLocation {
  type: 'TypeTag';
  tagName: string;
  value: string | number;
  qualifier?: string;
}

/**
 * An embedded code expression or block.
 * @spec EmbeddedCode ::= SingleLineCode | MultiLineCode
 */
export type EmbeddedCode = SingleLineCode | MultiLineCode;

/**
 * A single-line embedded code expression.
 * @spec SingleLineCode ::= EMBEDDED_CODE
 */
export interface SingleLineCode extends WithLocation {
  type: 'SingleLineCode';
  language?: 'js' | 'ts';
  code: string;
}

/**
 * A multi-line embedded code block.
 * @spec MultiLineCode ::= MULTI_LINE_CODE_START INDENT CodeContent DEDENT MULTI_LINE_CODE_END
 */
export interface MultiLineCode extends WithLocation {
  type: 'MultiLineCode';
  language?: 'js' | 'ts';
  code: string;
}

// #endregion
