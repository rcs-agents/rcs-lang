#!/usr/bin/env node

import { existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const wasmPath = join(projectRoot, 'tree-sitter-rcl.wasm');
const grammarPath = join(projectRoot, 'grammar.js');

console.log('Checking WASM build status...');

// Check if grammar.js exists
if (!existsSync(grammarPath)) {
  console.error('✗ grammar.js not found!');
  process.exit(1);
}

// Check if WASM exists and is up to date
let needsBuild = true;
if (existsSync(wasmPath)) {
  const grammarStat = statSync(grammarPath);
  const wasmStat = statSync(wasmPath);
  
  if (wasmStat.mtime >= grammarStat.mtime) {
    console.log('✓ WASM file is up to date');
    needsBuild = false;
  } else {
    console.log('✗ WASM file is outdated (grammar.js has been modified)');
  }
} else {
  console.log('✗ WASM file not found');
}

if (!needsBuild) {
  process.exit(0);
}

console.log('\nWASM file needs to be built. Checking build tools...');

// Try to build WASM with available tools
function tryBuild() {
  // Check if emscripten is available
  try {
    execSync('emcc --version', { stdio: 'ignore' });
    console.log('✓ Emscripten found. Building WASM...');
    
    try {
      execSync('npm run build-wasm', { 
        cwd: projectRoot,
        stdio: 'inherit' 
      });
      
      if (existsSync(wasmPath)) {
        console.log('✓ WASM file built successfully!');
        return true;
      }
    } catch (error) {
      console.error('✗ Failed to build WASM:', error.message);
    }
  } catch {
    // Emscripten not available
  }

  // Check for Docker as alternative
  try {
    execSync('docker --version', { stdio: 'ignore' });
    console.log('✓ Docker found. Building WASM with Docker...');
    
    try {
      execSync('npx tree-sitter build --wasm --docker', { 
        cwd: projectRoot,
        stdio: 'inherit' 
      });
      
      if (existsSync(wasmPath)) {
        console.log('✓ WASM file built successfully with Docker!');
        return true;
      }
    } catch (error) {
      console.error('✗ Failed to build WASM with Docker:', error.message);
    }
  } catch {
    // Docker not available
  }

  // Check for Podman as alternative
  try {
    execSync('podman --version', { stdio: 'ignore' });
    console.log('✓ Podman found. Building WASM with Podman...');
    
    try {
      execSync('npx tree-sitter build --wasm', { 
        cwd: projectRoot,
        stdio: 'inherit',
        env: { ...process.env, TREE_SITTER_DOCKER: 'podman' }
      });
      
      if (existsSync(wasmPath)) {
        console.log('✓ WASM file built successfully with Podman!');
        return true;
      }
    } catch (error) {
      console.error('✗ Failed to build WASM with Podman:', error.message);
    }
  } catch {
    // Podman not available
  }

  return false;
}

if (tryBuild()) {
  process.exit(0);
}

// No build tools available or build failed
console.error('\n❌ Cannot run parser tests without an up-to-date WASM file!\n');
console.error('The WASM file needs to be rebuilt because grammar.js has changed.\n');
console.error('To build the WASM file, you need one of the following:');
console.error('');
console.error('Option 1: Install Emscripten');
console.error('  npm run install-emscripten');
console.error('  source ~/.emsdk/emsdk_env.sh');
console.error('  npm run build-wasm');
console.error('');
console.error('Option 2: Install Docker');
console.error('  https://www.docker.com/get-started');
console.error('  Then run: npx tree-sitter build --wasm --docker');
console.error('');
console.error('Option 3: Install Podman');
console.error('  https://podman.io/getting-started/installation');
console.error('  Then run: npx tree-sitter build --wasm');
console.error('');
console.error('Option 4: Use GitHub Actions');
console.error('  Push your changes and let CI build the WASM file');
console.error('');

process.exit(1);