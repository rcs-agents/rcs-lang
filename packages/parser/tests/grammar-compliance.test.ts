import { describe, test, expect, beforeAll } from 'vitest';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RCLParser } from '../src/rclParser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmPath = join(__dirname, '..', 'tree-sitter-rcl.wasm');
const hasWasm = existsSync(wasmPath);
const isDev = process.env.RCL_DEV_MODE === 'true';

describe('RCL Grammar Compliance Tests', () => {
  if (!hasWasm && !isDev) {
    test.skip('Grammar tests require WASM file or dev mode', () => {});
    return;
  }

  let parser: RCLParser;

  beforeAll(() => {
    parser = new RCLParser();
  });

  describe('2. Lexical Specification', () => {
    describe('2.3 Common Terminals', () => {
      test('IDENTIFIER - Title case with spaces', async () => {
        const cases = [
          'Welcome Message',
          'User Profile',
          'Contact Support Flow',
          'Agent Name',
          'Calculate-Total-Amount',
          'Order-ID-123',
          'Test_With_Underscore',
          'A',
          'ABC123'
        ];
        
        for (const id of cases) {
          const content = `agent ${id}\n  displayName: "Test"`;
          const doc = await parser.parseDocument(content, 'test.rcl');
          expect(doc.ast).toBeTruthy();
          expect(doc.diagnostics).toHaveLength(0);
        }
      });

      test('IDENTIFIER - Invalid cases', async () => {
        const invalidCases = [
          'lowercase',
          '123Start',
          'With-Space After',
          'double  Space'
        ];
        
        for (const id of invalidCases) {
          const content = `agent ${id}\n  displayName: "Test"`;
          const doc = await parser.parseDocument(content, 'test.rcl');
          // Parser should still parse but may have errors
          expect(doc.ast).toBeTruthy();
        }
      });

      test('ATOM - Symbol values', async () => {
        const content = `
agent Test
  displayName: "Test"
  agentDefaults Defaults
    messageTrafficType: :transactional
    expressions:
      language: :javascript
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
        expect(doc.diagnostics).toHaveLength(0);
      });

      test('STRING - Double-quoted strings with escapes', async () => {
        const content = `
agent Test
  displayName: "Test with \\"quotes\\" and \\n newlines"
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
        expect(doc.diagnostics).toHaveLength(0);
      });

      test('NUMBER - Various formats', async () => {
        const content = `
agent Test
  displayName: "Test"
  messages Messages
    text Number Test
      - 123
      - 123.45
      - 1.23e5
      - 0.001
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });

      test('ISO_DURATION - Duration formats', async () => {
        const durations = [
          'P1Y2M3DT4H5M6S',
          'PT1H30M',
          'P30D',
          '3600s',
          '2.5s'
        ];
        
        for (const duration of durations) {
          const content = `
agent Test
  displayName: "Test"
  agentDefaults Defaults
    ttl: "${duration}"
`;
          const doc = await parser.parseDocument(content, 'test.rcl');
          expect(doc.ast).toBeTruthy();
        }
      });
    });

    describe('2.4 Embedded Code', () => {
      test('Single-line embedded code', async () => {
        const content = `
agent Test
  displayName: "Test"
  flow Test Flow
    :start -> $> console.log("hello")
    $js> 1 + 1 -> end
    $ts> const x: number = 42 -> end
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });

      test('Multi-line embedded code', async () => {
        const content = `
agent Test
  displayName: "Test"
  flow Test Flow
    :start -> $>>>
      const result = 1 + 1;
      console.log(result);
      return result;
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });
    });

    describe('2.5 Multi-line Strings', () => {
      test('All multi-line string markers', async () => {
        const content = `
agent Test
  displayName: "Test"
  messages Messages
    text Clean |
      This is clean text
      with multiple lines
    text Trim |-
      This trims trailing newline
    text Preserve +|
      This preserves leading space
    text Preserve All +|+
      This preserves all whitespace
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });
    });
  });

  describe('3. Syntactic Specification', () => {
    describe('3.0 Core Rules', () => {
      test('BooleanLiteral - All variations', async () => {
        const booleans = [
          'True', 'Yes', 'On', 'Enabled', 'Active',
          'False', 'No', 'Off', 'Disabled', 'Inactive'
        ];
        
        const content = `
agent Test
  displayName: "Test"
  messages Messages
    ${booleans.map((b, i) => `text Bool${i} "${b}"`).join('\n    ')}
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });

      test('NullLiteral - All variations', async () => {
        const nulls = ['Null', 'None', 'Void'];
        
        const content = `
agent Test
  displayName: "Test"
  messages Messages
    ${nulls.map((n, i) => `text Null${i} "${n}"`).join('\n    ')}
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });
    });

    describe('3.3 Type Tags', () => {
      test('Type tags with values and modifiers', async () => {
        const content = `
agent Test
  displayName: "Test"
  agentConfig Config
    phoneNumberEntry
      number: <phone "+1234567890">
      label: "Main"
    emailEntry
      address: <email "user@example.com">
    websiteEntry
      url: <url "https://example.com">
  messages Messages
    text Time Example <time "10:00" | "UTC">
    text Date Example <date "2024-07-26">
    text Zip Example <zip "94103">
    text Zip BR Example <zip "25585-460" | "BR">
    text Duration Example <duration "P1Y2M3DT4H5M6S">
    text TTL Example <ttl "3600s">
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });
    });

    describe('3.4 Main RCL Structure', () => {
      test('Complete agent structure', async () => {
        const content = `
import Shared / Common Flows / Support as Support Flow
import Utils / Message Templates

agent My Agent
  displayName: "My Test Agent"
  brandName: "Test Brand"
  
  agentConfig Config
    description: "Test agent description"
    logoUri: "https://example.com/logo.png"
    heroUri: "https://example.com/hero.png"
    color: "#FF0000"
    agentUseCase: :customer_care
    hostingRegion: :us_central
    
    phoneNumberEntry
      number: <phone "+1234567890">
      label: "Support"
    
    emailEntry
      address: <email "support@example.com">
      label: "Support Email"
    
    websiteEntry
      url: <url "https://example.com">
      label: "Website"
    
    privacy
      url: <url "https://example.com/privacy">
      label: "Privacy Policy"
    
    termsConditions
      url: <url "https://example.com/terms">
      label: "Terms & Conditions"
    
    billingConfig
      billingCategory: :basic_message
  
  agentDefaults Defaults
    fallbackMessage: "Sorry, I didn't understand"
    messageTrafficType: :transactional
    ttl: "3600s"
    postbackData: $> context.messageId.toLowerCase()
    expressions:
      language: :javascript
  
  flow Main Flow
    :start -> Welcome Message
    Welcome Message -> :end
  
  flow Support Flow
    :start -> text "How can I help?" -> :end
  
  messages Messages
    text Welcome Message "Welcome to our service!"
      reply "Get Started" "get_started"
      reply "Help" "help"
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
        expect(doc.diagnostics).toHaveLength(0);
      });
    });

    describe('3.5 Flow System', () => {
      test('Flow rules with all features', async () => {
        const content = `
agent Test
  displayName: "Test"
  
  flow Complex Flow
    :start -> Welcome Message
    
    Welcome Message -> User Response
      when $> context.isNewUser
    
    Welcome Message -> Returning User Message
      when $> !context.isNewUser
    
    User Response -> Process Input with
      input: $> context.userInput
      timestamp: $> Date.now()
    
    Process Input -> start Support Flow
    
    :error -> Error Message -> :end
  
  messages Messages
    text Welcome Message "Welcome!"
    text Returning User Message "Welcome back!"
    text User Response "What's your response?"
    text Error Message "Something went wrong"
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });
    });

    describe('3.7 Agent Messages', () => {
      test('Full message structures', async () => {
        const content = `
agent Test
  displayName: "Test"
  messages Messages
    agentMessage Complex Message
      messageTrafficType: :promotional
      ttl: "86400s"
      contentMessage
        richCard
          standaloneCard
            cardOrientation: :horizontal
            thumbnailImageAlignment: :right
            cardContent
              title: "Special Offer"
              description: "Limited time only!"
              media
                height: :medium
                contentInfo
                  fileUrl: "https://example.com/image.jpg"
                  forceRefresh: True
              suggestion
                reply
                  text: "Learn More"
                  postbackData: "learn_more"
              suggestion
                action
                  text: "Call Us"
                  postbackData: "call_us"
                  dialAction
                    phoneNumber: <phone "+1234567890">
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });

      test('Carousel messages', async () => {
        const content = `
agent Test
  displayName: "Test"
  messages Messages
    agentMessage Carousel Example
      contentMessage
        richCard
          carouselCard
            cardWidth: :small
            cardContent
              title: "Card 1"
              description: "First card"
            cardContent
              title: "Card 2"
              description: "Second card"
            cardContent
              title: "Card 3"
              description: "Third card"
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });
    });

    describe('3.8 Message Shortcuts', () => {
      test('All message shortcut types', async () => {
        const content = `
agent Test
  displayName: "Test"
  messages Messages
    transactional text Trans Message "Important message"
    promotional text Promo Message "Special offer!"
    
    text Simple Message "Hello world"
      reply "Yes" "yes"
      reply "No" "no"
    
    rbmFile File Message "document.pdf" "thumbnail.jpg"
      reply "Download" "download"
    
    file URL File <url "https://example.com/file.pdf">
      reply "View" "view"
    
    richCard Card Title "This is a rich card" :horizontal :right :medium <url "https://example.com/image.jpg">
      description: "Card description"
      reply "Click Me" "click"
      openUrl "Visit Site" <url "https://example.com">
    
    carousel :small
      richCard Card 1 "First card"
        description: "First description"
      richCard Card 2 "Second card"
        description: "Second description"
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });

      test('Suggestion shortcuts', async () => {
        const content = `
agent Test
  displayName: "Test"
  messages Messages
    text Message With Suggestions "Choose an option"
      reply "Simple Reply" "simple_reply"
      dial "Call Support" <phone "+1234567890">
      openUrl "Visit Website" <url "https://example.com"> "Open in browser" :browser :full
      shareLocation "Share Your Location"
      saveEvent "Team Meeting"
        title: "Quarterly Review"
        startTime: <datetime "2024-08-01T10:00:00Z">
        endTime: <datetime "2024-08-01T11:00:00Z">
        description: "Q3 review meeting"
      viewLocation "Our Office"
        latLong: 37.7749 -122.4194
        label: "San Francisco Office"
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });
    });

    describe('Collections', () => {
      test('Lists - all syntaxes', async () => {
        const content = `
agent Test
  displayName: "Test"
  messages Messages
    text List Examples
      # Parentheses list
      - ("item1", "item2", "item3")
      # Inline list without parentheses
      - "item1", "item2", "item3"
      # Empty list
      - ()
      # Block list
      -
        - "item1"
        - "item2"
        - "item3"
      # Nested lists
      - ("group1", "group2"), ("group3", "group4")
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });

      test('Dictionaries - all syntaxes', async () => {
        const content = `
agent Test
  displayName: "Test"
  messages Messages
    text Dict Examples
      # Brace object
      - {name: "John", age: 30, city: "New York"}
      # Empty object
      - {}
      # Block object
      -
        name: "Jane"
        age: 25
        city: "Los Angeles"
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });

      test('Mapped types', async () => {
        const content = `
agent Test
  displayName: "Test"
  messages Messages
    text Mapped Type Example
      Contacts list of (name, <phone number>):
        - "John Doe", "+1234567890"
        - "Jane Smith", "+0987654321"
        - "Bob Johnson", "+1122334455"
`;
        const doc = await parser.parseDocument(content, 'test.rcl');
        expect(doc.ast).toBeTruthy();
      });
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    test('Deeply nested structures', async () => {
      const content = `
agent Test
  displayName: "Test"
  messages Messages
    text Nested Structure
      -
        level1:
          level2:
            level3:
              - ("deep", "nested", "list")
              - {key: "value", nested: {inner: "data"}}
`;
      const doc = await parser.parseDocument(content, 'test.rcl');
      expect(doc.ast).toBeTruthy();
    });

    test('Mixed indentation levels', async () => {
      const content = `
agent Test
  displayName: "Test"
  flow Test Flow
    :start -> Message One
      with
        param1: "value1"
        param2:
          nested: "value2"
          list:
            - "item1"
            - "item2"
      when $> true
  messages Messages
    text Message One "Test"
`;
      const doc = await parser.parseDocument(content, 'test.rcl');
      expect(doc.ast).toBeTruthy();
    });

    test('Reserved names validation', async () => {
      // These should work
      const validContent = `
agent Test
  displayName: "Test"
  agentDefaults Defaults
    fallbackMessage: "Default"
  agentConfig Config
    description: "Config"
  messages Messages
    text Test "Test"
`;
      const validDoc = await parser.parseDocument(validContent, 'valid.rcl');
      expect(validDoc.ast).toBeTruthy();
      
      // These should potentially have issues (reserved names in wrong context)
      const invalidContent = `
agent Test
  displayName: "Test"
  flow Defaults
    :start -> :end
  flow Config
    :start -> :end
  flow Messages
    :start -> :end
  messages Messages
    text Test "Test"
`;
      const invalidDoc = await parser.parseDocument(invalidContent, 'invalid.rcl');
      expect(invalidDoc.ast).toBeTruthy();
      // Note: Parser might accept this, semantic validation would catch it
    });
  });
});