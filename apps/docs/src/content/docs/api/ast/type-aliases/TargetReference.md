---
editUrl: false
next: false
prev: false
title: "TargetReference"
---

> **TargetReference** = [`Identifier`](/api/ast/interfaces/identifier/) \| [`Variable`](/api/ast/interfaces/variable/) \| [`PropertyAccess`](/api/ast/interfaces/propertyaccess/) \| [`FlowTermination`](/api/ast/interfaces/flowtermination/)

Defined in: [ast.ts:357](https://github.com/rcs-agents/rcs-lang/blob/449c6aed2b429240a17a07baa187612f547c69a0/packages/ast/src/ast.ts#L357)

A target reference for transitions.

## Spec

TargetReference ::= IDENTIFIER | Variable | PropertyAccess | FlowTermination
