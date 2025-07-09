#!/bin/bash

set -e

echo "🔨 Building RCL monorepo packages..."

# Core packages first
echo "📦 Building core packages..."
cd libs/core && bun run build && cd ../..
cd libs/file-system && bun run build && cd ../..
cd libs/validation && bun run build && cd ../..

# Parser packages
echo "🔧 Building parser package..."
cd packages/parser && bun run build && cd ../..

# Compiler
echo "⚙️ Building compiler..."
cd packages/compiler && bun run build && cd ../..

# CLI
echo "🚀 Building CLI..."
cd apps/cli && bun run build && cd ../..

# Extension server
echo "🔌 Building VSCode extension server..."
cd apps/extension/server && bun run build && cd ../../..

echo "✅ All packages built successfully!"