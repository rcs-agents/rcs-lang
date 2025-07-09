# RCL Extension Comprehensive Test Plan

## Overview

This test plan ensures all implemented and planned professional features for the RCL VSCode extension are properly tested through automated means, without requiring manual verification. The plan covers Language Server Protocol (LSP) features, interactive diagram functionality, and the integration between them.

## Test Infrastructure Setup

### Required Testing Frameworks

1. **VSCode Extension Testing**
   - `@vscode/test-cli` - Core VSCode test runner
   - `@vscode/test-electron` - Electron-based test environment
   - `mocha` - Test framework for VSCode tests
   - `chai` - Assertion library

2. **Webview & Diagram Testing**
   - `wdio-vscode-service` - WebdriverIO service for VSCode
   - `webdriverio` - Browser automation framework
   - `@wdio/mocha-framework` - Mocha integration for WebdriverIO

3. **Visual Regression Testing**
   - `jest-image-snapshot` - Visual regression for Jest
   - `playwright` - Cross-browser testing with screenshot capabilities

4. **Unit Testing**
   - `vitest` - Fast unit test runner
   - `@vitest/ui` - Test UI for debugging

5. **Mocking & Test Utilities**
   - `sinon` - Spies, stubs, and mocks
   - `vscode-test-utils` - VSCode API mocking utilities

### Test Categories

1. **Unit Tests** (60-70%)
   - Individual provider classes
   - Parser functionality
   - Utility functions
   - No VSCode dependency

2. **Integration Tests** (20-30%)
   - LSP feature integration
   - Extension activation
   - Command execution
   - Real VSCode instance

3. **E2E Tests** (10%)
   - Full user workflows
   - Webview interactions
   - Visual regression

## Feature Test Coverage

### 1. Language Server Protocol Features

#### 1.1 Rename/Refactoring Support

**Test File**: `tests/integration/features/rename.test.ts`

```typescript
describe('Rename Provider', () => {
  // Setup VSCode test environment
  
  test('prepares rename for valid identifiers', async () => {
    // Test agent names, flow names, message identifiers, state names
    // Verify range returned for valid symbols
    // Verify null returned for keywords
  });
  
  test('validates new identifier names', async () => {
    // Test valid RCL identifier patterns
    // Test rejection of invalid names
    // Test reserved word handling
  });
  
  test('renames symbols across document', async () => {
    // Test single file renaming
    // Verify all occurrences updated
    // Check undo/redo functionality
  });
  
  test('handles edge cases', async () => {
    // Test renaming at document boundaries
    // Test partial matches not renamed
    // Test case sensitivity
  });
});
```

**Verification Points**:
- F2 triggers rename preparation
- Valid symbols show rename box
- Invalid identifiers rejected
- All references updated correctly
- Undo restores original state

#### 1.2 Code Actions & Quick Fixes

**Test File**: `tests/integration/features/codeActions.test.ts`

```typescript
describe('Code Actions Provider', () => {
  test('Import Missing Symbol', async () => {
    // Create document with undefined symbol
    // Request code actions at error position
    // Verify "Import symbol" action available
    // Execute action and verify import added
  });
  
  test('Create Missing Message', async () => {
    // Reference non-existent message
    // Verify quick fix available
    // Execute and check Messages section updated
    // Verify Messages section created if missing
  });
  
  test('Convert to Rich Card', async () => {
    // Select text message
    // Request code actions
    // Execute conversion
    // Verify rich card structure correct
  });
  
  // Test all 6 implemented quick fixes
});
```

**Verification Points**:
- Lightbulb icon appears on errors
- Context-appropriate fixes offered
- Multi-file edits work correctly
- Proper indentation maintained

#### 1.3 Signature Help

**Test File**: `tests/integration/features/signatureHelp.test.ts`

```typescript
describe('Signature Help Provider', () => {
  test('Message suggestions signatures', async () => {
    // Type "suggestions:" and verify popup
    // Check all suggestion types documented
    // Verify active parameter highlighting
  });
  
  test('Rich card properties', async () => {
    // Test within richCard context
    // Verify property documentation shown
    // Check markdown formatting
  });
  
  test('Trigger characters', async () => {
    // Test ':', ' ', '"' triggers
    // Verify correct context detection
  });
});
```

