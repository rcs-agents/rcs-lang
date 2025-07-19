# Compiler API Reference

## Overview

The `@rcs-lang/compiler` package provides a modern, modular compilation pipeline for RCL. This reference documents all classes, interfaces, and methods available in the public API.

## Core Classes

### RCLCompiler

The main compiler class with sensible defaults for most use cases.

```typescript
class RCLCompiler {
  constructor(options?: CompilerOptions)
  
  compile(source: string, fileName?: string): Promise<CompilationResult>
  compileFile(filePath: string): Promise<CompilationResult>
  compileFromAST(ast: RclFile, fileName?: string): Promise<CompilationResult>
  
  setOptions(options: Partial<CompilerOptions>): void
  getOptions(): CompilerOptions
  
  dispose(): void
}
```

#### Constructor Options

```typescript
interface CompilerOptions {
  // Output configuration
  output?: {
    formats?: OutputFormat[];
    directory?: string;
    fileNames?: {
      json?: string;
      js?: string;
      mermaid?: string;
      d2?: string;
    };
  };
  
  // Parser configuration
  parser?: {
    strictMode?: boolean;
    maxErrors?: number;
    includeComments?: boolean;
  };
  
  // Validation configuration
  validation?: {
    enabled?: boolean;
    strict?: boolean;
    rules?: ValidationRules;
  };
  
  // Generation configuration
  generation?: {
    javascript?: JavaScriptGeneratorOptions;
    mermaid?: MermaidGeneratorOptions;
    d2?: D2GeneratorOptions;
  };
  
  // Performance configuration
  performance?: {
    cache?: boolean;
    parallel?: boolean;
    timeout?: number;
  };
}

type OutputFormat = 'json' | 'js' | 'mermaid' | 'd2';
```

#### Methods

##### compile()

Compiles RCL source code to the specified output formats.

```typescript
async compile(source: string, fileName?: string): Promise<CompilationResult>
```

**Parameters:**
- `source` - RCL source code as string
- `fileName` - Optional file name for diagnostics

**Returns:** Promise resolving to `CompilationResult`

**Example:**
```typescript
const compiler = new RCLCompiler();
const result = await compiler.compile(`
  agent MyAgent
    displayName: "My Agent"
    flow Main
      start: Welcome
    messages Messages
      text Welcome "Hello!"
`);

if (result.success) {
  console.log(result.output.json); // JSON output
  console.log(result.output.js);   // JavaScript output
}
```

##### compileFile()

Compiles an RCL file from the file system.

```typescript
async compileFile(filePath: string): Promise<CompilationResult>
```

**Parameters:**
- `filePath` - Path to RCL file

**Returns:** Promise resolving to `CompilationResult`

**Example:**
```typescript
const result = await compiler.compileFile('./agents/coffee-shop.rcl');
```

##### compileFromAST()

Compiles from an existing AST (skips parsing stage).

```typescript
async compileFromAST(ast: RclFile, fileName?: string): Promise<CompilationResult>
```

**Parameters:**
- `ast` - Pre-parsed AST
- `fileName` - Optional file name for diagnostics

**Returns:** Promise resolving to `CompilationResult`

### CompilationPipeline

Advanced pipeline class for custom compilation workflows.

```typescript
class CompilationPipeline {
  constructor(stages: ICompilationStage[])
  
  execute(input: ICompilationInput): Promise<Result<ICompilationResult>>
  
  addStage(stage: ICompilationStage): void
  removeStage(stageName: string): void
  getStages(): ICompilationStage[]
  
  setParallel(parallel: boolean): void
  setTimeout(timeout: number): void
}
```

#### Usage Example

```typescript
import { 
  CompilationPipeline,
  ParseStage,
  ValidateStage,
  TransformStage,
  GenerateStage
} from '@rcs-lang/compiler';

const pipeline = new CompilationPipeline([
  new ParseStage(),
  new ValidateStage({ strict: true }),
  new TransformStage(),
  new GenerateStage({ formats: ['json', 'js'] })
]);

const result = await pipeline.execute({
  source: rclSource,
  uri: 'file:///path/to/file.rcl'
});
```

