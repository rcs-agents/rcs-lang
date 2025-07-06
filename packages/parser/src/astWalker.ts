import { RCLASTNode, RCLNode } from './astTypes';

export type ASTVisitor = (node: RCLASTNode, depth: number, parent?: RCLASTNode) => boolean | void;

export class ASTWalker {
  /**
   * Walk the AST depth-first, calling the visitor for each node
   * @param node - The root node to start walking from
   * @param visitor - Function called for each node. Return false to skip children
   */
  public static walk(node: RCLASTNode, visitor: ASTVisitor): void {
    this.walkRecursive(node, visitor, 0);
  }

  private static walkRecursive(
    node: RCLASTNode,
    visitor: ASTVisitor,
    depth: number,
    parent?: RCLASTNode
  ): void {
    const shouldContinue = visitor(node, depth, parent);
    
    if (shouldContinue !== false && 'children' in node && node.children) {
      for (const child of node.children) {
        this.walkRecursive(child as RCLASTNode, visitor, depth + 1, node);
      }
    }
  }

  /**
   * Find all nodes of a specific type
   */
  public static findNodesByType(root: RCLASTNode, type: string): RCLASTNode[] {
    const results: RCLASTNode[] = [];
    
    this.walk(root, (node) => {
      if (node.type === type) {
        results.push(node);
      }
    });
    
    return results;
  }

  /**
   * Find the first node of a specific type
   */
  public static findFirstNodeByType(root: RCLASTNode, type: string): RCLASTNode | null {
    let result: RCLASTNode | null = null;
    
    this.walk(root, (node) => {
      if (node.type === type) {
        result = node;
        return false; // Stop walking
      }
    });
    
    return result;
  }

  /**
   * Find all nodes matching a predicate
   */
  public static findNodes(root: RCLASTNode, predicate: (node: RCLASTNode) => boolean): RCLASTNode[] {
    const results: RCLASTNode[] = [];
    
    this.walk(root, (node) => {
      if (predicate(node)) {
        results.push(node);
      }
    });
    
    return results;
  }

  /**
   * Find the first node matching a predicate
   */
  public static findFirstNode(root: RCLASTNode, predicate: (node: RCLASTNode) => boolean): RCLASTNode | null {
    let result: RCLASTNode | null = null;
    
    this.walk(root, (node) => {
      if (predicate(node)) {
        result = node;
        return false; // Stop walking
      }
    });
    
    return result;
  }

  /**
   * Get all ancestor nodes of a given node
   */
  public static getAncestors(node: RCLASTNode): RCLASTNode[] {
    const ancestors: RCLASTNode[] = [];
    let current = node.parent;
    
    while (current) {
      ancestors.push(current as RCLASTNode);
      current = current.parent;
    }
    
    return ancestors;
  }

  /**
   * Get all descendant nodes of a given node
   */
  public static getDescendants(node: RCLASTNode): RCLASTNode[] {
    const descendants: RCLASTNode[] = [];
    
    this.walk(node, (child, depth) => {
      if (depth > 0) { // Skip the root node itself
        descendants.push(child);
      }
    });
    
    return descendants;
  }

  /**
   * Get siblings of a node
   */
  public static getSiblings(node: RCLASTNode): RCLASTNode[] {
    if (!node.parent || !('children' in node.parent)) {
      return [];
    }
    
    return (node.parent.children as RCLASTNode[]).filter(child => child !== node);
  }

  /**
   * Get the next sibling of a node
   */
  public static getNextSibling(node: RCLASTNode): RCLASTNode | null {
    if (!node.parent || !('children' in node.parent)) {
      return null;
    }
    
    const siblings = node.parent.children as RCLASTNode[];
    const index = siblings.indexOf(node);
    
    return index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
  }

  /**
   * Get the previous sibling of a node
   */
  public static getPreviousSibling(node: RCLASTNode): RCLASTNode | null {
    if (!node.parent || !('children' in node.parent)) {
      return null;
    }
    
    const siblings = node.parent.children as RCLASTNode[];
    const index = siblings.indexOf(node);
    
    return index > 0 ? siblings[index - 1] : null;
  }

  /**
   * Check if a node is an ancestor of another node
   */
  public static isAncestor(ancestor: RCLASTNode, descendant: RCLASTNode): boolean {
    let current = descendant.parent;
    
    while (current) {
      if (current === ancestor) {
        return true;
      }
      current = current.parent;
    }
    
    return false;
  }

  /**
   * Find the lowest common ancestor of two nodes
   */
  public static findLowestCommonAncestor(node1: RCLASTNode, node2: RCLASTNode): RCLASTNode | null {
    const ancestors1 = this.getAncestors(node1);
    const ancestors2 = this.getAncestors(node2);
    
    // Add the nodes themselves
    ancestors1.unshift(node1);
    ancestors2.unshift(node2);
    
    // Find the first common ancestor
    for (const ancestor1 of ancestors1) {
      if (ancestors2.includes(ancestor1)) {
        return ancestor1;
      }
    }
    
    return null;
  }

  /**
   * Get the path from root to a node
   */
  public static getPath(node: RCLASTNode): RCLASTNode[] {
    const path: RCLASTNode[] = [];
    let current: RCLASTNode | null = node;
    
    while (current) {
      path.unshift(current);
      current = current.parent as RCLASTNode | null;
    }
    
    return path;
  }

  /**
   * Get the depth of a node in the tree
   */
  public static getDepth(node: RCLASTNode): number {
    let depth = 0;
    let current = node.parent;
    
    while (current) {
      depth++;
      current = current.parent;
    }
    
    return depth;
  }

  /**
   * Check if a node contains a position
   */
  public static containsPosition(node: RCLASTNode, line: number, character: number): boolean {
    const start = node.startPosition;
    const end = node.endPosition;
    
    if (line < start.row || line > end.row) {
      return false;
    }
    
    if (line === start.row && character < start.column) {
      return false;
    }
    
    if (line === end.row && character > end.column) {
      return false;
    }
    
    return true;
  }

  /**
   * Find the deepest node containing a position
   */
  public static findDeepestNodeAtPosition(root: RCLASTNode, line: number, character: number): RCLASTNode | null {
    let deepestNode: RCLASTNode | null = null;
    let maxDepth = -1;
    
    this.walk(root, (node, depth) => {
      if (this.containsPosition(node, line, character) && depth > maxDepth) {
        deepestNode = node;
        maxDepth = depth;
      }
    });
    
    return deepestNode;
  }
}