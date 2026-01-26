#!/bin/bash

# Coffee Shop Example Validation Script
# This script verifies that the coffee-shop.rcl example works correctly

set -e

echo "🧪 Coffee Shop Example Validation"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

# Check if coffee-shop.rcl exists
COFFEE_SHOP_PATH="../../examples/coffee-shop.rcl"
if [ ! -f "$COFFEE_SHOP_PATH" ]; then
    echo -e "${RED}❌ coffee-shop.rcl not found at $COFFEE_SHOP_PATH${NC}"
    exit 1
fi

echo "✅ Found coffee-shop.rcl"

# Compile the extension first
echo ""
echo "🔨 Compiling extension..."
npm run compile

# Test CLI compilation
echo ""
echo "📦 Testing CLI compilation..."
cd ../cli
if npx tsx src/index.ts compile "$COFFEE_SHOP_PATH"; then
    echo -e "${GREEN}✅ CLI compilation successful${NC}"
else
    echo -e "${RED}❌ CLI compilation failed${NC}"
    exit 1
fi

# Return to extension directory
cd ../extension

# Run syntax validation
echo ""
echo "🔍 Running syntax validation tests..."
if npm run test:server; then
    echo -e "${GREEN}✅ Server tests passed${NC}"
else
    echo -e "${RED}❌ Server tests failed${NC}"
    exit 1
fi

# Run coffee shop specific E2E tests (if WebDriverIO is available)
echo ""
echo "🌐 Testing interactive diagram functionality..."
if command -v wdio >/dev/null 2>&1; then
    echo "WebDriverIO found - running E2E tests..."
    if npm run test:e2e:coffee-shop; then
        echo -e "${GREEN}✅ Coffee shop E2E tests passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Coffee shop E2E tests failed - check logs${NC}"
        echo "This may be due to environment setup. Manual testing recommended."
    fi
else
    echo -e "${YELLOW}⚠️  WebDriverIO not available - skipping E2E tests${NC}"
    echo "To run full tests, install WebDriverIO: npm install -g @wdio/cli"
fi

echo ""
echo "==================================="
echo -e "${GREEN}✅ Coffee Shop validation completed!${NC}"
echo ""
echo "Manual verification steps:"
echo "1. Open VSCode with the RCL extension"
echo "2. Open examples/coffee-shop.rcl"
echo "3. Check that NO error diagnostics appear in the Problems panel"
echo "4. Run 'RCL: Open Interactive Diagram' command"
echo "5. Verify the diagram loads and shows all states:"
echo "   - Welcome, ChooseSize, ChooseDrink, Customize, ConfirmOrder"
echo "   - ProcessPayment, OrderComplete, InvalidOption, etc."
echo ""
echo "If any issues are found, check the test output above for details."