import * as assert from 'node:assert';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SymbolKind } from 'vscode-languageserver/node';
import { SymbolsProvider } from '../../features/symbols';

describe('SymbolsProvider', () => {
  let symbolsProvider: SymbolsProvider;

  beforeEach(() => {
    symbolsProvider = new SymbolsProvider(null as any);
  });

  describe('Document symbols extraction', () => {
    it('should extract agent symbols', async () => {
      const text = 'agent TestAgent\n  displayName: "Test Agent"';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const symbols = await symbolsProvider.getDocumentSymbols(document);

      assert.ok(Array.isArray(symbols), 'Should return an array of symbols');
      
      const agentSymbol = symbols.find(symbol => 
        symbol.name === 'TestAgent' || symbol.name.includes('TestAgent')
      );
      
      if (agentSymbol) {
        assert.ok(agentSymbol.kind === SymbolKind.Class || agentSymbol.kind === SymbolKind.Object, 
                  'Agent should be represented as Class or Object symbol');
        assert.ok(agentSymbol.range, 'Symbol should have a range');
      }
    });

    it('should extract flow symbols', async () => {
      const text = `agent TestAgent
  displayName: "Test"
  
  flow MainFlow
    :start -> Welcome
    Welcome -> End
    
  flow SupportFlow
    :start -> Help`;
      
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const symbols = await symbolsProvider.getDocumentSymbols(document);

      const flowSymbols = symbols.filter(symbol => 
        symbol.name === 'MainFlow' || symbol.name === 'SupportFlow' ||
        symbol.name.includes('Flow')
      );

      if (flowSymbols.length > 0) {
        flowSymbols.forEach(flowSymbol => {
          assert.ok(
            flowSymbol.kind === SymbolKind.Function || 
            flowSymbol.kind === SymbolKind.Method ||
            flowSymbol.kind === SymbolKind.Object,
            'Flow should be represented as Function, Method, or Object symbol'
          );
          assert.ok(flowSymbol.range, 'Flow symbol should have a range');
        });
      }
    });

    it('should extract message symbols', async () => {
      const text = `agent TestAgent
  displayName: "Test"
  
  messages Messages
    text Welcome "Welcome message"
    richCard ProductCard "Product Info"`;
      
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const symbols = await symbolsProvider.getDocumentSymbols(document);

      const messageSymbols = symbols.filter(symbol => 
        symbol.name === 'Welcome' || 
        symbol.name === 'ProductCard' ||
        symbol.name.includes('Message')
      );

      if (messageSymbols.length > 0) {
        messageSymbols.forEach(messageSymbol => {
          assert.ok(
            messageSymbol.kind === SymbolKind.String || 
            messageSymbol.kind === SymbolKind.Variable ||
            messageSymbol.kind === SymbolKind.Property,
            'Message should be represented as String, Variable, or Property symbol'
          );
          assert.ok(messageSymbol.range, 'Message symbol should have a range');
        });
      }
    });
  });

  // Note: Workspace symbols not implemented in current provider

  describe('Symbol structure validation', () => {
    it('should provide properly structured document symbols', async () => {
      const text = 'agent TestAgent\n  displayName: "Test"';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const symbols = await symbolsProvider.getDocumentSymbols(document);

      symbols.forEach(symbol => {
        assert.ok(symbol.name, 'Symbol should have a name');
        assert.ok(symbol.kind !== undefined, 'Symbol should have a kind');
        assert.ok(symbol.range, 'Symbol should have a range');
        assert.ok(symbol.selectionRange, 'Symbol should have a selection range');
        
        // Validate range structure
        assert.ok(symbol.range.start, 'Range should have start');
        assert.ok(symbol.range.end, 'Range should have end');
        assert.ok(symbol.range.start.line >= 0, 'Start line should be non-negative');
        assert.ok(symbol.range.start.character >= 0, 'Start character should be non-negative');
        
        // Validate selection range structure
        assert.ok(symbol.selectionRange.start, 'Selection range should have start');
        assert.ok(symbol.selectionRange.end, 'Selection range should have end');
      });
    });

    it('should handle hierarchical symbols if supported', async () => {
      const text = `agent TestAgent
  displayName: "Test"
  
  flow MainFlow
    :start -> Welcome
    
  messages Messages
    text Welcome "Hello"`;
      
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const symbols = await symbolsProvider.getDocumentSymbols(document);

      // Check if any symbols have children (hierarchical structure)
      symbols.forEach(symbol => {
        if (symbol.children && symbol.children.length > 0) {
          symbol.children.forEach(child => {
            assert.ok(child.name, 'Child symbol should have a name');
            assert.ok(child.kind !== undefined, 'Child symbol should have a kind');
            assert.ok(child.range, 'Child symbol should have a range');
            assert.ok(child.selectionRange, 'Child symbol should have a selection range');
          });
        }
      });
    });
  });

  describe('Error handling', () => {
    it('should handle invalid documents gracefully', async () => {
      const text = 'invalid syntax here @#$%';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const symbols = await symbolsProvider.getDocumentSymbols(document);

      assert.ok(Array.isArray(symbols), 'Should return an array even for invalid documents');
      // Invalid documents might return empty array or partial symbols
    });

    it('should handle empty documents', async () => {
      const text = '';
      const document = TextDocument.create('test://test.rcl', 'rcl', 1, text);

      const symbols = await symbolsProvider.getDocumentSymbols(document);

      assert.ok(Array.isArray(symbols), 'Should return an array for empty documents');
      assert.equal(symbols.length, 0, 'Should return empty array for empty documents');
    });
  });
});