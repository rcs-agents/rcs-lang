---
editUrl: false
next: false
prev: false
title: "PrimitiveValue"
---

> **PrimitiveValue** = [`StringLiteral`](/api/ast/interfaces/stringliteral/) \| [`MultiLineString`](/api/ast/interfaces/multilinestring/) \| [`NumericLiteral`](/api/ast/interfaces/numericliteral/) \| [`BooleanLiteral`](/api/ast/interfaces/booleanliteral/) \| [`NullLiteral`](/api/ast/interfaces/nullliteral/) \| [`Atom`](/api/ast/interfaces/atom/) \| [`TypeTag`](/api/ast/interfaces/typetag/)

Defined in: [ast.ts:114](https://github.com/rcs-agents/rcs-lang/blob/3050c02cb37fc4f276350de86af1e0873f1db089/packages/ast/src/ast.ts#L114)

A union of primitive value types.

## Spec

PrimitiveValue ::= STRING | MultiLineString | NUMBER | BooleanLiteral | NullLiteral | ATOM | TypeTag
