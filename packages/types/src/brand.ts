/**
 * @module Brand Types
 * @description Types for RCS Business Messaging Brand
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands#Brand}
 */

/**
 * Campaign type for brand questionnaire
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands#questionnairecampaigntype}
 * @category Brand Types
 */
export type QuestionnaireCampaignType = 'SERVICE' | 'TRANSACTIONAL' | 'PROMOTIONAL' | 'OTP';

/**
 * Brand questionnaire information
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands#questionnaireinformation}
 * @category Brand Types
 */
export interface QuestionnaireInformation {
  /**
   * When the questionnaire was submitted
   */
  requestTime: string;
  
  /**
   * Whether the brand is publicly traded
   */
  isUploadedPublicly: boolean;
  
  /**
   * Primary agent serving this brand
   */
  agentFirstServed: string;
  
  /**
   * Primary campaign type
   */
  campaignType: QuestionnaireCampaignType;
  
  /**
   * Secondary campaign type
   */
  optionalCampaignType?: QuestionnaireCampaignType;
  
  /**
   * Description of campaign messaging
   */
  campaignDescription: string;
  
  /**
   * Whether the brand operates in multiple business verticals
   */
  hasMultipleBusinessVerticals: boolean;
  
  /**
   * Business verticals the agent operates in
   */
  agentBusinessVerticals: string[];
  
  /**
   * Example messages the agent will send
   */
  exampleMessages: string[];
  
  /**
   * Additional websites associated with the brand
   */
  additionalWebsites: string[];
  
  /**
   * Whether there's an age requirement for the audience
   */
  ageRequirementForAudience: boolean;
  
  /**
   * Phone number options for the brand
   */
  phoneNumberOptions: string[];
  
  /**
   * Regions where the brand operates
   */
  regions: string[];
  
  /**
   * Compliance information
   */
  compliance: string;
}

/**
 * Brand state
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands#brandstate}
 * @category Brand Types
 */
export type BrandState =
  | 'BRAND_STATE_UNSPECIFIED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DELETED'
  | 'CANCELLED';

/**
 * RCS Business Messaging Brand
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands#Brand}
 * @category Brand Types
 */
export interface Brand {
  /**
   * Resource name
   * Format: brands/{brand_id}
   */
  name: string;
  
  /**
   * Display name of the brand
   */
  displayName: string;
  
  /**
   * Brand questionnaire information
   */
  questionnaire?: QuestionnaireInformation;
  
  /**
   * Current state of the brand
   */
  state: BrandState;
}