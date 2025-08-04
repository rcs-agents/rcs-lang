/**
 * @module Agent Message Types
 * @description Types for RCS agent messages
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages}
 */
import type { Timestamp, Duration, Url } from './common.js';

/**
 * Message traffic types categorize the purpose of messages
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#messagetraffictype}
 * @category Message Types
 */
export type MessageTrafficType =
  | 'MESSAGE_TRAFFIC_TYPE_UNSPECIFIED'
  | 'AUTHENTICATION'
  | 'TRANSACTION'
  | 'PROMOTION'
  | 'SERVICEREQUEST'
  | 'ACKNOWLEDGEMENT';

/**
 * Postback data passed to the agent when a user interacts with suggestions
 * @maxLength 2048
 * @category Message Types
 */
export type PostbackData = string & { __brand: 'PostbackData' };

/**
 * A suggested reply that the user can tap to send
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#suggestedreply}
 * @category Message Types
 */
export interface SuggestedReply {
  /**
   * The text shown to the user and sent when tapped
   * @maxLength 25
   */
  text: string;
  
  /**
   * Arbitrary data passed to the agent when the user taps the suggestion
   */
  postbackData: PostbackData;
}

/**
 * Opens the user's default dialer app with the specified phone number
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#dialaction}
 * @category Action Types
 */
export interface DialAction {
  /**
   * The phone number to dial
   * @example "+1234567890"
   */
  phoneNumber: string;
}

/**
 * Opens the user's default map app with the specified location
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#viewlocationaction}
 * @category Action Types
 */
export type ViewLocationAction =
  | {
      /**
       * The latitude and longitude of the location
       * If provided, the query field is ignored
       */
      latLong: {
        /**
         * Latitude in degrees
         * @minimum -90
         * @maximum 90
         */
        latitude: number;
        /**
         * Longitude in degrees
         * @minimum -180
         * @maximum 180
         */
        longitude: number;
      };
      /**
       * Optional label for the map marker
       */
      label?: string;
    }
  | {
      /**
       * A query to search for a location
       * Ignored if latLong is provided
       * @example "Googleplex, Mountain View, CA"
       */
      query: string;
      /**
       * Optional label for the map marker
       */
      label?: string;
    };

/**
 * Opens the user's default calendar app with an event populated with the specified details
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#createcalendareventaction}
 * @category Action Types
 */
export interface CreateCalendarEventAction {
  /**
   * Event start time in RFC3339 UTC "Zulu" format
   * @example "2014-10-02T15:01:23Z"
   */
  startTime: Timestamp;
  
  /**
   * Event end time in RFC3339 UTC "Zulu" format
   * @example "2014-10-02T16:01:23Z"
   */
  endTime: Timestamp;
  
  /**
   * Title of the event
   * @maxLength 100
   */
  title: string;
  
  /**
   * Description of the event
   * @maxLength 1000
   */
  description: string;
}

/**
 * Opens the specified URL in an in-app browser or the user's default browser
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#openurlaction}
 * @category Action Types
 */
export interface OpenUrlAction {
  /**
   * The URL to open
   * @maxLength 2048
   */
  url: Url;
}

/**
 * Prompts the user to share their location
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#sharelocationaction}
 * @category Action Types
 */
export interface ShareLocationAction {}

/**
 * A suggested action that the user can tap
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#suggestedaction}
 * @category Message Types
 */
export interface SuggestedAction {
  /**
   * Text shown to the user
   * @maxLength 25
   */
  text: string;
  
  /**
   * Arbitrary data passed to the agent when the user taps the action
   */
  postbackData: PostbackData;
  
  /**
   * Optional URL opened when the action isn't supported by the RCS client
   */
  fallbackUrl?: Url;
  
  /**
   * Optional dial action
   */
  dialAction?: DialAction;
  
  /**
   * Optional view location action
   */
  viewLocationAction?: ViewLocationAction;
  
  /**
   * Optional create calendar event action
   */
  createCalendarEventAction?: CreateCalendarEventAction;
  
  /**
   * Optional open URL action
   */
  openUrlAction?: OpenUrlAction;
  
  /**
   * Optional share location action
   */
  shareLocationAction?: ShareLocationAction;
}

/**
 * A suggestion that the user can tap (reply or action)
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#suggestion}
 * @category Message Types
 */
export type Suggestion =
  | { reply: SuggestedReply }
  | { action: SuggestedAction };

/**
 * Represents an RBM file that the agent previously uploaded
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#uploadedrbmfile}
 * @category Message Types
 */
export interface UploadedRbmFile {
  /**
   * The name of the RBM file
   */
  fileName: string;
  
  /**
   * Optional URL for the thumbnail of the file
   */
  thumbnailUrl?: Url;
  
  /**
   * Optional name of the RBM thumbnail file
   * If provided, RBM hosts the thumbnail and ignores thumbnailUrl
   */
  thumbnailName?: string;
}

