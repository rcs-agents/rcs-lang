import { VNode } from 'snabbdom';
import { SEdgeImpl, SRoutingHandleImpl } from 'sprotty';
import type { Point } from 'sprotty-protocol';
import type { RCLEdge } from './types';

export interface EdgeRouting {
  type: 'smooth' | 'orthogonal';
  waypoints: Point[];
}

export interface EdgeConnectionPoint {
  side: 'top' | 'right' | 'bottom' | 'left';
  offset: number; // 0-1 percentage along the side
}

export interface MultiEdgeLayout {
  sourceNode: string;
  targetNode: string;
  edges: EdgeLayoutInfo[];
}

export interface EdgeLayoutInfo {
  edgeId: string;
  sourceConnection: EdgeConnectionPoint;
  targetConnection: EdgeConnectionPoint;
  offset: number; // Offset for parallel edges
}

export class EdgeLayoutManager {
  private edgeRoutings: Map<string, EdgeRouting> = new Map();
  private multiEdgeLayouts: Map<string, MultiEdgeLayout> = new Map();

  /**
   * Calculate layout for multiple edges between the same nodes
   */
  layoutMultiEdges(edges: RCLEdge[], nodes: any[]): Map<string, EdgeLayoutInfo> {
    const edgeGroups = new Map<string, RCLEdge[]>();

    // Group edges by source-target pair
    edges.forEach((edge) => {
      const key = `${edge.source}-${edge.target}`;
      const reverseKey = `${edge.target}-${edge.source}`;

      // Check both directions
      if (edgeGroups.has(key)) {
        edgeGroups.get(key)!.push(edge);
      } else if (edgeGroups.has(reverseKey)) {
        edgeGroups.get(reverseKey)!.push(edge);
      } else {
        edgeGroups.set(key, [edge]);
      }
    });

    const layoutMap = new Map<string, EdgeLayoutInfo>();

    // Layout each group
    edgeGroups.forEach((groupEdges, key) => {
      if (groupEdges.length === 1) {
        // Single edge - straight connection
        const edge = groupEdges[0];
        layoutMap.set(edge.id, {
          edgeId: edge.id,
          sourceConnection: this.getOptimalConnectionPoint(edge.source, edge.target, nodes),
          targetConnection: this.getOptimalConnectionPoint(edge.target, edge.source, nodes),
          offset: 0,
        });
      } else {
        // Multiple edges - create curved paths with different offsets
        const spacing = 20; // pixels between parallel edges
        const totalWidth = (groupEdges.length - 1) * spacing;

        groupEdges.forEach((edge, index) => {
          const offset = -totalWidth / 2 + index * spacing;
          layoutMap.set(edge.id, {
            edgeId: edge.id,
            sourceConnection: this.getConnectionPointForMultiEdge(
              edge.source,
              edge.target,
              nodes,
              index,
              groupEdges.length,
            ),
            targetConnection: this.getConnectionPointForMultiEdge(
              edge.target,
              edge.source,
              nodes,
              index,
              groupEdges.length,
            ),
            offset,
          });
        });
      }
    });

    return layoutMap;
  }

