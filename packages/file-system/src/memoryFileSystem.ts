import { type Result, err, ok } from '@rcs-lang/core';
import type { IFileStats, IFileSystem } from '@rcs-lang/core';

/**
 * Internal structure for storing file data in memory.
 * @internal
 */
interface MemoryFile {
  content: string;
  stats: {
    size: number;
    mtime: Date;
    ctime: Date;
    atime: Date;
  };
}

/**
 * In-memory file system implementation for testing and browser environments.
 *
 * @remarks
 * This implementation stores all files and directories in memory using Map and Set
 * data structures. It's ideal for:
 * - Unit tests that don't need real filesystem access
 * - Browser environments where filesystem access is limited
 * - Sandboxed environments
 * - Temporary file operations that don't need persistence
 *
 * All file paths are automatically normalized to use forward slashes and start
 * with a leading slash. The root directory (/) always exists and cannot be removed.
 *
 * @example
 * Basic usage
 * ```typescript
 * const fs = new MemoryFileSystem();
 *
 * // Create directory
 * await fs.mkdir('/project/src', true);
 *
 * // Write file
 * await fs.writeFile('/project/src/index.ts', 'export const x = 1;');
 *
 * // Read file
 * const result = await fs.readFile('/project/src/index.ts');
 * if (result.success) {
 *   console.log(result.value);
 * }
 * ```
 *
 * @example
 * Testing usage
 * ```typescript
 * describe('MyCompiler', () => {
 *   let fs: MemoryFileSystem;
 *
 *   beforeEach(() => {
 *     fs = new MemoryFileSystem();
 *     // Pre-populate with test files
 *     await fs.mkdir('/test', true);
 *     await fs.writeFile('/test/input.txt', 'test data');
 *   });
 *
 *   afterEach(() => {
 *     fs.clear(); // Clean up
 *   });
 * });
 * ```
 *
 * @see {@link NodeFileSystem} for real filesystem access
 * @see {@link BrowserFileSystem} for persistent browser storage
 */
export class MemoryFileSystem implements IFileSystem {
  private files: Map<string, MemoryFile> = new Map();
  private directories: Set<string> = new Set();

  /**
   * Creates a new MemoryFileSystem instance.
   *
   * @remarks
   * The root directory (/) is automatically created and cannot be removed.
   */
  constructor() {
    // Root directory always exists
    this.directories.add('/');
  }

  /**
   * Reads a file from memory as a UTF-8 string.
   *
   * @param filePath - Path to the file to read
   * @param _encoding - Character encoding (unused, always UTF-8)
   * @returns Result containing file contents or an error if file doesn't exist
   *
   * @example
   * ```typescript
   * const fs = new MemoryFileSystem();
   * await fs.writeFile('/data.txt', 'Hello');
   * const result = await fs.readFile('/data.txt');
   * // result.value === 'Hello'
   * ```
   */
  async readFile(filePath: string, _encoding?: string): Promise<Result<string>> {
    const normalizedPath = this.normalize(filePath);
    const file = this.files.get(normalizedPath);

    if (!file) {
      return err(new Error(`ENOENT: no such file or directory, open '${filePath}'`));
    }

    return ok(file.content);
  }

  /**
   * Writes content to a file in memory.
   *
   * @param filePath - Path to the file to write
   * @param content - String content to write
   * @param _encoding - Character encoding (unused, always UTF-8)
   * @returns Result containing void on success or an error if parent directory doesn't exist
   *
   * @remarks
   * The parent directory must exist before writing. Use {@link mkdir} with
   * recursive: true to ensure the parent directory exists.
   *
   * @example
   * ```typescript
   * const fs = new MemoryFileSystem();
   * await fs.mkdir('/project', true);
   * await fs.writeFile('/project/readme.md', '# My Project');
   * ```
   */
  async writeFile(filePath: string, content: string, _encoding?: string): Promise<Result<void>> {
    const normalizedPath = this.normalize(filePath);
    const dir = this.dirname(normalizedPath);

    // Ensure parent directory exists
    if (!this.directories.has(dir)) {
      return err(new Error(`ENOENT: no such file or directory, open '${filePath}'`));
    }

    const now = new Date();
    this.files.set(normalizedPath, {
      content,
      stats: {
        size: content.length,
        mtime: now,
        ctime: now,
        atime: now,
      },
    });

    return ok(undefined);
  }

