import * as fs from 'fs';
import * as path from 'path';

/**
 * Migrate from old CLI structure to new structure
 * This helps preserve backwards compatibility
 */
export function checkForLegacyUsage(): void {
  // Check if demo.js is being used
  const demoPath = path.join(__dirname, '..', 'demo.js');
  if (fs.existsSync(demoPath)) {
    console.warn('⚠️  Warning: demo.js is deprecated. The RCL CLI now uses a proper AST-based compiler.');
    console.warn('   Please use the new CLI commands:');
    console.warn('     rcl compile <file>    - Compile an RCL file');
    console.warn('     rcl init             - Create rcl.config.json');
    console.warn('     rcl compile -w       - Watch mode');
  }
}