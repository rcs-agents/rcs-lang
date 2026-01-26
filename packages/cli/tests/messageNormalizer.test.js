const { MessageNormalizer } = require('../dist/normalizers/messageNormalizer');

describe('MessageNormalizer', () => {
  let normalizer;

  beforeEach(() => {
    normalizer = new MessageNormalizer();
  });

  // Test utility to create mock nodes
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

  describe('Text Shortcuts', () => {
    it('should extract simple text shortcuts', () => {
      const node = createTextShortcutNode('Welcome', 'Hello World');
      const messages = normalizer.extractAndNormalize(node);

      expect(messages).toHaveProperty('Welcome');
      expect(messages.Welcome).toEqual({
        contentMessage: {
          text: 'Hello World'
        },
        messageTrafficType: 'TRANSACTION'
      });
    });

    it('should handle empty text gracefully', () => {
      const node = createTextShortcutNode('Empty', '');
      const messages = normalizer.extractAndNormalize(node);

      expect(messages.Empty.contentMessage.text).toBe('');
    });
  });

  describe('Agent Messages', () => {
    it('should extract basic agent messages', () => {
      const contentMessage = createMockNode('content_message', undefined, [
        createMockNode('text_property', undefined, [
          createMockNode('identifier', 'text'),
          createMockNode('string', '"Basic message content"')
        ])
      ]);
      const agentMessage = createMockNode('agent_message', undefined, [
        createMockNode('identifier', 'agentMessage'),
        createMockNode('identifier', 'BasicMessage'),
        contentMessage
      ]);
      
      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(messages).toHaveProperty('BasicMessage');
      expect(messages.BasicMessage.messageTrafficType).toBe('TRANSACTION');
    });
  });

  describe('Error Handling', () => {
    it('should handle nodes without required children gracefully', () => {
      const emptyNode = createMockNode('text_shortcut');
      const messages = normalizer.extractAndNormalize(emptyNode);

      expect(Object.keys(messages)).toHaveLength(0);
    });

    it('should handle null or undefined nodes', () => {
      expect(() => normalizer.extractAndNormalize(null)).not.toThrow();
      expect(() => normalizer.extractAndNormalize(undefined)).not.toThrow();
    });
  });

  describe('String Cleaning', () => {
    it('should remove quotes from string values', () => {
      const node = createTextShortcutNode('QuotedText', 'Text with "quotes"');
      const messages = normalizer.extractAndNormalize(node);

      expect(messages.QuotedText.contentMessage.text).toBe('Text with "quotes"');
    });
  });
});