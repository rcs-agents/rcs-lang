"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTWalker = void 0;
class ASTWalker {
    /**
     * Walk the AST depth-first, calling the visitor for each node
     * @param node - The root node to start walking from
     * @param visitor - Function called for each node. Return false to skip children
     */
    static walk(node, visitor) {
        this.walkRecursive(node, visitor, 0);
    }
    static walkRecursive(node, visitor, depth, parent) {
        const shouldContinue = visitor(node, depth, parent);
        if (shouldContinue !== false && 'children' in node && node.children) {
            for (const child of node.children) {
                this.walkRecursive(child, visitor, depth + 1, node);
            }
        }
    }
    /**
     * Find all nodes of a specific type
     */
    static findNodesByType(root, type) {
        const results = [];
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
    static findFirstNodeByType(root, type) {
        let result = null;
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
    static findNodes(root, predicate) {
        const results = [];
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
    static findFirstNode(root, predicate) {
        let result = null;
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
    static getAncestors(node) {
        const ancestors = [];
        let current = node.parent;
        while (current) {
            ancestors.push(current);
            current = current.parent;
        }
        return ancestors;
    }
    /**
     * Get all descendant nodes of a given node
     */
    static getDescendants(node) {
        const descendants = [];
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
    static getSiblings(node) {
        if (!node.parent || !('children' in node.parent)) {
            return [];
        }
        return node.parent.children.filter(child => child !== node);
    }
    /**
     * Get the next sibling of a node
     */
    static getNextSibling(node) {
        if (!node.parent || !('children' in node.parent)) {
            return null;
        }
        const siblings = node.parent.children;
        const index = siblings.indexOf(node);
        return index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
    }
    /**
     * Get the previous sibling of a node
     */
    static getPreviousSibling(node) {
        if (!node.parent || !('children' in node.parent)) {
            return null;
        }
        const siblings = node.parent.children;
        const index = siblings.indexOf(node);
        return index > 0 ? siblings[index - 1] : null;
    }
    /**
     * Check if a node is an ancestor of another node
     */
    static isAncestor(ancestor, descendant) {
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
    static findLowestCommonAncestor(node1, node2) {
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
    static getPath(node) {
        const path = [];
        let current = node;
        while (current) {
            path.unshift(current);
            current = current.parent;
        }
        return path;
    }
    /**
     * Get the depth of a node in the tree
     */
    static getDepth(node) {
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
    static containsPosition(node, line, character) {
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
    static findDeepestNodeAtPosition(root, line, character) {
        let deepestNode = null;
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
exports.ASTWalker = ASTWalker;
//# sourceMappingURL=astWalker.js.map