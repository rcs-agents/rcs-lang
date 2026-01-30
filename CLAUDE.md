# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AI Agent Instructions

- **Always use subagents** to execute tasks, especially if you are the Opus model
- **Pick the cheapest model** for the subagent that you still believe will be capable to handle the task
- **DO NOT write reports** unless you are explicitly asked to
- **If asked to write a report**, save it to `agent/reports/YYYY-MM-DD/`

## Project Overview

This is a TypeScript monorepo for RCL (Rich Communication Language) - a domain-specific language for creating RCS (Rich Communication Services) agents. The project provides a complete language toolchain including ANTLR4-based parser, CLI compiler, language service, VSCode extension, interactive playground, multi-framework simulator, and testing tools.

## Architecture

### Monorepo Structure

**Core Language Packages:**
- **packages/parser** - ANTLR4-based grammar and parser for RCL (PRIMARY PARSER)
  - Exports: main parser API and `/symbol-extractor` entry point
- **packages/ast** - AST type definitions and utilities
- **packages/core** - Core types, interfaces, and Result<T,E> pattern
- **packages/types** - TypeScript types generated from RCS JSON schemas
- **packages/compiler** - Modern compilation pipeline using ANTLR AST
- **packages/cli** - Command-line compiler for RCL files
- **packages/language-service** - Advanced language service providers
- **packages/validation** - Validation pipeline and validators
- **packages/file-system** - File system abstraction layer
- **packages/csm** - Conversational State Machine implementation

**User-Facing Packages:**
- **packages/rcx** - RCX bundle format for RCS agents (agent config, CSM, messages, diagrams, assets)
- **packages/simulator** - Multi-framework RCS conversation simulator (React, Lit, SolidJS)
- **packages/playground** - Interactive web IDE with Monaco editor, compiler, diagram, and simulator
- **packages/diagram** - Interactive Sprotty-based diagram visualization

**Applications:**
- **apps/extension** - VSCode extension with full language support
- **apps/docs** - Documentation site built with Astro + Starlight
- **apps/rcs-maker** - Full-stack RCS testing tool with Elysia backend and Astro+SolidJS frontend
  - See `apps/rcs-maker/CLAUDE.md` for detailed architecture

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

# Run Vitest tests (for simulator package)
cd packages/simulator && bun run test

# Run Vitest with browser integration
cd packages/simulator && bun run test:browser
```

### Simulator Development
```bash
# Run Storybook for React components
cd packages/simulator && bun run storybook:react  # Port 6006

# Run Storybook for Lit Web Components
cd packages/simulator && bun run storybook:lit    # Port 6007

# Run Storybook for SolidJS components
cd packages/simulator && bun run storybook:solid  # Port 6008

# Build Storybook for production
bun run build-storybook:react
bun run build-storybook:lit
bun run build-storybook:solid
```

### Playground Development
```bash
# Run playground in dev mode
cd packages/playground && bun run dev

# Build playground
cd packages/playground && bun run build
```

### RCS Maker (Testing Tool)
```bash
# Run backend (Elysia + Bun)
cd apps/rcs-maker/backend && bun run dev  # Port 3000

# Run frontend (Astro + SolidJS)
cd apps/rcs-maker/frontend && bun run dev # Port 4321
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
```
ast (no deps)
  ↓
core → ast
  ↓
types (no deps)
  ↓
file-system → core
csm → core
  ↓
parser (ANTLR4) → ast, core
  ↓
compiler → parser, core, csm, file-system
  ↓
diagram → compiler
  ↓
rcx → csm, types
simulator → csm, types
  ↓
playground → parser, compiler, diagram, simulator, types, file-system
  ↓
cli → compiler, core, file-system
validation (standalone)
language-service → parser
extension → parser, language-service
docs → ast, compiler, diagram, parser, playground, simulator
```

**Key dependencies:**
- **ast**: Core AST types (no dependencies)
- **core**: Base interfaces and Result<T,E> pattern (depends on ast)
- **types**: RCS JSON schema types (no dependencies)
- **parser**: ANTLR4 parser (depends on ast, core)
  - Exports `/symbol-extractor` separately to avoid bundling LSP types in browser
- **compiler**: Compilation pipeline (depends on parser, core, csm, file-system)
- **rcx**: Bundle format for agents (depends on csm, types)
- **simulator**: Multi-framework conversation simulator (depends on csm, types)
- **playground**: Web IDE component (depends on parser, compiler, diagram, simulator)

### Testing Strategy
- **Unit tests**: Individual functions and classes (`*.test.ts`)
- **Integration tests**: Cross-package functionality
- **E2E tests**: VSCode extension with Playwright
- **Component tests**: Vitest with @vitest/browser-playwright (simulator)
- **Component documentation**: Storybook for React, Lit, and SolidJS variants
- **Test runners**: Bun test (default), Vitest (simulator), Playwright (E2E)

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
- `packages/parser/src/index.ts` - Main parser API exports
- `packages/parser/src/symbol-extractor.ts` - Symbol extraction (separate export to avoid LSP bundling)
- `packages/playground/src/index.ts` - Playground component exports
- `packages/simulator/src/` - Multi-framework exports (react/, lit/, solid/)
- `packages/rcx/src/index.ts` - RCX bundle builder and importer
- `apps/rcs-maker/backend/src/index.ts` - Elysia backend server
- `apps/rcs-maker/frontend/src/pages/` - Astro routes

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
- `csm` and `types` must build before `rcx`, `simulator`, and `playground`
- `compiler` and `diagram` must build before `playground`

### Testing Conventions
- Test files use `.test.ts` or `.test.tsx` extension
- Use Bun's built-in test runner and assertions (default)
- Use Vitest for packages requiring browser testing (simulator)
- Place test fixtures in `tests/fixtures/` directories
- Integration tests go in `tests/integration/` subdirectories
- Component documentation and visual testing via Storybook

### Multi-Framework Support
The simulator package supports three frameworks:
- **React** (`@rcs-lang/simulator/react`) - Primary implementation
- **Lit** (`@rcs-lang/simulator/lit`) - Web Components
- **SolidJS** (`@rcs-lang/simulator/solid`) - Fine-grained reactivity

Each framework has:
- Separate Storybook instance (ports 6006, 6007, 6008)
- Framework-specific build configuration
- Shared core types from main package

### Documentation Site Integration
The docs site (`apps/docs`) uses complex Vite configuration to handle:
- Custom alias resolution for all @rcs-lang packages
- Subpath export resolution (@rcs-lang/diagram/web, @rcs-lang/simulator/react)
- SSR external configuration to prevent bundling issues
- Dynamic import handling via custom Rollup external function
- Direct integration of playground, simulator, and diagram components