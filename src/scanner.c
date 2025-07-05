#include <tree_sitter/parser.h>
#include <wctype.h>

enum TokenType {
  INDENT,
  DEDENT,
};

typedef struct {
  uint32_t *indents;
  uint32_t indent_length;
  uint32_t indent_capacity;
} Scanner;

static inline void advance(TSLexer *lexer) { lexer->advance(lexer, false); }

static inline void skip(TSLexer *lexer) { lexer->advance(lexer, true); }

static bool is_uppercase(int32_t c) {
  return c >= 'A' && c <= 'Z';
}

static bool is_lowercase(int32_t c) {
  return c >= 'a' && c <= 'z';
}

static bool is_digit(int32_t c) {
  return c >= '0' && c <= '9';
}

static bool is_identifier_start(int32_t c) {
  return is_uppercase(c);
}

static bool is_identifier_char(int32_t c) {
  return is_uppercase(c) || is_lowercase(c) || is_digit(c) || c == '-' || c == '_';
}

static bool scan_identifier(TSLexer *lexer) {
  if (!is_identifier_start(lexer->lookahead)) {
    return false;
  }
  
  advance(lexer);
  
  while (is_identifier_char(lexer->lookahead)) {
    advance(lexer);
  }
  
  // Handle spaces followed by uppercase letters or numbers (simulating lookahead)
  while (lexer->lookahead == ' ') {
    // Look ahead to see if there's an uppercase letter or digit after the space
    TSLexer saved_lexer = *lexer;
    advance(lexer);
    
    if (is_uppercase(lexer->lookahead) || is_digit(lexer->lookahead)) {
      // Valid space, consume it and continue
      while (is_identifier_char(lexer->lookahead)) {
        advance(lexer);
      }
    } else {
      // Invalid space, restore position
      *lexer = saved_lexer;
      break;
    }
  }
  
  return true;
}

bool tree_sitter_rcl_external_scanner_scan(void *payload, TSLexer *lexer,
                                            const bool *valid_symbols) {
  Scanner *scanner = (Scanner *)payload;

  lexer->mark_end(lexer);

  bool found_end_of_line = false;
  uint32_t indent_length = 0;
  int32_t first_comment_indent_length = -1;
  
  for (;;) {
    if (lexer->lookahead == '\n') {
      found_end_of_line = true;
      indent_length = 0;
      advance(lexer);
    } else if (lexer->lookahead == ' ') {
      indent_length++;
      advance(lexer);
    } else if (lexer->lookahead == '\t') {
      indent_length += 8;
      advance(lexer);
    } else if (lexer->lookahead == '\r') {
      advance(lexer);
    } else if (lexer->lookahead == '#') {
      // Handle comments
      if (first_comment_indent_length == -1) {
        first_comment_indent_length = (int32_t)indent_length;
      }
      while (lexer->lookahead && lexer->lookahead != '\n') {
        advance(lexer);
      }
    } else {
      break;
    }
  }

  if (found_end_of_line) {
    if (lexer->lookahead == 0) {
      // End of file
      if (scanner->indent_length > 0) {
        scanner->indent_length--;
        lexer->result_symbol = DEDENT;
        return true;
      }
    }

    uint32_t current_indent_length = scanner->indent_length > 0 
      ? scanner->indents[scanner->indent_length - 1] 
      : 0;

    if (valid_symbols[INDENT] && indent_length > current_indent_length) {
      // Increase indentation
      if (scanner->indent_length == scanner->indent_capacity) {
        scanner->indent_capacity = scanner->indent_capacity ? scanner->indent_capacity * 2 : 1;
        scanner->indents = realloc(scanner->indents, scanner->indent_capacity * sizeof(uint32_t));
      }
      scanner->indents[scanner->indent_length] = indent_length;
      scanner->indent_length++;
      lexer->result_symbol = INDENT;
      return true;
    }

    if (valid_symbols[DEDENT] && indent_length < current_indent_length &&
        scanner->indent_length > 0) {
      // Decrease indentation
      scanner->indent_length--;
      lexer->result_symbol = DEDENT;
      return true;
    }

    if (indent_length != current_indent_length) {
      return false;
    }
  }

  return false;
}

unsigned tree_sitter_rcl_external_scanner_serialize(void *payload, char *buffer) {
  Scanner *scanner = (Scanner *)payload;
  
  size_t size = 0;
  buffer[size++] = (char)scanner->indent_length;
  
  for (uint32_t i = 0; i < scanner->indent_length; i++) {
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
    
    for (uint32_t i = 0; i < scanner->indent_length; i++) {
      scanner->indents[i] = (uint32_t)buffer[size++];
    }
  }
}

void *tree_sitter_rcl_external_scanner_create() {
  Scanner *scanner = calloc(1, sizeof(Scanner));
  return scanner;
}

void tree_sitter_rcl_external_scanner_destroy(void *payload) {
  Scanner *scanner = (Scanner *)payload;
  if (scanner->indents) {
    free(scanner->indents);
  }
  free(scanner);
}