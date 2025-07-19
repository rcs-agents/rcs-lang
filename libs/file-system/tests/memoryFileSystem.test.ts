import { beforeEach, describe, expect, test } from 'bun:test';
import { MemoryFileSystem } from '../src/memoryFileSystem';

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
});
