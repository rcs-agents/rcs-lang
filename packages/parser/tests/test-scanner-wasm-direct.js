const fs = require('fs');
const path = require('path');

// Read the WASM file and check its size and basic structure
const wasmPath = path.join(__dirname, '..', 'tree-sitter-rcl.wasm');
const wasmBuffer = fs.readFileSync(wasmPath);

console.log('WASM file info:');
console.log('- Size:', wasmBuffer.length, 'bytes');
console.log('- First 8 bytes:', Array.from(wasmBuffer.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));

// Check if it's a valid WASM file
const magic = wasmBuffer.slice(0, 4).toString('ascii');
const version = wasmBuffer.readUInt32LE(4);
console.log('- Magic:', magic === '\0asm' ? 'Valid WASM' : 'Invalid');
console.log('- Version:', version);

// Try to find scanner-related strings in the WASM
console.log('\nSearching for scanner-related strings...');
const wasmString = wasmBuffer.toString('latin1');
const scannerStrings = [
  'scanner_create',
  'scanner_destroy',
  'scanner_scan',
  'scanner_serialize',
  'scanner_deserialize',
  'external_scanner',
  '_newline',
  '_indent',
  '_dedent'
];

for (const str of scannerStrings) {
  if (wasmString.includes(str)) {
    console.log(`- Found: "${str}"`);
  }
}

// Also check the build directory
console.log('\nChecking build directory:');
const buildFiles = fs.readdirSync(path.join(__dirname, '..', 'build')).filter(f => f.endsWith('.c') || f.endsWith('.o'));
console.log('Build files:', buildFiles);