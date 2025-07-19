/**
 * Compatibility layer for the new AST structure
 * Maps old AST usage patterns to new formal AST
 */

import type * as AST from '@rcs-lang/ast';
import type { IASTNode } from '@rcs-lang/core';

/**
 * Old BaseNode type for compatibility
 */
export interface BaseNode {
  type: string;
  range?: AST.Range;
  text?: string;
  children?: BaseNode[];
  parent?: BaseNode | null;
}

/**
 * Old AST node types for compatibility
 */
export type ASTNode = IASTNode;

export interface AgentNode extends BaseNode {
  type: 'agent_definition';
  name?: string;
  displayName?: string;
  brandName?: string;
  description?: string;
  flows: FlowNode[];
}

export interface FlowNode extends BaseNode {
  type: 'flow_definition';
  name?: string;
  states: StateNode[];
}

export interface MessageNode extends BaseNode {
  type: 'message_definition';
  name?: string;
  messageType?: string;
  content?: ValueNode;
}

export interface StateNode extends BaseNode {
  type: 'state_definition';
  name?: string;
  transitions: TransitionNode[];
}

export interface TransitionNode extends BaseNode {
  type: 'transition';
  from?: string;
  to: string;
}

export interface ValueNode extends BaseNode {
  type: string; // Can be 'string', 'number', 'boolean', etc.
}

export interface StringNode extends BaseNode {
  type: 'string';
  value?: string;
}

export type Range = AST.Range;

/**
 * Walk AST recursively
 */
export function walkAST(
  node: BaseNode | ASTNode,
  callback: (node: BaseNode | ASTNode) => void,
): void {
  callback(node);

  if ('children' in node && node.children) {
    for (const child of node.children) {
      walkAST(child, callback);
    }
  }
}

/**
 * Check if node is new AST format
 */
export function isNewAST(node: any): boolean {
  return node && typeof node === 'object' && 'location' in node && !('range' in node);
}

/**
 * Convert new AST to old format for language service
 */
export function convertNewASTToOld(ast: AST.RclFile | IASTNode): ASTNode {
  if (isNewAST(ast)) {
    return toBaseNode(ast as AST.RclFile) as ASTNode;
  }
  return ast as ASTNode;
}

/**
 * Convert IASTNode to BaseNode for compatibility
 */
/**
 * Type guard for new AST nodes
 */
function isNewASTNode(node: any): node is AST.RclFile | AST.Section | AST.ImportStatement {
  return node && typeof node === 'object' && 'type' in node && 'location' in node;
}

export function toBaseNode(node: IASTNode | AST.RclFile | any): BaseNode {
  // Handle new AST nodes
  if (node && typeof node === 'object' && 'location' in node) {
    const astNode = node as any;
    const children: BaseNode[] = [];

    // Extract children based on node type
    if (astNode.type === 'RclFile') {
      // Convert imports and sections to children
      if (astNode.imports) {
        children.push(...astNode.imports.map(toBaseNode));
      }
      if (astNode.sections) {
        children.push(...astNode.sections.map(toBaseNode));
      }
    } else if ('body' in astNode && Array.isArray(astNode.body)) {
      // Handle sections with body
      children.push(...astNode.body.map(toBaseNode));
    } else if ('imports' in astNode && Array.isArray(astNode.imports)) {
      // Handle other nodes with imports
      children.push(...astNode.imports.map(toBaseNode));
    } else if ('sections' in astNode && Array.isArray(astNode.sections)) {
      // Handle other nodes with sections
      children.push(...astNode.sections.map(toBaseNode));
    }

    return {
      type: astNode.type,
      range: astNode.location?.range,
      text: undefined, // New AST doesn't store text
      children: children.length > 0 ? children : undefined,
      parent: null,
    };
  }

  // Handle old-style IASTNode or compatibility nodes
  if (node && typeof node === 'object') {
    return {
      type: node.type || 'unknown',
      range: node.range || node.location?.range,
      text: node.text,
      children: node.children
        ? Array.isArray(node.children)
          ? node.children.map(toBaseNode)
          : []
        : undefined,
      parent: null,
    };
  }

  // Fallback for primitive values
  return {
    type: 'unknown',
    range: undefined,
    text: String(node),
    children: undefined,
    parent: null,
  };
}
