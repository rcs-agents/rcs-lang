#!/bin/bash

echo "Installing Java for ANTLR parser generation..."

# Check if running on Ubuntu/Debian
if command -v apt-get >/dev/null 2>&1; then
    echo "Detected Ubuntu/Debian system"
    echo "To install Java, run:"
    echo "  sudo apt update"
    echo "  sudo apt install -y openjdk-17-jdk"
# Check if running on macOS
elif command -v brew >/dev/null 2>&1; then
    echo "Detected macOS with Homebrew"
    echo "To install Java, run:"
    echo "  brew install openjdk@17"
    echo "  echo 'export PATH=\"/opt/homebrew/opt/openjdk@17/bin:$PATH\"' >> ~/.zshrc"
    echo "  source ~/.zshrc"
else
    echo "Please install Java 17 or later manually for your system"
    echo "ANTLR requires Java to generate the parser from grammar files"
fi

echo ""
echo "After installing Java, you can build the ANTLR package with:"
echo "  cd packages/parser && bun run build"