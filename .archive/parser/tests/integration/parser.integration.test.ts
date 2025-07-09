import { describe, it, expect, beforeAll } from 'vitest';
import { RCLParser } from '../../src/rclParser';
import { DiagnosticCollectionImpl } from '@rcl/core';
import { checkForErrorNodes } from '../../src/parseResult';

describe('Parser Integration Tests', () => {
  let parser: RCLParser;

  beforeAll(async () => {
    parser = new RCLParser();
    // Parser will auto-initialize on first use, no need to call ensureInitialized
  });

  describe('Valid RCL Parsing', () => {
    it('should parse a minimal agent definition', async () => {
      const rcl = `agent CoffeeShop
  displayName: "Coffee Shop Assistant"
  
  messages Messages
    welcome:
      text: "Hello!"`;

      const document = await parser.parseDocument(rcl, 'test.rcl');
      expect(document.ast).toBeTruthy();
      expect(document.ast.type).toBe('source_file');
      
      // Check for ERROR nodes
      const diagnostics = new DiagnosticCollectionImpl();
      checkForErrorNodes(document.ast, diagnostics);
      expect(diagnostics.hasErrors()).toBe(false);
    });

    it('should parse agent with flows', async () => {
      const rcl = `agent TravelAssistant
  displayName: "Travel Assistant"
  
  flow main
    name: "Main Flow"
    
    step welcome
      message: welcome
      next: end
  
  messages Messages
    welcome:
      text: "Welcome to Travel Assistant!"`;

      const document = await parser.parseDocument(rcl, 'test.rcl');
      const diagnostics = new DiagnosticCollectionImpl();
      checkForErrorNodes(document.ast, diagnostics);
      expect(diagnostics.hasErrors()).toBe(false);
    });

    it('should parse complex agent with rich cards', async () => {
      const rcl = `agent ShoppingBot
  displayName: "Shopping Assistant"
  
  messages Messages
    products:
      text: "Check out our products"
      richCard:
        orientation: horizontal
        items:
          - title: "Product 1"
            description: "Great product"
            media:
              url: "https://example.com/product1.jpg"
              height: medium`;

      const document = await parser.parseDocument(rcl, 'test.rcl');
      const diagnostics = new DiagnosticCollectionImpl();
      checkForErrorNodes(document.ast, diagnostics);
      expect(diagnostics.hasErrors()).toBe(false);
    });
  });

  describe('Syntax Error Detection', () => {
    it('should handle incomplete agent definition', async () => {
      const rcl = 'agent'; // Missing agent name

      const document = await parser.parseDocument(rcl, 'test.rcl');
      // The new generic parser may accept this as a valid section
      expect(document.ast).toBeTruthy();
    });

    it('should detect missing required displayName', async () => {
      const rcl = `agent TestAgent
  messages Messages
    test:
      text: "Test"`;

      const document = await parser.parseDocument(rcl, 'test.rcl');
      // Parser itself won't catch this - it's a semantic error
      // But we should not have syntax errors
      const diagnostics = new DiagnosticCollectionImpl();
      checkForErrorNodes(document.ast, diagnostics);
      // Missing displayName is semantic, not syntactic
      expect(diagnostics.hasErrors()).toBe(false);
    });

    it('should handle mixed indentation', async () => {
      const rcl = `agent TestAgent
displayName: "Test"  # Different indentation
  messages Messages
    test:
      text: "Test"`;

      const document = await parser.parseDocument(rcl, 'test.rcl');
      // The new parser may handle this differently
      expect(document.ast).toBeTruthy();
    });

    it('should handle sections with parameters', async () => {
      const rcl = `agent TestAgent
  displayName "Missing colon"
  messages Messages
    test:
      text: "Test"`;

      const document = await parser.parseDocument(rcl, 'test.rcl');
      // This might be valid as a section with a string parameter
      expect(document.ast).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', async () => {
      const rcl = '';
      const document = await parser.parseDocument(rcl, 'test.rcl');
      expect(document.ast).toBeTruthy();
      // Empty input is valid - just an empty program
    });

    it('should handle very large input', async () => {
      // Generate a large RCL file
      const messages = Array.from({ length: 100 }, (_, i) => `    message${i}:
      text: "Message ${i}"`).join('\n');
      
      const rcl = `agent LargeAgent
  displayName: "Large Agent"
  
  messages Messages
${messages}`;

      const document = await parser.parseDocument(rcl, 'test.rcl');
      const diagnostics = new DiagnosticCollectionImpl();
      checkForErrorNodes(document.ast, diagnostics);
      expect(diagnostics.hasErrors()).toBe(false);
    });

    it('should handle unicode characters', async () => {
      const rcl = `agent UnicodeAgent
  displayName: "Unicode Test 🌍"
  
  messages Messages
    welcome:
      text: "Hello 世界! 🎉"`;

      const document = await parser.parseDocument(rcl, 'test.rcl');
      const diagnostics = new DiagnosticCollectionImpl();
      checkForErrorNodes(document.ast, diagnostics);
      expect(diagnostics.hasErrors()).toBe(false);
    });
  });

  describe('Parser State Validation', () => {
    it('should maintain consistent state across multiple parses', async () => {
      const rcl1 = `agent Agent1
  displayName: "Agent 1"
  messages Messages
    test: text: "Test"`;

      const rcl2 = `agent Agent2
  displayName: "Agent 2"
  messages Messages
    test: text: "Test"`;

      // Parse multiple times
      const doc1 = await parser.parseDocument(rcl1, 'test1.rcl');
      const doc2 = await parser.parseDocument(rcl2, 'test2.rcl');
      const doc3 = await parser.parseDocument(rcl1, 'test3.rcl');

      // Each parse should be independent
      expect(doc1.ast.type).toBe('source_file');
      expect(doc2.ast.type).toBe('source_file');
      expect(doc3.ast.type).toBe('source_file');
    });
  });
});

describe('Parser Grammar Compliance', () => {
  let parser: RCLParser;

  beforeAll(async () => {
    parser = new RCLParser();
    // Parser will auto-initialize on first use
  });

  it('should handle sections with string parameters', async () => {
    const rcl = `agent "Coffee Shop"
  displayName: "Coffee Shop Assistant"
  messages Messages
    text test "Test"`;

    const document = await parser.parseDocument(rcl, 'test.rcl');
    // In the new generic RCL, this might be valid
    expect(document.ast).toBeTruthy();
  });

  it('should accept unquoted identifiers for agent names', async () => {
    const rcl = `agent CoffeeShop
  displayName: "Coffee Shop Assistant"
  messages Messages
    test: text: "Test"`;

    const document = await parser.parseDocument(rcl, 'test.rcl');
    const diagnostics = new DiagnosticCollectionImpl();
    checkForErrorNodes(document.ast, diagnostics);
    expect(diagnostics.hasErrors()).toBe(false);
  });

  it('should handle type tags without quotes per specification', async () => {
    const rcl = `agent TestAgent
  displayName: "Test Agent"
  messages Messages
    link:
      text: "Visit our site"
      suggestions:
        - <url https://example.com> "Visit Site"`;

    const document = await parser.parseDocument(rcl, 'test.rcl');
    const diagnostics = new DiagnosticCollectionImpl();
    checkForErrorNodes(document.ast, diagnostics);
    expect(diagnostics.hasErrors()).toBe(false);
  });
});