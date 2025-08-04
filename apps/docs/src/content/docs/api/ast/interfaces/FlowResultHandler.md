---
editUrl: false
next: false
prev: false
title: "FlowResultHandler"
---

Defined in: [ast.ts:304](https://github.com/rcs-agents/rcs-lang/blob/2c0291a4209143052b64b2c6ec7573ef29bacea2/packages/ast/src/ast.ts#L304)

A handler for flow results.

## Spec

FlowResultHandler ::= ON FlowResult ARROW ContextOperationChain? TargetReference

## Extends

- [`WithLocation`](/api/ast/interfaces/withlocation/)

## Properties

### location?

> `optional` **location**: [`SourceLocation`](/api/ast/interfaces/sourcelocation/)

Defined in: [position.ts:33](https://github.com/rcs-agents/rcs-lang/blob/2c0291a4209143052b64b2c6ec7573ef29bacea2/packages/ast/src/position.ts#L33)

#### Inherited from

[`WithLocation`](/api/ast/interfaces/withlocation/).[`location`](/api/ast/interfaces/withlocation/#location)

***

### operations?

> `optional` **operations**: [`ContextOperation`](/api/ast/type-aliases/contextoperation/)[]

Defined in: [ast.ts:307](https://github.com/rcs-agents/rcs-lang/blob/2c0291a4209143052b64b2c6ec7573ef29bacea2/packages/ast/src/ast.ts#L307)

***

### result

> **result**: [`FlowResult`](/api/ast/type-aliases/flowresult/)

Defined in: [ast.ts:306](https://github.com/rcs-agents/rcs-lang/blob/2c0291a4209143052b64b2c6ec7573ef29bacea2/packages/ast/src/ast.ts#L306)

***

### target

> **target**: [`TargetReference`](/api/ast/type-aliases/targetreference/)

Defined in: [ast.ts:308](https://github.com/rcs-agents/rcs-lang/blob/2c0291a4209143052b64b2c6ec7573ef29bacea2/packages/ast/src/ast.ts#L308)

***

### type

> **type**: `"FlowResultHandler"`

Defined in: [ast.ts:305](https://github.com/rcs-agents/rcs-lang/blob/2c0291a4209143052b64b2c6ec7573ef29bacea2/packages/ast/src/ast.ts#L305)
