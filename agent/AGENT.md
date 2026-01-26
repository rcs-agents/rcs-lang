# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo for RCL (Rich Communication Language) - a domain-specific language for creating RCS (Rich Communication Services) agents. The project provides a complete language toolchain including parser, CLI compiler, language service, and VSCode extension.

## Architecture

### Monorepo Structure
- **packages/parser** - Tree-sitter grammar and parser with TypeScript AST utilities
- **packages/cli** - Command-line compiler for RCL files
- **packages/language-service** - Advanced language service providers
- **apps/extension** - VSCode extension with full language support

### Build System
- **Moon** - Task orchestration across the monorepo
- **Npm** - Package manager
- **Node** AND **Web** - Runtime
- **Tree-sitter** - Parser generator for the RCL grammar

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

# Parser-specific builds
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

### Parser Package
- Uses Tree-sitter for parsing RCL syntax
- Generates both WASM and native bindings
- Grammar defined in `packages/parser/grammar.js`
- TypeScript AST utilities in `packages/parser/src/ast/`
- Test files use `.rcl` extension for RCL code samples

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

Always work in plan-code-test-commit cycles. Divide your goal into tasks and, if needed, subtasks.
Then run a cycle for each of the goals subdivisions until all of them are completed.

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
- **Modular Grammar**: Split into feature files (`agent.js`, `flows.js`, `messages.js`, etc.)
- **Tree-sitter**: External scanner handles Python-like indentation (INDENT/DEDENT tokens)
- **Build Process**: `npm run build-grammar` → `npm run build-ts` for full rebuild
- **Testing**: Use simple examples first, complex features need advanced grammar work

### Extension Output Generation
- **JSON Format**: `{"messages":{},"flows":{},"agent":{}}`
- **JS Format**: ES module with named exports and utility functions
- **Schema Compliance**: Must follow `@schemas/agent-message.schema.json` and `@schemas/agent-config.schema.json`
- **Current Status**: Simple files work, complex files (URLs with dots, embedded JS) need grammar fixes

### Common Debugging Steps
1. Check if file follows specification (use quick reference)
2. Test with CLI: `npx @rcl/cli compile filename.rcl`
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