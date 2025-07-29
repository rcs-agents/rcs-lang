---
editUrl: false
next: false
prev: false
title: "ImportStatement"
---

Defined in: [ast.ts:29](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L29)

An import statement.

## Spec

ImportStatement ::= 'import' ImportPath ('as' IDENTIFIER)?

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### alias?

> `optional` **alias**: [`Identifier`](/api/ast/interfaces/identifier/)

Defined in: [ast.ts:33](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L33)

***

### importPath

> **importPath**: `string`[]

Defined in: [ast.ts:32](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L32)

#### Spec

ImportPath ::= IDENTIFIER ('/' IDENTIFIER)*

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"ImportStatement"`

Defined in: [ast.ts:30](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L30)
