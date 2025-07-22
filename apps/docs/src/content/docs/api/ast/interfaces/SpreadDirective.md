---
editUrl: false
next: false
prev: false
title: "SpreadDirective"
---

Defined in: [ast.ts:66](https://github.com/rcs-agents/rcs-lang/blob/dae76e6aa05b4d372009b015248dbcb36c5ae675/packages/ast/src/ast.ts#L66)

A spread directive to include attributes from another section.

## Spec

SpreadDirective ::= SPREAD IDENTIFIER

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/dae76e6aa05b4d372009b015248dbcb36c5ae675/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### reference

> **reference**: [`Identifier`](/api/ast/interfaces/identifier/)

Defined in: [ast.ts:68](https://github.com/rcs-agents/rcs-lang/blob/dae76e6aa05b4d372009b015248dbcb36c5ae675/packages/ast/src/ast.ts#L68)

***

### type

> **type**: `"SpreadDirective"`

Defined in: [ast.ts:67](https://github.com/rcs-agents/rcs-lang/blob/dae76e6aa05b4d372009b015248dbcb36c5ae675/packages/ast/src/ast.ts#L67)
