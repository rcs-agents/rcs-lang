---
editUrl: false
next: false
prev: false
title: "MultiLineCode"
---

Defined in: [ast.ts:279](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L279)

A multi-line embedded code block.

## Spec

MultiLineCode ::= MULTI_LINE_CODE_START INDENT CodeContent DEDENT MULTI_LINE_CODE_END

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### code

> **code**: `string`

Defined in: [ast.ts:282](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L282)

***

### language?

> `optional` **language**: `"js"` \| `"ts"`

Defined in: [ast.ts:281](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L281)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"MultiLineCode"`

Defined in: [ast.ts:280](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L280)
