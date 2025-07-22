---
editUrl: false
next: false
prev: false
title: "Section"
---

Defined in: [ast.ts:44](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L44)

A generic section, which is the primary building block of an RCL file.

## Spec

Section ::= SECTION_TYPE IDENTIFIER? ParameterList? (INDENT (SpreadDirective | Attribute | Section | MatchBlock | Value)* DEDENT)?

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### body

> **body**: (`Section` \| [`SpreadDirective`](/api/ast/interfaces/spreaddirective/) \| [`Attribute`](/api/ast/interfaces/attribute/) \| [`MatchBlock`](/api/ast/interfaces/matchblock/) \| [`Value`](/api/ast/type-aliases/value/))[]

Defined in: [ast.ts:49](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L49)

***

### identifier?

> `optional` **identifier**: [`Identifier`](/api/ast/interfaces/identifier/)

Defined in: [ast.ts:47](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L47)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### parameters?

> `optional` **parameters**: [`ParameterList`](/api/ast/type-aliases/parameterlist/)

Defined in: [ast.ts:48](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L48)

***

### sectionType

> **sectionType**: `string`

Defined in: [ast.ts:46](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L46)

***

### type

> **type**: `"Section"`

Defined in: [ast.ts:45](https://github.com/rcs-agents/rcs-lang/blob/3e6d0013c4b9c0c5d7cd39eb149fd10244b5ea0b/packages/ast/src/ast.ts#L45)
