---
editUrl: false
next: false
prev: false
title: "JavaScriptCondition"
---

Defined in: [ast.ts:403](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L403)

A JavaScript-based condition expression.

## Spec

JavaScriptCondition ::= EmbeddedCode

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### expression

> **expression**: [`EmbeddedCode`](/api/ast/type-aliases/embeddedcode/)

Defined in: [ast.ts:405](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L405)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"JavaScriptCondition"`

Defined in: [ast.ts:404](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L404)
