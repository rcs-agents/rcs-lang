# @rcs-lang/file-system

Cross-platform file system abstraction for RCL tools, supporting Node.js, browser, and in-memory environments.

## Overview

This package provides a unified file system interface that works across different environments. It enables RCL tools to read and write files consistently whether running in Node.js, the browser, or test environments.

## Installation

```bash
npm install @rcs-lang/file-system
```

## Usage

### Getting a File System Instance

```typescript
import { getFileSystem } from '@rcs-lang/file-system';

// Automatically detects environment
const fs = getFileSystem();

// Read a file
const content = await fs.readFile('/path/to/file.rcl');

// Write a file
await fs.writeFile('/path/to/output.json', JSON.stringify(data));
```

### Explicit File System Selection

```typescript
import { 
  NodeFileSystem, 
  BrowserFileSystem, 
  MemoryFileSystem 
} from '@rcs-lang/file-system';

// Node.js environment
const nodeFs = new NodeFileSystem();

// Browser environment (requires setup)
const browserFs = new BrowserFileSystem();

// In-memory (testing)
const memoryFs = new MemoryFileSystem();
```

## File System Implementations

### NodeFileSystem

Standard file system operations using Node.js APIs:

```typescript
import { NodeFileSystem } from '@rcs-lang/file-system';

const fs = new NodeFileSystem();

// All standard operations
await fs.readFile('/src/agent.rcl');
await fs.writeFile('/dist/agent.json', content);
await fs.mkdir('/dist');
await fs.exists('/src/agent.rcl'); // true/false
await fs.stat('/src/agent.rcl');   // file stats
```

### BrowserFileSystem

File system operations in browser environments:

```typescript
import { BrowserFileSystem } from '@rcs-lang/file-system';

const fs = new BrowserFileSystem();

// Works with browser APIs
await fs.readFile('virtual://project/agent.rcl');
await fs.writeFile('virtual://output/agent.json', content);

// Browser-specific features
await fs.loadFromIndexedDB('project-files');
await fs.saveToIndexedDB('project-files');
```

### MemoryFileSystem

In-memory file system for testing and development:

```typescript
import { MemoryFileSystem } from '@rcs-lang/file-system';

const fs = new MemoryFileSystem();

// Pre-populate with files
fs.setFile('/test/input.rcl', 'agent TestAgent...');
fs.setFile('/test/expected.json', '{"agent": {...}}');

// Use in tests
const content = await fs.readFile('/test/input.rcl');
const result = await compiler.compile(content);
await fs.writeFile('/test/actual.json', result.output.json);
```

## Interface

All file systems implement the `IFileSystem` interface:

```typescript
interface IFileSystem {
  // Core operations
  readFile(path: string, encoding?: BufferEncoding): Promise<string>;
  writeFile(path: string, content: string, encoding?: BufferEncoding): Promise<void>;
  
  // Directory operations
  mkdir(path: string, recursive?: boolean): Promise<void>;
  rmdir(path: string, recursive?: boolean): Promise<void>;
  readdir(path: string): Promise<string[]>;
  
  // File information
  exists(path: string): Promise<boolean>;
  stat(path: string): Promise<FileStats>;
  
  // Path utilities
  resolve(path: string): string;
  join(...paths: string[]): string;
  dirname(path: string): string;
  basename(path: string): string;
  extname(path: string): string;
}
```

## File System Factory

The factory automatically detects the environment:

```typescript
import { FileSystemFactory } from '@rcs-lang/file-system';

// Automatic detection
const fs = FileSystemFactory.create();

// Explicit environment
const fs = FileSystemFactory.create('node');     // NodeFileSystem
const fs = FileSystemFactory.create('browser');  // BrowserFileSystem
const fs = FileSystemFactory.create('memory');   // MemoryFileSystem

// With options
const fs = FileSystemFactory.create('memory', {
  initialFiles: {
    '/example.rcl': 'agent Example...'
  }
});
```

## Advanced Usage

### Custom File System

Implement your own file system:

```typescript
import { IFileSystem, FileStats } from '@rcs-lang/file-system';

class S3FileSystem implements IFileSystem {
  constructor(private s3Client: S3Client) {}
  
  async readFile(path: string): Promise<string> {
    const result = await this.s3Client.getObject({
      Bucket: 'my-bucket',
      Key: path
    }).promise();
    return result.Body?.toString() || '';
  }
  
  async writeFile(path: string, content: string): Promise<void> {
    await this.s3Client.putObject({
      Bucket: 'my-bucket',
      Key: path,
      Body: content
    }).promise();
  }
  
  // Implement other methods...
}
```

### Browser Setup

For browser environments, you may need to configure virtual file paths:

```typescript
import { BrowserFileSystem } from '@rcs-lang/file-system';

const fs = new BrowserFileSystem();

// Load files from user input
const fileInput = document.getElementById('file-input') as HTMLInputElement;
fileInput.addEventListener('change', async (event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    for (const file of files) {
      const content = await file.text();
      await fs.setFile(`virtual://project/${file.name}`, content);
    }
  }
});
```

### Testing with Memory File System

```typescript
import { MemoryFileSystem } from '@rcs-lang/file-system';

describe('RCL Compiler', () => {
  let fs: MemoryFileSystem;
  
  beforeEach(() => {
    fs = new MemoryFileSystem();
    fs.setFile('/input.rcl', `
      agent TestAgent
        displayName: "Test"
        flow Main
          start: Welcome
        messages Messages
          text Welcome "Hello"
    `);
  });
  
  test('compiles successfully', async () => {
    const compiler = new RCLCompiler({ fileSystem: fs });
    const result = await compiler.compileFile('/input.rcl');
    
    expect(result.success).toBe(true);
    
    // Check output was written
    const outputExists = await fs.exists('/output.json');
    expect(outputExists).toBe(true);
  });
});
```

## Path Utilities

Cross-platform path manipulation:

```typescript
import { IFileSystem } from '@rcs-lang/file-system';

const fs = getFileSystem();

// All file systems provide path utilities
const fullPath = fs.resolve('./relative/path.rcl');
const dir = fs.dirname('/path/to/file.rcl');        // '/path/to'
const name = fs.basename('/path/to/file.rcl');      // 'file.rcl'
const ext = fs.extname('/path/to/file.rcl');        // '.rcl'
const joined = fs.join('/path', 'to', 'file.rcl');  // '/path/to/file.rcl'
```

## Error Handling

File system operations return appropriate errors:

```typescript
try {
  const content = await fs.readFile('/nonexistent.rcl');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('File not found');
  }
}

// Or check existence first
if (await fs.exists('/file.rcl')) {
  const content = await fs.readFile('/file.rcl');
}
```

## Contributing

See the main repository README for contribution guidelines.

## License

MIT