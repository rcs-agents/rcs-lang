# Sprotty Interactive Diagram Editor - Implementation Plan

## 🎯 Overview

Create a separate interactive diagram editor using Eclipse Sprotty framework for bi-directional editing of RCL flows. This will complement the existing Mermaid.js read-only diagrams with full editing capabilities.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Extension     │    │ Sprotty Webview │    │  RCL Compiler   │
│   Host          │◄──►│                 │    │                 │
│                 │    │ ┌─────────────┐ │    │                 │
│ • Commands      │    │ │ Diagram     │ │◄───│ • Flow Parsing  │
│ • File Sync     │    │ │ Editor      │ │    │ • Code Gen      │
│ • Model Mgmt    │    │ └─────────────┘ │    │ • Validation    │
│                 │    │ ┌─────────────┐ │    │                 │
│                 │    │ │ Property    │ │    │                 │
│                 │    │ │ Panel       │ │    │                 │
│                 │    │ └─────────────┘ │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 Dependencies

```json
{
  "sprotty": "^1.0.0",
  "sprotty-vscode": "^1.0.0", 
  "sprotty-vscode-webview": "^1.0.0",
  "inversify": "^6.0.1",
  "reflect-metadata": "^0.1.13"
}
```

## 🔧 Component Design

### 1. RCL Node Types

```typescript
// Message Node
interface RCLMessageNode extends SNode {
  type: 'message';
  messageId: string;
  text: string;
  messageType: 'text' | 'rich_card' | 'transactional';
  suggestions?: Suggestion[];
}

// Flow Control Nodes
interface RCLStartNode extends SNode {
  type: 'start';
  flowId: string;
}

interface RCLEndNode extends SNode {
  type: 'end';
  flowId: string;
}

// Transition Edge
interface RCLTransitionEdge extends SEdge {
  type: 'transition';
  trigger?: string;
  conditions?: string[];
}
```

### 2. Visual Design

```css
/* Message Nodes */
.message-node {
  fill: #2196F3;
  stroke: #1976D2;
  rx: 8px;
  ry: 8px;
}

.message-node.selected {
  stroke: #FFC107;
  stroke-width: 3px;
}

/* Start/End Nodes */
.start-node {
  fill: #4CAF50;
  stroke: #45a049;
}

.end-node {
  fill: #f44336;
  stroke: #da190b;
}

/* Edges */
.transition-edge {
  stroke: #666;
  stroke-width: 2px;
  marker-end: url(#arrowhead);
}
```

### 3. Editing Operations

**Node Operations**:
- Create message node (drag from palette)
- Edit message properties (double-click)
- Delete nodes (delete key)
- Move nodes (drag)

**Edge Operations**:
- Connect nodes (drag from connection point)
- Edit transition triggers
- Delete connections

**Flow Operations**:
- Add/remove flows
- Set initial state
- Validate flow completeness

## 📋 Implementation Phases

### Phase 3.1: Foundation Setup ⏳
- Install Sprotty dependencies
- Create InteractiveDiagramProvider
- Set up basic webview with Sprotty runtime
- Add new command: "RCL: Open Interactive Diagram"

### Phase 3.2: RCL Model Integration ⏳
- Define RCL-specific node types and views
- Create model generator from RCL AST
- Implement basic diagram rendering
- Add node palette with RCL elements

### Phase 3.3: Interactive Editing ⏳
- Enable node creation and deletion
- Add connection creation tools
- Implement property editing panel
- Add validation and error highlighting

### Phase 3.4: Bi-directional Sync ⏳
- Code generation from diagram changes
- Real-time file updates
- Conflict resolution
- Undo/redo system

## 🎨 User Experience

### Toolbar Layout
```
┌──────────────────────────────────────────────────────────┐
│ [📄] [💾] [↶] [↷] │ [➕] [🔗] [✏️] [🗑️] │ [▶️] [🔍] [⚙️] │
└──────────────────────────────────────────────────────────┘
  File Ops           Edit Tools          View Controls
```

### Palette Design
```
┌─────────────────┐
│   Node Palette  │
├─────────────────┤
│ 🟢 Start        │
│ 📝 Message      │
│ 🔴 End          │
│ ⭐ Rich Card    │
│ 🔄 Condition    │
└─────────────────┘
```

### Property Panel
```
┌─────────────────────────┐
│     Properties          │
├─────────────────────────┤
│ Message ID: [MsgHello ] │
│ Text: [Hello World!   ] │
│ Type: [Text     ▼]      │
│ ┌─ Suggestions ───────┐ │
│ │ + Add Suggestion    │ │
│ └─────────────────────┘ │
│ [Apply] [Cancel]        │
└─────────────────────────┘
```

## 🔄 Data Flow

### Diagram → Code
```
User edits diagram
    ↓
Sprotty actions generated
    ↓
Model updates applied
    ↓
RCL code regenerated
    ↓
File updated in editor
```

### Code → Diagram
```
User edits RCL file
    ↓
File change detected
    ↓
RCL parsed to model
    ↓
Diagram model updated
    ↓
Visual refresh triggered
```

## 🧪 Testing Strategy

### Unit Tests
- Model transformation tests
- Code generation tests
- Validation rule tests

### Integration Tests
- Bi-directional sync tests
- File watching tests
- Undo/redo tests

### User Acceptance Tests
- Drag-and-drop workflows
- Property editing flows
- Error handling scenarios

## 🚀 Success Metrics

1. **Usability**: Users can create flows 50% faster than text editing
2. **Reliability**: Bi-directional sync maintains consistency 99.9% of time
3. **Performance**: Diagrams render/update in <200ms for typical flows
4. **Adoption**: 30% of RCL developers use interactive editor within 3 months

## 🔮 Future Enhancements

### Advanced Features
- Multi-user collaborative editing
- Flow templates and snippets
- Advanced layout algorithms
- Integration with version control
- Flow simulation and testing
- Export to various formats

### AI Integration
- Intelligent flow suggestions
- Automatic layout optimization
- Natural language to flow conversion
- Flow pattern recognition

This implementation will provide RCL developers with a modern, visual approach to building conversation flows while maintaining full code-level control and integration.