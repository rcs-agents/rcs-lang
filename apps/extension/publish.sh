#!/bin/bash

# Load environment variables
if [ -f "../../.env" ]; then
  export $(cat ../../.env | grep -v '^#' | xargs)
fi

# Check if token is set
if [ -z "$VSCODE_PUBLISH_TOKEN" ]; then
  echo "Error: VSCODE_PUBLISH_TOKEN not found in .env file"
  exit 1
fi

# Run the vsce publish command with arguments
vsce publish "$@" --no-dependencies --pat "$VSCODE_PUBLISH_TOKEN"