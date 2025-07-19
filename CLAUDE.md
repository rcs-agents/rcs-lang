# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo for RCL (Rich Communication Language) - a domain-specific language for creating RCS (Rich Communication Services) agents. The project provides a complete language toolchain including parser, CLI compiler, language service, and VSCode extension.

## Architecture

### Monorepo Structure
- **packages/parser** - ANTLR4-based grammar and parser for RCL (PRIMARY PARSER)
- **packages/parser** - Legacy Tree-sitter parser (DEPRECATED - DO NOT USE)
- **packages/compiler** - Modern compilation pipeline using ANTLR AST
- **packages/cli** - Command-line compiler for RCL files
- **packages/language-service** - Advanced language service providers
- **apps/extension** - VSCode extension with full language support
- **apps/ide** - Web-based RCS Agent Studio for non-technical users

### Build System
- **Moon** - Task orchestration across the monorepo
- **Npm** - Package manager
- **Node** AND **Web** - Runtime
- **ANTLR4** - Parser generator for the RCL grammar (replaced Tree-sitter)

## Essential Commands

### Building
```bash
# Build everything
moon run :build
nr build

# Build specific packages
moon run parser:build
moon run cli:build
moon run extension:build

# ANTLR Parser builds (requires Java 17+)
cd packages/parser
nr check-generated  # Check if parser is already generated
nr build           # Full build (requires Java)
nr build:ts-only   # Build TypeScript only (if generated files exist)

# Legacy Tree-sitter Parser (DEPRECATED)
cd packages/parser
nr build-grammar    # Generate tree-sitter parser
nr build-wasm      # Build WebAssembly version
nr build-native    # Build native bindings
```

### Testing
```bash
# Run all tests
moon run :test
nr test

# Watch mode
nr test:watch

# Coverage
nr test:coverage

# Parser tests with mock (faster)
cd packages/parser && nr test:dev
```

### Development
```bash
# Start development mode (watch)
nr dev
moon run :dev

# Parser playground
cd packages/parser && nr playground

# CLI demo
cd packages/cli && nr demo
```

### Code Quality
```bash
# Type checking
moon run :typecheck

# Linting
moon run :lint

# Formatting
moon run :format

# Clean build artifacts
moon run :clean
```

## Key Technical Details

### Parser Package (ANTLR - Current)
- Uses ANTLR4 for parsing RCL syntax
- Grammar defined in `packages/parser/src/RclParser.g4` and `packages/parser/src/RclLexer.g4`
- **REQUIRES JAVA 17+** to build parser from grammar files
- Generated parser in `packages/parser/src/generated/`
- AST wrapper and adapter in `packages/parser/src/`
- Test files use `.rcl` extension for RCL code samples
- Build check: `cd packages/parser && bun run check-generated`
- Java install help: `cd packages/parser && ./install-java.sh`

### Compiler Package
- Modern compilation pipeline using ANTLR AST
- Stages: Parse → Validate → Transform → Generate
- JavaScript generator for XState output
- Located in `packages/compiler/`

### CLI Package
- Executable: `rcl` or `rcl-cli`
- Compiles RCL files to JSON output
- Entry point: `packages/cli/src/index.ts`

### VSCode Extension
- Client-server architecture using Language Server Protocol
- Client code in `apps/extension/client/`
- Server code in `apps/extension/server/`
- Features: syntax highlighting, diagnostics, hover, completion, etc.

### Testing Strategy
- Vitest for unit tests (parser, CLI)
- npm test runner for VSCode extension
- Test files located in `tests/` directories
- Parser tests can run with mock parser using `test:dev` for faster iteration

## Development Workflow

**CRITICAL: ALWAYS FOLLOW PLAN-CODE-TEST-COMMIT CYCLES**

You MUST follow this workflow for EVERY change, no matter how small:

1. **PLAN** - Create/update todo list with specific tasks
2. **CODE** - Make the changes
3. **TEST** - Run relevant tests IMMEDIATELY after coding:
   - For parser changes: `cd packages/parser && npm test`
   - For CLI changes: `cd packages/cli && npm test`
   - For extension changes: `cd apps/extension && npm test`
   - For any change: `moon run :test` to verify no regressions
4. **COMMIT** - Only if explicitly asked by the user

