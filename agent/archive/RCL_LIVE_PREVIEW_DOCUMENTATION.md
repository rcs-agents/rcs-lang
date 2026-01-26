# RCL Live Preview System - Complete Documentation

## 🎯 Overview

The RCL Live Preview System is a comprehensive VS Code extension feature that provides real-time compilation previews, interactive flow diagrams, and semantic validation for Rich Communication Language (RCL) files. This system transforms the RCL development experience with professional-grade tooling.

## 📋 Table of Contents

1. [Features Overview](#features-overview)
2. [Installation & Setup](#installation--setup)
3. [User Guide](#user-guide)
4. [Technical Architecture](#technical-architecture)
5. [API Reference](#api-reference)
6. [Development Guide](#development-guide)
7. [Troubleshooting](#troubleshooting)
8. [Performance Considerations](#performance-considerations)

---

## 🌟 Features Overview

### Phase 1: Foundation & JSON Preview ✅
- **Custom JSON Tree Viewer**: Collapsible/expandable JSON visualization with syntax highlighting
- **Real-time Compilation**: Automatic file watching with 300ms debounced updates
- **Export Functionality**: Support for both JavaScript and JSON output formats
- **Error Handling**: Graceful compilation error display with detailed messages
- **VS Code Integration**: Native webview provider with secure message passing

### Phase 2: Flow Visualization ✅
- **Mermaid.js Integration**: Professional flow diagram rendering with automatic layout
- **Interactive Diagrams**: Color-coded nodes (🟢 start, 🔵 message, 🔴 final)
- **Flow Selection**: Toolbar dropdown + "All Flows" combined view
- **Cursor Following**: Automatic flow selection based on editor cursor position
- **Multi-Flow Support**: Subgraph rendering for complex agent definitions

### Phase 3: Semantic Validation ✅
- **Schema Compliance**: Integrated RCS Business Messaging schema validation
- **Language-Specific Validation**: RCL syntax and semantic rule checking
- **Real-time Diagnostics**: Line-precise error highlighting with actionable messages
- **Cross-Reference Validation**: Unused message detection and undefined state warnings

---

## 🛠️ Installation & Setup

### Prerequisites
- Visual Studio Code v1.75.0 or higher
- Node.js v16.0.0 or higher
- RCL Language Support extension

### Extension Installation
1. Install the RCL Language Support extension from VS Code marketplace
2. The preview system is automatically available for all `.rcl` files
3. No additional configuration required

### CLI Integration
The preview system integrates with the RCL CLI compiler:
```bash
# Install CLI dependencies (if not already installed)
cd packages/cli
npm install

# Test CLI compilation
node demo.js example.rcl --format json --pretty
```

---

## 📖 User Guide

### Opening the Live Preview

**Method 1: Right-click Context Menu**
1. Right-click any `.rcl` file in the Explorer
2. Select "Show Live Preview"
3. Preview panel opens automatically

**Method 2: Command Palette**
1. Open an `.rcl` file in the editor
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type "RCL: Show Live Preview"
4. Press Enter

**Method 3: Editor Context Menu**
1. Right-click inside an open `.rcl` file
2. Select "Show Live Preview"

### Preview Panel Interface

```
┌─────────────────────────────────────────┐
│ [🔄] [MainFlow ▼] [All Flows] [📍] [📤] │ ← Toolbar
├─────────────────────────────────────────┤
│ [JSON Output] [Flow Diagram]            │ ← Tabs
├─────────────────────────────────────────┤
│                                         │
│    ┌─────────┐     ┌─────────────┐     │
│    │ :start  │────►│ MsgWelcome  │     │ ← Flow Diagram
│    └─────────┘     └─────────────┘     │
│                           │             │
│                    ┌─────────────┐     │
│                    │   :end      │     │
│                    └─────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

### Toolbar Controls

| Button | Function | Description |
|--------|----------|-------------|
| 🔄 | Refresh | Manual compilation trigger |
| Dropdown | Flow Selector | Choose specific flow to view |
| All Flows | Combined View | Show all flows in one diagram |
| 📍 | Cursor Following | Toggle automatic flow selection |
| 📤 | Export | Save compiled output (JS/JSON) |

### Using Cursor Following

1. **Enable**: Click the 📍 button (it will highlight when active)
2. **Navigate**: Move your cursor through the RCL file
3. **Auto-switch**: Preview automatically selects the flow at cursor position
4. **Visual Feedback**: Cursor position notifications appear briefly

### Export Options

**Quick Export**:
- Click 📤 JSON or 📤 JS buttons for immediate export

**Advanced Export**:
1. Use Command Palette: "RCL: Export Compiled"
2. Choose format (JavaScript or JSON)
3. File saved to same directory as source

---

## 🏗️ Technical Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Extension     │    │  Webview Panel  │    │  CLI Compiler   │
│   Host          │◄──►│                 │    │                 │
│                 │    │  ┌───────────┐  │    │                 │
│ • File Watcher  │    │  │JSON View  │  │◄───│ • Messages      │
│ • Commands      │    │  └───────────┘  │    │ • Flows         │
│ • Cursor Track  │    │  ┌───────────┐  │    │ • Agent Config  │
│ • Schema Valid  │    │  │Flow View  │  │    │ • Validation    │
│                 │    │  └───────────┘  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### File Structure

```
apps/extension/
├── client/src/
│   ├── extension.ts              # Main extension entry point
│   ├── previewProvider.ts        # Webview provider implementation
│   └── resources/
│       ├── preview.css          # Webview styling
│       ├── preview.js           # Webview JavaScript logic
│       └── mermaid.min.js       # Mermaid.js library (2.8MB)
├── server/                      # Language server (existing)
└── package.json                 # Extension manifest

packages/
├── cli/                         # RCL compiler
├── parser/                      # Core parsing + schema validation
└── language-service/            # LSP providers + semantic validation
```

### Data Flow

1. **File Change Detection**
   ```
   User edits .rcl file → File watcher triggers → Debounced compilation (300ms)
   ```

2. **Compilation Pipeline**
   ```
   RCL source → CLI compiler → JSON output → Webview update → Diagram rendering
   ```

3. **Cursor Following**
   ```
   Cursor move → Flow detection → State update → Diagram selection → Visual feedback
   ```

### Message Passing Protocol

**Extension Host → Webview**:
```typescript
interface ExtensionMessage {
  type: 'updateData' | 'cursorMove' | 'compile' | 'export';
  data: {
    messages: Record<string, AgentMessage>;
    flows: Record<string, XStateConfig>;
    agent: AgentConfig;
    selectedFlow?: string;
    compilationErrors?: string[];
  };
}
```

**Webview → Extension Host**:
```typescript
interface WebviewMessage {
  type: 'ready' | 'selectFlow' | 'export' | 'refresh' | 'toggleCursorFollowing';
  data: any;
}
```

---

## 🔧 API Reference

### RCLPreviewProvider

The main webview provider class managing the preview system.

```typescript
class RCLPreviewProvider implements vscode.WebviewViewProvider {
  // Core methods
  resolveWebviewView(webviewView: vscode.WebviewView): void
  showPreview(document: vscode.TextDocument): Promise<void>
  
  // Internal compilation
  private async _compileRCLDocument(document: vscode.TextDocument): Promise<CompileResult>
  private _handleCursorMove(): void
  private _detectFlowAtCursor(line: number): string | null
}
```

### Flow-to-Mermaid Conversion

Converts XState flow configurations to Mermaid.js flowchart syntax:

```typescript
function convertFlowToMermaid(flowId: string, flow: XStateConfig): string {
  // Returns Mermaid syntax like:
  // flowchart TD
  //   Start([Start]) --> start
  //   start[start] --> MsgWelcome
  //   MsgWelcome[MsgWelcome] --> end
  //   end([end])
}
```

### Semantic Validation Integration

```typescript
class SemanticValidator {
  validateDocument(content: string, uri: string): SemanticValidationResult
  
  // Validation categories
  private validateAgentSection(agent: any): SemanticValidationResult
  private validateMessagesSection(messages: any[]): SemanticValidationResult  
  private validateFlowsSection(flows: any[]): SemanticValidationResult
  private validateCrossReferences(structure: any): SemanticValidationResult
}
```

---

## 👨‍💻 Development Guide

### Building the Extension

```bash
# Build all packages
cd /home/ubuntu/tree-sitter/apps/extension
npm run compile

# Watch mode for development
npm run watch
```

### Adding New Features

**1. Webview Features** (preview.js):
```javascript
// Add new message handlers
function setupMessageHandlers() {
  window.addEventListener('message', event => {
    switch (event.data.type) {
      case 'your_new_feature':
        handleNewFeature(event.data);
        break;
    }
  });
}
```

**2. Extension Commands** (extension.ts):
```typescript
// Register new commands
const newCommand = commands.registerCommand('rcl.newFeature', async () => {
  // Implementation
});
context.subscriptions.push(newCommand);
```

**3. Styling** (preview.css):
```css
/* Follow existing patterns */
.new-feature {
  background: var(--vscode-background);
  color: var(--vscode-foreground);
  border: 1px solid var(--vscode-border);
}
```

### Testing Locally

**1. Start Extension Development Host**:
```bash
# In VS Code
F5 → Extension Development Host opens
```

**2. Test with Sample Files**:
```rcl
agent TestAgent
display-name: "Test Agent"

messages
MsgHello: "Hello World!"

flow MainFlow
  start -> MsgHello  
  MsgHello -> end
```

**3. Verify Features**:
- Right-click → "Show Live Preview"
- Toggle cursor following
- Export functionality
- Error handling

### Performance Optimization

**Debouncing Configuration**:
```typescript
private _debouncedCompile() {
  clearTimeout(this._debounceTimer);
  this._debounceTimer = setTimeout(() => {
    this._compileCurrentDocument();
  }, 300); // Adjust timing as needed
}
```

**Memory Management**:
```typescript
public dispose() {
  this._fileWatcher?.dispose();
  clearTimeout(this._debounceTimer);
  // Clean up other resources
}
```

---

## 🔍 Troubleshooting

### Common Issues

**1. Preview Panel Not Opening**
- **Cause**: Extension not activated or RCL file not recognized
- **Solution**: Ensure file has `.rcl` extension and extension is enabled
- **Check**: VS Code Developer Tools for console errors

**2. Compilation Errors**
- **Cause**: RCL CLI not found or syntax errors in file
- **Solution**: Verify CLI installation and file syntax
- **Debug**: Check extension output panel for detailed errors

**3. Mermaid Diagrams Not Rendering**
- **Cause**: Mermaid.js not loaded or syntax errors in generated diagram
- **Solution**: Refresh preview or check browser console in webview
- **Workaround**: Switch to JSON tab and back to Flow tab

**4. Cursor Following Not Working**
- **Cause**: Flow detection regex not matching or compilation failed
- **Solution**: Ensure proper flow syntax and successful compilation
- **Debug**: Toggle cursor following off/on to reset state

### Debug Information

**Extension Logs**:
```typescript
// Enable in extension development
console.log('Preview state:', this._state);
console.log('Cursor position:', position);
console.log('Detected flow:', flowId);
```

**Webview Console**:
```javascript
// Access via Developer Tools → Console
window.rclPreview.getCurrentState(); // Current state
window.rclPreview.refresh();         // Manual refresh
```

### Error Codes

| Code | Category | Description | Resolution |
|------|----------|-------------|------------|
| `semantic.invalid_agent_name` | Semantic | Agent name format error | Use PascalCase, alphanumeric + underscore |
| `semantic.duplicate_message_id` | Semantic | Duplicate message ID | Rename one of the duplicate messages |
| `semantic.unreachable_state` | Flow | Unreachable flow state | Add transition path from start |
| `schema.contentMessage_text` | Schema | Text length exceeded | Reduce message text to ≤2048 characters |
| `compilation.parse_error` | Compilation | Failed to parse RCL | Check RCL syntax errors |

---

## ⚡ Performance Considerations

### File Watching Optimization

```typescript
// Optimized debouncing prevents excessive compilation
private _debouncedCompile() {
  clearTimeout(this._debounceTimer);
  this._debounceTimer = setTimeout(() => {
    this._compileCurrentDocument();
  }, 300); // Sweet spot: responsive but not excessive
}
```

### Memory Usage

- **Mermaid.js Library**: 2.8MB (loaded once per webview)
- **JSON Tree State**: Minimal DOM manipulation with virtual scrolling
- **File Watching**: Single watcher per extension instance
- **Cursor Tracking**: Throttled to prevent performance impact

### Large File Handling

```typescript
// Temporary file strategy for large RCL files
const tempPath = path.join(require('os').tmpdir(), `rcl-preview-${Date.now()}.rcl`);
await fs.promises.writeFile(tempPath, document.getText(), 'utf-8');
// Compile from temp file to avoid editor conflicts
```

### Scaling Considerations

- **Multiple Files**: Each file gets independent compilation
- **Complex Flows**: Mermaid handles layout optimization automatically  
- **Real-time Updates**: Debounced to prevent UI stuttering
- **Error Recovery**: Graceful fallback maintains previous good state

---

## 🚀 Future Enhancements (Phase 3+)

### Planned Features

**Interactive Diagram Editing**:
- Sprotty framework integration for bi-directional editing
- Drag-and-drop flow designer
- Real-time code generation from visual changes

**Advanced Analytics**:
- Flow complexity metrics
- Dead code detection
- Message usage statistics
- Performance bottleneck identification

**Collaboration Features**:
- Shared flow sessions
- Real-time collaborative editing
- Version comparison views

**Export Enhancements**:
- SVG/PNG diagram export
- PDF documentation generation
- Interactive HTML exports

---

## 📄 License & Credits

This RCL Live Preview System is part of the RCL Language Support extension.

**Key Dependencies**:
- **Mermaid.js** v10.6.1 - Flow diagram rendering
- **VS Code API** - Extension host integration
- **TypeScript** - Type-safe development

**Generated with**: [Claude Code](https://claude.ai/code)

---

*Last Updated: December 2024*
*Version: 2.0.0 (Phase 1 & 2 Complete)*