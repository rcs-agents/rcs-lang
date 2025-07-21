import type { IFileSystem, IFileSystemProvider } from '@rcs-lang/core';
import { MemoryFileSystem } from './memoryFileSystem.js';
import { NodeFileSystem } from './nodeFileSystem.js';
import { BrowserFileSystem } from './browserFileSystem.js';

/**
 * Node.js file system provider
 */
export class NodeFileSystemProvider implements IFileSystemProvider {
  private fileSystem: any;

  constructor() {
    try {
      this.fileSystem = new NodeFileSystem();
    } catch (error) {
      // NodeFileSystem not available
    }
  }

  getFileSystem(): IFileSystem {
    return this.fileSystem;
  }

  getName(): string {
    return 'node';
  }

  isAvailable(): boolean {
    return (
      this.fileSystem !== undefined &&
      typeof process !== 'undefined' &&
      process.versions &&
      process.versions.node !== undefined
    );
  }
}

/**
 * Browser file system provider
 */
export class BrowserFileSystemProvider implements IFileSystemProvider {
  private fileSystem: any;

  constructor() {
    try {
      this.fileSystem = new BrowserFileSystem();
    } catch (error) {
      // BrowserFileSystem not available
    }
  }

  getFileSystem(): IFileSystem {
    return this.fileSystem;
  }

  getName(): string {
    return 'browser';
  }

  isAvailable(): boolean {
    return this.fileSystem !== undefined && typeof globalThis !== 'undefined' && (globalThis as any).window;
  }
}

/**
 * Memory file system provider
 */
export class MemoryFileSystemProvider implements IFileSystemProvider {
  private fileSystem: MemoryFileSystem;

  constructor() {
    this.fileSystem = new MemoryFileSystem();
  }

  getFileSystem(): IFileSystem {
    return this.fileSystem;
  }

  getName(): string {
    return 'memory';
  }

  isAvailable(): boolean {
    return true; // Always available
  }
}

/**
 * Factory for creating file system instances
 */
export class FileSystemFactory {
  private static providers: Map<string, IFileSystemProvider> = new Map();

  static {
    // Register default providers
    FileSystemFactory.registerProvider(new NodeFileSystemProvider());
    FileSystemFactory.registerProvider(new BrowserFileSystemProvider());
    FileSystemFactory.registerProvider(new MemoryFileSystemProvider());
  }

  /**
   * Register a file system provider
   */
  static registerProvider(provider: IFileSystemProvider): void {
    FileSystemFactory.providers.set(provider.getName(), provider);
  }

  /**
   * Get a file system by name
   */
  static getFileSystem(name: string): IFileSystem | null {
    const provider = FileSystemFactory.providers.get(name);
    if (!provider || !provider.isAvailable()) {
      return null;
    }
    return provider.getFileSystem();
  }

  /**
   * Get the default file system for the current environment
   */
  static getDefault(): IFileSystem {
    // Try Node.js first
    const nodeProvider = FileSystemFactory.providers.get('node');
    if (nodeProvider?.isAvailable()) {
      return nodeProvider.getFileSystem();
    }

    // Try browser next
    const browserProvider = FileSystemFactory.providers.get('browser');
    if (browserProvider?.isAvailable()) {
      return browserProvider.getFileSystem();
    }

    // Fall back to memory
    const memoryProvider = FileSystemFactory.providers.get('memory');
    if (memoryProvider) {
      return memoryProvider.getFileSystem();
    }

    throw new Error('No file system provider available');
  }

  /**
   * Get all available file system names
   */
  static getAvailable(): string[] {
    const available: string[] = [];
    for (const [name, provider] of FileSystemFactory.providers) {
      if (provider.isAvailable()) {
        available.push(name);
      }
    }
    return available;
  }
}
