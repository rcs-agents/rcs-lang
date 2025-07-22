---
editUrl: false
next: false
prev: false
title: "SingleLineCode"
---

Defined in: [ast.ts:268](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L268)

A single-line embedded code expression.

## Spec

SingleLineCode ::= EMBEDDED_CODE

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### code

> **code**: `string`

Defined in: [ast.ts:271](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L271)

***

### language?

> `optional` **language**: `"js"` \| `"ts"`

Defined in: [ast.ts:270](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L270)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"SingleLineCode"`

Defined in: [ast.ts:269](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L269)
