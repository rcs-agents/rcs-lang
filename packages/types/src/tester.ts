/**
 * @module Tester Types
 * @description Types for RCS Business Messaging Testers
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.testers}
 */
import type { PhoneNumber } from './common.js';

/**
 * Tester invitation status
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.testers#invitationstatus}
 * @category Tester Types
 */
export type InvitationStatus =
  | 'INVITATION_STATUS_UNSPECIFIED'
  | 'INVITED'
  | 'FINALIZED';

/**
 * RBM agent tester configuration
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/phones.testers#tester}
 * @category Tester Types
 */
export interface Tester {
  /**
   * Phone number of the tester in E.164 format
   * @example "+1234567890"
   */
  phoneNumber: PhoneNumber;
  
  /**
   * Current invitation status
   */
  invitationStatus: InvitationStatus;
}