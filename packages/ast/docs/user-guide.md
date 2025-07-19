# AST User Guide

## Getting Started

The `@rcs-lang/ast` package provides TypeScript type definitions for working with RCL Abstract Syntax Trees. This guide will help you understand how to use these types effectively in your projects.

## Installation

```bash
npm install @rcs-lang/ast
```

## Basic Usage

### Importing Types

```typescript
// Import specific types
import { RclFile, AgentDefinition, FlowDefinition } from '@rcs-lang/ast';

// Import all types under namespace
import * as AST from '@rcs-lang/ast';

// Import utilities
import { walkAST, isMessageDefinition } from '@rcs-lang/ast';
```

### Working with AST Nodes

Every AST node has a `type` property that identifies its kind and a `range` property that indicates its location in the source code.

```typescript
import { ASTNode, Range } from '@rcs-lang/ast';

function printNodeInfo(node: ASTNode) {
  console.log(`Node type: ${node.type}`);
  console.log(`Location: Line ${node.range.start.line}, Column ${node.range.start.character}`);
}
```

## Understanding the AST Structure

### Document Hierarchy

RCL documents follow this structure:

```
RclFile
├── AgentDefinition
│   ├── ConfigSection (optional)
│   ├── DefaultsSection (optional)
│   └── FlowDefinition[] (one or more)
└── MessagesSection (optional)
    └── MessageDefinition[] (zero or more)
```

### Example AST

For this RCL code:

```rcl
agent CoffeeBot
  displayName: "Coffee Shop Assistant"
  
  flow OrderFlow
    start: Welcome
    
    on Welcome
      match @reply.text
        "coffee" -> OrderCoffee
        :default -> Welcome
  
  messages Messages
    text Welcome "What can I get you?"
```

The AST structure would be:

```typescript
const ast: AST.RclFile = {
  type: 'RclFile',
  agent: {
    type: 'AgentDefinition',
    name: 'CoffeeBot',
    displayName: 'Coffee Shop Assistant',
    flows: [
      {
        type: 'FlowDefinition',
        name: 'OrderFlow',
        start: 'Welcome',
        states: [
          {
            type: 'StateDefinition',
            name: 'Welcome',
            transitions: [/* ... */]
          }
        ]
      }
    ]
  },
  messages: {
    type: 'MessagesSection',
    messages: [
      {
        type: 'TextMessage',
        name: 'Welcome',
        messageType: 'text',
        text: 'What can I get you?'
      }
    ]
  }
}
```

## Working with Different Node Types

### Agent Definitions

```typescript
import { AgentDefinition, isAgentDefinition } from '@rcs-lang/ast';

function analyzeAgent(node: ASTNode) {
  if (isAgentDefinition(node)) {
    console.log(`Agent: ${node.name}`);
    console.log(`Display Name: ${node.displayName || 'Not set'}`);
    console.log(`Flows: ${node.flows.length}`);
    
    // Check for configuration
    if (node.config) {
      console.log('Has configuration section');
    }
    
    // Check for defaults
    if (node.defaults) {
      console.log('Has defaults section');
    }
  }
}
```

### Flow Definitions

```typescript
import { FlowDefinition, isFlowDefinition } from '@rcs-lang/ast';

function analyzeFlow(node: ASTNode) {
  if (isFlowDefinition(node)) {
    console.log(`Flow: ${node.name}`);
    console.log(`Start State: ${node.start}`);
    console.log(`States: ${node.states.map(s => s.name).join(', ')}`);
  }
}
```

### Message Definitions

```typescript
import { 
  MessageDefinition, 
  isTextMessage, 
  isRichCardMessage, 
  isCarouselMessage 
} from '@rcs-lang/ast';

function analyzeMessage(message: MessageDefinition) {
  console.log(`Message: ${message.name}`);
  
  if (isTextMessage(message)) {
    console.log(`Type: Text`);
    console.log(`Content: ${message.text}`);
    
    if (message.suggestions) {
      console.log(`Suggestions: ${message.suggestions.length}`);
    }
  } else if (isRichCardMessage(message)) {
    console.log(`Type: Rich Card`);
    console.log(`Title: ${message.title}`);
    console.log(`Size: ${message.size || 'default'}`);
    
    if (message.description) {
      console.log(`Description: ${message.description}`);
    }
  } else if (isCarouselMessage(message)) {
    console.log(`Type: Carousel`);
    console.log(`Title: ${message.title}`);
    console.log(`Cards: ${message.cards.length}`);
  }
}
```

