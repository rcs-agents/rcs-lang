#include <tree_sitter/parser.h>
#include <stdio.h>

// Copied from scanner.c
enum TokenType {
  NEWLINE = 0,
  INDENT = 1,
  DEDENT = 2,
};

int main() {
  // Test what the scanner expects
  printf("Token types:\n");
  printf("NEWLINE = %d\n", NEWLINE);
  printf("INDENT = %d\n", INDENT);
  printf("DEDENT = %d\n", DEDENT);
  
  // These should match the externals in grammar.js:
  // $._newline,
  // $._indent,
  // $._dedent,
  
  return 0;
}