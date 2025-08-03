lexer grammar RclLexer;

options {
    superClass = RclLexerBase;
}

// Keywords (minimal set for generic language)
IMPORT: 'import';
AS: 'as';
WITH: 'with';
MATCH: 'match';

// Flow control keywords
START: 'start';
ON: 'on';

// Context operation keywords
APPEND: 'append';
SET: 'set';
MERGE: 'merge';
TO: 'to';
INTO: 'into';
RESULT: 'result';

// Flow termination atoms (special case for flow returns)
FLOW_END: ':end';
FLOW_CANCEL: ':cancel';
FLOW_ERROR: ':error';

// Literals (NOTE: 'On' removed due to conflict with 'on' keyword)
BOOLEAN: 'True' | 'Yes' | 'False' | 'No' | 'Off';
NULL: 'Null' | 'None' | 'Void';
NUMBER: '-'? [0-9]+ ('.' [0-9]+)? ([eE] [+-]? [0-9]+)?;

// Attributes and atoms with better tokenization
// ATTRIBUTE_NAME requires at least 3 chars before colon to avoid matching 'on :'
ATTRIBUTE_NAME: [a-z] [a-zA-Z0-9_] [a-zA-Z0-9_]+ [ \t]* ':';  // At least 3 chars before colon
ATOM: ':' [a-zA-Z_] [a-zA-Z0-9_]*;
DEFAULT_CASE: ':default';

// String handling
STRING: '"' ('\\"' | '#{' ~[}]* '}' | ~["\r\n])* '"';
REGEX: '/' ('\\/' | ~[/\r\n])+ '/';
TRIPLE_QUOTE: '"""' -> pushMode(TRIPLE_STRING_MODE);

// Embedded code
EMBEDDED_CODE: '$' ('js' | 'ts')? '>' ~[\r\n]* ;
MULTI_LINE_CODE_START: '$' ('js' | 'ts')? '>>>' -> pushMode(MULTI_CODE_MODE);

// Multi-line string markers
MULTILINE_STR_CLEAN: '|' [ \t]* NEWLINE -> pushMode(MULTILINE_MODE);
MULTILINE_STR_TRIM: '|-' [ \t]* NEWLINE -> pushMode(MULTILINE_MODE);
MULTILINE_STR_PRESERVE: '+|' [ \t]* NEWLINE -> pushMode(MULTILINE_MODE);
MULTILINE_STR_PRESERVE_ALL: '+|+' [ \t]* NEWLINE -> pushMode(MULTILINE_MODE);

// Identifiers per specification - Title Case with spaces before uppercase/digits
IDENTIFIER: [A-Z] ([A-Za-z0-9_-] | ([ \t]+ [A-Z0-9] [A-Za-z0-9_-]*))*;
LOWER_NAME: [a-z] [a-zA-Z0-9_]*;                         // lowercase identifiers (used for section types, attribute keys, etc.)
VARIABLE: '@' [a-zA-Z_] [a-zA-Z0-9_]*;

// Symbols
ARROW: '->';
COLON: ':';
COMMA: ',';
DOT: '.';
LPAREN: '(';
RPAREN: ')';
LBRACE: '{';
RBRACE: '}';
LBRACKET: '[';
RBRACKET: ']';
LANGLE: '<' -> pushMode(TYPE_TAG_MODE);
RANGLE: '>';
PIPE: '|';
SLASH: '/';
HYPHEN: '-';
SPREAD: '...';

// Whitespace and Comments
WS: [ \t]+ -> skip;
COMMENT: '#' ~[\r\n]* -> skip;
NEWLINE: [\r\n];

// Virtual tokens for indentation (handled by RclLexerBase)
INDENT: 'INDENT_PLACEHOLDER' {false}?;
DEDENT: 'DEDENT_PLACEHOLDER' {false}?;

// Type tag mode
mode TYPE_TAG_MODE;
TT_TYPE_NAME: [a-zA-Z]+;
TT_WS: [ \t]+ -> skip;
TT_CONTENT: [ \t]+ ~[>|\r\n]+;  // Require space before content
TT_PIPE: '|';
TT_RANGLE: '>' -> popMode;

// Triple string mode
mode TRIPLE_STRING_MODE;
TS_TRIPLE_QUOTE_END: '"""' -> popMode;
TS_INTERPOLATION_START: '#{' -> pushMode(INTERPOLATION_MODE);
TS_CONTENT: .+?;

// Interpolation mode (within triple strings)
mode INTERPOLATION_MODE;
INT_RBRACE: '}' -> popMode;
INT_VARIABLE: '@' [a-zA-Z_] [a-zA-Z0-9_]*;
INT_DOT: '.';
INT_LOWER_NAME: [a-z] [a-zA-Z0-9_]*;
INT_WS: [ \t]+ -> skip;

// Multi-line code mode
mode MULTI_CODE_MODE;
MC_END: '<$' -> popMode;
MC_CONTENT: .+?;

// Multi-line string mode
mode MULTILINE_MODE;
ML_END: NEWLINE [ \t]* '|' [ \t]* NEWLINE -> popMode;
ML_CONTENT: ~[\r\n]+;
ML_NEWLINE: NEWLINE;