// Simplified schema validator without external dependencies

// Import schema types
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

export interface AgentConfig {
  displayName?: string;
  logoUri?: string;
  rcsBusinessMessaging?: RcsBusinessMessaging;
}

export interface RcsBusinessMessaging {
  rbmAgent?: RbmAgent;
}

export interface RbmAgent {
  testContacts?: TestContact[];
}

export interface TestContact {
  contact?: Contact;
}

export interface Contact {
  displayName?: string;
  phoneNumber?: string;
  contactId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Schema validator for RCL message and agent configurations
 * Simplified implementation without external dependencies
 */
export class SchemaValidator {
  constructor() {
    // Simple constructor, no external dependencies
  }

  /**
   * Validate an AgentMessage against basic schema rules
   */
  validateAgentMessage(message: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Check required fields
    if (!message || typeof message !== 'object') {
      errors.push({ field: 'message', message: 'Message must be an object' });
      return { valid: false, errors };
    }

    if (!message.contentMessage) {
      errors.push({ field: 'contentMessage', message: 'contentMessage is required' });
    }

    if (!message.messageTrafficType) {
      errors.push({ field: 'messageTrafficType', message: 'messageTrafficType is required' });
    } else {
      const validTypes = [
        'MESSAGE_TRAFFIC_TYPE_UNSPECIFIED',
        'AUTHENTICATION',
        'TRANSACTION',
        'PROMOTION',
        'SERVICEREQUEST',
        'ACKNOWLEDGEMENT'
      ];
      if (!validTypes.includes(message.messageTrafficType)) {
        errors.push({ 
          field: 'messageTrafficType', 
          message: `Invalid message traffic type: ${message.messageTrafficType}`,
          value: message.messageTrafficType
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate an AgentConfig against basic schema rules
   */
  validateAgentConfig(config: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!config || typeof config !== 'object') {
      errors.push({ field: 'config', message: 'Config must be an object' });
      return { valid: false, errors };
    }

    // AgentConfig validation is mostly optional fields, so basic structure check is sufficient
    return { valid: true, errors: [] };
  }

  /**
   * Validate message content constraints
   */
  validateMessageConstraints(message: AgentMessage): ValidationResult {
    const errors: ValidationError[] = [];

    // Check text length
    if (message.contentMessage.text && message.contentMessage.text.length > 2048) {
      errors.push({
        field: 'contentMessage.text',
        message: 'Text content exceeds 2048 character limit',
        value: message.contentMessage.text.length
      });
    }

    // Check suggestions count
    if (message.contentMessage.suggestions && message.contentMessage.suggestions.length > 11) {
      errors.push({
        field: 'contentMessage.suggestions',
        message: 'Maximum 11 suggestions allowed',
        value: message.contentMessage.suggestions.length
      });
    }

    // Check suggestion text length
    if (message.contentMessage.suggestions) {
      message.contentMessage.suggestions.forEach((suggestion, index) => {
        const suggestionText = suggestion.reply?.text || suggestion.action?.text;
        if (suggestionText && suggestionText.length > 25) {
          errors.push({
            field: `contentMessage.suggestions[${index}].${suggestion.reply ? 'reply' : 'action'}.text`,
            message: 'Suggestion text exceeds 25 character limit',
            value: suggestionText.length
          });
        }

        const postbackData = suggestion.reply?.postbackData || suggestion.action?.postbackData;
        if (postbackData && postbackData.length > 2048) {
          errors.push({
            field: `contentMessage.suggestions[${index}].${suggestion.reply ? 'reply' : 'action'}.postbackData`,
            message: 'Postback data exceeds 2048 character limit',
            value: postbackData.length
          });
        }
      });
    }

    // Check mutually exclusive content types
    const contentTypes = [
      message.contentMessage.text ? 'text' : null,
      message.contentMessage.richCard ? 'richCard' : null,
      message.contentMessage.uploadedRbmFile ? 'uploadedRbmFile' : null,
      message.contentMessage.contentInfo ? 'contentInfo' : null
    ].filter(Boolean);

    if (contentTypes.length > 1) {
      errors.push({
        field: 'contentMessage',
        message: `Only one content type allowed, found: ${contentTypes.join(', ')}`,
        value: contentTypes
      });
    }

    if (contentTypes.length === 0) {
      errors.push({
        field: 'contentMessage',
        message: 'At least one content type required (text, richCard, uploadedRbmFile, or contentInfo)'
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate rich card constraints
   */
  validateRichCardConstraints(richCard: RichCard): ValidationResult {
    const errors: ValidationError[] = [];

    if (richCard.carouselCard) {
      // Carousel card validation
      if (richCard.carouselCard.cardContents.length < 2) {
        errors.push({
          field: 'carouselCard.cardContents',
          message: 'Carousel cards require minimum 2 cards',
          value: richCard.carouselCard.cardContents.length
        });
      }

      if (richCard.carouselCard.cardContents.length > 10) {
        errors.push({
          field: 'carouselCard.cardContents',
          message: 'Carousel cards allow maximum 10 cards',
          value: richCard.carouselCard.cardContents.length
        });
      }

      // Check that all cards have the same media height
      const mediaHeights = richCard.carouselCard.cardContents
        .map(card => card.media?.height)
        .filter(Boolean);
      
      if (mediaHeights.length > 1 && new Set(mediaHeights).size > 1) {
        errors.push({
          field: 'carouselCard.cardContents',
          message: 'All cards in a carousel must have the same media height',
          value: mediaHeights
        });
      }
    }

    if (richCard.standaloneCard) {
      // Standalone card validation
      const cardContent = richCard.standaloneCard.cardContent;
      
      if (richCard.standaloneCard.cardOrientation === 'HORIZONTAL' && cardContent.media) {
        // Horizontal cards with media require at least one of: title, description, or suggestions
        const hasRequiredContent = !!(cardContent.title || cardContent.description || cardContent.suggestions?.length);
        if (!hasRequiredContent) {
          errors.push({
            field: 'standaloneCard.cardContent',
            message: 'Horizontal cards with media require title, description, or suggestions',
            value: cardContent
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export a singleton instance
export const schemaValidator = new SchemaValidator();