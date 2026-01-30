/**
 * @module Agent Bundle Types
 * @description Types for bundling agent runtime data
 *
 * AgentBundle provides a minimal runtime data structure containing
 * agent configuration and messages. This is the foundation for both
 * simple runtime usage and the full RCXBundle deployment format.
 */

import type { RcsBusinessMessagingAgent } from './agent-config.js';
import type { AgentContentMessage } from './agent-message.js';

/**
 * Collection of messages keyed by ID
 * @category Bundle Types
 */
export interface MessagesCollection {
  /** Map of message IDs to their definitions */
  messages: Record<string, AgentContentMessage>;
}

/**
 * Agent runtime bundle - contains everything needed to configure
 * and display messages for an RCS agent.
 *
 * This is the minimal bundle for runtime use. For full deployment
 * with CSM, diagrams, and assets, use RCXBundle from @rcs-lang/rcx.
 *
 * @example
 * ```typescript
 * import type { AgentBundle } from '@rcs-lang/types';
 *
 * const bundle: AgentBundle = {
 *   agent: {
 *     description: 'My RCS Agent',
 *     logoUri: 'https://example.com/logo.png',
 *     // ... other agent config
 *   },
 *   messages: {
 *     messages: {
 *       welcome: { text: 'Hello!' },
 *       goodbye: { text: 'Goodbye!' }
 *     }
 *   }
 * };
 * ```
 *
 * @category Bundle Types
 */
export interface AgentBundle {
  /** Agent configuration and branding */
  agent: RcsBusinessMessagingAgent;
  /** Message definitions keyed by ID */
  messages: MessagesCollection;
}

/**
 * Message extracted from RCL source for preview mode.
 * Used when compilation fails but we can still extract message content
 * from the AST for display purposes.
 *
 * @example
 * ```typescript
 * import type { ExtractedMessage } from '@rcs-lang/types';
 *
 * const message: ExtractedMessage = {
 *   id: 'welcome',
 *   content: { text: 'Hello, world!' },
 *   order: 0,
 *   location: { line: 5, column: 1 }
 * };
 * ```
 *
 * @category Bundle Types
 */
export interface ExtractedMessage {
  /** Message identifier */
  id: string;
  /** The message content */
  content: AgentContentMessage;
  /** Order in which this message appears in the source */
  order: number;
  /** Source location for error reporting */
  location?: { line: number; column: number };
}

/**
 * Result of message extraction from AST
 * @category Bundle Types
 */
export interface ExtractionResult {
  /** Successfully extracted messages */
  messages: ExtractedMessage[];
  /** Errors encountered during extraction */
  errors: string[];
}
