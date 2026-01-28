import { beforeEach, describe, expect, test } from 'bun:test';
import { MemoryFileSystem } from '../src/memoryFileSystem.js';

describe('MemoryFileSystem', () => {
  let fs: MemoryFileSystem;

  beforeEach(() => {
    fs = new MemoryFileSystem();
  });

  test('should write and read files', async () => {
    const content = 'Hello, World!';
    const writeResult = await fs.writeFile('/test.txt', content);
    expect(writeResult.success).toBe(true);

    const readResult = await fs.readFile('/test.txt');
    expect(readResult.success).toBe(true);
    if (readResult.success) {
      expect(readResult.value).toBe(content);
    }
  });

  test('should check file existence', async () => {
    await fs.writeFile('/exists.txt', 'content');

    const exists = await fs.exists('/exists.txt');
    expect(exists.success).toBe(true);
    if (exists.success) {
      expect(exists.value).toBe(true);
    }

    const notExists = await fs.exists('/not-exists.txt');
    expect(notExists.success).toBe(true);
    if (notExists.success) {
      expect(notExists.value).toBe(false);
    }
  });

  test('should create directories', async () => {
    const result = await fs.mkdir('/test/nested', true);
    expect(result.success).toBe(true);

    const exists = await fs.exists('/test/nested');
    expect(exists.success).toBe(true);
    if (exists.success) {
      expect(exists.value).toBe(true);
    }
  });

  test('should handle path operations', () => {
    expect(fs.join('path', 'to', 'file.txt')).toBe('path/to/file.txt');
    expect(fs.basename('/path/to/file.txt')).toBe('file.txt');
    expect(fs.dirname('/path/to/file.txt')).toBe('/path/to');
    expect(fs.extname('file.txt')).toBe('.txt');
    expect(fs.isAbsolute('/path')).toBe(true);
    expect(fs.isAbsolute('path')).toBe(false);
  });

  test('should handle nested directory removal', async () => {
    await fs.mkdir('/a/b/c', true);
    await fs.writeFile('/a/b/c/file.txt', 'content');

    const result = await fs.rmdir('/a', true);
    expect(result.success).toBe(true);

    const exists = await fs.exists('/a');
    expect(exists.success && exists.value).toBe(false);
  });

  test('should fail to write file without parent directory', async () => {
    const result = await fs.writeFile('/nonexistent/file.txt', 'content');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('ENOENT');
    }
  });

  test('should handle file stat correctly', async () => {
    await fs.mkdir('/test', true);
    const content = 'test data';
    await fs.writeFile('/test/file.txt', content);

    const result = await fs.stat('/test/file.txt');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.size).toBe(content.length);
      expect(result.value.isFile()).toBe(true);
      expect(result.value.isDirectory()).toBe(false);
    }
  });

  test('should list directory contents correctly', async () => {
    await fs.mkdir('/list/sub1', true);
    await fs.mkdir('/list/sub2', true);
    await fs.writeFile('/list/file1.txt', '');
    await fs.writeFile('/list/file2.txt', '');

    const result = await fs.readdir('/list');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.sort()).toEqual(['file1.txt', 'file2.txt', 'sub1', 'sub2']);
    }
  });

  test('should handle root directory operations', async () => {
    const exists = await fs.exists('/');
    expect(exists.success && exists.value).toBe(true);

    const stat = await fs.stat('/');
    expect(stat.success && stat.value?.isDirectory()).toBe(true);
  });

  test('should handle basename with extension removal', () => {
    expect(fs.basename('/path/file.txt', '.txt')).toBe('file');
    expect(fs.basename('/path/file.tar.gz', '.gz')).toBe('file.tar');
  });

  test('should normalize paths correctly', async () => {
    await fs.mkdir('/test', true);
    await fs.writeFile('/test/file.txt', 'content');

    // Test with different path formats
    const result1 = await fs.readFile('/test/file.txt');
    const result2 = await fs.readFile('test/file.txt'); // Will be normalized to /test/file.txt

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    if (result1.success && result2.success) {
      expect(result1.value).toBe(result2.value);
    }
  });

  test('should handle clear operation', async () => {
    await fs.mkdir('/test', true);
    await fs.writeFile('/test/file.txt', 'content');

    fs.clear();

    const fileExists = await fs.exists('/test/file.txt');
    expect(fileExists.success && fileExists.value).toBe(false);

    const dirExists = await fs.exists('/test');
    expect(dirExists.success && dirExists.value).toBe(false);

    // Root should still exist
    const rootExists = await fs.exists('/');
    expect(rootExists.success && rootExists.value).toBe(true);
  });
});
