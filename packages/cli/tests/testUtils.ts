import fs from 'fs-extra';
import path from 'node:path';

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
      parent: null
    };
  }

  /**
   * Create a mock text shortcut node
   */
  static createTextShortcutNode(messageId: string, messageText: string): RCLNode {
    return this.createMockNode('text_shortcut', undefined, [
      this.createMockNode('identifier', 'text'),
      this.createMockNode('identifier', messageId),
      this.createMockNode('string', `"${messageText}"`)
    ]);
  }

  /**
   * Create a mock transactional shortcut node
   */
  static createTransactionalShortcutNode(messageId: string, messageText: string): RCLNode {
    return this.createMockNode('transactional_shortcut', undefined, [
      this.createMockNode('identifier', 'transactional'),
      this.createMockNode('identifier', messageId),
      this.createMockNode('string', `"${messageText}"`)
    ]);
  }

  /**
   * Create a mock agent message node
   */
  static createAgentMessageNode(messageId: string, contentMessage: RCLNode): RCLNode {
    return this.createMockNode('agent_message', undefined, [
      this.createMockNode('identifier', 'agentMessage'),
      this.createMockNode('identifier', messageId),
      contentMessage
    ]);
  }

  /**
   * Create a mock content message node
   */
  static createContentMessageNode(text?: string, richCard?: RCLNode): RCLNode {
    const children: RCLNode[] = [];
    
    if (text) {
      children.push(this.createMockNode('text_property', undefined, [
        this.createMockNode('identifier', 'text'),
        this.createMockNode('string', `"${text}"`)
      ]));
    }
    
    if (richCard) {
      children.push(richCard);
    }

    return this.createMockNode('content_message', undefined, children);
  }

  /**
   * Create a mock suggestion node
   */
  static createSuggestionNode(type: 'reply' | 'action', text: string, postbackData: string, action?: RCLNode): RCLNode {
    const suggestionContent: RCLNode[] = [
      this.createMockNode('text_property', undefined, [
        this.createMockNode('identifier', 'text'),
        this.createMockNode('string', `"${text}"`)
      ]),
      this.createMockNode('postback_data_property', undefined, [
        this.createMockNode('identifier', 'postbackData'),
        this.createMockNode('string', `"${postbackData}"`)
      ])
    ];

    if (action) {
      suggestionContent.push(action);
    }

    return this.createMockNode('suggestion', undefined, [
      this.createMockNode(type, undefined, suggestionContent)
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

    return suggestions.every(suggestion => {
      return (
        typeof suggestion === 'object' &&
        ((suggestion.reply && !suggestion.action) || (!suggestion.reply && suggestion.action))
      );
    });
  }
}

/**
 * Mock parser that returns predictable AST structures for testing
 */
export class MockParser {
  parseDocument(content: string, uri: string) {
    // Simple mock implementation for testing
    // In real tests, we'll provide specific AST structures
    return {
      uri,
      version: 1,
      content,
      ast: this.parseContent(content),
      imports: [],
      symbols: [],
      diagnostics: []
    };
  }

  private parseContent(content: string): RCLNode {
    // Very basic parsing for test purposes
    // Real tests will use pre-constructed AST nodes
    return TestUtils.createMockNode('source_file', content);
  }
}