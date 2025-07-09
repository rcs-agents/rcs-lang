import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryFileSystem } from '../src/memoryFileSystem';

describe('MemoryFileSystem', () => {
  let fs: MemoryFileSystem;

  beforeEach(() => {
    fs = new MemoryFileSystem();
  });

  it('should write and read files', async () => {
    const content = 'Hello, World!';
    const writeResult = await fs.writeFile('/test.txt', content);
    expect(writeResult.success).toBe(true);

    const readResult = await fs.readFile('/test.txt');
    expect(readResult.success).toBe(true);
    if (readResult.success) {
      expect(readResult.value).toBe(content);
    }
  });

  it('should check file existence', async () => {
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

  it('should create directories', async () => {
    const result = await fs.mkdir('/test/nested', true);
    expect(result.success).toBe(true);

    const exists = await fs.exists('/test/nested');
    expect(exists.success).toBe(true);
    if (exists.success) {
      expect(exists.value).toBe(true);
    }
  });

  it('should handle path operations', () => {
    expect(fs.join('path', 'to', 'file.txt')).toBe('path/to/file.txt');
    expect(fs.basename('/path/to/file.txt')).toBe('file.txt');
    expect(fs.dirname('/path/to/file.txt')).toBe('/path/to');
    expect(fs.extname('file.txt')).toBe('.txt');
    expect(fs.isAbsolute('/path')).toBe(true);
    expect(fs.isAbsolute('path')).toBe(false);
  });
});
