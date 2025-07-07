# Building the WASM File for RCL Parser

The RCL parser supports both native Node.js bindings and WebAssembly (WASM) for browser environments. This guide explains how to build the WASM file.

## Prerequisites

To build the WASM file, you need one of the following:

1. **Emscripten** (Recommended)
2. **Docker**
3. **Podman**

## Option 1: Install Emscripten (Recommended)

### Quick Install

We provide a convenience script to install Emscripten:

```bash
./scripts/install-emscripten.sh
source ~/.emsdk/emsdk_env.sh
```

### Manual Install

1. Clone the emsdk repository:
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ```

2. Install and activate the latest SDK:
   ```bash
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```

## Option 2: Use Docker

If you have Docker installed, tree-sitter can use it automatically to build the WASM file.

## Option 3: Use Podman

Similar to Docker, Podman can be used as a drop-in replacement.

## Building the WASM File

Once you have one of the prerequisites installed:

```bash
npm run build-wasm
```

This will generate `tree-sitter-rcl.wasm` in the parser package directory.

## Verifying the Build

After building, you can verify the WASM file:

```bash
ls -lh tree-sitter-rcl.wasm
```

You should see a file around 300-400KB in size.

## Using the Parser

The parser automatically detects the environment and uses:
- Native Node.js binding when available (Node.js environments)
- WASM file when in browser environments or when native binding is not available

## Troubleshooting

### "No suitable build tool found" Error

This means none of the required tools (emcc, docker, podman) are available. Install one of them using the instructions above.

### WASM File Not Found

If the parser reports "WASM file not found", ensure you've run `npm run build-wasm` successfully.

### Build Fails

1. Ensure the parser is generated first:
   ```bash
   npm run build-grammar
   ```

2. Check that you have the correct tree-sitter-cli version:
   ```bash
   npx tree-sitter --version
   ```

## CI/CD Integration

For automated builds, you can:

1. Use a Docker-based CI environment
2. Install Emscripten in your CI pipeline
3. Use pre-built WASM files checked into version control (not recommended for development)