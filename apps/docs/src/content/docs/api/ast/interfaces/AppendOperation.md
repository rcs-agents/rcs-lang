---
editUrl: false
next: false
prev: false
title: "AppendOperation"
---

Defined in: [ast.ts:327](https://github.com/rcs-agents/rcs-lang/blob/2886a07e868cf92f1e606ce6c904ff7e06f6aeb1/packages/ast/src/ast.ts#L327)

An append operation.

## Spec

APPEND (RESULT | Value) TO Variable

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/2886a07e868cf92f1e606ce6c904ff7e06f6aeb1/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### source

> **source**: [`Value`](/api/ast/type-aliases/value/) \| `"result"`

Defined in: [ast.ts:329](https://github.com/rcs-agents/rcs-lang/blob/2886a07e868cf92f1e606ce6c904ff7e06f6aeb1/packages/ast/src/ast.ts#L329)

***

### target

> **target**: [`Variable`](/api/ast/interfaces/variable/) \| [`PropertyAccess`](/api/ast/interfaces/propertyaccess/)

Defined in: [ast.ts:330](https://github.com/rcs-agents/rcs-lang/blob/2886a07e868cf92f1e606ce6c904ff7e06f6aeb1/packages/ast/src/ast.ts#L330)

***

### type

> **type**: `"AppendOperation"`

Defined in: [ast.ts:328](https://github.com/rcs-agents/rcs-lang/blob/2886a07e868cf92f1e606ce6c904ff7e06f6aeb1/packages/ast/src/ast.ts#L328)
