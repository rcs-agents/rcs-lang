---
editUrl: false
next: false
prev: false
title: "Value"
---

> **Value** = [`PrimitiveValue`](/api/ast/type-aliases/primitivevalue/) \| [`Identifier`](/api/ast/interfaces/identifier/) \| [`Variable`](/api/ast/interfaces/variable/) \| [`PropertyAccess`](/api/ast/interfaces/propertyaccess/) \| [`List`](/api/ast/interfaces/list/) \| [`Dictionary`](/api/ast/interfaces/dictionary/) \| [`EmbeddedCode`](/api/ast/type-aliases/embeddedcode/) \| [`ContextualizedValue`](/api/ast/interfaces/contextualizedvalue/)

Defined in: [ast.ts:99](https://github.com/rcs-agents/rcs-lang/blob/dae76e6aa05b4d372009b015248dbcb36c5ae675/packages/ast/src/ast.ts#L99)

A union of all possible value types in RCL.

## Spec

Value ::= PrimitiveValue | IDENTIFIER | VARIABLE | PROPERTY_ACCESS | List | Dictionary | EmbeddedCode | ContextualizedValue
