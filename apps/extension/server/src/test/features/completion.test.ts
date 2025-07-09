import * as assert from 'node:assert';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CompletionItemKind } from 'vscode-languageserver/node';
import { CompletionProvider } from '../../features/completion';

describe('CompletionProvider', () => {
  let completionProvider: CompletionProvider;

  beforeEach(() => {
    // Create provider with null parser to avoid tree-sitter issues in tests
    completionProvider = new CompletionProvider(null as any);
  });

  describe('Basic keyword completions', () => {
    it('should provide agent keyword completion', async () => {
      const text = 'age';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 3 };

      const completions = await completionProvider.getCompletions(document, position);

      const agentCompletion = completions.find((item) => item.label === 'agent');
      assert.ok(agentCompletion, 'Should provide agent completion');
      assert.equal(agentCompletion.kind, CompletionItemKind.Keyword);
      assert.equal(agentCompletion.detail, 'Agent Definition');
      assert.ok(
        agentCompletion.insertText?.includes('AgentName'),
        'Should include snippet placeholder',
      );
    });

    it('should provide flow keyword completion', async () => {
      const text = 'fl';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 2 };

      const completions = await completionProvider.getCompletions(document, position);

      const flowCompletion = completions.find((item) => item.label === 'flow');
      assert.ok(flowCompletion, 'Should provide flow completion');
      assert.equal(flowCompletion.kind, CompletionItemKind.Keyword);
      assert.equal(flowCompletion.detail, 'Flow Definition');
    });

    it('should provide displayName property completion', async () => {
      const text = 'display';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 7 };

      const completions = await completionProvider.getCompletions(document, position);

      const displayNameCompletion = completions.find((item) => item.label === 'displayName');
      assert.ok(displayNameCompletion, 'Should provide displayName completion');
      assert.equal(displayNameCompletion.kind, CompletionItemKind.Property);
      assert.equal(displayNameCompletion.detail, 'Agent Display Name');
    });
  });

  describe('Completion context awareness', () => {
    it('should provide completions for empty document', async () => {
      const text = '';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 0 };

      const completions = await completionProvider.getCompletions(document, position);

      assert.ok(completions.length > 0, 'Should provide completions for empty document');
    });

    it('should provide completions mid-word', async () => {
      const text = 'ag';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 2 };

      const completions = await completionProvider.getCompletions(document, position);

      assert.ok(completions.length > 0, 'Should provide completions mid-word');
      assert.ok(
        completions.some((item) => item.label === 'agent'),
        'Should include agent keyword',
      );
    });
  });

  describe('Completion item properties', () => {
    it('should provide proper completion item structure', async () => {
      const text = 'agent';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 5 };

      const completions = await completionProvider.getCompletions(document, position);

      completions.forEach((item) => {
        assert.ok(item.label, 'Each completion should have a label');
        assert.ok(item.kind !== undefined, 'Each completion should have a kind');
        // Optional properties can be undefined
      });
    });

    it('should resolve completion items correctly', () => {
      const originalItem = {
        label: 'test',
        kind: CompletionItemKind.Keyword,
      };

      const resolvedItem = completionProvider.resolveCompletion(originalItem);

      assert.deepEqual(
        resolvedItem,
        originalItem,
        'Should return the same item for basic resolution',
      );
    });
  });

  describe('Multi-line document completions', () => {
    it('should handle completions in multi-line documents', async () => {
      const text = 'agent TestAgent\n  displayName: "Test"\n  fl';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 2, character: 4 };

      const completions = await completionProvider.getCompletions(document, position);

      assert.ok(completions.length > 0, 'Should provide completions in multi-line documents');
      assert.ok(
        completions.some((item) => item.label === 'flow'),
        'Should suggest flow keyword',
      );
    });
  });
});
