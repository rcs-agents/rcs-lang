# @rcs-lang/file-system

Cross-platform file system abstraction for RCL tools, supporting Node.js, browser, and in-memory environments.

## Overview

This package provides a unified file system interface that works across different environments. It enables RCL tools to read and write files consistently whether running in Node.js, the browser, or test environments.

## Architecture

### Design Patterns

The package uses several design patterns to provide a flexible and maintainable abstraction:

**Provider Pattern**: Each filesystem implementation (Node.js, browser, memory) is wrapped in a provider that handles environment detection and initialization.

**Factory Pattern**: The `FileSystemFactory` manages providers and automatically selects the appropriate implementation for the current environment.

**Result Pattern**: All filesystem operations return a `Result<T, E>` type from `@rcs-lang/core`, eliminating the need for try-catch blocks and making error handling explicit.

**Strategy Pattern**: All implementations follow the `IFileSystem` interface, allowing them to be used interchangeably.

### Implementation Strategy

```
┌─────────────────────────────────────┐
│      FileSystemFactory              │
│  (Environment Detection & Registry) │
└─────────────────┬───────────────────┘
                  │
         ┌────────┴────────┬────────────┐
         │                 │            │
    ┌────▼────┐      ┌────▼────┐  ┌───▼────┐
    │  Node   │      │ Browser │  │ Memory │
    │Provider │      │Provider │  │Provider│
    └────┬────┘      └────┬────┘  └───┬────┘
         │                │            │
    ┌────▼─────────┐ ┌───▼────────┐ ┌─▼──────────┐
    │NodeFileSystem│ │BrowserFS   │ │ MemoryFS   │
    │(fs/promises) │ │(IndexedDB) │ │ (Map/Set)  │
    └──────────────┘ └────────────┘ └────────────┘
```

Each implementation:
- **NodeFileSystem**: Wraps Node.js `fs/promises` module with Result pattern
- **BrowserFileSystem**: Uses IndexedDB for persistent browser storage
- **MemoryFileSystem**: Pure in-memory storage using Map and Set

### When to Use Each Implementation

**NodeFileSystem**
- Running in Node.js environment
- Need actual filesystem access
- Building CLI tools or servers
- Require native filesystem performance

**BrowserFileSystem**
- Running in web browsers
- Need persistent storage across sessions
- Working with virtual file paths
- Subject to browser storage quotas (typically 50MB-1GB)

**MemoryFileSystem**
- Unit tests and test environments
- Temporary file operations
- Sandboxed execution
- Fast, predictable performance
- No persistence needed

## Installation

```bash
bun install @rcs-lang/file-system
```

## Quick Start

```typescript
import { FileSystemFactory } from '@rcs-lang/file-system';

// Get default filesystem for your environment
const fs = FileSystemFactory.getDefault();

// Read a file
const result = await fs.readFile('/path/to/file.rcl');
if (result.success) {
  console.log(result.value);
} else {
  console.error('Read failed:', result.error);
}

// Write a file
const writeResult = await fs.writeFile('/path/to/output.json', JSON.stringify(data));
if (!writeResult.success) {
  console.error('Write failed:', writeResult.error);
}
```

## Implementations

### NodeFileSystem

Standard file system operations using Node.js APIs.

```typescript
import { NodeFileSystem } from '@rcs-lang/file-system';

const fs = new NodeFileSystem();

// All standard operations
const readResult = await fs.readFile('/src/agent.rcl');
const writeResult = await fs.writeFile('/dist/agent.json', content);
const mkdirResult = await fs.mkdir('/dist', true);
const existsResult = await fs.exists('/src/agent.rcl');
const statResult = await fs.stat('/src/agent.rcl');
```

**Features:**
- Full native filesystem access
- Best performance
- Supports all Node.js path utilities
- Real file permissions and metadata

**Limitations:**
- Only available in Node.js
- Cannot be used in browsers
- Actual disk I/O can fail due to permissions

### BrowserFileSystem

File system operations for browser environments using IndexedDB.

```typescript
import { BrowserFileSystem } from '@rcs-lang/file-system';

const fs = new BrowserFileSystem('my-app-files');

// Load previously saved files
await fs.loadFromIndexedDB();

// Work with files in memory
await fs.mkdir('/project', true);
await fs.writeFile('/project/config.json', JSON.stringify(config));
const result = await fs.readFile('/project/config.json');

// Persist changes to IndexedDB
await fs.saveToIndexedDB();
```

**Features:**
- Persistent storage across browser sessions
- Full IFileSystem interface support
- Customizable database name
- Path-based organization

**Limitations:**
- Storage quota limits (typically 50MB-1GB, varies by browser)
- Slower than memory or native filesystem
- No streaming support (files loaded entirely into memory)
- Files stored as strings only (no binary support)
- Private browsing may clear data on session end
- Requires manual save/load to persist changes

**Important:** You must call `loadFromIndexedDB()` to restore files and `saveToIndexedDB()` to persist changes. Changes exist only in memory until saved.

### MemoryFileSystem

In-memory file system for testing and development.

