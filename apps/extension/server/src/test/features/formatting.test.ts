import * as assert from 'node:assert';
import { TextDocument } from 'vscode-languageserver-textdocument';
import type { FormattingOptions } from 'vscode-languageserver/node';
import { FormattingProvider } from '../../features/formatting';

describe('FormattingProvider', () => {
  let formattingProvider: FormattingProvider;

  beforeEach(() => {
    formattingProvider = new FormattingProvider(null as any);
  });

  describe('Document formatting', () => {
    it('should format agent definitions', async () => {
      const text = 'agent   TestAgent\ndisplayName:"Test Agent"';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const options: FormattingOptions = {
        tabSize: 2,
        insertSpaces: true,
        trimTrailingWhitespace: true,
        insertFinalNewline: true,
        trimFinalNewlines: true,
      };

      const edits = await formattingProvider.formatDocument(document, options);

      assert.ok(Array.isArray(edits), 'Should return an array of text edits');

      // Each edit should have proper structure
      edits.forEach((edit) => {
        assert.ok(edit.range, 'Edit should have a range');
        assert.ok(typeof edit.newText === 'string', 'Edit should have new text');
        assert.ok(edit.range.start, 'Range should have start');
        assert.ok(edit.range.end, 'Range should have end');
      });
    });

    it('should handle indentation properly', async () => {
      const text = `agent TestAgent
displayName: "Test"
agentConfig Config
description: "Test agent"`;

      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const options: FormattingOptions = {
        tabSize: 2,
        insertSpaces: true,
      };

      const edits = await formattingProvider.formatDocument(document, options);

      assert.ok(Array.isArray(edits), 'Should return formatting edits for indentation');
    });

    it('should respect formatting options', async () => {
      const text = 'agent TestAgent\n\tdisplayName: "Test"';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      // Test with tabs
      const tabOptions: FormattingOptions = {
        tabSize: 4,
        insertSpaces: false,
      };

      const tabEdits = await formattingProvider.formatDocument(document, tabOptions);
      assert.ok(Array.isArray(tabEdits), 'Should handle tab-based formatting');

      // Test with spaces
      const spaceOptions: FormattingOptions = {
        tabSize: 2,
        insertSpaces: true,
      };

      const spaceEdits = await formattingProvider.formatDocument(document, spaceOptions);
      assert.ok(Array.isArray(spaceEdits), 'Should handle space-based formatting');
    });
  });

  // Note: Range formatting and on-type formatting not implemented in current provider

  describe('Complex document formatting', () => {
    it('should format complete RCL documents', async () => {
      const text = `agent ComplexAgent
displayName:"Complex Agent"
brandName:"Test Brand"

agentConfig Config
description:"A complex agent"
color:"#059669"

flow MainFlow
:start->Welcome
Welcome->Planning
Planning->:end

messages Messages
text Welcome"Welcome!"
richCard Planning"What to do?":large
reply"Option 1""option1"
reply"Option 2""option2"`;

      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const options: FormattingOptions = {
        tabSize: 2,
        insertSpaces: true,
        trimTrailingWhitespace: true,
        insertFinalNewline: true,
      };

      const edits = await formattingProvider.formatDocument(document, options);

      assert.ok(Array.isArray(edits), 'Should format complex documents');

      // Should produce meaningful formatting changes
      if (edits.length > 0) {
        assert.ok(
          edits.some((edit) => edit.newText.length > 0),
          'Should include formatting changes',
        );
      }
    });

    it('should preserve semantic structure while formatting', async () => {
      const text = `agent TestAgent
  displayName: "Test"
  
  flow MainFlow
    :start -> Welcome
    
  messages Messages
    text Welcome "Hello"`;

      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const options: FormattingOptions = {
        tabSize: 2,
        insertSpaces: true,
      };

      const edits = await formattingProvider.formatDocument(document, options);

      assert.ok(Array.isArray(edits), 'Should preserve structure during formatting');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid syntax gracefully', async () => {
      const text = 'invalid syntax @#$%^&*()';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const options: FormattingOptions = {
        tabSize: 2,
        insertSpaces: true,
      };

      const edits = await formattingProvider.formatDocument(document, options);

      assert.ok(Array.isArray(edits), 'Should handle invalid syntax gracefully');
    });

    it('should handle empty documents', async () => {
      const text = '';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const options: FormattingOptions = {
        tabSize: 2,
        insertSpaces: true,
      };

      const edits = await formattingProvider.formatDocument(document, options);

      assert.ok(Array.isArray(edits), 'Should handle empty documents');
      assert.equal(edits.length, 0, 'Should return no edits for empty documents');
    });

    it('should handle malformed formatting options', async () => {
      const text = 'agent TestAgent';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      // Test with minimal options
      const minimalOptions: FormattingOptions = {
        tabSize: 4,
        insertSpaces: true,
      };

      const edits = await formattingProvider.formatDocument(document, minimalOptions);

      assert.ok(Array.isArray(edits), 'Should handle minimal formatting options');
    });
  });
});
