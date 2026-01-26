import { type Result, err, ok } from '@rcl/core';
import type { IFileStats, IFileSystem } from '@rcl/core';

/**
 * Browser file system implementation
 */
export class BrowserFileSystem implements IFileSystem {
  async readFile(filePath: string, encoding = 'utf8'): Promise<Result<string>> {
    return err(new Error('File reading is not supported in browser environment'));
  }

  async writeFile(filePath: string, content: string, encoding = 'utf8'): Promise<Result<void>> {
    console.warn('File writing is not supported in browser environment');
    return ok(undefined);
  }

  async exists(filePath: string): Promise<Result<boolean>> {
    return ok(false);
  }

  async stat(filePath: string): Promise<Result<IFileStats>> {
    return err(new Error('File stat is not supported in browser environment'));
  }

  async readdir(dirPath: string): Promise<Result<string[]>> {
    return ok([]);
  }

  async mkdir(dirPath: string, recursive = false): Promise<Result<void>> {
    console.warn('Directory creation is not supported in browser environment');
    return ok(undefined);
  }

  async unlink(filePath: string): Promise<Result<void>> {
    console.warn('File deletion is not supported in browser environment');
    return ok(undefined);
  }

  async rmdir(dirPath: string, recursive = false): Promise<Result<void>> {
    console.warn('Directory removal is not supported in browser environment');
    return ok(undefined);
  }

  join(...segments: string[]): string {
    return (
      segments
        .filter((s) => s && s !== '.')
        .join('/')
        .replace(/\/+/g, '/')
        .replace(/\/$/, '') || '.'
    );
  }

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

  dirname(filePath: string): string {
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    return dir || (filePath.charAt(0) === '/' ? '/' : '.');
  }

  basename(filePath: string, ext?: string): string {
    let base = filePath.substring(filePath.lastIndexOf('/') + 1);
    if (ext && base.endsWith(ext)) {
      base = base.substring(0, base.length - ext.length);
    }
    return base;
  }

  extname(filePath: string): string {
    const dot = filePath.lastIndexOf('.');
    const slash = filePath.lastIndexOf('/');
    return dot > slash ? filePath.substring(dot) : '';
  }

  isAbsolute(filePath: string): boolean {
    return filePath.charAt(0) === '/';
  }

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
}
