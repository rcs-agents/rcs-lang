import { describe, test, expect } from 'vitest';
import { ASTWalker, walkAST } from '../src/astWalker';
import { RCLASTNode } from '../src/astTypes';

describe('AST Walker', () => {
  const createMockNode = (type: string, children?: RCLASTNode[]): RCLASTNode => ({
    type,
    text: `${type} text`,
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: 10 },
    children,
    parent: null
  });

  test('should visit all nodes in order', () => {
    const visited: string[] = [];
    
    const ast = createMockNode('root', [
      createMockNode('child1', [
        createMockNode('grandchild1'),
        createMockNode('grandchild2')
      ]),
      createMockNode('child2')
    ]);

    walkAST(ast, (node) => {
      visited.push(node.type);
    });

    expect(visited).toEqual([
      'root',
      'child1',
      'grandchild1',
      'grandchild2',
      'child2'
    ]);
  });

  test('should handle empty AST', () => {
    const visited: string[] = [];
    const ast = createMockNode('root');

    walkAST(ast, (node) => {
      visited.push(node.type);
    });

    expect(visited).toEqual(['root']);
  });

  test('should handle null AST', () => {
    const visited: string[] = [];

    walkAST(null as any, (node) => {
      visited.push(node.type);
    });

    expect(visited).toEqual([]);
  });

  test('should allow early termination', () => {
    const visited: string[] = [];
    
    const ast = createMockNode('root', [
      createMockNode('child1'),
      createMockNode('child2'),
      createMockNode('child3')
    ]);

    walkAST(ast, (node) => {
      visited.push(node.type);
      if (node.type === 'child2') {
        return false; // Stop walking
      }
    });

    expect(visited).toEqual(['root', 'child1', 'child2']);
  });

  test('should provide parent context', () => {
    const parents: Array<string | null> = [];
    
    const child = createMockNode('child');
    const parent = createMockNode('parent', [child]);
    child.parent = parent;

    walkAST(parent, (node) => {
      parents.push(node.parent?.type || null);
    });

    expect(parents).toEqual([null, 'parent']);
  });

  test('should handle deeply nested structures', () => {
    let depth = 0;
    let maxDepth = 0;

    // Create deeply nested structure
    let current = createMockNode('level0');
    for (let i = 1; i <= 10; i++) {
      const child = createMockNode(`level${i}`);
      current.children = [child];
      child.parent = current;
      current = child;
    }

    const root = createMockNode('level0');
    let node = root;
    for (let i = 1; i <= 10; i++) {
      const child = createMockNode(`level${i}`);
      node.children = [child];
      child.parent = node;
      node = child;
    }

    walkAST(root, (node) => {
      const currentDepth = node.type.replace('level', '');
      depth = parseInt(currentDepth);
      maxDepth = Math.max(maxDepth, depth);
    });

    expect(maxDepth).toBe(10);
  });
});