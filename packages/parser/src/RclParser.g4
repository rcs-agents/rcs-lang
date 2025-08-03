parser grammar RclParser;

options {
    tokenVocab = RclLexer;
}

// Top-level file structure
rcl_file: (import_statement | section | NEWLINE)* EOF;

// Import statements
import_statement: IMPORT import_path (AS alias=IDENTIFIER)? NEWLINE;
import_path: IDENTIFIER (SLASH IDENTIFIER)*;

// Section definition
section: section_header section_body?;

section_header: 
    section_type IDENTIFIER? header_values? parameter_list? NEWLINE
    ;

section_type:
    LOWER_NAME
    | ON  // Allow 'on' as a section type
    ;

header_values: value+;

identifier: IDENTIFIER;

section_body: INDENT section_content+ DEDENT;

section_content:
    spread_directive
    | attribute_assignment
    | section
    | match_block
    | simple_transition
    | flow_invocation
    | state_reference
    | NEWLINE
    ;

// Simple state reference (for unconditional transitions)
state_reference: (IDENTIFIER | variable_access) NEWLINE;

// Spread operator
spread_directive: SPREAD IDENTIFIER NEWLINE;

// Attribute assignment
attribute_assignment: 
    ATTRIBUTE_NAME value NEWLINE          // attribute: value (3+ chars)
    | ATTRIBUTE_NAME COMMA value NEWLINE  // attribute:, value  
    | ATTRIBUTE_NAME NEWLINE              // attribute: (no value)
    | LOWER_NAME COLON value NEWLINE      // attr: value (2 char attributes)
    | LOWER_NAME COLON COMMA value NEWLINE // attr:, value
    | LOWER_NAME COLON NEWLINE            // attr: (no value)
    ;

// Match blocks
match_block: MATCH value NEWLINE INDENT match_case+ DEDENT;

match_case: 
    (STRING | NUMBER | ATOM | REGEX | DEFAULT_CASE) ARROW transition_target NEWLINE?;

transition_target:
    contextualized_value
    | flow_termination
    | flow_invocation_with_handlers
    | context_operation_sequence
    ;

flow_invocation_with_handlers:
    flow_invocation (NEWLINE INDENT flow_result_handler+ DEDENT)?
    ;

context_operation_sequence:
    context_operation (ARROW context_operation)* ARROW target_reference
    ;

// Simple transition (arrow without match)  
simple_transition: ARROW transition_target NEWLINE?;

// Values and expressions
contextualized_value: value (WITH parameter_list)?;

parameter_list: parameter (COMMA parameter)*;

parameter: 
    ATTRIBUTE_NAME value         // Named parameter (includes colon)
    | LOWER_NAME COLON value     // Named parameter (separate tokens)
    | value                      // Positional parameter
    ;

value:
    primitive_value
    | IDENTIFIER
    | variable_access
    | parentheses_list
    | dictionary
    | embedded_code
    | multi_line_string
    ;

primitive_value:
    STRING
    | triple_quote_string
    | REGEX
    | NUMBER
    | BOOLEAN
    | NULL
    | ATOM
    | type_tag
    ;

// Triple-quoted strings with interpolation
triple_quote_string: 
    TRIPLE_QUOTE (TS_CONTENT | interpolation)* TS_TRIPLE_QUOTE_END;

triple_string_content:
    TS_CONTENT
    | interpolation
    ;

interpolation: 
    TS_INTERPOLATION_START interpolation_expr INT_RBRACE;

interpolation_expr:
    INT_VARIABLE (INT_DOT INT_LOWER_NAME)*  // @var.property
    | value  // Any value expression
    ;

// Variable access
variable_access: VARIABLE (DOT LOWER_NAME)*;

// Type tags
type_tag: LANGLE TT_TYPE_NAME TT_CONTENT? (TT_PIPE TT_CONTENT)? TT_RANGLE;

// Collections
list:
    parentheses_list
    | block_list
    ;

parentheses_list: LPAREN list_elements? RPAREN;

list_elements: value (COMMA value)*;

block_list: INDENT block_list_item+ DEDENT;

block_list_item: HYPHEN value NEWLINE;

dictionary:
    brace_dictionary
    | block_dictionary
    ;

brace_dictionary: LBRACE (dict_entry (COMMA dict_entry)*)? RBRACE;

block_dictionary: INDENT dict_entry+ DEDENT;

dict_entry: (LOWER_NAME | STRING) COLON value;

// Embedded code
embedded_code:
    EMBEDDED_CODE
    | multi_line_code
    ;

multi_line_code: 
    MULTI_LINE_CODE_START MC_CONTENT* MC_END;

// Multi-line strings
multi_line_string:
    (MULTILINE_STR_CLEAN | MULTILINE_STR_TRIM | MULTILINE_STR_PRESERVE | MULTILINE_STR_PRESERVE_ALL)
    multiline_content*
    ML_END;

multiline_content: ML_CONTENT ML_NEWLINE?;

// Flow control extensions
flow_invocation: 
    START IDENTIFIER (WITH parameter_list)?
    ;

flow_result_handler:
    ON flow_result ARROW (context_operation ARROW)* target_reference NEWLINE
    ;

flow_result:
    FLOW_END
    | FLOW_CANCEL
    | FLOW_ERROR
    | COLON LOWER_NAME
    ;

context_operation:
    APPEND (RESULT | value) TO variable_access
    | SET variable_access TO (RESULT | value)
    | MERGE (RESULT | value) INTO variable_access
    ;

target_reference:
    IDENTIFIER
    | variable_access
    | flow_termination
    ;

// Flow termination for flow returns
flow_termination:
    FLOW_END
    | FLOW_CANCEL
    | FLOW_ERROR
    | COLON LOWER_NAME
    ;

