---
editUrl: false
next: false
prev: false
title: "TargetReference"
---

> **TargetReference** = [`Identifier`](/api/ast/interfaces/identifier/) \| [`Variable`](/api/ast/interfaces/variable/) \| [`PropertyAccess`](/api/ast/interfaces/propertyaccess/) \| [`FlowTermination`](/api/ast/interfaces/flowtermination/)

Defined in: [ast.ts:357](https://github.com/rcs-agents/rcs-lang/blob/26d5daa2d4dc12570291746a8620ffb47db53cd7/packages/ast/src/ast.ts#L357)

A target reference for transitions.

## Spec

TargetReference ::= IDENTIFIER | Variable | PropertyAccess | FlowTermination
