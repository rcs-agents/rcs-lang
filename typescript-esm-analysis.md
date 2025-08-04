# TypeScript ESM Import Extension Analysis

## Current Situation

The RCL monorepo has two problematic scripts that the security review identified as risks:

1. **fix-imports.js** - A Bun script that walks through all TypeScript source files and adds `.js` extensions to relative imports
2. **parser:postbuild** - A bash script using sed to add `.js` extensions to compiled JavaScript files in the dist directory

### Security Risks
- Command injection vulnerabilities in bash scripts
- Path traversal vulnerabilities
- Direct manipulation of compiled output

## Why These Scripts Exist

1. **ESM Requirement**: ESM requires explicit file extensions in relative imports
2. **TypeScript Behavior**: TypeScript doesn't automatically add `.js` extensions when compiling
3. **Current Configuration**: The project uses `"moduleResolution": "bundler"` which doesn't require extensions, but the compiled output needs them for Node.js ESM

## Current Configuration

```json
{
  "module": "ESNext",
  "moduleResolution": "bundler",
  "target": "ES2022"
}
```

## Problem Analysis

The mismatch occurs because:
1. Source files already have `.js` extensions in imports (processed by fix-imports.js)
2. TypeScript with `moduleResolution: "bundler"` doesn't validate these extensions
3. The compiled output still needs extensions for Node.js runtime

## Proposed Solutions

### Option 1: Switch to Node16/NodeNext (Recommended for Libraries)
```json
{
  "module": "NodeNext",
  "moduleResolution": "NodeNext",
  "target": "ES2022"
}
```

**Pros:**
- TypeScript enforces correct extensions at compile time
- No post-processing needed
- Aligns with Node.js ESM standards

**Cons:**
- Requires `.js` extensions in all source files
- More strict validation

### Option 2: Use allowImportingTsExtensions with noEmit
```json
{
  "module": "ESNext",
  "moduleResolution": "bundler",
  "allowImportingTsExtensions": true,
  "noEmit": true
}
```

**Pros:**
- Can use `.ts` extensions in imports
- Clean source code

**Cons:**
- Only works with `noEmit` or `emitDeclarationOnly`
- Still need a separate build tool

### Option 3: Use TypeScript 5.7+ rewriteRelativeImportExtensions
```json
{
  "module": "NodeNext",
  "moduleResolution": "NodeNext",
  "rewriteRelativeImportExtensions": true
}
```

**Pros:**
- TypeScript handles extension rewriting automatically
- No post-processing needed
- Can use `.ts` extensions in source

**Cons:**
- Requires TypeScript 5.7+
- Still experimental

## Recommendation

For this library monorepo that publishes packages:
1. Upgrade to TypeScript 5.7+
2. Use Option 3 with `rewriteRelativeImportExtensions`
3. Remove all post-processing scripts
4. Ensure all source files use `.ts` extensions in imports

## Implementation Steps

1. Update TypeScript to 5.7+
2. Update tsconfig files to use NodeNext with rewriteRelativeImportExtensions
3. Remove `.js` extensions from source file imports
4. Remove fix-imports.js script
5. Remove postbuild sed commands
6. Test build and runtime behavior

## Verified Solution

After testing with TypeScript 5.8.3, I've confirmed that `rewriteRelativeImportExtensions` works perfectly:
- Source files can use `.ts` extensions in imports
- TypeScript automatically rewrites them to `.js` in the compiled output
- No post-processing scripts needed

## Implementation Plan

### Phase 1: Update TypeScript Configuration
1. Update all tsconfig files to use:
   ```json
   {
     "module": "NodeNext",
     "moduleResolution": "NodeNext",
     "rewriteRelativeImportExtensions": true
   }
   ```

### Phase 2: Remove .js Extensions from Source Files
1. Modify all imports to use `.ts` extensions instead of `.js`
2. Handle special cases like JSON imports

### Phase 3: Remove Post-Processing Scripts
1. Remove `fix-imports.js` script
2. Remove `postbuild` sed commands from moon.yml
3. Update build pipeline to remove dependencies on these scripts

### Phase 4: Handle ANTLR Generated Files
1. The `fix-imports` task in moon.yml also handles ANTLR imports
2. Need to ensure ANTLR-generated files work with new configuration

## Implementation Progress

### Completed Steps:
1. ✅ Updated tsconfig.esm.json to use NodeNext and rewriteRelativeImportExtensions
2. ✅ Updated parser package imports from .js to .ts extensions as example
3. ✅ Removed postbuild script from parser's moon.yml
4. ✅ Updated fix-imports task to convert ANTLR .js imports to .ts

### Remaining Work:
1. Update all other packages to use .ts extensions in imports
2. Test the build across all packages
3. Verify runtime behavior with ESM
4. Remove fix-imports.js script if successful

## Questions for typescript-expert

1. What's your assessment of using `rewriteRelativeImportExtensions` for a library monorepo?
2. Are there any edge cases or compatibility issues we should consider?
3. Should we use NodeNext or Node16 for better future compatibility?
4. How should we handle the ANTLR-generated files that may not follow our import conventions?
5. Any concerns about backward compatibility for consumers of the published packages?
6. Best practices for handling the migration across a large monorepo?