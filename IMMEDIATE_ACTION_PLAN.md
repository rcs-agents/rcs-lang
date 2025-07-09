# Immediate Action Plan - Fix Critical Issues First

## Phase 0: Stop the Bleeding (1-2 days)

### 1. Fix Error Propagation Chain
```typescript
// Create proper Result type
type Result<T, E = Error> = 
  | { success: true; value: T }
  | { success: false; error: E };

// Use throughout the codebase instead of returning null or throwing
```

### 2. Add Integration Tests for Current Functionality
```typescript
// packages/parser/tests/integration.test.ts
test('parser correctly identifies ERROR nodes', async () => {
  const result = await parse('agent Coffee Shop');
  expect(result.errors).toHaveLength(0);
  expect(result.ast.type).toBe('rcl_program');
});

test('parser reports syntax errors', async () => {
  const result = await parse('agent');  // incomplete
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].type).toBe('ERROR');
});
```

### 3. Create Explicit Parser State Check
```typescript
// Add to parser/src/index.ts
export async function validateParserState(): Promise<boolean> {
  // Check if grammar matches compiled parser
  // Check if all expected tokens are recognized
  // Return false if mismatch detected
}
```

## Phase 1: Critical Refactoring (1 week)

### 1. Create Core Interfaces Package

```typescript
// packages/core-interfaces/src/parser.ts
export interface IParser {
  parse(text: string, uri?: string): Promise<ParseResult>;
  getSupportedVersion(): string;
}

export interface ParseResult {
  ast: ASTNode;
  errors: ParseError[];
  warnings: ParseWarning[];
}

export interface ParseError {
  type: 'syntax' | 'lexical';
  message: string;
  range: Range;
  severity: 'error';
}
```

### 2. Implement Proper AST Types

```typescript
// packages/ast/src/nodes.ts
export type ASTNode = 
  | ProgramNode
  | AgentDefinitionNode
  | FlowDefinitionNode
  | MessageDefinitionNode
  | ErrorNode;

export interface ProgramNode {
  type: 'program';
  children: ASTNode[];
  range: Range;
}

export interface ErrorNode {
  type: 'ERROR';
  message: string;
  range: Range;
  children: ASTNode[];
}
```

### 3. Create Parser Factory

```typescript
// packages/parser/src/factory.ts
export class ParserFactory {
  static create(options: ParserOptions): IParser {
    if (options.platform === 'node') {
      return new NodeParser(options);
    } else if (options.platform === 'browser') {
      return new WasmParser(options);
    }
    throw new Error(`Unsupported platform: ${options.platform}`);
  }
}
```

### 4. Implement Validation Pipeline

```typescript
// packages/validation/src/pipeline.ts
export class ValidationPipeline {
  private validators: IValidator[] = [];

  add(validator: IValidator): this {
    this.validators.push(validator);
    return this;
  }

  async validate(ast: ASTNode): Promise<ValidationResult> {
    const diagnostics: Diagnostic[] = [];
    
    for (const validator of this.validators) {
      const result = await validator.validate(ast);
      diagnostics.push(...result.diagnostics);
      
      if (result.fatal) {
        break;  // Stop on fatal errors
      }
    }
    
    return {
      isValid: diagnostics.filter(d => d.severity === 'error').length === 0,
      diagnostics
    };
  }
}
```

## Phase 2: Compilation Pipeline (1 week)

### 1. Define Clear Pipeline Stages

```typescript
// packages/compiler-api/src/pipeline.ts
export class CompilationPipeline {
  private stages: CompilationStage[] = [];

  constructor() {
    this.stages = [
      new ParseStage(),
      new ValidateStage(),
      new TransformStage(),
      new OptimizeStage(),
      new GenerateStage(),
      new EmitStage()
    ];
  }

  async compile(input: CompilationInput): Promise<CompilationResult> {
    let current: any = input;
    
    for (const stage of this.stages) {
      const result = await stage.process(current);
      
      if (!result.success) {
        return {
          success: false,
          diagnostics: result.diagnostics,
          stage: stage.name
        };
      }
      
      current = result.output;
    }
    
    return {
      success: true,
      output: current,
      diagnostics: []
    };
  }
}
```

### 2. Implement File System Abstraction

