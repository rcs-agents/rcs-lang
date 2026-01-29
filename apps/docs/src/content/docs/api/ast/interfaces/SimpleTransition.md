---
editUrl: false
next: false
prev: false
title: "SimpleTransition"
---

Defined in: [ast.ts:382](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/ast.ts#L382)

A simple transition (arrow without match).

## Spec

SimpleTransition ::= ARROW TransitionTarget

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### target

> **target**: [`FlowInvocation`](/api/ast/interfaces/flowinvocation/) \| [`ContextualizedValue`](/api/ast/interfaces/contextualizedvalue/) \| [`FlowTermination`](/api/ast/interfaces/flowtermination/) \| [`ContextOperationSequence`](/api/ast/interfaces/contextoperationsequence/)

Defined in: [ast.ts:384](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/ast.ts#L384)

***

### type

> **type**: `"SimpleTransition"`

Defined in: [ast.ts:383](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/ast.ts#L383)