  /**
   * Checks if a file or directory exists at the given path.
   *
   * @param filePath - Path to check
   * @returns Result always containing true if exists, false otherwise
   */
  async exists(filePath: string): Promise<Result<boolean>> {
    const normalizedPath = this.normalize(filePath);
    return ok(this.files.has(normalizedPath) || this.directories.has(normalizedPath));
  }

  /**
   * Gets file or directory statistics.
   *
   * @param filePath - Path to the file or directory
   * @returns Result containing file statistics or an error if path doesn't exist
   */
  async stat(filePath: string): Promise<Result<IFileStats>> {
    const normalizedPath = this.normalize(filePath);

    if (this.directories.has(normalizedPath)) {
      const now = new Date();
      return ok({
        size: 0,
        isFile: () => false,
        isDirectory: () => true,
        isSymbolicLink: () => false,
        mtime: now,
        ctime: now,
        atime: now,
      });
    }

    const file = this.files.get(normalizedPath);
    if (!file) {
      return err(new Error(`ENOENT: no such file or directory, stat '${filePath}'`));
    }

    return ok({
      size: file.stats.size,
      isFile: () => true,
      isDirectory: () => false,
      isSymbolicLink: () => false,
      mtime: file.stats.mtime,
      ctime: file.stats.ctime,
      atime: file.stats.atime,
    });
  }

  /**
   * Lists all entries in a directory.
   *
   * @param dirPath - Path to the directory
   * @returns Result containing array of entry names or an error if directory doesn't exist
   */
  async readdir(dirPath: string): Promise<Result<string[]>> {
    const normalizedPath = this.normalize(dirPath);

    if (!this.directories.has(normalizedPath)) {
      return err(new Error(`ENOENT: no such file or directory, scandir '${dirPath}'`));
    }

    const entries: string[] = [];
    const prefix = normalizedPath === '/' ? '/' : `${normalizedPath}/`;

    // Find all files and directories in this directory
    for (const filePath of this.files.keys()) {
      if (filePath.startsWith(prefix)) {
        const relative = filePath.slice(prefix.length);
        const firstSlash = relative.indexOf('/');
        if (firstSlash === -1) {
          entries.push(relative);
        }
      }
    }

    for (const dirPath of this.directories) {
      if (dirPath !== normalizedPath && dirPath.startsWith(prefix)) {
        const relative = dirPath.slice(prefix.length);
        const firstSlash = relative.indexOf('/');
        if (firstSlash === -1 && relative.length > 0) {
          entries.push(relative);
        }
      }
    }

    return ok([...new Set(entries)].sort());
  }

  /**
   * Creates a directory in memory.
   *
   * @param dirPath - Path to the directory to create
   * @param recursive - If true, creates parent directories as needed
   * @returns Result containing void on success or an error if parent doesn't exist
   */
  async mkdir(dirPath: string, recursive = false): Promise<Result<void>> {
    const normalizedPath = this.normalize(dirPath);

    if (this.directories.has(normalizedPath)) {
      return ok(undefined); // Already exists
    }

    const parent = this.dirname(normalizedPath);
    if (!this.directories.has(parent)) {
      if (!recursive) {
        return err(new Error(`ENOENT: no such file or directory, mkdir '${dirPath}'`));
      }
      // Create parent directories recursively
      const parts = normalizedPath.split('/').filter((p) => p);
      let current = '/';
      for (const part of parts) {
        current = this.join(current, part);
        this.directories.add(current);
      }
    } else {
      this.directories.add(normalizedPath);
    }

    return ok(undefined);
  }

  /**
   * Deletes a file from memory.
   *
   * @param filePath - Path to the file to delete
   * @returns Result containing void on success or an error if file doesn't exist
   */
  async unlink(filePath: string): Promise<Result<void>> {
    const normalizedPath = this.normalize(filePath);

    if (!this.files.has(normalizedPath)) {
      return err(new Error(`ENOENT: no such file or directory, unlink '${filePath}'`));
    }

    this.files.delete(normalizedPath);
    return ok(undefined);
  }

