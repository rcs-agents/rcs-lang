import { beforeEach, describe, expect, test } from 'bun:test';
import { BrowserFileSystem } from '../src/browserFileSystem.js';

describe('BrowserFileSystem', () => {
  let fs: BrowserFileSystem;

  beforeEach(() => {
    fs = new BrowserFileSystem('test-db');
  });

  describe('basic file operations', () => {
    test('should write and read files', async () => {
      await fs.mkdir('/test', true);
      const content = 'Hello, Browser!';
      const writeResult = await fs.writeFile('/test/file.txt', content);
      expect(writeResult.success).toBe(true);

      const readResult = await fs.readFile('/test/file.txt');
      expect(readResult.success).toBe(true);
      if (readResult.success) {
        expect(readResult.value).toBe(content);
      }
    });

    test('should return error when reading non-existent file', async () => {
      const result = await fs.readFile('/nonexistent.txt');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('ENOENT');
      }
    });

    test('should require parent directory to exist when writing', async () => {
      const result = await fs.writeFile('/nonexistent/file.txt', 'content');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('ENOENT');
      }
    });
  });

  describe('exists', () => {
    test('should return true for existing file', async () => {
      await fs.mkdir('/test', true);
      await fs.writeFile('/test/exists.txt', 'content');

      const result = await fs.exists('/test/exists.txt');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(true);
      }
    });

    test('should return false for non-existent file', async () => {
      const result = await fs.exists('/nonexistent.txt');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(false);
      }
    });

    test('should return true for existing directory', async () => {
      await fs.mkdir('/testdir', true);

      const result = await fs.exists('/testdir');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(true);
      }
    });
  });

  describe('stat', () => {
    test('should return stats for file', async () => {
      await fs.mkdir('/test', true);
      const content = 'test content';
      await fs.writeFile('/test/stat.txt', content);

      const result = await fs.stat('/test/stat.txt');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.size).toBe(content.length);
        expect(result.value.isFile()).toBe(true);
        expect(result.value.isDirectory()).toBe(false);
        expect(result.value.mtime).toBeInstanceOf(Date);
      }
    });

    test('should return stats for directory', async () => {
      await fs.mkdir('/statdir', true);

      const result = await fs.stat('/statdir');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.isFile()).toBe(false);
        expect(result.value.isDirectory()).toBe(true);
      }
    });

    test('should return error for non-existent path', async () => {
      const result = await fs.stat('/nonexistent');
      expect(result.success).toBe(false);
    });
  });

  describe('directory operations', () => {
    test('should create directory', async () => {
      const result = await fs.mkdir('/newdir', true);
      expect(result.success).toBe(true);

      const exists = await fs.exists('/newdir');
      expect(exists.success && exists.value).toBe(true);
    });

    test('should create nested directories with recursive flag', async () => {
      const result = await fs.mkdir('/a/b/c', true);
      expect(result.success).toBe(true);

      const exists = await fs.exists('/a/b/c');
      expect(exists.success && exists.value).toBe(true);
    });

    test('should fail without recursive flag when parent does not exist', async () => {
      const result = await fs.mkdir('/nonexistent/newdir', false);
      expect(result.success).toBe(false);
    });

    test('should list directory contents', async () => {
      await fs.mkdir('/listdir', true);
      await fs.writeFile('/listdir/file1.txt', '');
      await fs.writeFile('/listdir/file2.txt', '');
      await fs.mkdir('/listdir/subdir', true);

      const result = await fs.readdir('/listdir');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toContain('file1.txt');
        expect(result.value).toContain('file2.txt');
        expect(result.value).toContain('subdir');
        expect(result.value.length).toBe(3);
      }
    });

    test('should return empty array for empty directory', async () => {
      await fs.mkdir('/empty', true);

      const result = await fs.readdir('/empty');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual([]);
      }
    });

    test('should return error when listing non-existent directory', async () => {
      const result = await fs.readdir('/nonexistent');
      expect(result.success).toBe(false);
    });
  });

  describe('unlink and rmdir', () => {
    test('should delete file', async () => {
      await fs.mkdir('/test', true);
      await fs.writeFile('/test/delete.txt', 'content');

      const result = await fs.unlink('/test/delete.txt');
      expect(result.success).toBe(true);

      const exists = await fs.exists('/test/delete.txt');
      expect(exists.success && exists.value).toBe(false);
    });

    test('should return error when deleting non-existent file', async () => {
      const result = await fs.unlink('/nonexistent.txt');
      expect(result.success).toBe(false);
    });

    test('should remove empty directory', async () => {
      await fs.mkdir('/removedir', true);

      const result = await fs.rmdir('/removedir');
      expect(result.success).toBe(true);

      const exists = await fs.exists('/removedir');
      expect(exists.success && exists.value).toBe(false);
    });

    test('should fail to remove non-empty directory without recursive flag', async () => {
      await fs.mkdir('/nonempty', true);
      await fs.writeFile('/nonempty/file.txt', '');

      const result = await fs.rmdir('/nonempty', false);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('ENOTEMPTY');
      }
    });

    test('should remove non-empty directory with recursive flag', async () => {
      await fs.mkdir('/recursive/subdir', true);
      await fs.writeFile('/recursive/file.txt', '');
      await fs.writeFile('/recursive/subdir/nested.txt', '');

      const result = await fs.rmdir('/recursive', true);
      expect(result.success).toBe(true);

      const exists = await fs.exists('/recursive');
      expect(exists.success && exists.value).toBe(false);
    });
  });

  describe('path utilities', () => {
    test('join should join path segments', () => {
      expect(fs.join('a', 'b', 'c')).toBe('a/b/c');
      expect(fs.join('/a', 'b', 'c')).toBe('/a/b/c');
      expect(fs.join('a', '.', 'b')).toBe('a/b');
    });

    test('resolve should resolve to absolute path', () => {
      expect(fs.resolve('test.txt')).toBe('/test.txt');
      expect(fs.resolve('/a', 'b', 'c')).toBe('/a/b/c');
    });

    test('dirname should return directory name', () => {
      expect(fs.dirname('/path/to/file.txt')).toBe('/path/to');
      expect(fs.dirname('/file.txt')).toBe('/');
    });

    test('basename should return file name', () => {
      expect(fs.basename('/path/to/file.txt')).toBe('file.txt');
      expect(fs.basename('/path/to/file.txt', '.txt')).toBe('file');
    });

    test('extname should return file extension', () => {
      expect(fs.extname('file.txt')).toBe('.txt');
      expect(fs.extname('file.tar.gz')).toBe('.gz');
      expect(fs.extname('file')).toBe('');
    });

    test('isAbsolute should check if path is absolute', () => {
      expect(fs.isAbsolute('/absolute/path')).toBe(true);
      expect(fs.isAbsolute('relative/path')).toBe(false);
    });
  });

  describe('clear', () => {
    test('should clear all files and directories except root', async () => {
      await fs.mkdir('/test', true);
      await fs.writeFile('/test/file.txt', 'content');

      fs.clear();

      const fileExists = await fs.exists('/test/file.txt');
      expect(fileExists.success && fileExists.value).toBe(false);

      const dirExists = await fs.exists('/test');
      expect(dirExists.success && dirExists.value).toBe(false);

      const rootExists = await fs.exists('/');
      expect(rootExists.success && rootExists.value).toBe(true);
    });
  });

  // Note: IndexedDB tests (loadFromIndexedDB/saveToIndexedDB) would require
  // a browser environment with IndexedDB support. These are integration tests
  // best run in an actual browser or with a jsdom/happy-dom setup.
  // For now, we test the in-memory operations which are the core functionality.
});
