---
editUrl: false
next: false
prev: false
title: "StateReference"
---

Defined in: [ast.ts:388](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L388)

A state reference (for unconditional transitions).

## Spec

StateReference ::= (IDENTIFIER | Variable | PropertyAccess)

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

> **target**: [`Identifier`](/api/ast/interfaces/identifier/) \| [`Variable`](/api/ast/interfaces/variable/) \| [`PropertyAccess`](/api/ast/interfaces/propertyaccess/)

Defined in: [ast.ts:390](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L390)

***

### type

> **type**: `"StateReference"`

Defined in: [ast.ts:389](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L389)
