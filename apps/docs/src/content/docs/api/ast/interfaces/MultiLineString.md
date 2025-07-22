---
editUrl: false
next: false
prev: false
title: "MultiLineString"
---

Defined in: [ast.ts:162](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L162)

A multi-line string with chomping controls or in triple-quoted mode.

## Spec

MultiLineString ::= (PIPE_STYLE) | (TRIPLE_QUOTE_STYLE)

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### mode

> **mode**: `"clean"` \| `"trim"` \| `"preserve"` \| `"preserve_all"` \| `"quoted"`

Defined in: [ast.ts:164](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L164)

***

### type

> **type**: `"MultiLineString"`

Defined in: [ast.ts:163](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L163)

***

### value

> **value**: `string`

Defined in: [ast.ts:165](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L165)
