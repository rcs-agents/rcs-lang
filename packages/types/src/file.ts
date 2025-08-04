/**
 * @module File Types
 * @description Types for RCS file operations
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/files/create}
 */
import type { Url } from './common.js';

/**
 * RBM file resource
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/files#rbmfile}
 * @category File Types
 */
export interface RbmFile {
  /**
   * Resource name (output only)
   * Format: files/{file_id}
   */
  name?: string;
  
  /**
   * File identifier (output only)
   */
  id?: string;
}

/**
 * Request to upload a file from a public URL
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference/rest/v1/files/create}
 * @category File Types
 */
export interface FileUploadRequest {
  /**
   * Public URL of the file to upload
   * Must be accessible without authentication
   */
  fileUri: Url;
}