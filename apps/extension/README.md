# RCL Language Support for Visual Studio Code

This extension provides comprehensive language support for the Rich Communication Language (RCL), a domain-specific language for creating RCS (Rich Communication Services) agents.

## Features

### ✅ Implemented

- **Syntax Highlighting**: Full TextMate grammar support for RCL syntax
- **Language Configuration**: Auto-closing pairs, brackets, indentation rules
- **Code Completion**: Context-aware completions for RCL keywords and structures
- **Hover Information**: Helpful documentation on hover for RCL constructs
- **Document Symbols**: Navigate your RCL files with the outline view
- **Code Formatting**: Automatic formatting with consistent indentation
- **Folding Ranges**: Collapse agent, flow, and message sections
- **Error Detection**: Basic syntax validation and diagnostics

### 🚧 Planned Features

- **Go to Definition**: Navigate to symbol definitions
- **Find References**: Find all usages of symbols
- **Rename Symbols**: Rename symbols across files
- **Semantic Tokens**: Enhanced syntax highlighting
- **Code Actions**: Quick fixes and refactoring suggestions
- **Embedded Language Support**: JavaScript/TypeScript support in expressions
- **Cross-file Analysis**: Multi-file project support

## Installation

### From Source

1. Clone the repository
2. Navigate to `apps/extension`
3. Run `npm install`
4. Run `npm run compile`
5. Open VS Code and go to Extensions
6. Click "Install from VSIX" and select the generated `.vsix` file

### From Marketplace (Coming Soon)

Search for "RCL Language Support" in the VS Code Extensions marketplace.

## Usage

1. Create a new file with the `.rcl` extension
2. Start typing RCL code - the extension will provide:
   - Syntax highlighting
   - Code completion (Ctrl+Space)
   - Error checking
   - Formatting (Shift+Alt+F)

### Example RCL File

```rcl
agent TestAgent
  displayName: "Test RCS Agent"
  description: "A sample RCS agent"

  configuration
    webhook_url: "https://example.com/webhook"
    timeout: 30s

  flow MainFlow
    start: Greeting

    on Greeting
      -> WelcomeMessage

  messages
    text WelcomeMessage "Welcome to our service!"
```

## Configuration

The extension can be configured through VS Code settings:

```json
{
  "rcl.validation.enabled": true,
  "rcl.completion.enabled": true,
  "rcl.formatting.enabled": true,
  "rcl.server.maxNumberOfProblems": 100,
  "rcl.trace.server": "off"
}
```

## Language Server Architecture

This extension uses the Language Server Protocol (LSP) for optimal performance:

- **Client**: VS Code extension that manages the language server
- **Server**: Node.js language server providing language features
- **Parser**: Tree-sitter based parser for accurate syntax analysis

## Development

### Building

```bash
npm install
npm run compile
```

### Testing

```bash
npm test
```

### Debugging

1. Open the extension in VS Code
2. Press F5 to launch Extension Development Host
3. Open a `.rcl` file to test the extension

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## RCL Language Reference

### Basic Structure

- **Agent**: Top-level definition of an RCS agent
- **Flow**: Conversation flow with states and transitions
- **Messages**: Reusable message templates
- **Configuration**: Agent configuration settings
- **Defaults**: Default values

### Keywords

- `agent`, `flow`, `messages`, `configuration`, `defaults`, `import`
- `True`, `False`, `Yes`, `No`, `On`, `Off`, `Enabled`, `Disabled`
- `Null`, `None`, `Void`

### Data Types

- Strings: `"text"` or multiline with `|`, `|-`, `+|`, `+|+`
- Numbers: `42`, `3.14`, `1e10`
- Durations: `30s`, `5m`, `P1Y2M3DT4H5M6S`
- Atoms: `:symbol`, `:start`, `:end`
- Type Tags: `<phone|+1234567890>`, `<email|user@example.com>`

## License

MIT License - see LICENSE file for details.

## Support

- [GitHub Issues](https://github.com/rcs-agents/rcs-lang/issues)
- [Documentation](https://rcs-agents.github.io/rcl-docs)
- [RCL Specification](https://github.com/rcs-agents/rcs-lang/blob/main/docs/rcl-formal-specification.md)
