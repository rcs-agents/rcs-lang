import { RCLNode } from '@rcl/parser';

export interface AgentConfig {
  name: string;
  displayName?: string;
  brandName?: string;
  config?: AgentConfigSection;
  defaults?: AgentDefaultsSection;
  flows?: string[];
  messages?: string[];
}

export interface AgentConfigSection {
  description?: string;
  logoUri?: string;
  heroUri?: string;
  phoneNumberEntry?: PhoneNumberEntry;
  emailEntry?: EmailEntry;
  websiteEntry?: WebsiteEntry;
  privacy?: PrivacyEntry;
  termsConditions?: TermsConditionsEntry;
  color?: string;
  billingConfig?: BillingConfig;
  agentUseCase?: string;
  hostingRegion?: string;
}

export interface AgentDefaultsSection {
  fallbackMessage?: string;
  messageTrafficType?: string;
  ttl?: string;
  postbackData?: string;
  expressions?: {
    language?: string;
  };
}

export interface PhoneNumberEntry {
  number: string;
  label?: string;
}

export interface EmailEntry {
  address: string;
  label?: string;
}

export interface WebsiteEntry {
  url: string;
  label?: string;
}

export interface PrivacyEntry {
  url: string;
  label?: string;
}

export interface TermsConditionsEntry {
  url: string;
  label?: string;
}

export interface BillingConfig {
  billingCategory?: string;
}

export class AgentExtractor {
  extractAgentConfig(ast: RCLNode): AgentConfig | null {
    let agentConfig: AgentConfig | null = null;
    
    this.traverseAST(ast, (node) => {
      if (node.type === 'agent_definition') {
        agentConfig = this.parseAgentDefinition(node);
      }
    });
    
    return agentConfig;
  }

  private traverseAST(node: RCLNode, callback: (node: RCLNode) => void): void {
    callback(node);
    if (node.children) {
      node.children.forEach(child => this.traverseAST(child, callback));
    }
  }

  private parseAgentDefinition(node: RCLNode): AgentConfig {
    const agentName = this.extractAgentName(node);
    const config: AgentConfig = {
      name: agentName || 'UnknownAgent',
      flows: [],
      messages: []
    };

    this.traverseAST(node, (child) => {
      // Extract displayName
      if (this.isPropertyNode(child, 'displayName')) {
        config.displayName = this.extractPropertyValue(child);
      }
      
      // Extract brandName
      if (this.isPropertyNode(child, 'brandName')) {
        config.brandName = this.extractPropertyValue(child);
      }
      
      // Extract config section
      if (child.type === 'config_section') {
        config.config = this.parseConfigSection(child);
      }
      
      // Extract defaults section
      if (child.type === 'defaults_section') {
        config.defaults = this.parseDefaultsSection(child);
      }
      
      // Extract flow references
      if (child.type === 'flow_section') {
        const flowName = this.extractFlowName(child);
        if (flowName && !config.flows!.includes(flowName)) {
          config.flows!.push(flowName);
        }
      }
      
      // Extract message references
      if (child.type === 'messages_section') {
        const messageIds = this.extractMessageIds(child);
        config.messages!.push(...messageIds);
      }
    });

    return config;
  }

  private extractAgentName(node: RCLNode): string | null {
    // Agent name should be the second child (identifier)
    if (node.children && node.children.length >= 2) {
      const nameNode = node.children[1];
      if (nameNode.type === 'identifier') {
        return nameNode.text || undefined;
      }
    }
    return null;
  }

  private isPropertyNode(node: RCLNode, propertyName: string): boolean {
    // Check if this is a property node with specific name
    return node.text?.trim().startsWith(`${propertyName}:`) || false;
  }

  private extractPropertyValue(node: RCLNode): string | null {
    // Extract value from property node
    const text = node.text || '';
    const colonIndex = text.indexOf(':');
    if (colonIndex > -1) {
      const value = text.substring(colonIndex + 1).trim();
      return this.cleanStringValue(value);
    }
    return null;
  }