## AST Traversal Patterns

### Walking the Entire Tree

```typescript
import { walkAST } from '@rcs-lang/ast';

function findAllIdentifiers(ast: AST.RclFile): string[] {
  const identifiers: string[] = [];
  
  walkAST(ast, (node) => {
    if (node.type === 'Identifier') {
      identifiers.push((node as AST.Identifier).name);
    }
  });
  
  return identifiers;
}
```

### Finding Specific Nodes

```typescript
import { findNode, findAllNodes } from '@rcs-lang/ast';

// Find the first flow
function getFirstFlow(ast: AST.RclFile): AST.FlowDefinition | null {
  const flowNode = findNode(ast, (node) => node.type === 'FlowDefinition');
  return flowNode as AST.FlowDefinition | null;
}

// Find all text messages
function getAllTextMessages(ast: AST.RclFile): AST.TextMessage[] {
  const textNodes = findAllNodes(ast, (node) => node.type === 'TextMessage');
  return textNodes as AST.TextMessage[];
}
```

### Conditional Processing

```typescript
import { isFlowDefinition, isStateDefinition } from '@rcs-lang/ast';

function analyzeFlowComplexity(ast: AST.RclFile) {
  walkAST(ast, (node) => {
    if (isFlowDefinition(node)) {
      const stateCount = node.states.length;
      const complexity = stateCount > 5 ? 'High' : stateCount > 2 ? 'Medium' : 'Low';
      console.log(`Flow ${node.name}: ${complexity} complexity (${stateCount} states)`);
    }
  });
}
```

## Common Use Cases

### Extracting Metadata

```typescript
import { RclFile, isMessageDefinition } from '@rcs-lang/ast';

interface AgentMetadata {
  name: string;
  displayName?: string;
  flowCount: number;
  messageCount: number;
  messageTypes: string[];
}

function extractMetadata(ast: RclFile): AgentMetadata {
  const messageTypes = new Set<string>();
  let messageCount = 0;
  
  walkAST(ast, (node) => {
    if (isMessageDefinition(node)) {
      messageCount++;
      messageTypes.add(node.messageType);
    }
  });
  
  return {
    name: ast.agent.name,
    displayName: ast.agent.displayName,
    flowCount: ast.agent.flows.length,
    messageCount,
    messageTypes: Array.from(messageTypes)
  };
}
```

### Validation and Analysis

```typescript
import { RclFile, isStateDefinition, isTransitionDefinition } from '@rcs-lang/ast';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateFlowStructure(ast: RclFile): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check that all flows have start states
  ast.agent.flows.forEach(flow => {
    const hasStartState = flow.states.some(state => state.name === flow.start);
    if (!hasStartState) {
      errors.push(`Flow ${flow.name} references unknown start state: ${flow.start}`);
    }
    
    // Check for unreachable states
    const reachableStates = new Set([flow.start]);
    
    walkAST(flow, (node) => {
      if (isTransitionDefinition(node)) {
        reachableStates.add(node.target);
      }
    });
    
    flow.states.forEach(state => {
      if (!reachableStates.has(state.name)) {
        warnings.push(`State ${state.name} in flow ${flow.name} may be unreachable`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

### Code Generation

```typescript
import { RclFile, isTextMessage } from '@rcs-lang/ast';

function generateMessageConstants(ast: RclFile): string {
  const lines: string[] = [];
  lines.push('// Generated message constants');
  lines.push('export const Messages = {');
  
  if (ast.messages) {
    ast.messages.messages.forEach(message => {
      if (isTextMessage(message)) {
        const safeName = message.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
        lines.push(`  ${safeName}: '${message.text.replace(/'/g, "\\'")}',`);
      }
    });
  }
  
  lines.push('} as const;');
  return lines.join('\n');
}
```

## Performance Considerations

### Efficient Traversal

When working with large ASTs, consider these optimization strategies:

```typescript
// Early termination
function findFirstError(ast: RclFile): string | null {
  let error: string | null = null;
  
  try {
    walkAST(ast, (node) => {
      if (/* some error condition */) {
        error = 'Found error';
        throw new Error('Stop traversal'); // Early exit
      }
    });
  } catch (e) {
    // Expected early termination
  }
  
  return error;
}

