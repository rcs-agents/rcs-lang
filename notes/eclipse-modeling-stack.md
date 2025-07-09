# Eclipse Modeling Stack for RCL IDE

## Overview of Technologies

### Eclipse GLSP (Graphical Language Server Protocol)
- **What it is**: A client-server framework for building diagram editors
- **Key feature**: Extends the Language Server Protocol (LSP) concept to graphical editors
- **Architecture**: Server handles diagram logic, client handles rendering
- **Relationship to Sprotty**: GLSP often uses Sprotty as its client-side rendering engine

### EMF.cloud
- **What it is**: Suite of components for building cloud-based modeling tools
- **Includes**:
  - Model Server: RESTful API for managing EMF models
  - Coffee Editor: Example application showing the full stack
  - Form support: JSON Forms integration
- **Purpose**: Provides the backend infrastructure for model management

### Eclipse Theia
- **What it is**: Cloud & desktop IDE framework (like VS Code but more extensible)
- **Built on**: Monaco Editor, LSP, and other VS Code technologies
- **Key difference**: More modular and extensible than VS Code
- **Use case**: Building custom IDEs for specific domains

### How They Work Together

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Theia     │     │    GLSP      │     │  EMF.cloud  │
│    IDE      │────▶│   Server     │────▶│Model Server │
│  (Client)   │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐     ┌──────────────┐
│   Sprotty   │     │   Diagram    │
│  (Renderer) │     │    Logic     │
└─────────────┘     └──────────────┘
```

## Current RCL IDE Implementation

Currently implemented:
- Custom diagram implementation (not using Sprotty properly)
- Monaco editor
- Direct model manipulation
- Basic toolbar and property panels

What GLSP would provide:
- Proper server-side diagram logic
- Standardized client-server protocol
- Better separation of concerns
- Integration with EMF models
- Undo/redo, validation, etc.

## Considerations for Stack Decision

### Benefits of Full Stack
- Production-ready architecture
- Proper separation of concerns
- Built-in features (undo/redo, validation, etc.)
- Extensibility for future features
- Professional diagram editing capabilities

### Drawbacks of Full Stack
- Significant complexity increase
- Learning curve for development team
- May overwhelm non-technical users
- Requires careful UI/UX customization
- More moving parts to maintain