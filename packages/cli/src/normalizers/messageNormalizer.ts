import { RCLNode } from '@rcl/parser';

export interface AgentMessage {
  contentMessage: AgentContentMessage;
  messageTrafficType: MessageTrafficType;
  expireTime?: string;
  ttl?: string;
}

export interface AgentContentMessage {
  text?: string;
  suggestions?: Suggestion[];
  uploadedRbmFile?: UploadedRbmFile;
  richCard?: RichCard;
  contentInfo?: ContentInfo;
}

export type MessageTrafficType = 
  | 'MESSAGE_TRAFFIC_TYPE_UNSPECIFIED'
  | 'AUTHENTICATION'
  | 'TRANSACTION' 
  | 'PROMOTION'
  | 'SERVICEREQUEST'
  | 'ACKNOWLEDGEMENT';

export interface Suggestion {
  reply?: SuggestedReply;
  action?: SuggestedAction;
}

export interface SuggestedReply {
  text: string;
  postbackData: string;
}

export interface SuggestedAction {
  text: string;
  postbackData: string;
  fallbackUrl?: string;
  dialAction?: DialAction;
  viewLocationAction?: ViewLocationAction;
  createCalendarEventAction?: CreateCalendarEventAction;
  openUrlAction?: OpenUrlAction;
  shareLocationAction?: ShareLocationAction;
}

export interface DialAction {
  phoneNumber: string;
}

export interface ViewLocationAction {
  label?: string;
  latLong?: { latitude: number; longitude: number };
  query?: string;
}

export interface CreateCalendarEventAction {
  startTime: string;
  endTime: string;
  title: string;
  description: string;
}

export interface OpenUrlAction {
  url: string;
}

export interface ShareLocationAction {}

export interface UploadedRbmFile {
  fileName: string;
  thumbnailUrl?: string;
  thumbnailName?: string;
}

export interface RichCard {
  carouselCard?: CarouselCard;
  standaloneCard?: StandaloneCard;
}

export interface CarouselCard {
  cardWidth: 'CARD_WIDTH_UNSPECIFIED' | 'SMALL' | 'MEDIUM';
  cardContents: CardContent[];
}

export interface StandaloneCard {
  cardOrientation: 'CARD_ORIENTATION_UNSPECIFIED' | 'HORIZONTAL' | 'VERTICAL';
  thumbnailImageAlignment?: 'THUMBNAIL_IMAGE_ALIGNMENT_UNSPECIFIED' | 'LEFT' | 'RIGHT';
  cardContent: CardContent;
}

export interface CardContent {
  title?: string;
  description?: string;
  media?: Media;
  suggestions?: Suggestion[];
}

export interface Media {
  height: 'HEIGHT_UNSPECIFIED' | 'SHORT' | 'MEDIUM' | 'TALL';
  file?: UploadedRbmFile;
  contentInfo?: ContentInfo;
}

export interface ContentInfo {
  fileUrl: string;
  thumbnailUrl?: string;
  forceRefresh?: boolean;
  altText?: string;
}

export class MessageNormalizer {
  extractAndNormalize(ast: RCLNode | null | undefined): Record<string, AgentMessage> {
    if (!ast) {
      return {};
    }

    const messages: Record<string, AgentMessage> = {};
    
    this.traverseAST(ast, (node) => {
      // Handle message shortcuts (text shortcut format)
      if (node.type === 'text_shortcut') {
        const messageId = this.extractMessageId(node);
        const messageText = this.extractMessageText(node);
        const trafficType = this.extractTrafficType(node);
        const suggestions = this.extractSuggestions(node);
        
        if (messageId) {
          messages[messageId] = {
            contentMessage: {
              text: messageText || '',
              suggestions: suggestions.length > 0 ? suggestions : undefined
            },
            messageTrafficType: trafficType
          };
        }
      }
      
      // Handle transactional shortcuts
      if (node.type === 'transactional_shortcut') {
        const messageId = this.extractMessageId(node);
        const messageText = this.extractMessageText(node);
        const suggestions = this.extractSuggestions(node);
        
        if (messageId) {
          messages[messageId] = {
            contentMessage: {
              text: messageText || '',
              suggestions: suggestions.length > 0 ? suggestions : undefined
            },
            messageTrafficType: 'TRANSACTION'
          };
        }
      }
      
      // Handle full agent messages
      if (node.type === 'agent_message') {
        const messageId = this.extractAgentMessageId(node);
        const normalizedMessage = this.normalizeAgentMessage(node);
        
        if (messageId && normalizedMessage) {
          messages[messageId] = normalizedMessage;
        }
      }
    });
    
    return messages;
  }

  private traverseAST(node: RCLNode | null | undefined, callback: (node: RCLNode) => void): void {
    if (!node) {
      return;
    }
    
    callback(node);
    if (node.children) {
      node.children.forEach(child => this.traverseAST(child, callback));
    }
  }

  private extractMessageId(node: RCLNode): string | null {
    // For text shortcuts, the ID is usually the second identifier
    if (node.children && node.children.length >= 2) {
      const idNode = node.children[1];
      if (idNode && idNode.type === 'identifier') {
        return idNode.text || null;
      }
    }
    return null;
  }