  /**
   * Get optimal connection point between two nodes
   */
  private getOptimalConnectionPoint(
    fromNode: string,
    toNode: string,
    nodes: any[],
  ): EdgeConnectionPoint {
    const from = nodes.find((n) => n.id === fromNode);
    const to = nodes.find((n) => n.id === toNode);

    if (!from || !to) {
      return { side: 'right', offset: 0.5 };
    }

    const dx = to.position.x - from.position.x;
    const dy = to.position.y - from.position.y;

    // Determine best side based on relative positions
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal connection
      return dx > 0 ? { side: 'right', offset: 0.5 } : { side: 'left', offset: 0.5 };
    } else {
      // Vertical connection
      return dy > 0 ? { side: 'bottom', offset: 0.5 } : { side: 'top', offset: 0.5 };
    }
  }

  /**
   * Get connection point for multi-edge scenarios
   */
  private getConnectionPointForMultiEdge(
    fromNode: string,
    toNode: string,
    nodes: any[],
    index: number,
    total: number,
  ): EdgeConnectionPoint {
    const basePoint = this.getOptimalConnectionPoint(fromNode, toNode, nodes);

    // Distribute connection points along the side
    const offset = (index + 1) / (total + 1);

    return {
      ...basePoint,
      offset,
    };
  }

  /**
   * Add a waypoint to an edge
   */
  addWaypoint(edgeId: string, point: Point, index?: number): void {
    const routing = this.edgeRoutings.get(edgeId) || { type: 'smooth', waypoints: [] };

    if (index !== undefined) {
      routing.waypoints.splice(index, 0, point);
    } else {
      // Find best position to insert
      const insertIndex = this.findBestWaypointPosition(routing.waypoints, point);
      routing.waypoints.splice(insertIndex, 0, point);
    }

    this.edgeRoutings.set(edgeId, routing);
  }

  /**
   * Remove a waypoint from an edge
   */
  removeWaypoint(edgeId: string, waypointIndex: number): void {
    const routing = this.edgeRoutings.get(edgeId);
    if (routing && routing.waypoints.length > waypointIndex) {
      routing.waypoints.splice(waypointIndex, 1);
      this.edgeRoutings.set(edgeId, routing);
    }
  }

  /**
   * Toggle edge routing type
   */
  toggleRoutingType(edgeId: string): void {
    const routing = this.edgeRoutings.get(edgeId) || { type: 'smooth', waypoints: [] };
    routing.type = routing.type === 'smooth' ? 'orthogonal' : 'smooth';
    this.edgeRoutings.set(edgeId, routing);
  }

  /**
   * Clear all waypoints for an edge
   */
  clearWaypoints(edgeId: string): void {
    const routing = this.edgeRoutings.get(edgeId);
    if (routing) {
      routing.waypoints = [];
      this.edgeRoutings.set(edgeId, routing);
    }
  }

  /**
   * Get routing for an edge
   */
  getRouting(edgeId: string): EdgeRouting {
    return this.edgeRoutings.get(edgeId) || { type: 'smooth', waypoints: [] };
  }

  /**
   * Find best position to insert a waypoint
   */
  private findBestWaypointPosition(waypoints: Point[], newPoint: Point): number {
    if (waypoints.length === 0) return 0;
    if (waypoints.length === 1) return 1;

    // Find the closest segment
    let minDistance = Number.POSITIVE_INFINITY;
    let bestIndex = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const distance = this.pointToSegmentDistance(newPoint, waypoints[i], waypoints[i + 1]);
      if (distance < minDistance) {
        minDistance = distance;
        bestIndex = i + 1;
      }
    }

    return bestIndex;
  }

  /**
   * Calculate distance from point to line segment
   */
  private pointToSegmentDistance(point: Point, segStart: Point, segEnd: Point): number {
    const dx = segEnd.x - segStart.x;
    const dy = segEnd.y - segStart.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return Math.sqrt((point.x - segStart.x) ** 2 + (point.y - segStart.y) ** 2);
    }

    const t = Math.max(
      0,
      Math.min(1, ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSquared),
    );
    const projection = {
      x: segStart.x + t * dx,
      y: segStart.y + t * dy,
    };

    return Math.sqrt((point.x - projection.x) ** 2 + (point.y - projection.y) ** 2);
  }

  /**
   * Create path data for smooth routing
   */
  createSmoothPath(start: Point, end: Point, waypoints: Point[], offset = 0): string {
    const points = [start, ...waypoints, end];

    if (points.length === 2) {
      // Simple straight line with offset
      if (offset !== 0) {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const perpAngle = angle + Math.PI / 2;
        const offsetX = Math.cos(perpAngle) * offset;
        const offsetY = Math.sin(perpAngle) * offset;

        const mid = {
          x: (start.x + end.x) / 2 + offsetX,
          y: (start.y + end.y) / 2 + offsetY,
        };

        return `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`;
      }
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    // Create smooth curve through waypoints
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      if (i === 1) {
        // First segment
        const cp = this.getControlPoint(prev, curr, next);
        path += ` Q ${cp.x} ${cp.y} ${curr.x} ${curr.y}`;
      } else if (i === points.length - 1) {
        // Last segment
        const cp = this.getControlPoint(points[i - 2], prev, curr);
        path += ` Q ${cp.x} ${cp.y} ${curr.x} ${curr.y}`;
      } else {
        // Middle segments - use cubic bezier
        const cp1 = this.getControlPoint(points[i - 2], prev, curr);
        const cp2 = this.getControlPoint(prev, curr, next);
        path += ` C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${curr.x} ${curr.y}`;
      }
    }

    return path;
  }

  /**
   * Create path data for orthogonal routing
   */
  createOrthogonalPath(start: Point, end: Point, waypoints: Point[], offset = 0): string {
    const points = [start, ...waypoints, end];
    const segments: string[] = [`M ${start.x} ${start.y}`];

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      // Create orthogonal path with rounded corners
      const corners = this.createOrthogonalSegment(prev, curr, 10); // 10px corner radius
      segments.push(...corners);
    }

    return segments.join(' ');
  }

  /**
   * Create orthogonal segment with rounded corners
   */
  private createOrthogonalSegment(start: Point, end: Point, cornerRadius: number): string[] {
    const segments: string[] = [];
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (Math.abs(dx) < 0.01 || Math.abs(dy) < 0.01) {
      // Straight line
      segments.push(`L ${end.x} ${end.y}`);
    } else {
      // Need to create orthogonal path
      const midX = start.x + dx / 2;
      const midY = start.y + dy / 2;

      // Horizontal first
      segments.push(`H ${midX - Math.sign(dx) * cornerRadius}`);
      segments.push(`Q ${midX} ${start.y} ${midX} ${start.y + Math.sign(dy) * cornerRadius}`);
      segments.push(`V ${end.y - Math.sign(dy) * cornerRadius}`);
      segments.push(`Q ${midX} ${end.y} ${midX + Math.sign(dx) * cornerRadius} ${end.y}`);
      segments.push(`H ${end.x}`);
    }

    return segments;
  }

  /**
   * Get control point for smooth curves
   */
  private getControlPoint(prev: Point | undefined, curr: Point, next: Point | undefined): Point {
    if (!prev) prev = curr;
    if (!next) next = curr;

    const smoothing = 0.2;
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;

    return {
      x: curr.x - dx * smoothing,
      y: curr.y - dy * smoothing,
    };
  }
}

// Export singleton instance
export const edgeLayoutManager = new EdgeLayoutManager();
