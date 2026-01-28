import { describe, expect, test } from 'bun:test';
import { FileSystemFactory, MemoryFileSystemProvider, NodeFileSystemProvider } from '../src/fileSystemFactory.js';

describe('FileSystemFactory', () => {
  test('should get Node.js filesystem when available', () => {
    const fs = FileSystemFactory.getFileSystem('node');
    expect(fs).not.toBeNull();
  });

  test('should get memory filesystem', () => {
    const fs = FileSystemFactory.getFileSystem('memory');
    expect(fs).not.toBeNull();
  });

  test('should return null for unavailable filesystem', () => {
    const fs = FileSystemFactory.getFileSystem('nonexistent');
    expect(fs).toBeNull();
  });

  test('should get default filesystem', () => {
    const fs = FileSystemFactory.getDefault();
    expect(fs).not.toBeNull();
  });

  test('should list available filesystems', () => {
    const available = FileSystemFactory.getAvailable();
    expect(available).toBeInstanceOf(Array);
    expect(available.length).toBeGreaterThan(0);
    expect(available).toContain('memory'); // Memory is always available
  });

  test('should register custom provider', () => {
    class TestProvider {
      getName() {
        return 'test';
      }
      isAvailable() {
        return true;
      }
      getFileSystem() {
        return new (class {
          async readFile() {
            return { success: true, value: 'test' };
          }
          async writeFile() {
            return { success: true, value: undefined };
          }
          async exists() {
            return { success: true, value: true };
          }
          async stat() {
            return {
              success: true,
              value: {
                size: 0,
                isFile: () => true,
                isDirectory: () => false,
                isSymbolicLink: () => false,
                mtime: new Date(),
                ctime: new Date(),
                atime: new Date(),
              },
            };
          }
          async readdir() {
            return { success: true, value: [] };
          }
          async mkdir() {
            return { success: true, value: undefined };
          }
          async unlink() {
            return { success: true, value: undefined };
          }
          async rmdir() {
            return { success: true, value: undefined };
          }
          join(...segments: string[]) {
            return segments.join('/');
          }
          resolve(...segments: string[]) {
            return '/' + segments.join('/');
          }
          dirname(p: string) {
            return p.substring(0, p.lastIndexOf('/'));
          }
          basename(p: string) {
            return p.substring(p.lastIndexOf('/') + 1);
          }
          extname(p: string) {
            const dot = p.lastIndexOf('.');
            return dot > 0 ? p.substring(dot) : '';
          }
          isAbsolute(p: string) {
            return p.startsWith('/');
          }
        })() as any;
      }
    }

    FileSystemFactory.registerProvider(new TestProvider() as any);
    const fs = FileSystemFactory.getFileSystem('test');
    expect(fs).not.toBeNull();
  });
});

describe('NodeFileSystemProvider', () => {
  test('should have correct name', () => {
    const provider = new NodeFileSystemProvider();
    expect(provider.getName()).toBe('node');
  });

  test('should be available in Node.js', () => {
    const provider = new NodeFileSystemProvider();
    expect(provider.isAvailable()).toBe(true);
  });

  test('should provide filesystem instance', () => {
    const provider = new NodeFileSystemProvider();
    if (provider.isAvailable()) {
      const fs = provider.getFileSystem();
      expect(fs).not.toBeNull();
      expect(typeof fs.readFile).toBe('function');
    }
  });
});

describe('MemoryFileSystemProvider', () => {
  test('should have correct name', () => {
    const provider = new MemoryFileSystemProvider();
    expect(provider.getName()).toBe('memory');
  });

  test('should always be available', () => {
    const provider = new MemoryFileSystemProvider();
    expect(provider.isAvailable()).toBe(true);
  });

  test('should provide filesystem instance', () => {
    const provider = new MemoryFileSystemProvider();
    const fs = provider.getFileSystem();
    expect(fs).not.toBeNull();
    expect(typeof fs.readFile).toBe('function');
  });
});
