#!/usr/bin/env node

// Simplest WASM build using tree-sitter CLI directly
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('Building RCL WASM using tree-sitter CLI\n');

// First, generate the parser
console.log('1. Generating parser...');
try {
  execSync('npx tree-sitter generate', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  console.log('✓ Parser generated\n');
} catch (error) {
  console.error('✗ Failed to generate parser');
  process.exit(1);
}

// Try to build WASM directly with tree-sitter
console.log('2. Building WASM...');

// First try without Docker (in case emscripten is installed)
try {
  console.log('Trying to build WASM (this requires emscripten or Docker)...');
  execSync('npx tree-sitter build --wasm', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  if (existsSync(join(projectRoot, 'tree-sitter-rcl.wasm'))) {
    console.log('\n✓ WASM file built successfully!');
    process.exit(0);
  }
} catch (error) {
  console.log('Direct build failed, trying with Docker...');
}

// If that fails, try with Docker flag
try {
  execSync('npx tree-sitter build --wasm --docker', {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  if (existsSync(join(projectRoot, 'tree-sitter-rcl.wasm'))) {
    console.log('\n✓ WASM file built successfully with Docker!');
    process.exit(0);
  }
} catch (error) {
  console.error('\n✗ Failed to build WASM');
  console.error('\nYou need either:');
  console.error('1. Docker installed (https://docker.com)');
  console.error('2. Emscripten installed (npm run install-emscripten)');
  process.exit(1);
}