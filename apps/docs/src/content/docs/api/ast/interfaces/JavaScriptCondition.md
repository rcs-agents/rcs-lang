---
editUrl: false
next: false
prev: false
title: "JavaScriptCondition"
---

Defined in: [ast.ts:406](https://github.com/rcs-agents/rcs-lang/blob/81d17140acf0fdf5d22c6fbab7c85de9a28f20ae/packages/ast/src/ast.ts#L406)

A JavaScript-based condition expression.

## Spec

JavaScriptCondition ::= EmbeddedCode

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### expression

> **expression**: [`EmbeddedCode`](/api/ast/type-aliases/embeddedcode/)

Defined in: [ast.ts:408](https://github.com/rcs-agents/rcs-lang/blob/81d17140acf0fdf5d22c6fbab7c85de9a28f20ae/packages/ast/src/ast.ts#L408)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/81d17140acf0fdf5d22c6fbab7c85de9a28f20ae/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"JavaScriptCondition"`

Defined in: [ast.ts:407](https://github.com/rcs-agents/rcs-lang/blob/81d17140acf0fdf5d22c6fbab7c85de9a28f20ae/packages/ast/src/ast.ts#L407)