  private extractMessageText(node: RCLNode): string | null {
    // Look for string or enhanced_simple_value nodes
    for (const child of node.children || []) {
      if (child.type === 'string' || child.type === 'enhanced_simple_value') {
        return this.cleanStringValue(child.text || '');
      }
    }
    return null;
  }

  private extractTrafficType(node: RCLNode): MessageTrafficType {
    // Look for traffic type in parent or preceding nodes
    // Default to TRANSACTION for now
    const parent = node.parent;
    if (parent && parent.children) {
      for (const sibling of parent.children) {
        if (sibling.text === 'transactional') {
          return 'TRANSACTION';
        }
        if (sibling.text === 'promotional') {
          return 'PROMOTION';
        }
      }
    }
    return 'TRANSACTION';
  }

  private extractSuggestions(node: RCLNode): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    this.traverseAST(node, (child) => {
      if (child.type === 'reply_shortcut') {
        const reply = this.parseReplyShortcut(child);
        if (reply) {
          suggestions.push({ reply });
        }
      }
      
      if (child.type === 'dial_shortcut') {
        const action = this.parseDialShortcut(child);
        if (action) {
          suggestions.push({ action });
        }
      }
      
      if (child.type === 'open_url_shortcut') {
        const action = this.parseOpenUrlShortcut(child);
        if (action) {
          suggestions.push({ action });
        }
      }
      
      // Add more suggestion types as needed
    });
    
    return suggestions;
  }

  private parseReplyShortcut(node: RCLNode): SuggestedReply | null {
    if (node.children && node.children.length >= 2) {
      const text = this.cleanStringValue(node.children[1]?.text || '');
      const postbackData = this.generatePostbackData(text, 'reply');
      
      if (text) {
        return {
          text: text.substring(0, 25), // Max 25 characters
          postbackData
        };
      }
    }
    return null;
  }

  private parseDialShortcut(node: RCLNode): SuggestedAction | null {
    if (node.children && node.children.length >= 3) {
      const text = this.cleanStringValue(node.children[1]?.text || '');
      const phoneNumber = this.cleanStringValue(node.children[2]?.text || '');
      
      if (text && phoneNumber) {
        return {
          text: text.substring(0, 25),
          postbackData: this.generatePostbackData(text, 'dial'),
          dialAction: { phoneNumber }
        };
      }
    }
    return null;
  }

  private parseOpenUrlShortcut(node: RCLNode): SuggestedAction | null {
    if (node.children && node.children.length >= 3) {
      const text = this.cleanStringValue(node.children[1]?.text || '');
      const url = this.cleanStringValue(node.children[2]?.text || '');
      
      if (text && url) {
        return {
          text: text.substring(0, 25),
          postbackData: this.generatePostbackData(text, 'openUrl'),
          openUrlAction: { url }
        };
      }
    }
    return null;
  }

  private extractAgentMessageId(node: RCLNode): string | null {
    // Extract ID from agentMessage node - skip first identifier (agentMessage keyword)
    if (node.children && node.children.length >= 2) {
      const idNode = node.children[1];
      if (idNode && idNode.type === 'identifier') {
        return idNode.text || null;
      }
    }
    return null;
  }

  private normalizeAgentMessage(node: RCLNode): AgentMessage | null {
    // Parse full agent message structure
    let messageTrafficType: MessageTrafficType = 'TRANSACTION';
    let contentMessage: AgentContentMessage = {};
    let ttl: string | undefined;
    let expireTime: string | undefined;

    this.traverseAST(node, (child) => {
      if (child.type === 'atom' && child.text) {
        const atomValue = child.text.replace(':', '');
        if (['AUTHENTICATION', 'TRANSACTION', 'PROMOTION', 'SERVICEREQUEST', 'ACKNOWLEDGEMENT'].includes(atomValue)) {
          messageTrafficType = atomValue as MessageTrafficType;
        }
      }
      
      if (child.type === 'string' && child.parent?.text?.includes('ttl')) {
        ttl = this.cleanStringValue(child.text || '');
      }
      
      if (child.type === 'string' && child.parent?.text?.includes('expireTime')) {
        expireTime = this.cleanStringValue(child.text || '');
      }
      
      if (child.type === 'content_message') {
        contentMessage = this.parseContentMessage(child);
      }
    });

    return {
      contentMessage,
      messageTrafficType,
      ...(ttl && { ttl }),
      ...(expireTime && { expireTime })
    };
  }

  private parseContentMessage(node: RCLNode): AgentContentMessage {
    const contentMessage: AgentContentMessage = {};
    
    this.traverseAST(node, (child) => {
      if (child.type === 'string' && child.parent?.text?.includes('text')) {
        contentMessage.text = this.cleanStringValue(child.text || '');
      }
      
      // Add parsing for rich cards, files, etc. as needed
    });
    
    return contentMessage;
  }

  private cleanStringValue(value: string): string {
    // Remove quotes and clean up string values
    return value.replace(/^["']|["']$/g, '').trim();
  }

  private generatePostbackData(text: string, actionType: string): string {
    // Generate postback data for suggestions
    const data = {
      action: actionType,
      text: text,
      timestamp: Date.now()
    };
    return JSON.stringify(data).substring(0, 2048); // Max 2048 characters
  }
}