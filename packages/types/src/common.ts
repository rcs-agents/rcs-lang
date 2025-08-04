/**
 * @module Common Types
 * @description Common types used across RCS Business Messaging APIs
 */

/**
 * Phone number in E.164 format
 * @example "+1234567890"
 * @see {@link https://en.wikipedia.org/wiki/E.164}
 * @category Common Types
 */
export type PhoneNumber = string & { __brand: 'PhoneNumber' };

/**
 * Email address
 * @example "user@example.com"
 * @category Common Types
 */
export type EmailAddress = string & { __brand: 'EmailAddress' };

/**
 * URL string
 * @example "https://example.com"
 * @category Common Types
 */
export type Url = string & { __brand: 'Url' };

/**
 * Hexadecimal color code
 * @example "#FF0000"
 * @pattern ^#[0-9A-Fa-f]{6}$
 * @category Common Types
 */
export type HexColor = string & { __brand: 'HexColor' };

/**
 * Timestamp in RFC 3339 format
 * @example "2014-10-02T15:01:23Z"
 * @example "2014-10-02T15:01:23.045123456Z"
 * @example "2014-10-02T15:01:23+05:30"
 * @see {@link https://tools.ietf.org/html/rfc3339}
 * @category Common Types
 */
export type Timestamp = string & { __brand: 'Timestamp' };

/**
 * Duration in seconds with optional fractional digits
 * @example "3.5s"
 * @example "120s"
 * @pattern ^\d+(\.\d{1,9})?s$
 * @category Common Types
 */
export type Duration = string & { __brand: 'Duration' };

/**
 * Phone number entry with optional label
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents#phoneentry}
 * @category Common Types
 */
export interface PhoneEntry {
  /**
   * Phone number in E.164 format
   */
  phoneNumber: PhoneNumber;
  
  /**
   * Optional label for the phone number
   * @example "Customer Support"
   * @example "Sales"
   */
  label?: string;
}

/**
 * Email entry with optional label
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents#emailentry}
 * @category Common Types
 */
export interface EmailEntry {
  /**
   * Email address
   */
  address: EmailAddress;
  
  /**
   * Optional label for the email address
   * @example "Support"
   * @example "Sales Team"
   */
  label?: string;
}

/**
 * Web entry with URL and optional label
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/business-communications/rest/v1/brands.agents#webentry}
 * @category Common Types
 */
export interface WebEntry {
  /**
   * URL of the website
   */
  uri: Url;
  
  /**
   * Optional label for the URL
   * @example "Main Website"
   * @example "Support Portal"
   */
  label?: string;
}