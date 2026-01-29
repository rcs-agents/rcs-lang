---
editUrl: false
next: false
prev: false
title: "MatchCase"
---

Defined in: [ast.ts:85](https://github.com/rcs-agents/rcs-lang/blob/e2c1fcc864c8a99ca00326a01512ebf19034c1e0/packages/ast/src/ast.ts#L85)

A case within a match block.

## Spec

MatchCase ::= (STRING | NUMBER | ATOM | DEFAULT_CASE) ARROW TransitionTarget

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### consequence

> **consequence**: [`FlowInvocation`](/api/ast/interfaces/flowinvocation/) \| [`ContextualizedValue`](/api/ast/interfaces/contextualizedvalue/) \| [`FlowTermination`](/api/ast/interfaces/flowtermination/) \| [`ContextOperationSequence`](/api/ast/interfaces/contextoperationsequence/)

Defined in: [ast.ts:88](https://github.com/rcs-agents/rcs-lang/blob/e2c1fcc864c8a99ca00326a01512ebf19034c1e0/packages/ast/src/ast.ts#L88)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/e2c1fcc864c8a99ca00326a01512ebf19034c1e0/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"MatchCase"`

Defined in: [ast.ts:86](https://github.com/rcs-agents/rcs-lang/blob/e2c1fcc864c8a99ca00326a01512ebf19034c1e0/packages/ast/src/ast.ts#L86)

***

### value

> **value**: [`StringLiteral`](/api/ast/interfaces/stringliteral/) \| [`NumericLiteral`](/api/ast/interfaces/numericliteral/) \| [`Atom`](/api/ast/interfaces/atom/) \| `"default"`

Defined in: [ast.ts:87](https://github.com/rcs-agents/rcs-lang/blob/e2c1fcc864c8a99ca00326a01512ebf19034c1e0/packages/ast/src/ast.ts#L87)
