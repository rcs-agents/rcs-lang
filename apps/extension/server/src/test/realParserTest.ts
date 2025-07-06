import { expect } from 'chai';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RCLParser } from '@rcl/parser';

describe('RCL Parser Real Tests', () => {
  let parser: RCLParser;

  beforeEach(() => {
    parser = new RCLParser();
  });

  describe('Enhanced Mock Parser Tests', () => {
    it('should handle whitespace and indentation correctly', () => {
      const content = `agent TestAgent
  display-name: "Test Agent"
  
  flow Welcome
    start -> greeting
    greeting -> end
    
  messages
    greeting: "Hello, welcome!"
    end: "Thank you!"`;

      const document = TextDocument.create('file:///test.rcl', 'rcl', 1, content);
      const result = parser.parseDocument(document.getText(), document.uri, document.version);

      expect(result.ast).to.not.be.null;
      expect(result.ast!.type).to.equal('source_file');
      expect(result.ast!.children).to.have.length(1);
      
      const agentNode = result.ast!.children![0];
      expect(agentNode.type).to.equal('agent_definition');
      expect((agentNode as any).name).to.equal('TestAgent');
    });

    it('should not throw errors on spaces and indentation', () => {
      const content = `agent MyAgent
  display-name: "My Agent"
  
  flow Main
    start -> state1
    state1 -> state2 
    state2 -> end
    
  messages
    state1: "First message"
    state2: "Second message"`;

      const document = TextDocument.create('file:///test.rcl', 'rcl', 1, content);
      
      expect(() => {
        const result = parser.parseDocument(document.getText(), document.uri, document.version);
        expect(result).to.not.be.null;
        expect(result.diagnostics).to.have.length(0);
      }).to.not.throw();
    });

    it('should parse properties with colons correctly', () => {
      const content = `agent PropertyTest
  display-name: "Property Test Agent"
  brand-name: "Test Brand"
  
  flow TestFlow
    start -> greeting
    
  messages
    greeting: "Hello world!"`;

      const document = TextDocument.create('file:///test.rcl', 'rcl', 1, content);
      const result = parser.parseDocument(document.getText(), document.uri, document.version);

      expect(result.ast).to.not.be.null;
      expect(result.symbols).to.have.length(1);
      expect(result.symbols[0].name).to.equal('PropertyTest');
    });

    it('should handle flow transitions with arrows correctly', () => {
      const content = `agent FlowTest
  display-name: "Flow Test"
  
  flow ComplexFlow
    start -> greeting
    greeting -> question
    question -> answer -> end
    
  messages
    greeting: "Hello!"
    question: "How are you?"
    answer: "Great!"`;

      const document = TextDocument.create('file:///test.rcl', 'rcl', 1, content);
      const result = parser.parseDocument(document.getText(), document.uri, document.version);

      expect(result.ast).to.not.be.null;
      expect(result.ast!.type).to.equal('source_file');
      
      // Check that no parsing errors occurred
      expect(result.diagnostics).to.have.length(0);
    });

    it('should handle mixed indentation (spaces and tabs)', () => {
      // Using template literal with actual tab characters
      const content = `agent MixedIndentAgent
\tdisplay-name: "Mixed Indent"
  
  flow TestFlow
\t  start -> greeting
    greeting -> end
    
\tmessages
    greeting: "Hello mixed indent!"`;

      const document = TextDocument.create('file:///test.rcl', 'rcl', 1, content);
      const result = parser.parseDocument(document.getText(), document.uri, document.version);

      expect(result.ast).to.not.be.null;
      expect(result.ast!.type).to.equal('source_file');
      expect(result.diagnostics).to.have.length(0);
    });

    it('should extract symbols correctly', () => {
      const content = `agent SymbolTest
  display-name: "Symbol Test"
  
  flow MainFlow
    start -> end
    
  messages
    welcome: "Welcome!"`;

      const document = TextDocument.create('file:///test.rcl', 'rcl', 1, content);
      const result = parser.parseDocument(document.getText(), document.uri, document.version);

      expect(result.symbols).to.have.length(1);
      expect(result.symbols[0].name).to.equal('SymbolTest');
      expect(result.symbols[0].kind).to.equal('agent');
    });

    it('should handle comments and empty lines', () => {
      const content = `# This is a comment
agent CommentTest
  # Another comment
  display-name: "Comment Test"
  
  # Flow comment
  flow TestFlow
    # Transition comment
    start -> greeting
    
  messages
    greeting: "Hello!"
    # End comment`;

      const document = TextDocument.create('file:///test.rcl', 'rcl', 1, content);
      const result = parser.parseDocument(document.getText(), document.uri, document.version);

      expect(result.ast).to.not.be.null;
      expect(result.ast!.type).to.equal('source_file');
      expect(result.diagnostics).to.have.length(0);
    });

    it('should handle position-based node finding', () => {
      const content = `agent PositionTest
  display-name: "Position Test"
  
  flow TestFlow
    start -> greeting
    
  messages
    greeting: "Hello!"`;

      const document = TextDocument.create('file:///test.rcl', 'rcl', 1, content);
      const result = parser.parseDocument(document.getText(), document.uri, document.version);

      // Test finding node at position (line 0, character 6 - should be in "agent")
      const nodeAtAgent = parser.getNodeAt(result, 0, 6);
      expect(nodeAtAgent).to.not.be.null;
      expect(nodeAtAgent!.type).to.equal('agent_definition');

      // Test finding node at position (line 1, character 2 - should be in property)
      const nodeAtProperty = parser.getNodeAt(result, 1, 2);
      expect(nodeAtProperty).to.not.be.null;
    });
  });

  describe('Cache Management', () => {
    it('should cache parsed documents correctly', () => {
      const content = `agent CacheTest
  display-name: "Cache Test"
  
  messages
    test: "Test message"`;

      const document = TextDocument.create('file:///cache-test.rcl', 'rcl', 1, content);
      
      // Parse first time
      const result1 = parser.parseDocument(document.getText(), document.uri, document.version);
      
      // Parse same document again (should use cache)
      const result2 = parser.parseDocument(document.getText(), document.uri, document.version);
      
      expect(result1).to.equal(result2);
    });

    it('should invalidate cache when document version changes', () => {
      const content = `agent VersionTest
  display-name: "Version Test"
  
  messages
    test: "Test message"`;

      const document1 = TextDocument.create('file:///version-test.rcl', 'rcl', 1, content);
      const document2 = TextDocument.create('file:///version-test.rcl', 'rcl', 2, content);
      
      const result1 = parser.parseDocument(document1.getText(), document1.uri, document1.version);
      const result2 = parser.parseDocument(document2.getText(), document2.uri, document2.version);
      
      expect(result1).to.not.equal(result2);
      expect(result1.version).to.equal(1);
      expect(result2.version).to.equal(2);
    });

    it('should clear cache correctly', () => {
      const content = `agent ClearTest
  display-name: "Clear Test"
  
  messages
    test: "Test message"`;

      const document = TextDocument.create('file:///clear-test.rcl', 'rcl', 1, content);
      
      // Parse and cache
      parser.parseDocument(document.getText(), document.uri, document.version);
      
      // Clear cache
      parser.clearCache('file:///clear-test.rcl');
      
      // This should work without errors even after cache clear
      const result = parser.parseDocument(document.getText(), document.uri, document.version);
      expect(result).to.not.be.null;
    });
  });
});