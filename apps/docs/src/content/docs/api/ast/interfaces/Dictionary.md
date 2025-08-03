---
editUrl: false
next: false
prev: false
title: "Dictionary"
---

Defined in: [ast.ts:229](https://github.com/rcs-agents/rcs-lang/blob/2886a07e868cf92f1e606ce6c904ff7e06f6aeb1/packages/ast/src/ast.ts#L229)

A dictionary of key-value pairs.

## Spec

Dictionary ::= BraceDictionary | BlockDictionary

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### entries

> **entries**: [`DictionaryEntry`](/api/ast/interfaces/dictionaryentry/)[]

Defined in: [ast.ts:231](https://github.com/rcs-agents/rcs-lang/blob/2886a07e868cf92f1e606ce6c904ff7e06f6aeb1/packages/ast/src/ast.ts#L231)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/2886a07e868cf92f1e606ce6c904ff7e06f6aeb1/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### type

> **type**: `"Dictionary"`

Defined in: [ast.ts:230](https://github.com/rcs-agents/rcs-lang/blob/2886a07e868cf92f1e606ce6c904ff7e06f6aeb1/packages/ast/src/ast.ts#L230)
