---
editUrl: false
next: false
prev: false
title: "TargetReference"
---

> **TargetReference** = [`Identifier`](/api/ast/interfaces/identifier/) \| [`Variable`](/api/ast/interfaces/variable/) \| [`PropertyAccess`](/api/ast/interfaces/propertyaccess/) \| [`FlowTermination`](/api/ast/interfaces/flowtermination/)

Defined in: [ast.ts:357](https://github.com/rcs-agents/rcs-lang/blob/2886a07e868cf92f1e606ce6c904ff7e06f6aeb1/packages/ast/src/ast.ts#L357)

A target reference for transitions.

## Spec

TargetReference ::= IDENTIFIER | Variable | PropertyAccess | FlowTermination
