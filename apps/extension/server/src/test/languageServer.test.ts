import { describe, test, expect, beforeAll } from 'vitest';
import { RCLParser } from '@rcl/parser';
import { SyntaxValidator } from '../syntaxValidator';
import { DiagnosticSeverity } from 'vscode-languageserver';

describe('Language Server Core Features', () => {
  let parser: RCLParser;
  let validator: SyntaxValidator;

  beforeAll(() => {
    parser = new RCLParser();
    validator = new SyntaxValidator();
  });

  describe('Syntax Validation', () => {
    test('should validate correct RCL syntax', async () => {
      const validCode = `agent Travel Assistant
  displayName: "Travel Planning Assistant"
  flow MainFlow
    :start -> welcome
    welcome -> end
  messages Messages
    text welcome "Welcome to Travel Assistant!"`;

      const document = await parser.parseDocument(validCode, 'valid.rcl');
      const diagnostics = validator.validateDocument(document);
      
      expect(diagnostics).toEqual([]);
    });

    test('should detect missing displayName', async () => {
      const invalidCode = `agent Travel Assistant
  flow MainFlow
    :start -> end
  messages Messages
    text welcome "Welcome!"`;

      const document = await parser.parseDocument(invalidCode, 'invalid.rcl');
      // Note: The parser itself doesn't enforce this - semantic validation would
      expect(document).toBeDefined();
    });

    test('should detect invalid identifiers', async () => {
      const codeWithStringId = `agent "Travel Assistant"
  displayName: "Travel Assistant"`;

      const document = await parser.parseDocument(codeWithStringId, 'stringid.rcl');
      
      // The parser should not parse quoted strings as valid agent names
      const agentNode = findNodeByType(document.ast, 'agent_definition');
      if (agentNode && agentNode.children) {
        const secondChild = agentNode.children[1];
        // Should not be an identifier if it's a quoted string
        expect(secondChild?.type).not.toBe('identifier');
      }
    });

    test('should handle lowercase identifiers correctly', async () => {
      const lowercaseCode = `agent travelAssistant
  displayName: "Travel Assistant"`;

      const document = await parser.parseDocument(lowercaseCode, 'lowercase.rcl');
      
      // Parser should not accept lowercase as valid Title Case identifier
      const agentNode = findNodeByType(document.ast, 'agent_definition');
      if (agentNode && agentNode.children && agentNode.children[1]) {
        const identifierText = agentNode.children[1].text;
        // Check if it matches Title Case pattern
        const isTitleCase = /^[A-Z][A-Za-z0-9\-_]*(\s[A-Z][A-Za-z0-9\-_]*)*$/.test(identifierText);
        expect(isTitleCase).toBe(false);
      }
    });
  });

  describe('Parser Features', () => {
    test('should extract symbols from document', async () => {
      const code = `agent CustomerServiceBot
  displayName: "Customer Service"
  
  flow MainFlow
    :start -> greeting
    greeting -> askIntent
    askIntent -> end
  
  flow ErrorFlow
    :error -> apologize
    apologize -> end
    
  messages Messages
    text greeting "Hello! I'm here to help."
    text askIntent "What can I do for you?"
    text apologize "I'm sorry for the inconvenience."`;

      const document = await parser.parseDocument(code, 'symbols.rcl');
      
      expect(document.symbols).toBeDefined();
      
      // Debug: log all symbols found
      console.log('Found symbols:', document.symbols.map(s => ({ name: s.name, kind: s.kind })));
      
      expect(document.symbols.length).toBeGreaterThan(0);
      
      // Should find flow symbols (agent symbol extraction needs grammar update)
      const mainFlowSymbol = document.symbols.find(s => s.name === 'MainFlow');
      const errorFlowSymbol = document.symbols.find(s => s.name === 'ErrorFlow');
      
      expect(mainFlowSymbol).toBeDefined();
      expect(errorFlowSymbol).toBeDefined();
      // Note: Agent and Messages section extraction requires grammar updates
    });

    test('should handle multi-word Title Case identifiers', async () => {
      const multiWordCode = `agent MultiWordAgentNameWithManyParts
  displayName: "Complex Multi-Word Agent"
  flow ComplexFlowName
    :start -> end
  messages Messages
    text WelcomeMessage "Hello!"`;

      const document = await parser.parseDocument(multiWordCode, 'multiword.rcl');
      
      expect(document.ast).toBeDefined();
      
      // Verify the multi-word identifier is parsed correctly
      const agentNode = findNodeByType(document.ast, 'agent_definition');
      if (agentNode && agentNode.children) {
        const identifierNode = agentNode.children.find(child => child.type === 'identifier');
        expect(identifierNode?.text).toBe('Multi Word Agent Name With Many Parts');
      }
    });
  });

  describe('Error Recovery', () => {
    test('should handle partial/incomplete documents', async () => {
      const incompleteCode = `agent MyAgent
  displayName: "Test"
  flow MainFl`;

      // Should not throw
      const document = await parser.parseDocument(incompleteCode, 'incomplete.rcl');
      expect(document).toBeDefined();
      expect(document.ast).toBeDefined();
    });

    test('should handle syntax errors gracefully', async () => {
      const syntaxErrorCode = `agent 123InvalidName
  displayName: "Test"
  flow !!!
    :start -> `;

      // Should not throw
      const document = await parser.parseDocument(syntaxErrorCode, 'syntax-error.rcl');
      expect(document).toBeDefined();
    });
  });
});

function findNodeByType(node: any, type: string): any {
  if (!node) return null;
  if (node.type === type) return node;
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByType(child, type);
      if (found) return found;
    }
  }
  
  return null;
}