```typescript
// packages/core-interfaces/src/file-system.ts
export interface IFileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  readdir(path: string): Promise<string[]>;
}

// packages/file-system-node/src/index.ts
export class NodeFileSystem implements IFileSystem {
  async readFile(path: string): Promise<string> {
    return fs.promises.readFile(path, 'utf-8');
  }
  // ... other methods
}

// packages/file-system-memory/src/index.ts
export class MemoryFileSystem implements IFileSystem {
  private files = new Map<string, string>();
  
  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (!content) throw new Error(`File not found: ${path}`);
    return content;
  }
  // ... other methods
}
```

## Phase 3: Monaco/Web Support (2 weeks)

### 1. Create Browser-Compatible Parser

```typescript
// packages/parser-web/src/index.ts
export class WebParser implements IParser {
  private wasmModule: WebAssembly.Module;
  
  async initialize(): Promise<void> {
    const wasmBytes = await fetch('/rcl-parser.wasm');
    this.wasmModule = await WebAssembly.compile(wasmBytes);
  }
  
  async parse(text: string): Promise<ParseResult> {
    // Use WASM module to parse
  }
}
```

### 2. Create Monaco Language Service

```typescript
// packages/monaco-rcl/src/language-service.ts
export class MonacoRclLanguageService {
  private parser: IParser;
  private validator: ValidationPipeline;
  
  constructor() {
    this.parser = ParserFactory.create({ platform: 'browser' });
    this.validator = new ValidationPipeline()
      .add(new SyntaxValidator())
      .add(new SemanticValidator());
  }
  
  async provideDiagnostics(model: monaco.editor.ITextModel): Promise<monaco.editor.IMarkerData[]> {
    const text = model.getValue();
    const parseResult = await this.parser.parse(text);
    
    if (parseResult.errors.length > 0) {
      return this.convertToDiagnostics(parseResult.errors);
    }
    
    const validation = await this.validator.validate(parseResult.ast);
    return this.convertToDiagnostics(validation.diagnostics);
  }
}
```

### 3. Sprotty Integration for Diagrams

```typescript
// packages/monaco-rcl/src/diagram-provider.ts
export class RclDiagramProvider {
  async generateDiagram(ast: ASTNode): Promise<SGraph> {
    const flows = extractFlows(ast);
    return this.flowsToSprottyModel(flows);
  }
  
  private flowsToSprottyModel(flows: Flow[]): SGraph {
    // Convert RCL flows to Sprotty graph model
  }
}
```

## Testing Strategy

### 1. Unit Tests - Test in Isolation
```typescript
describe('Parser', () => {
  it('should parse valid RCL', async () => {
    const parser = new MockParser();  // For unit tests only
    const result = await parser.parse('agent Test\n  displayName: "Test"');
    expect(result.errors).toHaveLength(0);
  });
});
```

### 2. Integration Tests - Test Real Components
```typescript
describe('Parser Integration', () => {
  it('should parse with real tree-sitter', async () => {
    const parser = ParserFactory.create({ platform: 'node' });
    const result = await parser.parse('agent Test\n  displayName: "Test"');
    expect(result.errors).toHaveLength(0);
  });
});
```

### 3. E2E Tests - Test Full Pipeline
```typescript
describe('Compilation E2E', () => {
  it('should compile RCL to JSON', async () => {
    const pipeline = new CompilationPipeline();
    const result = await pipeline.compile({
      input: 'examples/coffee-shop.rcl',
      output: 'output/coffee-shop.json'
    });
    expect(result.success).toBe(true);
  });
});
```

## Migration Order

1. **Week 1**: Core interfaces + Parser refactoring
2. **Week 2**: Validation pipeline + Error handling
3. **Week 3**: Compilation pipeline + File system abstraction
4. **Week 4**: Monaco integration + Web support
5. **Week 5**: Testing + Documentation
6. **Week 6**: Migration completion + Cleanup

## Success Metrics

1. **No Silent Failures**: All errors are reported with clear messages
2. **Type Safety**: No more 'any' types in public APIs
3. **Platform Independence**: Same code runs in Node.js and browser
4. **Clear Architecture**: Each package has single responsibility
5. **Reliable Tests**: Integration tests catch real issues
6. **Developer Experience**: Clear APIs with good error messages

## Next Step

Start with Phase 0 - fix the immediate error propagation issues to stop the bugs, then proceed with the systematic refactoring.