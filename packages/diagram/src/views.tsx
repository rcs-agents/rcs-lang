import { injectable } from 'inversify';
import { type VNode, h } from 'snabbdom';
import type { IView, RenderingContext, SEdgeImpl, SNodeImpl, SRoutingHandleImpl } from 'sprotty';
import type { Point } from 'sprotty-protocol';
import { edgeLayoutManager } from './edges';
import { MatchBlockNode, MatchOptionNode, type RCLNodeImpl } from './nodes';

@injectable()
export class RCLNodeView implements IView {
  render(node: SNodeImpl, context: RenderingContext): VNode {
    const nodeType = node.type.replace('rcl:', '');
    const data = (node as any).data || {};
    const rclNode = node as RCLNodeImpl;

    // Special rendering for match blocks
    if (rclNode instanceof MatchBlockNode) {
      return this.renderMatchBlock(rclNode, context);
    }

    if (rclNode instanceof MatchOptionNode) {
      return this.renderMatchOption(rclNode, context);
    }

    return h(
      'g',
      {
        class: {
          node: true,
          selected: node.selected,
          editing: rclNode.isEditing,
        },
        attrs: {
          'data-node-id': node.id,
        },
      },
      [
        this.renderNodeShape(node, nodeType, data),
        this.renderNodeLabel(node, data),
        ...this.renderNodeMetadata(node, data),
        ...this.renderConnectionPoints(rclNode),
        this.renderEditIcon(rclNode),
      ],
    );
  }

  /**
   * Render match block with outer container and inner options
   */
  private renderMatchBlock(node: MatchBlockNode, context: RenderingContext): VNode {
    const { width, height } = node.size;
    const data = (node as any).data || {};

    return h(
      'g',
      {
        class: {
          'match-block': true,
          node: true,
          selected: node.selected,
        },
        attrs: {
          'data-node-id': node.id,
        },
      },
      [
        // Outer container
        h('rect', {
          attrs: {
            x: 0,
            y: 0,
            width: width,
            height: height,
            rx: 8,
            fill: '#f0f0f0',
            stroke: '#666',
            'stroke-width': 2,
            'stroke-dasharray': '5,5',
          },
          class: { 'match-container': true },
        }),

        // Header
        h('rect', {
          attrs: {
            x: 0,
            y: 0,
            width: width,
            height: 30,
            rx: '8 8 0 0',
            fill: '#e0e0e0',
          },
        }),

        h(
          'text',
          {
            attrs: {
              x: width / 2,
              y: 15,
              'text-anchor': 'middle',
              'dominant-baseline': 'central',
              fill: '#333',
              'font-size': '12',
              'font-weight': 'bold',
            },
          },
          data.label || 'Match',
        ),

        // Options container
        h(
          'g',
          {
            attrs: {
              transform: 'translate(10, 40)',
            },
          },
          this.renderMatchOptions(node, data),
        ),

        // Connection points (only on sides)
        ...this.renderConnectionPoints(node, ['left', 'right']),
      ],
    );
  }

  /**
   * Render match options inside the match block
   */
  private renderMatchOptions(node: MatchBlockNode, data: any): VNode[] {
    const options = data.matchOptions || [];
    const optionHeight = 30;
    const optionWidth = node.size.width - 20;

    return options.map((option: string, index: number) => {
      const y = index * (optionHeight + 5);

      return h(
        'g',
        {
          class: { 'match-option': true },
          attrs: {
            transform: `translate(0, ${y})`,
            'data-option-index': index,
          },
        },
        [
          h('rect', {
            attrs: {
              x: 0,
              y: 0,
              width: optionWidth,
              height: optionHeight,
              rx: 4,
              fill: '#fff',
              stroke: '#999',
              'stroke-width': 1,
            },
          }),
          h(
            'text',
            {
              attrs: {
                x: 10,
                y: optionHeight / 2,
                'dominant-baseline': 'central',
                fill: '#333',
                'font-size': '11',
              },
            },
            option,
          ),
          // Connection point on the right
          h('circle', {
            attrs: {
              cx: optionWidth,
              cy: optionHeight / 2,
              r: 4,
              fill: '#007acc',
              stroke: '#005a9e',
              'stroke-width': 1,
            },
            class: { 'connection-point': true, right: true },
          }),
        ],
      );
    });
  }

