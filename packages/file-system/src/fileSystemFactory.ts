import type { IFileSystem, IFileSystemProvider } from '@rcs-lang/core';
import { MemoryFileSystem } from './memoryFileSystem.js';
import { NodeFileSystem } from './nodeFileSystem.js';
import { BrowserFileSystem } from './browserFileSystem.js';

/**
 * Provider for Node.js filesystem implementation.
 *
 * @remarks
 * Automatically detects Node.js environment by checking for process.versions.node.
 * This provider will be unavailable in browser environments.
 *
 * The provider uses lazy initialization to avoid importing Node.js modules in
 * non-Node environments, which could cause runtime errors.
 *
 * @example
 * ```typescript
 * const provider = new NodeFileSystemProvider();
 * if (provider.isAvailable()) {
 *   const fs = provider.getFileSystem();
 *   await fs.readFile('/path/to/file.txt');
 * }
 * ```
 *
 * @see {@link NodeFileSystem} for the underlying implementation
 */
export class NodeFileSystemProvider implements IFileSystemProvider {
  private fileSystem: NodeFileSystem | undefined;

  /**
   * Creates a new Node.js filesystem provider.
   *
   * @remarks
   * Attempts to initialize a NodeFileSystem instance. If initialization fails
   * (e.g., in browser environment), the provider will report as unavailable.
   */
  constructor() {
    try {
      this.fileSystem = new NodeFileSystem();
    } catch (error) {
      // NodeFileSystem not available in this environment
      this.fileSystem = undefined;
    }
  }

  /**
   * Gets the Node.js filesystem instance.
   *
   * @returns The filesystem implementation
   * @throws Error if the filesystem is not available
   */
  getFileSystem(): IFileSystem {
    if (!this.fileSystem) {
      throw new Error('Node.js filesystem not available in this environment');
    }
    return this.fileSystem;
  }

  /**
   * Gets the provider name.
   *
   * @returns The string 'node'
   */
  getName(): string {
    return 'node';
  }

  /**
   * Checks if Node.js filesystem is available.
   *
   * @returns True if running in Node.js environment, false otherwise
   */
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
 * Provider for browser filesystem implementation.
 *
 * @remarks
 * Automatically detects browser environment by checking for window global.
 * This provider uses IndexedDB for persistent storage in the browser.
 *
 * Browser storage has limitations:
 * - Storage quota limits (varies by browser, typically 50MB-1GB)
 * - Async-only APIs
 * - No direct filesystem access
 * - Data persists until explicitly cleared
 *
 * @example
 * ```typescript
 * const provider = new BrowserFileSystemProvider();
 * if (provider.isAvailable()) {
 *   const fs = provider.getFileSystem();
 *   await fs.writeFile('virtual://app/config.json', '{}');
 * }
 * ```
 *
 * @see {@link BrowserFileSystem} for the underlying implementation
 */
export class BrowserFileSystemProvider implements IFileSystemProvider {
  private fileSystem: BrowserFileSystem | undefined;

  /**
   * Creates a new browser filesystem provider.
   *
   * @remarks
   * Attempts to initialize a BrowserFileSystem instance. If initialization fails,
   * the provider will report as unavailable.
   */
  constructor() {
    try {
      this.fileSystem = new BrowserFileSystem();
    } catch (error) {
      // BrowserFileSystem not available in this environment
      this.fileSystem = undefined;
    }
  }

  /**
   * Gets the browser filesystem instance.
   *
   * @returns The filesystem implementation
   * @throws Error if the filesystem is not available
   */
  getFileSystem(): IFileSystem {
    if (!this.fileSystem) {
      throw new Error('Browser filesystem not available in this environment');
    }
    return this.fileSystem;
  }

  /**
   * Gets the provider name.
   *
   * @returns The string 'browser'
   */
  getName(): string {
    return 'browser';
  }

  /**
   * Checks if browser filesystem is available.
   *
   * @returns True if running in browser environment, false otherwise
   */
  isAvailable(): boolean {
    return this.fileSystem !== undefined && typeof globalThis !== 'undefined' && (globalThis as any).window;
  }
}

/**
 * Provider for in-memory filesystem implementation.
 *
 * @remarks
 * This provider is always available in all environments. It stores files
 * in memory with no persistence - all data is lost when the process ends.
 *
 * Ideal for:
 * - Unit tests
 * - Sandboxed execution
 * - Temporary file operations
 * - Mock filesystem scenarios
 *
 * @example
 * ```typescript
 * const provider = new MemoryFileSystemProvider();
 * const fs = provider.getFileSystem();
 * await fs.mkdir('/tmp', true);
 * await fs.writeFile('/tmp/test.txt', 'data');
 * ```
 *
 * @see {@link MemoryFileSystem} for the underlying implementation
 */
export class MemoryFileSystemProvider implements IFileSystemProvider {
  private fileSystem: MemoryFileSystem;