  private parseConfigSection(node: RCLNode): AgentConfigSection {
    const config: AgentConfigSection = {};
    
    this.traverseAST(node, (child) => {
      if (child.type === 'config_property') {
        this.parseConfigProperty(child, config);
      }
    });
    
    return config;
  }

  private parseConfigProperty(node: RCLNode, config: AgentConfigSection): void {
    const text = node.text || '';
    
    if (text.includes('description:')) {
      config.description = this.extractValueFromText(text, 'description:');
    } else if (text.includes('logoUri:')) {
      config.logoUri = this.extractValueFromText(text, 'logoUri:');
    } else if (text.includes('heroUri:')) {
      config.heroUri = this.extractValueFromText(text, 'heroUri:');
    } else if (text.includes('color:')) {
      config.color = this.extractValueFromText(text, 'color:');
    } else if (text.includes('agentUseCase:')) {
      config.agentUseCase = this.extractValueFromText(text, 'agentUseCase:');
    } else if (text.includes('hostingRegion:')) {
      config.hostingRegion = this.extractValueFromText(text, 'hostingRegion:');
    } else if (node.type === 'phone_number_property') {
      config.phoneNumberEntry = this.parsePhoneNumberEntry(node);
    } else if (node.type === 'email_property') {
      config.emailEntry = this.parseEmailEntry(node);
    } else if (node.type === 'website_property') {
      config.websiteEntry = this.parseWebsiteEntry(node);
    } else if (node.type === 'privacy_property') {
      config.privacy = this.parsePrivacyEntry(node);
    } else if (node.type === 'terms_conditions_property') {
      config.termsConditions = this.parseTermsConditionsEntry(node);
    } else if (node.type === 'billing_config_property') {
      config.billingConfig = this.parseBillingConfig(node);
    }
  }

  private parsePhoneNumberEntry(node: RCLNode): PhoneNumberEntry | undefined {
    let number = '';
    let label: string | undefined;
    
    this.traverseAST(node, (child) => {
      if (child.text?.includes('number:')) {
        number = this.extractValueFromText(child.text, 'number:') || '';
      }
      if (child.text?.includes('label:')) {
        label = this.extractValueFromText(child.text, 'label:');
      }
    });
    
    return number ? { number, label } : undefined;
  }

  private parseEmailEntry(node: RCLNode): EmailEntry | undefined {
    let address = '';
    let label: string | undefined;
    
    this.traverseAST(node, (child) => {
      if (child.text?.includes('address:')) {
        address = this.extractValueFromText(child.text, 'address:') || '';
      }
      if (child.text?.includes('label:')) {
        label = this.extractValueFromText(child.text, 'label:');
      }
    });
    
    return address ? { address, label } : undefined;
  }

  private parseWebsiteEntry(node: RCLNode): WebsiteEntry | undefined {
    let url = '';
    let label: string | undefined;
    
    this.traverseAST(node, (child) => {
      if (child.text?.includes('url:')) {
        url = this.extractValueFromText(child.text, 'url:') || '';
      }
      if (child.text?.includes('label:')) {
        label = this.extractValueFromText(child.text, 'label:');
      }
    });
    
    return url ? { url, label } : undefined;
  }

  private parsePrivacyEntry(node: RCLNode): PrivacyEntry | undefined {
    let url = '';
    let label: string | undefined;
    
    this.traverseAST(node, (child) => {
      if (child.text?.includes('url:')) {
        url = this.extractValueFromText(child.text, 'url:') || '';
      }
      if (child.text?.includes('label:')) {
        label = this.extractValueFromText(child.text, 'label:');
      }
    });
    
    return url ? { url, label } : undefined;
  }

