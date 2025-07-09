import { Result, ok, err, Diagnostic, DiagnosticCollectionImpl } from '@rcl/core-types';
import { ASTNode, ParseResult } from './types';

/**
 * Create a parse result with proper error handling
 */
export function createParseResult(
  ast: ASTNode | null,
  diagnostics: Diagnostic[] = []
): ParseResult {
  return { ast, diagnostics };
}

/**
 * Check AST for ERROR nodes and convert to diagnostics
 */
export function checkForErrorNodes(node: ASTNode, diagnostics: DiagnosticCollectionImpl): void {
  if (!node) return;
  
  if (node.type === 'ERROR') {
    diagnostics.add({
      severity: 'error',
      message: 'Syntax error',
      range: node.range || {
        start: {
          line: node.startPosition?.row || 0,
          column: node.startPosition?.column || 0
        },
        end: {
          line: node.endPosition?.row || 0,
          column: node.endPosition?.column || 0
        }
      },
      code: 'E001',
      source: 'parser'
    });
  }
  
  if (node.children) {
    node.children.forEach(child => checkForErrorNodes(child, diagnostics));
  }
}

/**
 * Convert tree-sitter node to our AST format
 */
export function convertTreeSitterNode(tsNode: any): ASTNode {
  const node: ASTNode = {
    type: tsNode.type,
    startPosition: tsNode.startPosition,
    endPosition: tsNode.endPosition,
    range: {
      start: {
        line: tsNode.startPosition?.row || 0,
        column: tsNode.startPosition?.column || 0
      },
      end: {
        line: tsNode.endPosition?.row || 0,
        column: tsNode.endPosition?.column || 0
      }
    }
  };
  
  if (tsNode.text) {
    node.text = tsNode.text;
  }
  
  if (tsNode.children && tsNode.children.length > 0) {
    node.children = tsNode.children.map(convertTreeSitterNode);
  }
  
  return node;
}