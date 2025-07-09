import type { IFileSystem, IFileSystemProvider } from '@rcl/core';
import { MemoryFileSystem } from './memoryFileSystem';

// Conditional imports to avoid Node.js modules in browser
let NodeFileSystem: any = null;
let BrowserFileSystem: any = null;

try {
  // Only import NodeFileSystem if we're in Node.js environment
  if (typeof process !== 'undefined' && process.versions?.node) {
    NodeFileSystem = require('./nodeFileSystem').NodeFileSystem;
  }
} catch (error) {
  // Ignore import errors in browser
}

try {
  // Try to import browser file system if available
  if (typeof globalThis !== 'undefined' && (globalThis as any).window) {
    BrowserFileSystem = require('./browserFileSystem').BrowserFileSystem;
  }
} catch (error) {
  // Ignore import errors if not available
}

/**
 * Node.js file system provider
 */
export class NodeFileSystemProvider implements IFileSystemProvider {
  private fileSystem: any;

  constructor() {
    if (NodeFileSystem) {
      this.fileSystem = new NodeFileSystem();
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
      NodeFileSystem &&
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
    if (BrowserFileSystem) {
      this.fileSystem = new BrowserFileSystem();
    }
  }

  getFileSystem(): IFileSystem {
    return this.fileSystem;
  }

  getName(): string {
    return 'browser';
  }

  isAvailable(): boolean {
    return BrowserFileSystem && typeof globalThis !== 'undefined' && (globalThis as any).window;
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
