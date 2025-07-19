# Extension Test Structure

This directory contains all tests for the RCL VSCode extension, organized semantically for better maintainability.

## Directory Structure

```
test/
├── unit/           # Unit tests that can run with Bun
│   ├── client/     # Client-side unit tests
│   └── server/     # Server-side unit tests
├── integration/    # Integration tests requiring VSCode runtime
├── e2e/           # End-to-end tests (future)
└── fixtures/      # Test data and fixtures
```

## Running Tests

### Unit Tests (Bun)
These tests run without VSCode and use Bun for fast execution:

```bash
# Run all unit tests
bun test

# Run only unit tests
bun test test/unit

# Run client unit tests
bun test test/unit/client

# Run server unit tests
bun test test/unit/server

# Watch mode
bun test --watch

# Coverage
bun test --coverage
```

### Integration Tests (VSCode)
These tests require the VSCode runtime and test the extension in a real VSCode environment:

```bash
# Run VSCode integration tests
npm run test:integration

# Run all tests (unit + integration)
npm run test:all
```

## Test Organization

### Unit Tests
- **client/**: Tests for client-side functionality (diagrams, compilation service, etc.)
- **server/**: Tests for language server features (completion, hover, diagnostics, etc.)
- **server/features/**: Tests for specific language service providers

### Integration Tests
- Tests that require VSCode API access
- Tests for commands, webviews, and extension activation
- Full end-to-end scenarios with VSCode workspace

### Fixtures
- `simple.rcl`, `travel-agent.rcl`: Example RCL files for testing
- `*-expected.json`: Expected compilation output for validation
- Additional test data as needed

## Writing Tests

### Unit Tests
Use standard testing practices without VSCode dependencies:

```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(myFunction()).toBe(expectedResult);
  });
});
```

### Integration Tests
Use VSCode testing utilities:

```typescript
import * as vscode from 'vscode';
import * as assert from 'assert';

suite('Extension Test Suite', () => {
  test('My VSCode Feature', async () => {
    const result = await vscode.commands.executeCommand('myCommand');
    assert.strictEqual(result, expected);
  });
});
```

## Notes

- The `bunfig.toml` excludes integration tests from Bun test runs
- Integration tests use the VSCode test runner with Mocha
- Keep unit tests fast and focused on single units
- Use integration tests for testing VSCode-specific features