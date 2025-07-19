# Publishing Guide for RCL Packages

This guide explains how to publish the RCL packages to npm using bun. All packages are versioned together to maintain consistency.

## Package Structure

### Published Packages (in `packages/`)
- `@rcs-lang/ast` - Core AST type definitions
- `@rcs-lang/compiler` - RCL compilation pipeline  
- `@rcs-lang/csm` - Conversation State Machine runtime
- `@rcs-lang/language-service` - Language service providers for IDEs

### Internal Packages (in `libs/`)
These are marked as `private` and should NOT be published:
- `@rcs-lang/core` - Shared internal interfaces
- `@rcs-lang/file-system` - File system abstractions
- `@rcs-lang/validation` - Validation implementation
- `@rcs-lang/diagram` - Diagram visualization

## Publishing Workflow

### Prerequisites
1. Ensure you have npm authentication set up: `npm login`
2. Ensure all tests pass: `bun run test`
3. Ensure the build is successful: `bun run build`

### Publishing Process

#### 1. Update Package Versions
All packages are versioned together. To bump the version:

```bash
# Bump patch version (0.0.1 -> 0.0.2)
bun run version:bump

# Bump minor version (0.0.1 -> 0.1.0)
bun run version:bump minor

# Bump major version (0.0.1 -> 1.0.0)
bun run version:bump major
```

This will update the version in:
- Root package.json
- All packages in packages/
- All internal libraries in libs/

#### 2. Dry Run (Recommended)
Always do a dry run first to see what will be published:

```bash
bun run publish:dry
```

This will:
- Build all packages
- Run all tests
- Show what would be published without actually publishing

#### 3. Publish to npm
When ready to publish:

```bash
bun run publish:packages
```

This will:
- Build all packages
- Run all tests  
- Publish all public packages to npm


## Important Notes

### Workspace Dependencies
The packages use `workspace:*` protocol for internal dependencies. During publishing, npm automatically converts these to the actual version numbers.

### Publishing Order
Due to interdependencies, packages should be published in this order:
1. `@rcs-lang/ast` (no internal dependencies)
2. `@rcs-lang/csm` (no internal dependencies)
3. `@rcs-lang/compiler` (depends on ast)
4. `@rcs-lang/language-service` (depends on compiler)

### Version Synchronization
All packages are kept at the same version number for simplicity and to ensure compatibility. The version is managed centrally through the `version:bump` script.

### Access Rights
All publishable packages are configured with `"access": "public"` in their `publishConfig`.

## Troubleshooting

### Authentication Issues
If you get authentication errors:
```bash
npm login
```

### Workspace Protocol Issues
If you see errors about `workspace:*` dependencies:
1. Ensure you're using `bunx npm publish` (not `bun publish`)
2. Check that all dependencies are built before publishing

### Build Failures
If packages fail to build:
```bash
moon run :clean
moon run :build
```

### Java Required for Parser
The ANTLR parser requires Java 17+. If you see Java-related errors:
```bash
cd packages/parser && ./install-java.sh
```