```typescript
import { MemoryFileSystem } from '@rcs-lang/file-system';

const fs = new MemoryFileSystem();

// Create and use files
await fs.mkdir('/test', true);
await fs.writeFile('/test/input.rcl', 'agent TestAgent...');
await fs.writeFile('/test/expected.json', '{"agent": {...}}');

// Use in tests
const content = await fs.readFile('/test/input.rcl');
const result = await compiler.compile(content);

// Clean up
fs.clear();
```

**Features:**
- Always available in all environments
- Fastest performance
- Predictable behavior
- No side effects
- Built-in `clear()` method

**Limitations:**
- No persistence (all data lost when process ends)
- Data stored in memory (can use significant RAM for large files)

## API Reference

All file systems implement the `IFileSystem` interface:

### File Operations

#### `readFile(path: string, encoding?: string): Promise<Result<string>>`
Reads a file as text. Returns Result with file contents or error.

#### `writeFile(path: string, content: string, encoding?: string): Promise<Result<void>>`
Writes content to a file. Creates file if it doesn't exist, overwrites if it does.

#### `unlink(path: string): Promise<Result<void>>`
Deletes a file. Returns error if file doesn't exist.

### Directory Operations

#### `mkdir(path: string, recursive?: boolean): Promise<Result<void>>`
Creates a directory. Set `recursive` to true to create parent directories.

#### `rmdir(path: string, recursive?: boolean): Promise<Result<void>>`
Removes a directory. Set `recursive` to true to remove contents.

#### `readdir(path: string): Promise<Result<string[]>>`
Lists directory contents. Returns array of names (not full paths).

### File Information

#### `exists(path: string): Promise<Result<boolean>>`
Checks if a file or directory exists. Always returns success with boolean value.

#### `stat(path: string): Promise<Result<IFileStats>>`
Gets file or directory statistics including size, type, and timestamps.

### Path Utilities

#### `join(...segments: string[]): string`
Joins path segments into a single path.

#### `resolve(...segments: string[]): string`
Resolves path segments to an absolute path.

#### `dirname(path: string): string`
Gets the directory portion of a path.

#### `basename(path: string, ext?: string): string`
Gets the filename portion, optionally removing extension.

#### `extname(path: string): string`
Gets the file extension including the dot.

#### `isAbsolute(path: string): boolean`
Checks if a path is absolute.

## File System Factory

The factory automatically detects the environment and provides the appropriate filesystem:

```typescript
import { FileSystemFactory } from '@rcs-lang/file-system';

// Automatic detection (Node → Browser → Memory)
const fs = FileSystemFactory.getDefault();

// Explicit selection
const nodeFs = FileSystemFactory.getFileSystem('node');
const browserFs = FileSystemFactory.getFileSystem('browser');
const memoryFs = FileSystemFactory.getFileSystem('memory');

// Check available filesystems
const available = FileSystemFactory.getAvailable();
console.log('Available:', available); // ['node', 'memory'] or ['browser', 'memory']
```

## Advanced Usage

### Custom File System Implementation

Implement your own file system by following the `IFileSystem` interface:

```typescript
import type { IFileSystem, IFileStats } from '@rcs-lang/core';
import type { Result } from '@rcs-lang/core';

class S3FileSystem implements IFileSystem {
  constructor(private s3Client: S3Client) {}

  async readFile(path: string): Promise<Result<string>> {
    try {
      const result = await this.s3Client.getObject({
        Bucket: 'my-bucket',
        Key: path
      });
      return ok(await result.Body.transformToString());
    } catch (error) {
      return err(new Error(`Failed to read ${path}: ${error}`));
    }
  }

  // Implement other IFileSystem methods...
}
```

### Custom Provider

Register a custom filesystem provider:

```typescript
import { FileSystemFactory } from '@rcs-lang/file-system';
import type { IFileSystemProvider } from '@rcs-lang/core';

class S3FileSystemProvider implements IFileSystemProvider {
  private fs: S3FileSystem;

  constructor(s3Client: S3Client) {
    this.fs = new S3FileSystem(s3Client);
  }

  getName(): string {
    return 's3';
  }

  isAvailable(): boolean {
    return typeof this.fs !== 'undefined';
  }

  getFileSystem(): IFileSystem {
    return this.fs;
  }
}

// Register and use
FileSystemFactory.registerProvider(new S3FileSystemProvider(s3Client));
const s3Fs = FileSystemFactory.getFileSystem('s3');
```

### Browser Integration Example

```typescript
import { BrowserFileSystem } from '@rcs-lang/file-system';

const fs = new BrowserFileSystem('my-app-files');

// Load saved files on app start
await fs.loadFromIndexedDB();

// File input handler
const fileInput = document.getElementById('file-input') as HTMLInputElement;
fileInput.addEventListener('change', async (event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    for (const file of files) {
      const content = await file.text();
      await fs.mkdir('/project', true);
      await fs.writeFile(`/project/${file.name}`, content);
    }
    // Persist to IndexedDB
    await fs.saveToIndexedDB();
  }
});

// Save button handler
document.getElementById('save')?.addEventListener('click', async () => {
  await fs.saveToIndexedDB();
  console.log('Files saved to browser storage');
});
```

