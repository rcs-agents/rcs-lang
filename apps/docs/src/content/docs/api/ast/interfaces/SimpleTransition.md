---
editUrl: false
next: false
prev: false
title: "SimpleTransition"
---

Defined in: [ast.ts:379](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L379)

A simple transition (arrow without match).

## Spec

SimpleTransition ::= ARROW TransitionTarget

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### target

> **target**: [`FlowInvocation`](/api/ast/interfaces/flowinvocation/) \| [`ContextualizedValue`](/api/ast/interfaces/contextualizedvalue/) \| [`FlowTermination`](/api/ast/interfaces/flowtermination/) \| [`ContextOperationSequence`](/api/ast/interfaces/contextoperationsequence/)

Defined in: [ast.ts:381](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L381)

***

### type

> **type**: `"SimpleTransition"`

Defined in: [ast.ts:380](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L380)
