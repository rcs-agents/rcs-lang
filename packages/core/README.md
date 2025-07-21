# @rcs-lang/core

Core interfaces, types, and utilities for the RCL (Rich Communication Language) ecosystem.

## Overview

This package provides the foundational abstractions and shared interfaces used across all RCL tools. It defines the contracts for parsers, compilers, file systems, and other core components, enabling a modular and extensible architecture.

## Installation

```bash
npm install @rcs-lang/core
```

## Core Interfaces

### Parser Abstraction

```typescript
import { IParser, IParserAdapter } from '@rcs-lang/core';

// Generic parser interface
interface IParser<T = any> {
  parse(source: string, fileName?: string): Promise<Result<T>>;
}

// Parser adapter for converting parser-specific ASTs
interface IParserAdapter<T = any> {
  adapt(parseTree: T): Promise<Result<IASTNode>>;
}
```

### Compiler Pipeline

```typescript
import { ICompilationStage, ICompilationInput, ICompilationResult } from '@rcs-lang/core';

// Compilation stage interface
interface ICompilationStage {
  name: string;
  process(input: any): Promise<Result<any>>;
}

// Example: Custom validation stage
class CustomValidator implements ICompilationStage {
  name = 'custom-validation';
  
  async process(input: ICompilationInput): Promise<Result<any>> {
    // Implement custom validation logic
    return ok(input);
  }
}
```

### File System Abstraction

```typescript
import { IFileSystem } from '@rcs-lang/core';

// Cross-platform file system interface
interface IFileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  // ... more methods
}
```

## Result Type

The core package provides a robust Result type for error handling:

```typescript
import { Result, ok, err } from '@rcs-lang/core';

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return err('Division by zero');
  }
  return ok(a / b);
}

// Usage
const result = divide(10, 2);
if (result.success) {
  console.log('Result:', result.data); // 5
} else {
  console.error('Error:', result.error);
}
```

## Diagnostics

Standardized diagnostic reporting across the toolchain:

```typescript
import { Diagnostic, ErrorCode, ErrorCategory } from '@rcs-lang/core';

const diagnostic: Diagnostic = {
  severity: 'error',
  message: 'Missing required field',
  code: ErrorCode.MISSING_REQUIRED_FIELD,
  category: ErrorCategory.VALIDATION,
  range: {
    start: { line: 10, character: 5 },
    end: { line: 10, character: 15 }
  },
  source: 'semantic-validator'
};
```

## Error Handling

Comprehensive error system with categorization and context:

```typescript
import { RCLError, RCLErrorFactory } from '@rcs-lang/core';

// Create structured errors
const error = RCLErrorFactory.syntaxError(
  'Unexpected token',
  { line: 1, character: 10 },
  'Expected ":" after agent name'
);

// Convert legacy errors
const rclError = legacyErrorToRCLError(legacyError);
```

## Validation Framework

Base classes for implementing validators:

```typescript
import { BaseValidator, IValidationResult } from '@rcs-lang/core';

class MyValidator extends BaseValidator {
  name = 'my-validator';
  
  async validate(ast: IASTNode): Promise<IValidationResult> {
    const diagnostics: Diagnostic[] = [];
    
    // Implement validation logic
    if (hasError) {
      diagnostics.push(
        this.createError('Validation failed', node, 'MY_ERROR')
      );
    }
    
    return this.createResult(diagnostics);
  }
}
```

## Language Service Types

Interfaces for building language servers and IDE features:

```typescript
import { 
  ILanguageService,
  CompletionParams,
  HoverParams,
  DefinitionParams 
} from '@rcs-lang/core';

class MyLanguageService implements ILanguageService {
  async getCompletions(params: CompletionParams): Promise<CompletionItem[]> {
    // Implement completion logic
    return [];
  }
  
  async getHover(params: HoverParams): Promise<Hover | null> {
    // Implement hover logic
    return null;
  }
}
```

## Utilities

### Location and Range Utilities

```typescript
import { Range, Position, isPositionInRange } from '@rcs-lang/core';

const range: Range = {
  start: { line: 5, character: 10 },
  end: { line: 5, character: 20 }
};

const position: Position = { line: 5, character: 15 };

if (isPositionInRange(position, range)) {
  console.log('Position is within range');
}
```

### AST Utilities

```typescript
import { walkAST, findNode } from '@rcs-lang/core';

// Walk AST with visitor pattern
walkAST(ast, (node) => {
  if (node.type === 'AgentDefinition') {
    console.log('Found agent:', node.name);
  }
});

// Find specific nodes
const agentNodes = findNode(ast, (node) => 
  node.type === 'AgentDefinition'
);
```

## Type Guards

Runtime type checking utilities:

```typescript
import { isCompilationInput, isValidationResult } from '@rcs-lang/core';

function processInput(input: unknown) {
  if (isCompilationInput(input)) {
    // TypeScript knows input is ICompilationInput
    console.log('Processing:', input.source);
  }
}
```

## Configuration

The core package supports configuration schemas:

```typescript
import { ConfigSchema, validateConfig } from '@rcs-lang/core';

const config = {
  output: {
    format: 'json',
    directory: 'dist/'
  }
};

const result = validateConfig(config, ConfigSchema);
if (!result.success) {
  console.error('Invalid configuration:', result.errors);
}
```

## Contributing

See the main repository README for contribution guidelines.

## License

MIT