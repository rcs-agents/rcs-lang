---
editUrl: false
next: false
prev: false
title: "PrimitiveValue"
---

> **PrimitiveValue** = [`StringLiteral`](/api/ast/interfaces/stringliteral/) \| [`MultiLineString`](/api/ast/interfaces/multilinestring/) \| [`NumericLiteral`](/api/ast/interfaces/numericliteral/) \| [`BooleanLiteral`](/api/ast/interfaces/booleanliteral/) \| [`NullLiteral`](/api/ast/interfaces/nullliteral/) \| [`Atom`](/api/ast/interfaces/atom/) \| [`TypeTag`](/api/ast/interfaces/typetag/)

Defined in: [ast.ts:114](https://github.com/rcs-agents/rcs-lang/blob/2c0291a4209143052b64b2c6ec7573ef29bacea2/packages/ast/src/ast.ts#L114)

A union of primitive value types.

## Spec

PrimitiveValue ::= STRING | MultiLineString | NUMBER | BooleanLiteral | NullLiteral | ATOM | TypeTag
