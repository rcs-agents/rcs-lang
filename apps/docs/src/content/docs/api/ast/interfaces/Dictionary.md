---
editUrl: false
next: false
prev: false
title: "Dictionary"
---

Defined in: [ast.ts:228](https://github.com/rcs-agents/rcs-lang/blob/dae76e6aa05b4d372009b015248dbcb36c5ae675/packages/ast/src/ast.ts#L228)

A dictionary of key-value pairs.

## Spec

Dictionary ::= BraceDictionary | BlockDictionary

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### entries

> **entries**: [`DictionaryEntry`](/api/ast/interfaces/dictionaryentry/)[]

Defined in: [ast.ts:230](https://github.com/rcs-agents/rcs-lang/blob/dae76e6aa05b4d372009b015248dbcb36c5ae675/packages/ast/src/ast.ts#L230)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/dae76e6aa05b4d372009b015248dbcb36c5ae675/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"Dictionary"`

Defined in: [ast.ts:229](https://github.com/rcs-agents/rcs-lang/blob/dae76e6aa05b4d372009b015248dbcb36c5ae675/packages/ast/src/ast.ts#L229)