  /**
   * Render match option node (when separated)
   */
  private renderMatchOption(node: MatchOptionNode, context: RenderingContext): VNode {
    const { width, height } = node.size;
    const data = (node as any).data || {};

    return h(
      'g',
      {
        class: {
          'match-option-node': true,
          node: true,
          selected: node.selected,
        },
        attrs: {
          'data-node-id': node.id,
        },
      },
      [
        h('rect', {
          attrs: {
            x: 0,
            y: 0,
            width: width,
            height: height,
            rx: 4,
            fill: '#fff',
            stroke: '#999',
            'stroke-width': 1,
          },
        }),
        h(
          'text',
          {
            attrs: {
              x: width / 2,
              y: height / 2,
              'text-anchor': 'middle',
              'dominant-baseline': 'central',
              fill: '#333',
              'font-size': '11',
            },
          },
          data.label || 'Option',
        ),
        // Only right connection point for outgoing
        ...this.renderConnectionPoints(node, ['right']),
      ],
    );
  }

  private renderNodeShape(node: SNodeImpl, nodeType: string, data: any): VNode {
    const { width, height } = node.size;

    switch (nodeType) {
      case 'start':
        return h('rect', {
          attrs: {
            x: 0,
            y: 0,
            width: width,
            height: height,
            rx: 8,
            fill: '#4ac776',
            stroke: '#0f4c25',
            'stroke-width': 2,
          },
          class: { 'start-node': true },
        });

      case 'end':
        return h('rect', {
          attrs: {
            x: 0,
            y: 0,
            width: width,
            height: height,
            rx: 8,
            fill: '#f85c5c',
            stroke: '#c42e2e',
            'stroke-width': 2,
          },
          class: { 'end-node': true },
        });

      case 'rich_card':
        return h('rect', {
          attrs: {
            x: 0,
            y: 0,
            width: width,
            height: height,
            rx: 8,
            fill: '#ff9500',
            stroke: '#cc7700',
            'stroke-width': 2,
          },
          class: { 'rich-card-node': true },
        });

      case 'condition':
        return h('polygon', {
          attrs: {
            points: `${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`,
            fill: '#9b59b6',
            stroke: '#7d3c8f',
            'stroke-width': 2,
          },
          class: { 'condition-node': true },
        });

      default: // message
        return h('rect', {
          attrs: {
            x: 0,
            y: 0,
            width: width,
            height: height,
            rx: 8,
            fill: '#007acc',
            stroke: '#005a9e',
            'stroke-width': 2,
          },
          class: { 'message-node': true },
        });
    }
  }

  private renderNodeLabel(node: SNodeImpl, data: any): VNode {
    const { width, height } = node.size;
    const text = data.label || node.id;

    return h(
      'text',
      {
        attrs: {
          x: width / 2,
          y: height / 2,
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          fill: 'white',
          'font-size': '12',
          'font-family': 'Arial, sans-serif',
          'font-weight': 'bold',
          'pointer-events': 'none',
        },
        class: { 'node-label': true },
      },
      this.truncateText(text, 18),
    );
  }

  private renderNodeMetadata(node: SNodeImpl, data: any): VNode[] {
    const metadata = data.rclMetadata;
    if (!metadata) return [];

    const indicators: VNode[] = [];
    const { width, height } = node.size;

    // Show indicators for special features
    if (metadata.hasSuggestions) {
      indicators.push(
        h('circle', {
          attrs: {
            cx: width - 10,
            cy: 10,
            r: 4,
            fill: '#00ff00',
            title: 'Has suggestions',
          },
        }),
      );
    }

    if (metadata.hasConditions) {
      indicators.push(
        h('circle', {
          attrs: {
            cx: width - 10,
            cy: height - 10,
            r: 4,
            fill: '#ffff00',
            title: 'Has conditions',
          },
        }),
      );
    }

    return indicators;
  }

