import { RCLASTNode } from '../types/astTypes';
export type ASTVisitor = (node: RCLASTNode, depth: number, parent?: RCLASTNode) => boolean | void;
export declare class ASTWalker {
    /**
     * Walk the AST depth-first, calling the visitor for each node
     * @param node - The root node to start walking from
     * @param visitor - Function called for each node. Return false to skip children
     */
    static walk(node: RCLASTNode, visitor: ASTVisitor): void;
    private static walkRecursive;
    /**
     * Find all nodes of a specific type
     */
    static findNodesByType(root: RCLASTNode, type: string): RCLASTNode[];
    /**
     * Find the first node of a specific type
     */
    static findFirstNodeByType(root: RCLASTNode, type: string): RCLASTNode | null;
    /**
     * Find all nodes matching a predicate
     */
    static findNodes(root: RCLASTNode, predicate: (node: RCLASTNode) => boolean): RCLASTNode[];
    /**
     * Find the first node matching a predicate
     */
    static findFirstNode(root: RCLASTNode, predicate: (node: RCLASTNode) => boolean): RCLASTNode | null;
    /**
     * Get all ancestor nodes of a given node
     */
    static getAncestors(node: RCLASTNode): RCLASTNode[];
    /**
     * Get all descendant nodes of a given node
     */
    static getDescendants(node: RCLASTNode): RCLASTNode[];
    /**
     * Get siblings of a node
     */
    static getSiblings(node: RCLASTNode): RCLASTNode[];
    /**
     * Get the next sibling of a node
     */
    static getNextSibling(node: RCLASTNode): RCLASTNode | null;
    /**
     * Get the previous sibling of a node
     */
    static getPreviousSibling(node: RCLASTNode): RCLASTNode | null;
    /**
     * Check if a node is an ancestor of another node
     */
    static isAncestor(ancestor: RCLASTNode, descendant: RCLASTNode): boolean;
    /**
     * Find the lowest common ancestor of two nodes
     */
    static findLowestCommonAncestor(node1: RCLASTNode, node2: RCLASTNode): RCLASTNode | null;
    /**
     * Get the path from root to a node
     */
    static getPath(node: RCLASTNode): RCLASTNode[];
    /**
     * Get the depth of a node in the tree
     */
    static getDepth(node: RCLASTNode): number;
    /**
     * Check if a node contains a position
     */
    static containsPosition(node: RCLASTNode, line: number, character: number): boolean;
    /**
     * Find the deepest node containing a position
     */
    static findDeepestNodeAtPosition(root: RCLASTNode, line: number, character: number): RCLASTNode | null;
}
