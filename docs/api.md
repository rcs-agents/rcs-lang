# RCL Language API Documentation

## Overview

This document provides comprehensive API documentation for all RCL language packages. The RCL (Rich Communication Language) toolchain consists of several interconnected packages that work together to provide a complete language implementation.

## Package Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   @rcs-lang/    │    │   @rcs-lang/    │    │   @rcs-lang/    │
│      ast        │───▶│     parser      │───▶│   compiler      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   @rcs-lang/    │    │   @rcs-lang/    │    │   @rcs-lang/    │
│ language-service│    │      cli        │    │      csm        │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Packages

### 1. @rcs-lang/ast
**Purpose**: Parser-independent AST definitions and utilities  
**Location**: `packages/ast/`  
**Documentation**: [packages/ast/docs/](./packages/ast/docs/)

Provides TypeScript type definitions for the RCL Abstract Syntax Tree, including all node types, position information, and tree manipulation utilities.

**Key Exports**:
- `ASTNode` - Base interface for all AST nodes
- `RCLDocument` - Root document node
- `Agent`, `Flow`, `Message` - Core language constructs
- `Position`, `Range` - Source location types
- Type guards and utilities

### 2. @rcs-lang/compiler
**Purpose**: Modular compilation pipeline  
**Location**: `packages/compiler/`  
**Documentation**: [packages/compiler/docs/](./packages/compiler/docs/)

Multi-stage compilation pipeline that transforms RCL source code into various output formats (JavaScript, D2 diagrams, Mermaid, etc.).

**Key Features**:
- Parse → Validate → Transform → Generate pipeline
- Multiple output generators
- Extensible architecture
- Error handling and diagnostics

### 3. @rcs-lang/csm
**Purpose**: Conversation State Machine runtime  
**Location**: `packages/csm/`  
**Documentation**: [packages/csm/docs/](./packages/csm/docs/)

Runtime library for executing compiled RCL agents as conversation state machines. Handles message routing, context management, and flow execution.

**Key Features**:
- State machine execution
- Message pattern matching
- Context variable management
- Event handling system

### 4. @rcs-lang/language-service
**Purpose**: IDE language features  
**Location**: `packages/language-service/`  
**Documentation**: [packages/language-service/docs/](./packages/language-service/docs/)

Advanced language service providers for IDE integration, including completion, hover, diagnostics, and more.

**Key Features**:
- Completion provider
- Hover information
- Go-to-definition
- Reference finding
- Semantic validation

## Application Packages

### 5. @rcs-lang/cli
**Purpose**: Command-line compiler  
**Location**: `apps/cli/`  
**Documentation**: [apps/cli/README.md](./apps/cli/README.md)

Command-line interface for compiling RCL files and managing RCL projects.

**Usage**:
```bash
npx @rcs-lang/cli compile input.rcl
npx @rcs-lang/cli validate input.rcl
npx @rcs-lang/cli generate --format js input.rcl
```

### 6. @rcs-lang/ide
**Purpose**: Web-based RCS Agent Studio  
**Location**: `apps/ide/`  
**Documentation**: [apps/ide/README.md](./apps/ide/README.md)

Browser-based IDE for creating and testing RCS agents without requiring local development setup.

## Common Usage Patterns

### Basic Compilation

```typescript
import { Compiler } from '@rcs-lang/compiler';
import { AntlrRclParser } from '@rcs-lang/parser';

const compiler = new Compiler({
  parser: new AntlrRclParser(),
  outputFormat: 'javascript'
});

const result = await compiler.compile(sourceCode);
if (result.success) {
  console.log(result.output);
} else {
  console.error(result.errors);
}
```

### AST Manipulation

```typescript
import { RCLDocument, Agent } from '@rcs-lang/ast';
import { isAgent, isFlow } from '@rcs-lang/ast/guards';

function findAgents(document: RCLDocument): Agent[] {
  return document.children?.filter(isAgent) || [];
}
```

### State Machine Execution

```typescript
import { ConversationalAgent } from '@rcs-lang/csm';

const agent = new ConversationalAgent(compiledOutput);

const response = await agent.processMessage({
  type: 'text',
  content: 'Hello'
});
```

### Language Service Integration

```typescript
import { CompletionProvider } from '@rcs-lang/language-service';

const provider = new CompletionProvider({
  parser: new AntlrRclParser()
});

const completions = await provider.provideCompletions(
  document,
  position
);
```

## Type Definitions

### Core AST Types

```typescript
// Base node interface
interface ASTNode {
  type: string;
  range: Range;
  parent?: ASTNode;
  children?: ASTNode[];
}

// Document root
interface RCLDocument extends ASTNode {
  type: 'document';
  imports: ImportStatement[];
  agent: Agent;
}

// Agent definition
interface Agent extends ASTNode {
  type: 'agent';
  name: Identifier;
  sections: AgentSection[];
}
```

### Compilation Pipeline

```typescript
interface CompilerOptions {
  parser: Parser;
  outputFormat: 'javascript' | 'd2' | 'mermaid' | 'json';
  validate?: boolean;
  includeSourceMap?: boolean;
}

interface CompilationResult {
  success: boolean;
  output?: string;
  errors?: CompilerError[];
  warnings?: CompilerWarning[];
  sourceMap?: SourceMap;
}
```

### State Machine Types

```typescript
interface MachineDefinition {
  id: string;
  initial: string;
  states: Record<string, StateDefinition>;
  context?: Record<string, any>;
}

interface StateDefinition {
  on?: Record<string, Transition>;
  entry?: Action[];
  exit?: Action[];
}
```

## Error Handling

All packages follow consistent error handling patterns:

```typescript
// Compilation errors
interface CompilerError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  range: Range;
  source: string;
}

// Runtime errors
class CSMError extends Error {
  code: string;
  context?: Record<string, any>;
}
```

## Versioning and Compatibility

- All packages follow [Semantic Versioning](https://semver.org/)
- Major version alignment across core packages
- Backwards compatibility maintained within major versions
- Migration guides provided for breaking changes

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on contributing to the RCL language toolchain.

## License

All packages are licensed under MIT License. See individual package directories for specific license files.