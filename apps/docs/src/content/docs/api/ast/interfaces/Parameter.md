---
editUrl: false
next: false
prev: false
title: "Parameter"
---

Defined in: [ast.ts:142](https://github.com/rcs-agents/rcs-lang/blob/d67a89cedb553bfd3c4dced3f75360ae0dfac4db/packages/ast/src/ast.ts#L142)

A single parameter, which can be positional or named.

## Spec

Parameter ::= ATTRIBUTE_KEY ':' Value | Value

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### key?

> `optional` **key**: `string`

Defined in: [ast.ts:144](https://github.com/rcs-agents/rcs-lang/blob/d67a89cedb553bfd3c4dced3f75360ae0dfac4db/packages/ast/src/ast.ts#L144)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/d67a89cedb553bfd3c4dced3f75360ae0dfac4db/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"Parameter"`

Defined in: [ast.ts:143](https://github.com/rcs-agents/rcs-lang/blob/d67a89cedb553bfd3c4dced3f75360ae0dfac4db/packages/ast/src/ast.ts#L143)

***

### value

> **value**: [`Value`](/api/ast/type-aliases/value/)

Defined in: [ast.ts:145](https://github.com/rcs-agents/rcs-lang/blob/d67a89cedb553bfd3c4dced3f75360ae0dfac4db/packages/ast/src/ast.ts#L145)
