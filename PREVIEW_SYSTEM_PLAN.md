# RCL Live Preview System - Implementation Plan

## Overview
Create a comprehensive live preview system for RCL files with JSON compilation output and interactive flow diagrams.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Extension     │    │  Webview Panel  │    │  CLI Compiler   │
│   Host          │◄──►│                 │    │                 │
│                 │    │  ┌───────────┐  │    │                 │
│ • File Watcher  │    │  │JSON View  │  │◄───│ • Messages      │
│ • Commands      │    │  └───────────┘  │    │ • Flows         │
│ • Cursor Track  │    │  ┌───────────┐  │    │ • Agent Config  │
│                 │    │  │Flow View  │  │    │                 │
│                 │    │  └───────────┘  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Phase 1: Foundation & JSON Preview

### 1.1 Extension Commands
- `RCL: Show Preview` - Open live preview panel
- `RCL: Show JSON Output` - Compile and show JSON
- `RCL: Export Compiled` - Save compilation output

### 1.2 Webview Panel Setup
- Custom webview provider with state management
- Hot reload support during development
- Proper lifecycle management
- Message passing API between extension and webview

### 1.3 JSON Visualization
**Tool Choice: react-json-view**
- Proven library with excellent VS Code integration
- Collapsible tree view with search
- Syntax highlighting and copy functionality
- Theme support (dark/light mode)

```typescript
interface JSONPreviewState {
  messages: Record<string, AgentMessage>;
  flows: Record<string, XStateConfig>;
  agent: AgentConfig;
  selectedFlow?: string;
  compilationErrors?: string[];
}
```

## Phase 2: Flow Visualization

### 2.1 Flow Diagram Library
**Primary Choice: Mermaid.js**
- Wide adoption and VS Code ecosystem support
- Good balance of features vs complexity
- Automatic layout with customization options
- Export capabilities (SVG, PNG)

**Fallback: D3.js + Dagre**
- More customization if Mermaid limitations hit
- Better performance for large flows
- Custom RCL-specific node types

### 2.2 Flow Selection UI
```
┌─────────────────────────────────────────┐
│ [All Flows] [MainFlow ▼] [🔄] [⚙️] [📤] │ ← Toolbar
├─────────────────────────────────────────┤
│                                         │
│    ┌─────────┐     ┌─────────────┐     │
│    │ :start  │────►│ MsgWelcome  │     │
│    └─────────┘     └─────────────┘     │
│                           │             │
│                    ┌─────────────┐     │
│                    │MsgCircular  │     │
│                    │World        │     │
│                    └─────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

**Toolbar Features:**
- Flow selector dropdown
- "All Flows" combined view option
- Refresh button for manual updates
- Settings for layout options
- Export button (SVG/PNG)

### 2.3 Cursor Following
```typescript
interface CursorFollowingConfig {
  enabled: boolean;
  autoFocus: boolean;
  highlightDuration: number;
}
```

## Phase 3: Real-time Synchronization

### 3.1 File Watching & Updates
```typescript
class RCLPreviewProvider {
  private fileWatcher: FileSystemWatcher;
  private debounceTimer: NodeJS.Timeout;
  
  private async onFileChange(uri: Uri) {
    // Debounce updates (300ms)
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.recompileAndUpdate(uri);
    }, 300);
  }
}
```

### 3.2 Incremental Compilation
- Only recompile changed sections when possible
- Preserve webview state during updates
- Show compilation status (loading/error states)

### 3.3 Error Handling & Recovery
- Graceful degradation when compilation fails
- Show error overlays with line/column info
- Maintain last known good state

## Phase 4: Advanced Features

### 4.1 Interactive Diagram Editing (Future)
**Tool Choice: Sprotty Framework**
- Professional-grade diagram editing
- LSP integration for semantic validation
- Bi-directional text ↔ diagram sync

```typescript
interface FlowNode {
  id: string;
  type: 'message' | 'condition' | 'action';
  position: { x: number; y: number };
  data: MessageData | ConditionData | ActionData;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  trigger?: string;
  conditions?: string[];
}
```

### 4.2 Flow Analysis Features
- Dead code detection (unreachable states)
- Cycle detection in flows
- Message usage statistics
- Flow complexity metrics

### 4.3 Export & Sharing
- Export flows as SVG/PNG/PDF
- Generate flow documentation
- Share flow links (if using remote diagrams)

## Implementation Strategy

### Phase 1 (Week 1): Foundation
1. Set up webview provider and message passing
2. Implement basic JSON preview with react-json-view
3. Add compilation trigger and error handling
4. Create basic toolbar UI

### Phase 2 (Week 2): Flow Visualization  
1. Integrate Mermaid.js for flow rendering
2. Implement flow selector and toolbar
3. Add cursor following functionality
4. Create "All Flows" combined view

### Phase 3 (Week 3): Real-time Features
1. Implement file watching and debounced updates
2. Add compilation status indicators
3. Optimize performance for large files
4. Polish UI/UX and error states

### Phase 4 (Future): Advanced Features
1. Research Sprotty integration for editing
2. Implement flow analysis features
3. Add export capabilities
4. Performance optimization and testing

## Technical Specifications

### Webview Resources
```typescript
interface WebviewResources {
  scripts: [
    'react.production.min.js',
    'react-dom.production.min.js', 
    'mermaid.min.js',
    'react-json-view.js'
  ];
  styles: [
    'preview.css',
    'mermaid-theme.css'
  ];
}
```

### Message API
```typescript
interface ExtensionMessage {
  type: 'updateData' | 'cursorMove' | 'compile' | 'export';
  data: any;
}

interface WebviewMessage {
  type: 'ready' | 'selectFlow' | 'export' | 'error';
  data: any;
}
```

### Security & Performance
- Content Security Policy for webview
- Resource bundling for faster loading
- Virtual scrolling for large JSON objects
- Memoization for expensive computations

## UI/UX Design Principles

1. **Minimal Cognitive Load**: Clear visual hierarchy, familiar patterns
2. **Fast Feedback**: Sub-200ms updates, loading indicators
3. **Error Resilience**: Graceful degradation, helpful error messages
4. **Accessibility**: Keyboard navigation, screen reader support
5. **Theming**: Respect VS Code light/dark themes

## Success Metrics

1. **Performance**: <500ms compilation time, <100ms UI updates
2. **Reliability**: 99%+ uptime, robust error recovery
3. **Usability**: Intuitive flow selection, clear visual feedback
4. **Adoption**: Used by 80%+ of RCL developers

## Risk Mitigation

1. **Mermaid Limitations**: Have D3.js fallback ready
2. **Performance Issues**: Implement lazy loading and virtualization
3. **Complex Flows**: Design for graceful scaling
4. **Webview Crashes**: Implement automatic recovery

This plan provides a solid foundation for creating a professional-grade live preview system that will significantly enhance the RCL development experience.