import { type Result, err, ok } from '@rcs-lang/core';
import type { IFileStats, IFileSystem } from '@rcs-lang/core';

/**
 * Internal structure for storing file data in IndexedDB.
 * @internal
 */
interface BrowserFile {
  path: string;
  content: string;
  size: number;
  mtime: number;
  ctime: number;
  atime: number;
}

/**
 * Internal structure for storing directory data in IndexedDB.
 * @internal
 */
interface BrowserDirectory {
  path: string;
  ctime: number;
}

/**
 * Browser filesystem implementation using IndexedDB for persistent storage.
 *
 * @remarks
 * This implementation provides a virtual filesystem that persists data in the
 * browser's IndexedDB. It's designed for web applications that need filesystem-like
 * operations without access to the actual filesystem.
 *
 * Features:
 * - Persistent storage across browser sessions
 * - Async operations (required by IndexedDB)
 * - Subject to browser storage quotas
 * - Path-based file organization
 * - Full IFileSystem interface support
 *
 * Limitations:
 * - Storage quota (typically 50MB-1GB depending on browser)
 * - Slower than memory or native filesystem
 * - No streaming support
 * - Files stored as strings only
 * - Private browsing may clear data on session end
 *
 * @example
 * Basic usage
 * ```typescript
 * const fs = new BrowserFileSystem();
 *
 * // Write a file
 * await fs.writeFile('/config.json', JSON.stringify({ theme: 'dark' }));
 *
 * // Read it back
 * const result = await fs.readFile('/config.json');
 * if (result.success) {
 *   const config = JSON.parse(result.value);
 * }
 * ```
 *
 * @example
 * With persistence
 * ```typescript
 * const fs = new BrowserFileSystem('my-app-files');
 *
 * // Write files
 * await fs.writeFile('/data/settings.json', '{}');
 *
 * // Save to IndexedDB
 * await fs.saveToIndexedDB();
 *
 * // Later, in a new session...
 * await fs.loadFromIndexedDB();
 * const result = await fs.readFile('/data/settings.json'); // Still there!
 * ```
 *
 * @see {@link NodeFileSystem} for native filesystem access
 * @see {@link MemoryFileSystem} for non-persistent in-memory storage
 */
export class BrowserFileSystem implements IFileSystem {
  private files: Map<string, BrowserFile> = new Map();
  private directories: Set<string> = new Set();
  private dbName: string;
  private db: IDBDatabase | null = null;

  /**
   * Creates a new BrowserFileSystem instance.
   *
   * @param dbName - IndexedDB database name (default: 'rcs-lang-fs')
   *
   * @remarks
   * The root directory (/) is automatically created. The database is opened
   * lazily on first I/O operation to avoid blocking construction.
   */
  constructor(dbName = 'rcs-lang-fs') {
    this.dbName = dbName;
    this.directories.add('/');
  }

