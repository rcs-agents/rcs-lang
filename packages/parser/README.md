# ANTLR Parser for RCL

This package contains the ANTLR4 grammar and parser for the RCL language.

## Building

The ANTLR parser requires Java to generate the TypeScript parser from the grammar files.

### Prerequisites

- Java 17 or later must be installed
- Run `./install-java.sh` for installation instructions

### Build Process

```bash
# Install dependencies
bun install

# Generate parser and build TypeScript
bun run build
```

This will:
1. Generate TypeScript parser files from the ANTLR grammar
2. Fix import paths in the generated files
3. Compile TypeScript to JavaScript

## Development

### Grammar Files

- `src/RclLexer.g4` - Lexer grammar (tokenization rules)
- `src/RclParser.g4` - Parser grammar (syntax rules)
- `src/RclLexerBase.ts` - Base class for lexer with Python-like indentation support

### Generated Files

The `src/generated/` directory contains the generated parser files. These are created by ANTLR and should not be edited manually.

## Using Pre-built Parser

If you cannot install Java, you can:

1. Ask someone with Java to run `bun run build` and commit the generated files
2. Use the pre-built parser from a CI/CD system
3. Use a Docker container with Java pre-installed

## Testing

```bash
bun test
```

Tests include:
- Grammar validation
- Parser functionality
- Context variable support