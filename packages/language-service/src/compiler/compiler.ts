import { CompiledAgent, Diagnostic, AgentData } from '../program/types';
import { ASTNode, getNodeText, findNodeByType, findNodesByType } from '@rcl/parser';

/**
 * Compiles an RCL AST into the output format
 */
export class Compiler {
  private diagnostics: Diagnostic[] = [];

  /**
   * Compile an AST into agent data
   */
  compile(ast: ASTNode, sourceContent: string, fileName?: string): CompiledAgent | null {
    this.diagnostics = [];

    try {
      const agent = this.extractAgent(ast, sourceContent);
      const messages = this.extractMessages(ast, sourceContent);
      const flows = this.extractFlows(ast, sourceContent);

      // Check for required fields
      if (!agent.name) {
        this.addError('Agent definition is missing', fileName);
        return null;
      }

      if (!agent.displayName) {
        this.addError('Agent is missing required displayName field', fileName);
        return null;
      }

      return {
        agent,
        messages,
        flows,
      };
    } catch (error) {
      this.addError(
        `Compilation failed: ${error instanceof Error ? error.message : String(error)}`,
        fileName
      );
      return null;
    }
  }

  /**
   * Get diagnostics from last compilation
   */
  getDiagnostics(): Diagnostic[] {
    return this.diagnostics;
  }

  /**
   * Extract agent data from AST
   */
  private extractAgent(ast: ASTNode, sourceContent: string): AgentData {
    const agentNode = findNodeByType(ast, 'agent_definition');
    if (!agentNode) {
      throw new Error('No agent definition found');
    }

    const agent: AgentData = {
      name: this.extractAgentName(agentNode, sourceContent),
    };

    // Extract agent properties
    const agentBody = findNodeByType(agentNode, 'agent_body');
    const propsContainer = agentBody || agentNode;
    
    if (propsContainer && propsContainer.children) {
      let i = 0;
      const children = propsContainer.children;
      
      while (i < children.length) {
        const child = children[i];
        
        // Check for property pattern: attribute_key : value
        if (child.type === 'displayName' || child.type === 'brandName') {
          const propName = child.type;
          // Next should be colon, then value
          if (i + 2 < children.length && children[i + 1].type === ':') {
            const valueNode = children[i + 2];
            const propValue = getNodeText(valueNode, sourceContent).replace(/^"|"$/g, '');
            
            switch (propName) {
              case 'displayName':
                agent.displayName = propValue;
                break;
              case 'brandName':
                agent.brandName = propValue;
                break;
            }
            i += 3; // Skip property name, colon, and value
            continue;
          }
        } else if (child.type === 'config_section') {
          agent.config = this.extractAgentConfig(child, sourceContent);
        } else if (child.type === 'defaults_section') {
          agent.defaults = this.extractAgentDefaults(child, sourceContent);
        }
        
        i++;
      }
    }

    return agent;
  }

  /**
   * Extract agent name from agent definition
   */
  private extractAgentName(agentNode: ASTNode, sourceContent: string): string {
    // Look for agent name identifier (should be the second identifier child)
    const identifiers = agentNode.children?.filter(child => child.type === 'identifier');
    if (identifiers && identifiers.length >= 2) {
      return getNodeText(identifiers[1], sourceContent);
    }
    
    // Fallback: find any identifier
    const nameNode = findNodeByType(agentNode, 'identifier');
    if (!nameNode) {
      throw new Error('Agent name not found');
    }
    return getNodeText(nameNode, sourceContent);
  }

  /**
   * Extract property name
   */
  private extractPropertyName(propNode: ASTNode, sourceContent: string): string {
    const nameNode = propNode.children?.find(
      child => child.type === 'property_name' || child.type === 'identifier'
    );
    return nameNode ? getNodeText(nameNode, sourceContent) : '';
  }

