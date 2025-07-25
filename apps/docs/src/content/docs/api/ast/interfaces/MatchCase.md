---
editUrl: false
next: false
prev: false
title: "MatchCase"
---

Defined in: [ast.ts:85](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L85)

A case within a match block.

## Spec

MatchCase ::= (STRING | NUMBER | ATOM) '->' ContextualizedValue | ':default' '->' ContextualizedValue

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### consequence

> **consequence**: [`ContextualizedValue`](/api/ast/interfaces/contextualizedvalue/)

Defined in: [ast.ts:88](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L88)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"MatchCase"`

Defined in: [ast.ts:86](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L86)

***

### value

> **value**: [`StringLiteral`](/api/ast/interfaces/stringliteral/) \| [`NumericLiteral`](/api/ast/interfaces/numericliteral/) \| [`Atom`](/api/ast/interfaces/atom/) \| `"default"`

Defined in: [ast.ts:87](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L87)
