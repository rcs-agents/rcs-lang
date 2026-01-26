import { describe, it, expect, beforeAll } from 'vitest';
import { ParserFactory } from '../../src/factory/parserFactory';
import { Result } from '@rcl/core';
import type { IParser, IParseResult } from '@rcl/core';

describe('Advanced Parser Integration Tests', () => {
  let parser: IParser;

  beforeAll(async () => {
    const result = await ParserFactory.create();
    if (!result.success) {
      throw new Error(`Failed to create parser: ${result.error.message}`);
    }
    parser = result.value;
  });

  describe('Complex Flow Structures', () => {
    it('should parse nested conditional flows', async () => {
      const rcl = `agent ComplexFlowAgent
  displayName: "Complex Flow Test"
  
  flow booking
    name: "Booking Flow"
    
    step askService
      message: serviceQuestion
      next: 
        - if: "\${intent} == 'flight'"
          then: flightBooking
        - if: "\${intent} == 'hotel'"
          then: hotelBooking
        - else: unknown
    
    step flightBooking
      message: flightDetails
      next: confirmBooking
    
    step hotelBooking
      message: hotelDetails
      next: confirmBooking
    
    step confirmBooking
      message: confirmation
      next: end
  
  messages Messages
    serviceQuestion: text: "What would you like to book?"
    flightDetails: text: "Enter flight details"
    hotelDetails: text: "Enter hotel details"
    confirmation: text: "Booking confirmed!"`;

      const result = await parser.parse(rcl, 'test.rcl');
      expect(result.success).toBe(true);
      if (result.success) {
        // Log diagnostics if any for debugging
        if (result.value.diagnostics.length > 0) {
          console.log('Diagnostics:', result.value.diagnostics);
        }
        // For now, just check that parsing succeeded
        expect(result.value.ast.type).toBe('source_file');
      }
    });

    it('should parse flows with complex navigation patterns', async () => {
      const rcl = `agent NavigationAgent
  displayName: "Navigation Test"
  
  flow main
    name: "Main Flow"
    
    step menu
      message: mainMenu
      next:
        - if: "\${selection} == 1"
          then: option1
        - if: "\${selection} == 2"
          then: option2
        - if: "\${selection} == 3"
          then: exit
        - else: menu  # Loop back
    
    step option1
      message: option1Message
      next: menu
    
    step option2
      message: option2Message
      next: submenu
    
    step submenu
      message: submenuMessage
      next: menu
    
    step exit
      message: goodbye
      next: end
  
  messages Messages
    mainMenu: 
      text: "Select an option"
      suggestions:
        - "Option 1"
        - "Option 2"
        - "Exit"
    option1Message: text: "You selected option 1"
    option2Message: text: "You selected option 2"
    submenuMessage: text: "Submenu options"
    goodbye: text: "Thank you!"`;

      const result = await parser.parse(rcl, 'test.rcl');
      expect(result.success).toBe(true);
    });
  });

  describe('Rich Media Content', () => {
    it('should parse complex rich cards with all media types', async () => {
      const rcl = `agent MediaAgent
  displayName: "Media Test"
  
  messages Messages
    showcase:
      text: "Product Showcase"
      richCard:
        orientation: vertical
        items:
          - title: "Video Demo"
            description: "Watch our product in action"
            media:
              url: "https://example.com/demo.mp4"
              height: tall
              contentType: video/mp4
            suggestions:
              - <call 18001234567> "Call Support"
              - <url https://docs.example.com> "View Docs"
          
          - title: "Product Image"
            description: "High resolution product photo"
            media:
              url: "https://example.com/product.jpg"
              height: medium
              thumbnail: "https://example.com/thumb.jpg"
    
    carousel:
      text: "Browse our catalog"
      carousel:
        width: medium
        items:
          - title: "Item 1"
            media:
              url: "https://example.com/item1.jpg"
          - title: "Item 2"
            media:
              url: "https://example.com/item2.jpg"`;

      const result = await parser.parse(rcl, 'test.rcl');
      expect(result.success).toBe(true);
      if (result.success) {
        // Log diagnostics if any for debugging
        if (result.value.diagnostics.length > 0) {
          console.log('Media test diagnostics:', result.value.diagnostics);
        }
        // For now, just check that parsing succeeded
        expect(result.value.ast).toBeTruthy();
      }
    });

    it('should parse standalone rich cards', async () => {
      const rcl = `agent StandaloneCardAgent
  displayName: "Standalone Card Test"
  
  messages Messages
    standaloneHorizontal:
      standaloneCard:
        orientation: horizontal
        title: "Special Offer"
        description: "Limited time deal"
        media:
          url: "https://example.com/offer.jpg"
          height: short
        suggestions:
          - "Buy Now"
          - "Learn More"
    
    standaloneVertical:
      standaloneCard:
        orientation: vertical
        title: "Product Details"
        description: "Full specifications"
        media:
          url: "https://example.com/specs.pdf"
          contentType: application/pdf`;

      const result = await parser.parse(rcl, 'test.rcl');
      expect(result.success).toBe(true);
    });
  });

  describe('Imports and Modularization', () => {
    it('should parse agents with imports', async () => {
      const rcl = `import CommonMessages from "./common/messages.rcl"
import SharedFlows from "./common/flows.rcl"

agent ModularAgent
  displayName: "Modular Agent"
  
  flow main extends SharedFlows.baseFlow
    name: "Extended Main Flow"
    
    step welcome
      message: CommonMessages.greeting
      next: customStep
    
    step customStep
      message: localMessage
      next: end
  
  messages Messages
    localMessage: text: "This is a local message"`;

      const result = await parser.parse(rcl, 'test.rcl');
      expect(result.success).toBe(true);
    });

    it('should parse multiple imports with aliases', async () => {
      const rcl = `import { Message1, Message2 } from "./messages.rcl"
import * as Common from "./common.rcl"
import Default from "./default.rcl"

agent ImportTestAgent
  displayName: "Import Test"
  
  messages Messages
    msg1: extends Message1
    msg2: extends Message2
    common: extends Common.BaseMessage`;

      const result = await parser.parse(rcl, 'test.rcl');
      expect(result.success).toBe(true);
    });
  });

  describe('Advanced Suggestions', () => {
    it('should parse all suggestion types', async () => {
      const rcl = `agent SuggestionAgent
  displayName: "Suggestion Test"
  
  messages Messages
    actions:
      text: "Choose an action"
      suggestions:
        - "Simple Text"
        - <call 18001234567> "Call Us"
        - <url https://example.com> "Visit Website"
        - <location 37.7749,-122.4194> "Our Location"
        - <calendar 2024-12-25T10:00:00Z> "Book Appointment"
        - <reply "Yes"> "Confirm"
        - <postback confirm_action> "Confirm Action"`;

      const result = await parser.parse(rcl, 'test.rcl');
      expect(result.success).toBe(true);
    });
  });

  describe('Collections and Lists', () => {
    it('should parse collections with complex items', async () => {
      const rcl = `agent CollectionAgent
  displayName: "Collection Test"
  
  config Config
    supportedChannels: [whatsapp, rcs, telegram]
    features:
      - messaging
      - richCards
      - payments
    settings:
      timeout: 30
      retries: 3
      endpoints:
        webhook: "https://api.example.com/webhook"
        status: "https://api.example.com/status"
  
  messages Messages
    productList:
      text: "Available products:"
      items:
        - name: "Product A"
          price: 99.99
          inStock: true
          tags: [electronics, popular]
        - name: "Product B"
          price: 149.99
          inStock: false
          tags: [accessories]`;

      const result = await parser.parse(rcl, 'test.rcl');
      expect(result.success).toBe(true);
    });
  });

  describe('Embedded JavaScript', () => {
    it('should parse embedded JS in conditions', async () => {
      const rcl = `agent JSAgent
  displayName: "JavaScript Test"
  
  flow dynamic
    name: "Dynamic Flow"
    
    step calculate
      message: askNumber
      next:
        - if: |
            const num = parseInt(\${userInput});
            return !isNaN(num) && num > 0 && num <= 100;
          then: validNumber
        - else: invalidNumber
    
    step validNumber
      message: result
      transform: |
        const num = parseInt(\${userInput});
        return {
          square: num * num,
          cube: num * num * num,
          sqrt: Math.sqrt(num).toFixed(2)
        };
      next: end
  
  messages Messages
    askNumber: text: "Enter a number between 1 and 100"
    result: text: "Square: \${square}, Cube: \${cube}, Square root: \${sqrt}"
    invalidNumber: text: "Please enter a valid number"`;

      const result = await parser.parse(rcl, 'test.rcl');
      expect(result.success).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('should provide helpful diagnostics for common mistakes', async () => {
      const rcl = `agent ErrorAgent
  displayName: "Error Test"
  
  # Missing colon after messages
  messages Messages
    test text: "Test"`;

      const result = await parser.parse(rcl, 'test.rcl');
      expect(result.success).toBe(true); // Parser is forgiving
      if (result.success) {
        expect(result.value.diagnostics.length).toBeGreaterThan(0);
      }
    });

    it('should handle partial parsing gracefully', async () => {
      const rcl = `agent PartialAgent
  displayName: "Partial Test"
  
  flow main
    name: "Main Flow"
    # Incomplete step definition
    step welcome
      message: welcome
      # Missing next
  
  messages Messages
    welcome: text: "Hello"
    # Rest of messages...`;

      const result = await parser.parse(rcl, 'test.rcl');
      // Should still produce a parse tree, even if incomplete
      expect(result.success).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should handle deeply nested structures efficiently', async () => {
      // Generate deeply nested conditions
      const generateNestedConditions = (depth: number): string => {
        if (depth === 0) return 'then: end';
        return `then: step${depth}
    
    step step${depth}
      message: msg${depth}
      next:
        - if: "\${choice} == ${depth}"
          ${generateNestedConditions(depth - 1)}`;
      };

      const rcl = `agent DeepNestingAgent
  displayName: "Deep Nesting Test"
  
  flow main
    name: "Main Flow"
    
    step start
      message: startMsg
      next:
        - if: "\${choice} == 0"
          ${generateNestedConditions(10)}
  
  messages Messages
    startMsg: text: "Start"
${Array.from({ length: 11 }, (_, i) => `    msg${i}: text: "Message ${i}"`).join('\n')}`;

      const startTime = Date.now();
      const result = await parser.parse(rcl, 'test.rcl');
      const parseTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(parseTime).toBeLessThan(1000); // Should parse in under 1 second
    });

    it('should handle files with many messages efficiently', async () => {
      const messageCount = 500;
      const messages = Array.from({ length: messageCount }, (_, i) => 
        `    msg${i}: 
      text: "Message ${i}"
      suggestions:
        - "Option A"
        - "Option B"`
      ).join('\n');

      const rcl = `agent LargeMessageAgent
  displayName: "Large Message Test"
  
  messages Messages
${messages}`;

      const startTime = Date.now();
      const result = await parser.parse(rcl, 'test.rcl');
      const parseTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(parseTime).toBeLessThan(2000); // Should parse in under 2 seconds
    });
  });

  describe('Platform-specific Features', () => {
    it('should parse RCS-specific features', async () => {
      const rcl = `agent RCSAgent
  displayName: "RCS Features Test"
  
  config Config
    rcsBusinessMessagingAgent:
      description: "Official RCS agent"
      logoUri: "https://example.com/logo.png"
      heroUri: "https://example.com/hero.jpg"
      agentUseCase: PROMOTIONAL
      hostingRegion: EUROPE
  
  messages Messages
    rcsFeatures:
      text: "RCS-specific features"
      richCard:
        orientation: horizontal
        items:
          - title: "RCS Rich Card"
            description: "With RCS actions"
            media:
              url: "https://example.com/rcs.jpg"
            suggestions:
              - <share> "Share"
              - <createCalendarEvent> "Add to Calendar"`;

      const result = await parser.parse(rcl, 'test.rcl');
      expect(result.success).toBe(true);
    });
  });
});

describe('Parser Factory Tests', () => {
  it('should create parser successfully', async () => {
    const result = await ParserFactory.create();
    expect(result.success).toBe(true);
    if (!result.success) return;
    
    const parser = result.value;
    expect(parser).toBeDefined();
    
    // Test basic parsing
    const parseResult = await parser.parse('agent Test\n  displayName: "Test"', 'test.rcl');
    expect(parseResult.success).toBe(true);
  });

  it('should handle concurrent parser creation', async () => {
    const promises = Array.from({ length: 5 }, () => ParserFactory.create());
    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(5);
    results.forEach(result => {
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeDefined();
      }
    });
  });
});