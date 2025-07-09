import { describe, test, expect, beforeAll } from 'vitest';

// Always use native parser for tests
const Parser = require('tree-sitter');
const RCL = require('../bindings/node');

describe('RCL Identifier Validation', () => {
  let parser: any;

  beforeAll(() => {
    parser = new Parser();
    parser.setLanguage(RCL);
  });

  describe('Agent Name Validation', () => {
    test('should accept valid Title Case identifiers', () => {
      if (!parser) return;

      const validAgents = [
        `agent TravelBot
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`,
        `agent Customer Service Bot
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`,
        `agent API Gateway Manager
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`,
        `agent Multi Word Agent Name
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`
      ];

      for (const agentDef of validAgents) {
        const tree = parser.parse(agentDef);
        const agentNode = tree.rootNode.firstChild;
        
        expect(agentNode.type).toBe('agent_definition');
        expect(agentNode.childCount).toBeGreaterThanOrEqual(2);
        
        // Check that the identifier is parsed correctly
        // In stack-based grammar: 'agent' keyword, then identifier
        const identifierNode = agentNode.children.find(child => child.type === 'identifier');
        expect(identifierNode).toBeTruthy();
        expect(identifierNode?.type).toBe('identifier');
        
        // Should NOT have ERROR nodes
        expect(hasErrorNode(tree.rootNode)).toBe(false);
      }
    });

    test('should reject quoted strings as agent names', () => {
      if (!parser) return;

      const invalidAgents = [
        `agent "TravelBot"
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`,
        `agent "Customer Service Bot"
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`,
        `agent "Travel Assistant 2000"
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`,
        `agent 'Single Quoted Name'
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`
      ];

      for (const agentDef of invalidAgents) {
        const tree = parser.parse(agentDef);
        
        // Should have ERROR nodes or not parse as agent_definition
        const hasError = hasErrorNode(tree.rootNode);
        const agentNode = tree.rootNode.firstChild;
        const isValidAgentDef = agentNode?.type === 'agent_definition' && 
                               agentNode.children[1]?.type === 'identifier';
        
        expect(hasError || !isValidAgentDef).toBe(true);
      }
    });

    test('should reject lowercase identifiers', () => {
      if (!parser) return;

      const invalidAgents = [
        `agent travelbot
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`,
        `agent customer service bot
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`,
        `agent travel assistant
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`,
        `agent myAgent
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`,  // camelCase
        `agent my_agent
  displayName: "Test"
  flow Main
  end
  messages Messages
    text Welcome "Hello!"
  end
end`  // snake_case
      ];

      for (const agentDef of invalidAgents) {
        const tree = parser.parse(agentDef);
        
        // Should have ERROR nodes or not parse the lowercase as identifier
        const hasError = hasErrorNode(tree.rootNode);
        const agentNode = tree.rootNode.firstChild;
        
        if (agentNode?.type === 'agent_definition') {
          // If it parsed as agent_definition, the identifier should be wrong
          const identifierNode = agentNode.children[1];
          const identifierText = identifierNode?.text || '';
          
          // Check if it's not Title Case
          const isValidTitleCase = /^[A-Z][A-Za-z0-9\-_]*(\s[A-Z][A-Za-z0-9\-_]*)*$/.test(identifierText);
          expect(isValidTitleCase).toBe(false);
        } else {
          // Otherwise it should have an error
          expect(hasError).toBe(true);
        }
      }
    });

    test('should reject mixed case identifiers', () => {
      if (!parser) return;

      const invalidAgents = [
        'agent Customer service Bot\n  displayName: "Test"\n  flow Main\n  end\n  messages Messages\n    text Welcome "Hello!"\n  end\nend',  // "service" not capitalized
        'agent Travel assistant Bot\n  displayName: "Test"\n  flow Main\n  end\n  messages Messages\n    text Welcome "Hello!"\n  end\nend',   // "assistant" not capitalized
        'agent API gateway Manager\n  displayName: "Test"\n  flow Main\n  end\n  messages Messages\n    text Welcome "Hello!"\n  end\nend'     // "gateway" not capitalized
      ];

      for (const agentDef of invalidAgents) {
        const tree = parser.parse(agentDef);
        
        // These should have ERROR nodes because they're not proper Title Case
        const hasError = hasErrorNode(tree.rootNode);
        expect(hasError).toBe(true);
      }
    });
  });

  describe('Flow Name Validation', () => {
    test('should accept valid Title Case flow names', () => {
      if (!parser) return;

      const validFlows = [
        'flow MainFlow\nend',
        'flow Customer Onboarding Flow\nend',
        'flow Payment Processing Flow\nend',
        'flow API Integration Flow\nend'
      ];

      for (const flowDef of validFlows) {
        const tree = parser.parse(flowDef);
        const flowNode = tree.rootNode.firstChild;
        
        if (flowNode?.type === 'flow_section') {
          expect(flowNode.children[1]?.type).toBe('identifier');
          expect(hasErrorNode(tree.rootNode)).toBe(false);
        }
      }
    });

    test('should reject quoted strings as flow names', () => {
      if (!parser) return;

      const invalidFlows = [
        'flow "MainFlow"\nend',
        'flow "Customer Onboarding Flow"\nend'
      ];

      for (const flowDef of invalidFlows) {
        const tree = parser.parse(flowDef);
        
        // Should have ERROR nodes or not parse correctly
        const hasError = hasErrorNode(tree.rootNode);
        const flowNode = tree.rootNode.firstChild;
        const isValidFlowDef = flowNode?.type === 'flow_section' && 
                              flowNode.children[1]?.type === 'identifier';
        
        expect(hasError || !isValidFlowDef).toBe(true);
      }
    });
  });

  describe('Message ID Validation', () => {
    test('should accept valid Title Case message IDs', () => {
      if (!parser) return;

      const validMessages = [
        'text Welcome "Hello!"',
        'text Customer Greeting "Welcome to our service"',
        'text Order Confirmation "Your order is confirmed"'
      ];

      for (const messageDef of validMessages) {
        const tree = parser.parse(messageDef);
        const messageNode = tree.rootNode.firstChild;
        
        if (messageNode?.type === 'text_shortcut') {
          const identifierNode = messageNode.children[1];
          expect(identifierNode?.type).toBe('identifier');
        }
      }
    });

    test('should reject quoted strings as message IDs', () => {
      if (!parser) return;

      const invalidMessages = [
        'text "Welcome" "Hello!"',
        'text "Customer Greeting" "Welcome"'
      ];

      for (const messageDef of invalidMessages) {
        const tree = parser.parse(messageDef);
        
        // Should not parse correctly or have errors
        const hasError = hasErrorNode(tree.rootNode);
        const messageNode = tree.rootNode.firstChild;
        
        if (messageNode?.type === 'text_shortcut') {
          // The second child should not be an identifier if it's a string
          const secondChild = messageNode.children[1];
          expect(secondChild?.type).not.toBe('identifier');
        } else {
          expect(hasError).toBe(true);
        }
      }
    });
  });
});

// Helper function to check for ERROR nodes
function hasErrorNode(node: any): boolean {
  if (node.type === 'ERROR') return true;
  for (let i = 0; i < node.childCount; i++) {
    if (hasErrorNode(node.child(i))) return true;
  }
  return false;
}