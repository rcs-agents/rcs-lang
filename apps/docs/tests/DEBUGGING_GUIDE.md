# Debugging Guide for Playground Tests

This guide helps you debug the RCL playground and understand why tests are failing.

## Quick Diagnostic Commands

### 1. Run Tests with UI

```bash
cd apps/docs
bun run test:e2e:ui
```

This opens Playwright's UI where you can:
- Step through tests interactively
- See browser state at each step
- Inspect elements
- View console logs
- Take screenshots

### 2. Run Tests in Headed Mode

```bash
bun run test:e2e:headed
```

This runs tests with the browser visible so you can watch what's happening.

### 3. Run Specific Test

```bash
bunx playwright test -g "AST tab"
```

Runs only tests matching "AST tab".

### 4. Debug Mode

```bash
bun run test:e2e:debug
```

Opens Playwright Inspector for step-by-step debugging.

---

## Common Issues and Solutions

### Issue 1: "Module 'node:fs' has been externalized"

**Symptom:**
- Console shows: `Module "node:fs" has been externalized for browser compatibility`
- All output tabs are empty
- Tests fail with "expected content length > 50"

**Cause:**
The parser and compiler packages import Node.js modules that can't run in the browser.

**Check:**
```bash
# Look for Node.js imports in parser
grep -r "node:fs" packages/parser/src

# Look for Node.js imports in compiler
grep -r "node:fs\|node:path" packages/compiler/src
```

**Solutions:**

#### Option A: Create Browser Builds

1. Create browser entry points:
```typescript
// packages/parser/src/browser.ts
import { AntlrRclParser } from './antlr-parser';

// No file system imports here!
export async function parse(source: string) {
  const parser = new AntlrRclParser();
  await parser.initialize();
  return parser.parseSync(source);
}
```

2. Update package.json:
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./browser": "./src/browser.ts"
  }
}
```

3. Update playground imports:
```typescript
// Before (fails in browser):
import { parse } from '@rcs-lang/parser';

// After (works in browser):
import { parse } from '@rcs-lang/parser/browser';
```

#### Option B: Bundle with Vite

Update `astro.config.mjs`:
```javascript
vite: {
  resolve: {
    alias: {
      '@rcs-lang/parser': '@rcs-lang/parser/dist/browser.js'
    }
  },
  optimizeDeps: {
    include: ['@rcs-lang/parser', '@rcs-lang/compiler'],
    esbuildOptions: {
      target: 'es2020',
      platform: 'browser'
    }
  }
}
```

#### Option C: Remove Node.js Dependencies

Refactor packages to avoid Node.js APIs:
```typescript
// Before:
import fs from 'node:fs';
const content = fs.readFileSync(path, 'utf-8');

// After:
// Just work with strings passed in, no file I/O
export function parse(source: string) { ... }
```

---

### Issue 2: Parser Not Running

**Symptom:**
- AST tab shows "No AST available"
- No parse time in status bar
- Console may have errors

**Debugging Steps:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors when typing in editor
4. Check Network tab for failed module loads

**Check the Playground component:**

```typescript
// apps/docs/src/components/playground/Playground.tsx
const parseSource = useCallback(
  debounce(async (code: string) => {
    console.log('🔍 Attempting to parse:', code.substring(0, 50));

    try {
      const { parse } = await import('@rcs-lang/parser');
      console.log('✅ Parser module loaded');

      const result = await parse(code);
      console.log('✅ Parse result:', result);

      setParseResult(result);
    } catch (error) {
      console.error('❌ Parse failed:', error);
    }
  }, 500),
  []
);
```

**Verify parser exports:**

```bash
# Check what the parser exports
cat packages/parser/src/index.ts

