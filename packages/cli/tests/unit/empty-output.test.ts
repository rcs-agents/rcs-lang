import { RCLCompiler } from '@rcs-lang/compiler';
import { describe, expect, test } from 'bun:test';

describe('Empty Output Detection', () => {
  const compiler = new RCLCompiler();

  describe('Empty Structure Detection', () => {
    test('should fail when agent section is empty', async () => {
      const emptyAgentRcl = `
agent EmptyAgent
  # No content in agent

  flow TestFlow
    start: Start
    on Start
      match @reply.text
        :default -> Start

  messages Messages
    text Start "Hello"
`;

      const result = await compiler.compileSource(emptyAgentRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(
        result.errors?.some(
          (e) =>
            e.message.toLowerCase().includes('displayname') ||
            e.message.toLowerCase().includes('required'),
        ),
      ).toBe(true);
    });

    test('should fail when flows section is empty', async () => {
      const emptyFlowsRcl = `
agent TestAgent
  displayName: "Test"

  flow EmptyFlow
    # No content in flow

  messages Messages
    text Start "Hello"
`;

      const result = await compiler.compileSource(emptyFlowsRcl, 'test.rcl');
      expect(result.success).toBe(false);
      expect(
        result.errors?.some(
          (e) =>
            e.message.toLowerCase().includes('flow') ||
            e.message.toLowerCase().includes('start') ||
            e.message.toLowerCase().includes('state'),
        ),
      ).toBe(true);
    });

    test('should fail when messages section is empty', async () => {
      const emptyMessagesRcl = `
agent TestAgent
  displayName: "Test"

  flow TestFlow
    start: Start
    on Start
      match @reply.text
        :default -> Start

  messages Messages
    # No messages defined
`;

      const result = await compiler.compileSource(emptyMessagesRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(
        result.errors?.some(
          (e) =>
            e.message.toLowerCase().includes('message') ||
            e.message.toLowerCase().includes('empty'),
        ),
      ).toBe(true);
    });

    test('should fail when generated JSON would have empty objects', async () => {
      const minimalRcl = `
agent MinimalAgent
  displayName: "Minimal"
`;

      const result = await compiler.compileSource(minimalRcl, 'test.rcl');

      expect(result.success).toBe(false);

      // If compilation somehow succeeds, ensure output is not empty
      if (result.success && result.output) {
        const output = JSON.parse(result.output.json);

        // These should not be empty objects
        expect(Object.keys(output.agent)).toHaveLength.greaterThan(0);
        expect(Object.keys(output.flows)).toHaveLength.greaterThan(0);
        expect(Object.keys(output.messages)).toHaveLength.greaterThan(0);
      }
    });
  });

  describe('Semantic Validation', () => {
    test('should require displayName in agent section', async () => {
      const noDisplayNameRcl = `
agent TestAgent
  # Missing displayName

  flow TestFlow
    start: Start
    on Start
      match @reply.text
        :default -> Start

  messages Messages
    text Start "Hello"
`;

      const result = await compiler.compileSource(noDisplayNameRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) =>
            e.message.toLowerCase().includes('displayname') ||
            e.message.toLowerCase().includes('required'),
        ),
      ).toBe(true);
    });

    test('should require start state in flow section', async () => {
      const noStartStateRcl = `
agent TestAgent
  displayName: "Test"

  flow TestFlow
    # Missing start: attribute
    on Start
      match @reply.text
        :default -> Start

  messages Messages
    text Start "Hello"
`;

      const result = await compiler.compileSource(noStartStateRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) =>
            e.message.toLowerCase().includes('start') ||
            e.message.toLowerCase().includes('required'),
        ),
      ).toBe(true);
    });

    test('should require at least one state in flow', async () => {
      const noStatesRcl = `
agent TestAgent
  displayName: "Test"

  flow TestFlow
    start: NonExistentState
    # No states defined

  messages Messages
    text Start "Hello"
`;

      const result = await compiler.compileSource(noStatesRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) =>
            e.message.toLowerCase().includes('state') ||
            e.message.toLowerCase().includes('not found') ||
            e.message.toLowerCase().includes('undefined'),
        ),
      ).toBe(true);
    });

    test('should validate that start state actually exists', async () => {
      const invalidStartStateRcl = `
agent TestAgent
  displayName: "Test"

  flow TestFlow
    start: NonExistentState

    on ExistingState
      match @reply.text
        :default -> ExistingState

  messages Messages
    text ExistingState "Hello"
`;

      const result = await compiler.compileSource(invalidStartStateRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) =>
            e.message.toLowerCase().includes('nonexistentstate') ||
            e.message.toLowerCase().includes('not found') ||
            e.message.toLowerCase().includes('undefined'),
        ),
      ).toBe(true);
    });
  });

  describe('Content Validation', () => {
    test('should ensure generated output has meaningful content', async () => {
      const validRcl = `
agent ContentAgent
  displayName: "Content Test"

  flow MainFlow
    start: Welcome

    on Welcome
      match @reply.text
        "hello" -> Welcome
        :default -> Welcome

  messages Messages
    text Welcome "Welcome message"
      suggestions
        reply "hello"
`;

      const result = await compiler.compileSource(validRcl, 'test.rcl');

      if (result.success && result.output) {
        const jsonOutput = result.output;

        // Agent should have displayName
        expect(jsonOutput.agent.displayName).toBe('Content Test');

        // Flows should have actual flow data
        expect(Object.keys(jsonOutput.flows)).toContain('MainFlow');
        expect(jsonOutput.flows.MainFlow.initial).toBe('Welcome');
        expect(jsonOutput.flows.MainFlow.states).toBeDefined();
        expect(Object.keys(jsonOutput.flows.MainFlow.states)).toContain('Welcome');

        // Messages should have actual message data
        expect(Object.keys(jsonOutput.messages)).toContain('Welcome');
        expect(jsonOutput.messages.Welcome.type).toBe('text');

        // Output should not be empty
        expect(Object.keys(jsonOutput.agent).length).toBeGreaterThan(0);
        expect(Object.keys(jsonOutput.messages).length).toBeGreaterThan(0);
        expect(Object.keys(jsonOutput.flows).length).toBeGreaterThan(0);
      } else {
        expect.fail(
          `Valid RCL should compile successfully. Errors: ${JSON.stringify(result.errors)}`,
        );
      }
    });

    test('should prevent generation of placeholder content', async () => {
      const result = await compiler.compileSource('invalid content', 'test.rcl');

      expect(result.success).toBe(false);

      // If somehow output is generated, it should not be placeholder content
      if (result.output) {
        const outputStr = JSON.stringify(result.output);
        expect(outputStr).not.toMatch(
          /\{\s*"agent":\s*\{\s*\}\s*,\s*"messages":\s*\{\s*\}\s*,\s*"flows":\s*\{\s*\}\s*\}/,
        );
        // Check that sections aren't empty
        expect(Object.keys(result.output.agent || {}).length).toBeGreaterThan(0);
      }
    });
  });

  describe('Cross-Reference Validation', () => {
    test('should validate state transitions reference existing states', async () => {
      const invalidTransitionRcl = `
agent TestAgent
  displayName: "Test"

  flow TestFlow
    start: Start

    on Start
      match @reply.text
        "next" -> NonExistentState
        :default -> Start

  messages Messages
    text Start "Hello"
`;

      const result = await compiler.compileSource(invalidTransitionRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) =>
            e.message.toLowerCase().includes('nonexistentstate') ||
            e.message.toLowerCase().includes('not found') ||
            e.message.toLowerCase().includes('undefined'),
        ),
      ).toBe(true);
    });

    test('should validate message references exist', async () => {
      const invalidMessageRefRcl = `
agent TestAgent
  displayName: "Test"

  flow TestFlow
    start: Start

    on Start
      match @reply.text
        :default -> Start

  messages Messages
    # Missing the "Start" message that is referenced in flow
`;

      const result = await compiler.compileSource(invalidMessageRefRcl, 'test.rcl');

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) =>
            e.message.toLowerCase().includes('message') ||
            e.message.toLowerCase().includes('not found') ||
            e.message.toLowerCase().includes('start'),
        ),
      ).toBe(true);
    });
  });
});
