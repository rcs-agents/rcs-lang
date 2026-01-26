#!/bin/bash

# RCL Extension Test Runner
# This script runs all the automated tests for the RCL VSCode extension

set -e

echo "🧪 RCL Extension Test Suite"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to extension directory
cd "$(dirname "$0")/.."

# Ensure dependencies are installed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    bun install
fi

# Compile the extension
echo ""
echo "🔨 Building extension..."
nr compile

# Run unit tests
echo ""
echo "🧪 Running unit tests..."
if nr test:server && nr test:client; then
    echo -e "${GREEN}✅ Unit tests passed${NC}"
else
    echo -e "${RED}❌ Unit tests failed${NC}"
    exit 1
fi

# Run integration tests
echo ""
echo "🔗 Running integration tests..."
if nr test:integration; then
    echo -e "${GREEN}✅ Integration tests passed${NC}"
else
    echo -e "${RED}❌ Integration tests failed${NC}"
    exit 1
fi

# Run E2E tests (webview tests)
echo ""
echo "🌐 Running E2E tests..."
if nr test:e2e; then
    echo -e "${GREEN}✅ E2E tests passed${NC}"
else
    echo -e "${RED}❌ E2E tests failed${NC}"
    exit 1
fi

# Run Coffee Shop specific tests
echo ""
echo "☕ Running Coffee Shop example tests..."
if nr test:e2e:coffee-shop; then
    echo -e "${GREEN}✅ Coffee Shop tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Coffee Shop tests failed - check example compatibility${NC}"
    echo "Coffee Shop test failures saved to: tests/screenshots/"
fi

# Run visual regression tests
echo ""
echo "📸 Running visual regression tests..."
if nr test:visual; then
    echo -e "${GREEN}✅ Visual tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Visual tests failed - check screenshots${NC}"
    echo "Visual diffs saved to: tests/__image_snapshots__/__diff_output__/"
fi

echo ""
echo "=========================="
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""

# Generate coverage report if available
if [ -f "coverage/lcov-report/index.html" ]; then
    echo "📊 Coverage report available at: coverage/lcov-report/index.html"
fi

# Summary
echo ""
echo "Test Summary:"
echo "- Unit tests: ✅"
echo "- Integration tests: ✅"
echo "- E2E tests: ✅"
echo "- Visual tests: Check for any visual differences"
echo ""
echo "Next steps:"
echo "1. Review any visual regression differences"
echo "2. Check coverage report for untested code"
echo "3. Run 'nr package' to create VSIX file for distribution"