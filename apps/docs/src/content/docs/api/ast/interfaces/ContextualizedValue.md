---
editUrl: false
next: false
prev: false
title: "ContextualizedValue"
---

Defined in: [ast.ts:127](https://github.com/rcs-agents/rcs-lang/blob/87d9b510946a70cf66b4d271e76c67f8499b8d1d/packages/ast/src/ast.ts#L127)

A value that can be contextualized with parameters.

## Spec

ContextualizedValue ::= Value ('with' ParameterList)?

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### context?

> `optional` **context**: [`ParameterList`](/api/ast/type-aliases/parameterlist/)

Defined in: [ast.ts:130](https://github.com/rcs-agents/rcs-lang/blob/87d9b510946a70cf66b4d271e76c67f8499b8d1d/packages/ast/src/ast.ts#L130)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/87d9b510946a70cf66b4d271e76c67f8499b8d1d/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"ContextualizedValue"`

Defined in: [ast.ts:128](https://github.com/rcs-agents/rcs-lang/blob/87d9b510946a70cf66b4d271e76c67f8499b8d1d/packages/ast/src/ast.ts#L128)

***

### value

> **value**: [`Value`](/api/ast/type-aliases/value/)

Defined in: [ast.ts:129](https://github.com/rcs-agents/rcs-lang/blob/87d9b510946a70cf66b4d271e76c67f8499b8d1d/packages/ast/src/ast.ts#L129)