  /**
   * Extract property value
   */
  private extractPropertyValue(propNode: ASTNode, sourceContent: string): string {
    const valueNode = propNode.children?.find(
      child => child.type === 'string' || child.type === 'property_value'
    );
    if (!valueNode) return '';

    let value = getNodeText(valueNode, sourceContent);
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    return value;
  }

  /**
   * Extract agent config section
   */
  private extractAgentConfig(configNode: ASTNode, sourceContent: string): any {
    const config: any = {};

    const configBody = findNodeByType(configNode, 'agent_config_body');
    if (configBody) {
      for (const child of configBody.children || []) {
        if (child.type === 'property') {
          const propName = this.extractPropertyName(child, sourceContent);
          const propValue = this.extractPropertyValue(child, sourceContent);
          config[propName] = propValue;
        }
      }
    }

    return config;
  }

  /**
   * Extract agent defaults section
   */
  private extractAgentDefaults(defaultsNode: ASTNode, sourceContent: string): any {
    const defaults: any = {};

    const defaultsBody = findNodeByType(defaultsNode, 'agent_defaults_body');
    if (defaultsBody) {
      for (const child of defaultsBody.children || []) {
        if (child.type === 'property') {
          const propName = this.extractPropertyName(child, sourceContent);
          const propValue = this.extractPropertyValue(child, sourceContent);
          defaults[propName] = propValue;
        }
      }
    }

    return defaults;
  }

  /**
   * Extract messages from AST
   */
  private extractMessages(ast: ASTNode, sourceContent: string): Record<string, any> {
    const messages: Record<string, any> = {};
    const messagesSection = findNodeByType(ast, 'messages_section');

    if (!messagesSection) {
      // Check for standalone text shortcuts
      const textShortcuts = findNodesByType(ast, 'text_shortcut');
      for (const shortcut of textShortcuts) {
        const message = this.extractTextShortcut(shortcut, sourceContent);
        if (message) {
          messages[message.id] = message.content;
        }
      }
      return messages;
    }

    // Look for message definitions
    const messageDefinitions = findNodesByType(messagesSection, 'message_definition');
    for (const msgDef of messageDefinitions) {
      const message = this.extractMessage(msgDef, sourceContent);
      if (message) {
        messages[message.id] = message.content;
      }
    }

    // Also look for text shortcuts in messages section
    const textShortcuts = findNodesByType(messagesSection, 'text_shortcut');
    for (const shortcut of textShortcuts) {
      const message = this.extractTextShortcut(shortcut, sourceContent);
      if (message) {
        messages[message.id] = message.content;
      }
    }

    return messages;
  }

  /**
   * Extract a single message definition
   */
  private extractMessage(msgNode: ASTNode, sourceContent: string): { id: string; content: any } | null {
    const idNode = findNodeByType(msgNode, 'identifier');
    if (!idNode) return null;

    const id = getNodeText(idNode, sourceContent);
    const messageType = msgNode.children?.find(child => 
      ['text_message', 'rich_card_message', 'carousel_message', 'file_message'].includes(child.type)
    );

    if (!messageType) return null;

    let content: any = {
      messageTrafficType: 'TRANSACTION',
    };

    switch (messageType.type) {
      case 'text_message':
        const textNode = findNodeByType(messageType, 'string');
        if (textNode) {
          let text = getNodeText(textNode, sourceContent);
          if (text.startsWith('"') && text.endsWith('"')) {
            text = text.slice(1, -1);
          }
          content.contentMessage = { text };
        }
        break;

      case 'rich_card_message':
        const titleNode = findNodeByType(messageType, 'string');
        if (titleNode) {
          let title = getNodeText(titleNode, sourceContent);
          if (title.startsWith('"') && title.endsWith('"')) {
            title = title.slice(1, -1);
          }
          content.contentMessage = {
            richCard: {
              standaloneCard: {
                cardContent: {
                  title,
                  description: '',
                },
              },
            },
          };
        }
        break;

      case 'carousel_message':
        content.contentMessage = {
          richCard: {
            carouselCard: {
              cardWidth: 'MEDIUM',
              cardContents: [],
            },
          },
        };
        break;

      case 'file_message':
        const urlNode = findNodeByType(messageType, 'url');
        const captionNode = findNodeByType(messageType, 'string');
        if (urlNode && captionNode) {
          const url = getNodeText(urlNode, sourceContent).replace(/<url\s+(.+)>/, '$1');
          let caption = getNodeText(captionNode, sourceContent);
          if (caption.startsWith('"') && caption.endsWith('"')) {
            caption = caption.slice(1, -1);
          }
          content.contentMessage = {
            uploadedRbmFile: {
              fileName: caption,
              fileUri: url,
              thumbnailUri: url,
            },
          };
        }
        break;
    }

    return { id, content };
  }

