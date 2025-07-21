import { type Result, err, ok } from '@rcs-lang/core';
import type { IFileStats, IFileSystem } from '@rcs-lang/core';

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
 * In-memory file system implementation for testing and browser environments
 */
export class MemoryFileSystem implements IFileSystem {
  private files: Map<string, MemoryFile> = new Map();
  private directories: Set<string> = new Set();

  constructor() {
    // Root directory always exists
    this.directories.add('/');
  }

  async readFile(filePath: string, _encoding?: string): Promise<Result<string>> {
    const normalizedPath = this.normalize(filePath);
    const file = this.files.get(normalizedPath);

    if (!file) {
      return err(new Error(`ENOENT: no such file or directory, open '${filePath}'`));
    }

    return ok(file.content);
  }

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

  async exists(filePath: string): Promise<Result<boolean>> {
    const normalizedPath = this.normalize(filePath);
    return ok(this.files.has(normalizedPath) || this.directories.has(normalizedPath));
  }

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

  async unlink(filePath: string): Promise<Result<void>> {
    const normalizedPath = this.normalize(filePath);

    if (!this.files.has(normalizedPath)) {
      return err(new Error(`ENOENT: no such file or directory, unlink '${filePath}'`));
    }

    this.files.delete(normalizedPath);
    return ok(undefined);
  }

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

  join(...segments: string[]): string {
    return segments.join('/').replace(/\/+/g, '/');
  }

  resolve(...segments: string[]): string {
    const joined = this.join(...segments);
    return this.normalize(joined);
  }

  dirname(filePath: string): string {
    const normalized = this.normalize(filePath);
    const lastSlash = normalized.lastIndexOf('/');
    return lastSlash <= 0 ? '/' : normalized.slice(0, lastSlash);
  }

  basename(filePath: string, ext?: string): string {
    const normalized = this.normalize(filePath);
    const lastSlash = normalized.lastIndexOf('/');
    const base = lastSlash === -1 ? normalized : normalized.slice(lastSlash + 1);

    if (ext && base.endsWith(ext)) {
      return base.slice(0, -ext.length);
    }

    return base;
  }

  extname(filePath: string): string {
    const base = this.basename(filePath);
    const lastDot = base.lastIndexOf('.');
    return lastDot === -1 || lastDot === 0 ? '' : base.slice(lastDot);
  }

  isAbsolute(filePath: string): boolean {
    return filePath.startsWith('/');
  }

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
   * Clear all files and directories (except root)
   */
  clear(): void {
    this.files.clear();
    this.directories.clear();
    this.directories.add('/');
  }
}
