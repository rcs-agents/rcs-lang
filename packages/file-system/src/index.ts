// File system implementations
export * from './memoryFileSystem.js';
export * from './browserFileSystem.js';

// Conditional export for Node.js
if (typeof process !== 'undefined' && process.versions?.node) {
  try {
    const nodeFs = require('./nodeFileSystem.js');
    Object.assign(exports, nodeFs);
  } catch (error) {
    // Ignore in browser
  }
}

// Factory and providers
export * from './fileSystemFactory.js';
