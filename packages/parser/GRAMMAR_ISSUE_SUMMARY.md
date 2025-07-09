# Grammar Parsing Issue Summary

## Problem
The RCL parser is not correctly parsing `agent_definition` nodes, resulting in ERROR nodes instead.

## Root Cause Analysis
1. **Grammar Mismatch**: There are two grammar implementations:
   - `grammar/index.js` - Uses indentation-based parsing with external scanner (like Python)
   - `grammar/index-stack-based.js` - Uses explicit `end` keywords for block termination

2. **Current State**:
   - The project is configured to use the stack-based grammar (`grammar.js` points to `index-stack-based.js`)
   - The stack-based grammar expects `end` keywords to terminate blocks
   - The example RCL files use indentation without `end` keywords
   - This mismatch causes parsing failures

3. **Technical Details**:
   - Individual tokens (`agent`, `displayName`, `flow`, etc.) are parsed correctly
   - The `flow_section` and `messages_section` rules work when parsed individually
   - The issue is specifically with the `agent_definition` rule not matching the full structure
   - Newlines are both in `extras` (automatically skipped) and explicitly required in rules, creating conflicts

## Attempted Solutions
1. Modified keyword precedence - no effect
2. Removed/added newline handling - no effect  
3. Tried switching to indentation-based grammar - failed due to missing external scanner for WASM

## Current Status
- Parser builds successfully but doesn't parse agent definitions correctly
- This affects the CLI's ability to compile RCL files
- Tests that expect proper AST structure will fail

## Recommendations
1. **Option 1**: Fix the stack-based grammar to properly handle the structure
2. **Option 2**: Implement the external scanner for the indentation-based grammar
3. **Option 3**: Update all example files to use `end` keywords to match the stack-based grammar

The specification (RCL_SPECIFICATION_QUICK_REFERENCE.md) indicates that `end` keywords ARE required, suggesting Option 3 might be the correct approach.