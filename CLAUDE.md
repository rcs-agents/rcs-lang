# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a tree-sitter grammar implementation for the Rich Communication Language (RCL), a domain-specific language for creating RCS (Rich Communication Services) agents. The project is organized as a monorepo using Moon build system and pnpm workspaces, providing language parsing support across multiple programming languages including C, Node.js, Python, Rust, Go, and Swift.

## Monorepo Structure

### Apps
- **`apps/extension/`**: VSCode extension with Language Server Protocol (LSP) implementation
  - **`client/`**: VSCode extension client code
  - **`server/`**: Language server implementation with all language features
  - **`syntaxes/`**: TextMate grammar for syntax highlighting
  - **`language-configuration.json`**: Language configuration

### Packages
- **`packages/parser/`**: Core RCL parser and AST utilities
  - AST type definitions (`astTypes.ts`)
  - Parser implementation (`rclParser.ts`)
  - AST walker utilities (`astWalker.ts`) 
  - RCL type system (`rclTypes.ts`)

- **`packages/cli/`**: Command-line interface tool
  - RCL compiler and code generator
  - Message normalization and flow extraction
  - JavaScript/JSON output generation

- **`packages/language-service/`**: Language service providers (in development)
  - Import resolution system
  - Workspace indexing
  - Validation providers
  - Feature providers for completion, definition, references, etc.

### Root Level
- **`grammar.js`**: Main grammar definition file using tree-sitter DSL
- **`tree-sitter.json`**: Configuration file defining grammar metadata, bindings, and file associations
- **`rcl-formal-specification.md`**: Comprehensive EBNF specification for the RCL language
- **`bindings/`**: Language bindings for C, Node.js, Python, Rust, Go, and Swift

### Build System
- **`moon.yml`**: Moon workspace configuration with project references
- **`pnpm-workspace.yaml`**: pnpm workspace configuration
- **`tsconfig.base.json`**: Base TypeScript configuration
- **`Makefile`**: Primary build system for C library generation
- **`CMakeLists.txt`**: CMake build configuration
- **`binding.gyp`**: Node.js native addon build configuration

## Development Commands

### Monorepo Commands
```bash
# Build all packages
moon run :build

# Development mode
moon run :dev

# Run all tests
moon run :test

# Type checking
moon run :typecheck

# Lint all packages
moon run :lint

# Clean build artifacts
moon run :clean

# Install dependencies
pnpm install
```

### Grammar Development
```bash
# Generate parser from grammar
tree-sitter generate

# Test grammar
tree-sitter test

# Start tree-sitter playground
tree-sitter playground
```

### Extension Development
```bash
# Compile extension (from apps/extension)
pnpm compile

# Run extension tests
pnpm test

# Package extension
pnpm package

# Watch mode for development
pnpm watch
```

### CLI Development
```bash
# Build CLI (from packages/cli)
pnpm build

# Run CLI demo
pnpm demo

# Test CLI
pnpm test
```

### Parser Development
```bash
# Build parser package (from packages/parser)
pnpm build

# Run parser tests
pnpm test

# Development watch mode
pnpm dev
```

### Language Service Development
```bash
# Build language service (from packages/language-service)
pnpm build

# Run tests
pnpm test

# Development mode
pnpm dev
```

## RCL Language Context

The Rich Communication Language (RCL) is designed for creating conversational agents that work with Google's RCS Business Messaging platform. Key language features include:

- **Agent definitions** with display names and configuration
- **Flow systems** for conversation logic with state transitions
- **Message templates** supporting rich cards, carousels, and suggestions
- **Embedded JavaScript/TypeScript** for dynamic content
- **Type system** with phone numbers, emails, URLs, dates, and durations
- **Import system** for code reuse across RCL files
- **Indentation-based syntax** similar to Python/YAML

## Grammar Implementation Status

The grammar is currently in early development stage with only a placeholder rule (`source_file: $ => "hello"`). The actual grammar implementation should follow the comprehensive EBNF specification in `rcl-formal-specification.md`.

## Current Implementation Status

### ✅ Completed Features
- **VSCode Extension**: Full language support with syntax highlighting, completion, diagnostics
- **Language Server**: LSP implementation with all core features
- **CLI Tool**: RCL compiler that generates JavaScript/JSON with messages, flows, and agent config
- **Parser Package**: Core RCL parser with AST utilities and type definitions
- **Monorepo Structure**: Moon-based workspace with pnpm package management
- **Testing**: Comprehensive test suites for all packages

### 🚧 In Progress
- **Language Service Package**: Advanced language service providers
- **Import Resolution**: System for resolving RCL imports across files
- **Workspace Indexing**: Cross-file symbol indexing and references

### 📋 Planned Features
See `LANGUAGE_SERVICE_FEATURES.md` and `LANGUAGE_SERVICE_IMPLEMENTATION_PLAN.md` for comprehensive feature roadmap.

## Key Development Areas

1. **Language Service Implementation**: Following the detailed plan in `LANGUAGE_SERVICE_IMPLEMENTATION_PLAN.md`
2. **Import Resolution**: Critical foundation for cross-file features
3. **Workspace Indexing**: Enable find references, go to definition across files
4. **Flow Visualization**: Visual representation of conversation flows
5. **Message Preview**: Preview formatted messages with rich content

## Installation and Distribution

The project supports multiple package managers:
- **npm**: `npm install tree-sitter-rcl`
- **cargo**: `cargo add tree-sitter-rcl`
- **pip**: `pip install tree-sitter-rcl`
- **go**: `go get github.com/rcs-agents/rcl-tree-sitter/bindings/go`

## Language Service Architecture

The language service is split between:

### Extension Server (`apps/extension/server/`)
Currently contains the working language server implementation:
- **Features**: Completion, diagnostics, hover, formatting, folding, symbols, references
- **Parser**: RCL parser with AST walker and syntax validation
- **Types**: AST and RCL type definitions
- **Validation**: Comprehensive syntax and semantic validation

### Language Service Package (`packages/language-service/`)
Being developed for advanced cross-file features:
- **Import Resolution**: Resolve imports across RCL files
- **Workspace Indexing**: Build workspace-wide symbol tables
- **Validation Providers**: Advanced semantic validation
- **Feature Providers**: Enhanced completion, definition, references

The goal is to gradually move advanced features from the extension server to the language service package while maintaining backward compatibility.

## File Structure Patterns

- **Apps**: Contains applications (VSCode extension)
- **Packages**: Contains reusable libraries (parser, cli, language-service)
- **Monorepo**: Uses Moon build system with pnpm workspaces
- **TypeScript**: Strict TypeScript configuration across all packages
- **Testing**: Each package has its own test suite using appropriate testing frameworks
- **Shared Code**: Parser and type definitions shared between extension and CLI