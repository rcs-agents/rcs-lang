import { FeatureSet, SNodeImpl, type SRoutableElementImpl } from 'sprotty';
import { type Point, RCLNode } from './types.js';

export interface NodeConnectionPoints {
  top: Point;
  right: Point;
  bottom: Point;
  left: Point;
}

export class RCLNodeImpl extends SNodeImpl {
  connectionPoints: NodeConnectionPoints = {
    top: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
    bottom: { x: 0, y: 0 },
    left: { x: 0, y: 0 },
  };

  isEditing = false;

  // Additional properties for match blocks
  isMatchBlock = false;
  matchOptions: string[] = [];

  constructor() {
    super();
    // Create a custom FeatureSet that uses symbols
    const featureSymbols = {
      selectable: Symbol('selectable'),
      moveable: Symbol('moveable'),
      hoverable: Symbol('hoverable'),
      connectable: Symbol('connectable'),
    };

    this.features = {
      has(feature: symbol): boolean {
        return Object.values(featureSymbols).includes(feature);
      },
    };
  }

  /**
   * Calculate connection points based on node dimensions
   */
  updateConnectionPoints(): void {
    const width = this.size.width;
    const height = this.size.height;

    this.connectionPoints = {
      top: { x: width / 2, y: 0 },
      right: { x: width, y: height / 2 },
      bottom: { x: width / 2, y: height },
      left: { x: 0, y: height / 2 },
    };
  }

  /**
   * Get the connection point for a given side
   */
  getConnectionPoint(side: 'top' | 'right' | 'bottom' | 'left'): Point {
    return this.connectionPoints[side];
  }

  /**
   * Get the closest connection point to a given position
   */
  getClosestConnectionPoint(position: Point): {
    side: 'top' | 'right' | 'bottom' | 'left';
    point: Point;
  } {
    let minDistance = Number.POSITIVE_INFINITY;
    let closestSide: 'top' | 'right' | 'bottom' | 'left' = 'right';

    const sides: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];

    sides.forEach((side) => {
      const point = this.connectionPoints[side];
      const globalPoint = {
        x: this.position.x + point.x,
        y: this.position.y + point.y,
      };

      const distance = Math.sqrt(
        Math.pow(position.x - globalPoint.x, 2) + Math.pow(position.y - globalPoint.y, 2),
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestSide = side;
      }
    });

    return {
      side: closestSide,
      point: this.connectionPoints[closestSide],
    };
  }
}

export class MatchBlockNode extends RCLNodeImpl {
  constructor() {
    super();
    this.isMatchBlock = true;
    this.type = 'rcl:match';
  }

  /**
   * Add a match option to this block
   */
  addMatchOption(option: string): void {
    this.matchOptions.push(option);
  }

  /**
   * Remove a match option
   */
  removeMatchOption(index: number): void {
    if (index >= 0 && index < this.matchOptions.length) {
      this.matchOptions.splice(index, 1);
    }
  }

  /**
   * Override Sprotty's canConnect method
   */
  canConnect(routable: SRoutableElementImpl, role: string): boolean {
    if (role === 'target') {
      // Allow incoming connections to the match block itself
      return true;
    } else {
      // Don't allow direct outgoing connections from the match block
      // Only from its option nodes
      return false;
    }
  }
}

export class MatchOptionNode extends RCLNodeImpl {
  parentMatch: string;

  constructor(parentMatchId: string) {
    super();
    this.parentMatch = parentMatchId;
    this.type = 'rcl:match_option';
  }

  /**
   * Override Sprotty's canConnect method
   */
  canConnect(routable: SRoutableElementImpl, role: string): boolean {
    return role === 'source';
  }
}

/**
 * Node factory to create appropriate node types
 */
export class NodeFactory {
  static createNode(type: string, id: string, data: any): RCLNodeImpl {
    let node: RCLNodeImpl;

    switch (type) {
      case 'match':
        node = new MatchBlockNode();
        break;
      case 'match_option':
        node = new MatchOptionNode(data.parentMatch || '');
        break;
      default:
        node = new RCLNodeImpl();
        break;
    }

    node.id = id;
    node.type = `rcl:${type}`;
    node.position = data.position || { x: 0, y: 0 };
    node.size = this.getNodeSize(type);

    // Set additional data
    (node as any).data = data;

    // Update connection points
    node.updateConnectionPoints();

    return node;
  }

  static getNodeSize(type: string): { width: number; height: number } {
    switch (type) {
      case 'start':
      case 'end':
        return { width: 120, height: 60 };
      case 'rich_card':
        return { width: 160, height: 80 };
      case 'condition':
        return { width: 140, height: 70 };
      case 'match':
        return { width: 200, height: 150 }; // Larger for containing options
      case 'match_option':
        return { width: 180, height: 40 };
      default:
        return { width: 140, height: 60 };
    }
  }
}

/**
 * Connection validator for enforcing connection rules
 */
export class ConnectionValidator {
  /**
   * Check if a connection between two nodes is valid
   */
  static canConnect(
    sourceNode: RCLNodeImpl,
    targetNode: RCLNodeImpl,
    sourcePoint: 'top' | 'right' | 'bottom' | 'left',
    targetPoint: 'top' | 'right' | 'bottom' | 'left',
  ): boolean {
    // Check node-specific rules
    if (sourceNode instanceof MatchBlockNode) {
      // Match blocks can't have direct outgoing connections
      return false;
    }

    if (targetNode instanceof MatchBlockNode) {
      // Match blocks can receive incoming connections
      return true;
    }

    if (sourceNode instanceof MatchOptionNode) {
      // Match options can connect to anything except their parent match block
      return targetNode.id !== sourceNode.parentMatch;
    }

    if (targetNode instanceof MatchOptionNode) {
      // Match options can't receive incoming connections
      return false;
    }

    // Default rules
    // Start nodes can only have outgoing connections
    if (sourceNode.type === 'rcl:start' && targetNode.type === 'rcl:start') {
      return false;
    }

    // End nodes can only have incoming connections
    if (sourceNode.type === 'rcl:end') {
      return false;
    }

    // Prevent self-connections
    if (sourceNode.id === targetNode.id) {
      return false;
    }

    return true;
  }

  /**
   * Get valid connection points for a node based on its type and position
   */
  static getValidConnectionPoints(
    node: RCLNodeImpl,
    direction: 'source' | 'target',
    otherNodePosition?: Point,
  ): Array<'top' | 'right' | 'bottom' | 'left'> {
    // For match blocks, restrict connection points
    if (node instanceof MatchBlockNode) {
      if (direction === 'target') {
        // Only allow connections to top and left for incoming
        return ['top', 'left'];
      } else {
        // No direct outgoing connections from match block
        return [];
      }
    }

    if (node instanceof MatchOptionNode) {
      if (direction === 'source') {
        // Only allow connections from right for outgoing
        return ['right'];
      } else {
        // No incoming connections to match options
        return [];
      }
    }

    // For other nodes, return all sides
    return ['top', 'right', 'bottom', 'left'];
  }
}
