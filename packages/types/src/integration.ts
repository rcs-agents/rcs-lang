/**
 * @module Integration Types
 * @description Types for RCS agent integrations
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents.integrations}
 */

/**
 * Type of integration with external services
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents.integrations#integrationtype}
 * @category Integration Types
 */
export type IntegrationType =
  | 'INTEGRATION_TYPE_UNSPECIFIED'
  | 'DIALOGFLOW_ES'
  | 'DIALOGFLOW_CX';

/**
 * Dialogflow ES (Essential) integration configuration
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents.integrations#dialogflowesintegration}
 * @category Integration Types
 */
export interface DialogflowEsIntegration {
  /**
   * Google Cloud project ID containing the Dialogflow agent
   */
  projectId: string;
  
  /**
   * Dialogflow agent ID
   */
  agentId?: string;
  
  /**
   * Dialogflow environment name
   * @example "draft"
   * @example "production"
   */
  environment?: string;
}

/**
 * Dialogflow CX integration configuration
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents.integrations#dialogflowcxintegration}
 * @category Integration Types
 */
export interface DialogflowCxIntegration {
  /**
   * Google Cloud project ID containing the Dialogflow CX agent
   */
  projectId: string;
  
  /**
   * Dialogflow CX agent ID
   */
  agentId: string;
  
  /**
   * Dialogflow CX environment name
   */
  environment?: string;
  
  /**
   * Google Cloud region where the agent is deployed
   * @example "us-central1"
   * @example "europe-west1"
   */
  region?: string;
}

/**
 * Agent integration with external services
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents.integrations#integration}
 * @category Integration Types
 */
export interface Integration {
  /**
   * Resource name (output only)
   * Format: brands/{brand_id}/agents/{agent_id}/integrations/{integration_id}
   */
  name?: string;
  
  /**
   * Type of integration
   */
  integrationType: IntegrationType;
  
  /**
   * Dialogflow ES integration details
   * Set when integrationType is DIALOGFLOW_ES
   */
  dialogflowEsIntegration?: DialogflowEsIntegration;
  
  /**
   * Dialogflow CX integration details
   * Set when integrationType is DIALOGFLOW_CX
   */
  dialogflowCxIntegration?: DialogflowCxIntegration;
  
  /**
   * When the integration was created (output only)
   */
  createTime?: string;
  
  /**
   * When the integration was last updated (output only)
   */
  updateTime?: string;
}