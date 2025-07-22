---
editUrl: false
next: false
prev: false
title: "ContextualizedValue"
---

Defined in: [ast.ts:126](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L126)

A value that can be contextualized with parameters.

## Spec

ContextualizedValue ::= Value ('with' ParameterList)?

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### context?

> `optional` **context**: [`ParameterList`](/api/ast/type-aliases/parameterlist/)

Defined in: [ast.ts:129](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L129)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"ContextualizedValue"`

Defined in: [ast.ts:127](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L127)

***

### value

> **value**: [`Value`](/api/ast/type-aliases/value/)

Defined in: [ast.ts:128](https://github.com/rcs-agents/rcs-lang/blob/44f56387ee45f73805b6a88a5582e17ead444456/packages/ast/src/ast.ts#L128)