/**
 * Information about a file to be displayed, hosted at a public URL
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#contentinfo}
 * @category Message Types
 */
export interface ContentInfo {
  /**
   * The public URL of the file
   * @maxLength 2048
   */
  fileUrl: Url;
  
  /**
   * Optional public URL of the thumbnail
   * If not provided, RBM attempts to generate a thumbnail
   * @maxLength 2048
   */
  thumbnailUrl?: Url;
  
  /**
   * Whether to refetch URLs even if previously cached
   * @default false
   */
  forceRefresh?: boolean;
  
  /**
   * Description of the file for accessibility
   * @maxLength 100
   */
  altText?: string;
}

/**
 * Height options for media in rich cards
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#height}
 * @category Message Types
 */
export type MediaHeight = 'HEIGHT_UNSPECIFIED' | 'SHORT' | 'MEDIUM' | 'TALL';

/**
 * Media (image, GIF, or video) to display in a rich card
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#media}
 * @category Message Types
 */
export interface Media {
  /**
   * The height of the media
   */
  height: MediaHeight;
  
  /**
   * RBM-uploaded file
   */
  file?: UploadedRbmFile;
  
  /**
   * File hosted at a public URL
   */
  contentInfo?: ContentInfo;
}

/**
 * Content of a rich card
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#cardcontent}
 * @category Message Types
 */
export interface CardContent {
  /**
   * Title of the card
   * @maxLength 200
   */
  title?: string;
  
  /**
   * Description of the card
   * @maxLength 2000
   */
  description?: string;
  
  /**
   * Media to display
   */
  media?: Media;
  
  /**
   * Suggested replies and actions (max 4)
   * @maxItems 4
   */
  suggestions?: Suggestion[];
}

/**
 * Orientation options for standalone cards
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#cardorientation}
 * @category Message Types
 */
export type CardOrientation = 'CARD_ORIENTATION_UNSPECIFIED' | 'HORIZONTAL' | 'VERTICAL';

/**
 * Thumbnail alignment for horizontal standalone cards
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#thumbnailimagealignment}
 * @category Message Types
 */
export type ThumbnailImageAlignment = 'THUMBNAIL_IMAGE_ALIGNMENT_UNSPECIFIED' | 'LEFT' | 'RIGHT';

/**
 * A standalone rich card
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#standalonecard}
 * @category Message Types
 */
export interface StandaloneCard {
  /**
   * Orientation of the card
   */
  cardOrientation: CardOrientation;
  
  /**
   * Image preview alignment for horizontal cards
   */
  thumbnailImageAlignment?: ThumbnailImageAlignment;
  
  /**
   * Content of the card
   */
  cardContent: CardContent;
}

/**
 * Width options for carousel cards
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#cardwidth}
 * @category Message Types
 */
export type CardWidth = 'CARD_WIDTH_UNSPECIFIED' | 'SMALL' | 'MEDIUM';

/**
 * A carousel of rich cards
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#carouselcard}
 * @category Message Types
 */
export interface CarouselCard {
  /**
   * Width of the cards in the carousel
   */
  cardWidth: CardWidth;
  
  /**
   * List of cards (2-10 cards)
   * All cards must have the same media.height
   * @minItems 2
   * @maxItems 10
   */
  cardContents: CardContent[];
}

/**
 * A rich card (standalone or carousel)
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#richcard}
 * @category Message Types
 */
export type RichCard =
  | { carouselCard: CarouselCard }
  | { standaloneCard: StandaloneCard };

/**
 * Content of a message sent from the agent to a user
 * Only one of: text, uploadedRbmFile, richCard, or contentInfo can be set
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages#agentcontentmessage}
 * @category Message Types
 */
export interface AgentContentMessage {
  /**
   * UTF-8 encoded text
   * @maxLength 3072
   */
  text?: string;
  
  /**
   * RBM-uploaded file
   */
  uploadedRbmFile?: UploadedRbmFile;
  
  /**
   * Rich card
   */
  richCard?: RichCard;
  
  /**
   * File hosted at a public URL
   */
  contentInfo?: ContentInfo;
  
  /**
   * Suggested replies and actions (max 11)
   * @maxItems 11
   */
  suggestions?: Suggestion[];
}

/**
 * A message sent from the agent to a user
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentMessages}
 * @category Message Types
 */
export interface AgentMessage {
  /**
   * Resource name (output only)
   * Format: phones/{phone}/agentMessages/{message_id}
   */
  name?: string;
  
  /**
   * Send time (output only)
   */
  sendTime?: Timestamp;
  
  /**
   * Content of the message
   */
  contentMessage: AgentContentMessage;
  
  /**
   * Traffic type classification
   */
  messageTrafficType: MessageTrafficType;
  
  /**
   * Expiration time (either expireTime or ttl can be set)
   */
  expireTime?: Timestamp;
  
  /**
   * Time to live (either expireTime or ttl can be set)
   */
  ttl?: Duration;
}