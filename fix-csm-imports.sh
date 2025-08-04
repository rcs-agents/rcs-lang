#!/bin/bash

# Fix CSM test imports
cd packages/csm/tests

for file in state-events.test.ts machine-transitions.test.ts pattern-matching.test.ts basic.test.ts machine-definition.test.ts serialization.test.ts; do
    if [ -f "$file" ]; then
        sed -i.bak "s|from '../src.js'|from '../src/index.js'|g" "$file"
        echo "Fixed imports in $file"
    fi
done

# Clean up backup files
rm -f *.bak

echo "Done fixing CSM test imports"