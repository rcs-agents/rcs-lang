# Changelog

All notable changes to the RCL Language Toolchain will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-19

### 🎉 Initial Release

This marks the first stable release of the RCL (Rich Communication Language) toolchain, featuring a complete language implementation with parser, compiler, runtime, and development tools.

### ✨ Added

#### Core Language Infrastructure
- **ANTLR4-based Parser** - Complete rewrite using ANTLR4 for robust parsing
- **Modular Compiler Pipeline** - Parse → Validate → Transform → Generate architecture
- **Multiple Output Formats** - JavaScript, JSON, D2 diagrams, Mermaid support
- **Conversation State Machine (CSM)** - Runtime execution library for compiled agents
- **Comprehensive AST** - Parser-independent abstract syntax tree definitions

#### Development Tools
- **CLI Compiler** (`@rcs-lang/cli`) - Command-line interface for compiling RCL files
- **VSCode Extension** - Full language support with syntax highlighting, diagnostics, completion
- **Web-based IDE** (`@rcs-lang/ide`) - Browser-based RCS Agent Studio
- **Language Service** - Advanced IDE features (hover, go-to-definition, references)

#### Build System & Tooling
- **Moon Task Runner** - Standardized build system across the monorepo
- **Biome Linting** - Modern code formatting and linting
- **TypeScript Support** - Full type safety across all packages
- **Comprehensive Testing** - Unit, integration, and end-to-end test suites

#### Documentation & Examples
- **Complete API Documentation** - Detailed docs for all public APIs
- **Getting Started Guide** - Step-by-step tutorial for new users
- **Working Examples** - Validated RCL examples demonstrating all features
- **Package READMEs** - Thorough documentation for each package

#### CI/CD & Publishing
- **GitHub Actions Workflows** - Automated testing, building, and deployment
- **Renovate Integration** - Automated dependency updates
- **NPM Publishing** - Automated package publishing to npm registry
- **VSCode Marketplace** - Automated extension publishing

### 🏗️ Architecture

#### Package Structure
```
packages/
├── ast/              # AST type definitions
├── compiler/         # Compilation pipeline  
├── csm/             # Conversation state machine runtime
├── language-service/ # IDE language features
└── parser/          # ANTLR4 parser implementation

apps/
├── cli/             # Command-line interface
├── extension/       # VSCode extension
└── ide/            # Web-based IDE

libs/
├── core/           # Core utilities and types
├── diagram/        # Diagram generation
├── file-system/    # File system abstractions
└── validation/     # Validation pipeline
```

#### Key Features
- **Rich Message Types** - Text, rich cards, carousels, suggestions
- **Flow Control** - State-based conversation flows with transitions
- **Context Variables** - Persistent state management across conversations
- **Pattern Matching** - Flexible input pattern matching with regex support
- **Type Safety** - End-to-end TypeScript support
- **Extensible Architecture** - Plugin-based generators and validators

### 🔧 Technical Improvements

#### Parser & Compiler
- Migrated from Tree-sitter to ANTLR4 for better error handling
- Implemented proper lexer modes for indentation-aware parsing
- Added comprehensive semantic validation
- Enhanced error reporting with source location information
- Support for escape sequences in string literals

#### Language Service
- Added completion providers for RCL constructs
- Implemented hover information with type details
- Added go-to-definition and find references
- Real-time syntax and semantic diagnostics
- Symbol outline and document formatting

#### Build & Development
- Standardized all build scripts using Moon task tags
- Implemented automated testing across all packages
- Added code coverage reporting
- Integrated modern tooling (Biome, TypeScript 5.x)
- Optimized build performance with incremental compilation

### 📦 Published Packages

The following packages are now available on npm:

- `@rcs-lang/ast@1.0.0` - AST type definitions
- `@rcs-lang/compiler@1.0.0` - Compilation pipeline
- `@rcs-lang/csm@1.0.0` - Conversation state machine runtime
- `@rcs-lang/language-service@1.0.0` - Language service providers
- `@rcs-lang/cli@1.0.0` - Command-line compiler
- `@rcs-lang/ide@1.0.0` - Web-based IDE

### 🧪 Testing & Validation

- **Unit Tests** - Comprehensive test coverage for all packages
- **Integration Tests** - End-to-end testing of compilation pipeline
- **Example Validation** - All examples verified for correctness
- **Type Checking** - Strict TypeScript validation
- **Linting** - Consistent code style enforcement

### 🔄 Breaking Changes

This is the initial release, so no breaking changes apply. Future releases will document breaking changes here.

### 🐛 Bug Fixes

- Fixed string escape sequence handling in lexer
- Resolved carousel card processing in compiler transform stage
- Fixed JavaScript output format consistency in tests
- Corrected TypeScript errors across IDE package
- Resolved Moon configuration issues

### 📈 Performance Improvements

- Optimized ANTLR parser generation process
- Improved build times with Moon task orchestration
- Enhanced error message clarity and performance
- Streamlined package interdependencies

### 🔒 Security

- Implemented secure file handling in browser environments
- Added input validation for all user-provided data
- Configured automated security auditing with Renovate
- Applied security best practices across all packages

---

## Release Notes

### Installation

```bash
# Install CLI globally
npm install -g @rcs-lang/cli

# Or use npx
npx @rcs-lang/cli compile my-agent.rcl
```

### Quick Start

1. **Create an RCL file** (`hello.rcl`):
```rcl
agent HelloBot
  displayName "Hello Bot"
  
  flow greeting
    start -> welcome
    welcome: "Hello! How can I help you?"
      * -> end
      
  messages Messages
```

2. **Compile it**:
```bash
npx @rcs-lang/cli compile hello.rcl
```

3. **Use in your application**:
```javascript
import { ConversationalAgent } from '@rcs-lang/csm';
const agent = new ConversationalAgent(require('./hello.js'));
```

### Migration Guide

This is the initial release. Future versions will include migration guides for any breaking changes.

### Contributors

This release was made possible by the RCL development team and community contributors.

### Support

- **Documentation**: [docs/](./docs/)
- **Examples**: [examples/](./examples/)
- **Issues**: [GitHub Issues](https://github.com/rcs-agents/rcs-lang/issues)

---

For more detailed information about specific changes, see the commit history and pull requests in the repository.