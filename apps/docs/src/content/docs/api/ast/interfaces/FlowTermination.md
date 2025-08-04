---
editUrl: false
next: false
prev: false
title: "FlowTermination"
---

Defined in: [ast.ts:363](https://github.com/rcs-agents/rcs-lang/blob/68cb652ba691370490e2f22c44219c82067584e3/packages/ast/src/ast.ts#L363)

A flow termination.

## Spec

FlowTermination ::= ':end' | ':cancel' | ':error'

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/68cb652ba691370490e2f22c44219c82067584e3/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### result

> **result**: [`FlowResult`](/api/ast/type-aliases/flowresult/)

Defined in: [ast.ts:365](https://github.com/rcs-agents/rcs-lang/blob/68cb652ba691370490e2f22c44219c82067584e3/packages/ast/src/ast.ts#L365)

***

### type

> **type**: `"FlowTermination"`

Defined in: [ast.ts:364](https://github.com/rcs-agents/rcs-lang/blob/68cb652ba691370490e2f22c44219c82067584e3/packages/ast/src/ast.ts#L364)
