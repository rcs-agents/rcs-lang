# @rcs-lang/ast

Parser-independent AST (Abstract Syntax Tree) type definitions for the RCL (Rich Communication Language).

## Overview

This package provides TypeScript type definitions for the RCL Abstract Syntax Tree. It serves as a shared contract between the parser and compiler packages, ensuring type safety and consistency across the RCL toolchain.

## Installation

```bash
npm install @rcs-lang/ast
```

## Usage

```typescript
import * as AST from '@rcs-lang/ast';

// Example: Type-safe AST node creation
const agentNode: AST.AgentDefinition = {
  type: 'AgentDefinition',
  name: 'MyAgent',
  displayName: 'My Agent',
  sections: []
};

// Example: AST traversal with type guards
function visitNode(node: AST.ASTNode) {
  if (AST.isAgentDefinition(node)) {
    console.log('Found agent:', node.name);
  } else if (AST.isFlowDefinition(node)) {
    console.log('Found flow:', node.name);
  }
}
```

## AST Structure

The RCL AST follows a hierarchical structure:

```
RclFile
├── AgentDefinition
│   ├── ConfigSection
│   ├── DefaultsSection
│   └── FlowDefinition[]
└── MessagesSection
    └── MessageDefinition[]
```

## Key Types

### Core Nodes
- `RclFile` - Root node of an RCL document
- `AgentDefinition` - Defines an RCS agent
- `FlowDefinition` - Defines a conversation flow
- `MessagesSection` - Container for message definitions
- `MessageDefinition` - Defines a message template

### Flow Nodes
- `StateDefinition` - Defines a state in a flow
- `TransitionDefinition` - Defines transitions between states
- `MatchBlock` - Pattern matching for user input
- `ActionBlock` - Actions to perform in a state

### Message Nodes
- `TextMessage` - Simple text message
- `RichCardMessage` - Rich card with media and buttons
- `CarouselMessage` - Carousel of multiple cards
- `Suggestion` - Quick reply or action suggestions

## Type Guards

The package provides type guard functions for runtime type checking:

```typescript
AST.isAgentDefinition(node)
AST.isFlowDefinition(node)
AST.isMessageDefinition(node)
AST.isTextMessage(node)
// ... and more
```

## Contributing

See the main repository README for contribution guidelines.

## License

MIT