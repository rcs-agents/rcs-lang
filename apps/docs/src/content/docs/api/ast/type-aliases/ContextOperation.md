---
editUrl: false
next: false
prev: false
title: "ContextOperation"
---

> **ContextOperation** = [`AppendOperation`](/api/ast/interfaces/appendoperation/) \| [`SetOperation`](/api/ast/interfaces/setoperation/) \| [`MergeOperation`](/api/ast/interfaces/mergeoperation/)

Defined in: [ast.ts:321](https://github.com/rcs-agents/rcs-lang/blob/5fc8b9e6ee5bcb678869a4882d36480687a9db1c/packages/ast/src/ast.ts#L321)

A context operation for manipulating flow results.

## Spec

ContextOperation ::= APPEND RESULT TO Variable | SET Variable TO RESULT | MERGE RESULT INTO Variable
