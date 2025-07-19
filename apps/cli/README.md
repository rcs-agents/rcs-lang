# @rcs-lang/cli

Command-line interface for compiling RCL (Rich Communication Language) files into JavaScript modules and JSON configurations.

## Overview

The RCL CLI provides a simple way to compile `.rcl` files from the command line. It supports multiple output formats and includes helpful development features like syntax validation and error reporting.

## Installation

### Global Installation
```bash
npm install -g @rcs-lang/cli
```

### Local Installation
```bash
npm install --save-dev @rcs-lang/cli
```

## Usage

### Basic Compilation

```bash
# Compile a single file
rcl compile agent.rcl

# Compile with specific output directory
rcl compile agent.rcl --output dist/

# Compile multiple files
rcl compile src/**/*.rcl
```

### Output Formats

By default, the CLI generates both JSON and JavaScript outputs:

```bash
# Input: agent.rcl
# Outputs:
#   - agent.json  (Runtime configuration)
#   - agent.js    (ES6 module)
```

### Command Reference

#### `compile`
Compile RCL files to JavaScript and JSON.

```bash
rcl compile <input> [options]

Options:
  -o, --output <dir>     Output directory (default: same as input)
  -f, --format <format>  Output format: json, js, both (default: both)
  --no-validation        Skip validation checks
  --watch               Watch files for changes
  --quiet               Suppress non-error output
  --verbose             Show detailed compilation info
```

#### `validate`
Check RCL files for syntax and semantic errors without generating output.

```bash
rcl validate <input> [options]

Options:
  --strict              Enable strict validation mode
  --max-errors <n>      Maximum errors to display (default: 10)
```

#### `parse`
Parse RCL files and output the AST (for debugging).

```bash
rcl parse <input> [options]

Options:
  --pretty              Pretty-print JSON output
  --include-location    Include source locations in AST
```

## Examples

### Simple Agent Compilation

```bash
# coffee-shop.rcl
rcl compile coffee-shop.rcl
```

Creates:
- `coffee-shop.json` - Runtime configuration
- `coffee-shop.js` - JavaScript module

### Watch Mode

```bash
# Automatically recompile on changes
rcl compile src/**/*.rcl --watch
```

### Validation Only

```bash
# Check for errors without compiling
rcl validate src/**/*.rcl --strict
```

### Custom Output Directory

```bash
# Compile all RCL files to dist/
rcl compile src/**/*.rcl --output dist/
```

## Error Handling

The CLI provides detailed error messages with source locations:

```
Error in coffee-shop.rcl:
  Line 15, Column 8: Missing required 'displayName' in agent definition
  
  13 | agent CoffeeShop
  14 |   # Missing displayName here
> 15 |   flow OrderFlow
     |        ^
  16 |     start: Welcome
```

## Configuration

Create an `rcl.config.json` file in your project root:

```json
{
  "output": {
    "directory": "dist",
    "formats": ["json", "js"]
  },
  "validation": {
    "strict": true,
    "rules": {
      "requireDisplayName": "error",
      "requireFlowStart": "error",
      "unusedMessages": "warning"
    }
  },
  "watch": {
    "ignore": ["**/*.test.rcl", "**/node_modules/**"]
  }
}
```

## Integration with Build Tools

### npm Scripts

```json
{
  "scripts": {
    "build:rcl": "rcl compile src/**/*.rcl --output dist/",
    "watch:rcl": "rcl compile src/**/*.rcl --output dist/ --watch",
    "validate:rcl": "rcl validate src/**/*.rcl --strict"
  }
}
```

### Webpack Integration

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.rcl$/,
        use: '@rcs-lang/webpack-loader'
      }
    ]
  }
};
```

## Programmatic Usage

```typescript
import { compile } from '@rcs-lang/cli';

async function buildRcl() {
  const result = await compile({
    input: 'src/**/*.rcl',
    output: 'dist/',
    format: ['json', 'js'],
    watch: false
  });
  
  if (!result.success) {
    console.error('Compilation failed:', result.errors);
    process.exit(1);
  }
}
```

## Exit Codes

- `0` - Success
- `1` - Compilation errors
- `2` - Invalid arguments
- `3` - File not found
- `4` - Write permission error

## Contributing

See the main repository README for contribution guidelines.

## License

MIT