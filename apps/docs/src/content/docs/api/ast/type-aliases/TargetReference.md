---
editUrl: false
next: false
prev: false
title: "TargetReference"
---

> **TargetReference** = [`Identifier`](/api/ast/interfaces/identifier/) \| [`Variable`](/api/ast/interfaces/variable/) \| [`PropertyAccess`](/api/ast/interfaces/propertyaccess/) \| [`FlowTermination`](/api/ast/interfaces/flowtermination/)

Defined in: [ast.ts:354](https://github.com/rcs-agents/rcs-lang/blob/96f7bb5710555321ae9695be4004d52239e42e7e/packages/ast/src/ast.ts#L354)

A target reference for transitions.

## Spec

TargetReference ::= IDENTIFIER | Variable | PropertyAccess | FlowTermination
