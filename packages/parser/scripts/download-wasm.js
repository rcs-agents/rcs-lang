#!/usr/bin/env node

import { existsSync, createWriteStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const wasmPath = join(projectRoot, 'tree-sitter-rcl.wasm');

console.log('Checking for pre-built WASM file...');

// First, let's check if we can use the tree-sitter CLI to generate WASM
// without needing emscripten by using the --docker flag
async function tryTreeSitterCLI() {
  const { execSync } = await import('node:child_process');
  
  try {
    // Check if tree-sitter CLI is available
    execSync('npx tree-sitter --version', { stdio: 'ignore' });
    
    // Try to generate WASM using tree-sitter's built-in web build
    console.log('Attempting to build WASM with tree-sitter CLI...');
    
    try {
      // First generate the parser
      execSync('npx tree-sitter generate', {
        cwd: projectRoot,
        stdio: 'inherit'
      });
      
      // Then try to build web bindings
      // tree-sitter can build WASM without emscripten if we use the web target
      execSync('npx tree-sitter build-wasm', {
        cwd: projectRoot,
        stdio: 'inherit'
      });
      
      if (existsSync(wasmPath)) {
        console.log('✓ WASM file built successfully!');
        return true;
      }
    } catch (error) {
      console.log('Note: tree-sitter build-wasm requires emscripten or docker');
    }
  } catch (error) {
    console.error('tree-sitter CLI not available');
  }
  
  return false;
}

// Alternative: Download pre-built tree-sitter.wasm and use it as base
async function downloadTreeSitterWasm() {
  const treeSitterWasmUrl = 'https://unpkg.com/web-tree-sitter@0.20.8/tree-sitter.wasm';
  const tempPath = join(projectRoot, 'tree-sitter.wasm');
  
  console.log('Downloading tree-sitter base WASM from unpkg...');
  
  return new Promise((resolve, reject) => {
    const file = createWriteStream(tempPath);
    
    https.get(treeSitterWasmUrl, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('✓ Downloaded tree-sitter.wasm');
        console.log('\nNote: This is just the base tree-sitter runtime.');
        console.log('You still need to build the RCL language WASM file.');
        console.log('However, you can now use the simpler web-tree-sitter API');
        console.log('to load and compile the grammar at runtime.');
        resolve(true);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  if (existsSync(wasmPath)) {
    console.log('✓ tree-sitter-rcl.wasm already exists');
    return;
  }
  
  // Try to build with tree-sitter CLI first
  const built = await tryTreeSitterCLI();
  if (built) {
    return;
  }
  
  // If that fails, provide instructions
  console.log('\n❌ Could not build WASM file automatically.\n');
  console.log('Options to build the WASM file:\n');
  console.log('1. Use Docker (recommended):');
  console.log('   docker run -v "$PWD":/src trzeci/emscripten \\');
  console.log('     emcc -o tree-sitter-rcl.wasm \\');
  console.log('     -Os -s WASM=1 -s SIDE_MODULE=1 -s EXPORTED_FUNCTIONS="[\\');
  console.log('       \'_tree_sitter_rcl\']" \\');
  console.log('     src/parser.c\n');
  
  console.log('2. Use tree-sitter with Docker:');
  console.log('   npx tree-sitter build --wasm --docker\n');
  
  console.log('3. Install Emscripten locally:');
  console.log('   npm run install-emscripten');
  console.log('   source ~/.emsdk/emsdk_env.sh');
  console.log('   npx tree-sitter build --wasm\n');
  
  console.log('4. Use GitHub Actions to build (see .github/workflows/build-wasm.yml)\n');
  
  // Offer to download base tree-sitter WASM
  console.log('Would you like to download the base tree-sitter.wasm? (This won\'t');
  console.log('solve the immediate problem but might be useful for development)');
  
  process.exit(1);
}

main().catch(console.error);