  /**
   * Extract text shortcut message
   */
  private extractTextShortcut(shortcutNode: ASTNode, sourceContent: string): { id: string; content: any } | null {
    // Find the identifier and content nodes
    const idNode = shortcutNode.children?.find(child => child.type === 'identifier');
    const textNode = shortcutNode.children?.find(child => child.type === 'string' || child.type === 'multiline_string' || child.type === 'embedded_code');

    if (!idNode || !textNode) return null;

    const id = getNodeText(idNode, sourceContent);
    let text = getNodeText(textNode, sourceContent);
    
    // Remove quotes
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, -1);
    }

    return {
      id,
      content: {
        contentMessage: { text },
        messageTrafficType: 'TRANSACTION',
      },
    };
  }

  /**
   * Extract flows from AST
   */
  private extractFlows(ast: ASTNode, sourceContent: string): Record<string, any> {
    const flows: Record<string, any> = {};
    
    // Try flow_definition first (real parser)
    let flowDefinitions = findNodesByType(ast, 'flow_definition');
    
    // If no flow_definition, try flow_section
    if (flowDefinitions.length === 0) {
      flowDefinitions = findNodesByType(ast, 'flow_section');
    }

    for (const flowDef of flowDefinitions) {
      const flow = this.extractFlow(flowDef, sourceContent);
      if (flow) {
        flows[flow.id] = flow;
      }
    }

    return flows;
  }

  /**
   * Extract a single flow definition
   */
  private extractFlow(flowNode: ASTNode, sourceContent: string): any | null {
    // For flow_section nodes, skip the first identifier which is "flow"
    const identifiers = findNodesByType(flowNode, 'identifier');
    const idNode = identifiers.find(node => getNodeText(node, sourceContent) !== 'flow');
    
    if (!idNode) return null;

    const id = getNodeText(idNode, sourceContent);
    const flow: any = {
      id,
      initial: 'start',
      states: {
        start: { on: {} },
        end: { type: 'final' },
      },
    };

    // Extract transitions - try both transition and flow_rule
    let transitions = findNodesByType(flowNode, 'transition');
    if (transitions.length === 0) {
      transitions = findNodesByType(flowNode, 'flow_rule');
    }

    for (const transition of transitions) {
      const { from, to } = this.extractTransition(transition, sourceContent);
      if (from && to) {
        if (!flow.states[from]) {
          flow.states[from] = { on: {} };
        }
        flow.states[from].on.NEXT = to;

        if (!flow.states[to]) {
          flow.states[to] = { on: {} };
        }
      }
    }

    return flow;
  }

  /**
   * Extract transition from -> to
   */
  private extractTransition(transitionNode: ASTNode, sourceContent: string): { from: string; to: string } {
    // For flow_rule nodes, look for identifiers and flow_state_ref
    const children = transitionNode.children || [];
    
    // Find source and target states
    let from = '';
    let to = '';
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === 'identifier' || child.type === 'flow_state_ref') {
        const text = getNodeText(child, sourceContent);
        if (!from) {
          from = text;
        } else if (!to) {
          to = text;
        }
      }
    }
    
    return { from, to };
  }

  /**
   * Add an error diagnostic
   */
  private addError(message: string, file?: string): void {
    this.diagnostics.push({
      message,
      severity: 'error',
      file,
    });
  }
}