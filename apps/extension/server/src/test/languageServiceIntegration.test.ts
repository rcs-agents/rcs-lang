import * as assert from 'node:assert';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CompletionProvider } from '../features/completion';
import { DiagnosticsProvider } from '../features/diagnostics';
import { HoverProvider } from '../features/hover';
import { SymbolsProvider } from '../features/symbols';
import { SemanticTokensProvider } from '../features/semanticTokens';
import { FormattingProvider } from '../features/formatting';
import { SyntaxValidator } from '../syntaxValidator';

describe('Language Service Integration', () => {
  let completionProvider: CompletionProvider;
  let diagnosticsProvider: DiagnosticsProvider;
  let hoverProvider: HoverProvider;
  let symbolsProvider: SymbolsProvider;
  let semanticTokensProvider: SemanticTokensProvider;
  let formattingProvider: FormattingProvider;
  let syntaxValidator: SyntaxValidator;

  beforeEach(() => {
    // Initialize all providers with null parser for testing
    completionProvider = new CompletionProvider(null as any);
    syntaxValidator = new SyntaxValidator(null as any);
    diagnosticsProvider = new DiagnosticsProvider(null as any, syntaxValidator);
    hoverProvider = new HoverProvider(null as any);
    symbolsProvider = new SymbolsProvider(null as any);
    semanticTokensProvider = new SemanticTokensProvider(null as any);
    formattingProvider = new FormattingProvider(null as any);
  });

  describe('Comprehensive RCL language support', () => {
    const sampleRclContent = `agent TestAgent
  displayName: "Test Agent"
  brandName: "Test Brand"
  
  agentConfig Config
    description: "A test agent for demonstration"
    color: "#059669"
  
  flow MainFlow
    :start -> Welcome
    Welcome -> Planning
    Planning -> :end
  
  messages Messages
    text Welcome "Welcome to our service!"
    richCard Planning "What would you like to do?" :large
      reply "Option 1" "option1"
      reply "Option 2" "option2"`;

    it('should provide comprehensive language service features', async () => {
      const document = TextDocument.create('test://comprehensive.rcl', 'rcl', 1, sampleRclContent);

      // Test completion provider
      const completions = await completionProvider.getCompletions(document, { line: 0, character: 0 });
      assert.ok(Array.isArray(completions), 'Should provide completions');
      assert.ok(completions.length > 0, 'Should have completion items');

      // Test hover provider
      const hover = await hoverProvider.getHover(document, { line: 0, character: 2 });
      assert.ok(hover, 'Should provide hover information for agent keyword');

      // Test symbols provider
      const symbols = await symbolsProvider.getDocumentSymbols(document);
      assert.ok(Array.isArray(symbols), 'Should provide document symbols');
      const agentSymbol = symbols.find(s => s.name === 'TestAgent');
      const flowSymbol = symbols.find(s => s.name === 'MainFlow');
      assert.ok(agentSymbol, 'Should extract agent symbol');
      assert.ok(flowSymbol, 'Should extract flow symbol');

      // Test semantic tokens provider
      const tokens = await semanticTokensProvider.getSemanticTokens(document);
      assert.ok(tokens, 'Should provide semantic tokens');
      assert.ok(Array.isArray(tokens.data), 'Should have token data array');

      // Test formatting provider
      const formatEdits = await formattingProvider.formatDocument(document, {
        tabSize: 2,
        insertSpaces: true,
      });
      assert.ok(Array.isArray(formatEdits), 'Should provide formatting edits');

      // Test diagnostics provider
      const mockSettings = {} as any;
      syntaxValidator.validateDocument = () => []; // Mock no errors
      const diagnostics = await diagnosticsProvider.getDiagnostics(document, mockSettings);
      assert.ok(Array.isArray(diagnostics), 'Should provide diagnostics');
    });

    it('should handle RCL-specific language constructs', async () => {
      // Test specific RCL features
      const rclFeatures = [
        'agent TravelAgent',          // Agent definition
        'flow BookingFlow',           // Flow definition  
        'messages Messages',          // Messages section
        'text Welcome "Hello"',       // Text shortcut
        'richCard Info "Details"',    // Rich card shortcut
        ':start -> Welcome',          // Flow transition
        'displayName: "Agent"',       // Agent property
      ];

      for (const feature of rclFeatures) {
        const document = TextDocument.create('test://feature.rcl', 'rcl', 1, feature);
        
        // Each feature should be handled gracefully by all providers
        const completions = await completionProvider.getCompletions(document, { line: 0, character: 0 });
        assert.ok(Array.isArray(completions), `Should handle completions for: ${feature}`);

        const symbols = await symbolsProvider.getDocumentSymbols(document);
        assert.ok(Array.isArray(symbols), `Should handle symbols for: ${feature}`);

        const tokens = await semanticTokensProvider.getSemanticTokens(document);
        assert.ok(tokens && Array.isArray(tokens.data), `Should handle tokens for: ${feature}`);
      }
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle invalid RCL syntax gracefully', async () => {
      const invalidRcl = 'invalid syntax @#$%^&*()';
      const document = TextDocument.create('test://invalid.rcl', 'rcl', 1, invalidRcl);

      // All providers should handle invalid syntax without throwing
      const completions = await completionProvider.getCompletions(document, { line: 0, character: 5 });
      const hover = await hoverProvider.getHover(document, { line: 0, character: 5 });
      const symbols = await symbolsProvider.getDocumentSymbols(document);
      const tokens = await semanticTokensProvider.getSemanticTokens(document);
      const formatEdits = await formattingProvider.formatDocument(document, { tabSize: 2, insertSpaces: true });

      assert.ok(Array.isArray(completions), 'Completions should handle invalid syntax');
      // hover can be null for invalid syntax, that's fine
      assert.ok(Array.isArray(symbols), 'Symbols should handle invalid syntax');
      assert.ok(tokens && Array.isArray(tokens.data), 'Tokens should handle invalid syntax');
      assert.ok(Array.isArray(formatEdits), 'Formatting should handle invalid syntax');
    });

    it('should handle empty documents', async () => {
      const document = TextDocument.create('test://empty.rcl', 'rcl', 1, '');

      const completions = await completionProvider.getCompletions(document, { line: 0, character: 0 });
      const hover = await hoverProvider.getHover(document, { line: 0, character: 0 });
      const symbols = await symbolsProvider.getDocumentSymbols(document);
      const tokens = await semanticTokensProvider.getSemanticTokens(document);
      const formatEdits = await formattingProvider.formatDocument(document, { tabSize: 2, insertSpaces: true });

      assert.ok(Array.isArray(completions), 'Should provide completions for empty documents');
      // hover can be null for empty documents
      assert.ok(Array.isArray(symbols), 'Should provide symbols for empty documents');
      assert.equal(symbols.length, 0, 'Should have no symbols for empty documents');
      assert.ok(tokens && Array.isArray(tokens.data), 'Should provide tokens for empty documents');
      assert.equal(tokens.data.length, 0, 'Should have no tokens for empty documents');
      assert.ok(Array.isArray(formatEdits), 'Should provide formatting for empty documents');
      assert.equal(formatEdits.length, 0, 'Should have no format edits for empty documents');
    });

    it('should handle out-of-bounds positions', async () => {
      const document = TextDocument.create('test://simple.rcl', 'rcl', 1, 'agent Test');
      const outOfBoundsPosition = { line: 100, character: 100 };

      // Providers should handle out-of-bounds positions gracefully
      const completions = await completionProvider.getCompletions(document, outOfBoundsPosition);
      const hover = await hoverProvider.getHover(document, outOfBoundsPosition);

      assert.ok(Array.isArray(completions), 'Should handle out-of-bounds positions in completions');
      // hover can be null for out-of-bounds positions
    });
  });

  describe('Language service consistency', () => {
    it('should provide consistent results across providers', async () => {
      const content = 'agent ConsistentAgent\n  displayName: "Test"';
      const document = TextDocument.create('test://consistent.rcl', 'rcl', 1, content);

      // Test that providers give consistent results for the same content
      const symbols = await symbolsProvider.getDocumentSymbols(document);
      const tokens = await semanticTokensProvider.getSemanticTokens(document);

      // Should extract the agent symbol
      const agentSymbol = symbols.find(s => s.name === 'ConsistentAgent');
      assert.ok(agentSymbol, 'Should consistently extract agent symbol');
      assert.ok(agentSymbol.kind >= 0, 'Agent should have a valid symbol kind');

      // Tokens should be provided for the content
      assert.ok(tokens && Array.isArray(tokens.data), 'Should provide tokens consistently');
    });

    it('should maintain performance with larger documents', async () => {
      // Create a larger RCL document
      const largeContent = Array(100).fill(0).map((_, i) => 
        `text Message${i} "This is message number ${i}"`
      ).join('\n');
      
      const document = TextDocument.create('test://large.rcl', 'rcl', 1, largeContent);

      const startTime = Date.now();

      // Test all providers with larger content
      const completions = await completionProvider.getCompletions(document, { line: 50, character: 0 });
      const symbols = await symbolsProvider.getDocumentSymbols(document);
      const tokens = await semanticTokensProvider.getSemanticTokens(document);
      const formatEdits = await formattingProvider.formatDocument(document, { tabSize: 2, insertSpaces: true });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second for basic operations)
      assert.ok(duration < 1000, `Language services should be performant (took ${duration}ms)`);
      
      assert.ok(Array.isArray(completions), 'Should handle large documents');
      assert.ok(Array.isArray(symbols), 'Should extract symbols from large documents');
      assert.ok(tokens && Array.isArray(tokens.data), 'Should tokenize large documents');
      assert.ok(Array.isArray(formatEdits), 'Should format large documents');
    });
  });
});