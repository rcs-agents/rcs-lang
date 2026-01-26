#!/bin/bash

# Simple WASM build script using Docker
# This is the easiest way without installing emscripten locally

cd "$(dirname "$0")/.."

echo "Building RCL WASM file using Docker..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker Desktop from:"
    echo "https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Generate parser first
echo "Generating parser..."
npx tree-sitter generate

# Build WASM using Docker
echo "Building WASM with Docker..."
docker run --rm -v "$PWD":/src -w /src trzeci/emscripten \
    emcc -o tree-sitter-rcl.wasm \
    -Os -s WASM=1 -s SIDE_MODULE=1 \
    -s EXPORTED_FUNCTIONS="['_tree_sitter_rcl']" \
    -s TOTAL_MEMORY=33554432 \
    -fno-exceptions \
    -I src \
    src/parser.c src/scanner.c

if [ -f "tree-sitter-rcl.wasm" ]; then
    echo "✓ WASM file built successfully!"
    ls -la tree-sitter-rcl.wasm
else
    echo "✗ Failed to build WASM file"
    exit 1
fi