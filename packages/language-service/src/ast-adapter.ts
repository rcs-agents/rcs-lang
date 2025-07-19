/**
 * Adapter to ensure language-service always works with old AST format
 */

import type * as AST from '@rcs-lang/ast';
import { IASTNode } from '@rcs-lang/core';
import { type ASTNode, convertNewASTToOld, toBaseNode } from './ast-compatibility.js';

/**
 * Wraps any function that expects old AST to handle new AST
 */
export function wrapASTFunction<T extends (...args: any[]) => any>(fn: T, astArgIndex = 0): T {
  return ((...args: any[]) => {
    const ast = args[astArgIndex];
    if (ast && typeof ast === 'object' && 'location' in ast && !('range' in ast)) {
      // Convert new AST to old format
      args[astArgIndex] = convertNewASTToOld(ast);
    }
    return fn(...args);
  }) as T;
}

/**
 * Ensures AST is in old format
 */
export function ensureOldAST(ast: any): ASTNode {
  if (ast && typeof ast === 'object' && 'location' in ast && !('range' in ast)) {
    return convertNewASTToOld(ast);
  }
  return ast as ASTNode;
}

/**
 * Type guard to check if value is new AST
 */
export function isNewAST(value: any): value is AST.RclFile {
  return (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    value.type === 'RclFile' &&
    'location' in value &&
    !('range' in value)
  );
}
