/**
 * @module Agent Event Types
 * @description Types for RCS agent events
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentEvents}
 */
import type { Timestamp } from './common.js';

/**
 * Event types that can be sent by the agent
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentEvents#eventtype}
 * @category Event Types
 */
export type EventType =
  | 'EVENT_TYPE_UNSPECIFIED'
  | 'DELIVERED'
  | 'READ'
  | 'IS_TYPING'
  | 'STOP_TYPING';

/**
 * An event sent from the agent to a user
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.agentEvents}
 * @category Event Types
 */
export interface AgentEvent {
  /**
   * Resource name (output only)
   * Format: phones/{phone}/agentEvents/{event_id}
   */
  name?: string;
  
  /**
   * Type of event being sent
   */
  eventType: EventType;
  
  /**
   * Message ID for READ events
   * Required when eventType is READ
   */
  messageId: string;
  
  /**
   * When the event was sent (output only)
   */
  sendTime?: Timestamp;
}