  /**
   * Opens the IndexedDB database connection.
   * @internal
   */
  private async openDB(): Promise<Result<IDBDatabase>> {
    if (this.db) {
      return ok(this.db);
    }

    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        resolve(err(new Error(`Failed to open IndexedDB: ${request.error?.message}`)));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(ok(this.db));
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'path' });
        }
        if (!db.objectStoreNames.contains('directories')) {
          db.createObjectStore('directories', { keyPath: 'path' });
        }
      };
    });
  }

  /**
   * Loads all files and directories from IndexedDB into memory.
   *
   * @returns Result containing void on success, or an error
   *
   * @remarks
   * This should be called when your application starts to restore the
   * filesystem state from the previous session. Files are loaded into
   * memory for fast access.
   *
   * @example
   * ```typescript
   * const fs = new BrowserFileSystem();
   * const result = await fs.loadFromIndexedDB();
   * if (result.success) {
   *   console.log('Filesystem restored');
   * }
   * ```
   *
   * @see {@link saveToIndexedDB} for persisting changes
   */
  async loadFromIndexedDB(): Promise<Result<void>> {
    const dbResult = await this.openDB();
    if (!dbResult.success) {
      return err(dbResult.error);
    }

    const db = dbResult.value;

    try {
      // Load files
      const filesResult = await this.loadObjectStore<BrowserFile>(db, 'files');
      if (!filesResult.success) {
        return err(filesResult.error);
      }

      this.files.clear();
      for (const file of filesResult.value) {
        this.files.set(file.path, file);
      }

      // Load directories
      const dirsResult = await this.loadObjectStore<BrowserDirectory>(db, 'directories');
      if (!dirsResult.success) {
        return err(dirsResult.error);
      }

      this.directories.clear();
      this.directories.add('/'); // Root always exists
      for (const dir of dirsResult.value) {
        this.directories.add(dir.path);
      }

      return ok(undefined);
    } catch (error) {
      return err(new Error(`Failed to load from IndexedDB: ${error}`));
    }
  }

  /**
   * Saves all files and directories from memory to IndexedDB.
   *
   * @returns Result containing void on success, or an error
   *
   * @remarks
   * Call this method to persist filesystem changes to IndexedDB. Without
   * calling this, changes only exist in memory and will be lost on page reload.
   *
   * @example
   * ```typescript
   * const fs = new BrowserFileSystem();
   * await fs.writeFile('/data.txt', 'important');
   * await fs.saveToIndexedDB(); // Persist to disk
   * ```
   *
   * @see {@link loadFromIndexedDB} for restoring state
   */
  async saveToIndexedDB(): Promise<Result<void>> {
    const dbResult = await this.openDB();
    if (!dbResult.success) {
      return err(dbResult.error);
    }

    const db = dbResult.value;

    try {
      // Save files
      const filesResult = await this.saveObjectStore(db, 'files', Array.from(this.files.values()));
      if (!filesResult.success) {
        return err(filesResult.error);
      }

      // Save directories
      const dirs: BrowserDirectory[] = Array.from(this.directories).map((path) => ({
        path,
        ctime: Date.now(),
      }));
      const dirsResult = await this.saveObjectStore(db, 'directories', dirs);
      if (!dirsResult.success) {
        return err(dirsResult.error);
      }

      return ok(undefined);
    } catch (error) {
      return err(new Error(`Failed to save to IndexedDB: ${error}`));
    }
  }

  /**
   * Helper to load all records from an object store.
   * @internal
   */
  private loadObjectStore<T>(db: IDBDatabase, storeName: string): Promise<Result<T[]>> {
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(ok(request.result as T[]));
      };

      request.onerror = () => {
        resolve(err(new Error(`Failed to load from ${storeName}: ${request.error?.message}`)));
      };
    });
  }

  /**
   * Helper to save records to an object store.
   * @internal
   */
  private saveObjectStore<T>(db: IDBDatabase, storeName: string, records: T[]): Promise<Result<void>> {
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      // Clear existing records
      store.clear();

      // Add new records
      for (const record of records) {
        store.add(record);
      }

      transaction.oncomplete = () => {
        resolve(ok(undefined));
      };

      transaction.onerror = () => {
        resolve(err(new Error(`Failed to save to ${storeName}: ${transaction.error?.message}`)));
      };
    });
  }

  /**
   * Reads a file from the browser filesystem.
   *
   * @param filePath - Path to the file to read
   * @param _encoding - Character encoding (unused, always UTF-8)
   * @returns Result containing file contents or an error if file doesn't exist
   *
   * @example
   * ```typescript
   * const fs = new BrowserFileSystem();
   * const result = await fs.readFile('/data.json');
   * if (result.success) {
   *   console.log(result.value);
   * }
   * ```
   */
  async readFile(filePath: string, _encoding = 'utf8'): Promise<Result<string>> {
    const normalizedPath = this.normalize(filePath);
    const file = this.files.get(normalizedPath);

    if (!file) {
      return err(new Error(`ENOENT: no such file or directory, open '${filePath}'`));
    }

    // Update access time
    file.atime = Date.now();

    return ok(file.content);
  }

  /**
   * Writes content to a file in the browser filesystem.
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
   * Files are kept in memory until {@link saveToIndexedDB} is called.
   *
   * @example
   * ```typescript
   * const fs = new BrowserFileSystem();
   * await fs.mkdir('/data', true);
   * await fs.writeFile('/data/config.json', '{"theme":"dark"}');
   * await fs.saveToIndexedDB(); // Persist to IndexedDB
   * ```
   */
  async writeFile(filePath: string, content: string, _encoding = 'utf8'): Promise<Result<void>> {
    const normalizedPath = this.normalize(filePath);
    const dir = this.dirname(normalizedPath);

    // Ensure parent directory exists
    if (!this.directories.has(dir)) {
      return err(new Error(`ENOENT: no such file or directory, open '${filePath}'`));
    }

    const now = Date.now();
    const existingFile = this.files.get(normalizedPath);

    this.files.set(normalizedPath, {
      path: normalizedPath,
      content,
      size: content.length,
      mtime: now,
      ctime: existingFile?.ctime ?? now,
      atime: now,
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
      size: file.size,
      isFile: () => true,
      isDirectory: () => false,
      isSymbolicLink: () => false,
      mtime: new Date(file.mtime),
      ctime: new Date(file.ctime),
      atime: new Date(file.atime),
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
   * Creates a directory in the browser filesystem.
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
   * Deletes a file from the browser filesystem.
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
   * Removes a directory from the browser filesystem.
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
    return (
      segments
        .filter((s) => s && s !== '.')
        .join('/')
        .replace(/\/+/g, '/')
        .replace(/\/$/, '') || '.'
    );
  }

  /**
   * Resolves path segments to a normalized absolute path.
   *
   * @param segments - Path segments to resolve
   * @returns Normalized absolute path
   */
  resolve(...segments: string[]): string {
    let resolved = '';
    let absolute = false;

    for (let i = segments.length - 1; i >= -1 && !absolute; i--) {
      const path = i >= 0 ? segments[i] : '/';
      if (!path) continue;

      resolved = path + '/' + resolved;
      absolute = path.charAt(0) === '/';
    }

    resolved = this.normalizeArray(
      resolved.split('/').filter((p) => !!p),
      !absolute,
    ).join('/');
    return (absolute ? '/' : '') + resolved || '.';
  }

  /**
   * Gets the directory portion of a path.
   *
   * @param filePath - Path to extract directory from
   * @returns Directory path
   */
  dirname(filePath: string): string {
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    return dir || (filePath.charAt(0) === '/' ? '/' : '.');
  }

  /**
   * Gets the filename portion of a path.
   *
   * @param filePath - Path to extract basename from
   * @param ext - Optional extension to remove
   * @returns Filename with or without extension
   */
  basename(filePath: string, ext?: string): string {
    let base = filePath.substring(filePath.lastIndexOf('/') + 1);
    if (ext && base.endsWith(ext)) {
      base = base.substring(0, base.length - ext.length);
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
    const dot = filePath.lastIndexOf('.');
    const slash = filePath.lastIndexOf('/');
    return dot > slash ? filePath.substring(dot) : '';
  }

  /**
   * Checks if a path is absolute (starts with /).
   *
   * @param filePath - Path to check
   * @returns True if absolute, false otherwise
   */
  isAbsolute(filePath: string): boolean {
    return filePath.charAt(0) === '/';
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
   * Helper to normalize path arrays, resolving . and ..
   * @internal
   */
  private normalizeArray(parts: string[], allowAboveRoot: boolean): string[] {
    const up = [];
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p === '..') {
        if (up.length && up[up.length - 1] !== '..') {
          up.pop();
        } else if (allowAboveRoot) {
          up.push('..');
        }
      } else if (p && p !== '.') {
        up.push(p);
      }
    }
    return up;
  }

  /**
   * Clears all files and directories except the root directory.
   *
   * @remarks
   * This does not clear IndexedDB. Call {@link saveToIndexedDB} after clearing
   * if you want to persist the empty state.
   *
   * @example
   * ```typescript
   * const fs = new BrowserFileSystem();
   * fs.clear();
   * await fs.saveToIndexedDB(); // Persist the clear
   * ```
   */
  clear(): void {
    this.files.clear();
    this.directories.clear();
    this.directories.add('/');
  }

  /**
   * Closes the IndexedDB connection.
   *
   * @remarks
   * Call this when you're done with the filesystem to free resources.
   * After closing, operations that need the database will reopen it.
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
