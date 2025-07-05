import * as assert from 'assert';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CompletionProvider } from '../features/completion';
import { HoverProvider } from '../features/hover';

describe('RCL Language Server', () => {
  let completionProvider: CompletionProvider;
  let hoverProvider: HoverProvider;

  beforeEach(() => {
    // Create providers with null parser to avoid tree-sitter issues
    completionProvider = new CompletionProvider(null as any);
    hoverProvider = new HoverProvider(null as any);
  });

  describe('Completion Provider', () => {
    it('should provide basic keyword completions', async () => {
      const text = 'age';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 3 };
      
      const completions = await completionProvider.getCompletions(document, position);
      
      assert.ok(completions);
      assert.ok(Array.isArray(completions));
      assert.ok(completions.length > 0);
      assert.ok(completions.some(item => item.label === 'agent'));
    });
  });

  describe('Hover Provider', () => {
    it('should provide hover information for keywords', async () => {
      const text = 'agent TestAgent';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 2 };
      
      const hover = await hoverProvider.getHover(document, position);
      
      assert.ok(hover);
      assert.ok(hover.contents);
    });
  });

  describe('Basic functionality', () => {
    it('should handle RCL documents', () => {
      const text = 'agent TestAgent\n  displayName: "Test"';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      
      assert.equal(document.languageId, 'rcl');
      assert.ok(document.getText().includes('agent'));
    });
  });

  describe('Language Server Protocol', () => {
    it('should support completion requests', async () => {
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, 'fl');
      const position = { line: 0, character: 2 };
      
      const completions = await completionProvider.getCompletions(document, position);
      
      assert.ok(completions);
      assert.ok(completions.some(item => item.label === 'flow'));
    });

    it('should support hover requests', async () => {
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, 'flow TestFlow');
      const position = { line: 0, character: 2 };
      
      const hover = await hoverProvider.getHover(document, position);
      
      assert.ok(hover);
      assert.ok(hover.contents);
    });
  });
});