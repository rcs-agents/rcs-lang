# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo for RCL (Rich Communication Language) - a domain-specific language for creating RCS (Rich Communication Services) agents. The project provides a complete language toolchain including ANTLR4-based parser, CLI compiler, language service, and VSCode extension.

## Architecture

### Monorepo Structure
- **packages/parser** - ANTLR4-based grammar and parser for RCL (PRIMARY PARSER)
- **packages/ast** - AST type definitions and utilities
- **packages/core** - Core types, interfaces, and Result<T,E> pattern
- **packages/compiler** - Modern compilation pipeline using ANTLR AST
- **packages/cli** - Command-line compiler for RCL files  
- **packages/language-service** - Advanced language service providers
- **packages/validation** - Validation pipeline and validators
- **packages/file-system** - File system abstraction layer
- **packages/csm** - Conversational State Machine implementation
- **apps/extension** - VSCode extension with full language support
- **apps/docs** - Documentation site built with Astro
- **libs/diagram** - Interactive diagram generation and rendering

### Build System
- **Moon** - Task orchestration across the monorepo (moon run :command)
- **Bun** - Package manager and test runner
- **ANTLR4** - Parser generator for the RCL grammar
- **TypeScript** - Primary language with project references
- **Biome** - Linting and formatting for TypeScript/JavaScript
- **dprint** - Formatting for JSON, Markdown, and TOML

## Essential Commands

### Development
```bash
# Install dependencies
bun install

# Build all packages (respects dependency order)
bun run build
# or 
moon run :build

# Run all tests
bun run test
# or
moon run :test

# Type checking across all packages
bun run typecheck
# or
moon run :typecheck

# Lint all packages
bun run lint
# or
moon run :lint

# Format all code
bun run format
# or
moon run :format

# Clean build artifacts
moon run :clean
```

### Testing
```bash
# Run tests for specific package
cd packages/parser && bun test

# Run VSCode extension tests
cd apps/extension && bun run test

# Run with coverage
bun test --coverage
```

### Parser Development
```bash
# Rebuild ANTLR grammar (in packages/parser)
moon run parser:build-grammar

# Test parser with specific file
cd packages/parser && bun run trace-tokens.js
cd packages/parser && bun run trace-comment.js
```

### Documentation
```bash
# Build documentation site
bun run docs:build

# Start docs dev server
bun run docs:dev

# Preview built docs
bun run docs:preview
```

### Publishing

We use [changesets](https://github.com/changesets/changesets) for versioning and publishing. See [docs/CHANGESETS_QUICK_REFERENCE.md](docs/CHANGESETS_QUICK_REFERENCE.md) for details.

```bash
# Add a changeset (do this after making changes)
bun changeset:add

# Check what will be released
bun changeset:status

# Full release (build, test, version, publish, tag)
bun run release

# Verify workspace dependencies
bun run check:workspace

# Publish VSCode extension (separate process)
bun run publish:extension
```

## Architecture Principles

### Core Design Patterns
- **Result<T,E> Pattern**: All operations return Result types for explicit error handling
- **SOLID Principles**: Each package has single responsibility with clear interfaces
- **Immutable ASTs**: Parser outputs immutable AST nodes
- **Platform Abstraction**: File system operations abstracted for Node.js/browser
- **Dependency Injection**: Providers use dependency injection pattern

### Package Dependencies
The dependency graph flows: `ast` ← `core` ← `parser` ← `compiler` ← `cli`
- **ast**: Core AST types (no dependencies)
- **core**: Base interfaces and Result pattern (depends on ast)
- **parser**: ANTLR4 parser (depends on ast, core)
- **compiler**: Compilation pipeline (depends on parser, core)
- **language-service**: LSP features (depends on parser, compiler)

### Testing Strategy
- **Unit tests**: Individual functions and classes (`*.test.ts`)
- **Integration tests**: Cross-package functionality
- **E2E tests**: VSCode extension with Playwright
- **Test runner**: Bun test with built-in assertions

## Important Files

### Parser Grammar
- `packages/parser/src/RclLexer.g4` - ANTLR4 lexer grammar
- `packages/parser/src/RclParser.g4` - ANTLR4 parser grammar
- `packages/parser/src/generated/` - Generated parser code (auto-generated)

### Configuration
- `moon.yml` files - Individual package build configurations
- `tsconfig.*.json` - TypeScript project references
- `biome.json` - Linting and formatting rules
- `dprint.json` - Additional formatting for non-TS files

### Entry Points
- `packages/cli/src/index.ts` - CLI entry point
- `apps/extension/src/client/extension.ts` - VSCode extension entry
- `packages/parser/src/index.ts` - Parser API exports

## Critical Notes

### Package Management
- **NEVER USE NPM** - Always use Bun for package management
- Use `nr` (from @antfu/ni) for cross-platform script running

### Parser Development
- The ANTLR4 parser in `packages/parser` is the PRIMARY parser
- Never use the legacy Tree-sitter parser (archived)
- Grammar changes require regenerating with `moon run parser:build-grammar`
- Generated files in `src/generated/` should not be manually edited

### Build Order
- Packages must be built in dependency order (Moon handles this automatically)
- `ast` and `core` must build before `parser`
- `parser` must build before `compiler` and `language-service`

### Testing Conventions
- Test files use `.test.ts` extension
- Use Bun's built-in test runner and assertions
- Place test fixtures in `tests/fixtures/` directories
- Integration tests go in `tests/integration/` subdirectories