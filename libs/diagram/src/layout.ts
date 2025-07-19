import type { RCLFlowModel, RCLNode } from './types';

export class LayoutEngine {
  constructor(private nodeSpacing: { x: number; y: number }) {}

  public layoutFlow(flow: RCLFlowModel): RCLFlowModel {
    const layoutedNodes = this.calculateHierarchicalLayout(flow);

    return {
      ...flow,
      nodes: layoutedNodes,
    };
  }

  private calculateHierarchicalLayout(flow: RCLFlowModel): RCLNode[] {
    const nodes = [...flow.nodes];
    const edges = flow.edges;
    const levels: string[][] = [];
    const visited = new Set<string>();

    // Find start node
    let startNodeId = nodes.find((n) => n.type === 'start')?.id;
    if (!startNodeId) {
      startNodeId = nodes[0]?.id;
    }

    if (startNodeId) {
      this.traverseFlow(startNodeId, edges, 0, levels, visited);
    }

    // Add any unvisited nodes
    const unvisitedNodes = nodes.filter((n) => !visited.has(n.id));
    if (unvisitedNodes.length > 0) {
      levels.push(unvisitedNodes.map((n) => n.id));
    }

    // Position nodes by levels
    const positionedNodes: RCLNode[] = [];

    levels.forEach((level, levelIndex) => {
      const levelY = 100 + levelIndex * this.nodeSpacing.y;
      const levelWidth = level.length * this.nodeSpacing.x;
      const startX = 100;

      level.forEach((nodeId, nodeIndex) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          positionedNodes.push({
            ...node,
            position: {
              x: startX + nodeIndex * this.nodeSpacing.x,
              y: levelY - ((level.length - 1) * this.nodeSpacing.y) / 4,
            },
          });
        }
      });
    });

    return positionedNodes;
  }

  private traverseFlow(
    nodeId: string,
    edges: Array<{ source: string; target: string }>,
    level: number,
    levels: string[][],
    visited: Set<string>,
  ): void {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    if (!levels[level]) {
      levels[level] = [];
    }
    levels[level].push(nodeId);

    // Find outgoing edges
    const outgoingEdges = edges.filter((e) => e.source === nodeId);
    outgoingEdges.forEach((edge) => {
      this.traverseFlow(edge.target, edges, level + 1, levels, visited);
    });
  }

  public getOptimalViewport(nodes: RCLNode[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (nodes.length === 0) {
      return { x: 0, y: 0, width: 800, height: 600 };
    }

    const xs = nodes.map((n) => n.position.x);
    const ys = nodes.map((n) => n.position.y);

    const minX = Math.min(...xs) - 50;
    const maxX = Math.max(...xs) + 200; // Add node width
    const minY = Math.min(...ys) - 50;
    const maxY = Math.max(...ys) + 100; // Add node height

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}