**Verification Points**:
- Popup appears at correct triggers
- Documentation is accurate
- Active parameter highlighted
- Dismisses appropriately

#### 1.4 Other LSP Features

**Test Files**:
- `tests/integration/features/completion.test.ts`
- `tests/integration/features/hover.test.ts`
- `tests/integration/features/definition.test.ts`
- `tests/integration/features/references.test.ts`
- `tests/integration/features/diagnostics.test.ts`

### 2. Interactive Diagram Features

#### 2.1 Basic Diagram Functionality

**Test File**: `tests/e2e/diagram/basic-interaction.test.ts`

```typescript
describe('Interactive Diagram Basic Features', () => {
  let browser: Browser;
  let page: Page;
  
  beforeAll(async () => {
    browser = await vscode.openBrowser();
    await vscode.openFile('examples/coffee-shop.rcl');
    await vscode.executeCommand('rcl.openInteractiveDiagram');
  });
  
  test('diagram loads with correct elements', async () => {
    // Wait for diagram render
    // Verify flow selector populated
    // Check nodes and edges rendered
    // Verify SVG structure
  });
  
  test('node selection and dragging', async () => {
    // Click node to select
    // Verify selection visual feedback
    // Drag node to new position
    // Verify position updated
  });
  
  test('edge creation', async () => {
    // Drag from source node port
    // Drop on target node
    // Verify edge created
    // Check edge rendering
  });
});
```

#### 2.2 Cursor Synchronization

**Test File**: `tests/e2e/diagram/cursor-sync.test.ts`

```typescript
describe('Cursor Synchronization', () => {
  test('editor to diagram sync', async () => {
    // Move cursor to flow state in editor
    // Verify corresponding node highlighted
    // Check green glow animation
    // Test multiple cursor positions
  });
  
  test('diagram to editor sync', async () => {
    // Click node in diagram
    // Verify editor jumps to code
    // Check selection in editor
    // Verify view centered
  });
  
  test('bidirectional sync performance', async () => {
    // Rapid cursor movements
    // Verify no lag or missed updates
    // Check throttling works
  });
});
```

**Verification Points**:
- Visual feedback (green glow)
- Accurate position mapping
- Smooth animations
- No performance issues

#### 2.3 WYSIWYG Editing (Planned Features)

**Test File**: `tests/e2e/diagram/wysiwyg-editing.test.ts`

```typescript
describe('WYSIWYG Diagram Editing', () => {
  test('inline text editing', async () => {
    // Double-click node
    // Verify edit mode activated
    // Type new text
    // Verify model updated
  });
  
  test('property sidebar editing', async () => {
    // Select message node
    // Verify property panel shows
    // Edit properties
    // Verify diagram updates
  });
  
  test('rich card builder', async () => {
    // Open rich card builder
    // Add title, description, media
    // Verify preview updates
    // Save and check code generation
  });
});
```

#### 2.4 Advanced Diagram Features

**Test File**: `tests/e2e/diagram/advanced-features.test.ts`

```typescript
describe('Advanced Diagram Features', () => {
  test('undo/redo operations', async () => {
    // Perform series of operations
    // Test undo for each
    // Test redo functionality
    // Verify state consistency
  });
  
  test('layout algorithms', async () => {
    // Test hierarchical layout
    // Test force-directed layout
    // Verify node positions updated
    // Check edge routing
  });
  
  test('export capabilities', async () => {
    // Export as SVG
    // Export as PNG
    // Verify file created
    // Check export quality
  });
});
```

### 3. Visual Regression Testing

**Test File**: `tests/visual/diagram-rendering.test.ts`

```typescript
describe('Visual Regression Tests', () => {
  test('diagram rendering consistency', async () => {
    // Load standard test files
    // Render diagrams
    // Compare screenshots
    // Flag visual differences
  });
  
  test('theme compatibility', async () => {
    // Test light theme
    // Test dark theme
    // Verify readability
  });
});
```