  private parseTermsConditionsEntry(node: RCLNode): TermsConditionsEntry | undefined {
    let url = '';
    let label: string | undefined;
    
    this.traverseAST(node, (child) => {
      if (child.text?.includes('url:')) {
        url = this.extractValueFromText(child.text, 'url:') || '';
      }
      if (child.text?.includes('label:')) {
        label = this.extractValueFromText(child.text, 'label:');
      }
    });
    
    return url ? { url, label } : undefined;
  }

  private parseBillingConfig(node: RCLNode): BillingConfig | undefined {
    let billingCategory: string | undefined;
    
    this.traverseAST(node, (child) => {
      if (child.text?.includes('billingCategory:')) {
        billingCategory = this.extractValueFromText(child.text, 'billingCategory:');
      }
    });
    
    return billingCategory ? { billingCategory } : undefined;
  }

  private parseDefaultsSection(node: RCLNode): AgentDefaultsSection {
    const defaults: AgentDefaultsSection = {};
    
    this.traverseAST(node, (child) => {
      if (child.type === 'default_property') {
        this.parseDefaultProperty(child, defaults);
      }
    });
    
    return defaults;
  }

  private parseDefaultProperty(node: RCLNode, defaults: AgentDefaultsSection): void {
    const text = node.text || '';
    
    if (text.includes('fallbackMessage:')) {
      defaults.fallbackMessage = this.extractValueFromText(text, 'fallbackMessage:');
    } else if (text.includes('messageTrafficType:')) {
      defaults.messageTrafficType = this.extractValueFromText(text, 'messageTrafficType:');
    } else if (text.includes('ttl:')) {
      defaults.ttl = this.extractValueFromText(text, 'ttl:');
    } else if (text.includes('postbackData:')) {
      defaults.postbackData = this.extractValueFromText(text, 'postbackData:');
    } else if (text.includes('expressions:')) {
      defaults.expressions = this.parseExpressions(node);
    }
  }

  private parseExpressions(node: RCLNode): { language?: string } {
    const expressions: { language?: string } = {};
    
    this.traverseAST(node, (child) => {
      if (child.text?.includes('language:')) {
        expressions.language = this.extractValueFromText(child.text, 'language:');
      }
    });
    
    return expressions;
  }

  private extractFlowName(node: RCLNode): string | null {
    // Flow name should be the second child (identifier)
    if (node.children && node.children.length >= 2) {
      const nameNode = node.children[1];
      if (nameNode.type === 'identifier') {
        return nameNode.text || undefined;
      }
    }
    return null;
  }

  private extractMessageIds(node: RCLNode): string[] {
    const messageIds: string[] = [];
    
    this.traverseAST(node, (child) => {
      if (child.type === 'text_shortcut') {
        const messageId = this.extractMessageIdFromShortcut(child);
        if (messageId && !messageIds.includes(messageId)) {
          messageIds.push(messageId);
        }
      }
      
      if (child.type === 'agent_message') {
        const messageId = this.extractMessageIdFromAgentMessage(child);
        if (messageId && !messageIds.includes(messageId)) {
          messageIds.push(messageId);
        }
      }
    });
    
    return messageIds;
  }

  private extractMessageIdFromShortcut(node: RCLNode): string | null {
    // Message ID should be the second child (identifier)
    if (node.children && node.children.length >= 2) {
      const idNode = node.children[1];
      if (idNode.type === 'identifier') {
        return idNode.text || undefined;
      }
    }
    return null;
  }

  private extractMessageIdFromAgentMessage(node: RCLNode): string | null {
    // Look for identifier in agent message
    if (node.children) {
      for (const child of node.children) {
        if (child.type === 'identifier') {
          return child.text || undefined;
        }
      }
    }
    return null;
  }

  private extractValueFromText(text: string, property: string): string | null {
    const index = text.indexOf(property);
    if (index > -1) {
      const value = text.substring(index + property.length).trim();
      return this.cleanStringValue(value);
    }
    return null;
  }

  private cleanStringValue(value: string): string {
    return value.replace(/^["']|["']$/g, '').trim();
  }
}