  /**
   * Render connection points
   */
  private renderConnectionPoints(
    node: RCLNodeImpl,
    sides?: Array<'top' | 'right' | 'bottom' | 'left'>,
  ): VNode[] {
    const points: VNode[] = [];
    const validSides = sides || ['top', 'right', 'bottom', 'left'];

    // Update connection points first
    node.updateConnectionPoints();

    validSides.forEach((side) => {
      const point = node.getConnectionPoint(side);

      points.push(
        h('circle', {
          attrs: {
            cx: point.x,
            cy: point.y,
            r: 4,
            fill: 'transparent',
            stroke: '#007acc',
            'stroke-width': 1,
            opacity: 0,
          },
          class: {
            'connection-point': true,
            [side]: true,
            visible: node.selected || (node as any).hovering,
          },
          on: {
            mouseenter: (e: MouseEvent) => {
              (e.target as SVGElement).setAttribute('opacity', '1');
            },
            mouseleave: (e: MouseEvent) => {
              if (!node.selected) {
                (e.target as SVGElement).setAttribute('opacity', '0');
              }
            },
          },
        }),
      );
    });

    return points;
  }

  /**
   * Render edit icon
   */
  private renderEditIcon(node: RCLNodeImpl): VNode {
    const { width } = node.size;

    return h(
      'g',
      {
        class: { 'edit-icon': true },
        attrs: {
          transform: `translate(${width - 20}, 5)`,
          opacity: node.selected ? 1 : 0,
          cursor: 'pointer',
        },
        on: {
          click: (e: MouseEvent) => {
            e.stopPropagation();
            // Trigger edit mode
            node.isEditing = true;
            // Dispatch custom event
            const event = new CustomEvent('node-edit', {
              detail: { nodeId: node.id },
            });
            document.dispatchEvent(event);
          },
        },
      },
      [
        h('rect', {
          attrs: {
            x: 0,
            y: 0,
            width: 16,
            height: 16,
            rx: 2,
            fill: 'white',
            stroke: '#666',
            'stroke-width': 1,
          },
        }),
        h('path', {
          attrs: {
            d: 'M3 10.5V13h2.5L12 6.5 9.5 4 3 10.5zm11.5-7.5c.3-.3.3-.7 0-1l-1.5-1.5c-.3-.3-.7-.3-1 0L10.5 2 13 4.5l1.5-1.5z',
            fill: '#666',
            transform: 'scale(0.8) translate(2, 2)',
          },
        }),
      ],
    );
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? `${text.substring(0, maxLength - 3)}...` : text;
  }
}

@injectable()
export class RCLEdgeView implements IView {
  render(edge: SEdgeImpl, context: RenderingContext): VNode {
    const data = (edge as any).data || {};
    const edgeRouting = edgeLayoutManager.getRouting(edge.id);

    return h(
      'g',
      {
        class: {
          edge: true,
          selected: edge.selected,
        },
        attrs: {
          'data-edge-id': edge.id,
        },
      },
      [
        h('defs', [
          h(
            'marker',
            {
              attrs: {
                id: `arrowhead-${edge.id}`,
                markerWidth: 10,
                markerHeight: 7,
                refX: 9,
                refY: 3.5,
                orient: 'auto',
              },
            },
            [
              h('polygon', {
                attrs: {
                  points: '0 0, 10 3.5, 0 7',
                  fill: data.condition ? '#ff9500' : '#666',
                },
              }),
            ],
          ),
        ]),

        // Invisible wider path for easier selection
        h('path', {
          attrs: {
            d: this.createEdgePath(edge, edgeRouting),
            stroke: 'transparent',
            'stroke-width': 20,
            fill: 'none',
            cursor: 'pointer',
          },
          on: {
            dblclick: (e: MouseEvent) => this.handleEdgeDoubleClick(e, edge, edgeRouting),
          },
        }),

        // Visible edge path
        h('path', {
          attrs: {
            d: this.createEdgePath(edge, edgeRouting),
            stroke: data.condition ? '#ff9500' : '#666',
            'stroke-width': 2,
            fill: 'none',
            'marker-end': `url(#arrowhead-${edge.id})`,
            'stroke-dasharray': data.condition ? '5,5' : 'none',
          },
          class: {
            'edge-path': true,
            orthogonal: edgeRouting.type === 'orthogonal',
          },
        }),

        // Render waypoints
        ...this.renderWaypoints(edge, edgeRouting),

        // Edge label
        data.trigger && this.renderEdgeLabel(edge, data.trigger),

        // Routing type toggle
        edge.selected && this.renderRoutingToggle(edge, edgeRouting),

        // Endpoint handles for reconnection
        edge.selected && this.renderEndpointHandles(edge),
      ],
    );
  }

