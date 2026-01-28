#!/bin/bash
set -e

# Verify npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm could not be found, please install it."
    exit 1
fi

# Determine the project root directory (assuming script is in /scripts)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PACKAGES_DIR="$PROJECT_ROOT/packages"

# 1. Ask for login
read -p "Do you want to run npm login? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Logging in to npm..."
    npm login
else
    echo "Skipping login..."
fi

publish_package() {
    local dir=$1
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
        local package_name=$(basename "$dir")
        echo "--------------------------------------------------"
        echo "Publishing package: $package_name"
        echo "--------------------------------------------------"

        # Use npm's --prefix flag to publish from a specific directory
        # This avoids subshell issues with npm config loading
        npm publish "$dir" --access public
    else
        echo "Warning: Directory not found or invalid: $dir"
    fi
}

# 2. Determine targets
if [ $# -gt 0 ]; then
    echo "Publishing specific packages from arguments..."
    for name in "$@"; do
        publish_package "$PACKAGES_DIR/$name"
    done
else
    echo "No package names provided. Publishing ALL packages in $PACKAGES_DIR..."
    for dir in "$PACKAGES_DIR"/*; do
        publish_package "$dir"
    done
fi

echo "--------------------------------------------------"
echo "All packages processed."
