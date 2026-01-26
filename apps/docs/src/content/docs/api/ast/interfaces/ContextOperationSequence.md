---
editUrl: false
next: false
prev: false
title: "ContextOperationSequence"
---

Defined in: [ast.ts:372](https://github.com/rcs-agents/rcs-lang/blob/d27a86a06f607707e27756903556e47acb5d9058/packages/ast/src/ast.ts#L372)

A sequence of context operations followed by a target reference.

## Spec

ContextOperationSequence ::= ContextOperation (ARROW ContextOperation)* ARROW TargetReference

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/d27a86a06f607707e27756903556e47acb5d9058/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### operations

> **operations**: [`ContextOperation`](/api/ast/type-aliases/contextoperation/)[]

Defined in: [ast.ts:374](https://github.com/rcs-agents/rcs-lang/blob/d27a86a06f607707e27756903556e47acb5d9058/packages/ast/src/ast.ts#L374)

***

### target

> **target**: [`TargetReference`](/api/ast/type-aliases/targetreference/)

Defined in: [ast.ts:375](https://github.com/rcs-agents/rcs-lang/blob/d27a86a06f607707e27756903556e47acb5d9058/packages/ast/src/ast.ts#L375)

***

### type

> **type**: `"ContextOperationSequence"`

Defined in: [ast.ts:373](https://github.com/rcs-agents/rcs-lang/blob/d27a86a06f607707e27756903556e47acb5d9058/packages/ast/src/ast.ts#L373)
