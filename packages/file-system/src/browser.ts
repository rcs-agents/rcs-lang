/**
 * Browser-safe exports for @rcs-lang/file-system
 *
 * @remarks
 * This module exports only the filesystem implementations that work in browser
 * environments without Node.js dependencies. Use this entry point for web
 * applications, bundlers, and any environment where Node.js APIs are unavailable.
 *
 * @example
 * ```typescript
 * import { MemoryFileSystem } from '@rcs-lang/file-system/browser';
 *
 * const fs = new MemoryFileSystem();
 * await fs.writeFile('/data.txt', 'Hello');
 * ```
 *
 * @packageDocumentation
 */

export { MemoryFileSystem } from './memoryFileSystem.js';
export { BrowserFileSystem } from './browserFileSystem.js';
