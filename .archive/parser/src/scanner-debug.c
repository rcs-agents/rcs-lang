#include <tree_sitter/parser.h>
#include <wctype.h>
#include <stdio.h>

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
  
  scanner->indent_length = 0;
  if (length > 0) {
    size_t size = 0;
    scanner->indent_length = (uint32_t)buffer[size++];
    
    if (scanner->indent_length > scanner->indent_capacity) {
      scanner->indents = realloc(scanner->indents, scanner->indent_length * sizeof(uint32_t));
      scanner->indent_capacity = scanner->indent_length;
    }
    
    for (uint32_t i = 0; i < scanner->indent_length && size < length; i++) {
      scanner->indents[i] = (uint32_t)buffer[size++];
    }
  }
}

bool tree_sitter_rcl_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  Scanner *scanner = (Scanner *)payload;
  
  // Debug print
  fprintf(stderr, "Scanner called: col=%d, lookahead='%c' (0x%02x), valid=[%d,%d,%d]\n", 
          lexer->get_column(lexer), 
          lexer->lookahead > 31 ? lexer->lookahead : '?', 
          lexer->lookahead,
          valid_symbols[NEWLINE], 
          valid_symbols[INDENT], 
          valid_symbols[DEDENT]);
  
  // Handle explicit newline token
  if (valid_symbols[NEWLINE]) {
    if (lexer->lookahead == '\n' || lexer->lookahead == '\r') {
      advance(lexer);
      if (lexer->lookahead == '\n') advance(lexer); // Handle \r\n
      lexer->mark_end(lexer);
      lexer->result_symbol = NEWLINE;
      fprintf(stderr, "  -> Emitting NEWLINE\n");
      return true;
    }
  }
  
  // Check if we're at the start of a line
  if (lexer->get_column(lexer) > 0) {
    fprintf(stderr, "  -> Not at start of line\n");
    return false;
  }
  
  // Check if indent/dedent are valid
  if (!valid_symbols[INDENT] && !valid_symbols[DEDENT]) {
    fprintf(stderr, "  -> Neither INDENT nor DEDENT valid\n");
    return false;
  }
  
  // Skip any blank lines by consuming whitespace
  bool found_content = false;
  uint32_t indent_size = 0;
  
  for (;;) {
    if (lexer->lookahead == ' ') {
      indent_size++;
      advance(lexer);
    } else if (lexer->lookahead == '\t') {
      indent_size += 8;
      advance(lexer);
    } else if (lexer->lookahead == '\n' || lexer->lookahead == '\r') {
      // Reset on newline
      indent_size = 0;
      advance(lexer);
      if (lexer->lookahead == '\n') advance(lexer); // Handle \r\n
    } else if (lexer->lookahead != 0) {
      // Found non-whitespace content
      found_content = true;
      break;
    } else {
      // EOF
      break;
    }
  }
  
  if (!found_content) {
    // Only whitespace or EOF
    if (lexer->lookahead == 0 && scanner->indent_length > 0) {
      // Emit remaining dedents at EOF
      scanner->indent_length--;
      lexer->result_symbol = DEDENT;
      fprintf(stderr, "  -> Emitting DEDENT at EOF\n");
      return true;
    }
    fprintf(stderr, "  -> No content found\n");
    return false;
  }
  
  // Skip comment lines
  if (lexer->lookahead == '#') {
    fprintf(stderr, "  -> Comment line\n");
    return false;
  }
  
  lexer->mark_end(lexer);
  
  uint32_t current_indent = scanner->indent_length > 0 ? scanner->indents[scanner->indent_length - 1] : 0;
  
  fprintf(stderr, "  -> Found indent_size=%d, current_indent=%d\n", indent_size, current_indent);
  
  if (indent_size > current_indent) {
    // Indent
    if (valid_symbols[INDENT]) {
      if (scanner->indent_length >= scanner->indent_capacity) {
        scanner->indent_capacity *= 2;
        scanner->indents = realloc(scanner->indents, scanner->indent_capacity * sizeof(uint32_t));
      }
      scanner->indents[scanner->indent_length++] = indent_size;
      lexer->result_symbol = INDENT;
      fprintf(stderr, "  -> Emitting INDENT\n");
      return true;
    }
  } else if (indent_size < current_indent) {
    // Dedent - possibly multiple levels
    while (scanner->indent_length > 0 && scanner->indents[scanner->indent_length - 1] > indent_size) {
      scanner->indent_length--;
      if (valid_symbols[DEDENT]) {
        lexer->result_symbol = DEDENT;
        fprintf(stderr, "  -> Emitting DEDENT\n");
        return true;
      }
    }
  }
  
  fprintf(stderr, "  -> No token emitted\n");
  return false;
}