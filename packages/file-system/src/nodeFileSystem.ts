import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { type Result, err, ok } from '@rcs-lang/core';
import type { IFileStats, IFileSystem } from '@rcs-lang/core';

/**
 * Node.js file system implementation using native fs/promises module.
 *
 * @remarks
 * This implementation wraps Node.js filesystem APIs with the Result pattern
 * for consistent error handling across all operations. It provides full access
 * to the native filesystem with proper async/await support.
 *
 * All methods return a Result type which contains either a successful value or
 * an error, eliminating the need for try-catch blocks in consumer code.
 *
 * @example
 * Basic file operations
 * ```typescript
 * const fs = new NodeFileSystem();
 *
 * // Read a file
 * const result = await fs.readFile('/path/to/file.txt');
 * if (result.success) {
 *   console.log(result.value);
 * } else {
 *   console.error(result.error);
 * }
 *
 * // Write a file
 * const writeResult = await fs.writeFile('/path/to/output.txt', 'content');
 * if (!writeResult.success) {
 *   console.error('Failed to write:', writeResult.error);
 * }
 * ```
 *
 * @see {@link IFileSystem} for the complete interface definition
 * @see {@link MemoryFileSystem} for an in-memory alternative
 * @see {@link BrowserFileSystem} for browser environments
 */
export class NodeFileSystem implements IFileSystem {
  /**
   * Reads a file from the filesystem as a UTF-8 string.
   *
   * @param filePath - Absolute or relative path to the file to read
   * @param encoding - Character encoding (default: 'utf8')
   * @returns Result containing file contents as a string, or an error if the file cannot be read
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   * const result = await fs.readFile('/config/settings.json');
   * if (result.success) {
   *   const config = JSON.parse(result.value);
   * }
   * ```
   *
   * @see {@link writeFile} for writing files
   */
  async readFile(filePath: string, encoding = 'utf8'): Promise<Result<string>> {
    try {
      const content = await fs.readFile(filePath, encoding as BufferEncoding);
      return ok(content);
    } catch (error) {
      return err(new Error(`Failed to read file ${filePath}: ${error}`));
    }
  }

