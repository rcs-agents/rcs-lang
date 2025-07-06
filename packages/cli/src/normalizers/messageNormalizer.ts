import { RCLNode, schemaValidator, ValidationResult } from '@rcl/parser';

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
          const message: AgentMessage = {
            contentMessage: {
              text: messageText || '',
              suggestions: suggestions.length > 0 ? suggestions : undefined
            },
            messageTrafficType: trafficType
          };
          
          // Validate and store the message
          this.validateAndStoreMessage(messageId, message, messages);
        }
      }
      
      // Handle transactional shortcuts
      if (node.type === 'transactional_shortcut') {
        const messageId = this.extractMessageId(node);
        const messageText = this.extractMessageText(node);
        const suggestions = this.extractSuggestions(node);
        
        if (messageId) {
          const message: AgentMessage = {
            contentMessage: {
              text: messageText || '',
              suggestions: suggestions.length > 0 ? suggestions : undefined
            },
            messageTrafficType: 'TRANSACTION'
          };
          
          // Validate and store the message
          this.validateAndStoreMessage(messageId, message, messages);
        }
      }
      
      // Handle full agent messages
      if (node.type === 'agent_message') {
        const messageId = this.extractAgentMessageId(node);
        const normalizedMessage = this.normalizeAgentMessage(node);
        
        if (messageId && normalizedMessage) {
          // Validate and store the message
          this.validateAndStoreMessage(messageId, normalizedMessage, messages);
        }
      }
    });
    
    return messages;
  }

  /**
   * Validate a message against the schema and store it if valid
   */
  private validateAndStoreMessage(
    messageId: string, 
    message: AgentMessage, 
    messages: Record<string, AgentMessage>
  ): void {
    try {
      // Basic validation using the schema validator
      const validationResult = schemaValidator.validateAgentMessage(message);
      
      if (!validationResult.valid) {
        console.warn(`Message ${messageId} failed schema validation:`, validationResult.errors);
        // Store anyway but log warnings for development
      }

      // Additional constraint validation
      const constraintResult = schemaValidator.validateMessageConstraints(message);
      if (!constraintResult.valid) {
        console.warn(`Message ${messageId} failed constraint validation:`, constraintResult.errors);
      }

      // Store the message (even if validation failed, for debugging)
      messages[messageId] = message;
    } catch (error) {
      console.warn(`Error validating message ${messageId}:`, error);
      // Store the message anyway to prevent breaking compilation
      messages[messageId] = message;
    }
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
    let hasContent = false;
    
    this.traverseAST(node, (child) => {
      // Parse text content (only if no other content type is present)
      if (!hasContent && (child.type === 'text_property' || (child.type === 'string' && child.parent?.text?.includes('text')))) {
        const textValue = this.extractPropertyValue(child, 'text');
        if (textValue) {
          contentMessage.text = textValue;
          hasContent = true;
        }
      }
      
      // Parse rich cards (only if no other content type is present)
      if (!hasContent && (child.type === 'rich_card_property' || child.type === 'rich_card')) {
        const richCard = this.parseRichCard(child);
        if (richCard) {
          contentMessage.richCard = richCard;
          hasContent = true;
        }
      }
      
      // Parse content info (for file messages, only if no other content type is present)
      if (!hasContent && (child.type === 'content_info_property' || child.type === 'content_info')) {
        const contentInfo = this.parseContentInfo(child);
        if (contentInfo) {
          contentMessage.contentInfo = contentInfo;
          hasContent = true;
        }
      }
      
      // Parse suggestions at content message level (can coexist with content)
      if (child.type === 'suggestions_property' || child.type === 'suggestions') {
        const suggestions = this.parseSuggestions(child);
        if (suggestions.length > 0) {
          contentMessage.suggestions = suggestions;
        }
      }
    });
    
    return contentMessage;
  }

  /**
   * Parse rich card structures (standalone or carousel)
   */
  private parseRichCard(node: RCLNode): RichCard | null {
    const richCard: RichCard = {};
    
    this.traverseAST(node, (child) => {
      // Parse standalone card
      if (child.type === 'standalone_card_property' || child.type === 'standalone_card') {
        const standaloneCard = this.parseStandaloneCard(child);
        if (standaloneCard) {
          richCard.standaloneCard = standaloneCard;
        }
      }
      
      // Parse carousel card
      if (child.type === 'carousel_card_property' || child.type === 'carousel_card') {
        const carouselCard = this.parseCarouselCard(child);
        if (carouselCard) {
          richCard.carouselCard = carouselCard;
        }
      }
    });
    
    return Object.keys(richCard).length > 0 ? richCard : null;
  }

  /**
   * Parse standalone card
   */
  private parseStandaloneCard(node: RCLNode): StandaloneCard | null {
    const standaloneCard: StandaloneCard = {
      cardOrientation: 'CARD_ORIENTATION_UNSPECIFIED',
      cardContent: {}
    };
    
    this.traverseAST(node, (child) => {
      // Parse card orientation
      if (child.type === 'card_orientation_property' || (child.type === 'atom' && child.parent?.text?.includes('cardOrientation'))) {
        const orientation = this.extractAtomValue(child, 'cardOrientation');
        if (orientation) {
          standaloneCard.cardOrientation = orientation as any;
        }
      }
      
      // Parse thumbnail image alignment
      if (child.type === 'thumbnail_image_alignment_property') {
        const alignment = this.extractAtomValue(child, 'thumbnailImageAlignment');
        if (alignment) {
          standaloneCard.thumbnailImageAlignment = alignment as any;
        }
      }
      
      // Parse card content
      if (child.type === 'card_content_property' || child.type === 'card_content') {
        const cardContent = this.parseCardContent(child);
        if (cardContent) {
          standaloneCard.cardContent = cardContent;
        }
      }
    });
    
    return standaloneCard;
  }

  /**
   * Parse carousel card
   */
  private parseCarouselCard(node: RCLNode): CarouselCard | null {
    const carouselCard: CarouselCard = {
      cardWidth: 'CARD_WIDTH_UNSPECIFIED',
      cardContents: []
    };
    
    this.traverseAST(node, (child) => {
      // Parse card width
      if (child.type === 'card_width_property' || (child.type === 'atom' && child.parent?.text?.includes('cardWidth'))) {
        const width = this.extractAtomValue(child, 'cardWidth');
        if (width) {
          carouselCard.cardWidth = width as any;
        }
      }
      
      // Parse card contents
      if (child.type === 'card_contents_property' || child.type === 'card_contents') {
        const cardContents = this.parseCardContents(child);
        carouselCard.cardContents = cardContents;
      }
    });
    
    return carouselCard;
  }

  /**
   * Parse individual card content
   */
  private parseCardContent(node: RCLNode): CardContent | null {
    const cardContent: CardContent = {};
    
    this.traverseAST(node, (child) => {
      // Parse title
      if (child.type === 'title_property') {
        const title = this.extractPropertyValue(child, 'title');
        if (title) {
          cardContent.title = title;
        }
      }
      
      // Parse description
      if (child.type === 'description_property') {
        const description = this.extractPropertyValue(child, 'description');
        if (description) {
          cardContent.description = description;
        }
      }
      
      // Parse media
      if (child.type === 'media_property' || child.type === 'media') {
        const media = this.parseMedia(child);
        if (media) {
          cardContent.media = media;
        }
      }
      
      // Parse suggestions
      if (child.type === 'suggestions_property' || child.type === 'suggestions') {
        const suggestions = this.parseSuggestions(child);
        if (suggestions.length > 0) {
          cardContent.suggestions = suggestions;
        }
      }
    });
    
    return Object.keys(cardContent).length > 0 ? cardContent : null;
  }

  /**
   * Parse multiple card contents (for carousel)
   */
  private parseCardContents(node: RCLNode): CardContent[] {
    const cardContents: CardContent[] = [];
    
    this.traverseAST(node, (child) => {
      if (child.type === 'card_content') {
        const cardContent = this.parseCardContent(child);
        if (cardContent) {
          cardContents.push(cardContent);
        }
      }
    });
    
    return cardContents;
  }

  /**
   * Parse media content
   */
  private parseMedia(node: RCLNode): Media | null {
    const media: Media = {
      height: 'HEIGHT_UNSPECIFIED'
    };
    
    this.traverseAST(node, (child) => {
      // Parse height
      if (child.type === 'height_property' || (child.type === 'atom' && child.parent?.text?.includes('height'))) {
        const height = this.extractAtomValue(child, 'height');
        if (height) {
          media.height = height as any;
        }
      }
      
      // Parse file
      if (child.type === 'file_property' || child.type === 'uploaded_rbm_file') {
        const file = this.parseUploadedRbmFile(child);
        if (file) {
          media.file = file;
        }
      }
      
      // Parse content info
      if (child.type === 'content_info_property' || child.type === 'content_info') {
        const contentInfo = this.parseContentInfo(child);
        if (contentInfo) {
          media.contentInfo = contentInfo;
        }
      }
    });
    
    return media;
  }

  /**
   * Parse content info
   */
  private parseContentInfo(node: RCLNode): ContentInfo | null {
    const contentInfo: ContentInfo = {
      fileUrl: ''
    };
    
    this.traverseAST(node, (child) => {
      // Parse file URL
      if (child.type === 'file_url_property') {
        const fileUrl = this.extractPropertyValue(child, 'fileUrl');
        if (fileUrl) {
          contentInfo.fileUrl = fileUrl;
        }
      }
      
      // Parse thumbnail URL
      if (child.type === 'thumbnail_url_property') {
        const thumbnailUrl = this.extractPropertyValue(child, 'thumbnailUrl');
        if (thumbnailUrl) {
          contentInfo.thumbnailUrl = thumbnailUrl;
        }
      }
      
      // Parse alt text
      if (child.type === 'alt_text_property') {
        const altText = this.extractPropertyValue(child, 'altText');
        if (altText) {
          contentInfo.altText = altText;
        }
      }
      
      // Parse force refresh
      if (child.type === 'force_refresh_property') {
        const forceRefresh = this.extractBooleanValue(child, 'forceRefresh');
        if (forceRefresh !== null) {
          contentInfo.forceRefresh = forceRefresh;
        }
      }
    });
    
    return contentInfo.fileUrl ? contentInfo : null;
  }

  /**
   * Parse uploaded RBM file
   */
  private parseUploadedRbmFile(node: RCLNode): UploadedRbmFile | null {
    const file: UploadedRbmFile = {
      fileName: ''
    };
    
    this.traverseAST(node, (child) => {
      // Parse file name
      if (child.type === 'file_name_property') {
        const fileName = this.extractPropertyValue(child, 'fileName');
        if (fileName) {
          file.fileName = fileName;
        }
      }
      
      // Parse thumbnail URL
      if (child.type === 'thumbnail_url_property') {
        const thumbnailUrl = this.extractPropertyValue(child, 'thumbnailUrl');
        if (thumbnailUrl) {
          file.thumbnailUrl = thumbnailUrl;
        }
      }
      
      // Parse thumbnail name
      if (child.type === 'thumbnail_name_property') {
        const thumbnailName = this.extractPropertyValue(child, 'thumbnailName');
        if (thumbnailName) {
          file.thumbnailName = thumbnailName;
        }
      }
    });
    
    return file.fileName ? file : null;
  }

  /**
   * Parse suggestions list
   */
  private parseSuggestions(node: RCLNode): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    this.traverseAST(node, (child) => {
      if (child.type === 'suggestion') {
        const suggestion = this.parseSuggestion(child);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    });
    
    return suggestions.slice(0, 11); // Max 11 suggestions
  }

  /**
   * Parse individual suggestion
   */
  private parseSuggestion(node: RCLNode): Suggestion | null {
    let suggestion: Suggestion = {};
    
    this.traverseAST(node, (child) => {
      // Parse reply suggestion
      if (child.type === 'reply') {
        const reply = this.parseReply(child);
        if (reply) {
          suggestion.reply = reply;
        }
      }
      
      // Parse action suggestion
      if (child.type === 'action') {
        const action = this.parseAction(child);
        if (action) {
          suggestion.action = action;
        }
      }
    });
    
    return Object.keys(suggestion).length > 0 ? suggestion : null;
  }

  /**
   * Parse reply suggestion
   */
  private parseReply(node: RCLNode): SuggestedReply | null {
    const reply: SuggestedReply = {
      text: '',
      postbackData: ''
    };
    
    this.traverseAST(node, (child) => {
      if (child.type === 'text_property') {
        const text = this.extractPropertyValue(child, 'text');
        if (text) {
          reply.text = text.substring(0, 25); // Max 25 characters
        }
      }
      
      if (child.type === 'postback_data_property') {
        const postbackData = this.extractPropertyValue(child, 'postbackData');
        if (postbackData) {
          reply.postbackData = postbackData.substring(0, 2048); // Max 2048 characters
        }
      }
    });
    
    // Generate postback data if not provided
    if (!reply.postbackData && reply.text) {
      reply.postbackData = this.generatePostbackData(reply.text, 'reply');
    }
    
    return reply.text ? reply : null;
  }

  /**
   * Parse action suggestion
   */
  private parseAction(node: RCLNode): SuggestedAction | null {
    const action: SuggestedAction = {
      text: '',
      postbackData: ''
    };
    
    this.traverseAST(node, (child) => {
      if (child.type === 'text_property') {
        const text = this.extractPropertyValue(child, 'text');
        if (text) {
          action.text = text.substring(0, 25); // Max 25 characters
        }
      }
      
      if (child.type === 'postback_data_property') {
        const postbackData = this.extractPropertyValue(child, 'postbackData');
        if (postbackData) {
          action.postbackData = postbackData.substring(0, 2048); // Max 2048 characters
        }
      }
      
      // Parse various action types
      if (child.type === 'open_url_action') {
        action.openUrlAction = this.parseOpenUrlAction(child);
      }
      
      if (child.type === 'dial_action') {
        action.dialAction = this.parseDialAction(child);
      }
      
      if (child.type === 'view_location_action') {
        action.viewLocationAction = this.parseViewLocationAction(child);
      }
      
      if (child.type === 'create_calendar_event_action') {
        action.createCalendarEventAction = this.parseCreateCalendarEventAction(child);
      }
      
      if (child.type === 'share_location_action') {
        action.shareLocationAction = {};
      }
    });
    
    // Generate postback data if not provided
    if (!action.postbackData && action.text) {
      action.postbackData = this.generatePostbackData(action.text, 'action');
    }
    
    return action.text ? action : null;
  }

  /**
   * Utility methods for parsing
   */
  private extractPropertyValue(node: RCLNode, propertyName: string): string | null {
    if (node.type === `${propertyName}_property`) {
      // Find string value in children
      for (const child of node.children || []) {
        if (child.type === 'string') {
          return this.cleanStringValue(child.text || '');
        }
      }
    }
    
    // Also check if this node itself is a string and the parent matches the property
    if (node.type === 'string' && node.parent?.type === `${propertyName}_property`) {
      return this.cleanStringValue(node.text || '');
    }
    
    return null;
  }

  private extractAtomValue(node: RCLNode, propertyName: string): string | null {
    if (node.type === `${propertyName}_property`) {
      // Find atom value in children
      for (const child of node.children || []) {
        if (child.type === 'atom') {
          return (child.text || '').replace(':', '');
        }
      }
    }
    
    // Also check if this node itself is an atom and the parent matches the property
    if (node.type === 'atom' && node.parent?.type === `${propertyName}_property`) {
      return (node.text || '').replace(':', '');
    }
    
    return null;
  }

  private extractBooleanValue(node: RCLNode, propertyName: string): boolean | null {
    const value = this.extractPropertyValue(node, propertyName);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
  }

  private parseOpenUrlAction(node: RCLNode): OpenUrlAction | null {
    const url = this.extractPropertyValue(node, 'url');
    return url ? { url } : null;
  }

  private parseDialAction(node: RCLNode): DialAction | null {
    const phoneNumber = this.extractPropertyValue(node, 'phoneNumber');
    return phoneNumber ? { phoneNumber } : null;
  }

  private parseViewLocationAction(node: RCLNode): ViewLocationAction | null {
    const action: ViewLocationAction = {};
    
    this.traverseAST(node, (child) => {
      if (child.type === 'label_property') {
        const label = this.extractPropertyValue(child, 'label');
        if (label) action.label = label;
      }
      
      if (child.type === 'query_property') {
        const query = this.extractPropertyValue(child, 'query');
        if (query) action.query = query;
      }
      
      // Parse latLong if present
      if (child.type === 'lat_long_property') {
        // This would need more complex parsing for latitude/longitude object
        // For now, use query as fallback
      }
    });
    
    return Object.keys(action).length > 0 ? action : null;
  }

  private parseCreateCalendarEventAction(node: RCLNode): CreateCalendarEventAction | null {
    const action: CreateCalendarEventAction = {
      startTime: '',
      endTime: '',
      title: '',
      description: ''
    };
    
    this.traverseAST(node, (child) => {
      if (child.type === 'start_time_property') {
        const startTime = this.extractPropertyValue(child, 'startTime');
        if (startTime) action.startTime = startTime;
      }
      
      if (child.type === 'end_time_property') {
        const endTime = this.extractPropertyValue(child, 'endTime');
        if (endTime) action.endTime = endTime;
      }
      
      if (child.type === 'title_property') {
        const title = this.extractPropertyValue(child, 'title');
        if (title) action.title = title;
      }
      
      if (child.type === 'description_property') {
        const description = this.extractPropertyValue(child, 'description');
        if (description) action.description = description;
      }
    });
    
    return action.startTime && action.endTime && action.title ? action : null;
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