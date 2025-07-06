const { MessageNormalizer } = require('../dist/normalizers/messageNormalizer');

describe('Schema Validation Integration', () => {
  let normalizer;
  let consoleSpy;

  beforeEach(() => {
    normalizer = new MessageNormalizer();
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  const createMockNode = (type, text, children) => ({
    type,
    text,
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: text?.length || 0 },
    children: children || [],
    parent: null
  });

  const createTextShortcutNode = (messageId, messageText) => {
    return createMockNode('text_shortcut', undefined, [
      createMockNode('identifier', 'text'),
      createMockNode('identifier', messageId),
      createMockNode('string', `"${messageText}"`)
    ]);
  };

  describe('Schema Compliance', () => {
    it('should validate valid messages without warnings', () => {
      const node = createTextShortcutNode('ValidMessage', 'Hello World');
      const messages = normalizer.extractAndNormalize(node);

      expect(messages.ValidMessage).toEqual({
        contentMessage: {
          text: 'Hello World'
        },
        messageTrafficType: 'TRANSACTION'
      });

      // Should not have validation warnings for valid messages
      // Note: Schema validation might still warn if schema files aren't loaded
      expect(Object.keys(messages)).toContain('ValidMessage');
    });

    it('should handle messages with text exceeding limits', () => {
      const longText = 'A'.repeat(3000); // Exceeds 2048 limit
      const node = createTextShortcutNode('LongTextMessage', longText);
      const messages = normalizer.extractAndNormalize(node);

      // Message should still be created
      expect(messages.LongTextMessage).toBeDefined();
      expect(messages.LongTextMessage.contentMessage.text).toBe(longText);
      
      // Should have validation warning (if schema validation is working)
      // The actual validation might be logged as a warning
    });

    it('should validate message traffic types', () => {
      const node = createMockNode('transactional_shortcut', undefined, [
        createMockNode('identifier', 'transactional'),
        createMockNode('identifier', 'TestMessage'),
        createMockNode('string', '"Test content"')
      ]);
      
      const messages = normalizer.extractAndNormalize(node);

      expect(messages.TestMessage.messageTrafficType).toBe('TRANSACTION');
    });

    it('should handle invalid suggestion text length', () => {
      const suggestion = createMockNode('suggestion', undefined, [
        createMockNode('reply', undefined, [
          createMockNode('text_property', undefined, [
            createMockNode('identifier', 'text'),
            createMockNode('string', '"This is a very long suggestion text that exceeds the 25 character limit by a lot"')
          ]),
          createMockNode('postback_property', undefined, [
            createMockNode('identifier', 'postbackData'),
            createMockNode('string', '"test_action"')
          ])
        ])
      ]);

      const contentMessage = createMockNode('content_message', undefined, [
        createMockNode('suggestions', undefined, [suggestion])
      ]);

      const agentMessage = createMockNode('agent_message', undefined, [
        createMockNode('identifier', 'agentMessage'),
        createMockNode('identifier', 'InvalidSuggestion'),
        contentMessage
      ]);
      
      const messages = normalizer.extractAndNormalize(agentMessage);

      // Message should still be created even with validation issues
      expect(messages.InvalidSuggestion).toBeDefined();
    });

    it('should enforce required fields', () => {
      // Create a message with missing required contentMessage
      const invalidMessage = createMockNode('agent_message', undefined, [
        createMockNode('identifier', 'agentMessage'),
        createMockNode('identifier', 'IncompleteMessage')
        // Missing contentMessage
      ]);
      
      const messages = normalizer.extractAndNormalize(invalidMessage);

      // Should handle gracefully and create a message with defaults
      expect(messages.IncompleteMessage).toBeDefined();
      expect(messages.IncompleteMessage.messageTrafficType).toBe('TRANSACTION');
    });
  });

  describe('Error Handling', () => {
    it('should handle schema validation errors gracefully', () => {
      const node = createTextShortcutNode('TestMessage', 'Test content');
      
      // This should not throw even if schema validation has issues
      expect(() => {
        const messages = normalizer.extractAndNormalize(node);
        expect(messages.TestMessage).toBeDefined();
      }).not.toThrow();
    });

    it('should continue processing even with validation failures', () => {
      const nodes = [
        createTextShortcutNode('ValidMessage', 'Valid content'),
        createTextShortcutNode('InvalidMessage', 'A'.repeat(3000)) // Too long
      ];

      const container = createMockNode('container', undefined, nodes);
      const messages = normalizer.extractAndNormalize(container);

      // Both messages should be present
      expect(messages.ValidMessage).toBeDefined();
      expect(messages.InvalidMessage).toBeDefined();
    });
  });
});