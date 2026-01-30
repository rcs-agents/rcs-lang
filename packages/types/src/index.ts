/**
 * @packageDocumentation
 * @module @rcs-lang/types
 * 
 * TypeScript types for RCS Business Messaging (RBM) based on Google's official API reference.
 * 
 * @remarks
 * This package provides comprehensive TypeScript type definitions for working with RCS Business Messaging APIs.
 * All types are derived from the official Google RBM API documentation to ensure accuracy and completeness.
 * 
 * @example
 * ```typescript
 * import type { AgentMessage, RcsBusinessMessagingAgent } from '@rcs-lang/types';
 * 
 * const message: AgentMessage = {
 *   contentMessage: {
 *     text: 'Hello from RCS!',
 *     suggestions: [
 *       {
 *         reply: {
 *           text: 'Yes',
 *           postbackData: 'USER_SAID_YES'
 *         }
 *       }
 *     ]
 *   },
 *   messageTrafficType: 'TRANSACTION'
 * };
 * ```
 * 
 * @see {@link https://developers.google.com/business-communications/rcs-business-messaging/reference | Google RBM API Reference}
 */

// Export all types
export * from './common.js';
export * from './agent-message.js';
export * from './agent-config.js';
export * from './brand.js';
export * from './tester.js';
export * from './agent-event.js';
export * from './user-message.js';
export * from './file.js';
export * from './integration.js';
export * from './agent-bundle.js';