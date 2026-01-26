#!/bin/bash

# Script to install Emscripten for building WASM files

set -e

echo "Installing Emscripten SDK..."
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is required to install emsdk"
    exit 1
fi

# Create a temporary directory for emsdk
EMSDK_DIR="$HOME/.emsdk"

if [ -d "$EMSDK_DIR" ]; then
    echo "Emscripten SDK already exists at $EMSDK_DIR"
    echo "Activating existing installation..."
else
    echo "Cloning emsdk repository..."
    git clone https://github.com/emscripten-core/emsdk.git "$EMSDK_DIR"
fi

cd "$EMSDK_DIR"

echo ""
echo "Installing latest Emscripten..."
./emsdk install latest

echo ""
echo "Activating Emscripten..."
./emsdk activate latest

echo ""
echo "✅ Emscripten installed successfully!"
echo ""
echo "To use Emscripten in your current shell, run:"
echo "  source $EMSDK_DIR/emsdk_env.sh"
echo ""
echo "Then you can build the WASM file with:"
echo "  npm run build-wasm"