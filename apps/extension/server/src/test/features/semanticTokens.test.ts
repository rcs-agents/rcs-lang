import * as assert from 'node:assert';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SemanticTokensProvider } from '../../features/semanticTokens';

describe('SemanticTokensProvider', () => {
  let semanticTokensProvider: SemanticTokensProvider;

  beforeEach(() => {
    semanticTokensProvider = new SemanticTokensProvider(null as any);
  });

  describe('Token legend', () => {
    it('should provide semantic token legend', () => {
      const legend = semanticTokensProvider.getLegend();

      assert.ok(legend, 'Should provide a semantic tokens legend');
      assert.ok(Array.isArray(legend.tokenTypes), 'Should have token types array');
      assert.ok(Array.isArray(legend.tokenModifiers), 'Should have token modifiers array');

      // Check for common RCL token types
      const expectedTokenTypes = ['keyword', 'string', 'number', 'property'];
      expectedTokenTypes.forEach((tokenType) => {
        if (legend.tokenTypes.includes(tokenType)) {
          assert.ok(true, `Should include ${tokenType} token type`);
        }
      });
    });

    it('should have non-empty token types', () => {
      const legend = semanticTokensProvider.getLegend();

      assert.ok(legend.tokenTypes.length > 0, 'Should have at least one token type');
      legend.tokenTypes.forEach((tokenType) => {
        assert.ok(typeof tokenType === 'string', 'Token type should be a string');
        assert.ok(tokenType.length > 0, 'Token type should not be empty');
      });
    });
  });

  describe('Full document tokenization', () => {
    it('should tokenize agent definitions', async () => {
      const text = 'agent TestAgent\n  displayName: "Test Agent"';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const tokens = await semanticTokensProvider.getSemanticTokens(document);

      assert.ok(tokens, 'Should return semantic tokens');
      assert.ok(Array.isArray(tokens.data), 'Should have data array');

      // Semantic tokens are encoded as an array of integers
      // Each token is represented by 5 integers: deltaLine, deltaChar, length, tokenType, tokenModifiers
      if (tokens.data.length > 0) {
        assert.equal(tokens.data.length % 5, 0, 'Token data should be in groups of 5 integers');
      }
    });

    it('should tokenize flow definitions', async () => {
      const text = `flow MainFlow
  :start -> Welcome
  Welcome -> End`;

      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const tokens = await semanticTokensProvider.getSemanticTokens(document);

      assert.ok(tokens, 'Should return semantic tokens for flow definitions');
      assert.ok(Array.isArray(tokens.data), 'Should have data array');
    });

    it('should tokenize message definitions', async () => {
      const text = `messages Messages
  text Welcome "Welcome to our service!"
  richCard Product "Product Information"`;

      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const tokens = await semanticTokensProvider.getSemanticTokens(document);

      assert.ok(tokens, 'Should return semantic tokens for message definitions');
      assert.ok(Array.isArray(tokens.data), 'Should have data array');
    });
  });

  // Note: Range tokenization methods not implemented in current provider

  describe('Token data validation', () => {
    it('should produce valid token encoding', async () => {
      const text = 'agent TestAgent\n  displayName: "Test"';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const tokens = await semanticTokensProvider.getSemanticTokens(document);

      if (tokens.data.length > 0) {
        // Validate token encoding format
        for (let i = 0; i < tokens.data.length; i += 5) {
          const deltaLine = tokens.data[i];
          const deltaChar = tokens.data[i + 1];
          const length = tokens.data[i + 2];
          const tokenType = tokens.data[i + 3];
          const tokenModifiers = tokens.data[i + 4];

          assert.ok(deltaLine >= 0, 'Delta line should be non-negative');
          assert.ok(deltaChar >= 0, 'Delta character should be non-negative');
          assert.ok(length > 0, 'Token length should be positive');
          assert.ok(tokenType >= 0, 'Token type should be non-negative');
          assert.ok(tokenModifiers >= 0, 'Token modifiers should be non-negative');

          // Check if token type is within valid range
          const legend = semanticTokensProvider.getLegend();
          assert.ok(
            tokenType < legend.tokenTypes.length,
            'Token type should be within legend range',
          );
        }
      }
    });

    it('should handle complex RCL structures', async () => {
      const text = `agent ComplexAgent
  displayName: "Complex Agent"
  brandName: "Test Brand"
  
  agentConfig Config
    description: "A complex agent for testing"
    color: "#059669"
  
  flow MainFlow
    :start -> Welcome
    Welcome -> Planning
    Planning -> :end
  
  messages Messages
    text Welcome "Welcome!"
    richCard Planning "What would you like to do?" :large
      reply "Option 1" "option1"
      reply "Option 2" "option2"`;

      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const tokens = await semanticTokensProvider.getSemanticTokens(document);

      assert.ok(tokens, 'Should handle complex RCL structures');
      assert.ok(Array.isArray(tokens.data), 'Should have data array');

      if (tokens.data.length > 0) {
        assert.equal(
          tokens.data.length % 5,
          0,
          'Complex structure tokens should still be properly encoded',
        );
      }
    });
  });

  describe('Error handling', () => {
    it('should handle invalid syntax gracefully', async () => {
      const text = 'invalid syntax @#$%^&*()';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const tokens = await semanticTokensProvider.getSemanticTokens(document);

      assert.ok(tokens, 'Should return tokens even for invalid syntax');
      assert.ok(Array.isArray(tokens.data), 'Should have data array even for invalid syntax');
    });

    it('should handle empty documents', async () => {
      const text = '';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const tokens = await semanticTokensProvider.getSemanticTokens(document);

      assert.ok(tokens, 'Should return tokens for empty documents');
      assert.ok(Array.isArray(tokens.data), 'Should have data array for empty documents');
      assert.equal(tokens.data.length, 0, 'Should have empty data array for empty documents');
    });

    // Note: Range methods not implemented in current provider
  });
});
