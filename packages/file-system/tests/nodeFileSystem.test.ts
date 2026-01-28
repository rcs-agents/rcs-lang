import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { NodeFileSystem } from '../src/nodeFileSystem.js';

describe('NodeFileSystem', () => {
  let nodeFs: NodeFileSystem;
  let testDir: string;

  beforeEach(async () => {
    nodeFs = new NodeFileSystem();
    // Create a temp directory for testing
    testDir = path.join(import.meta.dir, '.test-tmp');
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('readFile', () => {
    test('should read existing file', async () => {
      const filePath = path.join(testDir, 'test.txt');
      const content = 'Hello, World!';
      await fs.writeFile(filePath, content);

      const result = await nodeFs.readFile(filePath);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(content);
      }
    });

    test('should return error for non-existent file', async () => {
      const result = await nodeFs.readFile(path.join(testDir, 'nonexistent.txt'));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Failed to read file');
      }
    });

    test('should support different encodings', async () => {
      const filePath = path.join(testDir, 'utf8.txt');
      await fs.writeFile(filePath, 'test content', 'utf8');

      const result = await nodeFs.readFile(filePath, 'utf8');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('test content');
      }
    });
  });

  describe('writeFile', () => {
    test('should write file successfully', async () => {
      const filePath = path.join(testDir, 'output.txt');
      const content = 'Test output';

      const result = await nodeFs.writeFile(filePath, content);
      expect(result.success).toBe(true);

      const written = await fs.readFile(filePath, 'utf8');
      expect(written).toBe(content);
    });

    test('should overwrite existing file', async () => {
      const filePath = path.join(testDir, 'overwrite.txt');
      await fs.writeFile(filePath, 'old content');

      const result = await nodeFs.writeFile(filePath, 'new content');
      expect(result.success).toBe(true);

      const written = await fs.readFile(filePath, 'utf8');
      expect(written).toBe('new content');
    });

    test('should return error when parent directory does not exist', async () => {
      const filePath = path.join(testDir, 'nonexistent', 'file.txt');

      const result = await nodeFs.writeFile(filePath, 'content');
      expect(result.success).toBe(false);
    });
  });

  describe('exists', () => {
    test('should return true for existing file', async () => {
      const filePath = path.join(testDir, 'exists.txt');
      await fs.writeFile(filePath, 'content');

      const result = await nodeFs.exists(filePath);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(true);
      }
    });

    test('should return false for non-existent file', async () => {
      const result = await nodeFs.exists(path.join(testDir, 'nonexistent.txt'));
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(false);
      }
    });

    test('should return true for existing directory', async () => {
      const dirPath = path.join(testDir, 'subdir');
      await fs.mkdir(dirPath);

      const result = await nodeFs.exists(dirPath);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(true);
      }
    });
  });

  describe('stat', () => {
    test('should return stats for file', async () => {
      const filePath = path.join(testDir, 'stat.txt');
      const content = 'test';
      await fs.writeFile(filePath, content);

      const result = await nodeFs.stat(filePath);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.size).toBe(content.length);
        expect(result.value.isFile()).toBe(true);
        expect(result.value.isDirectory()).toBe(false);
        expect(result.value.mtime).toBeInstanceOf(Date);
      }
    });

    test('should return stats for directory', async () => {
      const dirPath = path.join(testDir, 'statdir');
      await fs.mkdir(dirPath);

      const result = await nodeFs.stat(dirPath);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.isFile()).toBe(false);
        expect(result.value.isDirectory()).toBe(true);
      }
    });

    test('should return error for non-existent path', async () => {
      const result = await nodeFs.stat(path.join(testDir, 'nonexistent'));
      expect(result.success).toBe(false);
    });
  });

  describe('readdir', () => {
    test('should list directory contents', async () => {
      const dirPath = path.join(testDir, 'readdir');
      await fs.mkdir(dirPath);
      await fs.writeFile(path.join(dirPath, 'file1.txt'), '');
      await fs.writeFile(path.join(dirPath, 'file2.txt'), '');
      await fs.mkdir(path.join(dirPath, 'subdir'));

      const result = await nodeFs.readdir(dirPath);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toContain('file1.txt');
        expect(result.value).toContain('file2.txt');
        expect(result.value).toContain('subdir');
      }
    });

    test('should return error for non-existent directory', async () => {
      const result = await nodeFs.readdir(path.join(testDir, 'nonexistent'));
      expect(result.success).toBe(false);
    });

    test('should return empty array for empty directory', async () => {
      const dirPath = path.join(testDir, 'empty');
      await fs.mkdir(dirPath);

      const result = await nodeFs.readdir(dirPath);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual([]);
      }
    });
  });

  describe('mkdir', () => {
    test('should create directory', async () => {
      const dirPath = path.join(testDir, 'newdir');

      const result = await nodeFs.mkdir(dirPath);
      expect(result.success).toBe(true);

      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    });

    test('should create nested directories with recursive flag', async () => {
      const dirPath = path.join(testDir, 'a', 'b', 'c');

      const result = await nodeFs.mkdir(dirPath, true);
      expect(result.success).toBe(true);

      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    });

    test('should fail without recursive flag when parent does not exist', async () => {
      const dirPath = path.join(testDir, 'nonexistent', 'newdir');

      const result = await nodeFs.mkdir(dirPath, false);
      expect(result.success).toBe(false);
    });
  });

  describe('unlink', () => {
    test('should delete file', async () => {
      const filePath = path.join(testDir, 'delete.txt');
      await fs.writeFile(filePath, 'content');

      const result = await nodeFs.unlink(filePath);
      expect(result.success).toBe(true);

      const exists = await nodeFs.exists(filePath);
      expect(exists.success && exists.value).toBe(false);
    });

    test('should return error for non-existent file', async () => {
      const result = await nodeFs.unlink(path.join(testDir, 'nonexistent.txt'));
      expect(result.success).toBe(false);
    });
  });

  describe('rmdir', () => {
    test('should remove empty directory', async () => {
      const dirPath = path.join(testDir, 'removedir');
      await fs.mkdir(dirPath);

      const result = await nodeFs.rmdir(dirPath);
      expect(result.success).toBe(true);

      const exists = await nodeFs.exists(dirPath);
      expect(exists.success && exists.value).toBe(false);
    });

    test('should fail to remove non-empty directory without recursive flag', async () => {
      const dirPath = path.join(testDir, 'nonempty');
      await fs.mkdir(dirPath);
      await fs.writeFile(path.join(dirPath, 'file.txt'), '');

      const result = await nodeFs.rmdir(dirPath, false);
      expect(result.success).toBe(false);
    });

    test('should remove non-empty directory with recursive flag', async () => {
      const dirPath = path.join(testDir, 'recursive');
      await fs.mkdir(dirPath);
      await fs.mkdir(path.join(dirPath, 'subdir'));
      await fs.writeFile(path.join(dirPath, 'file.txt'), '');
      await fs.writeFile(path.join(dirPath, 'subdir', 'nested.txt'), '');

      const result = await nodeFs.rmdir(dirPath, true);
      expect(result.success).toBe(true);

      const exists = await nodeFs.exists(dirPath);
      expect(exists.success && exists.value).toBe(false);
    });
  });

  describe('path utilities', () => {
    test('join should join path segments', () => {
      expect(nodeFs.join('a', 'b', 'c')).toBe(path.join('a', 'b', 'c'));
      expect(nodeFs.join('/a', 'b', 'c')).toBe(path.join('/a', 'b', 'c'));
    });

    test('resolve should resolve to absolute path', () => {
      const result = nodeFs.resolve('test.txt');
      expect(path.isAbsolute(result)).toBe(true);
    });

    test('dirname should return directory name', () => {
      expect(nodeFs.dirname('/path/to/file.txt')).toBe('/path/to');
      expect(nodeFs.dirname('relative/file.txt')).toBe('relative');
    });

    test('basename should return file name', () => {
      expect(nodeFs.basename('/path/to/file.txt')).toBe('file.txt');
      expect(nodeFs.basename('/path/to/file.txt', '.txt')).toBe('file');
    });

    test('extname should return file extension', () => {
      expect(nodeFs.extname('file.txt')).toBe('.txt');
      expect(nodeFs.extname('file.tar.gz')).toBe('.gz');
      expect(nodeFs.extname('file')).toBe('');
    });

    test('isAbsolute should check if path is absolute', () => {
      expect(nodeFs.isAbsolute('/absolute/path')).toBe(true);
      expect(nodeFs.isAbsolute('relative/path')).toBe(false);
    });
  });
});