### 4. Performance Testing

**Test File**: `tests/performance/extension-performance.test.ts`

```typescript
describe('Performance Tests', () => {
  test('LSP response times', async () => {
    // Measure completion time < 100ms
    // Measure hover time < 50ms
    // Measure rename time < 200ms
  });
  
  test('diagram rendering performance', async () => {
    // Load large diagram (100+ nodes)
    // Measure initial render time
    // Test interaction responsiveness
  });
  
  test('memory usage', async () => {
    // Monitor memory during operations
    // Check for memory leaks
    // Verify garbage collection
  });
});
```

## Test Data Management

### Test Fixtures

Create standardized test files in `tests/fixtures/`:
- `simple-agent.rcl` - Basic agent with one flow
- `complex-flows.rcl` - Multiple interconnected flows
- `rich-messages.rcl` - Various message types
- `error-cases.rcl` - Known error patterns
- `large-diagram.rcl` - Performance testing (100+ nodes)

### Mock Data

- Mock LSP responses for unit tests
- Mock VSCode API for isolated testing
- Mock webview postMessage for communication tests

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Extension Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:unit

  integration-tests:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        vscode-version: ['stable', 'insiders']
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:integration
        env:
          VSCODE_VERSION: ${{ matrix.vscode-version }}

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: screenshots
          path: tests/screenshots/

  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:visual
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: visual-diffs
          path: tests/__image_snapshots__/__diff_output__/
```

## Test Execution Strategy

### Local Development

```bash
# Run all tests
npm test

# Run specific test category
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:visual

# Watch mode for TDD
npm run test:watch

# Debug specific test
npm run test:debug -- --grep "rename"
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit && npm run lint"
    }
  }
}
```

### Test Reports

- Coverage reports with Istanbul/nyc
- JUnit XML for CI integration
- HTML reports for detailed analysis
- Performance metrics tracking

## Success Criteria

### Coverage Goals

- **Overall**: > 80% code coverage
- **Critical Features**: > 90% coverage
- **New Code**: 100% coverage requirement

### Performance Targets

- All tests complete in < 5 minutes
- Unit tests < 30 seconds
- Integration tests < 2 minutes
- E2E tests < 3 minutes

### Quality Metrics

- Zero flaky tests
- All tests deterministic
- Clear failure messages
- Fast feedback loop

## Implementation Timeline

### Week 1: Test Infrastructure
- Set up testing frameworks
- Configure CI/CD pipeline
- Create test utilities and helpers
- Implement mock providers

### Week 2: LSP Feature Tests
- Implement rename tests
- Implement code action tests
- Implement signature help tests
- Add other LSP feature tests

### Week 3: Diagram Integration Tests
- Basic interaction tests
- Cursor synchronization tests
- WYSIWYG editing tests
- Property panel tests

### Week 4: Advanced Testing
- Visual regression setup
- Performance benchmarks
- E2E workflow tests
- Test optimization

## Maintenance Plan

### Regular Tasks

1. **Weekly**:
   - Review test failures
   - Update visual snapshots
   - Performance regression check

2. **Monthly**:
   - Test coverage analysis
   - Flaky test investigation
   - Test suite optimization

3. **Per Release**:
   - Full regression suite
   - Cross-platform validation
   - VSCode version compatibility

## Risk Mitigation

### Known Challenges

1. **Webview Testing Complexity**
   - Solution: Use WebdriverIO with proper wait strategies
   - Fallback: Screenshot-based validation

2. **VSCode Version Compatibility**
   - Solution: Test matrix with multiple versions
   - Fallback: Minimum version requirement

3. **Flaky Tests**
   - Solution: Proper wait conditions and retries
   - Fallback: Quarantine flaky tests

4. **Performance Overhead**
   - Solution: Parallel test execution
   - Fallback: Selective test runs

## Conclusion

This comprehensive test plan ensures all professional features of the RCL extension are thoroughly tested without manual intervention. By combining unit, integration, E2E, and visual regression testing, we can maintain high quality while enabling rapid development iterations. The automated nature of these tests allows for continuous validation of functionality throughout the development lifecycle.