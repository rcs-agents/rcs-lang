#!/bin/bash

# Simple script to convert .js imports to .ts imports
# This script processes TypeScript files in packages/, apps/, and libs/

echo "🚀 Converting .js imports to .ts imports..."

# Function to process a directory
process_directory() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        echo "Processing directory: $dir"
        
        # Find all TypeScript files and convert .js imports to .ts imports
        find "$dir" -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/generated/*" -exec sed -i.bak \
            -e 's/from ["'\''][.][.]\/[^"'\'']*.js["'\'']/\0/g; s/\.js"/.ts"/g; s/\.js'\''/.ts'\''/g' \
            -e 's/from ["'\'']\.\/[^"'\'']*.js["'\'']/\0/g; s/\.js"/.ts"/g; s/\.js'\''/.ts'\''/g' \
            {} \;
            
        # Remove backup files
        find "$dir" -name "*.ts.bak" -delete
    fi
}

# Process main directories
process_directory "packages"
process_directory "apps"  
process_directory "libs"

echo "✅ Import conversion completed!"
echo "📝 Next steps:"
echo "   1. Test the build: bun run build"
echo "   2. If there are issues, check the generated migration log"