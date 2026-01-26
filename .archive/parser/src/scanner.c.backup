#include <tree_sitter/parser.h>
#include <wctype.h>

enum TokenType {
  NEWLINE = 0,
  INDENT = 1,
  DEDENT = 2,
};

typedef struct {
  uint32_t *indents;
  uint32_t indent_length;
  uint32_t indent_capacity;
} Scanner;

static inline void advance(TSLexer *lexer) { 
  lexer->advance(lexer, false); 
}

static inline void skip(TSLexer *lexer) { 
  lexer->advance(lexer, true); 
}

void *tree_sitter_rcl_external_scanner_create() {
  Scanner *scanner = calloc(1, sizeof(Scanner));
  scanner->indent_capacity = 16;
  scanner->indents = calloc(scanner->indent_capacity, sizeof(uint32_t));
  scanner->indent_length = 1;
  scanner->indents[0] = 0;
  return scanner;
}

void tree_sitter_rcl_external_scanner_destroy(void *payload) {
  Scanner *scanner = (Scanner *)payload;
  if (scanner->indents) {
    free(scanner->indents);
  }
  free(scanner);
}

unsigned tree_sitter_rcl_external_scanner_serialize(void *payload, char *buffer) {
  Scanner *scanner = (Scanner *)payload;
  
  size_t size = 0;
  buffer[size++] = (char)scanner->indent_length;
  
  for (uint32_t i = 0; i < scanner->indent_length && size < TREE_SITTER_SERIALIZATION_BUFFER_SIZE; i++) {
    buffer[size++] = (char)scanner->indents[i];
  }
  
  return size;
}

void tree_sitter_rcl_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
  Scanner *scanner = (Scanner *)payload;
  
  if (length == 0) {
    scanner->indent_length = 1;
    scanner->indents[0] = 0;
    return;
  }
  
  scanner->indent_length = (uint32_t)buffer[0];
  
  if (scanner->indent_length > scanner->indent_capacity) {
    scanner->indent_capacity = scanner->indent_length;
    scanner->indents = realloc(scanner->indents, scanner->indent_capacity * sizeof(uint32_t));
  }
  
  scanner->indents[0] = 0;
  for (uint32_t i = 1; i < scanner->indent_length && i < length; i++) {
    scanner->indents[i] = (uint32_t)buffer[i];
  }
}

bool tree_sitter_rcl_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  Scanner *scanner = (Scanner *)payload;
  
  bool has_newline = false;
  uint32_t indent_size = 0;
  
  // Skip whitespace and check for newline
  while (lexer->lookahead == ' ' || lexer->lookahead == '\t' || 
         lexer->lookahead == '\r' || lexer->lookahead == '\n') {
    if (lexer->lookahead == '\n') {
      has_newline = true;
      indent_size = 0;
      advance(lexer);
    } else if (has_newline) {
      if (lexer->lookahead == ' ') {
        indent_size++;
      } else if (lexer->lookahead == '\t') {
        indent_size += 8;
      }
      advance(lexer);
    } else {
      advance(lexer);
    }
  }
  
  // If we're not at the start of a line, no indentation tokens
  if (!has_newline) {
    return false;
  }
  
  // Emit newline if valid
  if (valid_symbols[NEWLINE]) {
    lexer->result_symbol = NEWLINE;
    return true;
  }
  
  uint32_t current_indent = scanner->indents[scanner->indent_length - 1];
  
  // Check for dedent
  if (indent_size < current_indent && valid_symbols[DEDENT]) {
    // Pop indents until we find one <= current indent size
    while (scanner->indent_length > 1 && 
           scanner->indents[scanner->indent_length - 1] > indent_size) {
      scanner->indent_length--;
    }
    lexer->result_symbol = DEDENT;
    return true;
  }
  
  // Check for indent
  if (indent_size > current_indent && valid_symbols[INDENT]) {
    // Grow array if needed
    if (scanner->indent_length >= scanner->indent_capacity) {
      scanner->indent_capacity *= 2;
      scanner->indents = realloc(scanner->indents, scanner->indent_capacity * sizeof(uint32_t));
    }
    
    scanner->indents[scanner->indent_length] = indent_size;
    scanner->indent_length++;
    lexer->result_symbol = INDENT;
    return true;
  }
  
  return false;
}