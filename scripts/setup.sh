#!/bin/bash

echo "Setting up tools using proto..."
proto install
proto activate

# Check if claude command is available
if command -v claude &> /dev/null; then
    echo "Setting up Moon MCP in Claude code..."
    claude mcp add moon -s local -e MOON_WORKSPACE_ROOT="${PWD}" -- moon mcp
fi

echo "Creating .env file from Infisical..."
infisical export --format dotenv > .env