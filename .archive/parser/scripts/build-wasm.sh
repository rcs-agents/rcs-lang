#!/bin/bash

# Build WASM file for tree-sitter-rcl grammar
# This script requires either emscripten, docker, or podman

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARSER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Building tree-sitter-rcl WASM file..."
echo "Parser directory: $PARSER_DIR"

# Change to parser directory
cd "$PARSER_DIR"

# Check if tree-sitter CLI is installed
if ! command -v tree-sitter &> /dev/null; then
    echo "Error: tree-sitter CLI not found. Installing..."
   ni -g tree-sitter-cli
fi

# Generate the parser if needed
if [ ! -f "generated/parser.c" ]; then
    echo "Generating parser first..."
    tree-sitter generate
fi

# Check for build tools
if command -v emcc &> /dev/null; then
    echo "Found emscripten, building with emcc..."
    BUILD_METHOD="emscripten"
elif command -v docker &> /dev/null; then
    echo "Found docker, building with docker..."
    BUILD_METHOD="docker"
elif command -v podman &> /dev/null; then
    echo "Found podman, building with podman..."
    BUILD_METHOD="podman"
else
    echo "Error: No suitable build tool found!"
    echo ""
    echo "Please install one of the following:"
    echo "1. Emscripten: https://emscripten.org/docs/getting_started/downloads.html"
    echo "2. Docker: https://www.docker.com/get-started"
    echo "3. Podman: https://podman.io/getting-started/installation"
    echo ""
    echo "For quick setup with emsdk:"
    echo "  git clone https://github.com/emscripten-core/emsdk.git"
    echo "  cd emsdk"
    echo "  ./emsdk install latest"
    echo "  ./emsdk activate latest"
    echo "  source ./emsdk_env.sh"
    exit 1
fi

# Build the WASM file
echo "Building WASM file using $BUILD_METHOD..."
tree-sitter build --wasm "$PARSER_DIR"

# Check if build was successful
if [ -f "$PARSER_DIR/tree-sitter-rcl.wasm" ]; then
    echo "✅ Successfully built tree-sitter-rcl.wasm"
    echo "WASM file location: $PARSER_DIR/tree-sitter-rcl.wasm"
    
    # Show file size
    ls -lh "$PARSER_DIR/tree-sitter-rcl.wasm"
else
    echo "❌ Failed to build WASM file"
    exit 1
fi