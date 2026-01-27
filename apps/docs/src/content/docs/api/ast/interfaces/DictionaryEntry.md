---
editUrl: false
next: false
prev: false
title: "DictionaryEntry"
---

Defined in: [ast.ts:238](https://github.com/rcs-agents/rcs-lang/blob/26d5daa2d4dc12570291746a8620ffb47db53cd7/packages/ast/src/ast.ts#L238)

An entry in a dictionary.

## Spec

DictEntry ::= (ATTRIBUTE_KEY | STRING) ':' Value

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### key

> **key**: `string` \| [`StringLiteral`](/api/ast/interfaces/stringliteral/)

Defined in: [ast.ts:240](https://github.com/rcs-agents/rcs-lang/blob/26d5daa2d4dc12570291746a8620ffb47db53cd7/packages/ast/src/ast.ts#L240)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/26d5daa2d4dc12570291746a8620ffb47db53cd7/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"DictionaryEntry"`

Defined in: [ast.ts:239](https://github.com/rcs-agents/rcs-lang/blob/26d5daa2d4dc12570291746a8620ffb47db53cd7/packages/ast/src/ast.ts#L239)

***

### value

> **value**: [`Value`](/api/ast/type-aliases/value/)

Defined in: [ast.ts:241](https://github.com/rcs-agents/rcs-lang/blob/26d5daa2d4dc12570291746a8620ffb47db53cd7/packages/ast/src/ast.ts#L241)