  /**
   * Removes a directory from memory.
   *
   * @param dirPath - Path to the directory to remove
   * @param recursive - If true, removes directory and all contents
   * @returns Result containing void on success or an error
   */
  async rmdir(dirPath: string, recursive = false): Promise<Result<void>> {
    const normalizedPath = this.normalize(dirPath);

    if (!this.directories.has(normalizedPath)) {
      return err(new Error(`ENOENT: no such file or directory, rmdir '${dirPath}'`));
    }

    // Check if directory is empty
    const prefix = normalizedPath === '/' ? '/' : `${normalizedPath}/`;
    const hasContents =
      Array.from(this.files.keys()).some((f) => f.startsWith(prefix)) ||
      Array.from(this.directories).some((d) => d !== normalizedPath && d.startsWith(prefix));

    if (hasContents && !recursive) {
      return err(new Error(`ENOTEMPTY: directory not empty, rmdir '${dirPath}'`));
    }

    if (recursive) {
      // Remove all contents
      for (const filePath of Array.from(this.files.keys())) {
        if (filePath.startsWith(prefix)) {
          this.files.delete(filePath);
        }
      }
      for (const subDir of Array.from(this.directories)) {
        if (subDir !== normalizedPath && subDir.startsWith(prefix)) {
          this.directories.delete(subDir);
        }
      }
    }

    this.directories.delete(normalizedPath);
    return ok(undefined);
  }

  /**
   * Joins path segments using forward slashes.
   *
   * @param segments - Path segments to join
   * @returns Joined path with normalized slashes
   */
  join(...segments: string[]): string {
    return segments.join('/').replace(/\/+/g, '/');
  }

  /**
   * Resolves path segments to a normalized absolute path.
   *
   * @param segments - Path segments to resolve
   * @returns Normalized absolute path
   */
  resolve(...segments: string[]): string {
    const joined = this.join(...segments);
    return this.normalize(joined);
  }

  /**
   * Gets the directory portion of a path.
   *
   * @param filePath - Path to extract directory from
   * @returns Directory path
   */
  dirname(filePath: string): string {
    const normalized = this.normalize(filePath);
    const lastSlash = normalized.lastIndexOf('/');
    return lastSlash <= 0 ? '/' : normalized.slice(0, lastSlash);
  }

  /**
   * Gets the filename portion of a path.
   *
   * @param filePath - Path to extract basename from
   * @param ext - Optional extension to remove
   * @returns Filename with or without extension
   */
  basename(filePath: string, ext?: string): string {
    const normalized = this.normalize(filePath);
    const lastSlash = normalized.lastIndexOf('/');
    const base = lastSlash === -1 ? normalized : normalized.slice(lastSlash + 1);

    if (ext && base.endsWith(ext)) {
      return base.slice(0, -ext.length);
    }

    return base;
  }

  /**
   * Gets the file extension from a path.
   *
   * @param filePath - Path to extract extension from
   * @returns Extension including the dot, or empty string
   */
  extname(filePath: string): string {
    const base = this.basename(filePath);
    const lastDot = base.lastIndexOf('.');
    return lastDot === -1 || lastDot === 0 ? '' : base.slice(lastDot);
  }

  /**
   * Checks if a path is absolute (starts with /).
   *
   * @param filePath - Path to check
   * @returns True if absolute, false otherwise
   */
  isAbsolute(filePath: string): boolean {
    return filePath.startsWith('/');
  }

  /**
   * Normalizes a path to use forward slashes and have a leading slash.
   * @internal
   */
  private normalize(filePath: string): string {
    // Simple normalization
    let normalized = filePath.replace(/\\/g, '/');
    if (!normalized.startsWith('/')) {
      normalized = `/${normalized}`;
    }
    // Remove trailing slash except for root
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }

  /**
   * Clears all files and directories except the root directory.
   *
   * @remarks
   * This is useful for cleaning up between tests or resetting the filesystem
   * to a fresh state. The root directory (/) is always preserved.
   *
   * @example
   * ```typescript
   * const fs = new MemoryFileSystem();
   * await fs.writeFile('/test.txt', 'data');
   * fs.clear();
   * const exists = await fs.exists('/test.txt'); // false
   * ```
   */
  clear(): void {
    this.files.clear();
    this.directories.clear();
    this.directories.add('/');
  }
}
