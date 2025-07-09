// Browser polyfill for fs module (minimal implementation)

export function readFileSync(path: string, encoding?: string): string | Buffer {
  throw new Error('fs.readFileSync is not supported in browser environment');
}

export function writeFileSync(path: string, data: string | Buffer): void {
  console.warn('fs.writeFileSync is not supported in browser environment');
}

export function existsSync(path: string): boolean {
  return false; // Always return false in browser
}

export function mkdirSync(path: string, options?: any): void {
  console.warn('fs.mkdirSync is not supported in browser environment');
}

export function readdirSync(path: string): string[] {
  return []; // Return empty array in browser
}

export function statSync(path: string): any {
  throw new Error('fs.statSync is not supported in browser environment');
}

export function lstatSync(path: string): any {
  throw new Error('fs.lstatSync is not supported in browser environment');
}

// Async versions (return rejected promises)
export function readFile(path: string, encoding?: string): Promise<string | Buffer> {
  return Promise.reject(new Error('fs.readFile is not supported in browser environment'));
}

export function writeFile(path: string, data: string | Buffer): Promise<void> {
  console.warn('fs.writeFile is not supported in browser environment');
  return Promise.resolve();
}

export function access(path: string): Promise<void> {
  return Promise.reject(new Error('fs.access is not supported in browser environment'));
}

export function mkdir(path: string, options?: any): Promise<void> {
  console.warn('fs.mkdir is not supported in browser environment');
  return Promise.resolve();
}

export function readdir(path: string): Promise<string[]> {
  return Promise.resolve([]); // Return empty array in browser
}

export function stat(path: string): Promise<any> {
  return Promise.reject(new Error('fs.stat is not supported in browser environment'));
}

export function lstat(path: string): Promise<any> {
  return Promise.reject(new Error('fs.lstat is not supported in browser environment'));
}

// File system constants (mimicking Node.js fs.constants)
export const constants = {
  F_OK: 0, // File exists
  R_OK: 4, // File is readable
  W_OK: 2, // File is writable
  X_OK: 1, // File is executable
};

// Export promises for modern fs API
export const promises = {
  readFile,
  writeFile,
  access,
  mkdir,
  readdir,
  stat,
  lstat,
};

export default {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  lstatSync,
  readFile,
  writeFile,
  access,
  mkdir,
  readdir,
  stat,
  lstat,
  constants,
  promises,
};
