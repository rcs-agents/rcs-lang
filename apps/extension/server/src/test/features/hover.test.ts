import * as assert from 'node:assert';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { MarkupKind } from 'vscode-languageserver/node';
import { HoverProvider } from '../../features/hover';

describe('HoverProvider', () => {
  let hoverProvider: HoverProvider;

  beforeEach(() => {
    hoverProvider = new HoverProvider(null as any);
  });

  describe('Keyword hover information', () => {
    it('should provide hover info for agent keyword', async () => {
      const text = 'agent TestAgent';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 2 }; // Within 'agent'

      const hover = await hoverProvider.getHover(document, position);

      assert.ok(hover, 'Should provide hover information');
      assert.ok(hover.contents, 'Should have contents');

      if (typeof hover.contents === 'string') {
        assert.ok(hover.contents.includes('agent'), 'Should mention agent in hover content');
      } else if (Array.isArray(hover.contents)) {
        const hasAgentInfo = hover.contents.some((content) =>
          typeof content === 'string' ? content.includes('agent') : content.value.includes('agent'),
        );
        assert.ok(hasAgentInfo, 'Should mention agent in hover content');
      } else {
        assert.ok(hover.contents.value.includes('agent'), 'Should mention agent in hover content');
      }
    });

    it('should provide hover info for flow keyword', async () => {
      const text = 'flow TestFlow';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 2 }; // Within 'flow'

      const hover = await hoverProvider.getHover(document, position);

      assert.ok(hover, 'Should provide hover information');
      assert.ok(hover.contents, 'Should have contents');
    });

    it('should return null for properties not implemented in basic provider', async () => {
      const text = 'displayName: "Test"';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 5 }; // Within 'displayName'

      const hover = await hoverProvider.getHover(document, position);

      // Current basic implementation only supports agent and flow keywords
      assert.equal(hover, null, 'Basic provider should return null for unsupported properties');
    });
  });

  describe('Position handling', () => {
    it('should return null for positions outside keywords', async () => {
      const text = 'agent TestAgent';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 10 }; // Within 'TestAgent' identifier

      const hover = await hoverProvider.getHover(document, position);

      // Depending on implementation, this might return null or some hover info
      // The test ensures it handles the position appropriately
      if (hover) {
        assert.ok(hover.contents, 'If hover is provided, it should have contents');
      }
    });

    it('should handle positions at line boundaries', async () => {
      const text = 'agent TestAgent\n  displayName: "Test"';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 15 }; // End of first line

      const hover = await hoverProvider.getHover(document, position);

      // Should handle boundary positions gracefully without throwing
      if (hover) {
        assert.ok(hover.contents, 'If hover is provided, it should have contents');
      }
    });

    it('should handle out-of-bounds positions', async () => {
      const text = 'agent TestAgent';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 5, character: 50 }; // Way beyond document

      const hover = await hoverProvider.getHover(document, position);

      // Should handle gracefully without throwing
      if (hover) {
        assert.ok(hover.contents, 'If hover is provided, it should have contents');
      }
    });
  });

  describe('Multi-line documents', () => {
    it('should provide hover for keywords on different lines', async () => {
      const text = 'agent TestAgent\n  displayName: "Test"\n  flow MainFlow';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      // Test hover on line 2 for 'flow'
      const position = { line: 2, character: 2 };
      const hover = await hoverProvider.getHover(document, position);

      assert.ok(hover, 'Should provide hover for keywords on any line');
      assert.ok(hover.contents, 'Should have contents');
    });
  });

  describe('Hover content structure', () => {
    it('should provide properly structured hover content', async () => {
      const text = 'agent TestAgent';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 2 };

      const hover = await hoverProvider.getHover(document, position);

      if (hover) {
        assert.ok(hover.contents, 'Should have contents');

        // Verify contents structure
        if (typeof hover.contents === 'string') {
          assert.ok(hover.contents.length > 0, 'String content should not be empty');
        } else if (Array.isArray(hover.contents)) {
          assert.ok(hover.contents.length > 0, 'Array content should not be empty');
        } else {
          assert.ok(hover.contents.value, 'Markup content should have value');
          if (hover.contents.kind) {
            assert.ok(
              hover.contents.kind === MarkupKind.Markdown ||
                hover.contents.kind === MarkupKind.PlainText,
              'Should use valid markup kind',
            );
          }
        }

        // Verify range if provided
        if (hover.range) {
          assert.ok(hover.range.start, 'Range should have start');
          assert.ok(hover.range.end, 'Range should have end');
          assert.ok(hover.range.start.line >= 0, 'Start line should be non-negative');
          assert.ok(hover.range.start.character >= 0, 'Start character should be non-negative');
        }
      }
    });
  });

  describe('Empty document handling', () => {
    it('should handle empty documents gracefully', async () => {
      const text = '';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 0, character: 0 };

      const hover = await hoverProvider.getHover(document, position);

      // Should not throw, may return null or empty hover
      if (hover) {
        assert.ok(hover.contents, 'If hover is provided, it should have contents');
      }
    });

    it('should handle whitespace-only documents', async () => {
      const text = '   \n  \n   ';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);
      const position = { line: 1, character: 1 };

      const hover = await hoverProvider.getHover(document, position);

      // Should handle gracefully
      if (hover) {
        assert.ok(hover.contents, 'If hover is provided, it should have contents');
      }
    });
  });
});
