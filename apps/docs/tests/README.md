# RCL Playground E2E Tests

This directory contains end-to-end tests for the RCL Playground using Playwright.

## Purpose

These tests verify that the playground **actually compiles and displays content** in all output tabs:

- ✅ AST tab contains parsed AST nodes
- ✅ Errors tab shows compilation diagnostics
- ✅ Diagram tab renders interactive Sprotty SVG diagrams
- ✅ RBX JSON tab shows compiled RCS Business Messaging JSON
- ✅ JavaScript tab shows compiled CSM runtime code

## Current Status

⚠️ **These tests are currently FAILING** due to a browser compatibility issue:

```
Module "node:fs" has been externalized for browser compatibility.
Cannot access "node:fs.constants" in client code.
```

The issue is that `@rcs-lang/parser` and `@rcs-lang/compiler` have Node.js dependencies that cannot run in the browser. Once this is resolved (via WASM compilation, bundling fixes, or API endpoints), these tests will pass.

## Running Tests

```bash
# Run all tests
bun run test:e2e

# Run with UI mode (recommended for debugging)
bun run test:e2e:ui

# Run in headed mode (see browser)
bun run test:e2e:headed

# Run in debug mode
bun run test:e2e:debug
```

## Test Coverage

### Content Verification Tests

1. **AST Content** - Verifies AST tab contains actual parsed nodes with type information
2. **Diagram Rendering** - Checks that Sprotty generates SVG with nodes and edges
3. **RBX JSON Output** - Validates compiled JSON contains RCS Business Messaging properties
4. **JavaScript Output** - Checks compiled JS contains CSM runtime code
5. **Error Diagnostics** - Verifies error panel shows parse/compile errors
6. **Status Bar** - Checks parse time and cursor position display

### Integration Tests

7. **Example Loading** - Verifies all tabs update when loading examples
8. **URL Sharing** - Tests that compilation state persists in shared URLs
9. **Console Errors** - Ensures no module externalization errors appear

## What These Tests Will Catch

Once the browser compatibility issue is fixed, these tests will catch:

- ❌ Parser failing to run in browser
- ❌ Compiler not producing output
- ❌ Diagram library not rendering
- ❌ Syntax highlighter not working
- ❌ Empty panels or placeholder text
- ❌ Console errors from module loading

## Architecture Notes

The playground should work entirely client-side:

```
Monaco Editor → @rcs-lang/parser → @rcs-lang/compiler → Output Panels
                      ↓                     ↓
                    AST                  RBX JSON
                                         JavaScript
                                              ↓
                                      @rcs-lang/diagram → SVG
```

Current blockers:
- `@rcs-lang/parser` uses `node:fs` for file system operations
- `@rcs-lang/compiler` imports Node.js modules transitively
- Need to either:
  - Bundle these packages for browser use
  - Remove Node.js dependencies
  - Use WASM compilation
  - Move parsing/compilation to API endpoints

## Success Criteria

All tests should pass with:
- ✅ No console errors about module externalization
- ✅ All output tabs showing actual content (not placeholders)
- ✅ Diagram rendering interactive SVG
- ✅ Syntax highlighting working
- ✅ URL sharing preserving compilation state
