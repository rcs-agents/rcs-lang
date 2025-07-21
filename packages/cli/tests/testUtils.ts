import path from 'node:path';
import fs from 'fs-extra';

// Define RCLNode interface locally for tests
interface RCLNode {
  type: string;
  text?: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children: RCLNode[];
  parent: RCLNode | null;
}

/**
 * Test utilities for CLI testing
 */
export class TestUtils {
  /**
   * Load a test fixture file
   */
  static async loadFixture(filename: string): Promise<string> {
    const fixturePath = path.join(__dirname, 'fixtures', filename);
    return fs.readFile(fixturePath, 'utf-8');
  }

  /**
   * Create a mock RCL AST node for testing
   */
  static createMockNode(type: string, text?: string, children?: RCLNode[]): RCLNode {
    return {
      type,
      text,
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: text?.length || 0 },
      children: children || [],
      parent: null,
    };
  }

  /**
   * Create a mock text shortcut node
   */
  static createTextShortcutNode(messageId: string, messageText: string): RCLNode {
    return TestUtils.createMockNode('text_shortcut', undefined, [
      TestUtils.createMockNode('identifier', 'text'),
      TestUtils.createMockNode('identifier', messageId),
      TestUtils.createMockNode('string', `"${messageText}"`),
    ]);
  }

  /**
   * Create a mock transactional shortcut node
   */
  static createTransactionalShortcutNode(messageId: string, messageText: string): RCLNode {
    return TestUtils.createMockNode('transactional_shortcut', undefined, [
      TestUtils.createMockNode('identifier', 'transactional'),
      TestUtils.createMockNode('identifier', messageId),
      TestUtils.createMockNode('string', `"${messageText}"`),
    ]);
  }

  /**
   * Create a mock agent message node
   */
  static createAgentMessageNode(messageId: string, contentMessage: RCLNode): RCLNode {
    return TestUtils.createMockNode('agent_message', undefined, [
      TestUtils.createMockNode('identifier', 'agentMessage'),
      TestUtils.createMockNode('identifier', messageId),
      contentMessage,
    ]);
  }

  /**
   * Create a mock content message node
   */
  static createContentMessageNode(text?: string, richCard?: RCLNode): RCLNode {
    const children: RCLNode[] = [];

    if (text) {
      children.push(
        TestUtils.createMockNode('text_property', undefined, [
          TestUtils.createMockNode('identifier', 'text'),
          TestUtils.createMockNode('string', `"${text}"`),
        ]),
      );
    }

    if (richCard) {
      children.push(richCard);
    }

    return TestUtils.createMockNode('content_message', undefined, children);
  }

  /**
   * Create a mock suggestion node
   */
  static createSuggestionNode(
    type: 'reply' | 'action',
    text: string,
    postbackData: string,
    action?: RCLNode,
  ): RCLNode {
    const suggestionContent: RCLNode[] = [
      TestUtils.createMockNode('text_property', undefined, [
        TestUtils.createMockNode('identifier', 'text'),
        TestUtils.createMockNode('string', `"${text}"`),
      ]),
      TestUtils.createMockNode('postback_data_property', undefined, [
        TestUtils.createMockNode('identifier', 'postbackData'),
        TestUtils.createMockNode('string', `"${postbackData}"`),
      ]),
    ];

    if (action) {
      suggestionContent.push(action);
    }

    return TestUtils.createMockNode('suggestion', undefined, [
      TestUtils.createMockNode(type, undefined, suggestionContent),
    ]);
  }

  /**
   * Validate that an object matches the AgentMessage schema structure
   */
  static validateAgentMessageStructure(message: any): boolean {
    return (
      typeof message === 'object' &&
      message.contentMessage &&
      message.messageTrafficType &&
      typeof message.contentMessage === 'object' &&
      typeof message.messageTrafficType === 'string'
    );
  }

  /**
   * Validate that suggestions array follows schema requirements
   */
  static validateSuggestionsStructure(suggestions: any[]): boolean {
    if (!Array.isArray(suggestions) || suggestions.length > 11) {
      return false;
    }

    return suggestions.every((suggestion) => {
      return (
        typeof suggestion === 'object' &&
        ((suggestion.reply && !suggestion.action) || (!suggestion.reply && suggestion.action))
      );
    });
  }
}