  private createEdgePath(edge: SEdgeImpl, routing: any): string {
    const sourcePoint = (edge as any).sourcePoint || { x: 0, y: 0 };
    const targetPoint = (edge as any).targetPoint || { x: 100, y: 100 };

    // Get edge layout info for multi-edge handling
    const layoutInfo = (edge as any).layoutInfo;
    const offset = layoutInfo?.offset || 0;

    if (routing.type === 'orthogonal') {
      return edgeLayoutManager.createOrthogonalPath(
        sourcePoint,
        targetPoint,
        routing.waypoints || [],
        offset,
      );
    } else {
      return edgeLayoutManager.createSmoothPath(
        sourcePoint,
        targetPoint,
        routing.waypoints || [],
        offset,
      );
    }
  }

  /**
   * Handle double-click on edge to add waypoint
   */
  private handleEdgeDoubleClick(e: MouseEvent, edge: SEdgeImpl, routing: any): void {
    e.stopPropagation();

    // Get click position in SVG coordinates
    const svg = (e.currentTarget as SVGElement).ownerSVGElement;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const svgPoint = pt.matrixTransform(svg.getScreenCTM()!.inverse());

    // Add waypoint at click position
    edgeLayoutManager.addWaypoint(edge.id, {
      x: svgPoint.x,
      y: svgPoint.y,
    });

    // Trigger re-render
    const event = new CustomEvent('edge-modified', {
      detail: { edgeId: edge.id },
    });
    document.dispatchEvent(event);
  }

  /**
   * Render waypoints
   */
  private renderWaypoints(edge: SEdgeImpl, routing: any): VNode[] {
    if (!routing.waypoints || routing.waypoints.length === 0) {
      return [];
    }

    return routing.waypoints.map((waypoint: Point, index: number) => {
      return h('circle', {
        attrs: {
          cx: waypoint.x,
          cy: waypoint.y,
          r: 5,
          fill: edge.selected ? '#007acc' : '#999',
          stroke: 'white',
          'stroke-width': 2,
          cursor: 'move',
        },
        class: { waypoint: true },
        on: {
          dblclick: (e: MouseEvent) => {
            e.stopPropagation();
            edgeLayoutManager.removeWaypoint(edge.id, index);

            const event = new CustomEvent('edge-modified', {
              detail: { edgeId: edge.id },
            });
            document.dispatchEvent(event);
          },
          mousedown: (e: MouseEvent) => {
            e.stopPropagation();
            this.startWaypointDrag(e, edge, index, waypoint);
          },
        },
      });
    });
  }

