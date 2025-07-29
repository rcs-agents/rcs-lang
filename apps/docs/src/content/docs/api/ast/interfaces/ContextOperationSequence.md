---
editUrl: false
next: false
prev: false
title: "ContextOperationSequence"
---

Defined in: [ast.ts:369](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L369)

A sequence of context operations followed by a target reference.

## Spec

ContextOperationSequence ::= ContextOperation (ARROW ContextOperation)* ARROW TargetReference

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### operations

> **operations**: [`ContextOperation`](/api/ast/type-aliases/contextoperation/)[]

Defined in: [ast.ts:371](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L371)

***

### target

> **target**: [`TargetReference`](/api/ast/type-aliases/targetreference/)

Defined in: [ast.ts:372](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L372)

***

### type

> **type**: `"ContextOperationSequence"`

Defined in: [ast.ts:370](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L370)
