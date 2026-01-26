# Coffee Shop Example - Diagram Test Coverage

## Overview

Added comprehensive E2E tests to ensure the "Open Interactive Diagram" command works correctly with the `examples/coffee-shop.rcl` file, which is a complex real-world example that uses advanced RCL features including context variables.

## Test Coverage Added

### 1. Basic Functionality Tests
**File**: `apps/extension/tests/e2e/diagram/coffee-shop-example.test.ts`

#### Opening Coffee Shop Example
- ✅ Successfully opens `examples/coffee-shop.rcl`
- ✅ Executes "Open Interactive Diagram" command without errors
- ✅ Verifies diagram webview loads and renders SVG

#### Coffee Shop Flow Visualization
- ✅ Shows "Order Flow" in flow selector
- ✅ Renders all expected coffee shop states:
  - Welcome
  - Choose Size
  - Choose Drink
  - Customize
  - Confirm Order
  - Invalid Option
- ✅ Renders edges between states with proper paths
- ✅ Shows edge labels for transitions (Order, Small, Large, Espresso, etc.)

### 2. Context Variable Testing
- ✅ Handles "Invalid Option" state with `@next` context variable
- ✅ Shows context variable usage in transitions with `with` clauses
- ✅ Verifies complex state transitions render without errors

### 3. Interaction Testing
- ✅ Node selection in complex flow
- ✅ Property panel display (if implemented)
- ✅ Node dragging with complex layout

### 4. Performance Testing
- ✅ Loads coffee shop diagram within 30 seconds
- ✅ Maintains responsive performance with complex state machine
- ✅ Multiple rapid operations complete within 2 seconds

### 5. Error Handling
- ✅ Gracefully handles compilation errors
- ✅ Shows loading states during processing
- ✅ Doesn't crash on complex examples

## Visual Regression Coverage

### Updated Visual Tests
**File**: `apps/extension/tests/visual/diagram-rendering.test.ts`

Added `examples/coffee-shop.rcl` to the list of files tested for:
- ✅ Diagram rendering consistency
- ✅ Theme compatibility (light/dark)
- ✅ Visual stability across updates

## Test Infrastructure Updates

### Package Scripts
**File**: `apps/extension/package.json`

Added new test script:
```json
"test:e2e:coffee-shop": "nr test:e2e -- --spec='**/coffee-shop-example.test.ts'"
```

### Test Runner
**File**: `apps/extension/tests/run-tests.sh`

Added coffee shop specific test step:
- Runs coffee shop tests after main E2E tests
- Provides specific feedback for coffee shop example compatibility
- Non-blocking (warns but doesn't fail entire suite)

### CI/CD Integration
**File**: `.github/workflows/extension-tests.yml`

Added coffee shop tests to GitHub Actions:
- Runs in separate step after main E2E tests
- Uses same Xvfb setup for headless testing
- Uploads screenshots on failure for debugging

## Verification Points

The tests verify that the coffee-shop.rcl example:

1. **Parses Correctly**: No syntax errors with context variables
2. **Compiles Successfully**: Generates valid AST and output
3. **Renders in Diagram**: All states and transitions appear
4. **Interactive Features Work**: Selection, dragging, property editing
5. **Performance is Acceptable**: Loads and responds within reasonable time
6. **Error Handling is Robust**: Graceful degradation if issues occur

## Context Variable Coverage

Specifically tests the context variable features that were recently fixed:

- **@next references**: Invalid Option state uses `@next` correctly
- **with clauses**: Transitions with context injection work (e.g., `with size: "small", price: 3.50`)
- **Complex flows**: Multi-state flows with context passing work correctly
- **String interpolation**: Messages with `#{@variable}` syntax render properly

## Benefits

1. **Real-World Testing**: Uses actual complex example instead of simplified test cases
2. **Regression Prevention**: Ensures future changes don't break the main example
3. **Feature Validation**: Confirms context variables work in practice
4. **Performance Monitoring**: Tracks performance with realistic complexity
5. **Documentation by Test**: Tests serve as living documentation of expected behavior

## Running the Tests

### Local Development
```bash
# Run just coffee shop tests
cd apps/extension
nr test:e2e:coffee-shop

# Run all tests including coffee shop
./tests/run-tests.sh
```

### CI/CD
Tests run automatically on:
- Push to main/develop branches
- Pull requests affecting extension code
- Changes to the coffee-shop.rcl example

## Success Criteria

All tests must pass to ensure:
- Coffee shop example loads in under 30 seconds
- All expected states render (6+ states)
- Multiple edges render with labels
- Interactive operations respond in under 2 seconds
- No crashes or error states in diagram
- Context variables (@next, @reply, etc.) work correctly
- Complex state transitions with 'with' clauses function properly

This comprehensive test coverage ensures that the "Open Interactive Diagram" command works reliably with real-world RCL examples, particularly those using advanced features like context variables and complex state flows.