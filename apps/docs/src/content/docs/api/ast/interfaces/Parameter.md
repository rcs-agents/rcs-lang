---
editUrl: false
next: false
prev: false
title: "Parameter"
---

Defined in: [ast.ts:143](https://github.com/rcs-agents/rcs-lang/blob/469fcdfdc8e17c47e6157264f59d88421628e7a2/packages/ast/src/ast.ts#L143)

A single parameter, which can be positional or named.

## Spec

Parameter ::= ATTRIBUTE_KEY ':' Value | Value

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### key?

> `optional` **key**: `string`

Defined in: [ast.ts:145](https://github.com/rcs-agents/rcs-lang/blob/469fcdfdc8e17c47e6157264f59d88421628e7a2/packages/ast/src/ast.ts#L145)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/469fcdfdc8e17c47e6157264f59d88421628e7a2/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"Parameter"`

Defined in: [ast.ts:144](https://github.com/rcs-agents/rcs-lang/blob/469fcdfdc8e17c47e6157264f59d88421628e7a2/packages/ast/src/ast.ts#L144)

***

### value

> **value**: [`Value`](/api/ast/type-aliases/value/)

Defined in: [ast.ts:146](https://github.com/rcs-agents/rcs-lang/blob/469fcdfdc8e17c47e6157264f59d88421628e7a2/packages/ast/src/ast.ts#L146)
