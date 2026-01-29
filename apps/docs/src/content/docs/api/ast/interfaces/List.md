---
editUrl: false
next: false
prev: false
title: "List"
---

Defined in: [ast.ts:220](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/ast.ts#L220)

A list of values.

## Spec

List ::= ParenthesesList | InlineList | BlockList

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### items

> **items**: [`Value`](/api/ast/type-aliases/value/)[]

Defined in: [ast.ts:222](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/ast.ts#L222)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"List"`

Defined in: [ast.ts:221](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/ast.ts#L221)
