import type { PropertyFormData, RCLEdge, RCLFlowModel, RCLNode } from './types.js';

/**
 * Code generator for converting diagram models back to RCL source code
 */
export class RCLCodeGenerator {
  private indentSize = 2;

  /**
   * Generate complete RCL source code from a flow model
   */
  generateFlowCode(flow: RCLFlowModel): string {
    const lines: string[] = [];

    // Generate flow header
    lines.push(`flow ${flow.id}:`);

    // Generate flow body with proper indentation
    const flowBody = this.generateFlowBody(flow);
    lines.push(...flowBody);

    return lines.join('\n');
  }

  /**
   * Generate flow body (nodes and edges)
   */
  private generateFlowBody(flow: RCLFlowModel): string[] {
    const lines: string[] = [];
    const indent = this.getIndent(1);

    // Group nodes by type and generate in logical order
    const startNodes = flow.nodes.filter((n) => n.type === 'start');
    const messageNodes = flow.nodes.filter((n) => ['message', 'rich_card'].includes(n.type));
    const matchNodes = flow.nodes.filter((n) => n.type === 'match');
    const endNodes = flow.nodes.filter((n) => n.type === 'end');

    // Generate start nodes
    startNodes.forEach((node) => {
      lines.push(indent + this.generateNodeCode(node, 1));
    });

    // Generate message/rich card nodes
    messageNodes.forEach((node) => {
      const nodeLines = this.generateNodeCode(node, 1);
      if (Array.isArray(nodeLines)) {
        lines.push(...nodeLines);
      } else {
        lines.push(indent + nodeLines);
      }
    });

    // Generate match blocks
    matchNodes.forEach((node) => {
      const matchLines = this.generateMatchBlockCode(node, flow, 1);
      lines.push(...matchLines);
    });

    // Generate end nodes
    endNodes.forEach((node) => {
      lines.push(indent + this.generateNodeCode(node, 1));
    });

    // Generate transitions (edges)
    const transitionLines = this.generateTransitions(flow.edges, flow.nodes, 1);
    if (transitionLines.length > 0) {
      lines.push(''); // Empty line before transitions
      lines.push(...transitionLines);
    }

    return lines;
  }

  /**
   * Generate code for a single node
   */
  private generateNodeCode(node: RCLNode, indentLevel: number): string | string[] {
    switch (node.type) {
      case 'start':
        return `start ${node.id}`;

      case 'end':
        return `end ${node.id}`;

      case 'message':
        return this.generateMessageNodeCode(node, indentLevel);

      case 'rich_card':
        return this.generateRichCardNodeCode(node, indentLevel);

      default:
        return `// TODO: ${node.type} ${node.id}`;
    }
  }

  /**
   * Generate message node code
   */
  private generateMessageNodeCode(node: RCLNode, indentLevel: number): string[] {
    const lines: string[] = [];
    const indent = this.getIndent(indentLevel);
    const data = node.data.messageData;

    if (!data) {
      lines.push(`${indent}message ${node.id}:`);
      lines.push(`${indent}  text: "${node.data.label}"`);
      return lines;
    }

    lines.push(`${indent}message ${node.id}:`);

    // Generate message content
    if (data.contentMessage) {
      const content = data.contentMessage;

      // Text content
      if (content.text) {
        lines.push(`${indent}  text: "${this.escapeString(content.text)}"`);
      }

      // Suggestions
      if (content.suggestions && content.suggestions.length > 0) {
        lines.push(`${indent}  suggestions:`);
        content.suggestions.forEach((suggestion: any) => {
          if (suggestion.reply) {
            lines.push(`${indent}    - reply:`);
            lines.push(`${indent}        text: "${this.escapeString(suggestion.reply.text)}"`);
            if (suggestion.reply.postbackData) {
              lines.push(
                `${indent}        postbackData: "${this.escapeString(suggestion.reply.postbackData)}"`,
              );
            }
          } else if (suggestion.action) {
            lines.push(`${indent}    - action:`);
            lines.push(`${indent}        text: "${this.escapeString(suggestion.action.text)}"`);
            if (suggestion.action.postbackData) {
              lines.push(
                `${indent}        postbackData: "${this.escapeString(suggestion.action.postbackData)}"`,
              );
            }

            // Action types
            if (suggestion.action.openUrlAction) {
              lines.push(`${indent}        openUrl:`);
              lines.push(`${indent}          url: <url ${suggestion.action.openUrlAction.url}>`);
            } else if (suggestion.action.dialAction) {
              lines.push(`${indent}        dial:`);
              lines.push(
                `${indent}          phoneNumber: "${suggestion.action.dialAction.phoneNumber}"`,
              );
            }
            // Add other action types as needed
          }
        });
      }
    }

    // Traffic type
    if (data.messageTrafficType) {
      lines.push(`${indent}  trafficType: ${data.messageTrafficType}`);
    }

    return lines;
  }

