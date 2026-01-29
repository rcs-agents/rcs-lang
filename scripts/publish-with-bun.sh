#!/bin/bash
# Publish packages using bun instead of npm
# This bypasses changesets' npm dependency

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Publishing packages with bun...${NC}"

# Array of packages to publish (in dependency order)
PACKAGES=(
  "packages/ast"
  "packages/core"
  "packages/types"
  "packages/validation"
  "packages/parser"
  "packages/file-system"
  "packages/csm"
  "packages/compiler"
  "packages/language-service"
  "packages/cli"
)

# Track failures
FAILED_PACKAGES=()

for package in "${PACKAGES[@]}"; do
  echo -e "\n${YELLOW}Publishing $package...${NC}"

  if (cd "$package" && bun publish --access public); then
    echo -e "${GREEN}✓ Successfully published $package${NC}"
  else
    echo -e "${RED}✗ Failed to publish $package${NC}"
    FAILED_PACKAGES+=("$package")
  fi
done

# Summary
echo -e "\n${YELLOW}=== Publishing Summary ===${NC}"
if [ ${#FAILED_PACKAGES[@]} -eq 0 ]; then
  echo -e "${GREEN}All packages published successfully!${NC}"
  exit 0
else
  echo -e "${RED}Failed to publish the following packages:${NC}"
  for pkg in "${FAILED_PACKAGES[@]}"; do
    echo -e "  ${RED}✗ $pkg${NC}"
  done
  exit 1
fi