  /**
   * Creates a new memory filesystem provider with a fresh filesystem instance.
   */
  constructor() {
    this.fileSystem = new MemoryFileSystem();
  }

  /**
   * Gets the in-memory filesystem instance.
   *
   * @returns The filesystem implementation
   */
  getFileSystem(): IFileSystem {
    return this.fileSystem;
  }

  /**
   * Gets the provider name.
   *
   * @returns The string 'memory'
   */
  getName(): string {
    return 'memory';
  }

  /**
   * Checks if memory filesystem is available.
   *
   * @returns Always returns true
   */
  isAvailable(): boolean {
    return true; // Always available
  }
}

/**
 * Factory for creating and managing filesystem implementations.
 *
 * @remarks
 * The FileSystemFactory uses a registry pattern to manage multiple filesystem
 * providers. It automatically registers Node.js, browser, and memory providers
 * on first use.
 *
 * The factory provides:
 * - Automatic environment detection
 * - Custom provider registration
 * - Fallback chain (Node → Browser → Memory)
 * - Query available providers
 *
 * @example
 * Get default filesystem
 * ```typescript
 * const fs = FileSystemFactory.getDefault();
 * // Returns NodeFileSystem in Node.js
 * // Returns BrowserFileSystem in browsers
 * // Falls back to MemoryFileSystem
 * ```
 *
 * @example
 * Get specific filesystem
 * ```typescript
 * const memoryFs = FileSystemFactory.getFileSystem('memory');
 * const nodeFs = FileSystemFactory.getFileSystem('node');
 * ```
 *
 * @example
 * Register custom provider
 * ```typescript
 * class S3FileSystemProvider implements IFileSystemProvider {
 *   getName() { return 's3'; }
 *   isAvailable() { return true; }
 *   getFileSystem() { return new S3FileSystem(); }
 * }
 *
 * FileSystemFactory.registerProvider(new S3FileSystemProvider());
 * const s3Fs = FileSystemFactory.getFileSystem('s3');
 * ```
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
   * Registers a filesystem provider with the factory.
   *
   * @param provider - The provider to register
   *
   * @remarks
   * If a provider with the same name already exists, it will be replaced.
   * This allows overriding default providers with custom implementations.
   *
   * @example
   * ```typescript
   * FileSystemFactory.registerProvider(new CustomProvider());
   * ```
   */
  static registerProvider(provider: IFileSystemProvider): void {
    FileSystemFactory.providers.set(provider.getName(), provider);
  }

  /**
   * Gets a filesystem by provider name.
   *
   * @param name - The provider name ('node', 'browser', 'memory', etc.)
   * @returns The filesystem implementation, or null if unavailable
   *
   * @remarks
   * Returns null if:
   * - The provider doesn't exist
   * - The provider exists but is not available in the current environment
   *
   * @example
   * ```typescript
   * const fs = FileSystemFactory.getFileSystem('node');
   * if (fs) {
   *   await fs.readFile('/path/to/file.txt');
   * } else {
   *   console.log('Node filesystem not available');
   * }
   * ```
   */
  static getFileSystem(name: string): IFileSystem | null {
    const provider = FileSystemFactory.providers.get(name);
    if (!provider || !provider.isAvailable()) {
      return null;
    }
    return provider.getFileSystem();
  }

  /**
   * Gets the default filesystem for the current environment.
   *
   * @returns The filesystem implementation
   * @throws Error if no providers are available (should never happen)
   *
   * @remarks
   * Uses the following fallback order:
   * 1. Node.js filesystem (if in Node.js)
   * 2. Browser filesystem (if in browser)
   * 3. Memory filesystem (always available)
   *
   * @example
   * ```typescript
   * const fs = FileSystemFactory.getDefault();
   * await fs.readFile('/path/to/file.txt');
   * ```
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
   * Gets names of all available filesystem providers.
   *
   * @returns Array of provider names that are available in the current environment
   *
   * @example
   * ```typescript
   * const available = FileSystemFactory.getAvailable();
   * // In Node.js: ['node', 'memory']
   * // In browser: ['browser', 'memory']
   * console.log(`Available filesystems: ${available.join(', ')}`);
   * ```
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