### Testing with Memory File System

```typescript
import { MemoryFileSystem } from '@rcs-lang/file-system';
import { describe, test, expect, beforeEach } from 'bun:test';

describe('RCL Compiler', () => {
  let fs: MemoryFileSystem;

  beforeEach(async () => {
    fs = new MemoryFileSystem();

    // Pre-populate with test files
    await fs.mkdir('/test', true);
    await fs.writeFile('/test/input.rcl', `
      agent TestAgent
        displayName: "Test"
        flow Main
          start: Welcome
        messages Messages
          text Welcome "Hello"
    `);
  });

  afterEach(() => {
    fs.clear(); // Clean up
  });

  test('compiles successfully', async () => {
    const compiler = new RCLCompiler({ fileSystem: fs });
    const result = await compiler.compileFile('/test/input.rcl');

    expect(result.success).toBe(true);

    // Verify output was written
    const outputResult = await fs.exists('/test/output.json');
    expect(outputResult.success && outputResult.value).toBe(true);
  });
});
```

## Error Handling

All operations return `Result<T, E>` types for explicit error handling:

```typescript
import { FileSystemFactory } from '@rcs-lang/file-system';

const fs = FileSystemFactory.getDefault();

// Pattern 1: Check success flag
const result = await fs.readFile('/config.json');
if (result.success) {
  const config = JSON.parse(result.value);
} else {
  console.error('Failed:', result.error.message);
}

// Pattern 2: Check existence first
const exists = await fs.exists('/config.json');
if (exists.success && exists.value) {
  const result = await fs.readFile('/config.json');
  // ...
}

// Pattern 3: Ensure directory exists before writing
await fs.mkdir('/output', true); // recursive
const writeResult = await fs.writeFile('/output/data.json', '{}');
```

## Browser Support and Limitations

### Storage Quotas

Browsers impose storage quotas on IndexedDB:
- Chrome: ~60% of available disk space (shared with other storage)
- Firefox: 10% of disk space per group (shared)
- Safari: 1GB per origin
- Mobile browsers: Generally more restrictive

### Persistence

- **Normal browsing**: Data persists until explicitly cleared
- **Private/Incognito mode**: Data cleared when session ends
- **Storage pressure**: Browser may clear data if device storage is low

### Security Restrictions

- Files must be explicitly loaded (no direct filesystem access)
- Same-origin policy applies
- Cannot access local filesystem directly
- Must use FileReader API or similar for user file uploads

### Performance Considerations

- IndexedDB operations are async and slightly slower than memory
- Large files impact performance (no streaming)
- Consider chunking large operations
- Use `loadFromIndexedDB()` on app start, `saveToIndexedDB()` periodically

## Testing

The package includes comprehensive tests for all implementations:

```bash
# Run all tests
bun test packages/file-system

# Run tests for specific implementation
bun test packages/file-system/tests/nodeFileSystem.test.ts
bun test packages/file-system/tests/browserFileSystem.test.ts
bun test packages/file-system/tests/memoryFileSystem.test.ts
```

Test coverage includes:
- All CRUD operations
- Path utilities and edge cases
- Error conditions
- Nested directory operations
- Recursive operations
- Cross-implementation compatibility

## Performance

### Benchmark Results (Approximate)

| Operation | Node | Browser | Memory |
|-----------|------|---------|--------|
| Read 1KB  | 0.1ms | 2ms | <0.1ms |
| Write 1KB | 0.2ms | 3ms | <0.1ms |
| mkdir     | 0.5ms | 1ms | <0.1ms |
| readdir   | 0.3ms | 2ms | <0.1ms |

### Optimization Tips

**For Node.js:**
- Use absolute paths when possible
- Batch operations where possible
- Consider caching stat results

**For Browser:**
- Call `loadFromIndexedDB()` once on startup
- Call `saveToIndexedDB()` periodically, not after every operation
- Consider debouncing saves in response to user actions

**For Memory:**
- Already optimized
- Use `clear()` to free memory when done
- Consider memory usage for large file sets

## Migration Guide

### From Node.js fs module

```typescript
// Before
import fs from 'fs/promises';
try {
  const content = await fs.readFile('/path/file.txt', 'utf8');
} catch (error) {
  console.error(error);
}

// After
import { NodeFileSystem } from '@rcs-lang/file-system';
const fs = new NodeFileSystem();
const result = await fs.readFile('/path/file.txt');
if (result.success) {
  const content = result.value;
} else {
  console.error(result.error);
}
```

### From browser File API

```typescript
// Before
const file = await fileInput.files[0].text();

// After
import { BrowserFileSystem } from '@rcs-lang/file-system';
const fs = new BrowserFileSystem();
const content = await fileInput.files[0].text();
await fs.mkdir('/uploads', true);
await fs.writeFile(`/uploads/${fileInput.files[0].name}`, content);
await fs.saveToIndexedDB(); // Persist
```

## Contributing

See the main repository README for contribution guidelines.

## License

MIT
