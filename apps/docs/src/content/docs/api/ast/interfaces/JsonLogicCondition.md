---
editUrl: false
next: false
prev: false
title: "JsonLogicCondition"
---

Defined in: [ast.ts:415](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/ast.ts#L415)

A JSON Logic-based condition rule.

## Spec

JsonLogicCondition ::= JsonLogicRule

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### rule

> **rule**: [`Dictionary`](/api/ast/interfaces/dictionary/)

Defined in: [ast.ts:417](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/ast.ts#L417)

***

### type

> **type**: `"JsonLogicCondition"`

Defined in: [ast.ts:416](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/ast.ts#L416)
