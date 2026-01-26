---
editUrl: false
next: false
prev: false
title: "AppendOperation"
---

Defined in: [ast.ts:327](https://github.com/rcs-agents/rcs-lang/blob/89258eb41dbc7637c8bdc8bfc04b38ebfa30409c/packages/ast/src/ast.ts#L327)

An append operation.

## Spec

APPEND RESULT TO Variable

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/89258eb41dbc7637c8bdc8bfc04b38ebfa30409c/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### target

> **target**: [`Variable`](/api/ast/interfaces/variable/) \| [`PropertyAccess`](/api/ast/interfaces/propertyaccess/)

Defined in: [ast.ts:329](https://github.com/rcs-agents/rcs-lang/blob/89258eb41dbc7637c8bdc8bfc04b38ebfa30409c/packages/ast/src/ast.ts#L329)

***

### type

> **type**: `"AppendOperation"`

Defined in: [ast.ts:328](https://github.com/rcs-agents/rcs-lang/blob/89258eb41dbc7637c8bdc8bfc04b38ebfa30409c/packages/ast/src/ast.ts#L328)