## Pipeline Stages

### ICompilationStage

Base interface for all compilation stages.

```typescript
interface ICompilationStage {
  readonly name: string;
  process(input: any): Promise<Result<any>>;
}
```

### ParseStage

Converts RCL source code to AST.

```typescript
class ParseStage implements ICompilationStage {
  constructor(options?: ParseStageOptions)
  
  readonly name: 'parse'
  process(input: ICompilationInput): Promise<Result<ParseOutput>>
}

interface ParseStageOptions {
  parser?: IParser;
  strictMode?: boolean;
  maxErrors?: number;
  includeComments?: boolean;
}

interface ParseOutput {
  ast: RclFile;
  diagnostics: Diagnostic[];
  sourceMap?: SourceMap;
}
```

### ValidateStage

Validates AST for correctness.

```typescript
class ValidateStage implements ICompilationStage {
  constructor(options?: ValidateStageOptions)
  
  readonly name: 'validate'
  process(input: ValidateInput): Promise<Result<ValidateOutput>>
}

interface ValidateStageOptions {
  strict?: boolean;
  rules?: ValidationRules;
  validators?: IValidator[];
}

interface ValidateInput {
  ast: RclFile;
  uri: string;
  source: string;
  diagnostics?: Diagnostic[];
}

interface ValidateOutput extends ValidateInput {
  isValid: boolean;
  validationDiagnostics: Diagnostic[];
}
```

### TransformStage

Transforms AST to intermediate representation.

```typescript
class TransformStage implements ICompilationStage {
  constructor(options?: TransformStageOptions)
  
  readonly name: 'transform'
  process(input: TransformInput): Promise<Result<TransformOutput>>
}

interface TransformStageOptions {
  transformers?: ITransformer[];
  preserveComments?: boolean;
  optimizations?: OptimizationLevel;
}

interface TransformOutput {
  agent: AgentConfig;
  flows: Record<string, FlowConfig>;
  messages: Record<string, MessageConfig>;
  metadata: CompilationMetadata;
}
```

### GenerateStage

Generates final output files.

```typescript
class GenerateStage implements ICompilationStage {
  constructor(options?: GenerateStageOptions)
  
  readonly name: 'generate'
  process(input: GenerateInput): Promise<Result<GenerateOutput>>
}

interface GenerateStageOptions {
  formats: OutputFormat[];
  generators?: Record<OutputFormat, IGenerator>;
  outputDirectory?: string;
}

interface GenerateOutput {
  files: Record<OutputFormat, string>;
  metadata: GenerationMetadata;
}
```

## Generators

### IGenerator

Base interface for output generators.

```typescript
interface IGenerator {
  readonly format: OutputFormat;
  generate(data: ICompilationOutput, fileName: string): Promise<string>;
  configure(options: any): void;
}
```

### JavaScriptGenerator

Generates ES6 modules compatible with @rcs-lang/csm.

```typescript
class JavaScriptGenerator implements IGenerator {
  constructor(options?: JavaScriptGeneratorOptions)
  
  readonly format: 'js'
  generate(output: ICompilationOutput, fileName: string): Promise<string>
  configure(options: JavaScriptGeneratorOptions): void
}

interface JavaScriptGeneratorOptions {
  // Module format
  moduleFormat?: 'es6' | 'cjs' | 'umd';
  
  // Code style
  indentation?: string;
  quotes?: 'single' | 'double';
  semicolons?: boolean;
  
  // Features
  includeComments?: boolean;
  includeSourceMap?: boolean;
  includeTypeDefinitions?: boolean;
  
  // CSM integration
  csmVersion?: string;
  includeHelper?: boolean;
  
  // Optimization
  minify?: boolean;
  removeUnused?: boolean;
}
```

#### Generated JavaScript Structure

