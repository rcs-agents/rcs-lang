# RCL Language Monorepo Architecture Redesign

## Executive Summary

After analyzing the current codebase, I've identified several architectural issues that are causing bugs and making the system unreliable. This document proposes a clean, well-structured architecture following SOLID principles and best practices for programming language implementations.

## Core Principles

1. **Single Responsibility Principle**: Each module has ONE clear purpose
2. **Open/Closed Principle**: Extension through interfaces, not modification
3. **Liskov Substitution**: Proper abstraction hierarchies
4. **Interface Segregation**: Small, focused interfaces
5. **Dependency Inversion**: Depend on abstractions, not implementations
6. **Separation of Concerns**: Clear boundaries between layers
7. **Immutability**: Parser outputs immutable ASTs
8. **Pure Functions**: No side effects in core logic
9. **Explicit Error Handling**: No silent failures

## Proposed Architecture

### 1. Core Language Infrastructure

```
packages/
├── ast/                    # AST definitions and utilities
│   ├── src/
│   │   ├── nodes.ts       # AST node type definitions
│   │   ├── visitors.ts    # Visitor pattern implementation
│   │   ├── builders.ts    # AST construction helpers
│   │   └── validators.ts  # AST validation rules
│   └── tests/
│
├── lexer/                  # Tokenization (if needed separately)
│   ├── src/
│   │   ├── tokens.ts      # Token type definitions
│   │   ├── lexer.ts       # Tokenization logic
│   │   └── scanner.ts     # Character scanning
│   └── tests/
│
├── parser/                 # Parsing only - no compilation logic
│   ├── src/
│   │   ├── parser.ts      # Parser interface
│   │   ├── tree-sitter/   # Tree-sitter implementation
│   │   │   ├── grammar.js # Grammar definition
│   │   │   ├── adapter.ts # Adapts tree-sitter to parser interface
│   │   │   └── index.ts
│   │   └── errors.ts      # Parse error types
│   └── tests/
│
├── semantic/               # Semantic analysis
│   ├── src/
│   │   ├── analyzer.ts    # Semantic analyzer interface
│   │   ├── symbol-table.ts # Symbol resolution
│   │   ├── type-checker.ts # Type checking (if applicable)
│   │   ├── validators/    # Semantic validation rules
│   │   │   ├── agent.ts
│   │   │   ├── flow.ts
│   │   │   └── message.ts
│   │   └── errors.ts      # Semantic error types
│   └── tests/
│
├── ir/                     # Intermediate representation
│   ├── src/
│   │   ├── ir-nodes.ts    # IR node definitions
│   │   ├── transformer.ts # AST to IR transformation
│   │   └── optimizer.ts   # IR optimizations
│   └── tests/
│
├── codegen/                # Code generation
│   ├── src/
│   │   ├── generator.ts   # Generator interface
│   │   ├── json/          # JSON output generator
│   │   ├── javascript/    # JS output generator
│   │   └── emitter.ts     # File emission logic
│   └── tests/
│
└── diagnostics/            # Unified diagnostics system
    ├── src/
    │   ├── diagnostic.ts  # Diagnostic types
    │   ├── reporter.ts    # Error reporting
    │   └── formatter.ts   # Error formatting
    └── tests/
```

### 2. Language Services

```
packages/
├── language-server/        # LSP implementation
│   ├── src/
│   │   ├── server.ts      # LSP server
│   │   ├── handlers/      # LSP method handlers
│   │   ├── services/      # Language services
│   │   │   ├── completion.ts
│   │   │   ├── hover.ts
│   │   │   ├── diagnostics.ts
│   │   │   └── symbols.ts
│   │   └── workspace.ts   # Workspace management
│   └── tests/
│
├── compiler-api/           # High-level compiler API
│   ├── src/
│   │   ├── compiler.ts    # Compiler facade
│   │   ├── pipeline.ts    # Compilation pipeline
│   │   ├── config.ts      # Configuration types
│   │   └── program.ts     # Program abstraction
│   └── tests/
│
└── language-api/           # Public API for embedders
    ├── src/
    │   ├── api.ts         # Main API surface
    │   ├── types.ts       # Public types
    │   └── index.ts       # Exports
    └── tests/
```

