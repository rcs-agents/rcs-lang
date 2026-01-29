# RCL Playground E2E Test Plan

## Overview

This test suite verifies that the RCL Playground **actually parses and compiles RCL code** in the browser, displaying real output in all tabs. These tests are designed to fail until the `node:fs` browser compatibility issue is resolved.

## Test File Structure

```
tests/
├── README.md                       # Test documentation and status
├── TEST_PLAN.md                    # This file - detailed test plan
└── playground-content.spec.ts      # Main E2E test suite (9 tests)
```

## Critical Assertions

### 1. AST Tab Content Verification

**Test:** `AST tab should contain parsed AST content`

**What it checks:**
- AST panel is visible
- Content is not empty (>50 characters)
- Contains actual AST node type information (`type`, `kind`, `node`)
- Does NOT contain error messages about module externalization

**Why it will fail:**
Currently the AST is never generated because the parser can't run due to `node:fs` dependency.

**Expected when fixed:**
```typescript
// AST content should look like:
{
  type: "RclFile",
  agent: {
    type: "Agent",
    name: "HelloWorld",
    sections: [...]
  }
}
```

---

### 2. Diagram Rendering Verification

**Test:** `Diagram tab should render interactive diagram`

**What it checks:**
- Loads "Sub-flow Invocation" example (has flows)
- Diagram container is visible
- SVG element exists (from Sprotty)
- SVG has substantial content (>100 chars)
- Contains graph elements (`rect`, `circle`, `path`, `line`)
- No error messages shown

**Why it will fail:**
The `astToDiagramFlows()` function receives no AST because parsing fails, so no flows are generated.

**Expected when fixed:**
Should render an interactive SVG diagram with:
- State nodes as rectangles
- Transitions as edges with labels
- Orthogonal routing
- Zoom/pan controls

---

### 3. RBX JSON Compilation Verification

**Test:** `RBX JSON tab should show compiled RCS Business Messaging JSON`

**What it checks:**
- JSON panel is visible
- Has Shiki syntax highlighting (`.shiki` class)
- Content is not empty (>50 characters)
- Contains JSON structure (braces `{}`)
- Contains RCS Business Messaging properties:
  - `messages`
  - `richCard`
  - `suggestions`
  - `contentInfo`
- Does NOT contain placeholder text
- Copy button is visible

**Why it will fail:**
The compiler can't run without the parsed AST, so no RBX JSON is generated.

**Expected when fixed:**
```json
{
  "messages": [{
    "richCard": {
      "standaloneCard": {
        "cardContent": {
          "title": "Hello",
          "suggestions": [...]
        }
      }
    }
  }]
}
```

---

### 4. JavaScript Compilation Verification

**Test:** `JavaScript tab should show compiled CSM runtime code`

**What it checks:**
- JS panel is visible
- Has Shiki syntax highlighting
- Content is not empty (>50 characters)
- Contains JavaScript patterns (`function`, `const`, `class`, `export`)
- Contains CSM-related code (`state`, `handler`, `transition`)
- Does NOT contain placeholder text
- Copy button is visible

**Why it will fail:**
No JavaScript is generated because compilation can't run without the AST.

**Expected when fixed:**
```javascript
export class HelloWorldAgent {
  constructor() {
    this.state = 'start';
  }

  handleMessage(message) {
    // State machine logic
  }
}
```

---

### 5. Error Diagnostics Verification

**Test:** `Errors tab should show compilation diagnostics when present`

**What it checks:**
- Types invalid RCL code: `agent InvalidAgent {`
- Errors panel is visible
- Error items are displayed
- Error contains diagnostic information (>10 chars)
- Shows syntax/parse errors (not module externalization)
- Errors mention keywords like `error`, `expected`, `syntax`

**Why it will fail:**
Parser can't run to detect syntax errors due to `node:fs` dependency.

**Expected when fixed:**
```
Error: Expected '}' at line 1, column 21
```

---

### 6. Status Bar Statistics

**Test:** `Status bar should show parse statistics`

**What it checks:**
- Status bar is visible
- Shows parse time in milliseconds (e.g., "Parse: 42ms")
- Shows cursor position (e.g., "Line 1, Col 1")
- Parse time matches regex pattern `\d+\s*ms`

**Why it will fail:**
No parse time is recorded because parsing never completes.

**Expected when fixed:**
Status bar displays: `Parse: 15ms | 0 errors | Line 1, Col 1`

---

### 7. Example Loading Integration

**Test:** `Example loading should trigger full compilation pipeline`

**What it checks:**
- Loads "Coffee Shop Agent" example
- Editor content updates to show `CoffeeShop`
- All tabs have substantial content (>100 chars):
  - AST tab has node structure
  - RBX JSON has JSON braces and properties
  - JavaScript has code patterns
  - Diagram has SVG with graph elements

