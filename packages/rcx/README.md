# @rcs-lang/rcx

The **RCX (Rich Communication Experience)** format is the standard bundle format for RCS conversational agents. This package provides type definitions, schemas, and tools for working with RCX bundles.

## Overview

Start by reading the [docs/overview.md](docs/overview.md).

RCX serves as the bridge between visual design tools (like the Diagram Editor) and the execution runtime. It encapsulates everything needed to define an RCS agent:

- **Agent Configuration**: Branding, capabilities, and settings.
- **Conversation State Machine (CSM)**: The logic and flow of the conversation.
- **Messages**: Content collections with rich media and personalization.
- **Diagram**: The visual representation of the agent flow.
- **Assets**: Media and resource management.

## Installation

```bash
bun add @rcs-lang/rcx
```

## Usage

### Types

```typescript
import type { RCXBundle, RCXManifest } from '@rcs-lang/rcx';

const bundle: RCXBundle = {
  // ... bundle structure
};
```

### Building a Bundle

Use the `RCXBuilder` to convert a React Flow diagram into an RCX Bundle:

```typescript
import { buildAgentBundle, type ReactFlowDiagramData } from '@rcs-lang/rcx';

const diagramData: ReactFlowDiagramData = {
  nodes: [ /* ... */ ],
  edges: [ /* ... */ ]
};

const result = buildAgentBundle(diagramData, {
  name: 'My Agent',
  bundleId: 'my-agent-123',
  locale: 'en-US'
});

if (result.success) {
  console.log('Bundle created:', result.bundle);
} else {
  console.error('Build failed:', result.error);
}
```

### Importing a Bundle

Convert an RCX Bundle back to a diagram for editing:

```typescript
import { importAgentBundle } from '@rcs-lang/rcx';

const result = importAgentBundle(myBundle);

if (result.success) {
  // Load diagramData into React Flow
  const { nodes, edges } = result.diagramData;
}
```

## Documentation

For detailed documentation on the RCX format and architecture, see the `docs/` directory.
