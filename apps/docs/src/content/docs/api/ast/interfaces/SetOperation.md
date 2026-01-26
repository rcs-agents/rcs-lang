---
editUrl: false
next: false
prev: false
title: "SetOperation"
---

Defined in: [ast.ts:337](https://github.com/rcs-agents/rcs-lang/blob/d27a86a06f607707e27756903556e47acb5d9058/packages/ast/src/ast.ts#L337)

A set operation.

## Spec

SET Variable TO (RESULT | Value)

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/d27a86a06f607707e27756903556e47acb5d9058/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### source

> **source**: [`Value`](/api/ast/type-aliases/value/) \| `"result"`

Defined in: [ast.ts:339](https://github.com/rcs-agents/rcs-lang/blob/d27a86a06f607707e27756903556e47acb5d9058/packages/ast/src/ast.ts#L339)

***

### target

> **target**: [`Variable`](/api/ast/interfaces/variable/) \| [`PropertyAccess`](/api/ast/interfaces/propertyaccess/)

Defined in: [ast.ts:340](https://github.com/rcs-agents/rcs-lang/blob/d27a86a06f607707e27756903556e47acb5d9058/packages/ast/src/ast.ts#L340)

***

### type

> **type**: `"SetOperation"`

Defined in: [ast.ts:338](https://github.com/rcs-agents/rcs-lang/blob/d27a86a06f607707e27756903556e47acb5d9058/packages/ast/src/ast.ts#L338)
