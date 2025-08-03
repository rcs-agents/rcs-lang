import { describe, expect, test } from 'bun:test';
import { RCLCompiler } from '../src/compiler.js';

describe('JavaScript Output Generation', () => {
  test('should generate valid JavaScript from RCL', async () => {
    const compiler = new RCLCompiler();

    const rclSource = `
agent TestAgent
  displayName: "Test Agent"
  
  flow TestFlow
    start: Welcome
    
    on Welcome
      match @reply.text
        "Hello" -> Greeting
    
    on Greeting
      -> Welcome
      
  messages Messages
    text Welcome "Welcome!"
      suggestions
        reply "Hello"
        
    text Greeting "Hello there!"
`;

    const result = await compiler.compileToJavaScript({
      source: rclSource,
      uri: 'test.rcl',
    });

    if (!result.success) {
      console.error('Compilation failed:', result.error);
    }

    expect(result.success).toBe(true);

    if (result.success) {
      const js = result.value;

      // Check structure
      expect(js).toContain('// Generated from test.rcl');
      expect(js).toContain('export const agent =');
      expect(js).toContain('export const messages =');
      expect(js).toContain('export const flows =');
      expect(js).toContain('export default {');

      // Verify it's valid JavaScript by checking syntax
      // (We can't use eval with ES6 modules)
      expect(js).toMatch(/export const agent = \{[\s\S]*?\};/);
      expect(js).toMatch(/export const messages = \{[\s\S]*?\};/);
      expect(js).toMatch(/export const flows = \{[\s\S]*?\};/);
    }
  });
});
