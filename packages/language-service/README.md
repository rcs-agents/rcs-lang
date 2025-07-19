# @rcs-lang/language-service

Advanced language service implementation for RCL (Rich Communication Language) providing IDE features like code completion, diagnostics, hover information, and more.

## Overview

This package implements a comprehensive language service that powers the RCL VSCode extension and can be integrated into other editors. It provides intelligent code editing features through the Language Server Protocol (LSP).

## Features

- 🔍 **Go to Definition** - Navigate to symbol definitions
- 📝 **Code Completion** - Context-aware suggestions
- 🔎 **Find References** - Locate all usages of symbols
- 💡 **Hover Information** - Rich tooltips with documentation
- ⚠️ **Diagnostics** - Real-time error and warning detection
- 🔄 **Rename** - Safe symbol renaming across files
- 📑 **Document Symbols** - Outline view support
- 🎨 **Semantic Highlighting** - Enhanced syntax coloring

## Installation

```bash
npm install @rcs-lang/language-service
```

## Usage

### Creating a Language Service

```typescript
import { LanguageService } from '@rcs-lang/language-service';

const service = new LanguageService();

// Initialize with workspace
await service.initialize({
  workspaceFolders: ['/path/to/workspace']
});
```

### Code Completion

```typescript
const completions = await service.getCompletions({
  uri: 'file:///example.rcl',
  position: { line: 10, character: 15 }
});

// Returns context-aware suggestions
completions.items.forEach(item => {
  console.log(item.label, item.kind, item.detail);
});
```

### Diagnostics

```typescript
const diagnostics = await service.getDiagnostics('file:///example.rcl');

diagnostics.forEach(diagnostic => {
  console.log(
    `${diagnostic.severity}: ${diagnostic.message} at line ${diagnostic.range.start.line}`
  );
});
```

### Go to Definition

```typescript
const definition = await service.getDefinition({
  uri: 'file:///example.rcl',
  position: { line: 5, character: 10 }
});

if (definition) {
  console.log(`Definition found at ${definition.uri}`);
}
```

## Architecture

The language service is built on several key components:

### RclProgram
Central coordinator that manages the compilation state and provides unified access to language features.

### WorkspaceIndex
Maintains an index of all symbols across the workspace for fast lookups and cross-file references.

### Providers
Modular providers implement specific language features:
- `CompletionProvider` - Code completion logic
- `DefinitionProvider` - Go to definition functionality
- `HoverProvider` - Hover tooltip content
- `ReferencesProvider` - Find all references
- `RenameProvider` - Symbol renaming

### Validators
- `SemanticValidator` - Type checking and semantic analysis
- `ImportResolver` - Module resolution and validation

## Integration

### VSCode Extension

The language service is designed to work seamlessly with the VSCode Language Server Protocol:

```typescript
import { 
  createConnection,
  TextDocuments,
  ProposedFeatures
} from 'vscode-languageserver/node';

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
const service = new LanguageService();

connection.onCompletion(async (params) => {
  return service.getCompletions(params);
});

connection.onDefinition(async (params) => {
  return service.getDefinition(params);
});
```

### Custom Editor Integration

For other editors, implement the language service API directly:

```typescript
class MyEditorPlugin {
  private service: LanguageService;

  constructor() {
    this.service = new LanguageService();
  }

  async onCursorMove(file: string, line: number, col: number) {
    const hover = await this.service.getHover({
      uri: `file://${file}`,
      position: { line, character: col }
    });
    
    if (hover) {
      this.showTooltip(hover.contents);
    }
  }
}
```

## Configuration

The language service supports various configuration options:

```typescript
interface LanguageServiceConfig {
  // Enable/disable specific features
  features?: {
    completion?: boolean;
    hover?: boolean;
    definition?: boolean;
    references?: boolean;
    rename?: boolean;
    diagnostics?: boolean;
  };
  
  // Validation settings
  validation?: {
    syntaxErrors?: boolean;
    semanticErrors?: boolean;
    styleWarnings?: boolean;
  };
  
  // Performance tuning
  indexing?: {
    maxFileSize?: number;
    excludePatterns?: string[];
  };
}
```

## Contributing

See the main repository README for contribution guidelines.

## License

MIT