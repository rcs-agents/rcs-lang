---
editUrl: false
next: false
prev: false
title: "Attribute"
---

Defined in: [ast.ts:56](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L56)

An attribute, which is a key-value pair within a section.

## Spec

Attribute ::= ATTRIBUTE_KEY ':' Value

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### key

> **key**: `string`

Defined in: [ast.ts:58](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L58)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"Attribute"`

Defined in: [ast.ts:57](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L57)

***

### value

> **value**: [`Value`](/api/ast/type-aliases/value/)

Defined in: [ast.ts:59](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L59)
