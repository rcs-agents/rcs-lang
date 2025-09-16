---
editUrl: false
next: false
prev: false
title: "MultiLineString"
---

Defined in: [ast.ts:163](https://github.com/rcs-agents/rcs-lang/blob/e34fcec4548d8ec3299746a4224e94ecf4afd448/packages/ast/src/ast.ts#L163)

A multi-line string with chomping controls or in triple-quoted mode.

## Spec

MultiLineString ::= (PIPE_STYLE) | (TRIPLE_QUOTE_STYLE)

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/e34fcec4548d8ec3299746a4224e94ecf4afd448/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### mode

> **mode**: `"clean"` \| `"trim"` \| `"preserve"` \| `"preserve_all"` \| `"quoted"`

Defined in: [ast.ts:165](https://github.com/rcs-agents/rcs-lang/blob/e34fcec4548d8ec3299746a4224e94ecf4afd448/packages/ast/src/ast.ts#L165)

***

### type

> **type**: `"MultiLineString"`

Defined in: [ast.ts:164](https://github.com/rcs-agents/rcs-lang/blob/e34fcec4548d8ec3299746a4224e94ecf4afd448/packages/ast/src/ast.ts#L164)

***

### value

> **value**: `string`

Defined in: [ast.ts:166](https://github.com/rcs-agents/rcs-lang/blob/e34fcec4548d8ec3299746a4224e94ecf4afd448/packages/ast/src/ast.ts#L166)
