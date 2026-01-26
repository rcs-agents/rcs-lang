# RCL IDE

A web-based IDE for RCL (Rich Communication Language) development with Monaco editor integration and visual flow diagrams.

## Features

### 📝 Monaco Editor
- Full Monaco editor with VSCode-like experience
- Syntax highlighting (will be enhanced with RCL language support)
- IntelliSense and error checking
- Pre-loaded with coffee-shop.rcl example

### 🔄 Flow Visualization
- Interactive SVG-based flow diagrams
- Visual representation of RCL state machines
- Node types: Start, Message, Match (compound nodes)
- Edge connections with labels

### 📄 Code Generation
- Real-time JavaScript compilation output
- Clean, readable generated code
- State machine implementation

### 📤 Export Options
- JSON output in RCS Business Messaging format
- Agent configuration export
- Structured data for integration

## Architecture

### Split Panel Layout
```
┌─────────────┬─────────────┐
│             │   Tabs:     │
│   Monaco    │ ┌─────────┐ │
│   Editor    │ │Flow│Code│ │
│             │ └─────────┘ │
│             │   Content   │
└─────────────┴─────────────┘
```

### Core Modules

- **`main.ts`** - Main IDE application class and initialization
- **`compiler.ts`** - RCL compilation and code generation
- **`diagram.ts`** - SVG-based flow diagram rendering
- **`tabs.ts`** - Tab management and panel switching

## Development

### Setup
```bash
cd apps/ide
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Type Checking
```bash
npm run typecheck
```

## Integration Points

### Monaco VSCode API
Uses `@codingame/monaco-vscode-api` for full VSCode extension compatibility:
- Language services
- Keybindings
- Editor services
- Model services

### RCL Language Support
Ready for integration with RCL language server:
- Syntax highlighting
- Error diagnostics
- Auto-completion
- Hover information

### Sprotty Diagrams
Foundation for advanced diagram features:
- Interactive node editing
- Drag-and-drop
- Zoom and pan
- Selection and multi-selection

## Browser Testing

Perfect for use with playwright-vision MCP server:
- Runs entirely in browser
- No backend dependencies
- Visual testing capabilities
- Automated interaction testing

## Future Enhancements

### Phase 1 - Core Language Support
- [ ] Integrate actual RCL compiler
- [ ] Add RCL syntax highlighting
- [ ] Implement language server features

### Phase 2 - Enhanced Diagrams
- [ ] Replace mock diagrams with Sprotty
- [ ] Add interactive editing
- [ ] Implement diagram-to-code sync

### Phase 3 - Advanced Features
- [ ] File management
- [ ] Project templates
- [ ] Export to various formats
- [ ] Collaboration features

## Usage

1. **Edit RCL Code**: Use the Monaco editor on the left to modify RCL content
2. **View Flow**: Click the "Flow" tab to see the visual flow diagram
3. **Check Output**: Use "Code" tab for JavaScript output, "Export" tab for JSON/config
4. **Real-time Updates**: Changes in the editor automatically update all views

The IDE provides a complete development environment for RCL agents with visual feedback and multiple output formats.