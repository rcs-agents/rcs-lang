#!/usr/bin/env node

/**
 * Alternative WASM build script for tree-sitter-rcl
 * This attempts to use tree-sitter's build functionality
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const parserDir = join(__dirname, '..');

console.log('Building tree-sitter-rcl WASM file...');
console.log('Parser directory:', parserDir);

// Check if generated parser exists
const parserPath = join(parserDir, 'generated', 'parser.c');
if (!existsSync(parserPath)) {
  console.log('Generating parser first...');
  try {
    execSync('npm run build-grammar', { cwd: parserDir, stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to generate parser:', error.message);
    process.exit(1);
  }
}

// Try to build WASM
console.log('\nAttempting to build WASM file...');
try {
  // First check if we have the necessary tools
  try {
    execSync('which emcc', { stdio: 'ignore' });
    console.log('Found emscripten');
  } catch {
    try {
      execSync('which docker', { stdio: 'ignore' });
      console.log('Found docker');
    } catch {
      try {
        execSync('which podman', { stdio: 'ignore' });
        console.log('Found podman');
      } catch {
        console.error('\n❌ No suitable build tool found!');
        console.error('\nTo build the WASM file, you need one of:');
        console.error('1. Emscripten: https://emscripten.org/docs/getting_started/downloads.html');
        console.error('2. Docker: https://www.docker.com/get-started');
        console.error('3. Podman: https://podman.io/getting-started/installation');
        console.error('\nAlternatively, you can try:');
        console.error('- Using GitHub Codespaces or Gitpod which may have these tools pre-installed');
        console.error('- Building in a CI/CD environment');
        process.exit(1);
      }
    }
  }

  // Run tree-sitter build command
  execSync(`npx tree-sitter build --wasm ${parserDir}`, { 
    cwd: parserDir, 
    stdio: 'inherit' 
  });

  // Check if successful
  const wasmPath = join(parserDir, 'tree-sitter-rcl.wasm');
  if (existsSync(wasmPath)) {
    console.log('\n✅ Successfully built tree-sitter-rcl.wasm');
    console.log('WASM file location:', wasmPath);
    
    // Show file info
    const stats = execSync(`ls -lh ${wasmPath}`, { encoding: 'utf8' });
    console.log(stats.trim());
  } else {
    console.error('\n❌ WASM file was not created');
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}