// Browser polyfill for node:fs/promises module

export async function readFile(path: string, encoding?: string): Promise<string | Buffer> {
  throw new Error('fs.readFile is not supported in browser environment');
}

export async function writeFile(path: string, data: string | Buffer): Promise<void> {
  console.warn('fs.writeFile is not supported in browser environment');
}

export async function access(path: string, mode?: number): Promise<void> {
  throw new Error('fs.access is not supported in browser environment');
}

export async function mkdir(path: string, options?: any): Promise<string | undefined> {
  console.warn('fs.mkdir is not supported in browser environment');
  return undefined;
}

export async function readdir(path: string): Promise<string[]> {
  return []; // Return empty array in browser
}

export async function stat(path: string): Promise<any> {
  throw new Error('fs.stat is not supported in browser environment');
}

export async function lstat(path: string): Promise<any> {
  throw new Error('fs.lstat is not supported in browser environment');
}

export async function unlink(path: string): Promise<void> {
  console.warn('fs.unlink is not supported in browser environment');
}

export async function rmdir(path: string): Promise<void> {
  console.warn('fs.rmdir is not supported in browser environment');
}

export async function rm(path: string, options?: any): Promise<void> {
  console.warn('fs.rm is not supported in browser environment');
}

// Export all functions as both named exports and default object
// This allows both `import * as fs from 'node:fs/promises'` and individual imports
export { readFile, writeFile, access, mkdir, readdir, stat, lstat, unlink, rmdir, rm };

export default {
  readFile,
  writeFile,
  access,
  mkdir,
  readdir,
  stat,
  lstat,
  unlink,
  rmdir,
  rm,
};
