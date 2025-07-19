# AST Package Documentation

This directory contains comprehensive documentation for the `@rcs-lang/ast` package.

## Quick Links

- [API Reference](./api-reference.md) - Complete API documentation with all types and interfaces
- [User Guide](./user-guide.md) - Step-by-step guide for using the AST types effectively

## Documentation Overview

### API Reference
Complete reference documentation covering:
- All AST node types and interfaces
- Type guards and utility functions
- Constants and enums
- Code examples for every API

### User Guide
Practical guide covering:
- Getting started with AST types
- Common usage patterns
- AST traversal techniques
- Performance considerations
- Integration examples
- Troubleshooting tips

## Target Audience

- **Compiler Authors** - Building tools that process RCL code
- **Language Server Developers** - Creating IDE support for RCL
- **Tool Builders** - Developing analyzers, linters, or formatters for RCL
- **Advanced Users** - Working directly with RCL ASTs for custom processing

## Quick Start

1. Install the package: `npm install @rcs-lang/ast`
2. Read the [User Guide](./user-guide.md) for practical examples
3. Reference the [API Reference](./api-reference.md) for detailed type information

## Examples

See the User Guide for comprehensive examples, or check these quick snippets:

```typescript
import * as AST from '@rcs-lang/ast';

// Type-safe AST processing
function analyzeAgent(ast: AST.RclFile) {
  console.log(`Agent: ${ast.agent.name}`);
  console.log(`Flows: ${ast.agent.flows.length}`);
}

// AST traversal
import { walkAST, isMessageDefinition } from '@rcs-lang/ast';

walkAST(ast, (node) => {
  if (isMessageDefinition(node)) {
    console.log(`Found message: ${node.name}`);
  }
});
```

## Contributing

When contributing to this documentation:

1. Keep examples practical and runnable
2. Include TypeScript types in all code samples
3. Update both API reference and user guide for new features
4. Test all code examples before committing