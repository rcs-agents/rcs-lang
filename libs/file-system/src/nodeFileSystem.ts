import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { type Result, err, ok } from '@rcs-lang/core';
import type { IFileStats, IFileSystem } from '@rcs-lang/core';

/**
 * Node.js file system implementation
 */
export class NodeFileSystem implements IFileSystem {
  async readFile(filePath: string, encoding = 'utf8'): Promise<Result<string>> {
    try {
      const content = await fs.readFile(filePath, encoding as BufferEncoding);
      return ok(content);
    } catch (error) {
      return err(new Error(`Failed to read file ${filePath}: ${error}`));
    }
  }

  async writeFile(filePath: string, content: string, encoding = 'utf8'): Promise<Result<void>> {
    try {
      await fs.writeFile(filePath, content, encoding as BufferEncoding);
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Failed to write file ${filePath}: ${error}`));
    }
  }

  async exists(filePath: string): Promise<Result<boolean>> {
    try {
      await fs.access(filePath, constants.F_OK);
      return ok(true);
    } catch {
      return ok(false);
    }
  }

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

  async readdir(dirPath: string): Promise<Result<string[]>> {
    try {
      const entries = await fs.readdir(dirPath);
      return ok(entries);
    } catch (error) {
      return err(new Error(`Failed to read directory ${dirPath}: ${error}`));
    }
  }

  async mkdir(dirPath: string, recursive = false): Promise<Result<void>> {
    try {
      await fs.mkdir(dirPath, { recursive });
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Failed to create directory ${dirPath}: ${error}`));
    }
  }

  async unlink(filePath: string): Promise<Result<void>> {
    try {
      await fs.unlink(filePath);
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Failed to delete file ${filePath}: ${error}`));
    }
  }

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

  join(...segments: string[]): string {
    return path.join(...segments);
  }

  resolve(...segments: string[]): string {
    return path.resolve(...segments);
  }

  dirname(filePath: string): string {
    return path.dirname(filePath);
  }

  basename(filePath: string, ext?: string): string {
    return path.basename(filePath, ext);
  }

  extname(filePath: string): string {
    return path.extname(filePath);
  }

  isAbsolute(filePath: string): boolean {
    return path.isAbsolute(filePath);
  }
}
