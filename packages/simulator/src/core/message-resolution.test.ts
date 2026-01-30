/**
 * Tests for MessageResolutionService
 */

import { describe, it, expect } from 'bun:test'
import { MessageResolutionService, createMessageResolver } from './message-resolution.js'
import type { AgentContentMessage } from '@rcs-lang/types'
import type { RCXBundle, RCXMessagesCollection, RCXMessage } from '@rcs-lang/rcx'

describe('MessageResolutionService', () => {
  const mockMessage1: AgentContentMessage = {
    text: 'Hello, world!',
  }

  const mockMessage2: AgentContentMessage = {
    text: 'Welcome to RCS!',
  }

  const mockRcxMessage: RCXMessage = {
    text: 'This is an RCX message',
    rcxExtensions: {
      metadata: {
        id: 'msg3',
        name: 'Test RCX Message',
      },
    },
  }

  describe('constructor', () => {
    it('should create empty service with no options', () => {
      const service = new MessageResolutionService()
      expect(service.getMessageCount()).toBe(0)
    })

    it('should load standalone messages from options', () => {
      const messages = {
        msg1: mockMessage1,
      }
      const service = new MessageResolutionService({ messages })
      expect(service.getMessageCount()).toBe(1)
      expect(service.hasMessage('msg1')).toBe(true)
    })

    it('should load messages from bundle in options', () => {
      const messagesCollection: RCXMessagesCollection = {
        messages: {
          msg3: mockRcxMessage,
        },
      }

      const bundle: Partial<RCXBundle> = {
        messages: messagesCollection,
      }

      const service = new MessageResolutionService({ bundle: bundle as RCXBundle })
      expect(service.getMessageCount()).toBe(1)
      expect(service.hasMessage('msg3')).toBe(true)
    })
  })

  describe('loadFromCollection', () => {
    it('should load messages from a collection', () => {
      const service = new MessageResolutionService()
      const messages = {
        msg1: mockMessage1,
        msg2: mockMessage2,
      }

      service.loadFromCollection(messages)
      expect(service.getMessageCount()).toBe(2)
    })

    it('should replace existing standalone messages', () => {
      const service = new MessageResolutionService({ messages: { msg1: mockMessage1 } })
      const newMessages = { msg2: mockMessage2 }

      service.loadFromCollection(newMessages)
      expect(service.hasMessage('msg1')).toBe(false)
      expect(service.hasMessage('msg2')).toBe(true)
    })
  })

  describe('loadFromBundle', () => {
    it('should load messages from bundle', () => {
      const service = new MessageResolutionService()
      const messagesCollection: RCXMessagesCollection = {
        messages: {
          msg3: mockRcxMessage,
        },
      }

      const bundle: Partial<RCXBundle> = {
        messages: messagesCollection,
      }

      service.loadFromBundle(bundle as RCXBundle)
      expect(service.hasMessage('msg3')).toBe(true)
    })

    it('should handle bundle without messages', () => {
      const service = new MessageResolutionService()
      const bundle: Partial<RCXBundle> = {}

      service.loadFromBundle(bundle as RCXBundle)
      expect(service.getMessageCount()).toBe(0)
    })
  })

  describe('resolveMessage', () => {
    it('should resolve from bundle messages (priority 1)', () => {
      const messagesCollection: RCXMessagesCollection = {
        messages: {
          msg1: mockRcxMessage,
        },
      }

      const bundle: Partial<RCXBundle> = {
        messages: messagesCollection,
      }

      const service = new MessageResolutionService({
        bundle: bundle as RCXBundle,
        messages: { msg1: mockMessage1 }, // This should be overridden
      })

      const resolved = service.resolveMessage('msg1')
      expect(resolved).toBeDefined()
      expect(resolved?.text).toBe('This is an RCX message')
      expect((resolved as any).rcxExtensions).toBeUndefined() // Should be stripped
    })

    it('should resolve from standalone messages (priority 2)', () => {
      const service = new MessageResolutionService({
        messages: { msg1: mockMessage1 },
      })

      const resolved = service.resolveMessage('msg1')
      expect(resolved).toBeDefined()
      expect(resolved?.text).toBe('Hello, world!')
    })

    it('should return undefined for unknown message', () => {
      const service = new MessageResolutionService()
      const resolved = service.resolveMessage('unknown')
      expect(resolved).toBeUndefined()
    })

    it('should strip rcxExtensions from bundle messages', () => {
      const messagesCollection: RCXMessagesCollection = {
        messages: {
          msg3: mockRcxMessage,
        },
      }

      const bundle: Partial<RCXBundle> = {
        messages: messagesCollection,
      }

      const service = new MessageResolutionService({ bundle: bundle as RCXBundle })
      const resolved = service.resolveMessage('msg3')

      expect(resolved).toBeDefined()
      expect((resolved as any).rcxExtensions).toBeUndefined()
      expect(resolved?.text).toBe('This is an RCX message')
    })
  })

  describe('hasMessage', () => {
    it('should return true for existing message', () => {
      const service = new MessageResolutionService({
        messages: { msg1: mockMessage1 },
      })

      expect(service.hasMessage('msg1')).toBe(true)
    })

    it('should return false for non-existing message', () => {
      const service = new MessageResolutionService()
      expect(service.hasMessage('msg1')).toBe(false)
    })
  })

  describe('getMessageIds', () => {
    it('should return all message IDs from both sources', () => {
      const messagesCollection: RCXMessagesCollection = {
        messages: {
          msg3: mockRcxMessage,
        },
      }

      const bundle: Partial<RCXBundle> = {
        messages: messagesCollection,
      }

      const service = new MessageResolutionService({
        bundle: bundle as RCXBundle,
        messages: { msg1: mockMessage1, msg2: mockMessage2 },
      })

      const ids = service.getMessageIds()
      expect(ids).toHaveLength(3)
      expect(ids).toContain('msg1')
      expect(ids).toContain('msg2')
      expect(ids).toContain('msg3')
    })

    it('should deduplicate message IDs', () => {
      const messagesCollection: RCXMessagesCollection = {
        messages: {
          msg1: mockRcxMessage,
        },
      }

      const bundle: Partial<RCXBundle> = {
        messages: messagesCollection,
      }

      const service = new MessageResolutionService({
        bundle: bundle as RCXBundle,
        messages: { msg1: mockMessage1 }, // Same ID in both sources
      })

      const ids = service.getMessageIds()
      expect(ids).toHaveLength(1)
      expect(ids[0]).toBe('msg1')
    })

    it('should return empty array when no messages', () => {
      const service = new MessageResolutionService()
      expect(service.getMessageIds()).toEqual([])
    })
  })

  describe('getMessageCount', () => {
    it('should return correct count', () => {
      const service = new MessageResolutionService({
        messages: { msg1: mockMessage1, msg2: mockMessage2 },
      })

      expect(service.getMessageCount()).toBe(2)
    })

    it('should return 0 when no messages', () => {
      const service = new MessageResolutionService()
      expect(service.getMessageCount()).toBe(0)
    })

    it('should count unique IDs across sources', () => {
      const messagesCollection: RCXMessagesCollection = {
        messages: {
          msg1: mockRcxMessage,
        },
      }

      const bundle: Partial<RCXBundle> = {
        messages: messagesCollection,
      }

      const service = new MessageResolutionService({
        bundle: bundle as RCXBundle,
        messages: { msg1: mockMessage1, msg2: mockMessage2 },
      })

      // msg1 appears in both sources but should only be counted once
      expect(service.getMessageCount()).toBe(2)
    })
  })

  describe('clear', () => {
    it('should clear all messages', () => {
      const messagesCollection: RCXMessagesCollection = {
        messages: {
          msg3: mockRcxMessage,
        },
      }

      const bundle: Partial<RCXBundle> = {
        messages: messagesCollection,
      }

      const service = new MessageResolutionService({
        bundle: bundle as RCXBundle,
        messages: { msg1: mockMessage1 },
      })

      expect(service.getMessageCount()).toBe(2)

      service.clear()
      expect(service.getMessageCount()).toBe(0)
      expect(service.hasMessage('msg1')).toBe(false)
      expect(service.hasMessage('msg3')).toBe(false)
    })
  })
})

describe('createMessageResolver', () => {
  it('should create a resolver function', () => {
    const messages = {
      msg1: { text: 'Hello' } as AgentContentMessage,
    }

    const resolver = createMessageResolver({ messages })
    expect(typeof resolver).toBe('function')
  })

  it('should resolve messages correctly', () => {
    const messages = {
      msg1: { text: 'Hello' } as AgentContentMessage,
    }

    const resolver = createMessageResolver({ messages })
    const resolved = resolver('msg1')

    expect(resolved).toBeDefined()
    expect(resolved?.text).toBe('Hello')
  })

  it('should return undefined for unknown messages', () => {
    const resolver = createMessageResolver({})
    const resolved = resolver('unknown')

    expect(resolved).toBeUndefined()
  })
})
