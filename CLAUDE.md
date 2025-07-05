# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a tree-sitter grammar implementation for the Rich Communication Language (RCL), a domain-specific language for creating RCS (Rich Communication Services) agents. The project provides language parsing support across multiple programming languages including C, Node.js, Python, Rust, Go, and Swift.

## Core Architecture

### Grammar Definition
- **`grammar.js`**: Main grammar definition file using tree-sitter DSL (currently has placeholder implementation)
- **`tree-sitter.json`**: Configuration file defining grammar metadata, bindings, and file associations
- **`rcl-formal-specification.md`**: Comprehensive EBNF specification for the RCL language

### Language Bindings Structure
- **`bindings/c/`**: C language bindings with headers and pkg-config
- **`bindings/node/`**: Node.js bindings with native addon support
- **`bindings/python/`**: Python bindings with setuptools integration
- **`bindings/rust/`**: Rust crate with build script and library interface
- **`bindings/go/`**: Go module bindings
- **`bindings/swift/`**: Swift package bindings

### Build System
- **`Makefile`**: Primary build system for C library generation
- **`CMakeLists.txt`**: CMake build configuration
- **`Cargo.toml`**: Rust package configuration
- **`package.json`**: Node.js package with npm scripts
- **`binding.gyp`**: Node.js native addon build configuration

## Development Commands

### Grammar Development
```bash
# Generate parser from grammar
tree-sitter generate

# Test grammar
tree-sitter test
make test

# Start tree-sitter playground
npm start
```

### Building
```bash
# Build all targets
make all

# Build specific components
make lib$(LANGUAGE_NAME).a        # Static library
make lib$(LANGUAGE_NAME).so       # Shared library

# Build with CMake
cmake -B build && cmake --build build

# Build Rust crate
cargo build

# Build Node.js addon
npm install
```

### Testing
```bash
# Run all tests
npm test                          # Node.js tests
cargo test                        # Rust tests
python -m pytest bindings/python/tests/  # Python tests
go test ./bindings/go/           # Go tests

# Individual binding tests
node bindings/node/binding_test.js
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

## Key Development Areas

1. **Parser Implementation**: Convert EBNF rules to tree-sitter grammar
2. **Syntax Highlighting**: Add queries for editor integration
3. **Language Server**: Implement semantic analysis and validation
4. **Error Recovery**: Add robust error handling for malformed input
5. **Testing**: Comprehensive test suite with RCL example files

## Installation and Distribution

The project supports multiple package managers:
- **npm**: `npm install tree-sitter-rcl`
- **cargo**: `cargo add tree-sitter-rcl`
- **pip**: `pip install tree-sitter-rcl`
- **go**: `go get github.com/rcs-agents/rcl-tree-sitter/bindings/go`

## File Structure Patterns

- Grammar rules should be organized by language constructs (expressions, statements, declarations)
- Bindings follow language-specific conventions for package structure
- Tests are co-located with their respective language bindings
- Build artifacts are ignored via `.gitignore`