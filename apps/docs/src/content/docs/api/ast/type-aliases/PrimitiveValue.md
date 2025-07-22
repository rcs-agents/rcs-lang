---
editUrl: false
next: false
prev: false
title: "PrimitiveValue"
---

> **PrimitiveValue** = [`StringLiteral`](/api/ast/interfaces/stringliteral/) \| [`MultiLineString`](/api/ast/interfaces/multilinestring/) \| [`NumericLiteral`](/api/ast/interfaces/numericliteral/) \| [`BooleanLiteral`](/api/ast/interfaces/booleanliteral/) \| [`NullLiteral`](/api/ast/interfaces/nullliteral/) \| [`Atom`](/api/ast/interfaces/atom/) \| [`TypeTag`](/api/ast/interfaces/typetag/)

Defined in: [ast.ts:113](https://github.com/rcs-agents/rcs-lang/blob/d67a89cedb553bfd3c4dced3f75360ae0dfac4db/packages/ast/src/ast.ts#L113)

A union of primitive value types.

## Spec

PrimitiveValue ::= STRING | MultiLineString | NUMBER | BooleanLiteral | NullLiteral | ATOM | TypeTag
