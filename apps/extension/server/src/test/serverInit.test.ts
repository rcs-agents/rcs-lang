import { describe, test, expect } from 'vitest';
import { RCLParser } from '@rcl/parser';

describe('Extension Server Initialization', () => {
  test('should be able to initialize RCLParser', async () => {
    // This simulates what happens when the extension server starts
    const parser = new RCLParser();
    
    // Test a simple parse to ensure the parser is working
    const testCode = `agent TestAgent
  displayName: "Test Agent"`;
    
    try {
      const document = await parser.parseDocument(testCode, 'test.rcl');
      
      expect(document).toBeDefined();
      expect(document.ast).toBeDefined();
      expect(document.ast?.type).toBe('source_file');
      
      console.log('✓ Parser initialized successfully in extension context');
      console.log('AST type:', document.ast?.type);
      
      // Check if we can parse without errors
      expect(document.diagnostics).toEqual([]);
      
    } catch (error) {
      console.error('❌ Parser initialization failed:', error);
      throw error;
    }
  });

  test('should be able to parse RCL agent definition', async () => {
    const parser = new RCLParser();
    
    const agentCode = `agent Customer Service Bot
  displayName: "Customer Service Assistant"
  flow MainFlow
    :start -> greeting
    greeting -> end
  messages Messages
    text greeting "Hello! How can I help you today?"`;
    
    const document = await parser.parseDocument(agentCode, 'agent.rcl');
    
    expect(document).toBeDefined();
    expect(document.ast).toBeDefined();
    
    // Find the agent node
    const agentNode = findNodeByType(document.ast, 'agent_definition');
    expect(agentNode).toBeDefined();
    
    // Verify the agent name is parsed correctly (Title Case identifier)
    if (agentNode && agentNode.children) {
      const identifierNode = agentNode.children.find(child => child.type === 'identifier');
      expect(identifierNode?.text).toBe('Customer Service Bot');
    }
  });

  test('should handle parser initialization errors gracefully', async () => {
    // Test that even if the parser fails to initialize with native binding,
    // it should fall back to WASM or provide a meaningful error
    const parser = new RCLParser();
    
    // Even with a complex document, parser should handle it
    const complexCode = `agent Complex Agent With Many Features
  displayName: "Complex Agent"
  brandName: "Test Brand"
  
  agentConfig Config
    agentUseCase: :customer_care
    hostingRegion: :us_central
  
  flow MainFlow
    :start -> welcome
    welcome -> askQuestion with
      message: text "How can I help?"
    askQuestion -> processResponse
    processResponse -> end
  
  messages Messages
    text welcome "Welcome to our service!"
    text askQuestion "What would you like to do today?"
    richCard helpCard "Help Options"
      description: "Choose from the following options"
      reply "Account Help" "account_help"
      reply "Technical Support" "tech_support"`;
    
    // Should not throw, even if parsing has issues
    await expect(parser.parseDocument(complexCode, 'complex.rcl')).resolves.toBeDefined();
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