  /**
   * Generate rich card node code
   */
  private generateRichCardNodeCode(node: RCLNode, indentLevel: number): string[] {
    const lines: string[] = [];
    const indent = this.getIndent(indentLevel);
    const data = node.data.messageData;

    lines.push(`${indent}richCard ${node.id}:`);

    if (data?.contentMessage?.richCard?.standaloneCard) {
      const card = data.contentMessage.richCard.standaloneCard;

      if (card.cardContent) {
        if (card.cardContent.title) {
          lines.push(`${indent}  title: "${this.escapeString(card.cardContent.title)}"`);
        }
        if (card.cardContent.description) {
          lines.push(
            `${indent}  description: "${this.escapeString(card.cardContent.description)}"`,
          );
        }
      }

      if (card.cardOrientation) {
        lines.push(`${indent}  orientation: ${card.cardOrientation}`);
      }
    }

    return lines;
  }

  /**
   * Generate match block code
   */
  private generateMatchBlockCode(node: RCLNode, flow: RCLFlowModel, indentLevel: number): string[] {
    const lines: string[] = [];
    const indent = this.getIndent(indentLevel);

    lines.push(`${indent}match ${node.id}:`);

    if (node.data.matchOptions) {
      node.data.matchOptions.forEach((option) => {
        lines.push(`${indent}  case "${this.escapeString(option)}":`);

        // Find edges from this match option
        const optionEdges = flow.edges.filter(
          (e) => e.source === node.id && e.data?.label === option,
        );

        optionEdges.forEach((edge) => {
          const targetNode = flow.nodes.find((n) => n.id === edge.target);
          if (targetNode) {
            lines.push(`${indent}    -> ${targetNode.id}`);
          }
        });
      });
    }

    return lines;
  }

  /**
   * Generate transitions (edges)
   */
  private generateTransitions(edges: RCLEdge[], nodes: RCLNode[], indentLevel: number): string[] {
    const lines: string[] = [];
    const indent = this.getIndent(indentLevel);

    // Filter out edges that are already handled in match blocks
    const regularEdges = edges.filter((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      return sourceNode?.type !== 'match';
    });

    // Group edges by source
    const edgesBySource = new Map<string, RCLEdge[]>();
    regularEdges.forEach((edge) => {
      if (!edgesBySource.has(edge.source)) {
        edgesBySource.set(edge.source, []);
      }
      edgesBySource.get(edge.source)!.push(edge);
    });

    // Generate transitions
    edgesBySource.forEach((edges, sourceId) => {
      edges.forEach((edge) => {
        if (edge.data?.condition) {
          lines.push(`${indent}${edge.source} -> ${edge.target} when ${edge.data.condition}`);
        } else if (edge.data?.trigger) {
          lines.push(`${indent}${edge.source} -> ${edge.target} on ${edge.data.trigger}`);
        } else {
          lines.push(`${indent}${edge.source} -> ${edge.target}`);
        }
      });
    });

    return lines;
  }

  /**
   * Generate code for a single node update from property form data
   */
  generateNodeUpdate(node: RCLNode, formData: PropertyFormData): string {
    const updatedNode = { ...node };
    updatedNode.data.label = formData.label;

    // Update the node data based on form data
    if (formData.messageType) {
      updatedNode.data.messageData = this.createMessageDataFromForm(formData);
    }

    // Generate the code for just this node
    const nodeCode = this.generateNodeCode(updatedNode, 0);
    if (Array.isArray(nodeCode)) {
      return nodeCode.join('\n');
    }
    return nodeCode;
  }

  /**
   * Create message data structure from form data
   */
  private createMessageDataFromForm(formData: PropertyFormData): any {
    const messageData: any = {
      messageTrafficType: formData.messageTrafficType,
      contentMessage: {},
    };

    switch (formData.messageType) {
      case 'text':
        messageData.contentMessage.text = formData.text;
        break;

      case 'richCard':
        messageData.contentMessage.richCard = {
          standaloneCard: {
            cardOrientation: formData.cardOrientation,
            cardContent: {
              title: formData.cardTitle,
              description: formData.cardDescription,
            },
          },
        };
        break;

      case 'carousel':
        messageData.contentMessage.richCard = {
          carouselCard: {
            cardWidth: formData.cardWidth,
            cardContents: [],
          },
        };
        break;
    }

    // Add suggestions
    if (formData.suggestions && formData.suggestions.length > 0) {
      messageData.contentMessage.suggestions = formData.suggestions.map((s: any) => {
        if (s.type === 'reply') {
          return {
            reply: {
              text: s.text,
              postbackData: s.postbackData,
            },
          };
        } else {
          const action: any = {
            text: s.text,
            postbackData: s.postbackData,
          };

          // Add specific action type
          switch (s.actionType) {
            case 'openUrl':
              action.openUrlAction = s.actionData || { url: '' };
              break;
            case 'dial':
              action.dialAction = s.actionData || { phoneNumber: '' };
              break;
            // ... other action types
          }

          return { action };
        }
      });
    }

    return messageData;
  }

  /**
   * Helper to generate indentation
   */
  private getIndent(level: number): string {
    return ' '.repeat(level * this.indentSize);
  }

  /**
   * Escape string for RCL output
   */
  private escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }
}
