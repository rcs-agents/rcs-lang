import { RCLCompiler } from '@rcs-lang/compiler';
import { describe, expect, test } from 'bun:test';

describe.skip('CLI Output Content Validation', () => {
  const compiler = new RCLCompiler();

  describe('JSON Output Structure', () => {
    test('should generate valid JSON with correct structure', async () => {
      const validRcl = `
agent TestAgent
  displayName: "Test Agent"

  flow MainFlow
    start: Welcome

    on Welcome
      match @reply.text
        "hello" -> Welcome
        :default -> Welcome

  messages Messages
    text Welcome "Hello there!"
      suggestions
        reply "hello"
`;

      const result = await compiler.compile(validRcl, 'test.rcl');

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(result.output!.json).toBeDefined();

      // Should be valid JSON
      const parsed = JSON.parse(result.output!.json);

      // Should have required top-level properties
      expect(parsed).toHaveProperty('agent');
      expect(parsed).toHaveProperty('messages');
      expect(parsed).toHaveProperty('flows');

      // Agent should have displayName
      expect(parsed.agent.displayName).toBe('Test Agent');

      // Flows should have the defined flow
      expect(parsed.flows).toHaveProperty('MainFlow');
      expect(parsed.flows.MainFlow.initial).toBe('Welcome');
      expect(parsed.flows.MainFlow.states).toHaveProperty('Welcome');

      // Messages should have the defined message
      expect(parsed.messages).toHaveProperty('Welcome');
      expect(parsed.messages.Welcome.type).toBe('text');
    });

    test('should not contain placeholder or empty values', async () => {
      const validRcl = `
agent ContentAgent
  displayName: "Content Agent"

  config
    description: "A test agent"
    color: "#FF0000"

  flow TestFlow
    start: Start

    on Start
      match @reply.text
        "test" -> Start
        :default -> Start

  messages Messages
    text Start "Starting message"
`;

      const result = await compiler.compile(validRcl, 'test.rcl');

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.output!.json);

      // Should not have empty objects
      expect(Object.keys(parsed.agent).length).toBeGreaterThan(0);
      expect(Object.keys(parsed.flows).length).toBeGreaterThan(0);
      expect(Object.keys(parsed.messages).length).toBeGreaterThan(0);

      // Should not contain null, undefined, or empty string values
      const validateNoEmptyValues = (obj: any, path = ''): void => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;

          if (value === null || value === undefined || value === '') {
            expect.fail(`Empty value found at ${currentPath}: ${value}`);
          }

          if (typeof value === 'object' && !Array.isArray(value)) {
            validateNoEmptyValues(value, currentPath);
          }
        }
      };

      validateNoEmptyValues(parsed);
    });

    test('should follow the expected JSON schema structure', async () => {
      const complexRcl = `
agent SchemaTestAgent
  displayName: "Schema Test"

  config
    description: "Testing schema compliance"
    logoUri: <url https://example.com/logo.png>
    color: "#123456"

  flow MainFlow
    start: Welcome

    on Welcome
      match @reply.text
        "option1" -> Option1
        "option2" -> Option2
        :default -> Welcome

    on Option1
      -> Welcome

    on Option2
      -> Welcome

  messages Messages
    richCard Welcome "Welcome Card" :large
      description: "Choose an option"
      suggestions
        reply "option1"
        reply "option2"

    text Option1 "You chose option 1"
    text Option2 "You chose option 2"
`;

      const result = await compiler.compile(complexRcl, 'test.rcl');

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.output!.json);

      // Validate agent structure
      expect(parsed.agent).toMatchObject({
        displayName: 'Schema Test',
        description: 'Testing schema compliance',
        logoUri: {
          type: 'url',
          value: 'https://example.com/logo.png'
        },
        color: '#123456',
      });

      // Validate flows structure
      expect(parsed.flows.MainFlow).toMatchObject({
        initial: 'Welcome',
        states: expect.objectContaining({
          Welcome: expect.any(Object),
          Option1: expect.any(Object),
          Option2: expect.any(Object),
        }),
      });

      // Validate messages structure
      expect(parsed.messages).toMatchObject({
        Welcome: expect.objectContaining({
          type: 'richCard',
          description: 'Choose an option',
        }),
        Option1: expect.objectContaining({
          type: 'text',
        }),
        Option2: expect.objectContaining({
          type: 'text',
        }),
      });
    });
  });

  describe('JavaScript Output Quality', () => {
    test('should generate valid JavaScript module', async () => {
      const validRcl = `
agent JSTestAgent
  displayName: "JavaScript Test"

  flow TestFlow
    start: Start

    on Start
      match @reply.text
        :default -> Start

  messages Messages
    text Start "Test message"
`;

      const result = await compiler.compile(validRcl, 'test.rcl');

      expect(result.success).toBe(true);
      expect(result.output!.js).toBeDefined();

      const jsCode = result.output!.js;

      // Should be a proper ES module
      expect(jsCode).toMatch(/export const agent = /);
      expect(jsCode).toMatch(/export const messages = /);
      expect(jsCode).toMatch(/export const flows = /);
      expect(jsCode).toMatch(/export default \{/);

      // Should have proper structure
      expect(jsCode).toMatch(/agent\s*:\s*\{[\s\S]*displayName/);
      expect(jsCode).toMatch(/messages\s*:\s*\{[\s\S]*Start/);
      expect(jsCode).toMatch(/flows\s*:\s*\{[\s\S]*TestFlow/);

      // Should not have syntax errors (basic validation)
      expect(jsCode).not.toMatch(/undefined,|null,|\{\s*,/);
      expect(jsCode).not.toMatch(/,\s*\}/);
    });

    test('should handle string escaping correctly', async () => {
      const rclWithSpecialChars = `
agent EscapeTestAgent
  displayName: "Test \"Quotes\" and 'Apostrophes'"

  flow TestFlow
    start: Start

    on Start
      match @reply.text
        :default -> Start

  messages Messages
    text Start "Message with \"quotes\" and 'apostrophes' and backslashes: \\"
`;

      const result = await compiler.compile(rclWithSpecialChars, 'test.rcl');

      expect(result.success).toBe(true);
      const jsCode = result.output!.js;

      // Should properly escape quotes and other special characters
      expect(jsCode).toMatch(/displayName.*Test.*Quotes.*and.*Apostrophes/);
      expect(jsCode).toMatch(/text.*Message with.*quotes.*and.*apostrophes/);

      // Should be valid JavaScript (no unescaped quotes breaking syntax)
      expect(jsCode).not.toMatch(/[^\\]"[^"]*"[^"]*"[^,\n]/);
    });

    test('should generate consistent output format', async () => {
      const rclContent = `
agent FormatTestAgent
  displayName: "Format Test"

  flow TestFlow
    start: Start

    on Start
      match @reply.text
        :default -> Start

  messages Messages
    text Start "Test"
`;

      const result1 = await compiler.compile(rclContent, 'test1.rcl');
      const result2 = await compiler.compile(rclContent, 'test2.rcl');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Should generate identical output for identical input
      expect(result1.output!.json).toBe(result2.output!.json);
      expect(result1.output!.js).toBe(result2.output!.js);
    });
  });

  describe('Content Completeness', () => {
    test('should include all defined agent properties', async () => {
      const fullAgentRcl = `
agent CompleteAgent
  displayName: "Complete Agent"

  config
    description: "A complete agent for testing"
    logoUri: <url https://example.com/logo.png>
    color: "#FF5733"
    phoneNumber: <phone +1-555-0123>
    phoneLabel: "Call Support"

  defaults
    fallbackMessage: "Sorry, I didn't understand."
    messageTrafficType: :transactional

  flow MainFlow
    start: Welcome

    on Welcome
      match @reply.text
        :default -> Welcome

  messages Messages
    text Welcome "Welcome!"
`;

      const result = await compiler.compile(fullAgentRcl, 'test.rcl');

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.output!.json);

      // Should include all agent config properties
      expect(parsed.agent.displayName).toBe('Complete Agent');
      expect(parsed.agent.description).toBe('A complete agent for testing');
      expect(parsed.agent.logoUri).toEqual({ type: 'url', value: 'https://example.com/logo.png' });
      expect(parsed.agent.color).toBe('#FF5733');
      expect(parsed.agent.phoneNumber).toEqual({ type: 'phone', value: '+1-555-0123' });
      expect(parsed.agent.phoneLabel).toBe('Call Support');

      // Defaults are not stored in agent object in the current implementation
    });

    test('should include all flow states and transitions', async () => {
      const complexFlowRcl = `
agent FlowTestAgent
  displayName: "Flow Test"

  flow ComplexFlow
    start: State1

    on State1
      match @reply.text
        "next" -> State2
        "jump" -> State3
        :default -> State1

    on State2
      match @reply.text
        "back" -> State1
        "forward" -> State3
        :default -> State2

    on State3
      match @reply.text
        "restart" -> State1
        :default -> State3

  messages Messages
    text State1 "State 1"
    text State2 "State 2"
    text State3 "State 3"
`;

      const result = await compiler.compile(complexFlowRcl, 'test.rcl');

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.output!.json);

      const flow = parsed.flows.ComplexFlow;
      expect(flow.initial).toBe('State1');
      expect(flow.states).toHaveProperty('State1');
      expect(flow.states).toHaveProperty('State2');
      expect(flow.states).toHaveProperty('State3');

      // Should include all transitions
      expect(flow.states.State1.match).toBeDefined();
      expect(flow.states.State2.match).toBeDefined();
      expect(flow.states.State3.match).toBeDefined();
    });

    test('should include all message types and properties', async () => {
      const messageTypesRcl = `
agent MessageTestAgent
  displayName: "Message Test"

  flow TestFlow
    start: Start

    on Start
      match @reply.text
        :default -> Start

  messages Messages
    text SimpleText "Simple text message"

    richCard RichMessage "Rich Card Title" :medium
      description: "Rich card description"
      suggestions
        reply "Reply Option"
        action "Action" <url https://example.com>

    carousel CarouselMessage "Carousel Title" :large
      richCard Card1 "Card 1" :compact
        description: "First card"
      richCard Card2 "Card 2" :compact
        description: "Second card"
`;

      const result = await compiler.compile(messageTypesRcl, 'test.rcl');

      expect(result.success).toBe(true);
      const parsed = JSON.parse(result.output!.json);

      // Should include all message types
      expect(parsed.messages.SimpleText).toMatchObject({
        type: 'text',
      });

      expect(parsed.messages.RichMessage).toMatchObject({
        type: 'richCard',
        description: 'Rich card description',
      });

      expect(parsed.messages.CarouselMessage).toMatchObject({
        type: 'carousel',
      });
    });
  });
});
