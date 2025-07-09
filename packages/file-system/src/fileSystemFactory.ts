import { IFileSystem, IFileSystemProvider } from '@rcl/core-interfaces';
import { NodeFileSystem } from './nodeFileSystem';
import { MemoryFileSystem } from './memoryFileSystem';

/**
 * Node.js file system provider
 */
export class NodeFileSystemProvider implements IFileSystemProvider {
  private fileSystem: NodeFileSystem;
  
  constructor() {
    this.fileSystem = new NodeFileSystem();
  }
  
  getFileSystem(): IFileSystem {
    return this.fileSystem;
  }
  
  getName(): string {
    return 'node';
  }
  
  isAvailable(): boolean {
    return typeof process !== 'undefined' && 
           process.versions && 
           process.versions.node !== undefined;
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
    this.registerProvider(new NodeFileSystemProvider());
    this.registerProvider(new MemoryFileSystemProvider());
  }
  
  /**
   * Register a file system provider
   */
  static registerProvider(provider: IFileSystemProvider): void {
    this.providers.set(provider.getName(), provider);
  }
  
  /**
   * Get a file system by name
   */
  static getFileSystem(name: string): IFileSystem | null {
    const provider = this.providers.get(name);
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
    const nodeProvider = this.providers.get('node');
    if (nodeProvider && nodeProvider.isAvailable()) {
      return nodeProvider.getFileSystem();
    }
    
    // Fall back to memory
    const memoryProvider = this.providers.get('memory');
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
    for (const [name, provider] of this.providers) {
      if (provider.isAvailable()) {
        available.push(name);
      }
    }
    return available;
  }
}