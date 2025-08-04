/**
 * @module Agent Configuration Types
 * @description Types for RCS Business Messaging Agent configuration
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents}
 */
import type { PhoneEntry, EmailEntry, WebEntry, HexColor, Url } from './common.js';

/**
 * Agent use case categorization
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents#agentusecase}
 * @category Agent Types
 */
export type AgentUseCase = 'TRANSACTIONAL' | 'PROMOTIONAL' | 'OTP' | 'MULTI_USE';

/**
 * Geographic region where the agent is hosted
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents#hostingregion}
 * @category Agent Types
 */
export type HostingRegion = 'NORTH_AMERICA' | 'EUROPE' | 'ASIA_PACIFIC';

/**
 * Billing category for agent messages
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents#billingcategory}
 * @category Agent Types
 */
export type BillingCategory = 'CONVERSATIONAL' | 'SINGLE_MESSAGE' | 'BASIC_MESSAGE';

/**
 * Billing configuration for the agent
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents#rcsbusinessmessagingagentbillingconfig}
 * @category Agent Types
 */
export interface RcsBusinessMessagingAgentBillingConfig {
  /**
   * The billing category
   */
  billingCategory: BillingCategory;
}

/**
 * Partner information (output only)
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents#partnerentry}
 * @category Agent Types
 */
export interface PartnerEntry {
  /**
   * Brand identifier
   */
  brandId: string;
  
  /**
   * Partner identifier
   */
  partnerId: string;
  
  /**
   * Partner name
   */
  partnerName: string;
}

/**
 * Agent launch state
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents#launchstate}
 * @category Agent Types
 */
export type LaunchState =
  | 'LAUNCH_STATE_UNSPECIFIED'
  | 'UNLAUNCHED'
  | 'LAUNCHED'
  | 'LAUNCH_FAILED'
  | 'SUSPENDED'
  | 'EXPIRED';

/**
 * Launch details for a specific region
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents#launchdetails}
 * @category Agent Types
 */
export interface LaunchDetails {
  /**
   * The launch state
   */
  launchState: LaunchState;
  
  /**
   * When the agent was launched
   */
  launchTime?: string;
  
  /**
   * Additional comments about the launch
   */
  comment?: string;
}

/**
 * RCS Business Messaging Agent configuration
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents}
 * @category Agent Types
 */
export interface RcsBusinessMessagingAgent {
  /**
   * Resource name (output only)
   * Format: brands/{brand_id}/agents/{agent_id}
   */
  name?: string;
  
  /**
   * Display name (output only)
   */
  displayName?: string;
  
  /**
   * Agent description shown to users
   * @maxLength 100
   */
  description: string;
  
  /**
   * Logo image URL (max 50 KB)
   * Must be PNG or JPEG
   */
  logoUri: Url;
  
  /**
   * Hero image URL (max 200 KB)
   * Must be PNG or JPEG
   * Recommended: 1024x1024 pixels
   */
  heroUri: Url;
  
  /**
   * Phone numbers associated with the agent
   */
  phoneNumbers: PhoneEntry[];
  
  /**
   * Email addresses associated with the agent
   */
  emails: EmailEntry[];
  
  /**
   * Websites associated with the agent (max 3)
   * @maxItems 3
   */
  websites?: WebEntry[];
  
  /**
   * Privacy policy link
   */
  privacy: WebEntry;
  
  /**
   * Terms and conditions link
   */
  termsConditions: WebEntry;
  
  /**
   * Primary color for the agent's theme
   * @example "#0000FF"
   */
  color: HexColor;
  
  /**
   * Billing configuration
   */
  billingConfig: RcsBusinessMessagingAgentBillingConfig;
  
  /**
   * Primary use case for the agent
   */
  agentUseCase?: AgentUseCase;
  
  /**
   * Geographic region where the agent is hosted
   */
  hostingRegion: HostingRegion;
  
  /**
   * Partner information (output only)
   */
  partner?: PartnerEntry;
  
  /**
   * Launch details by region (output only)
   * Keys are region codes
   */
  launchDetails?: Record<string, LaunchDetails>;
}