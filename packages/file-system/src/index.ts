/**
 * @rcs-lang/file-system - Cross-platform filesystem abstraction
 *
 * @remarks
 * This module provides filesystem implementations for Node.js, browser, and
 * in-memory environments. Use the FileSystemFactory to get the appropriate
 * implementation for your environment.
 *
 * @packageDocumentation
 */

// Export filesystem implementations
export * from './memoryFileSystem.js';
export * from './browserFileSystem.js';
export * from './nodeFileSystem.js';
export * from './fileSystemFactory.js';
