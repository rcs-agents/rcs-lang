# VS Code Extension Testing Guide

This guide explains how to run and maintain the automated tests for the RCL VS Code extension.

## Test Structure

The extension has three types of tests:

1. **Unit Tests** - Fast tests that don't require VS Code
2. **Server Tests** - Tests for the language server functionality  
3. **Integration Tests** - Full VS Code extension tests that run in a real VS Code instance

## Running Tests

### Run All Tests
```bash
# From extension directory
npm run test:all

# Using moon
moon run extension:test:all
```

### Run Specific Test Types

```bash
# Unit tests only
npm run test

# Server tests only
cd server && npm test

# Integration tests only  
npm run test:integration
```

### Debug Tests in VS Code

1. Open the extension folder in VS Code
2. Go to Run and Debug (Ctrl+Shift+D)
3. Select "Extension Tests" from the dropdown
4. Press F5 to run tests with debugging

## Test Files

- **Unit Tests**: `client/src/test/extension.test.ts`
- **Server Tests**: `server/src/test/*.test.ts`
- **Integration Tests**: `client/src/test/integration.test.ts`

## What the Tests Cover

### Integration Tests
- Extension activation
- Command registration and execution
- Language server features:
  - Syntax highlighting
  - Diagnostics
  - Hover information
  - Code completion
  - Document symbols
  - Go to definition
- Error handling
- Multi-file support

### Server Tests  
- Parser initialization
- RCL syntax validation
- Title Case identifier validation
- Symbol extraction
- Error recovery

## CI/CD Integration

Tests run automatically on:
- Push to main/develop branches
- Pull requests
- Multiple OS (Ubuntu, Windows, macOS)
- Multiple Node versions (18.x, 20.x)

See `.github/workflows/extension-tests.yml` for CI configuration.

## Adding New Tests

1. For language features: Add to `integration.test.ts`
2. For parser features: Add to `server/src/test/languageServer.test.ts`
3. For utility functions: Add unit tests to `extension.test.ts`

## Troubleshooting

### Tests Fail Locally but Pass in CI
- Ensure you've built the parser: `npm run build:parser`
- Check that native bindings are built: `cd packages/parser && npm run build-native`
- Clean and rebuild: `npm run clean && npm run build`

### Integration Tests Timeout
- Increase timeout in `integration.test.ts` before() hook
- Check that language server initializes properly
- Verify parser files are copied correctly

### Can't Find Parser Files
- Run `npm run copy-wasm` in extension directory
- Verify `tree-sitter-rcl.wasm` exists in `server/out/`
- Check native bindings in `server/out/build/Release/`