  /**
   * Start dragging a waypoint
   */
  private startWaypointDrag(
    e: MouseEvent,
    edge: SEdgeImpl,
    waypointIndex: number,
    waypoint: Point,
  ): void {
    const svg = (e.currentTarget as SVGElement).ownerSVGElement;
    if (!svg) return;

    let isDragging = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const originalWaypoint = { ...waypoint };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging) return;

      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      // Update waypoint position
      const routing = edgeLayoutManager.getRouting(edge.id);
      if (routing.waypoints && routing.waypoints[waypointIndex]) {
        routing.waypoints[waypointIndex] = {
          x: originalWaypoint.x + dx,
          y: originalWaypoint.y + dy,
        };

        // Trigger re-render
        const event = new CustomEvent('edge-modified', {
          detail: { edgeId: edge.id },
        });
        document.dispatchEvent(event);
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  /**
   * Render routing type toggle button
   */
  private renderRoutingToggle(edge: SEdgeImpl, routing: any): VNode {
    const sourcePoint = (edge as any).sourcePoint || { x: 0, y: 0 };
    const targetPoint = (edge as any).targetPoint || { x: 100, y: 100 };
    const midX = (sourcePoint.x + targetPoint.x) / 2;
    const midY = (sourcePoint.y + targetPoint.y) / 2;

    return h(
      'g',
      {
        attrs: {
          transform: `translate(${midX}, ${midY - 20})`,
        },
        class: { 'routing-toggle': true },
      },
      [
        h('rect', {
          attrs: {
            x: -20,
            y: -10,
            width: 40,
            height: 20,
            rx: 10,
            fill: 'white',
            stroke: '#666',
            'stroke-width': 1,
            cursor: 'pointer',
          },
          on: {
            click: (e: MouseEvent) => {
              e.stopPropagation();
              edgeLayoutManager.toggleRoutingType(edge.id);

              const event = new CustomEvent('edge-modified', {
                detail: { edgeId: edge.id },
              });
              document.dispatchEvent(event);
            },
          },
        }),
        h(
          'text',
          {
            attrs: {
              x: 0,
              y: 0,
              'text-anchor': 'middle',
              'dominant-baseline': 'central',
              'font-size': '10',
              'font-family': 'Arial, sans-serif',
              fill: '#666',
              'pointer-events': 'none',
            },
          },
          routing.type === 'smooth' ? 'S' : 'O',
        ),
      ],
    );
  }

  private renderEdgeLabel(edge: SEdgeImpl, text: string): VNode {
    const sourcePoint = (edge as any).sourcePoint || { x: 0, y: 0 };
    const targetPoint = (edge as any).targetPoint || { x: 100, y: 100 };

    const midX = (sourcePoint.x + targetPoint.x) / 2;
    const midY = (sourcePoint.y + targetPoint.y) / 2;

    return h(
      'g',
      {
        attrs: {
          transform: `translate(${midX}, ${midY})`,
        },
      },
      [
        h('rect', {
          attrs: {
            x: -text.length * 3,
            y: -8,
            width: text.length * 6,
            height: 16,
            fill: 'white',
            stroke: '#666',
            rx: 3,
          },
        }),
        h(
          'text',
          {
            attrs: {
              x: 0,
              y: 0,
              'text-anchor': 'middle',
              'dominant-baseline': 'central',
              'font-size': '10',
              'font-family': 'Arial, sans-serif',
              fill: '#333',
            },
          },
          text,
        ),
      ],
    );
  }

  /**
   * Render endpoint handles for edge reconnection
   */
  private renderEndpointHandles(edge: SEdgeImpl): VNode {
    const sourcePoint = (edge as any).sourcePoint || { x: 0, y: 0 };
    const targetPoint = (edge as any).targetPoint || { x: 100, y: 100 };

    return h(
      'g',
      {
        class: { 'endpoint-handles': true },
      },
      [
        // Source handle
        h('circle', {
          attrs: {
            cx: sourcePoint.x,
            cy: sourcePoint.y,
            r: 8,
            fill: '#007acc',
            stroke: 'white',
            'stroke-width': 2,
            cursor: 'crosshair',
            opacity: 0.8,
          },
          class: { 'endpoint-handle': true, 'source-handle': true },
          on: {
            mouseenter: (e: MouseEvent) => {
              (e.target as SVGElement).setAttribute('r', '10');
              (e.target as SVGElement).setAttribute('opacity', '1');
            },
            mouseleave: (e: MouseEvent) => {
              (e.target as SVGElement).setAttribute('r', '8');
              (e.target as SVGElement).setAttribute('opacity', '0.8');
            },
            mousedown: (e: MouseEvent) => {
              e.stopPropagation();
              this.startEndpointDrag(e, edge, 'source');
            },
          },
        }),

        // Target handle
        h('circle', {
          attrs: {
            cx: targetPoint.x,
            cy: targetPoint.y,
            r: 8,
            fill: '#f85c5c',
            stroke: 'white',
            'stroke-width': 2,
            cursor: 'crosshair',
            opacity: 0.8,
          },
          class: { 'endpoint-handle': true, 'target-handle': true },
          on: {
            mouseenter: (e: MouseEvent) => {
              (e.target as SVGElement).setAttribute('r', '10');
              (e.target as SVGElement).setAttribute('opacity', '1');
            },
            mouseleave: (e: MouseEvent) => {
              (e.target as SVGElement).setAttribute('r', '8');
              (e.target as SVGElement).setAttribute('opacity', '0.8');
            },
            mousedown: (e: MouseEvent) => {
              e.stopPropagation();
              this.startEndpointDrag(e, edge, 'target');
            },
          },
        }),
      ],
    );
  }

  /**
   * Start dragging an edge endpoint
   */
  private startEndpointDrag(
    e: MouseEvent,
    edge: SEdgeImpl,
    endpointType: 'source' | 'target',
  ): void {
    const svg = (e.currentTarget as SVGElement).ownerSVGElement;
    if (!svg) return;

    let isDragging = true;
    let dragLine: SVGLineElement | null = null;
    let hoveredNode: string | null = null;

    // Create a temporary line to show the connection being dragged
    dragLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const startPoint =
      endpointType === 'source' ? (edge as any).sourcePoint : (edge as any).targetPoint;
    const otherPoint =
      endpointType === 'source' ? (edge as any).targetPoint : (edge as any).sourcePoint;

    dragLine.setAttribute('x1', startPoint!.x.toString());
    dragLine.setAttribute('y1', startPoint!.y.toString());
    dragLine.setAttribute('x2', startPoint!.x.toString());
    dragLine.setAttribute('y2', startPoint!.y.toString());
    dragLine.setAttribute('stroke', '#007acc');
    dragLine.setAttribute('stroke-width', '2');
    dragLine.setAttribute('stroke-dasharray', '5,5');
    dragLine.style.pointerEvents = 'none';

    svg.appendChild(dragLine);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging || !dragLine) return;

      const pt = svg.createSVGPoint();
      pt.x = moveEvent.clientX;
      pt.y = moveEvent.clientY;
      const svgPoint = pt.matrixTransform(svg.getScreenCTM()!.inverse());

      // Update drag line
      dragLine.setAttribute('x2', svgPoint.x.toString());
      dragLine.setAttribute('y2', svgPoint.y.toString());

      // Check if hovering over a node
      const element = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const nodeElement = element?.closest('.node');

      if (nodeElement) {
        const nodeId = nodeElement.getAttribute('data-node-id');
        if (nodeId && nodeId !== hoveredNode) {
          // Highlight the hovered node
          hoveredNode = nodeId;
          nodeElement.classList.add('connection-target');
        }
      } else if (hoveredNode) {
        // Remove highlight from previously hovered node
        const prevNode = document.querySelector(`[data-node-id="${hoveredNode}"]`);
        prevNode?.classList.remove('connection-target');
        hoveredNode = null;
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      isDragging = false;

      // Remove drag line
      if (dragLine) {
        dragLine.remove();
        dragLine = null;
      }

      // Check if dropped on a node
      const element = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      const nodeElement = element?.closest('.node');

      if (nodeElement) {
        const newNodeId = nodeElement.getAttribute('data-node-id');
        if (newNodeId) {
          // Trigger edge reconnection
          const event = new CustomEvent('edge-reconnected', {
            detail: {
              edgeId: edge.id,
              endpointType: endpointType,
              newNodeId: newNodeId,
              oldSourceId: edge.sourceId,
              oldTargetId: edge.targetId,
            },
          });
          document.dispatchEvent(event);
        }
      }

      // Clean up
      if (hoveredNode) {
        const prevNode = document.querySelector(`[data-node-id="${hoveredNode}"]`);
        prevNode?.classList.remove('connection-target');
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
}

/**
 * Routing handle view for moving edge endpoints
 */
@injectable()
export class RCLRoutingHandleView implements IView {
  render(handle: SRoutingHandleImpl, context: RenderingContext): VNode {
    return h('circle', {
      attrs: {
        cx: 0,
        cy: 0,
        r: 5,
        fill: '#007acc',
        stroke: 'white',
        'stroke-width': 2,
        cursor: 'crosshair',
      },
      class: { 'routing-handle': true },
    });
  }
}
