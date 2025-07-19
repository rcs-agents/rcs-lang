# RCL Tree-Sitter Monorepo

This monorepo contains the official tree-sitter grammar and language tools for the Rich Communication Language (RCL), a domain-specific language for creating RCS (Rich Communication Services) agents.

## 📦 Packages

### Core Packages
- **[@rcs-lang/parser](packages/parser)** - Tree-sitter grammar and parser with TypeScript AST utilities
- **[@rcs-lang/cli](packages/cli)** - Command-line compiler for RCL files
- **[@rcs-lang/language-service](packages/language-service)** - Advanced language service providers

### Applications
- **[rcl-language-support](apps/extension)** - VSCode extension with full language support

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Build all packages
nr build

# Run tests
nr test

# Start development mode
nr dev
```

## 🛠️ Development

This monorepo uses:
- **Bun** for package management and running scripts
- **Moon** build system for task orchestration
- **Biome** for linting and formatting TypeScript/JavaScript
- **dprint** for formatting JSON, Markdown, and TOML
- **TypeScript** across all packages
- **Tree-sitter** for parsing

### Common Commands

```bash
# Build everything
moon run :build

# Run all tests
moon run :test

# Type checking
moon run :typecheck

# Linting
moon run :lint

# Formatting
moon run :format

# Clean build artifacts
moon run :clean
```

## 📖 Documentation

- [RCL Formal Specification](docs/rcl-formal-specification.md)
- [Development Guide](CLAUDE.md)
- [Language Service Features](apps/extension/LANGUAGE_SERVICE_FEATURES.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.