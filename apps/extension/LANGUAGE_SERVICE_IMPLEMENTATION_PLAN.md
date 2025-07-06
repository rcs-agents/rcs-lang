# RCL Language Service Implementation Plan

This document provides a detailed implementation plan for each feature outlined in the Language Service Features Checklist.

## Phase 1: Foundation (Weeks 1-3)

### 1.1 Import Resolution System ⚡ CRITICAL
**Status**: Partially implemented (ImportInfo exists but not fully functional)

#### Implementation Steps:
1. **Parser Enhancement**
   - Add ImportStatement parsing to grammar.js
   - Support syntax: `import Path/To/Module [as Alias]`
   - Handle multi-level paths with spaces (e.g., `import My Brand / Samples`)
   
2. **Project Root Detection**
   - Search for `rclconfig.yml` or `config/rcl.yml` up the directory tree
   - Fall back to current file's directory if not found
   - Cache project root per workspace

3. **Import Resolution**
   - Implement case-insensitive path resolution
   - Convert import paths to file paths (append `.rcl`)
   - Handle aliasing and namespace mapping
   - Create ImportResolver class in parser package

4. **Symbol Table**
   - Build workspace-wide symbol table
   - Track exported symbols (flows, messages, agent definitions)
   - Handle import aliases and namespacing
   - Implement circular dependency detection

```typescript
interface ImportResolver {
  resolveImport(importPath: string, fromFile: string): ResolvedImport | null;
  getProjectRoot(filePath: string): string;
  getAllExports(filePath: string): ExportedSymbol[];
}

interface ResolvedImport {
  resolvedPath: string;
  alias?: string;
  exports: ExportedSymbol[];
}
```

### 1.2 Workspace Indexing
**Dependencies**: Import Resolution

#### Implementation Steps:
1. **File Watcher**
   - Watch all `.rcl` files in workspace
   - Track file additions, deletions, modifications
   - Batch updates for performance

2. **Index Database**
   - Create in-memory index of all symbols
   - Store: file path, symbol name, type, range, exports
   - Support fast lookup by name or type

3. **Incremental Updates**
   - Update only affected files on change
   - Propagate changes to dependent files
   - Maintain consistency across imports

```typescript
interface WorkspaceIndex {
  addFile(uri: string, document: RCLDocument): void;
  removeFile(uri: string): void;
  updateFile(uri: string, document: RCLDocument): void;
  findSymbol(name: string, type?: SymbolType): SymbolLocation[];
  getFileSymbols(uri: string): SymbolInfo[];
  getDependents(uri: string): string[]; // Files that import this file
}
```

### 1.3 Incremental Parsing
**Dependencies**: Basic parsing

#### Implementation Steps:
1. **Tree-sitter Integration**
   - Enable tree-sitter's incremental parsing
   - Track document edits and map to tree ranges
   - Reuse unchanged tree nodes

2. **Edit Tracking**
   - Implement TextDocumentContentChangeEvent handling
   - Convert LSP edits to tree-sitter edits
   - Maintain edit history for undo/redo

3. **Performance Optimization**
   - Parse only visible range first
   - Background parse full document
   - Cache frequently accessed nodes

## Phase 2: Code Intelligence (Weeks 4-6)

### 2.1 Go to Definition
**Dependencies**: Import Resolution, Workspace Indexing

#### Implementation Steps:
1. **Local Definitions**
   - Find definition within same file
   - Support: flows, messages, agent properties
   - Handle nested scopes correctly

2. **Cross-file Navigation**
   - Resolve imports to actual files
   - Navigate to imported symbols
   - Support aliased imports

3. **Definition Types**
   - Flow definitions: `flow FlowName`
   - Message definitions: text shortcuts, agent messages
   - Property definitions: agent properties, defaults
   - Import definitions: navigate to imported file

```typescript
class DefinitionProvider {
  async provideDefinition(
    document: TextDocument,
    position: Position
  ): Promise<Definition | null> {
    const symbol = this.getSymbolAtPosition(document, position);
    if (!symbol) return null;
    
    // Check local definitions first
    const localDef = this.findLocalDefinition(document, symbol);
    if (localDef) return localDef;
    
    // Check imported definitions
    const importedDef = await this.findImportedDefinition(document, symbol);
    return importedDef;
  }
}
```

### 2.2 Find All References
**Dependencies**: Go to Definition, Workspace Indexing

#### Implementation Steps:
1. **Reference Collection**
   - Find all occurrences of symbol
   - Include: definitions, references, imports
   - Support renamed/aliased references

2. **Cross-file Search**
   - Search all files that import the symbol
   - Handle transitive imports
   - Optimize with index lookups

3. **Reference Types**
   - Flow references in transitions
   - Message references in flows
   - Import references
   - Property references

### 2.3 Hover Documentation
**Dependencies**: Symbol resolution

#### Implementation Steps:
1. **Documentation Extraction**
   - Parse comments above definitions
   - Support markdown formatting
   - Extract type information

2. **Content Generation**
   - Symbol type and signature
   - Documentation comments
   - Usage examples
   - Related symbols

3. **Rich Content**
   - Syntax highlighting in code blocks
   - Links to definitions
   - Preview of message content

## Phase 3: Completion & Validation (Weeks 7-9)

### 3.1 Context-Aware Completion
**Dependencies**: Workspace Indexing, Import Resolution

#### Implementation Steps:
1. **Completion Contexts**
   - After `flow`: suggest flow names
   - After `->`: suggest state names
   - In imports: suggest available modules
   - In messages: suggest message IDs