  /**
   * Writes content to a file, creating it if it doesn't exist or overwriting if it does.
   *
   * @param filePath - Absolute or relative path to the file to write
   * @param content - String content to write to the file
   * @param encoding - Character encoding (default: 'utf8')
   * @returns Result containing void on success, or an error if the write fails
   *
   * @remarks
   * This method will create the file if it doesn't exist. If the parent directory
   * doesn't exist, the operation will fail with ENOENT. Use {@link mkdir} first
   * to ensure the directory exists.
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   * const result = await fs.writeFile('/tmp/output.txt', 'Hello, World!');
   * if (!result.success) {
   *   console.error('Write failed:', result.error);
   * }
   * ```
   *
   * @see {@link readFile} for reading files
   * @see {@link mkdir} for creating directories
   */
  async writeFile(filePath: string, content: string, encoding = 'utf8'): Promise<Result<void>> {
    try {
      await fs.writeFile(filePath, content, encoding as BufferEncoding);
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Failed to write file ${filePath}: ${error}`));
    }
  }

  /**
   * Checks if a file or directory exists at the given path.
   *
   * @param filePath - Absolute or relative path to check
   * @returns Result containing true if the path exists, false otherwise
   *
   * @remarks
   * This method always returns a successful Result with a boolean value.
   * It never returns an error, making it safe to use without error handling.
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   * const result = await fs.exists('/path/to/file.txt');
   * if (result.success && result.value) {
   *   console.log('File exists');
   * }
   * ```
   *
   * @see {@link stat} for getting file information
   */
  async exists(filePath: string): Promise<Result<boolean>> {
    try {
      await fs.access(filePath, constants.F_OK);
      return ok(true);
    } catch {
      return ok(false);
    }
  }

  /**
   * Gets file or directory statistics.
   *
   * @param filePath - Absolute or relative path to the file or directory
   * @returns Result containing file statistics, or an error if the path doesn't exist
   *
   * @remarks
   * Returns metadata including size, timestamps, and type information.
   * This does not follow symbolic links - use lstat() if you need link information.
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   * const result = await fs.stat('/path/to/file.txt');
   * if (result.success) {
   *   console.log('Size:', result.value.size);
   *   console.log('Is file:', result.value.isFile());
   *   console.log('Modified:', result.value.mtime);
   * }
   * ```
   *
   * @see {@link exists} for simple existence checks
   */
  async stat(filePath: string): Promise<Result<IFileStats>> {
    try {
      const stats = await fs.stat(filePath);
      return ok({
        size: stats.size,
        isFile: () => stats.isFile(),
        isDirectory: () => stats.isDirectory(),
        isSymbolicLink: () => stats.isSymbolicLink(),
        mtime: stats.mtime,
        ctime: stats.ctime,
        atime: stats.atime,
      });
    } catch (error) {
      return err(new Error(`Failed to stat ${filePath}: ${error}`));
    }
  }

  /**
   * Lists all entries in a directory.
   *
   * @param dirPath - Absolute or relative path to the directory
   * @returns Result containing array of entry names (not full paths), or an error
   *
   * @remarks
   * Returns only the names of files and directories, not full paths.
   * Use {@link join} to construct full paths if needed.
   * The special entries "." and ".." are not included in the results.
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   * const result = await fs.readdir('/src');
   * if (result.success) {
   *   for (const name of result.value) {
   *     console.log(name);  // "file.txt", "subdir", etc.
   *   }
   * }
   * ```
   *
   * @see {@link mkdir} for creating directories
   * @see {@link join} for building full paths
   */
  async readdir(dirPath: string): Promise<Result<string[]>> {
    try {
      const entries = await fs.readdir(dirPath);
      return ok(entries);
    } catch (error) {
      return err(new Error(`Failed to read directory ${dirPath}: ${error}`));
    }
  }

  /**
   * Creates a directory at the specified path.
   *
   * @param dirPath - Absolute or relative path to create
   * @param recursive - If true, creates parent directories as needed (default: false)
   * @returns Result containing void on success, or an error if creation fails
   *
   * @remarks
   * When recursive is false, the parent directory must already exist or the
   * operation will fail with ENOENT. When recursive is true, all missing
   * parent directories will be created automatically.
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   *
   * // Create single directory (parent must exist)
   * await fs.mkdir('/tmp/newdir');
   *
   * // Create nested directories
   * await fs.mkdir('/tmp/path/to/nested/dir', true);
   * ```
   *
   * @see {@link rmdir} for removing directories
   * @see {@link readdir} for listing directory contents
   */
  async mkdir(dirPath: string, recursive = false): Promise<Result<void>> {
    try {
      await fs.mkdir(dirPath, { recursive });
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Failed to create directory ${dirPath}: ${error}`));
    }
  }

  /**
   * Deletes a file from the filesystem.
   *
   * @param filePath - Absolute or relative path to the file to delete
   * @returns Result containing void on success, or an error if deletion fails
   *
   * @remarks
   * This method only works on files, not directories. Use {@link rmdir} to
   * remove directories. If the file doesn't exist, returns an ENOENT error.
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   * const result = await fs.unlink('/tmp/tempfile.txt');
   * if (!result.success) {
   *   console.error('Failed to delete:', result.error);
   * }
   * ```
   *
   * @see {@link rmdir} for removing directories
   * @see {@link exists} for checking if a file exists before deletion
   */
  async unlink(filePath: string): Promise<Result<void>> {
    try {
      await fs.unlink(filePath);
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Failed to delete file ${filePath}: ${error}`));
    }
  }

  /**
   * Removes a directory from the filesystem.
   *
   * @param dirPath - Absolute or relative path to the directory to remove
   * @param recursive - If true, removes directory and all contents (default: false)
   * @returns Result containing void on success, or an error if removal fails
   *
   * @remarks
   * When recursive is false, the directory must be empty or the operation will
   * fail with ENOTEMPTY. When recursive is true, all contents (files and
   * subdirectories) are removed recursively.
   *
   * WARNING: Recursive deletion is permanent and cannot be undone. Use with caution.
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   *
   * // Remove empty directory
   * await fs.rmdir('/tmp/emptydir');
   *
   * // Remove directory and all contents
   * await fs.rmdir('/tmp/project', true);
   * ```
   *
   * @see {@link mkdir} for creating directories
   * @see {@link unlink} for removing files
   */
  async rmdir(dirPath: string, recursive = false): Promise<Result<void>> {
    try {
      if (recursive) {
        await fs.rm(dirPath, { recursive: true, force: true });
      } else {
        await fs.rmdir(dirPath);
      }
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Failed to remove directory ${dirPath}: ${error}`));
    }
  }

  /**
   * Joins multiple path segments into a single path.
   *
   * @param segments - Path segments to join
   * @returns Normalized joined path
   *
   * @remarks
   * Uses the platform-specific path separator (/ on Unix, \ on Windows).
   * Normalizes the resulting path, resolving . and .. segments.
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   * const fullPath = fs.join('/home', 'user', 'documents', 'file.txt');
   * // Returns: '/home/user/documents/file.txt'
   * ```
   */
  join(...segments: string[]): string {
    return path.join(...segments);
  }

  /**
   * Resolves path segments into an absolute path.
   *
   * @param segments - Path segments to resolve
   * @returns Absolute path
   *
   * @remarks
   * Processes segments from right to left, prepending each until an absolute
   * path is constructed. If no absolute path is created, the current working
   * directory is prepended.
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   * const absPath = fs.resolve('src', 'components', 'Button.tsx');
   * // Returns: '/current/working/dir/src/components/Button.tsx'
   * ```
   */
  resolve(...segments: string[]): string {
    return path.resolve(...segments);
  }

  /**
   * Gets the directory portion of a path.
   *
   * @param filePath - Path to extract directory from
   * @returns Directory path without the filename
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   * const dir = fs.dirname('/path/to/file.txt');
   * // Returns: '/path/to'
   * ```
   */
  dirname(filePath: string): string {
    return path.dirname(filePath);
  }

  /**
   * Gets the last portion of a path (the filename).
   *
   * @param filePath - Path to extract basename from
   * @param ext - Optional extension to remove from the result
   * @returns Filename with or without extension
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   * fs.basename('/path/to/file.txt');        // 'file.txt'
   * fs.basename('/path/to/file.txt', '.txt'); // 'file'
   * ```
   */
  basename(filePath: string, ext?: string): string {
    return path.basename(filePath, ext);
  }

  /**
   * Gets the extension of a path.
   *
   * @param filePath - Path to extract extension from
   * @returns Extension including the dot, or empty string if no extension
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   * fs.extname('file.txt');      // '.txt'
   * fs.extname('file.tar.gz');   // '.gz'
   * fs.extname('file');          // ''
   * ```
   */
  extname(filePath: string): string {
    return path.extname(filePath);
  }

  /**
   * Checks if a path is absolute.
   *
   * @param filePath - Path to check
   * @returns True if the path is absolute, false if relative
   *
   * @remarks
   * On Unix systems, a path is absolute if it starts with /.
   * On Windows, a path is absolute if it starts with a drive letter and colon.
   *
   * @example
   * ```typescript
   * const fs = new NodeFileSystem();
   * fs.isAbsolute('/usr/local');   // true
   * fs.isAbsolute('src/file.txt'); // false
   * ```
   */
  isAbsolute(filePath: string): boolean {
    return path.isAbsolute(filePath);
  }
}
