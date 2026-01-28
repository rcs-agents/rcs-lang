---
editUrl: false
next: false
prev: false
title: "FlowInvocation"
---

Defined in: [ast.ts:293](https://github.com/rcs-agents/rcs-lang/blob/5fc8b9e6ee5bcb678869a4882d36480687a9db1c/packages/ast/src/ast.ts#L293)

A flow invocation with result handling.

## Spec

FlowInvocation ::= START IDENTIFIER (WITH ParameterList)? (INDENT FlowResultHandler+ DEDENT)?

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### flowName

> **flowName**: [`Identifier`](/api/ast/interfaces/identifier/)

Defined in: [ast.ts:295](https://github.com/rcs-agents/rcs-lang/blob/5fc8b9e6ee5bcb678869a4882d36480687a9db1c/packages/ast/src/ast.ts#L295)

***

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/5fc8b9e6ee5bcb678869a4882d36480687a9db1c/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### parameters?

> `optional` **parameters**: [`ParameterList`](/api/ast/type-aliases/parameterlist/)

Defined in: [ast.ts:296](https://github.com/rcs-agents/rcs-lang/blob/5fc8b9e6ee5bcb678869a4882d36480687a9db1c/packages/ast/src/ast.ts#L296)

***

### resultHandlers

> **resultHandlers**: [`FlowResultHandler`](/api/ast/interfaces/flowresulthandler/)[]

Defined in: [ast.ts:297](https://github.com/rcs-agents/rcs-lang/blob/5fc8b9e6ee5bcb678869a4882d36480687a9db1c/packages/ast/src/ast.ts#L297)

***

### type

> **type**: `"FlowInvocation"`

Defined in: [ast.ts:294](https://github.com/rcs-agents/rcs-lang/blob/5fc8b9e6ee5bcb678869a4882d36480687a9db1c/packages/ast/src/ast.ts#L294)
