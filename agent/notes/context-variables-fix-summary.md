# Context Variables Fix and Testing Summary

## Issue Identified

The `coffee-shop.rcl` example was failing to compile with errors:
```
ERROR: extraneous input '@next' expecting {'match', ATTRIBUTE_NAME, IDENTIFIER, SECTION_TYPE, '->', '...', NEWLINE}
```

The issue was that the RCL grammar didn't support context variable references (`@variable`) as state references in flow states.

## Root Cause

In the ANTLR grammar file `packages/parser/src/RclParser.g4`, the `state_reference` rule only allowed `IDENTIFIER`, but `@next` is a `variable_access` token:

```antlr
// Before (incorrect)
state_reference: IDENTIFIER NEWLINE;

// After (fixed)
state_reference: (IDENTIFIER | variable_access) NEWLINE;
```

## Fix Applied

1. **Grammar Fix**: Updated the parser grammar to allow variable access in state references
2. **Rebuild Parser**: Regenerated the ANTLR parser with the updated grammar
3. **Verified Fix**: Confirmed that `coffee-shop.rcl` now compiles successfully

## Tests Added

### 1. Context Variable Syntax Tests
**File**: `packages/parser/tests/context-variables.test.ts`

Tests cover:
- ✅ Simple context variable reference (`@next`)
- ✅ Context variable with property access (`@reply.text`)
- ✅ Context variables in string interpolation (`"Hello #{@userName}!"`)
- ✅ Nested property access (`@order.item.type`)
- ✅ Context variables in with clause (`with size: "small", price: @prices.small`)
- ✅ Invalid Option pattern from coffee-shop example
- ✅ Context variables in various positions
- ✅ Multiline content with context variables

**Result**: 8 tests passing

### 2. Semantic Validation Tests
**File**: `packages/compiler/tests/semantic-validation.test.ts`

Tests structure prepared for:
- Context variable requirements validation
- State flow validation
- Message reference validation

**Current Status**: 1 test passing (basic parsing), 6 tests skipped (semantic validation not yet implemented)

## Context Variable Specification

According to the RCL formal specification (`docs/rcl-formal-specification.md`):

```ebnf
VARIABLE ::= /@[a-zA-Z_][a-zA-Z0-9_]*/                     // @variable
PROPERTY_ACCESS ::= VARIABLE ('.' ATTRIBUTE_KEY)*          // @obj.property
```

### Usage Patterns

1. **State References**: `@next` (returns to context-specified state)
2. **Match Expressions**: `match @reply.text` (access user input)
3. **String Interpolation**: `"Hello #{@userName}!"` (embed context values)
4. **Property Access**: `@order.item.type` (navigate context objects)
5. **With Parameters**: `with data: @currentData` (pass context to next state)

### Semantic Rules

As you specified, the runtime behavior should be:

1. **@next requirement**: States using `@next` must receive a `next` context variable
2. **Context validation**: Using `InvalidOption` without `with next: SomeState` should error
3. **Automatic variables**: Runtime provides `@reply` (user's suggestion) and `@option` automatically
4. **Error message**: "The InvalidOption state requires the 'next' property to be set using the with operator"

## Files Modified

1. `packages/parser/src/RclParser.g4` - Updated grammar
2. `examples/coffee-shop.rcl` - Added clarifying comment
3. `packages/parser/tests/context-variables.test.ts` - New comprehensive tests
4. `packages/compiler/tests/semantic-validation.test.ts` - New semantic validation framework

## Verification

- ✅ `coffee-shop.rcl` compiles successfully
- ✅ All existing tests continue to pass
- ✅ New context variable tests pass
- ✅ Grammar correctly handles variable access as state references
- ✅ No regressions in other features

## Next Steps

To complete the semantic validation as you described:

1. **Implement Context Tracking**: Modify the `ValidateStage` to track context variables through state transitions
2. **Add Required Variable Validation**: Check that states using context variables receive them via `with` clauses
3. **Enhance Error Messages**: Provide specific messages like "state requires the 'next' property"
4. **Enable Semantic Tests**: Remove `.skip` from the semantic validation tests once implemented

This fix ensures that context variables work correctly in the RCL language while maintaining backward compatibility and providing a solid foundation for future semantic validation features.