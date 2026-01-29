---
editUrl: false
next: false
prev: false
title: "MatchBlock"
---

Defined in: [ast.ts:75](https://github.com/rcs-agents/rcs-lang/blob/6bc0648217bff31ab32f404732496b47353bf026/packages/ast/src/ast.ts#L75)

A match block for conditional value selection.

## Spec

MatchBlock ::= 'match' Value INDENT (MatchCase)+ DEDENT

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### cases

> **cases**: [`MatchCase`](/api/ast/interfaces/matchcase/)[]

Defined in: [ast.ts:78](https://github.com/rcs-agents/rcs-lang/blob/6bc0648217bff31ab32f404732496b47353bf026/packages/ast/src/ast.ts#L78)

***

### discriminant

> **discriminant**: [`Value`](/api/ast/type-aliases/value/)

Defined in: [ast.ts:77](https://github.com/rcs-agents/rcs-lang/blob/6bc0648217bff31ab32f404732496b47353bf026/packages/ast/src/ast.ts#L77)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/6bc0648217bff31ab32f404732496b47353bf026/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"MatchBlock"`

Defined in: [ast.ts:76](https://github.com/rcs-agents/rcs-lang/blob/6bc0648217bff31ab32f404732496b47353bf026/packages/ast/src/ast.ts#L76)
