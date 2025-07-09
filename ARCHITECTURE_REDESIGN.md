# RCL Language Monorepo Architecture - Implemented Design

## Executive Summary

This document describes the actual implemented architecture for the RCL language monorepo, following a refactoring effort to improve code organization, reliability, and maintainability using SOLID principles.

## Core Principles

1. **Single Responsibility Principle**: Each module has ONE clear purpose
2. **Open/Closed Principle**: Extension through interfaces, not modification
3. **Liskov Substitution**: Proper abstraction hierarchies
4. **Interface Segregation**: Small, focused interfaces
5. **Dependency Inversion**: Depend on abstractions, not implementations
6. **Separation of Concerns**: Clear boundaries between layers
7. **Immutability**: Parser outputs immutable ASTs
8. **Pure Functions**: No side effects in core logic
9. **Explicit Error Handling**: Result<T,E> pattern for no silent failures

## Implemented Architecture

### Directory Structure

```
rcl-tree-sitter/
├── apps/                    # Applications
│   ├── cli/                # Command-line interface
│   └── extension/          # VSCode extension
│
├── packages/               # Published packages
│   ├── parser/            # Tree-sitter parser and AST utilities
│   ├── compiler/          # Compilation pipeline and API
│   └── language-service/  # Advanced language services
│
└── libs/                   # Internal libraries
    ├── core/              # Core types and interfaces
    ├── validation/        # Validation pipeline
    └── file-system/       # File system abstraction
```

### Package Descriptions

#### Published Packages (in `packages/`)

1. **@rcl/parser**
   - Tree-sitter grammar and parser
   - AST type definitions and utilities
   - Platform-agnostic parser factory (Node.js/WASM)
   - No business logic, just parsing

2. **@rcl/compiler**
   - High-level compilation API
   - Compilation pipeline with stages
   - Integrates parser, validation, and code generation
   - Main entry point for programmatic compilation

3. **@rcl/language-service**
   - Advanced language service providers
   - Hover, completion, diagnostics, etc.
   - Workspace indexing and management
   - Used by VSCode extension

#### Internal Libraries (in `libs/`)

1. **@rcl/core**
   - Core types: `Result<T,E>`, `Diagnostic`
   - All interfaces: `IParser`, `ICompiler`, `IValidator`, etc.
   - Platform-agnostic abstractions
   - No implementation, only contracts

2. **@rcl/validation**
   - Validation pipeline implementation
   - Pluggable validators: syntax, semantic, naming
   - Extensible validation framework
   - Returns detailed diagnostics

3. **@rcl/file-system**
   - File system abstraction layer
   - `NodeFileSystem` for Node.js
   - `MemoryFileSystem` for testing/browser
   - Factory pattern for platform detection

### Key Design Patterns

#### 1. Result Type for Error Handling
```typescript
export type Result<T, E = Error> = 
  | { success: true; value: T }
  | { success: false; error: E };
```

#### 2. Interface-Based Architecture
All major components are defined as interfaces in `@rcl/core`:
- `IParser`: Parser abstraction
- `ICompiler`: Compiler abstraction
- `IFileSystem`: File system abstraction
- `IValidator`: Validation abstraction

#### 3. Factory Pattern
- `ParserFactory`: Creates appropriate parser (Node/WASM)
- `FileSystemFactory`: Creates appropriate file system

#### 4. Pipeline Pattern
- `CompilationPipeline`: Stages for parse → validate → transform
- `ValidationPipeline`: Pluggable validators

### Dependency Flow

```
@rcl/core (types & interfaces)
    ↓
@rcl/validation, @rcl/file-system (implementations)
    ↓
@rcl/parser (uses core types)
    ↓
@rcl/compiler (orchestrates everything)
    ↓
@rcl/language-service (builds on compiler)
    ↓
apps (CLI, VSCode extension)
```

## Implementation Highlights

### 1. Parser Package Improvements
- **Before**: Mixed concerns, silent failures, tight coupling
- **After**: Pure parsing, explicit errors, platform abstraction
- **Key Change**: ERROR nodes are now properly reported

### 2. Explicit Error Handling
- **Before**: Errors silently ignored or thrown
- **After**: Result<T,E> pattern throughout
- **Benefits**: No surprises, clear error propagation

### 3. Modular Validation
- **Before**: Validation mixed with compilation
- **After**: Separate validation pipeline with pluggable validators
- **Benefits**: Easy to add new rules, test in isolation

### 4. Platform Abstraction
- **Before**: Node.js specific code everywhere
- **After**: Abstractions for file system, parser
- **Benefits**: Can run in browser, easier testing

### 5. Clean Separation
- **Before**: Business logic in CLI, circular dependencies
- **After**: CLI is thin wrapper, clear dependency hierarchy
- **Benefits**: Testable, maintainable, no circular deps

## Testing Strategy

Each package has its own test suite:
- Unit tests with Vitest
- Integration tests for package interactions
- Mock implementations for testing
- Test utilities in each package

## Build System

- **Moon**: Task orchestration and dependency management
- **TypeScript**: Strict mode, project references
- **npm workspaces**: Package linking

## Migration from Original Design

The implemented architecture differs from the original proposal in several practical ways:

1. **Consolidated packages**: Instead of 7 separate packages (ast, lexer, parser, semantic, ir, codegen, diagnostics), we have 6 focused packages
2. **No separate IR**: Direct AST → Output transformation (can add IR later if needed)
3. **Unified core**: Single `@rcl/core` instead of separate type packages
4. **Libs folder**: Internal packages in `libs/` to distinguish from published packages

These changes were made to:
- Reduce complexity while maintaining separation of concerns
- Avoid premature abstraction (IR layer)
- Make dependency management clearer
- Simplify the mental model

## Benefits Achieved

1. **Reliability**: No more silent failures, explicit error handling
2. **Maintainability**: Clear package boundaries, single responsibilities
3. **Testability**: Pure functions, dependency injection
4. **Extensibility**: Interface-based, pluggable components
5. **Performance**: Platform-specific optimizations possible
6. **Developer Experience**: Better error messages, clear APIs

## Future Enhancements

1. **Intermediate Representation**: Add IR layer if optimization needs arise
2. **More Code Generators**: Add generators for other formats
3. **Incremental Parsing**: For better IDE performance
4. **Schema Evolution**: Versioned schemas for backward compatibility
5. **Plugin System**: Allow external validators/generators

## Conclusion

The implemented architecture successfully addresses the original issues while maintaining pragmatism. It provides a solid foundation for the RCL language toolchain with clear extension points for future enhancements.