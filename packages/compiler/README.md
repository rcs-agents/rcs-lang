# @rcs-lang/compiler

Modern compilation pipeline for RCL (Rich Communication Language) that transforms RCL source code into executable JavaScript modules and JSON configurations.

## Overview

The RCL Compiler provides a modular, extensible compilation pipeline that:
- Parses RCL source code using the ANTLR-based parser
- Validates syntax and semantics
- Transforms AST into intermediate representations
- Generates multiple output formats (JSON, JavaScript, Mermaid, D2)

## Installation

```bash
npm install @rcs-lang/compiler
```

## Usage

### Basic Compilation

```typescript
import { RCLCompiler } from '@rcs-lang/compiler';

const compiler = new RCLCompiler();

const result = await compiler.compile(`
  agent MyAgent
    displayName: "My Agent"
    
    flow MainFlow
      start: Welcome
      
      on Welcome
        -> End
    
    messages Messages
      text Welcome "Hello!"
`);

if (result.success) {
  console.log(result.output.json);  // JSON output
  console.log(result.output.js);    // JavaScript module
} else {
  console.error(result.diagnostics);
}
```

### Custom Pipeline Configuration

```typescript
import { CompilationPipeline, ParseStage, ValidateStage, TransformStage } from '@rcs-lang/compiler';

const pipeline = new CompilationPipeline([
  new ParseStage(),
  new ValidateStage(),
  new TransformStage(),
  // Add custom stages here
]);

const result = await pipeline.execute({
  source: rclSource,
  uri: 'file:///path/to/file.rcl'
});
```

## Output Formats

### JSON Output
Structured data representation suitable for runtime interpretation:
```json
{
  "agent": {
    "name": "MyAgent",
    "displayName": "My Agent"
  },
  "flows": {
    "MainFlow": {
      "start": "Welcome",
      "states": {...}
    }
  },
  "messages": {
    "Welcome": {
      "type": "text",
      "text": "Hello!"
    }
  }
}
```

### JavaScript Output
ES6 module with CSM (Conversation State Machine) integration:
```javascript
export const agent = {...};
export const flows = {...};
export const messages = {...};

export default { agent, flows, messages };
```

### Diagram Formats
- **Mermaid**: Flow diagrams for documentation
- **D2**: Advanced diagramming with better layout control

## Architecture

The compiler uses a pipeline architecture with distinct stages:

1. **Parse Stage**: Converts source text to AST
2. **Validate Stage**: Checks syntax and semantic rules
3. **Transform Stage**: Converts AST to output format
4. **Generate Stage**: Produces final output files

Each stage can be extended or replaced for custom compilation needs.

## API Reference

### RCLCompiler

Main compiler interface with sensible defaults.

#### Methods
- `compile(source: string, fileName?: string): Promise<CompilationResult>`
- `compileFile(filePath: string): Promise<CompilationResult>`

### CompilationPipeline

Customizable pipeline for advanced use cases.

#### Methods
- `execute(input: ICompilationInput): Promise<Result<ICompilationResult>>`
- `addStage(stage: ICompilationStage): void`

### Generators

- `JavaScriptGenerator` - Generates ES6 modules
- `MermaidGenerator` - Creates Mermaid diagrams
- `D2Generator` - Creates D2 diagrams

## Error Handling

The compiler provides detailed diagnostics:

```typescript
interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  message: string;
  code: string;
  range?: Range;
  source?: string;
}
```

## Contributing

See the main repository README for contribution guidelines.

## License

MIT