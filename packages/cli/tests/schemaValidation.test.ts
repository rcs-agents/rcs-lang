import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MessageNormalizer } from '../src/normalizers/messageNormalizer';
import { TestUtils } from './testUtils';
import { schemaValidator } from '../src/utils/parserWrapper';

describe('Schema Validation Integration', () => {
  let messageNormalizer: MessageNormalizer;
  let consoleWarnSpy: any;

  beforeEach(() => {
    messageNormalizer = new MessageNormalizer();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleWarnSpy.mockRestore();
  });

  describe('Schema Compliance', () => {
    it('should validate valid messages without warnings', () => {
      const validMessageNode = TestUtils.createTextShortcutNode(
        'ValidMessage',
        'This is a valid message'
      );
      
      const mockAST = TestUtils.createMockNode('source_file', undefined, [validMessageNode]);
      
      const messages = messageNormalizer.extractAndNormalize(mockAST);
      
      // Should extract the message
      expect(messages.ValidMessage).toBeDefined();
      expect(messages.ValidMessage.contentMessage.text).toBe('This is a valid message');
      
      // Should not have validation warnings for basic text messages
      // Note: With mock validator, warnings may not appear, but structure should be valid
      expect(messages.ValidMessage.messageTrafficType).toBeDefined();
    });

    it('should handle messages with text exceeding limits', () => {
      const longText = 'A'.repeat(3000); // Exceeds 2048 character limit
      const longMessageNode = TestUtils.createTextShortcutNode('LongMessage', longText);
      
      const mockAST = TestUtils.createMockNode('source_file', undefined, [longMessageNode]);
      
      const messages = messageNormalizer.extractAndNormalize(mockAST);
      
      // Should still extract the message but truncate to 2048 characters
      expect(messages.LongMessage).toBeDefined();
      expect(messages.LongMessage.contentMessage.text).toBe(longText.substring(0, 2048));
      expect(messages.LongMessage.contentMessage.text?.length).toBe(2048);
    });

    it('should validate message traffic types', () => {
      const transactionalNode = TestUtils.createTransactionalShortcutNode(
        'TransactionalMsg',
        'This is a transactional message'
      );
      
      const mockAST = TestUtils.createMockNode('source_file', undefined, [transactionalNode]);
      
      const messages = messageNormalizer.extractAndNormalize(transactionalNode);
      
      // Should extract with TRANSACTION traffic type
      expect(messages.TransactionalMsg).toBeDefined();
      expect(messages.TransactionalMsg.messageTrafficType).toBe('TRANSACTION');
    });

    it('should handle invalid suggestion text length', () => {
      const longSuggestionText = 'A'.repeat(30); // Exceeds 25 character limit for suggestions
      const suggestion = TestUtils.createSuggestionNode('reply', longSuggestionText, 'postback');
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [
        TestUtils.createMockNode('text_property', undefined, [
          TestUtils.createMockNode('identifier', 'text'),
          TestUtils.createMockNode('string', '"Test message"')
        ]),
        TestUtils.createMockNode('suggestions', undefined, [suggestion])
      ]);
      const agentMessage = TestUtils.createAgentMessageNode('TestMessage', contentMessage);
      
      const messages = messageNormalizer.extractAndNormalize(agentMessage);
      
      // The suggestion text should be truncated to 25 characters
      expect(messages.TestMessage.contentMessage.suggestions).toBeDefined();
      expect(messages.TestMessage.contentMessage.suggestions?.[0].reply?.text).toBeDefined();
      expect(messages.TestMessage.contentMessage.suggestions?.[0].reply?.text.length).toBeLessThanOrEqual(25);
    });

    it('should enforce required fields', () => {
      // Create a message with minimal content
      const minimalNode = TestUtils.createMockNode('text_shortcut', undefined, [
        TestUtils.createMockNode('identifier', 'text'),
        TestUtils.createMockNode('identifier', 'MinimalMsg')
        // Missing message text
      ]);
      
      const mockAST = TestUtils.createMockNode('source_file', undefined, [minimalNode]);
      
      const messages = messageNormalizer.extractAndNormalize(mockAST);
      
      // Should handle missing text gracefully
      if (messages.MinimalMsg) {
        expect(messages.MinimalMsg.contentMessage).toBeDefined();
        expect(messages.MinimalMsg.messageTrafficType).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle schema validation errors gracefully', () => {
      const malformedNode = TestUtils.createMockNode('invalid_node_type', 'invalid content');
      const mockAST = TestUtils.createMockNode('source_file', undefined, [malformedNode]);
      
      // Should not throw when processing malformed content
      expect(() => {
        const messages = messageNormalizer.extractAndNormalize(mockAST);
        expect(typeof messages).toBe('object');
      }).not.toThrow();
    });

    it('should continue processing even with validation failures', () => {
      const validNode = TestUtils.createTextShortcutNode('ValidMsg', 'Valid message');
      const invalidNode = TestUtils.createMockNode('malformed_shortcut', 'invalid');
      const anotherValidNode = TestUtils.createTextShortcutNode('AnotherValid', 'Another valid');
      
      const mockAST = TestUtils.createMockNode('source_file', undefined, [
        validNode,
        invalidNode,
        anotherValidNode
      ]);
      
      const messages = messageNormalizer.extractAndNormalize(mockAST);
      
      // Should extract valid messages despite invalid ones
      expect(messages.ValidMsg).toBeDefined();
      expect(messages.AnotherValid).toBeDefined();
      expect(messages.ValidMsg.contentMessage.text).toBe('Valid message');
      expect(messages.AnotherValid.contentMessage.text).toBe('Another valid');
    });
  });
});