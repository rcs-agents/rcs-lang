---
editUrl: false
next: false
prev: false
title: "StateReference"
---

Defined in: [ast.ts:391](https://github.com/rcs-agents/rcs-lang/blob/81d17140acf0fdf5d22c6fbab7c85de9a28f20ae/packages/ast/src/ast.ts#L391)

A state reference (for unconditional transitions).

## Spec

StateReference ::= (IDENTIFIER | Variable | PropertyAccess)

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/81d17140acf0fdf5d22c6fbab7c85de9a28f20ae/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### target

> **target**: [`Identifier`](/api/ast/interfaces/identifier/) \| [`Variable`](/api/ast/interfaces/variable/) \| [`PropertyAccess`](/api/ast/interfaces/propertyaccess/)

Defined in: [ast.ts:393](https://github.com/rcs-agents/rcs-lang/blob/81d17140acf0fdf5d22c6fbab7c85de9a28f20ae/packages/ast/src/ast.ts#L393)

***

### type

> **type**: `"StateReference"`

Defined in: [ast.ts:392](https://github.com/rcs-agents/rcs-lang/blob/81d17140acf0fdf5d22c6fbab7c85de9a28f20ae/packages/ast/src/ast.ts#L392)
