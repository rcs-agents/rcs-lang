/**
 * @module User Message Types
 * @description Types for messages sent from users to RCS agents
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/UserMessage}
 */
import type { Timestamp, PhoneNumber } from './common.js';
import type { PostbackData } from './agent-message.js';

/**
 * Geographic coordinates representing a location
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/LatLng}
 * @category User Message Types
 */
export interface LatLng {
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
}

/**
 * File data sent by a user
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/UserFile}
 * @category User Message Types
 */
export interface UserFile {
  /**
   * The payload file information
   */
  payload: UserFileInfo;

  /**
   * Optional thumbnail for the file
   */
  thumbnail?: UserFileInfo;
}

/**
 * Information about a user-sent file
 * @category User Message Types
 */
export interface UserFileInfo {
  /**
   * MIME type of the file
   * @example "image/jpeg"
   * @example "video/mp4"
   */
  mimeType: string;

  /**
   * Size of the file in bytes
   */
  fileSizeBytes: number;

  /**
   * URI where the file can be downloaded
   * Only valid for a short time after the message is received
   */
  fileUri: string;

  /**
   * Name of the file
   */
  fileName: string;
}

/**
 * Type of suggestion the user responded to
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/SuggestionResponse#suggestiontype}
 * @category User Message Types
 */
export type SuggestionType =
  | 'SUGGESTION_TYPE_UNSPECIFIED'
  | 'REPLY'
  | 'ACTION';

/**
 * Response generated when a user taps a suggested reply or action
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/SuggestionResponse}
 * @category User Message Types
 */
export interface SuggestionResponse {
  /**
   * The postback data from the suggestion that was tapped
   */
  postbackData: PostbackData;

  /**
   * The text of the suggestion that was tapped
   */
  text: string;

  /**
   * The type of suggestion that was tapped
   */
  type: SuggestionType;
}

/**
 * Classification of rich messages for US billing standards
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/UserMessage#richmessageclassification}
 * @category User Message Types
 */
export interface RichMessageClassification {
  /**
   * Whether the message is classified as a rich message
   */
  isRichMessage: boolean;
}

/**
 * A message sent from a user to an agent
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/UserMessage}
 * @category User Message Types
 *
 * @example
 * ```typescript
 * // Text message from user
 * const textMessage: UserMessage = {
 *   senderPhoneNumber: '+14155551234' as PhoneNumber,
 *   messageId: 'msg-123',
 *   sendTime: '2024-01-15T10:30:00Z' as Timestamp,
 *   agentId: 'my-agent-id',
 *   text: 'Hello, I need help!'
 * };
 *
 * // Suggestion response from user
 * const suggestionMessage: UserMessage = {
 *   senderPhoneNumber: '+14155551234' as PhoneNumber,
 *   messageId: 'msg-124',
 *   sendTime: '2024-01-15T10:31:00Z' as Timestamp,
 *   agentId: 'my-agent-id',
 *   suggestionResponse: {
 *     postbackData: 'YES_CONFIRM' as PostbackData,
 *     text: 'Yes',
 *     type: 'REPLY'
 *   }
 * };
 * ```
 */
export interface UserMessage {
  /**
   * Phone number (in E.164 format) of the user that sent the message
   */
  senderPhoneNumber: PhoneNumber;

  /**
   * A unique message ID, assigned by the sending user's RCS client
   */
  messageId: string;

  /**
   * Time at which the message was sent
   */
  sendTime: Timestamp;

  /**
   * The agent's unique identifier. Set by RCS for Business
   */
  agentId: string;

  /**
   * Text content - a string created through organic user typing
   * (not from a suggested reply)
   *
   * Note: Exactly one of text, userFile, location, or suggestionResponse
   * must be set.
   * @maxLength 3072
   */
  text?: string;

  /**
   * Media file sent by the user
   *
   * Note: Exactly one of text, userFile, location, or suggestionResponse
   * must be set.
   */
  userFile?: UserFile;

  /**
   * Location shared by the user
   * Note: This is not necessarily the user's actual location
   *
   * Note: Exactly one of text, userFile, location, or suggestionResponse
   * must be set.
   */
  location?: LatLng;

  /**
   * Response generated when the user taps a suggested reply or action
   *
   * Note: Exactly one of text, userFile, location, or suggestionResponse
   * must be set.
   */
  suggestionResponse?: SuggestionResponse;

  /**
   * Classification of the message per US billing standards
   */
  richMessageClassification?: RichMessageClassification;

  /**
   * Carrier information for the user's phone number
   * Output only
   */
  carrier?: string;
}

/**
 * User event types
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/UserEvent#eventtype}
 * @category User Message Types
 */
export type UserEventType =
  | 'EVENT_TYPE_UNSPECIFIED'
  | 'DELIVERED'
  | 'READ'
  | 'IS_TYPING'
  | 'STOP_TYPING';

/**
 * An event sent from a user to an agent
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/UserEvent}
 * @category User Message Types
 */
export interface UserEvent {
  /**
   * Phone number (in E.164 format) of the user that triggered the event
   */
  senderPhoneNumber: PhoneNumber;

  /**
   * The event ID, assigned by the RCS platform
   */
  eventId: string;

  /**
   * Time at which the event was sent
   */
  sendTime: Timestamp;

  /**
   * The agent's unique identifier
   */
  agentId: string;

  /**
   * The type of event
   */
  eventType: UserEventType;

  /**
   * The message ID that this event relates to
   * Required for DELIVERED and READ events
   */
  messageId?: string;
}