**NEVER SKIP THE TEST STEP**. Even for "simple" changes, you must:
- Run tests for the specific package you modified
- Run `moon run :test` to ensure no integration issues
- Fix any failures before moving to the next task

When all the parts of your goal are completed, build and run the tests for all projects in the monorepo
to ensure there are no integration issues. If there are issues, run plan-code-test-commit cycles to fix each of them.

**IMPORTANT**: Always clean up temporary/debugging files at the end of each task. Look for files like:
- `test-*.rcl`, `*-output*.json`, `*-actual.json`, `realistic-*.json`
- Any files created during debugging that are not part of the official examples
- Use `find . -name "pattern" | xargs rm -f` to remove them systematically

**CRITICAL GRAMMAR COMPLIANCE**: Before making ANY changes to the parser grammar or RCL examples:
1. **Read the RCL Specification Quick Reference** at `agent/notes/RCL_SPECIFICATION_QUICK_REFERENCE.md`
2. **Verify all changes comply** with the formal specification rules
3. **Key compliance points**:
   - Agent names MUST be IDENTIFIER (Title Case), NOT strings: `agent TravelAssistant` ✅, `agent "Travel Assistant"` ❌
   - Reserved names: `Config`, `Defaults`, `Messages` only used in correct contexts
   - Type tags MUST NOT have quoted values: `<url https://example.com>` ✅, `<url "https://example.com">` ❌
   - Required sections: `displayName`, at least one `flow`, `messages Messages`
   - Case sensitivity: Title Case for IDENTIFIERs, lowercase for attributes/sections

1. **Making Parser Changes**:
   - Modify `grammar.js`
   - Run `nr build-grammar`
   - Test with `nr playground`
   - Run `nr test` to verify

2. **Adding Language Features**:
   - Update parser grammar if needed
   - Implement in language-service package
   - Add tests in extension server
   - Update LANGUAGE_SERVICE_FEATURES.md checklist

3. **Testing RCL Code**:
   - Use `.rcl` files in test directories
   - Parser playground for interactive testing
   - CLI demo command for compilation testing

## Important Files

- `docs/rcl-formal-specification.md` - Complete EBNF grammar specification (951 lines)
- `agent/notes/RCL_SPECIFICATION_QUICK_REFERENCE.md` - Critical specification rules summary
- `docs/rcl-output-specification.md` - Official JSON/JS output format documentation
- `apps/extension/LANGUAGE_SERVICE_FEATURES.md` - Feature implementation checklist
- `.claude/settings.local.json` - Permissions for Claude to run commands
- `moon.yml` files - Task definitions for Moon build system

## Recent Learnings & Critical Knowledge

### RCL Specification Compliance (CRITICAL)
- **Agent Definition**: MUST use IDENTIFIER, not string: `agent TravelAssistant` (correct)
- **Type Tags**: NO quotes around values: `<url https://example.com>` (correct)
- **Reserved Names**: `Config`, `Defaults`, `Messages` have specific usage contexts
- **Case Rules**: Title Case for names, lowercase for attributes/section types
- **Required Elements**: `displayName`, at least one `flow`, `messages Messages`

### Parser Architecture & Grammar
- **ANTLR4 Grammar**: Defined in `RclParser.g4` and `RclLexer.g4`
- **Lexer Modes**: Handles indentation via lexer modes and custom base class
- **AST Generation**: ANTLR generates typed AST nodes with visitor/listener patterns
- **Build Process**: ANTLR4 generates TypeScript parser code
- **Testing**: Use simple examples first, complex features need advanced grammar work

### Extension Output Generation
- **JSON Format**: `{"messages":{},"flows":{},"agent":{}}`
- **JS Format**: ES module with named exports and utility functions
- **Schema Compliance**: Must follow `@schemas/agent-message.schema.json` and `@schemas/agent-config.schema.json`
- **Current Status**: Simple files work, complex files (URLs with dots, embedded JS) need grammar fixes

### Common Debugging Steps
1. Check if file follows specification (use quick reference)
2. Test with CLI: `npx @rcs-lang/cli compile filename.rcl`
3. Check AST structure for ERROR nodes
4. Verify grammar matches specification exactly
5. Test with simple examples before complex ones

## Code Style

- TypeScript with strict mode
- 2 spaces indentation
- Single quotes for strings
- Trailing commas
- 100 character line width
- Semicolons always
- Biome for linting/formatting JS/TS
- dprint for JSON/Markdown/TOML