### 3. Tools and Applications

```
apps/
├── cli/                    # Command-line interface
│   ├── src/
│   │   ├── cli.ts         # CLI entry point
│   │   ├── commands/      # CLI commands
│   │   │   ├── compile.ts
│   │   │   ├── check.ts
│   │   │   └── format.ts
│   │   └── utils/         # CLI utilities
│   └── tests/
│
├── vscode-extension/       # VSCode extension
│   ├── client/            # Extension client
│   │   ├── src/
│   │   │   ├── extension.ts
│   │   │   └── commands/
│   │   └── tests/
│   └── server/            # Embedded language server
│       └── src/
│           └── server.ts
│
└── playground/             # Web playground
    ├── src/
    │   ├── editor.ts
    │   ├── compiler.ts
    │   └── ui/
    └── tests/
```

## Key Design Decisions

### 1. Parser Package
- **Single Responsibility**: ONLY parsing, no compilation or semantic analysis
- **Interface-based**: Define a `Parser` interface, tree-sitter is just one implementation
- **Immutable AST**: Parser returns immutable AST nodes
- **Explicit Errors**: Parse errors are explicit, never silent

### 2. Semantic Analysis
- **Separate Package**: Decoupled from parser
- **Phase-based**: Clear phases (symbol resolution → type checking → validation)
- **Pluggable Validators**: Easy to add new validation rules
- **Rich Error Information**: Errors include context and suggestions

### 3. Code Generation
- **Strategy Pattern**: Different generators for different outputs
- **IR-based**: Transform AST → IR → Output for optimization opportunities
- **Streaming**: Support streaming output for large files

### 4. Language Server
- **Service-oriented**: Each LSP feature is a separate service
- **Incremental**: Support incremental parsing and analysis
- **Cancellable**: All operations can be cancelled
- **Memory-efficient**: Use weak references for caching

### 5. CLI
- **Thin Layer**: CLI is just a thin wrapper around compiler-api
- **No Business Logic**: All logic lives in packages, not in CLI
- **Testable**: Commands are testable units

## Migration Strategy

### Phase 1: Core Infrastructure (Week 1-2)
1. Create new package structure
2. Define interfaces and types
3. Implement AST package with proper node types
4. Create parser interface and adapt tree-sitter

### Phase 2: Semantic Analysis (Week 2-3)
1. Extract semantic validation from compiler
2. Implement symbol table
3. Create validation pipeline
4. Add comprehensive error reporting

### Phase 3: Code Generation (Week 3-4)
1. Define IR if needed
2. Implement JSON generator
3. Implement JavaScript generator
4. Add source maps support

### Phase 4: Language Services (Week 4-5)
1. Refactor language server to use new packages
2. Implement incremental parsing
3. Add proper cancellation support
4. Optimize memory usage

### Phase 5: Tools (Week 5-6)
1. Refactor CLI to use compiler-api
2. Update VSCode extension
3. Add comprehensive tests
4. Update documentation

## Quality Assurance

### Testing Strategy
- **Unit Tests**: Each package has comprehensive unit tests
- **Integration Tests**: Test package interactions
- **E2E Tests**: Test complete compilation pipeline
- **Property-based Tests**: For parser and generators
- **Fuzzing**: For finding edge cases

### Performance Requirements
- Parse 1000 lines in < 100ms
- Generate output in < 50ms
- Language server response < 100ms
- Memory usage < 100MB for typical projects

### Error Handling
- No silent failures
- All errors have error codes
- Errors include recovery suggestions
- Stack traces in development mode only

## Benefits of This Architecture

1. **Reliability**: Clear boundaries prevent cascading failures
2. **Maintainability**: Each package has a single, clear purpose
3. **Testability**: Small, focused units are easy to test
4. **Performance**: Incremental and streaming support
5. **Extensibility**: Easy to add new features without breaking existing code
6. **Developer Experience**: Clear APIs and good error messages

## Next Steps

1. Review and approve this architecture
2. Create detailed interface definitions
3. Set up new package structure
4. Begin migration phase by phase
5. Maintain backward compatibility during migration