```javascript
// Generated by RCL Compiler
// Compatible with @rcs-lang/csm

export const agent = {
  name: "MyAgent",
  displayName: "My Agent",
  // ... agent configuration
};

export const messages = {
  Welcome: {
    type: "text",
    text: "Hello!"
  },
  // ... message definitions
};

export const flows = {
  MainFlow: {
    start: "Welcome",
    states: {
      Welcome: {
        transitions: [
          // ... transitions
        ]
      }
    }
  }
};

export default { agent, messages, flows };

// Helper function for CSM integration
export function createAgent(options) {
  const { ConversationalAgent } = require("@rcs-lang/csm");
  
  const agent = new ConversationalAgent({
    id: agent.name,
    ...options
  });
  
  Object.values(flows).forEach(flow => {
    agent.addFlow(flow);
  });
  
  return agent;
}
```

### MermaidGenerator

Generates Mermaid diagrams for flow visualization.

```typescript
class MermaidGenerator implements IGenerator {
  constructor(options?: MermaidGeneratorOptions)
  
  readonly format: 'mermaid'
  generate(output: ICompilationOutput, fileName: string): Promise<string>
  configure(options: MermaidGeneratorOptions): void
}

interface MermaidGeneratorOptions {
  // Diagram type
  diagramType?: 'flowchart' | 'stateDiagram' | 'graph';
  
  // Layout
  direction?: 'TD' | 'TB' | 'BT' | 'RL' | 'LR';
  
  // Styling
  theme?: 'default' | 'neutral' | 'dark' | 'forest' | 'base';
  
  // Content
  includeMessages?: boolean;
  includeConditions?: boolean;
  showStateDetails?: boolean;
  
  // Formatting
  nodeShape?: 'rect' | 'round' | 'circle' | 'rhombus';
  edgeStyle?: 'solid' | 'dotted' | 'thick';
}
```

### D2Generator

Generates D2 diagrams with advanced layout options.

```typescript
class D2Generator implements IGenerator {
  constructor(options?: D2GeneratorOptions)
  
  readonly format: 'd2'
  generate(output: ICompilationOutput, fileName: string): Promise<string>
  configure(options: D2GeneratorOptions): void
}

interface D2GeneratorOptions {
  // Layout
  layout?: 'dagre' | 'elk' | 'tala';
  
  // Styling
  theme?: 'default' | 'dark' | 'sketch' | 'cool-classics';
  
  // Features
  includeTooltips?: boolean;
  includeLinks?: boolean;
  animate?: boolean;
  
  // Content
  showMessageContent?: boolean;
  showTransitionLabels?: boolean;
  groupByFlow?: boolean;
}
```

## Types and Interfaces

### CompilationResult

Result returned by the main compiler methods.

```typescript
interface CompilationResult {
  success: boolean;
  output?: CompilerOutput;
  diagnostics: Diagnostic[];
  metadata?: CompilationMetadata;
  performance?: PerformanceMetrics;
}

interface CompilerOutput {
  json: string;
  js?: string;
  mermaid?: string;
  d2?: string;
}
```

### ICompilationInput

Input to the compilation pipeline.

```typescript
interface ICompilationInput {
  source: string;
  uri: string;
  ast?: RclFile;
  options?: CompilerOptions;
}
```

### ICompilationOutput

Intermediate compilation output.

```typescript
interface ICompilationOutput {
  agent: AgentConfig;
  messages: Record<string, MessageConfig>;
  flows: Record<string, FlowConfig>;
}

interface AgentConfig {
  name: string;
  displayName?: string;
  config?: Record<string, any>;
  defaults?: Record<string, any>;
}

interface MessageConfig {
  type: MessageType;
  [key: string]: any;
}

interface FlowConfig {
  start: string;
  states: Record<string, StateConfig>;
}

interface StateConfig {
  transitions?: TransitionConfig[];
  actions?: ActionConfig[];
}
```

### Diagnostic

Error and warning information.

```typescript
interface Diagnostic {
  severity: DiagnosticSeverity;
  message: string;
  code?: string;
  source?: string;
  range?: Range;
  relatedInformation?: DiagnosticRelatedInformation[];
  quickFixes?: QuickFix[];
}

type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint';

interface Range {
  start: Position;
  end: Position;
}

interface Position {
  line: number;
  character: number;
}
```