# Check if browser build exists
ls packages/parser/dist/
```

---

### Issue 3: Diagram Not Rendering

**Symptom:**
- Diagram tab shows "No flows found" or error
- No SVG element in DOM
- Tests fail on "expect(svg).toBeVisible()"

**Debugging Steps:**

1. Check if AST has flows:
```javascript
// In browser console:
console.log(window.__DEBUG_AST__);
// Should have agent.sections with type='flow'
```

2. Check ast-to-diagram conversion:
```typescript
// apps/docs/src/components/playground/utils/ast-to-diagram.ts
export function astToDiagramFlows(ast: any): RCLFlowModel[] {
  console.log('🔄 Converting AST to flows:', ast);

  const flows = // ... conversion logic
  console.log('✅ Generated flows:', flows);

  return flows;
}
```

3. Check Sprotty initialization:
```typescript
// apps/docs/src/components/playground/panels/DiagramPanel.tsx
useEffect(() => {
  async function initializeDiagram() {
    console.log('📊 Initializing diagram');

    const { RCLWebDiagram } = await import('@rcs-lang/diagram/web');
    console.log('✅ Diagram module loaded');

    const diagram = new RCLWebDiagram('diagram-container', config);
    console.log('✅ Diagram instance created');

    diagram.initialize();
    console.log('✅ Diagram initialized');
  }
}, [ast]);
```

---

### Issue 4: Syntax Highlighting Not Working

**Symptom:**
- JSON/JS tabs show plain text
- No `.shiki` class in DOM
- No color highlighting

**Debugging Steps:**

1. Check Shiki hook:
```typescript
// apps/docs/src/components/playground/hooks/useShiki.ts
export function useShiki(code: string, language: string): string {
  console.log('🎨 Highlighting:', { code: code.substring(0, 50), language });

  useEffect(() => {
    async function highlight() {
      console.log('🎨 Getting Shiki instance');
      const shiki = await getShiki();
      console.log('✅ Shiki loaded');

      const html = shiki.codeToHtml(code, { lang: language, theme });
      console.log('✅ Highlighted HTML length:', html.length);

      setHighlighted(html);
    }
    highlight();
  }, [code, language, theme]);
}
```

2. Check if Shiki loaded:
```javascript
// In browser console:
import('shiki').then(m => console.log('Shiki exports:', Object.keys(m)));
```

3. Verify theme detection:
```javascript
// Check current theme:
console.log(document.documentElement.dataset.theme);
// Should be 'dark' or 'light'
```

---

### Issue 5: Tests Pass But Playground Doesn't Work

**Symptom:**
- Tests show green checkmarks
- But opening `/playground` in browser shows empty tabs

**Cause:**
Tests might be passing because they're timing out or checking wrong selectors.

**Verify:**

1. Run test with headed mode and watch:
```bash
bun run test:e2e:headed
```

2. Add explicit waits:
```typescript
test('AST content', async ({ page }) => {
  await page.goto('/playground');

  // Wait for actual content, not just element existence
  await page.waitForFunction(() => {
    const content = document.querySelector('.ast-content')?.textContent;
    return content && content.length > 50;
  }, { timeout: 5000 });
});
```

3. Take screenshots on failure:
```typescript
test('AST content', async ({ page }) => {
  await page.goto('/playground');

  try {
    await page.waitForSelector('.ast-content');
  } catch (error) {
    await page.screenshot({ path: 'test-failure.png' });
    throw error;
  }
});
```

---

## Useful Browser Console Commands

### Check if Parser Loaded

```javascript
import('@rcs-lang/parser').then(m => {
  console.log('Parser exports:', Object.keys(m));
  m.parse('agent Test {}').then(console.log);
});
```

### Check if Compiler Loaded

```javascript
import('@rcs-lang/compiler').then(m => {
  console.log('Compiler exports:', Object.keys(m));
});
```

### Check Current Theme

```javascript
console.log(document.documentElement.dataset.theme);
```

### Check Monaco Editor Content

```javascript
const editor = monaco.editor.getModels()[0];
console.log(editor.getValue());
```

### Force Re-parse

```javascript
// Trigger input event in Monaco
const event = new Event('input', { bubbles: true });
document.querySelector('.monaco-editor textarea').dispatchEvent(event);
```

---

## Test Troubleshooting Matrix

| Test Fails | Possible Cause | Check | Fix |
|-----------|---------------|-------|-----|
| AST tab empty | Parser not running | Console for errors | Fix browser compatibility |
| Diagram not rendering | No flows or Sprotty error | Check flows array | Fix ast-to-diagram conversion |
| JSON tab empty | Compiler not running | Console for import errors | Fix browser compatibility |
| JS tab empty | Compiler not running | Same as JSON | Same as JSON |
| No syntax highlighting | Shiki not loaded | Import shiki in console | Check Shiki installation |
| Status bar wrong | Parse not completing | Add timing logs | Fix parser execution |
| URL sharing broken | Hash not decoded | Check LZ-String import | Verify url-encoding.ts |
| Console errors | Module externalization | DevTools console | Create browser builds |

---

## When Tests Should Pass

✅ All tests should pass when:

1. **Parser runs in browser** without Node.js dependencies
2. **Compiler runs in browser** and generates JSON + JS
3. **Diagram library** (Sprotty) successfully renders SVG
4. **Shiki** highlights JSON and JavaScript output
5. **No console errors** about module externalization
6. **All tabs** show actual content (not placeholders)
7. **Parse time** is recorded and shown in status bar
8. **URL sharing** preserves and restores compilation state

---

## Getting Help

If you're still stuck after trying these debugging steps:

1. Check if issue is specific to one test:
   ```bash
   bunx playwright test -g "specific test name"
   ```

2. Run in debug mode with console output:
   ```bash
   DEBUG=pw:api bunx playwright test
   ```

3. Generate trace for detailed analysis:
   ```bash
   bunx playwright test --trace on
   bunx playwright show-trace trace.zip
   ```

4. Check if it's a timing issue:
   ```typescript
   // Add longer waits
   await page.waitForTimeout(5000);
   ```

5. Verify the playground works manually:
   ```bash
   bun run dev
   # Open http://localhost:4321/playground
   # Open DevTools console
   # Type code and check all tabs
   ```
