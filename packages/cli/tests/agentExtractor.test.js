const { AgentExtractor } = require('../src/legacy/extractors/agentExtractor');

// Note: This test file uses mock AST structures instead of real parser
// No conditional import needed as it doesn't directly use tree-sitter

describe('AgentExtractor', () => {
  let extractor;

  beforeEach(() => {
    extractor = new AgentExtractor();
  });

  const createMockNode = (type, text, children) => ({
    type,
    text,
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: text?.length || 0 },
    children: children || [],
    parent: null
  });

  describe('Basic Agent Configuration', () => {
    it('should extract agent name and displayName', () => {
      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'MyAgent'),
        createMockNode('property', 'displayName: "My Agent Display Name"')
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config).toBeDefined();
      expect(config.name).toBe('MyAgent');
      expect(config.displayName).toBe('My Agent Display Name');
      expect(config.flows).toEqual([]);
      expect(config.messages).toEqual([]);
    });

    it('should require displayName and provide fallback', () => {
      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'TestAgent')
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config).toBeDefined();
      expect(config.name).toBe('TestAgent');
      expect(config.displayName).toBe('TestAgent'); // Fallback to name
    });

    it('should extract brandName when provided', () => {
      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'BrandedAgent'),
        createMockNode('property', 'displayName: "Branded Agent"'),
        createMockNode('property', 'brandName: "My Brand"')
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.brandName).toBe('My Brand');
    });
  });

  describe('RCS Business Messaging Agent Configuration', () => {
    it('should extract basic RCS agent properties', () => {
      const configSection = createMockNode('config_section', undefined, [
        createMockNode('config_property', 'description: "A helpful agent"'),
        createMockNode('config_property', 'logoUri: "https://example.com/logo.png"'),
        createMockNode('config_property', 'heroUri: "https://example.com/hero.jpg"'),
        createMockNode('config_property', 'color: "#FF5722"')
      ]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'TestAgent'),
        createMockNode('property', 'displayName: "Test Agent"'),
        configSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.rcsBusinessMessagingAgent).toBeDefined();
      expect(config.rcsBusinessMessagingAgent.description).toBe('A helpful agent');
      expect(config.rcsBusinessMessagingAgent.logoUri).toBe('https://example.com/logo.png');
      expect(config.rcsBusinessMessagingAgent.heroUri).toBe('https://example.com/hero.jpg');
      expect(config.rcsBusinessMessagingAgent.color).toBe('#FF5722');
    });

    it('should extract and validate agentUseCase', () => {
      const configSection = createMockNode('config_section', undefined, [
        createMockNode('config_property', 'agentUseCase: "TRANSACTIONAL"')
      ]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'TxnAgent'),
        createMockNode('property', 'displayName: "Transaction Agent"'),
        configSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.rcsBusinessMessagingAgent.agentUseCase).toBe('TRANSACTIONAL');
    });

    it('should reject invalid agentUseCase values', () => {
      const configSection = createMockNode('config_section', undefined, [
        createMockNode('config_property', 'agentUseCase: "INVALID_USE_CASE"')
      ]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'TestAgent'),
        createMockNode('property', 'displayName: "Test Agent"'),
        configSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.rcsBusinessMessagingAgent?.agentUseCase).toBeUndefined();
    });

    it('should extract and validate hostingRegion', () => {
      const configSection = createMockNode('config_section', undefined, [
        createMockNode('config_property', 'hostingRegion: "NORTH_AMERICA"')
      ]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'NAAgent'),
        createMockNode('property', 'displayName: "North America Agent"'),
        configSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.rcsBusinessMessagingAgent.hostingRegion).toBe('NORTH_AMERICA');
    });
  });

  describe('Contact Information Arrays', () => {
    it('should extract phone numbers array', () => {
      const phoneNumbersProperty = createMockNode('phone_numbers_property', undefined, [
        createMockNode('phone_entry', undefined, [
          createMockNode('property', 'number: "+1-800-555-0123"'),
          createMockNode('property', 'label: "Customer Support"')
        ]),
        createMockNode('phone_entry', undefined, [
          createMockNode('property', 'number: "+1-800-555-0124"'),
          createMockNode('property', 'label: "Sales"')
        ])
      ]);

      const configSection = createMockNode('config_section', undefined, [phoneNumbersProperty]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'ContactAgent'),
        createMockNode('property', 'displayName: "Contact Agent"'),
        configSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.rcsBusinessMessagingAgent.phoneNumbers).toHaveLength(2);
      expect(config.rcsBusinessMessagingAgent.phoneNumbers[0]).toEqual({
        number: '+1-800-555-0123',
        label: 'Customer Support'
      });
      expect(config.rcsBusinessMessagingAgent.phoneNumbers[1]).toEqual({
        number: '+1-800-555-0124',
        label: 'Sales'
      });
    });

    it('should extract emails array', () => {
      const emailsProperty = createMockNode('emails_property', undefined, [
        createMockNode('email_entry', undefined, [
          createMockNode('property', 'address: "support@example.com"'),
          createMockNode('property', 'label: "Support"')
        ]),
        createMockNode('email_entry', undefined, [
          createMockNode('property', 'address: "sales@example.com"')
        ])
      ]);

      const configSection = createMockNode('config_section', undefined, [emailsProperty]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'EmailAgent'),
        createMockNode('property', 'displayName: "Email Agent"'),
        configSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.rcsBusinessMessagingAgent.emails).toHaveLength(2);
      expect(config.rcsBusinessMessagingAgent.emails[0]).toEqual({
        address: 'support@example.com',
        label: 'Support'
      });
      expect(config.rcsBusinessMessagingAgent.emails[1]).toEqual({
        address: 'sales@example.com'
      });
    });

    it('should extract websites array', () => {
      const websitesProperty = createMockNode('websites_property', undefined, [
        createMockNode('web_entry', undefined, [
          createMockNode('property', 'url: "https://example.com"'),
          createMockNode('property', 'label: "Main Website"')
        ]),
        createMockNode('web_entry', undefined, [
          createMockNode('property', 'url: "https://support.example.com"'),
          createMockNode('property', 'label: "Support Portal"')
        ])
      ]);

      const configSection = createMockNode('config_section', undefined, [websitesProperty]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'WebAgent'),
        createMockNode('property', 'displayName: "Web Agent"'),
        configSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.rcsBusinessMessagingAgent.websites).toHaveLength(2);
      expect(config.rcsBusinessMessagingAgent.websites[0]).toEqual({
        url: 'https://example.com',
        label: 'Main Website'
      });
      expect(config.rcsBusinessMessagingAgent.websites[1]).toEqual({
        url: 'https://support.example.com',
        label: 'Support Portal'
      });
    });
  });

  describe('Privacy and Terms Configuration', () => {
    it('should extract privacy and terms conditions as WebEntry', () => {
      const configSection = createMockNode('config_section', undefined, [
        createMockNode('privacy_property', undefined, [
          createMockNode('property', 'url: "https://example.com/privacy"'),
          createMockNode('property', 'label: "Privacy Policy"')
        ]),
        createMockNode('terms_conditions_property', undefined, [
          createMockNode('property', 'url: "https://example.com/terms"'),
          createMockNode('property', 'label: "Terms of Service"')
        ])
      ]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'LegalAgent'),
        createMockNode('property', 'displayName: "Legal Agent"'),
        configSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.rcsBusinessMessagingAgent.privacy).toEqual({
        url: 'https://example.com/privacy',
        label: 'Privacy Policy'
      });
      expect(config.rcsBusinessMessagingAgent.termsConditions).toEqual({
        url: 'https://example.com/terms',
        label: 'Terms of Service'
      });
    });
  });

  describe('Billing Configuration', () => {
    it('should extract and validate billing configuration', () => {
      const configSection = createMockNode('config_section', undefined, [
        createMockNode('billing_config_property', undefined, [
          createMockNode('property', 'billingCategory: "CONVERSATIONAL"')
        ])
      ]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'BillingAgent'),
        createMockNode('property', 'displayName: "Billing Agent"'),
        configSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.rcsBusinessMessagingAgent.billingConfig).toEqual({
        billingCategory: 'CONVERSATIONAL'
      });
    });

    it('should reject invalid billing categories', () => {
      const configSection = createMockNode('config_section', undefined, [
        createMockNode('billing_config_property', undefined, [
          createMockNode('property', 'billingCategory: "INVALID_CATEGORY"')
        ])
      ]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'TestAgent'),
        createMockNode('property', 'displayName: "Test Agent"'),
        configSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.rcsBusinessMessagingAgent?.billingConfig).toBeUndefined();
    });
  });

  describe('Flow and Message References', () => {
    it('should extract flow references', () => {
      const flowSection = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'WelcomeFlow')
      ]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'FlowAgent'),
        createMockNode('property', 'displayName: "Flow Agent"'),
        flowSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.flows).toContain('WelcomeFlow');
    });

    it('should extract message references from messages section', () => {
      const messagesSection = createMockNode('messages_section', undefined, [
        createMockNode('text_shortcut', undefined, [
          createMockNode('identifier', 'text'),
          createMockNode('identifier', 'WelcomeMessage')
        ]),
        createMockNode('agent_message', undefined, [
          createMockNode('identifier', 'agentMessage'),
          createMockNode('identifier', 'FullMessage')
        ])
      ]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'MessageAgent'),
        createMockNode('property', 'displayName: "Message Agent"'),
        messagesSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.messages).toContain('WelcomeMessage');
      expect(config.messages).toContain('FullMessage');
    });

    it('should avoid duplicate message and flow references', () => {
      const flowSection1 = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'DuplicateFlow')
      ]);

      const flowSection2 = createMockNode('flow_section', undefined, [
        createMockNode('identifier', 'flow'),
        createMockNode('identifier', 'DuplicateFlow')
      ]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'DupAgent'),
        createMockNode('property', 'displayName: "Duplicate Agent"'),
        flowSection1,
        flowSection2
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.flows).toEqual(['DuplicateFlow']); // No duplicates
    });
  });

  describe('Complete Agent Configuration', () => {
    it('should extract a complete agent configuration', () => {
      const configSection = createMockNode('config_section', undefined, [
        createMockNode('config_property', 'description: "Full-featured agent"'),
        createMockNode('config_property', 'logoUri: "https://example.com/logo.png"'),
        createMockNode('config_property', 'agentUseCase: "MULTI_USE"'),
        createMockNode('config_property', 'hostingRegion: "EUROPE"'),
        createMockNode('phone_numbers_property', undefined, [
          createMockNode('phone_entry', undefined, [
            createMockNode('property', 'number: "+44-20-1234-5678"'),
            createMockNode('property', 'label: "UK Support"')
          ])
        ]),
        createMockNode('billing_config_property', undefined, [
          createMockNode('property', 'billingCategory: "CONVERSATIONAL"')
        ])
      ]);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'CompleteAgent'),
        createMockNode('property', 'displayName: "Complete Agent Example"'),
        createMockNode('property', 'brandName: "Example Brand"'),
        configSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config).toEqual({
        name: 'CompleteAgent',
        displayName: 'Complete Agent Example',
        brandName: 'Example Brand',
        rcsBusinessMessagingAgent: {
          description: 'Full-featured agent',
          logoUri: 'https://example.com/logo.png',
          agentUseCase: 'MULTI_USE',
          hostingRegion: 'EUROPE',
          phoneNumbers: [{
            number: '+44-20-1234-5678',
            label: 'UK Support'
          }],
          billingConfig: {
            billingCategory: 'CONVERSATIONAL'
          }
        },
        flows: [],
        messages: []
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing agent definition gracefully', () => {
      const emptyNode = createMockNode('source_file', undefined, []);

      const config = extractor.extractAgentConfig(emptyNode);

      expect(config).toBeNull();
    });

    it('should handle malformed agent definition', () => {
      const malformedAgent = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent')
        // Missing agent name
      ]);

      const config = extractor.extractAgentConfig(malformedAgent);

      expect(config).toBeDefined();
      expect(config.name).toBeUndefined();
      expect(config.displayName).toBe('UnknownAgent'); // Fallback
    });

    it('should handle empty config sections gracefully', () => {
      const emptyConfigSection = createMockNode('config_section', undefined, []);

      const agentNode = createMockNode('agent_definition', undefined, [
        createMockNode('identifier', 'agent'),
        createMockNode('identifier', 'EmptyAgent'),
        createMockNode('property', 'displayName: "Empty Agent"'),
        emptyConfigSection
      ]);

      const config = extractor.extractAgentConfig(agentNode);

      expect(config.rcsBusinessMessagingAgent).toBeUndefined();
    });
  });
});