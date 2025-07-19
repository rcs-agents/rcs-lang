# Interactive Diagram Feature - Complete Code Flow Documentation

## Overview

The Interactive Diagram feature allows users to visualize RCL flows as interactive diagrams. This document traces the complete code flow from command execution to diagram rendering.

## Command Flow Overview

```
User runs "RCL: Open Interactive Diagram"
  ↓
extension.ts: openInteractiveDiagram()
  ↓
interactiveDiagramProvider.ts: openInteractiveDiagram()
  ↓
_loadModelFromDocument()
  ↓
_compileRCLDocument() → compilationService.compileFile()
  ↓
RclProgram.compileFile() (language-service)
  ↓
_convertToSprottyModel()
  ↓
Webview creation and HTML generation
  ↓
Interactive diagram rendered
```

## Detailed Flow Analysis

### 1. Command Registration and Execution

**File**: `client/src/extension.ts:110-116`

```typescript
const openInteractiveDiagramCommand = commands.registerCommand(
  'rcl.openInteractiveDiagram',
  async (uri?: Uri) => {
    await openInteractiveDiagram(uri, interactiveDiagramProvider);
  },
);
```

**Command Handler**: `client/src/extension.ts:366-397`

```typescript
async function openInteractiveDiagram(uri?: Uri, diagramProvider?: any): Promise<void>
```

**Responsibilities:**
- Validates target file (must be .rcl)
- Gets document URI from active editor or parameter
- Calls diagram provider to open diagram
- Handles errors and shows user feedback

**Key Error Points:**
- No active RCL file
- Invalid file type
- Document loading failures

### 2. Diagram Provider Initialization

**File**: `client/src/interactiveDiagramProvider.ts:101-148`

```typescript
public async openInteractiveDiagram(document?: vscode.TextDocument)
```

**Responsibilities:**
- Creates or reveals webview panel
- Sets up webview configuration
- Establishes message handling
- Loads model from document

**Configuration:**
- Webview type: `rclInteractiveDiagram`
- Scripts enabled: `true`
- Context retention: `true`
- Local resource roots: Extension URI

### 3. Document Compilation Process

**File**: `client/src/interactiveDiagramProvider.ts:150-180`

```typescript
private async _loadModelFromDocument()
```

**Flow:**
1. **Compilation**: `_compileRCLDocument()` → `CompilationService.compileFile()`
2. **Conversion**: `_convertToSprottyModel()` - Transforms compiled data to visual model
3. **Position Mapping**: `_buildNodePositionMap()` - Creates cursor-to-node mapping
4. **Webview Update**: `_updateWebview()` - Sends data to webview

#### 3.1 RCL Document Compilation

**File**: `client/src/interactiveDiagramProvider.ts:476-501`

```typescript
private async _compileRCLDocument(document: vscode.TextDocument)
```

**Uses**: `client/src/compilationService.ts:19-39`

```typescript
async compileFile(uri: vscode.Uri): Promise<CompilationResult>
```

**Critical Dependencies:**
- `@rcs-lang/language-service` package
- `RclProgram` class
- Workspace folder detection

**POTENTIAL ISSUE LOCATION**: This is where diagnostics are generated!

**Compilation Process:**
1. Gets workspace folder
2. Creates or reuses `RclProgram` instance
3. Calls `program.compileFile(uri.fsPath)`
4. Updates VS Code diagnostics collection
5. Returns compilation result

#### 3.2 Model Conversion to Sprotty Format

**File**: `client/src/interactiveDiagramProvider.ts:239-319`

```typescript
private _convertToSprottyModel(compiledData: any): Record<string, RCLFlowModel>
```

**Process:**
1. **Flow Processing**: Iterates through compiled flows
2. **Node Layout**: `_layoutFlowNodes()` - Hierarchical positioning
3. **Node Creation**: Converts states to visual nodes
4. **Edge Creation**: Converts transitions to visual edges
5. **Metadata Enhancement**: Adds RCL-specific properties

### 4. Webview Content Generation

**File**: `client/src/interactiveDiagramProvider.ts:769-845`

```typescript
private _getHtmlForWebview(webview: vscode.Webview): string
```

