---
editUrl: false
next: false
prev: false
title: "RclFile"
---

Defined in: [ast.ts:19](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L19)

The root node of an RCL file.

## Spec

RclFile ::= (ImportStatement)* (Section)*

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### imports

> **imports**: [`ImportStatement`](/api/ast/interfaces/importstatement/)[]

Defined in: [ast.ts:21](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L21)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### sections

> **sections**: [`Section`](/api/ast/interfaces/section/)[]

Defined in: [ast.ts:22](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L22)

***

### type

> **type**: `"RclFile"`

Defined in: [ast.ts:20](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L20)