// Targeted searches
function getFlowNames(ast: RclFile): string[] {
  // Direct access is more efficient than full traversal
  return ast.agent.flows.map(flow => flow.name);
}

// Memoization for expensive operations
const analysisCache = new Map<string, any>();

function analyzeWithCaching(ast: RclFile, key: string) {
  if (analysisCache.has(key)) {
    return analysisCache.get(key);
  }
  
  const result = performExpensiveAnalysis(ast);
  analysisCache.set(key, result);
  return result;
}
```

### Memory Management

```typescript
// Clean up references when done
function processAST(ast: RclFile) {
  try {
    // Process the AST
    return doSomethingWithAST(ast);
  } finally {
    // Clear parent references to help GC
    walkAST(ast, (node) => {
      if (node.parent) {
        delete node.parent;
      }
    });
  }
}
```

## Type Safety Best Practices

### Using Type Guards

Always use type guards instead of casting:

```typescript
// ✅ Good: Type-safe with runtime checking
function processNode(node: ASTNode) {
  if (isFlowDefinition(node)) {
    // TypeScript knows node is FlowDefinition
    console.log(node.start);
  }
}

// ❌ Bad: Unsafe casting
function processNodeUnsafe(node: ASTNode) {
  const flow = node as FlowDefinition; // Could be wrong!
  console.log(flow.start); // Runtime error if not a flow
}
```

### Exhaustive Type Checking

Use discriminated unions for complete type coverage:

```typescript
function processMessage(message: MessageDefinition) {
  switch (message.messageType) {
    case 'text':
      // Handle text message
      break;
    case 'richCard':
      // Handle rich card
      break;
    case 'carousel':
      // Handle carousel
      break;
    default:
      // TypeScript will error if we miss a case
      const exhaustive: never = message.messageType;
      throw new Error(`Unhandled message type: ${exhaustive}`);
  }
}
```

## Integration Examples

### With Parser

```typescript
import { RCLParser } from '@rcs-lang/parser';
import { RclFile } from '@rcs-lang/ast';

async function parseAndAnalyze(source: string) {
  const parser = new RCLParser();
  const result = await parser.parse(source);
  
  if (result.success) {
    const ast: RclFile = result.data;
    const metadata = extractMetadata(ast);
    console.log('Agent metadata:', metadata);
  }
}
```

### With Compiler

```typescript
import { RCLCompiler } from '@rcs-lang/compiler';
import { walkAST, isMessageDefinition } from '@rcs-lang/ast';

class CustomCompiler extends RCLCompiler {
  protected preprocessAST(ast: RclFile): RclFile {
    // Custom preprocessing using AST types
    walkAST(ast, (node) => {
      if (isMessageDefinition(node)) {
        // Transform message nodes
      }
    });
    
    return ast;
  }
}
```

## Troubleshooting

### Common Issues

1. **Missing Type Guards**: Always use type guards before accessing type-specific properties.

2. **Range Information**: Not all AST nodes may have complete range information during construction.

3. **Parent References**: Parent references are typically set by the parser, not manually constructed ASTs.

4. **Memory Leaks**: Clear parent references when no longer needed to help garbage collection.

### Debugging Tips

```typescript
// Add helper for debugging AST structure
function debugAST(node: ASTNode, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${node.type}`);
  
  if (node.children) {
    node.children.forEach(child => debugAST(child, depth + 1));
  }
}

// Validate AST structure
function validateASTStructure(node: ASTNode): boolean {
  // Check required properties exist
  if (!node.type || !node.range) {
    console.error('Invalid node: missing type or range');
    return false;
  }
  
  // Recursively validate children
  if (node.children) {
    return node.children.every(child => validateASTStructure(child));
  }
  
  return true;
}
```