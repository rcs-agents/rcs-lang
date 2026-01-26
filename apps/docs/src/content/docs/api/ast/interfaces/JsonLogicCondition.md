---
editUrl: false
next: false
prev: false
title: "JsonLogicCondition"
---

Defined in: [ast.ts:412](https://github.com/rcs-agents/rcs-lang/blob/89258eb41dbc7637c8bdc8bfc04b38ebfa30409c/packages/ast/src/ast.ts#L412)

A JSON Logic-based condition rule.

## Spec

JsonLogicCondition ::= JsonLogicRule

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/89258eb41dbc7637c8bdc8bfc04b38ebfa30409c/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### rule

> **rule**: [`Dictionary`](/api/ast/interfaces/dictionary/)

Defined in: [ast.ts:414](https://github.com/rcs-agents/rcs-lang/blob/89258eb41dbc7637c8bdc8bfc04b38ebfa30409c/packages/ast/src/ast.ts#L414)

***

### type

> **type**: `"JsonLogicCondition"`

Defined in: [ast.ts:413](https://github.com/rcs-agents/rcs-lang/blob/89258eb41dbc7637c8bdc8bfc04b38ebfa30409c/packages/ast/src/ast.ts#L413)
