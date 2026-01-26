#!/usr/bin/env node

// Simplest possible WASM build script
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('Simple WASM Builder for RCL Parser\n');

// Step 1: Generate parser C code
console.log('1. Generating parser C code...');
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

// Step 2: Check for Docker
console.log('2. Checking for Docker...');
try {
  execSync('docker --version', { stdio: 'ignore' });
  console.log('✓ Docker found\n');
} catch {
  console.error('✗ Docker not found');
  console.error('\nPlease install Docker Desktop:');
  console.error('https://www.docker.com/products/docker-desktop');
  console.error('\nOr use GitHub Codespaces/Gitpod which have Docker pre-installed');
  process.exit(1);
}

// Step 3: Build WASM with Docker
console.log('3. Building WASM with Docker...');
console.log('This will download the emscripten image if needed (first time only)...\n');

const buildCommand = `docker run --rm -v "${projectRoot}":/src -w /src trzeci/emscripten \
  emcc -o tree-sitter-rcl.wasm \
  -Os -s WASM=1 -s SIDE_MODULE=1 \
  -s EXPORTED_FUNCTIONS="['_tree_sitter_rcl']" \
  src/parser.c`;

try {
  execSync(buildCommand, {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  // Verify WASM was created
  const wasmPath = join(projectRoot, 'tree-sitter-rcl.wasm');
  if (existsSync(wasmPath)) {
    console.log('\n✓ WASM file built successfully!');
    console.log(`  Location: ${wasmPath}`);
    
    // Get file size
    const { statSync } = await import('node:fs');
    const stats = statSync(wasmPath);
    console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    console.log('\n🎉 You can now run the parser tests!');
    console.log('   npm test');
  } else {
    throw new Error('WASM file was not created');
  }
} catch (error) {
  console.error('\n✗ Failed to build WASM');
  console.error(error.message);
  process.exit(1);
}