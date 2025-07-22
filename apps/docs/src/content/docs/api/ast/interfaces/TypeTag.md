---
editUrl: false
next: false
prev: false
title: "TypeTag"
---

Defined in: [ast.ts:251](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L251)

A type tag for semantic data types.

## Spec

TypeTag ::= '<' TYPE_TAG_NAME (STRING | NUMBER | IDENTIFIER | ISO_DURATION) ('|' STRING)? '>'

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### qualifier?

> `optional` **qualifier**: `string`

Defined in: [ast.ts:255](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L255)

***

### tagName

> **tagName**: `string`

Defined in: [ast.ts:253](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L253)

***

### type

> **type**: `"TypeTag"`

Defined in: [ast.ts:252](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L252)

***

### value

> **value**: `string` \| `number`

Defined in: [ast.ts:254](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L254)
