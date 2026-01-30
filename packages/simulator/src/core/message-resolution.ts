/**
 * Message Resolution Service
 * Resolves message IDs to AgentContentMessage from multiple sources
 */

import type { AgentContentMessage } from '@rcs-lang/types'
import type { RCXBundle, RCXMessagesCollection } from '@rcs-lang/rcx'

/** Options for creating a MessageResolutionService */
export interface MessageResolutionOptions {
  /** RCX bundle containing messages */
  bundle?: RCXBundle
  /** Standalone messages collection */
  messages?: Record<string, AgentContentMessage>
}

/**
 * Service to resolve message IDs to their content from various sources.
 *
 * Resolution priority:
 * 1. RCX bundle messages collection
 * 2. Standalone messages map
 * 3. Legacy embedded format in CSM state metadata (handled by caller)
 */
export class MessageResolutionService {
  private bundleMessages: RCXMessagesCollection | null = null
  private standaloneMessages: Record<string, AgentContentMessage> = {}

  constructor(options: MessageResolutionOptions = {}) {
    if (options.bundle) {
      this.loadFromBundle(options.bundle)
    }
    if (options.messages) {
      this.loadFromCollection(options.messages)
    }
  }

  /**
   * Load messages from an RCX bundle
   */
  loadFromBundle(bundle: RCXBundle): void {
    this.bundleMessages = bundle.messages ?? null
  }

  /**
   * Load messages from a standalone collection
   */
  loadFromCollection(messages: Record<string, AgentContentMessage>): void {
    this.standaloneMessages = { ...messages }
  }

  /**
   * Clear all loaded messages
   */
  clear(): void {
    this.bundleMessages = null
    this.standaloneMessages = {}
  }

  /**
   * Resolve a message ID to its content
   *
   * @param messageId - The message ID to resolve
   * @returns The message content, or undefined if not found
   */
  resolveMessage(messageId: string): AgentContentMessage | undefined {
    // Priority 1: Bundle messages
    if (this.bundleMessages?.messages?.[messageId]) {
      const rcxMessage = this.bundleMessages.messages[messageId]
      // RCXMessage extends AgentContentMessage, so we can return it directly
      // but we strip the rcxExtensions for the simulator
      const { rcxExtensions, ...contentMessage } = rcxMessage as any
      return contentMessage as AgentContentMessage
    }

    // Priority 2: Standalone messages
    if (this.standaloneMessages[messageId]) {
      return this.standaloneMessages[messageId]
    }

    return undefined
  }

  /**
   * Check if a message exists in any source
   */
  hasMessage(messageId: string): boolean {
    return this.resolveMessage(messageId) !== undefined
  }

  /**
   * Get all available message IDs
   */
  getMessageIds(): string[] {
    const ids = new Set<string>()

    if (this.bundleMessages?.messages) {
      for (const id of Object.keys(this.bundleMessages.messages)) {
        ids.add(id)
      }
    }

    for (const id of Object.keys(this.standaloneMessages)) {
      ids.add(id)
    }

    return Array.from(ids)
  }

  /**
   * Get the count of available messages
   */
  getMessageCount(): number {
    return this.getMessageIds().length
  }
}

/**
 * Create a message resolver function from the service
 * This is useful for passing to components that expect a function
 */
export function createMessageResolver(
  options: MessageResolutionOptions
): (messageId: string) => AgentContentMessage | undefined {
  const service = new MessageResolutionService(options)
  return (messageId: string) => service.resolveMessage(messageId)
}