2. **Smart Filtering**
   - Filter by context and type
   - Rank by relevance and usage
   - Include snippets for common patterns

3. **Auto-Import**
   - Suggest symbols from other files
   - Add import statement automatically
   - Handle naming conflicts

```typescript
interface CompletionContext {
  type: 'flow' | 'message' | 'import' | 'property' | 'transition';
  prefix: string;
  scope: SymbolScope;
  availableSymbols: Symbol[];
}
```

### 3.2 Semantic Validation
**Dependencies**: Type system, Import Resolution

#### Implementation Steps:
1. **Type Checking**
   - Validate property types
   - Check flow state references
   - Verify message ID uniqueness

2. **Reference Validation**
   - Undefined flow states
   - Missing message definitions
   - Circular dependencies

3. **Business Logic Validation**
   - Flow connectivity (unreachable states)
   - Message template variables
   - Required properties

### 3.3 Quick Fixes
**Dependencies**: Semantic Validation

#### Implementation Steps:
1. **Common Fixes**
   - Add missing imports
   - Create undefined messages/flows
   - Fix typos in references
   - Remove unused imports

2. **Code Actions**
   - Extract flow/message
   - Inline flow/message
   - Convert between message formats

## Phase 4: Formatting & Refactoring (Weeks 10-12)

### 4.1 Document Formatting
**Dependencies**: Parser, AST manipulation

#### Implementation Steps:
1. **Formatting Rules**
   - Consistent indentation (2 spaces)
   - Property alignment
   - Line wrapping for long content
   - Blank line conventions

2. **AST Preservation**
   - Maintain semantic meaning
   - Preserve comments
   - Handle embedded code blocks

3. **Configuration**
   - `.rclformat` configuration file
   - VSCode settings integration
   - Format on save option

### 4.2 Rename Symbol
**Dependencies**: Find All References

#### Implementation Steps:
1. **Validation**
   - Check new name validity
   - Detect naming conflicts
   - Preview changes

2. **Multi-file Edits**
   - Update all references
   - Update imports if needed
   - Maintain aliases

3. **Undo Support**
   - Single undo operation
   - Rollback on error

## Phase 5: RCL-Specific Features (Weeks 13-15)

### 5.1 Flow Visualization
**Dependencies**: Flow parsing, State extraction

#### Implementation Steps:
1. **Flow Graph Generation**
   - Extract states and transitions
   - Generate Mermaid/GraphViz diagrams
   - Support nested flows

2. **Interactive Visualization**
   - Click to navigate to code
   - Highlight current state
   - Show message preview

3. **Export Options**
   - SVG/PNG export
   - Mermaid markdown
   - XState configuration

### 5.2 Message Preview
**Dependencies**: Message parsing, Template rendering

#### Implementation Steps:
1. **Render Engine**
   - Parse message templates
   - Render rich cards
   - Show suggestions/actions

2. **Preview Panel**
   - WebView integration
   - Live updates on edit
   - Platform simulation

3. **Variable Substitution**
   - Sample data generation
   - Variable highlighting
   - Missing variable warnings

## Implementation Timeline

### Month 1: Foundation
- Week 1-2: Import Resolution & Project Structure
- Week 3: Workspace Indexing
- Week 4: Incremental Parsing

### Month 2: Core Features
- Week 5-6: Go to Definition & Find References
- Week 7: Hover & Documentation
- Week 8: Basic Completion

### Month 3: Advanced Features
- Week 9-10: Semantic Validation
- Week 11: Formatting
- Week 12: Quick Fixes

### Month 4: RCL-Specific
- Week 13-14: Flow Visualization
- Week 15: Message Preview
- Week 16: Testing & Polish

## Technical Architecture

### Component Structure
```
packages/
├── parser/
│   ├── import-resolver/
│   ├── incremental-parser/
│   └── ast-utils/
├── language-service/
│   ├── providers/
│   │   ├── completion/
│   │   ├── definition/
│   │   ├── references/
│   │   └── hover/
│   ├── validation/
│   └── workspace-index/
└── cli/
    └── visualization/
```

### Key Interfaces
```typescript
interface LanguageService {
  // Core services
  parser: RCLParser;
  index: WorkspaceIndex;
  resolver: ImportResolver;
  
  // Feature providers
  completion: CompletionProvider;
  definition: DefinitionProvider;
  references: ReferencesProvider;
  hover: HoverProvider;
  validation: ValidationService;
  formatting: FormattingProvider;
  
  // RCL-specific
  flowVisualizer: FlowVisualizer;
  messagePreview: MessagePreviewProvider;
}
```

## Testing Strategy

### Unit Tests
- Parser accuracy for each grammar rule
- Import resolution edge cases
- Symbol table operations
- Each provider in isolation

### Integration Tests
- Multi-file projects
- Complex import graphs
- Large file performance
- Concurrent operations

### End-to-End Tests
- Real RCL projects
- User workflows
- Performance benchmarks
- Memory usage

## Performance Targets

- **Parse Time**: < 50ms for 1000 line file
- **Completion**: < 100ms response time
- **Go to Definition**: < 50ms
- **Find References**: < 200ms for average project
- **Memory**: < 100MB for 10,000 line project

## Next Steps

1. **Implement Import Resolution** (Critical - blocks many features)
2. **Build Workspace Index** (Enables cross-file features)
3. **Add Go to Definition** (Most requested feature)
4. **Implement Completion** (Improves developer experience)

Each phase builds on the previous, with clear dependencies and testable milestones.