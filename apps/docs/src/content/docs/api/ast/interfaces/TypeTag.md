---
editUrl: false
next: false
prev: false
title: "TypeTag"
---

Defined in: [ast.ts:252](https://github.com/rcs-agents/rcs-lang/blob/6bc0648217bff31ab32f404732496b47353bf026/packages/ast/src/ast.ts#L252)

A type tag for semantic data types.

## Spec

TypeTag ::= '<' TYPE_TAG_NAME (STRING | NUMBER | IDENTIFIER | ISO_DURATION) ('|' STRING)? '>'

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/6bc0648217bff31ab32f404732496b47353bf026/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### qualifier?

> `optional` **qualifier**: `string`

Defined in: [ast.ts:256](https://github.com/rcs-agents/rcs-lang/blob/6bc0648217bff31ab32f404732496b47353bf026/packages/ast/src/ast.ts#L256)

***

### tagName

> **tagName**: `string`

Defined in: [ast.ts:254](https://github.com/rcs-agents/rcs-lang/blob/6bc0648217bff31ab32f404732496b47353bf026/packages/ast/src/ast.ts#L254)

***

### type

> **type**: `"TypeTag"`

Defined in: [ast.ts:253](https://github.com/rcs-agents/rcs-lang/blob/6bc0648217bff31ab32f404732496b47353bf026/packages/ast/src/ast.ts#L253)

***

### value

> **value**: `string` \| `number`

Defined in: [ast.ts:255](https://github.com/rcs-agents/rcs-lang/blob/6bc0648217bff31ab32f404732496b47353bf026/packages/ast/src/ast.ts#L255)
