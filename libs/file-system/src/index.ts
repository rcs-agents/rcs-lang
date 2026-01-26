// File system implementations
export * from './memoryFileSystem';
export * from './browserFileSystem';

// Conditional export for Node.js
if (typeof process !== 'undefined' && process.versions?.node) {
  try {
    const nodeFs = require('./nodeFileSystem');
    Object.assign(exports, nodeFs);
  } catch (error) {
    // Ignore in browser
  }
}

// Factory and providers
export * from './fileSystemFactory';
