# @rcl/parser

TypeScript parser for the Rich Communication Language (RCL) using tree-sitter.

## Features

- **Tree-sitter Grammar**: Comprehensive grammar for RCL syntax
- **TypeScript API**: Full TypeScript support with type definitions
- **AST Utilities**: Helper functions for traversing and analyzing RCL ASTs
- **Mock Fallback**: Graceful fallback when native bindings aren't available
- **Schema Validation**: Built-in validation for RCL documents

## Installation

```bash
bun install @rcl/parser
```

## Usage

```typescript
import { RCLParser } from '@rcl/parser';

const parser = new RCLParser();
const document = parser.parseDocument(rclContent, fileUri);

// Access parsed AST
console.log(document.ast);

// Get symbols and imports
console.log(document.symbols);
console.log(document.imports);
```

## API

### `RCLParser`

- `parseDocument(content: string, uri: string, version?: number): RCLDocument`
- `parseText(text: string): RCLNode`
- `getNodeAt(document: RCLDocument, line: number, character: number): RCLNode | null`

### `ASTWalker`

- `walkAST(node: RCLNode, callback: (node: RCLNode) => void | boolean): void`

## Development

### Prerequisites for Testing

The parser tests require a WebAssembly (WASM) build of the tree-sitter grammar. The WASM file needs to be rebuilt whenever `grammar.js` changes.

#### Building WASM

**Option 1: With Docker (Simplest)**
```bash
npm run build-wasm-docker
```

**Option 2: With Emscripten (If installed)**
```bash
npm run build-wasm
```

**Option 3: Install Emscripten first**
```bash
npm run install-emscripten
source ~/.emsdk/emsdk_env.sh
npm run build-wasm
```

The test suite will automatically check if WASM needs rebuilding and provide instructions.

### Build Commands

```bash
# Build grammar and TypeScript
bun run build

# Run tests
bun test

# Development mode
bun run dev
```

## Project Structure

The parser package is structured to support both native Node.js and WebAssembly builds.

- **`grammar.js`**: The source of truth for the RCL grammar. This is where the language syntax is defined.
- **`tree-sitter.json`**: Configuration file for the Tree-sitter CLI, defining metadata and language settings.
- **`binding.gyp`**: Build configuration for the native Node.js addon, used by `node-gyp`.
- **`src/`**: Contains all TypeScript source code and the C files (`parser.c`, `scanner.c`, `grammar.json`, `node-types.json`) generated from `grammar.js`.
- **`build/`**: Contains compiled output, such as the native `.node` binding and the `.wasm` module. This directory is git-ignored.
- **`tests/`**: Unit and integration tests for the parser.
- **`dist/`**: Contains the compiled JavaScript and TypeScript declaration files for distribution.

## Grammar

The grammar is defined in `grammar.js` and supports:

- Agent definitions with configuration
- Flow systems with state transitions  
- Message templates with rich content
- Type system with validation
- Import statements
- Embedded JavaScript/TypeScript code

## License

MIT