### Result<T>

Generic result type for error handling.

```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string; diagnostics?: Diagnostic[] };

// Utility functions
function ok<T>(data: T): Result<T>;
function err<T>(error: string, diagnostics?: Diagnostic[]): Result<T>;
```

## Error Handling

### CompilationError

Specific error type for compilation failures.

```typescript
class CompilationError extends Error {
  constructor(
    message: string,
    public readonly stage: string,
    public readonly diagnostics: Diagnostic[] = []
  )
  
  readonly name: 'CompilationError'
}
```

### Error Categories

```typescript
enum ErrorCategory {
  SYNTAX = 'syntax',
  SEMANTIC = 'semantic',
  VALIDATION = 'validation',
  GENERATION = 'generation',
  IO = 'io',
  INTERNAL = 'internal'
}
```

## Utilities

### Factory Functions

```typescript
// Create compiler with presets
function createStrictCompiler(): RCLCompiler;
function createLenientCompiler(): RCLCompiler;
function createDebugCompiler(): RCLCompiler;

// Create pipeline with presets
function createBasicPipeline(): CompilationPipeline;
function createFullPipeline(): CompilationPipeline;
function createValidationPipeline(): CompilationPipeline;
```

### Configuration Helpers

```typescript
function mergeCompilerOptions(
  base: CompilerOptions,
  override: Partial<CompilerOptions>
): CompilerOptions;

function validateCompilerOptions(options: CompilerOptions): ValidationResult;

function getDefaultCompilerOptions(): CompilerOptions;
```

### Performance Monitoring

```typescript
interface PerformanceMetrics {
  totalTime: number;
  stageMetrics: Record<string, StageMetrics>;
  memoryUsage?: MemoryUsage;
}

interface StageMetrics {
  duration: number;
  inputSize: number;
  outputSize: number;
  cacheHit?: boolean;
}

function measurePerformance<T>(
  operation: () => Promise<T>,
  label: string
): Promise<{ result: T; metrics: PerformanceMetrics }>;
```

## Advanced Usage

### Custom Stages

```typescript
import { ICompilationStage, Result, ok, err } from '@rcs-lang/compiler';

class CustomOptimizationStage implements ICompilationStage {
  readonly name = 'custom-optimization';
  
  async process(input: any): Promise<Result<any>> {
    try {
      // Custom optimization logic
      const optimized = this.optimize(input);
      return ok(optimized);
    } catch (error) {
      return err(`Optimization failed: ${error.message}`);
    }
  }
  
  private optimize(input: any): any {
    // Implementation
  }
}

// Use custom stage
const pipeline = new CompilationPipeline([
  new ParseStage(),
  new ValidateStage(),
  new CustomOptimizationStage(),
  new TransformStage(),
  new GenerateStage()
]);
```

### Custom Generators

```typescript
import { IGenerator, ICompilationOutput } from '@rcs-lang/compiler';

class CustomGenerator implements IGenerator {
  readonly format = 'custom' as const;
  
  async generate(
    output: ICompilationOutput, 
    fileName: string
  ): Promise<string> {
    // Custom generation logic
    return this.createCustomOutput(output);
  }
  
  configure(options: any): void {
    // Configuration logic
  }
  
  private createCustomOutput(output: ICompilationOutput): string {
    // Implementation
  }
}

// Register custom generator
const compiler = new RCLCompiler({
  generation: {
    custom: new CustomGenerator()
  }
});
```

### Plugin System

```typescript
interface CompilerPlugin {
  name: string;
  install(compiler: RCLCompiler): void;
  uninstall?(compiler: RCLCompiler): void;
}

class MyPlugin implements CompilerPlugin {
  name = 'my-plugin';
  
  install(compiler: RCLCompiler) {
    // Extend compiler functionality
  }
}

// Use plugin
const compiler = new RCLCompiler();
compiler.use(new MyPlugin());
```