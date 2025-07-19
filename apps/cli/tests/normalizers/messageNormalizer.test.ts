import {
  AgentMessage,
  MessageNormalizer,
  MessageTrafficType,
} from '../../src/legacy/normalizers/messageNormalizer';
import { TestUtils } from '../testUtils';

// Conditional import for tree-sitter dependency
let _RCLNode: any;
let _parserAvailable = false;

try {
  ({ _RCLNode } = require('@rcs-lang/parser'));
  _parserAvailable = true;
} catch (error) {
  console.warn('Parser not available, using mock node types:', error.message);
  // Define a minimal RCLNode type for when parser is not available
  _RCLNode = class {
    type: string;
    text?: string;
    startPosition: { row: number; column: number };
    endPosition: { row: number; column: number };
    children: any[];
    parent: any;
  };
}

describe('MessageNormalizer', () => {
  let normalizer: MessageNormalizer;

  beforeEach(() => {
    normalizer = new MessageNormalizer();
  });

  describe('Text Shortcuts', () => {
    it('should extract simple text shortcuts', () => {
      const node = TestUtils.createTextShortcutNode('Welcome', 'Hello World');
      const messages = normalizer.extractAndNormalize(node);

      expect(messages).toHaveProperty('Welcome');
      expect(messages.Welcome).toEqual({
        contentMessage: {
          text: 'Hello World',
        },
        messageTrafficType: 'TRANSACTION',
      });
    });

    it('should handle text shortcuts with special characters', () => {
      const node = TestUtils.createTextShortcutNode('Special', 'Hello "World" & More!');
      const messages = normalizer.extractAndNormalize(node);

      expect(messages.Special.contentMessage.text).toBe('Hello "World" & More!');
    });

    it('should truncate text to 2048 characters', () => {
      const longText = 'A'.repeat(3000);
      const node = TestUtils.createTextShortcutNode('LongText', longText);
      const messages = normalizer.extractAndNormalize(node);

      expect(messages.LongText.contentMessage.text?.length).toBeLessThanOrEqual(2048);
    });
  });

  describe('Transactional Shortcuts', () => {
    it('should extract transactional shortcuts with correct traffic type', () => {
      const node = TestUtils.createTransactionalShortcutNode('Confirm', 'Please confirm');
      const messages = normalizer.extractAndNormalize(node);

      expect(messages).toHaveProperty('Confirm');
      expect(messages.Confirm.messageTrafficType).toBe('TRANSACTION');
      expect(messages.Confirm.contentMessage.text).toBe('Please confirm');
    });
  });

  describe('Agent Messages', () => {
    it('should extract basic agent messages', () => {
      const contentMessage = TestUtils.createContentMessageNode('Basic message content');
      const agentMessage = TestUtils.createAgentMessageNode('BasicMessage', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(messages).toHaveProperty('BasicMessage');
      expect(messages.BasicMessage.contentMessage.text).toBe('Basic message content');
      expect(messages.BasicMessage.messageTrafficType).toBe('TRANSACTION');
    });

    it('should handle different message traffic types', () => {
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [
        TestUtils.createMockNode('atom', ':PROMOTION'),
      ]);
      const agentMessage = TestUtils.createAgentMessageNode('PromoMessage', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(messages.PromoMessage.messageTrafficType).toBe('PROMOTION');
    });

    it('should extract TTL when specified', () => {
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [
        TestUtils.createMockNode('ttl_property', undefined, [
          TestUtils.createMockNode('identifier', 'ttl'),
          TestUtils.createMockNode('string', '"300s"'),
        ]),
      ]);
      const agentMessage = TestUtils.createAgentMessageNode('TTLMessage', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(messages.TTLMessage.ttl).toBe('300s');
    });
  });

  describe('Suggestions', () => {
    it('should extract reply suggestions', () => {
      const suggestion = TestUtils.createSuggestionNode('reply', 'Yes', 'confirm_yes');
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [
        TestUtils.createMockNode('suggestions', undefined, [suggestion]),
      ]);
      const agentMessage = TestUtils.createAgentMessageNode('WithSuggestions', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(messages.WithSuggestions.contentMessage.suggestions).toHaveLength(1);
      expect(messages.WithSuggestions.contentMessage.suggestions?.[0].reply).toEqual({
        text: 'Yes',
        postbackData: expect.stringContaining('confirm_yes'),
      });
    });

    it('should limit reply text to 25 characters', () => {
      const longText = 'This is a very long reply text that exceeds the limit';
      const suggestion = TestUtils.createSuggestionNode('reply', longText, 'long_reply');
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [
        TestUtils.createMockNode('suggestions', undefined, [suggestion]),
      ]);
      const agentMessage = TestUtils.createAgentMessageNode('LongReply', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(
        messages.LongReply.contentMessage.suggestions?.[0].reply?.text.length,
      ).toBeLessThanOrEqual(25);
    });

    it('should extract action suggestions with openUrlAction', () => {
      const openUrlAction = TestUtils.createMockNode('open_url_action', undefined, [
        TestUtils.createMockNode('url_property', undefined, [
          TestUtils.createMockNode('identifier', 'url'),
          TestUtils.createMockNode('string', '"https://example.com"'),
        ]),
      ]);
      const suggestion = TestUtils.createSuggestionNode(
        'action',
        'Visit',
        'visit_site',
        openUrlAction,
      );
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [
        TestUtils.createMockNode('suggestions', undefined, [suggestion]),
      ]);
      const agentMessage = TestUtils.createAgentMessageNode('WithAction', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(messages.WithAction.contentMessage.suggestions?.[0].action).toEqual({
        text: 'Visit',
        postbackData: expect.stringContaining('visit_site'),
        openUrlAction: {
          url: 'https://example.com',
        },
      });
    });

    it('should extract dial action suggestions', () => {
      const dialAction = TestUtils.createMockNode('dial_action', undefined, [
        TestUtils.createMockNode('phone_number_property', undefined, [
          TestUtils.createMockNode('identifier', 'phoneNumber'),
          TestUtils.createMockNode('string', '"+1234567890"'),
        ]),
      ]);
      const suggestion = TestUtils.createSuggestionNode(
        'action',
        'Call',
        'call_support',
        dialAction,
      );
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [
        TestUtils.createMockNode('suggestions', undefined, [suggestion]),
      ]);
      const agentMessage = TestUtils.createAgentMessageNode('WithDial', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(messages.WithDial.contentMessage.suggestions?.[0].action?.dialAction).toEqual({
        phoneNumber: '+1234567890',
      });
    });

    it('should limit suggestions to 11 items', () => {
      const suggestions = Array.from({ length: 15 }, (_, i) =>
        TestUtils.createSuggestionNode('reply', `Option ${i}`, `option_${i}`),
      );
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [
        TestUtils.createMockNode('suggestions', undefined, suggestions),
      ]);
      const agentMessage = TestUtils.createAgentMessageNode('ManySuggestions', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(messages.ManySuggestions.contentMessage.suggestions?.length).toBeLessThanOrEqual(11);
    });
  });

  describe('Rich Cards', () => {
    it('should extract standalone rich cards', () => {
      const cardContent = TestUtils.createMockNode('card_content', undefined, [
        TestUtils.createMockNode('title_property', undefined, [
          TestUtils.createMockNode('identifier', 'title'),
          TestUtils.createMockNode('string', '"Product Title"'),
        ]),
        TestUtils.createMockNode('description_property', undefined, [
          TestUtils.createMockNode('identifier', 'description'),
          TestUtils.createMockNode('string', '"Product description"'),
        ]),
      ]);

      const standaloneCard = TestUtils.createMockNode('standalone_card', undefined, [
        TestUtils.createMockNode('card_orientation', ':VERTICAL'),
        cardContent,
      ]);

      const richCard = TestUtils.createMockNode('rich_card', undefined, [standaloneCard]);
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [richCard]);
      const agentMessage = TestUtils.createAgentMessageNode('RichCardMessage', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(messages.RichCardMessage.contentMessage.richCard?.standaloneCard).toBeDefined();
      expect(
        messages.RichCardMessage.contentMessage.richCard?.standaloneCard?.cardContent.title,
      ).toBe('Product Title');
      expect(
        messages.RichCardMessage.contentMessage.richCard?.standaloneCard?.cardContent.description,
      ).toBe('Product description');
    });

    it('should extract carousel rich cards', () => {
      const cardContent1 = TestUtils.createMockNode('card_content', undefined, [
        TestUtils.createMockNode('title_property', undefined, [
          TestUtils.createMockNode('identifier', 'title'),
          TestUtils.createMockNode('string', '"Card 1"'),
        ]),
      ]);

      const cardContent2 = TestUtils.createMockNode('card_content', undefined, [
        TestUtils.createMockNode('title_property', undefined, [
          TestUtils.createMockNode('identifier', 'title'),
          TestUtils.createMockNode('string', '"Card 2"'),
        ]),
      ]);

      const carouselCard = TestUtils.createMockNode('carousel_card', undefined, [
        TestUtils.createMockNode('card_width_property', undefined, [
          TestUtils.createMockNode('atom', ':MEDIUM'),
        ]),
        TestUtils.createMockNode('card_contents', undefined, [cardContent1, cardContent2]),
      ]);

      const richCard = TestUtils.createMockNode('rich_card', undefined, [carouselCard]);
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [richCard]);
      const agentMessage = TestUtils.createAgentMessageNode('CarouselMessage', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(messages.CarouselMessage.contentMessage.richCard?.carouselCard).toBeDefined();
      expect(
        messages.CarouselMessage.contentMessage.richCard?.carouselCard?.cardContents,
      ).toHaveLength(2);
      expect(messages.CarouselMessage.contentMessage.richCard?.carouselCard?.cardWidth).toBe(
        'MEDIUM',
      );
    });

    it('should extract media from cards', () => {
      const media = TestUtils.createMockNode('media', undefined, [
        TestUtils.createMockNode('height_property', undefined, [
          TestUtils.createMockNode('atom', ':MEDIUM'),
        ]),
        TestUtils.createMockNode('content_info', undefined, [
          TestUtils.createMockNode('file_url_property', undefined, [
            TestUtils.createMockNode('identifier', 'fileUrl'),
            TestUtils.createMockNode('string', '"https://example.com/image.jpg"'),
          ]),
        ]),
      ]);

      const cardContent = TestUtils.createMockNode('card_content', undefined, [media]);
      const standaloneCard = TestUtils.createMockNode('standalone_card', undefined, [
        TestUtils.createMockNode('card_orientation', ':VERTICAL'),
        cardContent,
      ]);

      const richCard = TestUtils.createMockNode('rich_card', undefined, [standaloneCard]);
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [richCard]);
      const agentMessage = TestUtils.createAgentMessageNode('MediaMessage', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(
        messages.MediaMessage.contentMessage.richCard?.standaloneCard?.cardContent.media,
      ).toEqual({
        height: 'MEDIUM',
        contentInfo: {
          fileUrl: 'https://example.com/image.jpg',
        },
      });
    });
  });

  describe('Content Info', () => {
    it('should extract standalone content info messages', () => {
      const contentInfo = TestUtils.createMockNode('content_info', undefined, [
        TestUtils.createMockNode('file_url_property', undefined, [
          TestUtils.createMockNode('identifier', 'fileUrl'),
          TestUtils.createMockNode('string', '"https://example.com/document.pdf"'),
        ]),
        TestUtils.createMockNode('alt_text_property', undefined, [
          TestUtils.createMockNode('identifier', 'altText'),
          TestUtils.createMockNode('string', '"Important Document"'),
        ]),
      ]);

      const contentMessage = TestUtils.createMockNode('content_message', undefined, [contentInfo]);
      const agentMessage = TestUtils.createAgentMessageNode('FileMessage', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(messages.FileMessage.contentMessage.contentInfo).toEqual({
        fileUrl: 'https://example.com/document.pdf',
        altText: 'Important Document',
      });
    });
  });

  describe('Schema Compliance', () => {
    it('should generate messages that follow AgentMessage schema structure', () => {
      const node = TestUtils.createTextShortcutNode('TestMessage', 'Test content');
      const messages = normalizer.extractAndNormalize(node);

      expect(TestUtils.validateAgentMessageStructure(messages.TestMessage)).toBe(true);
    });

    it('should ensure suggestions follow schema constraints', () => {
      const suggestions = Array.from({ length: 3 }, (_, i) =>
        TestUtils.createSuggestionNode('reply', `Option ${i}`, `option_${i}`),
      );
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [
        TestUtils.createMockNode('suggestions', undefined, suggestions),
      ]);
      const agentMessage = TestUtils.createAgentMessageNode('SuggestionTest', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(
        TestUtils.validateSuggestionsStructure(
          messages.SuggestionTest.contentMessage.suggestions || [],
        ),
      ).toBe(true);
    });

    it('should handle mutually exclusive content types correctly', () => {
      // Test that we cannot have both text and richCard
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [
        TestUtils.createMockNode('text_property', undefined, [
          TestUtils.createMockNode('identifier', 'text'),
          TestUtils.createMockNode('string', '"Text content"'),
        ]),
        TestUtils.createMockNode('rich_card', undefined, []),
      ]);
      const agentMessage = TestUtils.createAgentMessageNode('InvalidMessage', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      // Should prioritize text over richCard to maintain schema compliance
      expect(messages.InvalidMessage.contentMessage.text).toBe('Text content');
      expect(messages.InvalidMessage.contentMessage.richCard).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle nodes without required children gracefully', () => {
      const emptyNode = TestUtils.createMockNode('text_shortcut');
      const messages = normalizer.extractAndNormalize(emptyNode);

      expect(Object.keys(messages)).toHaveLength(0);
    });

    it('should handle malformed suggestion nodes', () => {
      const malformedSuggestion = TestUtils.createMockNode('suggestion');
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [
        TestUtils.createMockNode('suggestions', undefined, [malformedSuggestion]),
      ]);
      const agentMessage = TestUtils.createAgentMessageNode('MalformedSuggestion', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      expect(messages.MalformedSuggestion.contentMessage.suggestions).toEqual([]);
    });

    it('should generate valid postback data for all suggestions', () => {
      const validPostbackData = JSON.stringify({ action: 'test', value: 'test_action' });
      const suggestion = TestUtils.createSuggestionNode('reply', 'Test', validPostbackData);
      const contentMessage = TestUtils.createMockNode('content_message', undefined, [
        TestUtils.createMockNode('suggestions', undefined, [suggestion]),
      ]);
      const agentMessage = TestUtils.createAgentMessageNode('PostbackTest', contentMessage);

      const messages = normalizer.extractAndNormalize(agentMessage);

      const postbackData =
        messages.PostbackTest.contentMessage.suggestions?.[0].reply?.postbackData;
      expect(postbackData).toBeDefined();
      expect(postbackData?.length).toBeLessThanOrEqual(2048);
      expect(() => JSON.parse(postbackData!)).not.toThrow();
    });
  });
});
