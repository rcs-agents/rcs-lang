---
editUrl: false
next: false
prev: false
title: "ContextOperation"
---

> **ContextOperation** = [`AppendOperation`](/api/ast/interfaces/appendoperation/) \| [`SetOperation`](/api/ast/interfaces/setoperation/) \| [`MergeOperation`](/api/ast/interfaces/mergeoperation/)

Defined in: [ast.ts:321](https://github.com/rcs-agents/rcs-lang/blob/89258eb41dbc7637c8bdc8bfc04b38ebfa30409c/packages/ast/src/ast.ts#L321)

A context operation for manipulating flow results.

## Spec

ContextOperation ::= APPEND RESULT TO Variable | SET Variable TO RESULT | MERGE RESULT INTO Variable