**Generated Resources:**
- HTML structure with toolbar, sidebar, diagram container
- CSS from `client/resources/interactive-diagram.css`
- JavaScript from `client/resources/interactive-diagram.js`
- CSP (Content Security Policy) configuration

### 5. Interactive Features

#### 5.1 Webview ↔ Extension Communication

**Messages FROM Webview TO Extension:**
- `ready` - Webview loaded
- `nodeCreated`, `nodeDeleted`, `nodeUpdated` - Node modifications
- `edgeCreated`, `edgeDeleted` - Edge modifications
- `modelChanged` - Complete model updates
- `nodeSelected` - Node selection for cursor sync

**Messages FROM Extension TO Webview:**
- `updateModel` - Send diagram data
- `setActiveFlow` - Switch active flow
- `highlightNode` - Highlight node from cursor

#### 5.2 Cursor Synchronization

**File**: `client/src/interactiveDiagramProvider.ts:77-99`

```typescript
public async syncCursorPosition(document: vscode.TextDocument, position: vscode.Position)
```

**File**: `client/src/interactiveDiagramProvider.ts:182-237`

```typescript
private _buildNodePositionMap()
```

**Features:**
- Maps document positions to diagram nodes
- Highlights diagram nodes when cursor moves
- Jumps to document position when diagram node selected

#### 5.3 Live Code Generation

**File**: `client/src/interactiveDiagramProvider.ts:631-654`

```typescript
private async _generateCodeFromModel()
```

**Process:**
1. Converts diagram model back to RCL code
2. Updates document with generated code
3. Maintains document synchronization

## Critical Points for Testing

### 1. Compilation Service Issues

**Location**: `client/src/compilationService.ts:33`
```typescript
const result = await program.compileFile(uri.fsPath);
```

**Potential Problems:**
- Language service compilation failures
- Diagnostic generation during compilation
- Workspace folder detection issues

### 2. Model Conversion Issues

**Location**: `client/src/interactiveDiagramProvider.ts:161`
```typescript
const diagramModels = this._convertToSprottyModel(compiledData.data);
```

**Potential Problems:**
- Invalid compiled data structure
- Missing flow or state data
- Conversion errors for complex RCL features

### 3. Webview Resource Loading

**Location**: `client/src/interactiveDiagramProvider.ts:771-776`
```typescript
const styleUri = webview.asWebviewUri(/* ... */);
const scriptUri = webview.asWebviewUri(/* ... */);
```

**Potential Problems:**
- Missing resource files
- CSP (Content Security Policy) violations
- Resource URI generation failures

### 4. Position Mapping Issues

**Location**: `client/src/interactiveDiagramProvider.ts:195-236`

**Potential Problems:**
- Regex pattern mismatches
- Line position calculation errors
- State/transition detection failures

## Dependencies

### External Packages
- `@rcs-lang/language-service` - Core compilation logic
- VS Code API - Webview, diagnostics, workspace
- Node.js modules - fs, path, child_process

### Internal Resources
- `client/resources/interactive-diagram.css`
- `client/resources/interactive-diagram.js`
- `client/src/utils.ts` - Version and build utilities

## Error Handling Points

### 1. Document Loading
- File not found
- Permission issues
- Invalid RCL syntax

### 2. Compilation
- Language service failures
- Workspace detection
- Diagnostic generation

### 3. Model Conversion
- Invalid data structures
- Missing required properties
- Type conversion errors

### 4. Webview
- Resource loading failures
- JavaScript execution errors
- Message passing failures

## Performance Considerations

### 1. Compilation Caching
- Programs cached per workspace
- Avoids recompilation for same files

### 2. Position Map Building
- Regex-based parsing (performance risk)
- Should be replaced with AST parsing

### 3. Webview Retention
- Context retained when hidden
- Memory usage considerations

## Security Considerations

### 1. Content Security Policy
- Scripts restricted to nonce
- External resources blocked
- Unsafe-eval allowed for Sprotty

### 2. Resource Access
- Local resources only from extension URI
- Webview sandboxing

## Next Steps for Investigation

1. **Test compilation service with coffee-shop.rcl**
2. **Verify model conversion produces valid Sprotty data**
3. **Check webview resource loading**
4. **Test position mapping accuracy**
5. **Verify message passing between webview and extension**