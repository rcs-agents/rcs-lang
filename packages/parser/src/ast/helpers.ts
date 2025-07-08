/**
 * AST Helper functions for working with RCL AST nodes
 */

export interface ASTNode {
  type: string;
  text?: string;
  children?: ASTNode[];
  startPosition?: { row: number; column: number };
  endPosition?: { row: number; column: number };
}

/**
 * Get the text content of a node
 */
export function getNodeText(node: ASTNode, sourceContent: string): string {
  if (node.text) {
    return node.text;
  }
  
  if (node.startPosition && node.endPosition) {
    const lines = sourceContent.split('\n');
    const startLine = node.startPosition.row;
    const endLine = node.endPosition.row;
    
    if (startLine === endLine) {
      return lines[startLine].substring(node.startPosition.column, node.endPosition.column);
    } else {
      let text = lines[startLine].substring(node.startPosition.column);
      for (let i = startLine + 1; i < endLine; i++) {
        text += '\n' + lines[i];
      }
      text += '\n' + lines[endLine].substring(0, node.endPosition.column);
      return text;
    }
  }
  
  return '';
}

/**
 * Find the first node of a given type
 */
export function findNodeByType(node: ASTNode, type: string): ASTNode | null {
  if (node.type === type) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByType(child, type);
      if (found) {
        return found;
      }
    }
  }
  
  return null;
}

/**
 * Find all nodes of a given type
 */
export function findNodesByType(node: ASTNode, type: string): ASTNode[] {
  const results: ASTNode[] = [];
  
  if (node.type === type) {
    results.push(node);
  }
  
  if (node.children) {
    for (const child of node.children) {
      results.push(...findNodesByType(child, type));
    }
  }
  
  return results;
}

/**
 * Walk the AST and call a callback for each node
 */
export function walkAST(node: ASTNode, callback: (node: ASTNode) => void): void {
  callback(node);
  
  if (node.children) {
    for (const child of node.children) {
      walkAST(child, callback);
    }
  }
}