**Why it will fail:**
Loading an example triggers parsing, which fails due to browser incompatibility.

**Expected when fixed:**
All output tabs should update with compiled results from the example code.

---

### 8. URL Sharing State Preservation

**Test:** `URL sharing should preserve compilation state`

**What it checks:**
- Types code: `agent TestAgent { config { name: "Test" } }`
- Clicks Share button
- URL gets hash parameter with compressed code
- Opens URL in new page
- Code is restored in editor
- RBX JSON tab has compiled content (>50 chars)

**Why it will fail:**
While URL encoding/decoding works, the compilation doesn't happen due to parser failure.

**Expected when fixed:**
Shared URLs should restore both the code AND trigger successful compilation, showing output in all tabs.

---

### 9. Console Error Verification

**Test:** `Console should not show module externalization errors`

**What it checks:**
- Captures all console errors
- Clicks through all tabs to trigger lazy loading
- Verifies no errors contain:
  - `Module "node:fs" has been externalized`
  - `Cannot access "node:fs"`

**Why it will fail:**
The browser console currently shows this exact error when trying to load the parser/compiler.

**Expected when fixed:**
No console errors related to module externalization. Only possible user errors (like network issues).

---

## Root Cause Analysis

### The Problem

The RCL playground tries to import and run these packages in the browser:

```typescript
import { parse } from '@rcs-lang/parser';
import { RCLCompiler } from '@rcs-lang/compiler';
```

However, these packages have Node.js dependencies:
- `@rcs-lang/parser` imports `node:fs` for file system operations
- `@rcs-lang/compiler` transitively imports Node.js modules
- Vite/Astro externalize these for browser compatibility
- Browser cannot access `node:fs.constants` or other Node APIs

### Current Workaround Attempts

The `astro.config.mjs` has this configuration:

```javascript
vite: {
  ssr: {
    external: ['@rcs-lang/file-system', '@rcs-lang/compiler'],
  },
  optimizeDeps: {
    exclude: ['@rcs-lang/file-system', '@rcs-lang/compiler', '@rcs-lang/parser'],
  },
}
```

This prevents SSR crashes but doesn't solve the browser runtime issue.

---

## Solutions to Make Tests Pass

### Option 1: Bundle for Browser (Recommended)

Create browser-compatible builds of parser and compiler:

1. **Create browser entry points:**
   ```
   packages/parser/src/browser.ts
   packages/compiler/src/browser.ts
   ```

2. **Replace Node.js APIs:**
   - Remove `node:fs` imports
   - Use in-memory file system
   - Bundle with esbuild/rollup for browser target

3. **Update playground imports:**
   ```typescript
   import { parse } from '@rcs-lang/parser/browser';
   import { RCLCompiler } from '@rcs-lang/compiler/browser';
   ```

### Option 2: WASM Compilation

Compile the parser to WebAssembly:
- Use emscripten to compile ANTLR4 runtime
- Bundle parser grammar as WASM
- Faster execution, smaller bundle

### Option 3: API Endpoints

Move parsing/compilation to server:
- Create `/api/parse` endpoint
- Create `/api/compile` endpoint
- Playground makes fetch requests
- Less ideal: requires server, adds latency

### Option 4: Remove File System Dependencies

Refactor packages to be browser-compatible from the start:
- Abstract file system behind interface
- Use dependency injection for platform-specific implementations
- Browser implementation uses in-memory virtual FS

---

## How to Verify Tests After Fix

1. **Fix the browser compatibility issue** using one of the solutions above

2. **Run tests:**
   ```bash
   bun run test:e2e
   ```

3. **All 9 tests should pass:**
   - ✅ AST tab shows parsed nodes
   - ✅ Diagram renders SVG with flows
   - ✅ RBX JSON shows compiled output
   - ✅ JavaScript shows CSM runtime
   - ✅ Errors show diagnostics
   - ✅ Status bar shows parse time
   - ✅ Examples trigger full pipeline
   - ✅ URL sharing preserves state
   - ✅ No console errors

4. **Manual verification:**
   - Open `/playground` in browser
   - Type RCL code
   - See all tabs populate with content
   - No errors in console
   - Diagram is interactive
   - Share URL works

---

## Test Maintenance

After the fix, these tests should:
- Run on every PR (CI/CD)
- Catch regressions in parser/compiler browser compatibility
- Verify all output panels show content
- Ensure no performance regressions (parse time)
- Validate URL sharing functionality

## Success Metrics

✅ **All tests green**
✅ **No console errors**
✅ **Parse time < 100ms** for typical agents
✅ **All output tabs have content** within 1 second
✅ **Diagram renders** within 2 seconds
✅ **URL sharing** restores state correctly
